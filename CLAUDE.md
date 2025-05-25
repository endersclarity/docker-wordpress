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
- Set instance number before starting (determines ports)
- Access WordPress via http://localhost:809X (where X = instance number)
- Access VS Code via http://localhost:808X
- Use Claude Code within VS Code container for AI assistance
- Install MCP servers: Bright Data, Context 7 for enhanced capabilities

## WordPress Specific
- WordPress core files mounted as volumes for persistence
- Custom themes/plugins in wp-content directory
- Database persistence through named Docker volumes
- Admin credentials stored in environment variables

## Security Notes
- This setup is for development/demo purposes only
- Use --dangerous-skip-permissions for Claude Code in container
- No SSL/HTTPS configured (local development only)
- Default MySQL credentials (change for any shared environments)

## Multi-Instance Management
- Each instance uses unique ports: 8090+N for WordPress, 8080+N for VS Code
- Separate Docker networks per instance to avoid conflicts
- Instance-specific volume names for data isolation