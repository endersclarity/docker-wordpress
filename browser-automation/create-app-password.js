#!/usr/bin/env node
/**
 * WordPress Application Password Creator
 * Creates application password for WordPress MCP access
 */

const { chromium } = require('playwright');
const fs = require('fs').promises;
const config = require('../browser-mcp-config.json');

class AppPasswordCreator {
    constructor() {
        this.config = config;
        this.browser = null;
        this.page = null;
    }

    async log(level, message, data = null) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`);
        if (data) {
            console.log(`[${timestamp}] [${level.toUpperCase()}] Data:`, data);
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

    async loginToWordPress() {
        this.log('info', 'Logging into WordPress admin');
        
        try {
            await this.page.goto(`${this.config.wordpress.url}/wp-admin`, { 
                waitUntil: 'networkidle' 
            });
            
            // Fill login form
            await this.page.fill('#user_login', this.config.wordpress.credentials.username);
            await this.page.fill('#user_pass', this.config.wordpress.credentials.password);
            
            // Submit login
            await this.page.click('#wp-submit');
            await this.page.waitForTimeout(3000);
            
            // Check if we're on the dashboard
            const pageTitle = await this.page.title();
            if (pageTitle.includes('Dashboard')) {
                this.log('info', 'Successfully logged into WordPress');
                await this.takeScreenshot('wordpress-login-success');
                return { success: true };
            } else {
                this.log('error', 'Login failed - not on dashboard');
                await this.takeScreenshot('wordpress-login-failed');
                return { success: false, error: 'Login failed' };
            }
            
        } catch (error) {
            this.log('error', 'Failed to login to WordPress', error.message);
            await this.takeScreenshot('wordpress-login-error');
            return { success: false, error: error.message };
        }
    }

    async createApplicationPassword() {
        this.log('info', 'Creating application password');
        
        try {
            // Navigate to user profile
            await this.page.goto(`${this.config.wordpress.url}/wp-admin/profile.php`, { 
                waitUntil: 'networkidle' 
            });
            
            await this.takeScreenshot('user-profile-page');
            
            // Scroll to application passwords section
            await this.page.evaluate(() => {
                const element = document.querySelector('.application-passwords');
                if (element) {
                    element.scrollIntoView();
                }
            });
            
            // Fill application name
            const appNameSelector = '#new_application_password_name';
            await this.page.waitForSelector(appNameSelector, { timeout: 10000 });
            await this.page.fill(appNameSelector, 'WordPress MCP Server');
            
            // Click "Add New Application Password"
            await this.page.click('#do_new_application_password');
            await this.page.waitForTimeout(3000);
            
            // Wait for the password to be generated
            await this.page.waitForSelector('.notice-success', { timeout: 10000 });
            
            // Extract the generated password
            const passwordElement = await this.page.$('.auth-app-pass-value');
            if (passwordElement) {
                const password = await passwordElement.textContent();
                this.log('info', 'Application password created successfully');
                await this.takeScreenshot('application-password-created');
                return { success: true, password: password.trim() };
            } else {
                this.log('error', 'Failed to extract application password');
                await this.takeScreenshot('application-password-extract-failed');
                return { success: false, error: 'Could not extract password' };
            }
            
        } catch (error) {
            this.log('error', 'Failed to create application password', error.message);
            await this.takeScreenshot('application-password-error');
            return { success: false, error: error.message };
        }
    }

    async updateConfig(password) {
        this.log('info', 'Updating WordPress MCP configuration');
        
        try {
            const configData = await fs.readFile('../wp-sites-config.json', 'utf8');
            const config = JSON.parse(configData);
            
            config.local.PASS = password;
            
            await fs.writeFile('../wp-sites-config.json', JSON.stringify(config, null, 2));
            this.log('info', 'Configuration updated successfully');
            return { success: true };
            
        } catch (error) {
            this.log('error', 'Failed to update configuration', error.message);
            return { success: false, error: error.message };
        }
    }

    async run() {
        this.log('info', 'Starting application password creation process');
        
        try {
            // Initialize browser
            this.browser = await chromium.launch({
                headless: false,
                slowMo: this.config.browser.slowMo
            });
            this.page = await this.browser.newPage({
                viewport: this.config.browser.viewport
            });
            
            // Login to WordPress
            const loginResult = await this.loginToWordPress();
            if (!loginResult.success) {
                throw new Error(`Login failed: ${loginResult.error}`);
            }
            
            // Create application password
            const passwordResult = await this.createApplicationPassword();
            if (!passwordResult.success) {
                throw new Error(`Password creation failed: ${passwordResult.error}`);
            }
            
            // Update configuration
            const configResult = await this.updateConfig(passwordResult.password);
            if (!configResult.success) {
                throw new Error(`Config update failed: ${configResult.error}`);
            }
            
            this.log('info', 'Application password process completed successfully');
            this.log('info', `Generated password: ${passwordResult.password}`);
            
            return { 
                success: true, 
                password: passwordResult.password 
            };
            
        } catch (error) {
            this.log('error', 'Application password process failed', error.message);
            return { success: false, error: error.message };
        } finally {
            if (this.browser) {
                await this.browser.close();
                this.log('info', 'Browser closed');
            }
        }
    }
}

// Run if called directly
if (require.main === module) {
    const creator = new AppPasswordCreator();
    creator.run()
        .then(result => {
            console.log('Application Password Result:', JSON.stringify(result, null, 2));
            process.exit(result.success ? 0 : 1);
        })
        .catch(error => {
            console.error('Application Password Error:', error);
            process.exit(1);
        });
}

module.exports = AppPasswordCreator;