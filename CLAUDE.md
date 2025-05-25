# Docker WordPress Development Environment

## Bash Commands
- `docker-compose up -d`: Start the WordPress development environment
- `docker-compose down`: Stop and remove containers
- `docker-compose logs -f wordpress`: View WordPress container logs
- `docker-compose exec wordpress bash`: Access WordPress container shell
- `./scripts/setup.sh [INSTANCE_NUMBER]`: Initialize new WordPress instance

## Code Style
- Use Docker Compose version 3.8+ syntax
- Environment variables for all configurable values
- Consistent container naming with instance prefixes
- Volume mounts for persistent data (wp-content, database)

## Development Workflow
- Run `./scripts/setup.sh` to initialize WordPress environment
- Access WordPress installation at http://localhost:8090/wp-admin/install.php
- Use Browser MCP for automated WordPress setup and configuration
- Develop themes/plugins with Claude Code and Cursor IDE
- Test browser automation workflows for demo site creation

## WordPress Specific
- WordPress core files mounted as volumes for persistence
- Custom themes/plugins in wp-content directory
- Database persistence through named Docker volumes
- Admin credentials: admin / D@wordpresska79823!4 (endersclarity@gmail.com)

## Security Notes
- This setup is for development/demo purposes only
- Use --dangerous-skip-permissions for Claude Code in container
- No SSL/HTTPS configured (local development only)
- Default MySQL credentials (change for any shared environments)

## Browser Automation
- Browser MCP enables automated WordPress installation and configuration
- Automated theme/plugin development and testing workflows
- Screenshot capture and validation for demo site creation
- AI-assisted browser navigation and form completion

## Multi-Instance Management (Future)
- Plan for multiple WordPress instances on different ports (8090+N)
- Instance-specific volume names for data isolation
- Automated instance creation and management scripts