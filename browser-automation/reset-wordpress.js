#!/usr/bin/env node
/**
 * WordPress Reset Script
 * Reset WordPress installation for fresh automation testing
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

async function resetWordPress() {
    console.log('🔄 Resetting WordPress for fresh installation...');
    
    try {
        // Stop containers
        console.log('⏹️  Stopping WordPress containers...');
        await execAsync('docker-compose down', { cwd: '/home/ender/.claude/projects/docker-wordpress' });
        
        // Remove WordPress data volume
        console.log('🗑️  Removing WordPress data volume...');
        await execAsync('docker volume rm docker-wordpress_wp_data || true');
        
        // Remove MySQL data volume  
        console.log('🗑️  Removing MySQL data volume...');
        await execAsync('docker volume rm docker-wordpress_mysql_data || true');
        
        // Start containers fresh
        console.log('🚀 Starting fresh WordPress containers...');
        await execAsync('docker-compose up -d', { cwd: '/home/ender/.claude/projects/docker-wordpress' });
        
        // Wait for containers to be ready
        console.log('⏳ Waiting for WordPress to initialize...');
        await new Promise(resolve => setTimeout(resolve, 30000));
        
        // Test accessibility
        console.log('🔍 Testing WordPress accessibility...');
        const { stdout } = await execAsync('curl -s -o /dev/null -w "%{http_code}" http://localhost:8090/wp-admin/install.php');
        
        if (stdout.trim() === '200') {
            console.log('✅ WordPress reset successful! Installation page accessible.');
            console.log('🌐 WordPress install URL: http://localhost:8090/wp-admin/install.php');
        } else {
            console.log(`⚠️  WordPress accessibility check returned: ${stdout.trim()}`);
        }
        
    } catch (error) {
        console.error('❌ WordPress reset failed:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    resetWordPress()
        .then(() => {
            console.log('🎉 WordPress reset completed successfully!');
            process.exit(0);
        })
        .catch(error => {
            console.error('Reset error:', error);
            process.exit(1);
        });
}

module.exports = resetWordPress;