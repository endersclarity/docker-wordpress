#!/usr/bin/env node
/**
 * Test WordPress MCP authentication and CRUD operations
 */

const { spawn } = require('child_process');
const fs = require('fs');

// Set environment variable for config path
process.env.WP_SITES_PATH = '/home/ender/.claude/projects/docker-wordpress/wp-sites-config.json';

async function testMCPCommand(input) {
    return new Promise((resolve, reject) => {
        const mcp = spawn('node', ['/home/ender/.claude/projects/docker-wordpress/custom-wp-mcp.mjs'], {
            stdio: ['pipe', 'pipe', 'pipe']
        });

        let stdout = '';
        let stderr = '';

        mcp.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        mcp.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        mcp.on('close', (code) => {
            if (code === 0) {
                resolve({ stdout, stderr });
            } else {
                reject(new Error(`MCP exited with code ${code}. Stderr: ${stderr}`));
            }
        });

        // Send test input
        mcp.stdin.write(JSON.stringify(input) + '\n');
        mcp.stdin.end();

        // Timeout after 10 seconds
        setTimeout(() => {
            mcp.kill();
            reject(new Error('MCP test timed out'));
        }, 10000);
    });
}

async function runTests() {
    console.log('🧪 Testing WordPress MCP Authentication and CRUD Operations\n');

    try {
        // Test 1: List available tools
        console.log('1️⃣  Testing tool discovery...');
        const toolsRequest = {
            jsonrpc: "2.0",
            id: 1,
            method: "tools/list"
        };

        const toolsResult = await testMCPCommand(toolsRequest);
        console.log('✅ Tools discovered successfully');
        console.log('📋 Available tools:', JSON.parse(toolsResult.stdout).result.tools.map(t => t.name).join(', '));

        // Test 2: Test authentication
        console.log('\n2️⃣  Testing authentication...');
        const authRequest = {
            jsonrpc: "2.0",
            id: 2,
            method: "tools/call",
            params: {
                name: "wp_test_auth",
                arguments: {
                    site: "docker"
                }
            }
        };

        const authResult = await testMCPCommand(authRequest);
        const authData = JSON.parse(authResult.stdout);
        console.log('🔐 Auth test result:', authData.result.content[0].text);

        // Test 3: Try to create a post
        console.log('\n3️⃣  Testing post creation...');
        const createRequest = {
            jsonrpc: "2.0",
            id: 3,
            method: "tools/call",
            params: {
                name: "wp_create_post",
                arguments: {
                    site: "docker",
                    title: "Test Post from MCP",
                    content: "This post was created using the WordPress MCP to test authentication and CRUD operations.",
                    status: "draft"
                }
            }
        };

        const createResult = await testMCPCommand(createRequest);
        const createData = JSON.parse(createResult.stdout);
        console.log('📝 Post creation result:', createData.result.content[0].text);

        console.log('\n✅ All tests completed!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('📋 Full error details:', error);
    }
}

if (require.main === module) {
    runTests();
}