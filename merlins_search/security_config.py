#!/usr/bin/env python3
"""
Security configuration and middleware for Merlin's Search API
"""

import os
import time
from typing import Dict, List
from fastapi import HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from collections import defaultdict, deque
import logging

class RateLimiter:
    """Simple rate limiter using in-memory storage."""
    
    def __init__(self, requests_per_window: int = 100, window_seconds: int = 60):
        self.requests_per_window = requests_per_window
        self.window_seconds = window_seconds
        self.requests = defaultdict(deque)
    
    def is_allowed(self, client_ip: str) -> bool:
        """Check if request is allowed based on rate limit."""
        now = time.time()
        client_requests = self.requests[client_ip]
        
        # Remove old requests outside the window
        while client_requests and client_requests[0] <= now - self.window_seconds:
            client_requests.popleft()
        
        # Check if within limit
        if len(client_requests) >= self.requests_per_window:
            return False
        
        # Add current request
        client_requests.append(now)
        return True

class SecurityConfig:
    """Security configuration for the API."""
    
    def __init__(self):
        self.load_config()
        self.rate_limiter = RateLimiter(
            requests_per_window=self.rate_limit_requests,
            window_seconds=self.rate_limit_window
        )
    
    def load_config(self):
        """Load security configuration from environment variables."""
        # CORS configuration
        self.allowed_origins = os.getenv(
            'ALLOWED_ORIGINS', 
            'http://localhost:8090,http://localhost:3000'
        ).split(',')
        
        # Rate limiting
        self.rate_limit_requests = int(os.getenv('RATE_LIMIT_REQUESTS', '100'))
        self.rate_limit_window = int(os.getenv('RATE_LIMIT_WINDOW', '60'))
        
        # API security
        self.api_debug = os.getenv('API_DEBUG', 'false').lower() == 'true'
        self.log_level = os.getenv('LOG_LEVEL', 'INFO')
        
        # Trusted hosts
        self.trusted_hosts = ['localhost', '127.0.0.1', '0.0.0.0']
        
        # API key validation
        self.require_api_key = os.getenv('REQUIRE_API_KEY', 'false').lower() == 'true'
        self.valid_api_keys = self._load_api_keys()
    
    def _load_api_keys(self) -> List[str]:
        """Load valid API keys from environment."""
        api_keys_str = os.getenv('VALID_API_KEYS', '')
        if api_keys_str:
            return [key.strip() for key in api_keys_str.split(',') if key.strip()]
        return []
    
    def get_client_ip(self, request: Request) -> str:
        """Extract client IP from request."""
        # Check for forwarded headers (from reverse proxy)
        forwarded_for = request.headers.get('X-Forwarded-For')
        if forwarded_for:
            return forwarded_for.split(',')[0].strip()
        
        real_ip = request.headers.get('X-Real-IP')
        if real_ip:
            return real_ip
        
        # Fall back to client host
        return request.client.host if request.client else '127.0.0.1'
    
    def validate_api_key(self, request: Request) -> bool:
        """Validate API key if required."""
        if not self.require_api_key:
            return True
        
        # Check header
        api_key = request.headers.get('X-API-Key')
        if not api_key:
            # Check query parameter as fallback
            api_key = request.query_params.get('api_key')
        
        return api_key in self.valid_api_keys
    
    def check_rate_limit(self, request: Request) -> bool:
        """Check if request passes rate limiting."""
        client_ip = self.get_client_ip(request)
        return self.rate_limiter.is_allowed(client_ip)

# Global security config instance
security_config = SecurityConfig()

async def security_middleware(request: Request, call_next):
    """Security middleware for API requests."""
    
    # Skip security checks for health endpoints
    if request.url.path in ['/health', '/']:
        response = await call_next(request)
        return response
    
    # Rate limiting
    if not security_config.check_rate_limit(request):
        raise HTTPException(
            status_code=429,
            detail="Rate limit exceeded. Please try again later."
        )
    
    # API key validation
    if not security_config.validate_api_key(request):
        raise HTTPException(
            status_code=401,
            detail="Invalid or missing API key"
        )
    
    # Log request (if debug mode)
    if security_config.api_debug:
        client_ip = security_config.get_client_ip(request)
        logging.info(f"API Request: {request.method} {request.url.path} from {client_ip}")
    
    response = await call_next(request)
    
    # Add security headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    
    return response

def configure_cors_middleware(app):
    """Configure CORS middleware for the application."""
    app.add_middleware(
        CORSMiddleware,
        allow_origins=security_config.allowed_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["*"],
    )

def configure_trusted_hosts_middleware(app):
    """Configure trusted hosts middleware."""
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=security_config.trusted_hosts
    )

def setup_logging():
    """Set up logging configuration."""
    log_level = getattr(logging, security_config.log_level.upper(), logging.INFO)
    log_file = os.getenv('LOG_FILE', 'search_api.log')
    
    # Configure logging
    logging.basicConfig(
        level=log_level,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler(log_file),
            logging.StreamHandler()
        ]
    )
    
    # Set uvicorn log level
    logging.getLogger("uvicorn").setLevel(log_level)
    logging.getLogger("uvicorn.error").setLevel(log_level)
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)  # Reduce access log noise

def validate_environment():
    """Validate required environment variables and configuration."""
    required_vars = ['GEMINI_API_KEY']
    missing_vars = []
    
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        raise ValueError(f"Missing required environment variables: {', '.join(missing_vars)}")
    
    # Validate configuration values
    if security_config.rate_limit_requests <= 0:
        raise ValueError("RATE_LIMIT_REQUESTS must be positive")
    
    if security_config.rate_limit_window <= 0:
        raise ValueError("RATE_LIMIT_WINDOW must be positive")
    
    logging.info("Environment validation passed")

def get_security_info() -> Dict:
    """Get current security configuration info (for debugging)."""
    return {
        "rate_limiting": {
            "requests_per_window": security_config.rate_limit_requests,
            "window_seconds": security_config.rate_limit_window
        },
        "cors": {
            "allowed_origins": security_config.allowed_origins
        },
        "api_key_required": security_config.require_api_key,
        "debug_mode": security_config.api_debug,
        "log_level": security_config.log_level
    }