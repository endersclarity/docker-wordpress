#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ErrorCode, McpError, ListToolsRequestSchema, CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import axios from 'axios';
import fs from 'fs/promises';

// Load site config from config file
async function loadSiteConfig() {
    const configPath = process.env.WP_SITES_PATH;
    if (!configPath) {
        throw new Error("WP_SITES_PATH environment variable is required");
    }

    try {
        const configData = await fs.readFile(configPath, 'utf8');
        const config = JSON.parse(configData);
        
        // Validate and normalize the config
        const normalizedConfig = {};
        for (const [alias, site] of Object.entries(config)) {
            if (!site.URL || !site.USER || !site.PASS) {
                console.error(`Invalid configuration for site ${alias}: missing required fields`);
                continue;
            }

            normalizedConfig[alias.toLowerCase()] = {
                url: site.URL.replace(/\/$/, ''),
                username: site.USER,
                auth: site.PASS,
                authType: site.AUTH_TYPE || 'password'
            };
        }

        return normalizedConfig;
    } catch (error) {
        if (error.code === 'ENOENT') {
            throw new Error(`Config file not found at: ${configPath}`);
        }
        throw new Error(`Failed to load config: ${error.message}`);
    }
}

// Custom WordPress client that works with query parameters and enhanced authentication
class CustomWordPressClient {
    constructor(site) {
        this.baseUrl = site.url;
        this.username = site.username;
        this.auth = site.auth;
        this.authType = site.authType || 'password'; // 'password' or 'application'
        
        this.client = axios.create({
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': 'WordPress-MCP-Client/1.0'
            },
            timeout: 30000
        });

        // Set up authentication based on type
        if (site.auth) {
            const credentials = `${site.username}:${site.auth.replace(/\s+/g, '')}`;
            this.client.defaults.headers['Authorization'] = `Basic ${Buffer.from(credentials).toString('base64')}`;
        }
    }

    async discoverEndpoints() {
        try {
            const response = await this.client.get(`${this.baseUrl}/?rest_route=/wp/v2`);
            const routes = response.data?.routes ?? {};
            return Object.entries(routes).map(([path, info]) => ({
                methods: info.methods ?? [],
                namespace: info.namespace ?? 'wp/v2',
                endpoints: [path]
            }));
        } catch (error) {
            console.error('Error discovering endpoints:', error.message);
            return [];
        }
    }

    async makeRequest(endpoint, method = 'GET', params) {
        try {
            // Convert endpoint to query parameter format
            const url = `${this.baseUrl}/?rest_route=${endpoint}`;
            const config = { method, url };
            
            if (method === 'GET' && params) {
                config.params = params;
            } else if (params) {
                config.data = params;
            }

            // Add additional headers for write operations
            if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase())) {
                config.headers = {
                    ...config.headers,
                    'X-WP-Nonce': 'wp_rest' // This may need to be dynamically obtained
                };
            }

            const response = await this.client.request(config);
            
            // Return detailed response for write operations
            if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase())) {
                return {
                    success: true,
                    statusCode: response.status,
                    data: response.data,
                    headers: response.headers
                };
            }
            
            return response.data;
        } catch (error) {
            const errorDetails = {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                config: {
                    method: method,
                    url: `${this.baseUrl}/?rest_route=${endpoint}`,
                    authType: this.authType
                }
            };
            
            console.error(`WordPress API request failed:`, errorDetails);
            throw new Error(`WordPress API Error: ${error.response?.data?.message || error.message}`);
        }
    }

    async testAuthentication() {
        try {
            // Try a simple authenticated request to test auth
            const response = await this.makeRequest('/wp/v2/users/me', 'GET');
            return {
                success: true,
                user: response,
                authType: this.authType,
                message: 'Authentication successful'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                authType: this.authType,
                message: 'Authentication failed'
            };
        }
    }
}

