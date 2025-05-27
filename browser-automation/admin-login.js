#!/usr/bin/env node
/**
 * WordPress Admin Login Automation
 * Automated login to WordPress admin dashboard
 */

const { chromium } = require('playwright');

class WordPressAdminLogin {
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

    async takeScreenshot(name) {
        if (this.page) {
            try {
                await this.page.screenshot({ 
                    path: `screenshots/${name}-${Date.now()}.png`,
                    fullPage: true 
                });
                this.log('info', `Screenshot saved: ${name}`);
            } catch (error) {
                this.log('error', 'Failed to take screenshot', error.message);
            }
        }
    }

    async initBrowser() {
        try {
            this.log('info', 'Initializing browser for admin login');
            
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

    async navigateToLogin() {
        try {
            this.log('info', 'Navigating to WordPress admin login');
            
            // First try admin URL (might redirect to login)
            await this.page.goto(this.config.wordpress.admin_url, {
                waitUntil: 'networkidle'
            });
            
            const currentUrl = this.page.url();
            const title = await this.page.title();
            
            this.log('info', 'Navigation completed', {
                currentUrl,
                title
            });
            
            // Check if we're on login page
            if (currentUrl.includes('wp-login.php') || title.includes('Log In')) {
                await this.takeScreenshot('login-page');
                return { success: true, onLoginPage: true };
            }
            
            // Check if already logged in
            if (title.includes('Dashboard')) {
                await this.takeScreenshot('already-logged-in');
                return { success: true, alreadyLoggedIn: true };
            }
            
            // Try direct login URL
            const loginUrl = this.config.wordpress.url + '/wp-login.php';
            await this.page.goto(loginUrl, { waitUntil: 'networkidle' });
            
            await this.takeScreenshot('login-page-direct');
            return { success: true, onLoginPage: true };
            
        } catch (error) {
            this.log('error', 'Failed to navigate to login', error.message);
            await this.takeScreenshot('navigation-error');
            return { success: false, error: error.message };
        }
    }

    async performLogin() {
        try {
            this.log('info', 'Performing WordPress admin login');
            
            const { credentials } = this.config.wordpress;
            
            // Wait for login form
            await this.page.waitForSelector('#user_login', { timeout: 10000 });
            
            // Fill login form
            await this.page.fill('#user_login', credentials.username);
            await this.page.fill('#user_pass', credentials.password);
            
            this.log('info', 'Login form filled');
            await this.takeScreenshot('login-form-filled');
            
            // Submit login
            await this.page.click('#wp-submit');
            
            // Wait for login to complete
            await this.page.waitForTimeout(3000);
            
            const currentUrl = this.page.url();
            const title = await this.page.title();
            
            this.log('info', 'Login submitted', {
                currentUrl,
                title
            });
            
            // Check if login was successful
            if (title.includes('Dashboard') || currentUrl.includes('wp-admin') && !currentUrl.includes('wp-login')) {
                await this.takeScreenshot('login-success');
                return { success: true, loggedIn: true };
            } else {
                await this.takeScreenshot('login-failed');
                return { success: false, error: 'Login failed - still on login page' };
            }
            
        } catch (error) {
            this.log('error', 'Login failed', error.message);
            await this.takeScreenshot('login-error');
            return { success: false, error: error.message };
        }
    }

    async verifyAdminAccess() {
        try {
            this.log('info', 'Verifying admin dashboard access');
            
            // Navigate to main dashboard
            await this.page.goto(this.config.wordpress.admin_url, {
                waitUntil: 'networkidle'
            });
            
            const title = await this.page.title();
            const currentUrl = this.page.url();
            
            // Check for admin elements
            const adminBar = await this.page.$('#wpadminbar');
            const adminMenu = await this.page.$('#adminmenu');
            const dashboardContent = await this.page.$('#dashboard-widgets-wrap');
            
            const hasAdminElements = !!(adminBar && adminMenu);
            
            this.log('info', 'Admin access verification completed', {
                title,
                currentUrl,
                hasAdminBar: !!adminBar,
                hasAdminMenu: !!adminMenu,
                hasDashboard: !!dashboardContent,
                hasAdminElements
            });
            
            await this.takeScreenshot('admin-dashboard-verification');
            
            return { 
                success: hasAdminElements, 
                title, 
                currentUrl,
                hasAdminElements,
                hasAdminBar: !!adminBar,
                hasAdminMenu: !!adminMenu,
                hasDashboard: !!dashboardContent
            };
            
        } catch (error) {
            this.log('error', 'Admin access verification failed', error.message);
            await this.takeScreenshot('verification-error');
            return { success: false, error: error.message };
        }
    }

    async runLoginWorkflow() {
        this.log('info', 'Starting WordPress admin login workflow');
        
        const results = {
            browserInit: null,
            navigation: null,
            login: null,
            verification: null,
            success: false,
            errors: []
        };

        try {
            // Step 1: Initialize browser
            results.browserInit = await this.initBrowser();
            if (!results.browserInit.success) {
                throw new Error(`Browser init failed: ${results.browserInit.error}`);
            }

            // Step 2: Navigate to login
            results.navigation = await this.navigateToLogin();
            if (!results.navigation.success) {
                throw new Error(`Navigation failed: ${results.navigation.error}`);
            }

            // Skip login if already logged in
            if (results.navigation.alreadyLoggedIn) {
                this.log('info', 'Already logged in, skipping login step');
                results.login = { success: true, alreadyLoggedIn: true };
            } else {
                // Step 3: Perform login
                results.login = await this.performLogin();
                if (!results.login.success) {
                    throw new Error(`Login failed: ${results.login.error}`);
                }
            }

            // Step 4: Verify admin access
            results.verification = await this.verifyAdminAccess();
            if (!results.verification.success) {
                throw new Error(`Verification failed: ${results.verification.error}`);
            }

            results.success = true;
            this.log('info', 'WordPress admin login workflow completed successfully');

        } catch (error) {
            results.errors.push(error.message);
            results.success = false;
            this.log('error', 'Login workflow failed', error.message);
        } finally {
            // Keep browser open for further automation
            this.log('info', 'Login workflow completed - browser remains open for further automation');
        }
        
        return results;
    }

    async closeBrowser() {
        if (this.browser) {
            await this.browser.close();
            this.log('info', 'Browser closed');
        }
    }
}

// Export for use as module
module.exports = WordPressAdminLogin;

// Run if called directly
if (require.main === module) {
    const adminLogin = new WordPressAdminLogin();
    adminLogin.runLoginWorkflow()
        .then(results => {
            console.log('\n' + '='.repeat(50));
            console.log('WORDPRESS ADMIN LOGIN RESULTS');
            console.log('='.repeat(50));
            console.log(JSON.stringify(results, null, 2));
            console.log('='.repeat(50));
            
            // Close browser after standalone run
            return adminLogin.closeBrowser();
        })
        .then(() => {
            process.exit(0);
        })
        .catch(error => {
            console.error('Login Error:', error);
            process.exit(1);
        });
}