#!/bin/bash
# WordPress Production Deployment Script

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$PROJECT_DIR/.env"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}[DEPLOY]${NC} $1"
}

# Function to check prerequisites
check_prerequisites() {
    print_header "Checking prerequisites..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Check if .env file exists
    if [[ ! -f "$ENV_FILE" ]]; then
        print_warning ".env file not found. Creating from template..."
        cp "$PROJECT_DIR/.env.production" "$ENV_FILE"
        print_warning "Please edit $ENV_FILE with your configuration before continuing."
        exit 1
    fi
    
    print_status "Prerequisites check passed"
}

# Function to generate SSL certificates
generate_ssl_certificates() {
    print_header "Generating SSL certificates..."
    
    local ssl_dir="$PROJECT_DIR/ssl"
    mkdir -p "$ssl_dir"
    
    # Check if certificates already exist
    if [[ -f "$ssl_dir/cert.pem" && -f "$ssl_dir/private.key" ]]; then
        print_warning "SSL certificates already exist. Skipping generation."
        return 0
    fi
    
    # Generate self-signed certificate for development/testing
    print_status "Generating self-signed SSL certificate..."
    
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout "$ssl_dir/private.key" \
        -out "$ssl_dir/cert.pem" \
        -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
    
    # Generate DH parameters
    print_status "Generating DH parameters (this may take a while)..."
    openssl dhparam -out "$ssl_dir/dhparam.pem" 2048
    
    print_status "SSL certificates generated successfully"
    print_warning "For production, replace with certificates from a trusted CA"
}

# Function to create data directories
create_data_directories() {
    print_header "Creating data directories..."
    
    local data_dir="$PROJECT_DIR/data"
    mkdir -p "$data_dir"/{wordpress,mysql,redis}
    
    # Set proper permissions
    sudo chown -R 33:33 "$data_dir/wordpress" 2>/dev/null || true
    sudo chown -R 999:999 "$data_dir/mysql" 2>/dev/null || true
    
    print_status "Data directories created"
}

# Function to generate WordPress security keys
generate_wp_keys() {
    print_header "Checking WordPress security keys..."
    
    # Check if keys are already set in .env
    if grep -q "your-unique-" "$ENV_FILE"; then
        print_warning "WordPress security keys need to be updated in .env file"
        print_status "Fetching new keys from WordPress.org..."
        
        # Download new keys and format them for .env
        curl -s https://api.wordpress.org/secret-key/1.1/salt/ | \
        sed 's/define(/WORDPRESS_/g' | \
        sed "s/', '/=/g" | \
        sed "s/define('//g" | \
        sed "s/');$//g" | \
        sed 's/ /_/g' > /tmp/wp_keys.env
        
        print_status "New WordPress keys generated in /tmp/wp_keys.env"
        print_warning "Please update your .env file with these new keys"
    else
        print_status "WordPress security keys appear to be configured"
    fi
}

# Function to start services
start_services() {
    print_header "Starting production services..."
    
    cd "$PROJECT_DIR"
    
    # Pull latest images
    print_status "Pulling latest Docker images..."
    docker-compose -f docker-compose.production.yml pull
    
    # Start services
    print_status "Starting services..."
    docker-compose -f docker-compose.production.yml up -d
    
    # Wait for services to be ready
    print_status "Waiting for services to be ready..."
    sleep 30
    
    # Check service health
    print_status "Checking service health..."
    docker-compose -f docker-compose.production.yml ps
    
    print_status "Production services started successfully"
}

# Function to run post-deployment tasks
post_deployment() {
    print_header "Running post-deployment tasks..."
    
    # Test WordPress connection
    print_status "Testing WordPress connection..."
    local max_attempts=30
    local attempt=1
    
    while [[ $attempt -le $max_attempts ]]; do
        if curl -f -s http://localhost &>/dev/null; then
            print_status "WordPress is responding"
            break
        fi
        
        if [[ $attempt -eq $max_attempts ]]; then
            print_error "WordPress is not responding after $max_attempts attempts"
            exit 1
        fi
        
        print_status "Waiting for WordPress... (attempt $attempt/$max_attempts)"
        sleep 10
        ((attempt++))
    done
    
    # Show service URLs
    print_header "Deployment completed successfully!"
    echo ""
    print_status "Service URLs:"
    echo "  - WordPress: https://localhost (HTTP redirects to HTTPS)"
    echo "  - WordPress Admin: https://localhost/wp-admin"
    echo "  - Search API: https://localhost/api/search/"
    echo ""
    print_status "Next steps:"
    echo "  1. Complete WordPress installation at https://localhost"
    echo "  2. Install SSL certificates from a trusted CA for production"
    echo "  3. Configure your domain DNS to point to this server"
    echo "  4. Update DOMAIN_NAME in .env file"
    echo "  5. Set up automated backups and monitoring"
    echo ""
}

# Function to stop services
stop_services() {
    print_header "Stopping production services..."
    
    cd "$PROJECT_DIR"
    docker-compose -f docker-compose.production.yml down
    
    print_status "Production services stopped"
}

# Function to show logs
show_logs() {
    cd "$PROJECT_DIR"
    docker-compose -f docker-compose.production.yml logs -f
}

# Function to show help
show_help() {
    echo "WordPress Production Deployment Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  deploy    - Deploy production environment (default)"
    echo "  stop      - Stop all services"
    echo "  logs      - Show service logs"
    echo "  ssl       - Generate SSL certificates only"
    echo "  help      - Show this help message"
    echo ""
}

# Main function
main() {
    local command="${1:-deploy}"
    
    case "$command" in
        "deploy")
            check_prerequisites
            generate_ssl_certificates
            create_data_directories
            generate_wp_keys
            start_services
            post_deployment
            ;;
        "stop")
            stop_services
            ;;
        "logs")
            show_logs
            ;;
        "ssl")
            generate_ssl_certificates
            ;;
        "help")
            show_help
            ;;
        *)
            print_error "Unknown command: $command"
            show_help
            exit 1
            ;;
    esac
}

# Check if script is being sourced or executed
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi