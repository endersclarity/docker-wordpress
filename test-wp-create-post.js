#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

async function testCreatePost() {
    console.log('📝 Testing WordPress MCP Post Creation...\n');

    const mcpServerPath = path.join(__dirname, 'custom-wp-mcp.mjs');
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
        responseBuffer = lines.pop();

        lines.forEach(line => {
            if (line.trim()) {
                try {
                    const response = JSON.parse(line);
                    console.log(`📤 Response (ID ${response.id}):`, JSON.stringify(response, null, 2));
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
                name: "WordPress Post Test",
                version: "1.0.0"
            }
        }
    };

    console.log('🚀 Initializing MCP server...');
    mcpProcess.stdin.write(JSON.stringify(initRequest) + '\n');

    // Test creating a simple post
    setTimeout(() => {
        const createPostRequest = {
            jsonrpc: "2.0",
            id: 2,
            method: "tools/call",
            params: {
                name: "wp_call_endpoint",
                arguments: {
                    site: "docker",
                    endpoint: "/wp/v2/posts",
                    method: "POST",
                    params: {
                        title: "MCP Test Post",
                        content: "This post was created using WordPress MCP integration!",
                        status: "draft"
                    }
                }
            }
        };

        console.log('\n📝 Creating test post...');
        mcpProcess.stdin.write(JSON.stringify(createPostRequest) + '\n');
    }, 2000);

    // Clean shutdown
    setTimeout(() => {
        console.log('\n🛑 Test completed, shutting down...');
        mcpProcess.kill();
    }, 8000);
}

if (require.main === module) {
    testCreatePost().catch(console.error);
}

module.exports = { testCreatePost };