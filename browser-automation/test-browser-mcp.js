#!/usr/bin/env node
/**
 * Browser MCP Test Script
 * Test Browser MCP connectivity and basic functionality
 */

const { chromium } = require('playwright');

class BrowserMCPTester {
    constructor() {
        this.browser = null;
        this.page = null;
        this.config = require('../browser-mcp-config.json');
    }

    async log(level, message, data = null) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`);
        if (data) {
            console.log(`[${timestamp}] [${level.toUpperCase()}] Data:`, JSON.stringify(data, null, 2));
        }
    }

    async initBrowser() {
        try {
            this.log('info', 'Initializing browser with Playwright');
            
            this.browser = await chromium.launch({
                headless: this.config.browser.headless,
                slowMo: this.config.browser.slowMo
            });
            
            this.page = await this.browser.newPage({
                viewport: this.config.browser.viewport
            });
            
            this.log('info', 'Browser initialized successfully');
            return { success: true };
            
        } catch (error) {
            this.log('error', 'Failed to initialize browser', error.message);
            return { success: false, error: error.message };
        }
    }

    async testWordPressConnectivity() {
        try {
            this.log('info', 'Testing WordPress connectivity');
            
            const response = await this.page.goto(this.config.wordpress.url, {
                waitUntil: 'networkidle',
                timeout: 30000
            });
            
            if (!response.ok()) {
                throw new Error(`HTTP ${response.status()}: ${response.statusText()}`);
            }
            
            const title = await this.page.title();
            const url = this.page.url();
            
            this.log('info', 'WordPress connectivity successful', {
                title,
                url,
                status: response.status()
            });
            
            // Take screenshot
            await this.page.screenshot({ 
                path: 'screenshots/wordpress-connectivity-test.png',
                fullPage: true 
            });
            
            return { success: true, title, url, status: response.status() };
            
        } catch (error) {
            this.log('error', 'WordPress connectivity failed', error.message);
            
            // Take error screenshot
            try {
                await this.page.screenshot({ 
                    path: 'screenshots/wordpress-connectivity-error.png',
                    fullPage: true 
                });
            } catch (screenshotError) {
                this.log('warn', 'Failed to take error screenshot', screenshotError.message);
            }
            
            return { success: false, error: error.message };
        }
    }

    async testBasicInteraction() {
        try {
            this.log('info', 'Testing basic page interaction');
            
            // Test scrolling
            await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
            await this.page.waitForTimeout(1000);
            await this.page.evaluate(() => window.scrollTo(0, 0));
            
            // Test element detection
            const bodyElement = await this.page.$('body');
            if (!bodyElement) {
                throw new Error('Failed to detect body element');
            }
            
            // Test text content
            const pageText = await this.page.textContent('body');
            const hasContent = pageText && pageText.length > 0;
            
            this.log('info', 'Basic interaction test successful', {
                hasBodyElement: !!bodyElement,
                hasContent,
                contentLength: pageText ? pageText.length : 0
            });
            
            return { success: true, hasBodyElement: true, hasContent, contentLength: pageText.length };
            
        } catch (error) {
            this.log('error', 'Basic interaction test failed', error.message);
            return { success: false, error: error.message };
        }
    }

    async testWordPressInstallPage() {
        try {
            this.log('info', 'Testing WordPress install page');
            
            const response = await this.page.goto(this.config.wordpress.install_url, {
                waitUntil: 'networkidle',
                timeout: 30000
            });
            
            const title = await this.page.title();
            const url = this.page.url();
            
            // Check if install form is present
            const installForm = await this.page.$('#weblog_title');
            const hasInstallForm = !!installForm;
            
            // Check if already installed (redirected to login or dashboard)
            const isInstalled = title.includes('Dashboard') || title.includes('Log In') || url.includes('wp-login');
            
            this.log('info', 'WordPress install page test completed', {
                title,
                url,
                status: response.status(),
                hasInstallForm,
                isInstalled
            });
            
            // Take screenshot
            await this.page.screenshot({ 
                path: 'screenshots/wordpress-install-page-test.png',
                fullPage: true 
            });
            
            return { 
                success: true, 
                title, 
                url, 
                status: response.status(),
                hasInstallForm,
                isInstalled
            };
            
        } catch (error) {
            this.log('error', 'WordPress install page test failed', error.message);
            return { success: false, error: error.message };
        }
    }

    async runTests() {
        this.log('info', 'Starting Browser MCP tests');
        
        const results = {
            browserInit: null,
            connectivity: null,
            interaction: null,
            installPage: null,
            success: false,
            errors: []
        };

        try {
            // Test 1: Browser initialization
            results.browserInit = await this.initBrowser();
            if (!results.browserInit.success) {
                results.errors.push('Browser initialization failed');
                return results;
            }

            // Test 2: WordPress connectivity
            results.connectivity = await this.testWordPressConnectivity();
            if (!results.connectivity.success) {
                results.errors.push('WordPress connectivity failed');
            }

            // Test 3: Basic interaction
            results.interaction = await this.testBasicInteraction();
            if (!results.interaction.success) {
                results.errors.push('Basic interaction failed');
            }

            // Test 4: WordPress install page
            results.installPage = await this.testWordPressInstallPage();
            if (!results.installPage.success) {
                results.errors.push('Install page test failed');
            }

            // Overall success if no critical errors
            results.success = results.browserInit.success && 
                            results.connectivity.success && 
                            results.interaction.success;

            this.log('info', `Browser MCP tests completed. Success: ${results.success}`);
            
            if (results.errors.length > 0) {
                this.log('warn', 'Tests completed with errors', results.errors);
            }

        } catch (error) {
            this.log('error', 'Test suite failed', error.message);
            results.errors.push(`Test suite error: ${error.message}`);
        } finally {
            // Cleanup
            if (this.browser) {
                await this.browser.close();
                this.log('info', 'Browser closed');
            }
        }
        
        return results;
    }
}

// Run if called directly
if (require.main === module) {
    const tester = new BrowserMCPTester();
    tester.runTests()
        .then(results => {
            console.log('\n' + '='.repeat(50));
            console.log('BROWSER MCP TEST RESULTS');
            console.log('='.repeat(50));
            console.log(JSON.stringify(results, null, 2));
            console.log('='.repeat(50));
            
            process.exit(results.success ? 0 : 1);
        })
        .catch(error => {
            console.error('Test Error:', error);
            process.exit(1);
        });
}

module.exports = BrowserMCPTester;