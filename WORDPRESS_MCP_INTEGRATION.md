# WordPress MCP Integration Documentation

## Overview

This document provides comprehensive documentation for the WordPress Model Context Protocol (MCP) integration implemented in the Docker WordPress project. The integration enables AI assistants to interact with WordPress sites through standardized MCP tools while coordinating with browser automation.

## Architecture

### Core Components

1. **Custom WordPress MCP Server** (`custom-wp-mcp.mjs`)
   - Modified MCP server supporting query parameter REST API format
   - Compatible with WordPress installations that don't support pretty permalinks
   - Handles authentication and request routing

2. **WordPress Site Configuration** (`wp-sites-config.json`)
   - Multi-site configuration support
   - Authentication credentials management
   - URL and endpoint configuration

3. **MCP Coordination Layer** (`mcp-coordination-demo.js`)
   - Orchestrates multiple MCP servers
   - Enables complex workflows combining different automation tools

4. **Browser + API Workflows** (`browser-automation/wp-content-workflow.js`)
   - Demonstrates hybrid automation patterns
   - Combines REST API calls with browser automation
   - Cross-verification between API and UI states

## Installation & Setup

### Prerequisites

- Docker WordPress environment running on port 8090
- Node.js environment with MCP SDK dependencies
- Playwright for browser automation (optional)

### Configuration Files

#### WordPress Sites Configuration (`wp-sites-config.json`)

```json
{
  "docker": {
    "URL": "http://localhost:8090",
    "USER": "admin",
    "PASS": "your-password-here"
  },
  "local": {
    "URL": "https://your-local-site.local",
    "USER": "admin", 
    "PASS": "your-local-password"
  }
}
```

#### Environment Variables

```bash
export WP_SITES_PATH="/path/to/wp-sites-config.json"
```

## Available MCP Tools

### 1. `wp_discover_endpoints`

Discovers all available WordPress REST API endpoints for a given site.

**Parameters:**
- `site` (string, required): Site alias from configuration

**Example:**
```json
{
  "name": "wp_discover_endpoints",
  "arguments": {
    "site": "docker"
  }
}
```

**Returns:** Array of endpoint objects with methods and namespaces

### 2. `wp_call_endpoint`

Executes REST API requests to WordPress sites.

**Parameters:**
- `site` (string, required): Site alias
- `endpoint` (string, required): REST API endpoint path
- `method` (string, optional): HTTP method (GET, POST, PUT, DELETE, PATCH)
- `params` (object, optional): Request parameters or body data

**Example:**
```json
{
  "name": "wp_call_endpoint",
  "arguments": {
    "site": "docker",
    "endpoint": "/wp/v2/posts",
    "method": "GET",
    "params": {
      "per_page": 5,
      "status": "publish"
    }
  }
}
```

## Usage Examples

### Basic WordPress Content Retrieval

```javascript
const response = await sendToWordPressMCP({
  jsonrpc: "2.0",
  id: 1,
  method: "tools/call",
  params: {
    name: "wp_call_endpoint",
    arguments: {
      site: "docker",
      endpoint: "/wp/v2/posts",
      method: "GET"
    }
  }
});

const posts = JSON.parse(response.result.content[0].text);
console.log(`Found ${posts.length} posts`);
```

### Endpoint Discovery

```javascript
const discovery = await sendToWordPressMCP({
  jsonrpc: "2.0", 
  id: 2,
  method: "tools/call",
  params: {
    name: "wp_discover_endpoints",
    arguments: { site: "docker" }
  }
});

const endpoints = JSON.parse(discovery.result.content[0].text);
console.log(`Available endpoints: ${endpoints.length}`);
```

## Integration Patterns

### 1. API-First Workflow

Use WordPress MCP for primary operations, browser automation for verification:

```javascript
// 1. Create/modify content via API
const createResult = await wpMCP.createPost(postData);

// 2. Verify in browser
await browser.navigate('/wp-admin/edit.php');
await browser.verifyPostExists(createResult.id);
```

### 2. Browser-First Workflow  

Use browser automation for complex interactions, API for validation:

```javascript
// 1. Complex form interactions via browser
await browser.fillComplexForm(formData);
await browser.submitForm();

// 2. Validate via API
const posts = await wpMCP.getPosts();
const newPost = posts.find(p => p.title === formData.title);
```

### 3. Hybrid Validation

Cross-verify between browser UI and API state:

