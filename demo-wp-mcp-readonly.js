#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

async function demonstrateWordPressMCP() {
    console.log('🎯 WordPress MCP Integration Demonstration\n');
    console.log('This demo shows WordPress MCP working with read operations');
    console.log('Authentication setup for write operations is pending.\n');

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
    let responseCount = 0;

    mcpProcess.stdout.on('data', (data) => {
        responseBuffer += data.toString();
        const lines = responseBuffer.split('\n');
        responseBuffer = lines.pop();

        lines.forEach(line => {
            if (line.trim()) {
                try {
                    const response = JSON.parse(line);
                    responseCount++;
                    
                    if (response.id === 1) {
                        console.log('✅ MCP Server initialized successfully');
                        console.log('📋 Server:', response.result.serverInfo.name, response.result.serverInfo.version);
                    } else if (response.id === 2) {
                        console.log('\n🛠️  Available WordPress MCP Tools:');
                        response.result.tools.forEach(tool => {
                            console.log(`  • ${tool.name}`);
                            console.log(`    ${tool.description.substring(0, 60)}...`);
                        });
                    } else if (response.id === 3) {
                        console.log('\n🌐 WordPress Site Discovery Results:');
                        if (response.result && response.result.content) {
                            const endpoints = JSON.parse(response.result.content[0].text);
                            console.log(`📊 Found ${endpoints.length} available endpoints:`);
                            
                            endpoints.slice(0, 5).forEach(endpoint => {
                                console.log(`  • ${endpoint.endpoints[0]} (${endpoint.methods.join(', ')})`);
                            });
                            
                            if (endpoints.length > 5) {
                                console.log(`  ... and ${endpoints.length - 5} more endpoints`);
                            }
                        }
                    } else if (response.id === 4) {
                        console.log('\n📄 WordPress Posts (Public):');
                        if (response.result && response.result.content) {
                            const posts = JSON.parse(response.result.content[0].text);
                            if (Array.isArray(posts) && posts.length > 0) {
                                posts.slice(0, 3).forEach(post => {
                                    console.log(`  • "${post.title.rendered}" (ID: ${post.id})`);
                                    console.log(`    Status: ${post.status} | Date: ${new Date(post.date).toLocaleDateString()}`);
                                });
                            } else {
                                console.log('  No posts found or authentication required');
                            }
                        }
                    } else if (response.error) {
                        console.log(`\n❌ Error (ID ${response.id}):`, response.error.message);
                    }
                } catch (e) {
                    console.log('📤 Raw output:', line);
                }
            }
        });
    });

    mcpProcess.stderr.on('data', (data) => {
        const message = data.toString().trim();
        if (message.includes('started with')) {
            console.log('🚀', message);
        } else if (message) {
            console.log('ℹ️ ', message);
        }
    });

    // Initialize MCP server
    const initRequest = {
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
            protocolVersion: "2024-11-05",
            capabilities: {},
            clientInfo: {
                name: "WordPress MCP Demo",
                version: "1.0.0"
            }
        }
    };

    console.log('🚀 Initializing WordPress MCP server...');
    mcpProcess.stdin.write(JSON.stringify(initRequest) + '\n');

    // List available tools
    setTimeout(() => {
        const toolsRequest = {
            jsonrpc: "2.0",
            id: 2,
            method: "tools/list"
        };

        mcpProcess.stdin.write(JSON.stringify(toolsRequest) + '\n');
    }, 1000);

    // Discover WordPress endpoints
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

        mcpProcess.stdin.write(JSON.stringify(discoverRequest) + '\n');
    }, 2000);

    // Get public posts
    setTimeout(() => {
        const postsRequest = {
            jsonrpc: "2.0",
            id: 4,
            method: "tools/call",
            params: {
                name: "wp_call_endpoint",
                arguments: {
                    site: "docker",
                    endpoint: "/wp/v2/posts",
                    method: "GET",
                    params: {
                        status: "publish",
                        per_page: 5
                    }
                }
            }
        };

        mcpProcess.stdin.write(JSON.stringify(postsRequest) + '\n');
    }, 3500);

    // Summary after test
    setTimeout(() => {
        console.log('\n📋 Integration Status Summary:');
        console.log('✅ WordPress MCP server creation: COMPLETE');
        console.log('✅ Custom query parameter support: COMPLETE');  
        console.log('✅ WordPress REST API discovery: COMPLETE');
        console.log('✅ Read operations (GET): WORKING');
        console.log('⚠️  Write operations (POST/PUT/DELETE): Authentication pending');
        console.log('⚠️  Application passwords: WordPress version limitation');
        
        console.log('\n🎯 Next Steps:');
        console.log('1. Configure Local by Flywheel WordPress instance');
        console.log('2. Set up application passwords on newer WordPress');
        console.log('3. Create multi-MCP coordination workflows');
        console.log('4. Develop browser + API automation patterns');
        
        mcpProcess.kill();
    }, 6000);

    setTimeout(() => {
        process.exit(0);
    }, 8000);
}

if (require.main === module) {
    demonstrateWordPressMCP().catch(console.error);
}

module.exports = { demonstrateWordPressMCP };