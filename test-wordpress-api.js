#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

async function testWordPressMCP() {
    console.log('🧪 Testing WordPress MCP Integration...\n');

    const mcpServerPath = path.join(__dirname, 'node_modules', 'server-wp-mcp', 'dist', 'index.js');
    const configPath = path.join(__dirname, 'wp-sites-config.json');

    console.log('📁 MCP Server Path:', mcpServerPath);
    console.log('⚙️  Config Path:', configPath);

    const env = {
        ...process.env,
        WP_SITES_PATH: configPath
    };

    console.log('\n🚀 Starting WordPress MCP server...');

    const mcpProcess = spawn('node', [mcpServerPath], {
        env,
        stdio: ['pipe', 'pipe', 'pipe']
    });

    mcpProcess.stdout.on('data', (data) => {
        console.log('📤 MCP Output:', data.toString());
    });

    mcpProcess.stderr.on('data', (data) => {
        console.log('⚠️  MCP Error:', data.toString());
    });

    mcpProcess.on('close', (code) => {
        console.log(`\n🏁 MCP process exited with code ${code}`);
    });

    // Send a simple MCP request to list available tools
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

    console.log('\n📨 Sending initialize request...');
    mcpProcess.stdin.write(JSON.stringify(initRequest) + '\n');

    // Wait a moment then send tools/list request
    setTimeout(() => {
        const toolsRequest = {
            jsonrpc: "2.0",
            id: 2,
            method: "tools/list"
        };

        console.log('📨 Requesting available tools...');
        mcpProcess.stdin.write(JSON.stringify(toolsRequest) + '\n');
    }, 1000);

    // Clean shutdown after 5 seconds
    setTimeout(() => {
        console.log('\n🛑 Shutting down test...');
        mcpProcess.kill();
    }, 5000);
}

if (require.main === module) {
    testWordPressMCP().catch(console.error);
}

module.exports = { testWordPressMCP };