```javascript
// API state
const apiPosts = await wpMCP.getPosts();

// Browser state  
const browserPosts = await browser.getPostsFromAdmin();

// Validate consistency
assert.equal(apiPosts.length, browserPosts.length);
```

## Authentication

### Current Status

- **Read Operations**: Fully functional without authentication
- **Write Operations**: Requires authentication setup
- **Application Passwords**: Pending WordPress version/plugin support

### Authentication Methods

1. **Application Passwords** (Recommended)
   - WordPress 5.6+ native support
   - Requires plugin for older versions
   - Most secure for API access

2. **Basic Authentication** (Development)
   - Username/password over HTTPS
   - Requires custom authentication plugin
   - Not recommended for production

3. **Cookie Authentication** (Browser Sessions)
   - Session-based authentication
   - Works with browser automation
   - Requires nonce handling

## Troubleshooting

### Common Issues

#### 1. REST API 404 Errors

**Problem:** Endpoints return 404 Not Found
**Solution:** Use query parameter format: `?rest_route=/wp/v2/endpoint`

#### 2. Authentication Failures

**Problem:** 401 Unauthorized errors
**Solution:** 
- Verify credentials in wp-sites-config.json
- Check if application passwords are enabled
- Ensure user has proper capabilities

#### 3. CORS Issues

**Problem:** Browser requests blocked by CORS policy
**Solution:** Install custom plugin to add CORS headers

### Debug Mode

Enable verbose logging:

```javascript
// Add to custom-wp-mcp.mjs
console.error('Debug: Request details:', {
  url: requestUrl,
  method: method,
  headers: headers
});
```

## Performance Considerations

### Optimization Strategies

1. **Connection Pooling**: Reuse MCP server connections
2. **Caching**: Cache endpoint discovery results  
3. **Batch Operations**: Group related API calls
4. **Timeout Management**: Set appropriate timeouts for different operations

### Resource Management

```javascript
// Proper cleanup
async function cleanup() {
  if (wordpressMCP) {
    wordpressMCP.kill();
  }
  if (browser) {
    await browser.close();
  }
}
```

## Security Best Practices

### Configuration Security

1. **Environment Variables**: Store sensitive data in environment variables
2. **File Permissions**: Restrict access to configuration files
3. **HTTPS**: Use HTTPS for all remote WordPress sites
4. **Application Passwords**: Prefer application passwords over regular passwords

### API Security

1. **Rate Limiting**: Implement request rate limiting
2. **Input Validation**: Validate all API inputs
3. **Error Handling**: Don't expose sensitive information in errors
4. **Audit Logging**: Log all API operations for security auditing

## Testing Framework

### Test Categories

1. **Unit Tests**: Individual MCP tool functionality
2. **Integration Tests**: Multi-MCP coordination
3. **End-to-End Tests**: Complete workflows
4. **Performance Tests**: Load and stress testing

### Example Test Structure

```javascript
describe('WordPress MCP Integration', () => {
  test('should discover endpoints', async () => {
    const result = await wpMCP.discoverEndpoints('docker');
    expect(result.length).toBeGreaterThan(0);
  });
  
  test('should retrieve posts', async () => {
    const posts = await wpMCP.getPosts('docker');
    expect(Array.isArray(posts)).toBe(true);
  });
});
```

## Roadmap

### Phase 1: Core Functionality ✅
- [x] Custom MCP server implementation
- [x] Query parameter REST API support
- [x] Basic read operations
- [x] Multi-site configuration

### Phase 2: Authentication & Write Operations
- [ ] Application password setup
- [ ] Write operation support (POST, PUT, DELETE)
- [ ] Advanced authentication methods

### Phase 3: Advanced Features
- [ ] Bulk operations
- [ ] Media upload support
- [ ] Custom post type support
- [ ] Advanced error handling

### Phase 4: Production Ready
- [ ] Comprehensive testing suite
- [ ] Performance optimization
- [ ] Production deployment guides
- [ ] Monitoring and logging

## Support & Contributing

### Getting Help

1. Check this documentation
2. Review example implementations
3. Check the troubleshooting section
4. Create an issue with detailed information

### Contributing

1. Follow existing code patterns
2. Add tests for new functionality
3. Update documentation
4. Submit pull requests with clear descriptions

## License

This WordPress MCP integration is part of the Docker WordPress project and follows the same license terms.