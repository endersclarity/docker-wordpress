#!/usr/bin/env node
/**
 * WordPress MCP Server Connection Test
 */

const { spawn } = require('child_process');
const { Client } = require('@modelcontextprotocol/sdk/client/index.js');
const { StdioClientTransport } = require('@modelcontextprotocol/sdk/client/stdio.js');

async function testWordPressMCP() {
    console.log('Starting WordPress MCP connection test...');
    
    try {
        // Set environment variable for WordPress sites config
        process.env.WP_SITES_PATH = '/home/ender/.claude/projects/docker-wordpress/wp-sites-config.json';
        
        // Spawn the WordPress MCP server
        const serverProcess = spawn('node', ['node_modules/server-wp-mcp/dist/index.js'], {
            stdio: ['pipe', 'pipe', 'pipe'],
            env: process.env
        });
        
        // Create client transport
        const transport = new StdioClientTransport({
            command: serverProcess
        });
        
        // Create MCP client
        const client = new Client({
            name: "wordpress-mcp-test",
            version: "1.0.0"
        }, {
            capabilities: {}
        });
        
        // Connect to server
        await client.connect(transport);
        console.log('✅ Connected to WordPress MCP server');
        
        // Test listing tools
        const tools = await client.listTools();
        console.log('✅ Available tools:', tools.tools.map(t => t.name));
        
        // Test a simple WordPress operation
        try {
            const siteInfo = await client.callTool({
                name: 'wordpress_request',
                arguments: {
                    site: 'local',
                    endpoint: '',
                    method: 'GET'
                }
            });
            console.log('✅ WordPress site info retrieved');
            console.log('Site info:', siteInfo.content);
        } catch (error) {
            console.log('⚠️ WordPress API test failed:', error.message);
        }
        
        // Close connection
        await client.close();
        console.log('✅ WordPress MCP test completed successfully');
        
        return { success: true };
        
    } catch (error) {
        console.error('❌ WordPress MCP test failed:', error.message);
        return { success: false, error: error.message };
    }
}

// Run test
if (require.main === module) {
    testWordPressMCP()
        .then(result => {
            console.log('Test result:', result);
            process.exit(result.success ? 0 : 1);
        })
        .catch(error => {
            console.error('Test error:', error);
            process.exit(1);
        });
}

module.exports = testWordPressMCP;