// Start the server
async function main() {
    try {
        // Load configuration
        const siteConfig = await loadSiteConfig();
        const clients = new Map();

        for (const [alias, site] of Object.entries(siteConfig)) {
            clients.set(alias, new CustomWordPressClient(site));
        }

        console.error(`Custom WordPress MCP server started with ${clients.size} site(s) configured`);

        // Initialize server
        const server = new Server({
            name: "custom-wp-mcp",
            version: "1.0.0"
        }, {
            capabilities: {
                tools: {}
            }
        });

        server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: [
                {
                    name: "wp_discover_endpoints",
                    description: "Discovery operation maps all available REST API endpoints on a WordPress site",
                    inputSchema: {
                        type: "object",
                        properties: {
                            site: { type: "string", description: "Site alias" }
                        },
                        required: ["site"]
                    }
                },
                {
                    name: "wp_call_endpoint", 
                    description: "Execute specific REST API requests to WordPress sites",
                    inputSchema: {
                        type: "object",
                        properties: {
                            site: { type: "string" },
                            endpoint: { type: "string" },
                            method: { type: "string", enum: ["GET", "POST", "PUT", "DELETE", "PATCH"] },
                            params: { type: "object" }
                        },
                        required: ["site", "endpoint"]
                    }
                },
                {
                    name: "wp_test_auth",
                    description: "Test authentication credentials for a WordPress site",
                    inputSchema: {
                        type: "object",
                        properties: {
                            site: { type: "string", description: "Site alias" }
                        },
                        required: ["site"]
                    }
                },
                {
                    name: "wp_create_post",
                    description: "Create a new WordPress post",
                    inputSchema: {
                        type: "object",
                        properties: {
                            site: { type: "string", description: "Site alias" },
                            title: { type: "string", description: "Post title" },
                            content: { type: "string", description: "Post content" },
                            status: { type: "string", enum: ["publish", "draft", "private"], default: "draft" },
                            categories: { type: "array", items: { type: "integer" }, description: "Category IDs" },
                            tags: { type: "array", items: { type: "integer" }, description: "Tag IDs" }
                        },
                        required: ["site", "title", "content"]
                    }
                },
                {
                    name: "wp_update_post",
                    description: "Update an existing WordPress post",
                    inputSchema: {
                        type: "object",
                        properties: {
                            site: { type: "string", description: "Site alias" },
                            id: { type: "integer", description: "Post ID" },
                            title: { type: "string", description: "Post title" },
                            content: { type: "string", description: "Post content" },
                            status: { type: "string", enum: ["publish", "draft", "private"] },
                            categories: { type: "array", items: { type: "integer" } },
                            tags: { type: "array", items: { type: "integer" } }
                        },
                        required: ["site", "id"]
                    }
                },
                {
                    name: "wp_delete_post",
                    description: "Delete a WordPress post",
                    inputSchema: {
                        type: "object",
                        properties: {
                            site: { type: "string", description: "Site alias" },
                            id: { type: "integer", description: "Post ID" },
                            force: { type: "boolean", default: false, description: "Force delete (skip trash)" }
                        },
                        required: ["site", "id"]
                    }
                }
            ]
        }));

        server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            
            if (!clients.has(args.site)) {
                throw new McpError(ErrorCode.InvalidParams, `Unknown site: ${args.site}`);
            }

            const client = clients.get(args.site);

            switch (name) {
                case "wp_discover_endpoints":
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(await client.discoverEndpoints(), null, 2)
                            }
                        ]
                    };

                case "wp_call_endpoint":
                    const result = await client.makeRequest(
                        args.endpoint,
                        args.method || 'GET', 
                        args.params
                    );
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(result, null, 2)
                            }
                        ]
                    };

                case "wp_test_auth":
                    const authResult = await client.testAuthentication();
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(authResult, null, 2)
                            }
                        ]
                    };

                case "wp_create_post":
                    const postData = {
                        title: { raw: args.title },
                        content: { raw: args.content },
                        status: args.status || 'draft'
                    };
                    if (args.categories) postData.categories = args.categories;
                    if (args.tags) postData.tags = args.tags;
                    
                    const createResult = await client.makeRequest('/wp/v2/posts', 'POST', postData);
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(createResult, null, 2)
                            }
                        ]
                    };

                case "wp_update_post":
                    const updateData = {};
                    if (args.title) updateData.title = { raw: args.title };
                    if (args.content) updateData.content = { raw: args.content };
                    if (args.status) updateData.status = args.status;
                    if (args.categories) updateData.categories = args.categories;
                    if (args.tags) updateData.tags = args.tags;
                    
                    const updateResult = await client.makeRequest(`/wp/v2/posts/${args.id}`, 'PUT', updateData);
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(updateResult, null, 2)
                            }
                        ]
                    };

                case "wp_delete_post":
                    const deleteParams = args.force ? { force: true } : {};
                    const deleteResult = await client.makeRequest(`/wp/v2/posts/${args.id}`, 'DELETE', deleteParams);
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(deleteResult, null, 2)
                            }
                        ]
                    };

                default:
                    throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
            }
        });

        const transport = new StdioServerTransport();
        await server.connect(transport);
        
    } catch (error) {
        console.error('Server error:', error);
        process.exit(1);
    }
}

main();