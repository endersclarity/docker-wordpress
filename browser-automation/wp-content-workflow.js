const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');

/**
 * WordPress Content Management Workflow
 * Combines browser automation with WordPress REST API for complete content management
 */
class WordPressContentWorkflow {
    constructor() {
        this.browser = null;
        this.page = null;
        this.wordpressMCP = null;
        this.isAuthenticated = false;
    }

    async startWordPressMCP() {
        console.log('🚀 Starting WordPress MCP server...');
        
        const mcpServerPath = path.join(__dirname, '..', 'custom-wp-mcp.mjs');
        const configPath = path.join(__dirname, '..', 'wp-sites-config.json');

        const env = {
            ...process.env,
            WP_SITES_PATH: configPath
        };

        this.wordpressMCP = spawn('node', [mcpServerPath], {
            env,
            stdio: ['pipe', 'pipe', 'pipe']
        });

        // Initialize WordPress MCP
        await this.sendToWordPressMCP({
            jsonrpc: "2.0",
            id: 1,
            method: "initialize",
            params: {
                protocolVersion: "2024-11-05",
                capabilities: {},
                clientInfo: { name: "Content Workflow", version: "1.0.0" }
            }
        });

        console.log('✅ WordPress MCP server ready');
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
                    // Continue listening
                }
            };

            this.wordpressMCP.stdout.on('data', responseHandler);
            this.wordpressMCP.stdin.write(JSON.stringify(request) + '\n');

            timeout = setTimeout(() => {
                this.wordpressMCP.stdout.removeListener('data', responseHandler);
                reject(new Error('MCP request timeout'));
            }, 5000);
        });
    }

    async startBrowser() {
        console.log('🌐 Starting browser automation...');
        this.browser = await chromium.launch({
            headless: false,
            slowMo: 300
        });
        
        const context = await this.browser.newContext();
        this.page = await context.newPage();
        console.log('✅ Browser ready');
    }

    async authenticateWordPress() {
        console.log('🔑 Authenticating with WordPress admin...');
        
        try {
            await this.page.goto('http://localhost:8090/wp-admin');
            
            // Check if already logged in
            const isLoggedIn = await this.page.locator('#wpbody-content').count() > 0;
            
            if (!isLoggedIn) {
                await this.page.fill('#user_login', 'admin');
                await this.page.fill('#user_pass', 'D@wordpresska79823!4');
                await this.page.click('#wp-submit');
                
                await this.page.waitForSelector('#wpbody-content', { timeout: 10000 });
            }
            
            this.isAuthenticated = true;
            console.log('✅ WordPress authentication successful');
            
            // Take screenshot of dashboard
            await this.page.screenshot({ 
                path: path.join(__dirname, 'screenshots', 'wp-dashboard.png'),
                fullPage: true 
            });
            console.log('📸 Dashboard screenshot saved');
            
        } catch (error) {
            console.error('❌ Authentication failed:', error.message);
            throw error;
        }
    }

    async getContentViaAPI() {
        console.log('📊 Fetching content via WordPress API...');
        
        const response = await this.sendToWordPressMCP({
            jsonrpc: "2.0",
            id: 200,
            method: "tools/call",
            params: {
                name: "wp_call_endpoint",
                arguments: {
                    site: "docker",
                    endpoint: "/wp/v2/posts",
                    method: "GET",
                    params: { per_page: 10 }
                }
            }
        });

        const posts = JSON.parse(response.result.content[0].text);
        console.log(`📄 Found ${posts.length} posts via API`);
        
        return posts;
    }

    async verifyContentInBrowser(posts) {
        console.log('🔍 Verifying content in WordPress admin...');
        
        // Navigate to posts list
        await this.page.goto('http://localhost:8090/wp-admin/edit.php');
        await this.page.waitForSelector('.wp-list-table');
        
        // Count posts in admin interface
        const adminPosts = await this.page.locator('.wp-list-table tbody tr').count();
        console.log(`📄 Found ${adminPosts} posts in admin interface`);
        
        // Take screenshot of posts list
        await this.page.screenshot({ 
            path: path.join(__dirname, 'screenshots', 'wp-posts-list.png'),
            fullPage: true 
        });
        console.log('📸 Posts list screenshot saved');
        
        // Verify API vs browser count match
        if (posts.length === adminPosts) {
            console.log('✅ API and browser post counts match');
        } else {
            console.log('⚠️  Post count mismatch - API:', posts.length, 'Browser:', adminPosts);
        }
        
        return { apiCount: posts.length, browserCount: adminPosts };
    }

    async demonstrateWorkflow() {
        console.log('\n🎯 WordPress Content Management Workflow Demo');
        console.log('Combining API calls with browser automation for comprehensive content management\n');
        
        try {
            // Step 1: Get current state via API
            const posts = await this.getContentViaAPI();
            
            // Step 2: Verify in browser
            const counts = await this.verifyContentInBrowser(posts);
            
            // Step 3: Navigate to create new post
            console.log('📝 Navigating to post creation...');
            await this.page.goto('http://localhost:8090/wp-admin/post-new.php');
            await this.page.waitForSelector('#title');
            
            // Step 4: Fill out post form
            const postTitle = `Demo Post ${Date.now()}`;
            const postContent = `This post was created through browser automation at ${new Date().toISOString()}`;
            
            await this.page.fill('#title', postTitle);
            
            // Handle block editor or classic editor
            const hasBlockEditor = await this.page.locator('.block-editor').count() > 0;
            
            if (hasBlockEditor) {
                console.log('📝 Using Gutenberg block editor...');
                await this.page.click('.block-editor-writing-flow');
                await this.page.keyboard.type(postContent);
            } else {
                console.log('📝 Using classic editor...');
                await this.page.fill('#content', postContent);
            }
            
            // Step 5: Save as draft
            await this.page.click('#save-post');
            await this.page.waitForSelector('#message', { timeout: 10000 });
            
            console.log('💾 Post saved as draft');
            
            // Step 6: Take screenshot of created post
            await this.page.screenshot({ 
                path: path.join(__dirname, 'screenshots', 'wp-new-post.png'),
                fullPage: true 
            });
            console.log('📸 New post screenshot saved');
            
            // Step 7: Verify via API that post was created
            console.log('🔄 Verifying new post via API...');
            const updatedPosts = await this.getContentViaAPI();
            
            if (updatedPosts.length > counts.apiCount) {
                console.log('✅ New post detected via API');
                const newPost = updatedPosts.find(p => p.title.rendered === postTitle);
                if (newPost) {
                    console.log(`📄 New post ID: ${newPost.id}, Status: ${newPost.status}`);
                }
            }
            
            console.log('\n🎉 Workflow completed successfully!');
            console.log('\n📋 What we demonstrated:');
            console.log('✨ WordPress REST API content retrieval');
            console.log('✨ Browser automation for admin interface');
            console.log('✨ Cross-verification between API and UI');
            console.log('✨ Content creation through browser automation');
            console.log('✨ API verification of browser-created content');
            console.log('✨ Screenshot capture for validation');
            
        } catch (error) {
            console.error('❌ Workflow error:', error.message);
            await this.page.screenshot({ 
                path: path.join(__dirname, 'screenshots', 'workflow-error.png'),
                fullPage: true 
            });
        }
    }

    async cleanup() {
        console.log('\n🧹 Cleaning up resources...');
        
        if (this.browser) {
            await this.browser.close();
        }
        
        if (this.wordpressMCP) {
            this.wordpressMCP.kill();
        }
        
        console.log('✅ Cleanup complete');
    }
}

async function main() {
    const workflow = new WordPressContentWorkflow();
    
    try {
        await workflow.startWordPressMCP();
        await workflow.startBrowser();
        await workflow.authenticateWordPress();
        await workflow.demonstrateWorkflow();
    } catch (error) {
        console.error('❌ Main workflow error:', error.message);
    } finally {
        await workflow.cleanup();
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { WordPressContentWorkflow };