# System: Docker WordPress Development Environment

## Purpose
Containerized WordPress development system with Claude Code integration for rapid prototyping, demo creation, and portfolio projects. Enables browser automation testing and multi-instance deployment.

## Architecture
```
[Docker Host] <-> [WordPress Containers] <-> [Browser MCP] <-> [Claude Code]
     |                    |                        |                    |
     |                    |                        |                    +-- [MCP Servers]
     |                    |                        +-- [Web Automation]
     |                    +-- [WP Instance 1 (Port 8090)]
     |                    +-- [WP Instance 2 (Port 8091)]
     |                    +-- [WP Instance N (Port 809N)]
     +-- [Docker Compose]
     +-- [Volume Management]
     +-- [MySQL Database]
```

## Module Registry
- [docker-infrastructure (`memory-bank/docker_infrastructure_module.md`)]: Container orchestration and management
- [wordpress-development (`memory-bank/wordpress_development_module.md`)]: WordPress setup and theme/plugin development
- [browser-automation (`memory-bank/browser_automation_module.md`)]: Browser MCP integration and web automation
- [multi-instance (`memory-bank/multi_instance_module.md`)]: Multiple site management and port allocation
- [claude-integration (`memory-bank/claude_integration_module.md`)]: Claude Code setup and MCP server integration

## Development Workflow
1. Run setup script to initialize WordPress containers
2. Access WordPress installation at localhost:8090
3. Use Browser MCP to automate WordPress configuration
4. Develop themes/plugins with Claude Code assistance
5. Test browser automation workflows
6. Deploy additional instances as needed

## Version: 1.1 | Status: Active Development