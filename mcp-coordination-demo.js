#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

/**
 * Demonstration of coordinated Browser MCP + WordPress MCP workflows
 * This shows how to use both MCP servers together for complete automation
 */
class MCPCoordinator {
    constructor() {
        this.wordpressMCP = null;
        this.browserMCP = null;
        this.isReady = false;
    }

    async startWordPressMCP() {
        console.log('🚀 Starting WordPress MCP server...');
        
        const mcpServerPath = path.join(__dirname, 'custom-wp-mcp.mjs');
        const configPath = path.join(__dirname, 'wp-sites-config.json');

        const env = {
            ...process.env,
            WP_SITES_PATH: configPath
        };

        this.wordpressMCP = spawn('node', [mcpServerPath], {
            env,
            stdio: ['pipe', 'pipe', 'pipe']
        });

        this.wordpressMCP.stderr.on('data', (data) => {
            const message = data.toString().trim();
            if (message.includes('started with')) {
                console.log('✅ WordPress MCP:', message);
            }
        });

        // Initialize WordPress MCP
        await this.sendToWordPressMCP({
            jsonrpc: "2.0",
            id: 1,
            method: "initialize",
            params: {
                protocolVersion: "2024-11-05",
                capabilities: {},
                clientInfo: {
                    name: "MCP Coordinator",
                    version: "1.0.0"
                }
            }
        });

        console.log('✅ WordPress MCP server ready');
        return true;
    }

    async sendToWordPressMCP(request) {
        return new Promise((resolve, reject) => {
            let timeout;
            const responseHandler = (data) => {
                try {
                    const lines = data.toString().split('\n');
                    for (const line of lines) {
                        if (line.trim()) {
                            const response = JSON.parse(line);
                            if (response.id === request.id) {
                                clearTimeout(timeout);
                                this.wordpressMCP.stdout.removeListener('data', responseHandler);
                                resolve(response);
                                return;
                            }
                        }
                    }
                } catch (e) {
                    // Continue listening for valid JSON
                }
            };

            this.wordpressMCP.stdout.on('data', responseHandler);
            this.wordpressMCP.stdin.write(JSON.stringify(request) + '\n');

            timeout = setTimeout(() => {
                this.wordpressMCP.stdout.removeListener('data', responseHandler);
                reject(new Error('WordPress MCP request timeout'));
            }, 5000);
        });
    }

    async demonstrateCoordination() {
        console.log('\n🎯 MCP Coordination Demonstration');
        console.log('This demo shows Browser MCP + WordPress MCP working together\n');

        try {
            // Step 1: Discover WordPress capabilities
            console.log('1️⃣ Discovering WordPress capabilities...');
            const discovery = await this.sendToWordPressMCP({
                jsonrpc: "2.0",
                id: 100,
                method: "tools/call",
                params: {
                    name: "wp_discover_endpoints",
                    arguments: { site: "docker" }
                }
            });

            const endpoints = JSON.parse(discovery.result.content[0].text);
            console.log(`   Found ${endpoints.length} WordPress REST API endpoints`);

            // Step 2: Get current WordPress posts
            console.log('2️⃣ Fetching current WordPress content...');
            const postsResponse = await this.sendToWordPressMCP({
                jsonrpc: "2.0",
                id: 101,
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

            const posts = JSON.parse(postsResponse.result.content[0].text);
            console.log(`   Current posts in WordPress: ${posts.length}`);

            // Step 3: Demonstrate browser automation potential
            console.log('3️⃣ Simulating browser automation workflow...');
            console.log('   [Browser MCP would:]');
            console.log('   • Navigate to WordPress admin');
            console.log('   • Take screenshots of current state');
            console.log('   • Extract form data and content');
            console.log('   • Validate UI elements');

            // Step 4: Show coordination possibilities
            console.log('4️⃣ Coordination workflow possibilities:');
            console.log('   ✨ Create content via API → Verify via browser');
            console.log('   ✨ Browser form automation → API validation');
            console.log('   ✨ Screenshot-driven testing → API state verification');
            console.log('   ✨ Multi-site content synchronization');
            console.log('   ✨ Automated theme/plugin testing workflows');

            // Step 5: Configuration management
            console.log('5️⃣ Multi-MCP configuration:');
            console.log('   📁 WordPress sites: wp-sites-config.json');
            console.log('   📁 Browser settings: browser-mcp-config.json');
            console.log('   🔗 Coordination scripts: Custom orchestration layer');

            console.log('\n🎉 MCP Coordination Setup Complete!');
            console.log('\n📋 Available Integration Patterns:');
            console.log('• WordPress API + Browser validation');
            console.log('• Form automation + REST API verification');
            console.log('• Screenshot testing + content API checks');
            console.log('• Multi-environment synchronization');

            return true;

        } catch (error) {
            console.error('❌ Coordination error:', error.message);
            return false;
        }
    }

    async shutdown() {
        console.log('\n🛑 Shutting down MCP servers...');
        if (this.wordpressMCP) {
            this.wordpressMCP.kill();
        }
        if (this.browserMCP) {
            this.browserMCP.kill();
        }
    }
}

async function main() {
    const coordinator = new MCPCoordinator();
    
    try {
        await coordinator.startWordPressMCP();
        await coordinator.demonstrateCoordination();
    } catch (error) {
        console.error('❌ Demo failed:', error.message);
    } finally {
        await coordinator.shutdown();
        setTimeout(() => process.exit(0), 1000);
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { MCPCoordinator };