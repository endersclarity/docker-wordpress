const { chromium } = require('playwright');
const fs = require('fs');

async function createApplicationPassword() {
    console.log('🔐 Creating WordPress application password...');
    
    const browser = await chromium.launch({
        headless: false,
        slowMo: 500
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
        // Navigate to WordPress admin
        console.log('🌐 Navigating to WordPress admin...');
        await page.goto('http://localhost:8090/wp-admin');
        
        // Login
        console.log('🔑 Logging in...');
        await page.fill('#user_login', 'admin');
        await page.fill('#user_pass', 'D@wordpresska79823!4');
        await page.click('#wp-submit');
        
        // Wait for dashboard
        await page.waitForSelector('#wpbody-content', { timeout: 10000 });
        console.log('✅ Successfully logged in');
        
        // Navigate to user profile
        console.log('👤 Navigating to user profile...');
        await page.goto('http://localhost:8090/wp-admin/profile.php');
        
        // Scroll to Application Passwords section
        console.log('📜 Looking for Application Passwords section...');
        await page.evaluate(() => {
            const element = document.querySelector('h2');
            if (element && element.textContent.includes('Application Passwords')) {
                element.scrollIntoView();
            }
        });
        
        // Check if Application Passwords section exists
        const hasAppPasswords = await page.locator('h2:has-text("Application Passwords")').count() > 0;
        
        if (!hasAppPasswords) {
            console.log('⚠️  Application Passwords section not found. Checking for alternative method...');
            
            // Try alternative: look for application password fields
            const nameField = page.locator('input[name="new_application_password_name"]');
            if (await nameField.count() > 0) {
                console.log('✅ Found application password creation field');
                await nameField.fill('WordPress MCP Access');
                await page.click('button[type="submit"]:has-text("Add New Application Password")');
                
                // Wait for password generation
                await page.waitForSelector('.new-application-password code', { timeout: 5000 });
                const appPasswordElement = page.locator('.new-application-password code, .auth-app-pass-value, code').first();
            const appPassword = await appPasswordElement.textContent();
                
                console.log('🎉 Application password created:', appPassword);
                
                // Update config file
                const configPath = '/home/ender/.claude/projects/docker-wordpress/wp-sites-config.json';
                const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
                config.docker.PASS = appPassword;
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                
                console.log('💾 Configuration updated with application password');
                return appPassword;
            } else {
                console.log('❌ Application password functionality not available');
                console.log('ℹ️  This WordPress installation may not support application passwords');
                return null;
            }
        } else {
            console.log('✅ Found Application Passwords section');
            // Add application password name - try different selectors
            const nameInput = page.locator('input[name="new_application_password_name"], #new_application_password_name');
            await nameInput.waitFor({ timeout: 10000 });
            await nameInput.fill('WordPress MCP Access');
            
            // Click the button - try different selectors
            const addButton = page.locator('button:has-text("Add New Application Password"), #do_new_application_password, input[value*="Add New"]');
            await addButton.click();
            
            // Wait for the password to be generated - try multiple selectors
            await page.waitForSelector('.new-application-password code, .auth-app-pass-value, code', { timeout: 10000 });
            const appPasswordElement = page.locator('.new-application-password code, .auth-app-pass-value, code').first();
            const appPassword = await appPasswordElement.textContent();
            
            console.log('🎉 Application password created:', appPassword);
            
            // Update config file
            const configPath = '/home/ender/.claude/projects/docker-wordpress/wp-sites-config.json';
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            config.docker.PASS = appPassword;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            
            console.log('💾 Configuration updated with application password');
            return appPassword;
        }
        
    } catch (error) {
        console.error('❌ Error creating application password:', error.message);
        await page.screenshot({ path: 'screenshots/app-password-error.png' });
        return null;
    } finally {
        await browser.close();
    }
}

if (require.main === module) {
    createApplicationPassword().then(password => {
        if (password) {
            console.log('\n🎯 Next steps:');
            console.log('1. Test WordPress MCP with the new application password');
            console.log('2. Verify CRUD operations work correctly');
            process.exit(0);
        } else {
            console.log('\n⚠️  Could not create application password automatically');
            console.log('Manual steps required:');
            console.log('1. Go to http://localhost:8090/wp-admin/profile.php');
            console.log('2. Create application password manually');
            console.log('3. Update wp-sites-config.json with the password');
            process.exit(1);
        }
    });
}

module.exports = { createApplicationPassword };