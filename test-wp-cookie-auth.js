#!/usr/bin/env node

const axios = require('axios');
const cheerio = require('cheerio');

async function testCookieAuth() {
    console.log('🍪 Testing WordPress cookie authentication...');
    
    try {
        // Create axios instance with cookie jar
        const client = axios.create({
            withCredentials: true,
            headers: {
                'User-Agent': 'WordPress MCP Test'
            }
        });
        
        // Step 1: Get the login form to extract nonce
        console.log('1️⃣ Getting login form...');
        const loginPageResponse = await client.get('http://localhost:8090/wp-login.php');
        
        // Parse the HTML to extract the nonce
        const $ = cheerio.load(loginPageResponse.data);
        const nonce = $('input[name="_wpnonce"]').val() || '';
        const redirect = $('input[name="redirect_to"]').val() || '';
        
        console.log('2️⃣ Extracted nonce:', nonce ? 'Found' : 'Not found');
        
        // Step 2: Submit login form
        console.log('3️⃣ Submitting login credentials...');
        const loginData = new URLSearchParams({
            log: 'admin',
            pwd: 'D@wordpresska79823!4',
            'wp-submit': 'Log In',
            redirect_to: redirect || 'http://localhost:8090/wp-admin/',
            testcookie: '1'
        });
        
        if (nonce) {
            loginData.append('_wpnonce', nonce);
        }
        
        const loginResponse = await client.post('http://localhost:8090/wp-login.php', loginData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Referer': 'http://localhost:8090/wp-login.php'
            },
            maxRedirects: 0,
            validateStatus: status => status < 400
        });
        
        console.log('4️⃣ Login response status:', loginResponse.status);
        
        // Step 3: Get cookies from login response
        const cookies = loginResponse.headers['set-cookie'] || [];
        console.log('5️⃣ Received cookies:', cookies.length);
        
        // Step 4: Try to make a REST API request with cookies
        console.log('6️⃣ Testing REST API with cookies...');
        
        // First get nonce for REST API
        const adminResponse = await client.get('http://localhost:8090/wp-admin/', {
            headers: {
                Cookie: cookies.join('; ')
            }
        });
        
        // Extract REST nonce from admin page
        const adminHtml = adminResponse.data;
        const restNonceMatch = adminHtml.match(/wpApiSettings['"]\s*:\s*{[^}]*['"]nonce['"][^'"]*['"]([\w\d]+)['"]/);
        const restNonce = restNonceMatch ? restNonceMatch[1] : null;
        
        console.log('7️⃣ REST nonce:', restNonce ? 'Found' : 'Not found');
        
        // Step 5: Test creating a post with proper authentication
        console.log('8️⃣ Attempting to create post...');
        
        const postData = {
            title: 'MCP Test Post via Cookies',
            content: 'This post was created using cookie authentication!',
            status: 'draft'
        };
        
        const headers = {
            'Content-Type': 'application/json',
            Cookie: cookies.join('; ')
        };
        
        if (restNonce) {
            headers['X-WP-Nonce'] = restNonce;
        }
        
        const createResponse = await client.post(
            'http://localhost:8090/?rest_route=/wp/v2/posts',
            postData,
            { headers }
        );
        
        console.log('✅ Post created successfully!');
        console.log('📄 Post ID:', createResponse.data.id);
        console.log('📝 Title:', createResponse.data.title.rendered);
        
        return {
            success: true,
            postId: createResponse.data.id,
            cookies: cookies,
            restNonce: restNonce
        };
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

if (require.main === module) {
    testCookieAuth().then(result => {
        if (result.success) {
            console.log('\n🎉 Cookie authentication working!');
            console.log('💡 This method can be used for WordPress MCP integration');
        } else {
            console.log('\n❌ Cookie authentication failed');
        }
    });
}

module.exports = { testCookieAuth };