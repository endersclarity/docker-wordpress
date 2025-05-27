#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

async function testWordPressEndpoints() {
    console.log('🔍 Testing WordPress MCP Endpoint Discovery...\n');

    const mcpServerPath = path.join(__dirname, 'node_modules', 'server-wp-mcp', 'dist', 'index.js');
    const configPath = path.join(__dirname, 'wp-sites-config.json');

    const env = {
        ...process.env,
        WP_SITES_PATH: configPath
    };

    const mcpProcess = spawn('node', [mcpServerPath], {
        env,
        stdio: ['pipe', 'pipe', 'pipe']
    });

    let responseBuffer = '';

    mcpProcess.stdout.on('data', (data) => {
        responseBuffer += data.toString();
        const lines = responseBuffer.split('\n');
        responseBuffer = lines.pop(); // Keep incomplete line in buffer

        lines.forEach(line => {
            if (line.trim()) {
                try {
                    const response = JSON.parse(line);
                    if (response.id === 1) {
                        console.log('✅ MCP Server initialized successfully');
                    } else if (response.id === 2) {
                        console.log('🛠️  Available MCP Tools:');
                        response.result.tools.forEach(tool => {
                            console.log(`  - ${tool.name}: ${tool.description.substring(0, 80)}...`);
                        });
                    } else if (response.id === 3) {
                        console.log('\n🎯 WordPress Endpoints Discovery Results:');
                        console.log(JSON.stringify(response.result, null, 2));
                    }
                } catch (e) {
                    console.log('📤 Raw output:', line);
                }
            }
        });
    });

    mcpProcess.stderr.on('data', (data) => {
        console.log('ℹ️  Info:', data.toString().trim());
    });

    // Initialize
    const initRequest = {
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
            protocolVersion: "2024-11-05",
            capabilities: {},
            clientInfo: {
                name: "WordPress MCP Test",
                version: "1.0.0"
            }
        }
    };

    console.log('🚀 Initializing MCP server...');
    mcpProcess.stdin.write(JSON.stringify(initRequest) + '\n');

    // List tools
    setTimeout(() => {
        const toolsRequest = {
            jsonrpc: "2.0",
            id: 2,
            method: "tools/list"
        };

        console.log('📋 Listing available tools...');
        mcpProcess.stdin.write(JSON.stringify(toolsRequest) + '\n');
    }, 1000);

    // Discover endpoints on Docker WordPress
    setTimeout(() => {
        const discoverRequest = {
            jsonrpc: "2.0",
            id: 3,
            method: "tools/call",
            params: {
                name: "wp_discover_endpoints",
                arguments: {
                    site: "docker"
                }
            }
        };

        console.log('\n🔍 Discovering WordPress endpoints on Docker site...');
        mcpProcess.stdin.write(JSON.stringify(discoverRequest) + '\n');
    }, 2000);

    // Clean shutdown
    setTimeout(() => {
        console.log('\n🛑 Test completed, shutting down...');
        mcpProcess.kill();
    }, 8000);
}

if (require.main === module) {
    testWordPressEndpoints().catch(console.error);
}

module.exports = { testWordPressEndpoints };