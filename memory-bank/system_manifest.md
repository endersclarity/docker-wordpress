# System: Docker WordPress Development Environment

## Purpose
Containerized WordPress development system with Claude Code integration, semantic search capabilities, and Disney-themed property search interface. Combines WordPress CMS with Python-based semantic search API for intelligent property discovery and portfolio projects.

## Architecture
```
[Docker Host] <-> [WordPress Containers] <-> [Semantic Search API] <-> [Claude Code]
     |                    |                        |                         |
     |                    |                        |                         +-- [MCP Servers]
     |                    |                        +-- [Python Flask API (Port 5001)]
     |                    |                        +-- [458 Property Listings]
     |                    |                        +-- [Disney Cottage UI]
     |                    +-- [WP Instance 1 (Port 8090)]
     |                    +-- [Narissa Real Estate Theme]
     |                    +-- [Browser MCP Integration]
     +-- [Docker Compose]
     +-- [Volume Management]
     +-- [MySQL Database]
     +-- [WSL Networking (172.22.206.209)]
```

## Module Registry
- [docker-infrastructure (`memory-bank/docker_infrastructure_module.md`)]: Container orchestration and management
- [wordpress-development (`memory-bank/wordpress_development_module.md`)]: WordPress setup and theme/plugin development
- [semantic-search (`merlins_search/`)]: Python Flask API with 458 Nevada County property listings and semantic search
- [cottage-search-ui (`narissa-real-estate-theme/components/merlin-search/`)]: Disney-themed property search interface
- [browser-automation (`memory-bank/browser_automation_module.md`)]: Browser MCP integration and web automation
- [claude-integration (`memory-bank/claude_integration_module.md`)]: Claude Code setup and MCP server integration

## Development Workflow
1. Start semantic search API: `cd merlins_search && source venv/bin/activate && python test_api.py`
2. Run Docker setup script to initialize WordPress containers
3. Access WordPress installation at localhost:8090 or WSL IP:8090
4. Test search API directly at http://172.22.206.209:5001
5. Use Browser MCP to automate WordPress configuration
6. Integrate cottage search UI within WordPress theme

## Current Status - Semantic Search Integration Complete ✅
- **API Status**: Live at http://172.22.206.209:5001 with 458 Nevada County properties
- **Performance**: Sub-millisecond response times (0.38-0.87ms)
- **Frontend**: Disney cottage search UI ready for WordPress integration
- **Testing**: Direct API testing interface available in browser
- **Next Step**: WordPress Docker environment activation and theme integration
4. Develop themes/plugins with Claude Code assistance
5. Test browser automation workflows
6. Deploy additional instances as needed

## Version: 1.1 | Status: Active Development