# Module: Claude Integration

## Purpose & Responsibility
Manages Claude Code integration within the Docker environment, including MCP server setup, VS Code configuration, and AI-assisted development workflows for WordPress projects.

## Interfaces
* `claude`: Command-line interface for AI assistance
  * `claude --dangerous-skip-permissions`: Bypass permission checks for containerized development
  * `claude mcp add`: Install MCP servers for enhanced capabilities
* Input: Development prompts, code context, project requirements
* Output: Generated WordPress themes, plugins, configuration, and code

## Implementation Details
* Files:
  * `.claude.json` - Claude Code configuration
  * `CLAUDE.md` - Project-specific Claude instructions
  * `scripts/claude-setup.sh` - MCP installation script
* Important algorithms:
  * Context management for large WordPress projects
  * Prompt engineering for WordPress development
  * MCP server integration (Bright Data, Context 7)
* Data Models
  * `Claude Config`: MCP servers, permissions, context settings
  * `Project Context`: WordPress structure, themes, plugins
  * `Development Prompts`: Standardized prompts for common tasks

## Current Implementation Status
* Completed: []
* In Progress: []
* Pending: [Claude Code setup, MCP integration, prompt templates]

## Implementation Plans & Tasks
* `implementation_plan_claude_setup.md`
  * [Configure Claude Code]: Basic setup and permissions
  * [Install MCP servers]: Bright Data and Context 7 integration
  * [Create prompt templates]: WordPress-specific development prompts

## Mini Dependency Tracker
---mini_tracker_start---


---mini_tracker_end---