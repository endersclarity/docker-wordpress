<?php
/**
 * Plugin Name: MCP API Enabler
 * Description: Enables WordPress REST API access for MCP integration
 * Version: 1.0.0
 * Author: Claude Code
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Enable Application Passwords
add_filter('wp_is_application_passwords_available', '__return_true');

// Ensure REST API is enabled
add_filter('rest_enabled', '__return_true');

// Allow REST API for all users
add_filter('rest_authentication_errors', function($result) {
    // If a previous authentication check was applied,
    // pass that result along without modification.
    if (true === $result || is_wp_error($result)) {
        return $result;
    }

    // No authentication has been performed yet.
    // Return an error if user is not logged in.
    if (!is_user_logged_in()) {
        // Allow application password authentication to proceed
        return null;
    }

    // Our custom authentication check should have no effect
    // on logged-in users
    return $result;
});

// Add custom REST authentication for basic auth
add_filter('determine_current_user', function($user) {
    // Don't authenticate twice
    if ($user) {
        return $user;
    }

    // Check for basic auth header
    if (!isset($_SERVER['HTTP_AUTHORIZATION'])) {
        return $user;
    }

    $auth_header = $_SERVER['HTTP_AUTHORIZATION'];
    
    // Check if it's basic auth
    if (strpos($auth_header, 'Basic ') !== 0) {
        return $user;
    }

    // Decode the authorization header
    $encoded_credentials = substr($auth_header, 6);
    $credentials = base64_decode($encoded_credentials);
    
    if (!$credentials) {
        return $user;
    }

    list($username, $password) = explode(':', $credentials, 2);
    
    // Authenticate user
    $user = wp_authenticate($username, $password);
    
    if (is_wp_error($user)) {
        return null;
    }

    return $user->ID;
}, 20);

// Add CORS headers for REST API
add_action('rest_api_init', function() {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function($value) {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS');
        header('Access-Control-Allow-Headers: Authorization, Content-Type, X-WP-Nonce');
        header('Access-Control-Allow-Credentials: true');
        
        return $value;
    });
});

// Ensure the admin user has proper capabilities
add_action('init', function() {
    $admin_user = get_user_by('login', 'admin');
    if ($admin_user) {
        $admin_user->add_cap('publish_posts');
        $admin_user->add_cap('edit_posts');
        $admin_user->add_cap('delete_posts');
        $admin_user->add_cap('edit_others_posts');
        $admin_user->add_cap('delete_others_posts');
    }
});

// Log authentication attempts for debugging
add_action('wp_login_failed', function($username) {
    error_log("WordPress login failed for user: $username");
});

add_action('wp_login', function($user_login, $user) {
    error_log("WordPress login successful for user: $user_login");
}, 10, 2);
?>