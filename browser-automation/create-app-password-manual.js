#!/usr/bin/env node
/**
 * Manual Application Password Creator
 * Opens browser to WordPress admin for manual application password creation
 */

const { chromium } = require('playwright');

async function openWordPressAdmin() {
    console.log('🔐 Opening WordPress admin for manual application password creation...');
    
    const browser = await chromium.launch({
        headless: false,
        slowMo: 1000
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
        // Navigate to WordPress admin login
        console.log('🌐 Navigating to WordPress admin...');
        await page.goto('http://localhost:8090/wp-admin');
        
        // Login
        console.log('🔑 Filling login credentials...');
        await page.fill('#user_login', 'admin');
        await page.fill('#user_pass', 'D@wordpresska79823!4');
        await page.click('#wp-submit');
        
        // Wait for dashboard
        await page.waitForSelector('#wpbody-content', { timeout: 10000 });
        console.log('✅ Successfully logged in');
        
        // Navigate to user profile
        console.log('👤 Navigating to user profile...');
        await page.goto('http://localhost:8090/wp-admin/profile.php');
        
        console.log('\n📋 MANUAL STEPS REQUIRED:');
        console.log('1. Scroll down to find "Application Passwords" section');
        console.log('2. Enter "WordPress MCP Server" as the application name');
        console.log('3. Click "Add New Application Password"');
        console.log('4. Copy the generated password');
        console.log('5. Press Enter in this terminal when done');
        
        // Wait for user input
        process.stdin.setRawMode(true);
        process.stdin.resume();
        await new Promise(resolve => {
            process.stdin.on('data', () => {
                resolve();
            });
        });
        
        console.log('\n💾 Please paste the application password below:');
        process.stdin.setRawMode(false);
        
        // Get password from user
        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        const password = await new Promise(resolve => {
            rl.question('Application Password: ', (answer) => {
                resolve(answer.trim());
            });
        });
        
        rl.close();
        
        if (password && password.length > 10) {
            // Update config file
            const fs = require('fs');
            const configPath = '/home/ender/.claude/projects/docker-wordpress/wp-sites-config.json';
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            config.docker.PASS = password;
            config.docker.AUTH_TYPE = 'application';
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            
            console.log('✅ Configuration updated with application password');
            console.log('🎯 Ready to test WordPress MCP with application password authentication!');
        } else {
            console.log('❌ Invalid password entered');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        // Don't close browser automatically - let user close it
        console.log('\n🖥️  Browser left open for your convenience. Close it when done.');
    }
}

if (require.main === module) {
    openWordPressAdmin().catch(console.error);
}

module.exports = { openWordPressAdmin };