# System: Docker WordPress Development Environment

## Purpose
Containerized WordPress development system with Claude Code integration for rapid prototyping, demo creation, and portfolio projects.

## Architecture
```
[Docker Host] <-> [Multiple WP Instances] <-> [VS Code Browser] <-> [Claude Code]
     |                    |                        |                    |
     |                    |                        |                    +-- [MCP Servers]
     |                    |                        +-- [Web Interface]
     |                    +-- [WP Instance 1 (Port 8090)]
     |                    +-- [WP Instance 2 (Port 8091)]
     |                    +-- [WP Instance N (Port 809N)]
     +-- [Docker Compose]
     +-- [Volume Management]
     +-- [Network Configuration]
```

## Module Registry
- [docker-setup (`memory-bank/docker_setup_module.md`)]: Docker container configuration and management
- [wordpress-config (`memory-bank/wordpress_config_module.md`)]: WordPress installation and configuration
- [claude-integration (`memory-bank/claude_integration_module.md`)]: Claude Code setup and MCP integration
- [multi-instance (`memory-bank/multi_instance_module.md`)]: Multiple site management system
- [development-workflow (`memory-bank/development_workflow_module.md`)]: Development and demo workflow

## Development Workflow
1. Clone repository and set instance number
2. Run Docker setup script
3. Configure WordPress through web interface
4. Access VS Code through browser
5. Initialize Claude Code with MCPs
6. Begin development with AI assistance

## Version: 1.0 | Status: Development