#!/usr/bin/env node
/**
 * WordPress Browser Automation Installer
 * Automated WordPress installation using Browser MCP
 */

const config = require('../browser-mcp-config.json');

class WordPressInstaller {
    constructor() {
        this.config = config;
        this.browser = null;
        this.page = null;
        this.logLevel = this.config.automation.log_level || 'info';
    }

    log(level, message, data = null) {
        const timestamp = new Date().toISOString();
        const levels = { error: 0, warn: 1, info: 2, debug: 3 };
        
        if (levels[level] <= levels[this.logLevel]) {
            console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`);
            if (data) {
                console.log(`[${timestamp}] [${level.toUpperCase()}] Data:`, data);
            }
        }
    }

    async takeScreenshot(name) {
        if (this.page && this.config.automation.screenshot_on_error) {
            try {
                const screenshot = await this.page.screenshot({ 
                    path: `screenshots/${name}-${Date.now()}.png`,
                    fullPage: true 
                });
                this.log('info', `Screenshot saved: ${name}`);
                return screenshot;
            } catch (error) {
                this.log('error', 'Failed to take screenshot', error.message);
            }
        }
    }

    async waitForElement(selector, timeout = null) {
        const waitTimeout = timeout || this.config.automation.wait_timeout;
        try {
            await this.page.waitForSelector(selector, { timeout: waitTimeout });
            this.log('debug', `Element found: ${selector}`);
            return true;
        } catch (error) {
            this.log('error', `Element not found: ${selector}`, error.message);
            await this.takeScreenshot(`element-not-found-${selector.replace(/[^a-zA-Z0-9]/g, '-')}`);
            return false;
        }
    }

    async clickElement(selector, options = {}) {
        try {
            await this.page.click(selector, options);
            this.log('debug', `Clicked element: ${selector}`);
            return true;
        } catch (error) {
            this.log('error', `Failed to click element: ${selector}`, error.message);
            await this.takeScreenshot(`click-failed-${selector.replace(/[^a-zA-Z0-9]/g, '-')}`);
            return false;
        }
    }

    async fillInput(selector, value, options = {}) {
        try {
            await this.page.fill(selector, value, options);
            this.log('debug', `Filled input: ${selector} with value: ${value}`);
            return true;
        } catch (error) {
            this.log('error', `Failed to fill input: ${selector}`, error.message);
            await this.takeScreenshot(`fill-failed-${selector.replace(/[^a-zA-Z0-9]/g, '-')}`);
            return false;
        }
    }

    async navigateToInstall() {
        this.log('info', 'Navigating to WordPress installation page');
        
        try {
            await this.page.goto(this.config.wordpress.install_url, { 
                waitUntil: 'networkidle' 
            });
            
            // Check if WordPress is already installed
            const pageTitle = await this.page.title();
            if (pageTitle.includes('Dashboard') || pageTitle.includes('Log In')) {
                this.log('info', 'WordPress appears to already be installed');
                return { success: true, alreadyInstalled: true };
            }
            
            await this.takeScreenshot('wordpress-install-initial');
            
            // Check if on language selection page
            const languageContinue = await this.page.$('#language-continue');
            if (languageContinue) {
                this.log('info', 'On language selection page, clicking Continue');
                await this.clickElement('#language-continue');
                await this.page.waitForTimeout(2000);
                await this.takeScreenshot('after-language-selection');
            }
            
            // Now wait for installation form
            const formFound = await this.waitForElement('#weblog_title', 15000);
            if (!formFound) {
                // Take screenshot to see what page we're on
                await this.takeScreenshot('installation-form-not-found');
                return { success: false, error: 'Installation form not found after language selection' };
            }
            
            await this.takeScreenshot('wordpress-install-form');
            return { success: true, alreadyInstalled: false };
            
        } catch (error) {
            this.log('error', 'Failed to navigate to installation page', error.message);
            await this.takeScreenshot('navigation-failed');
            return { success: false, error: error.message };
        }
    }

    async fillInstallationForm() {
        this.log('info', 'Filling WordPress installation form');
        
        const { credentials } = this.config.wordpress;
        const formData = [
            { selector: '#weblog_title', value: 'Narissa Jennings Real Estate' },
            { selector: '#user_login', value: credentials.username },
            { selector: '#pass1', value: credentials.password },
            { selector: '#admin_email', value: credentials.email }
        ];

        try {
            for (const field of formData) {
                const filled = await this.fillInput(field.selector, field.value);
                if (!filled) {
                    return { success: false, error: `Failed to fill ${field.selector}` };
                }
                
                // Small delay between fields
                await this.page.waitForTimeout(200);
            }
            
            await this.takeScreenshot('installation-form-filled');
            return { success: true };
            
        } catch (error) {
            this.log('error', 'Failed to fill installation form', error.message);
            await this.takeScreenshot('form-fill-failed');
            return { success: false, error: error.message };
        }
    }

    async submitInstallation() {
        this.log('info', 'Submitting WordPress installation');
        
        try {
            // Click install button
            const submitted = await this.clickElement('#submit');
            if (!submitted) {
                return { success: false, error: 'Failed to click install button' };
            }
            
            // Wait for installation completion
            this.log('info', 'Waiting for installation to complete...');
            await this.page.waitForTimeout(5000);
            
            // Check for success message or redirect
            const successFound = await this.waitForElement('.step1', 2000) || 
                                await this.waitForElement('body:has-text("Success")', 2000) ||
                                await this.page.url().includes('wp-admin');
            
            if (successFound) {
                await this.takeScreenshot('installation-success');
                return { success: true };
            } else {
                await this.takeScreenshot('installation-status-unknown');
                return { success: false, error: 'Installation status unclear' };
            }
            
        } catch (error) {
            this.log('error', 'Failed to submit installation', error.message);
            await this.takeScreenshot('submit-failed');
            return { success: false, error: error.message };
        }
    }

    async verifyInstallation() {
        this.log('info', 'Verifying WordPress installation');
        
        try {
            // Try to access admin dashboard
            await this.page.goto(this.config.wordpress.admin_url, { 
                waitUntil: 'networkidle' 
            });
            
            const pageTitle = await this.page.title();
            this.log('info', `Admin page title: ${pageTitle}`);
            
            // Check if we're on login page or dashboard
            if (pageTitle.includes('Log In')) {
                this.log('info', 'WordPress installed - redirected to login page');
                await this.takeScreenshot('login-page-verification');
                return { success: true, status: 'login_required' };
            } else if (pageTitle.includes('Dashboard')) {
                this.log('info', 'WordPress installed - already logged in');
                await this.takeScreenshot('dashboard-verification');
                return { success: true, status: 'logged_in' };
            } else {
                this.log('warn', 'Unexpected page after installation', pageTitle);
                await this.takeScreenshot('unexpected-verification');
                return { success: false, error: 'Unexpected page state' };
            }
            
        } catch (error) {
            this.log('error', 'Failed to verify installation', error.message);
            await this.takeScreenshot('verification-failed');
            return { success: false, error: error.message };
        }
    }

    async runInstallation() {
        this.log('info', 'Starting WordPress automated installation');
        
        const results = {
            browserInit: null,
            navigation: null,
            formFill: null,
            submission: null,
            verification: null,
            success: false,
            error: null
        };

        try {
            // Step 0: Initialize browser
            const { chromium } = require('playwright');
            this.browser = await chromium.launch({
                headless: false,
                slowMo: this.config.browser.slowMo
            });
            this.page = await this.browser.newPage({
                viewport: this.config.browser.viewport
            });
            results.browserInit = { success: true };
            this.log('info', 'Browser initialized successfully');

            // Step 1: Navigate to installation page
            results.navigation = await this.navigateToInstall();
            if (!results.navigation.success) {
                throw new Error(`Navigation failed: ${results.navigation.error}`);
            }
            
            // Skip installation if already installed
            if (results.navigation.alreadyInstalled) {
                this.log('info', 'WordPress already installed, skipping installation steps');
                results.verification = await this.verifyInstallation();
                results.success = results.verification.success;
                return results;
            }
            
            // Step 2: Fill installation form
            results.formFill = await this.fillInstallationForm();
            if (!results.formFill.success) {
                throw new Error(`Form fill failed: ${results.formFill.error}`);
            }
            
            // Step 3: Submit installation
            results.submission = await this.submitInstallation();
            if (!results.submission.success) {
                throw new Error(`Submission failed: ${results.submission.error}`);
            }
            
            // Step 4: Verify installation
            results.verification = await this.verifyInstallation();
            if (!results.verification.success) {
                throw new Error(`Verification failed: ${results.verification.error}`);
            }
            
            results.success = true;
            this.log('info', 'WordPress installation completed successfully');
            
        } catch (error) {
            results.error = error.message;
            results.success = false;
            this.log('error', 'WordPress installation failed', error.message);
        } finally {
            // Close browser
            if (this.browser) {
                await this.browser.close();
                this.log('info', 'Browser closed');
            }
        }
        
        return results;
    }
}

// Export for use as module
module.exports = WordPressInstaller;

// Run if called directly
if (require.main === module) {
    const installer = new WordPressInstaller();
    installer.runInstallation()
        .then(results => {
            console.log('Installation Results:', JSON.stringify(results, null, 2));
            process.exit(results.success ? 0 : 1);
        })
        .catch(error => {
            console.error('Installation Error:', error);
            process.exit(1);
        });
}