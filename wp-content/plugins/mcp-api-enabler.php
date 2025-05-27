<?php
/**
 * Plugin Name: MCP API Enabler
 * Description: Enables WordPress REST API access for MCP integration with enhanced security
 * Version: 1.1.0
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

// Add custom REST authentication for basic auth with security enhancements
add_filter('determine_current_user', function($user) {
    // Don't authenticate twice
    if ($user) {
        return $user;
    }

    // Check for basic auth header
    if (!isset($_SERVER['HTTP_AUTHORIZATION'])) {
        return $user;
    }

    // Enforce HTTPS for basic authentication (except in development)
    if (!is_ssl() && (!defined('WP_DEBUG') || !WP_DEBUG)) {
        error_log('MCP API Enabler: Basic authentication requires HTTPS');
        return $user;
    }

    $auth_header = $_SERVER['HTTP_AUTHORIZATION'];
    
    // Validate auth header format
    if (!is_string($auth_header) || strpos($auth_header, 'Basic ') !== 0) {
        return $user;
    }

    // Decode the authorization header with validation
    $encoded_credentials = substr($auth_header, 6);
    $credentials = base64_decode($encoded_credentials, true);
    
    if ($credentials === false || empty($credentials)) {
        error_log('MCP API Enabler: Invalid base64 encoding in auth header');
        return $user;
    }

    // Validate credentials format
    if (strpos($credentials, ':') === false) {
        error_log('MCP API Enabler: Invalid credentials format');
        return $user;
    }

    list($username, $password) = explode(':', $credentials, 2);
    
    // Sanitize and validate inputs
    $username = sanitize_user($username);
    if (empty($username) || empty($password)) {
        error_log('MCP API Enabler: Empty username or password');
        return $user;
    }
    
    // Authenticate user
    $user = wp_authenticate($username, $password);
    
    if (is_wp_error($user)) {
        error_log('MCP API Enabler: Authentication failed for user: ' . $username);
        return null;
    }

    return $user->ID;
}, 20);

// Add CORS headers for REST API with environment-specific configuration
add_action('rest_api_init', function() {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function($value) {
        // Get allowed origins from WordPress options or environment
        $allowed_origins = get_option('mcp_api_allowed_origins', '');
        
        // Default to restrictive CORS in production
        if (empty($allowed_origins)) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                // Development environment - allow localhost origins
                $allowed_origins = array(
                    'http://localhost:3000',
                    'http://localhost:8080',
                    'http://localhost:8090'
                );
            } else {
                // Production - must be explicitly configured
                $allowed_origins = array();
            }
        } else {
            // Parse comma-separated origins
            $allowed_origins = array_map('trim', explode(',', $allowed_origins));
        }
        
        // Check if the request origin is allowed
        $request_origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
        
        if (!empty($allowed_origins)) {
            if (in_array($request_origin, $allowed_origins)) {
                header('Access-Control-Allow-Origin: ' . $request_origin);
            } elseif (in_array('*', $allowed_origins)) {
                // Only allow wildcard if explicitly set
                header('Access-Control-Allow-Origin: *');
            }
        }
        
        // Set other CORS headers
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS');
        header('Access-Control-Allow-Headers: Authorization, Content-Type, X-WP-Nonce');
        header('Access-Control-Allow-Credentials: true');
        
        return $value;
    });
});

// Add admin UI for configuring allowed origins
add_action('admin_menu', function() {
    add_options_page(
        'MCP API Settings',
        'MCP API',
        'manage_options',
        'mcp-api-settings',
        'mcp_api_settings_page'
    );
});

// Settings page callback
function mcp_api_settings_page() {
    if (isset($_POST['submit'])) {
        check_admin_referer('mcp_api_settings');
        $allowed_origins = sanitize_textarea_field($_POST['mcp_api_allowed_origins']);
        update_option('mcp_api_allowed_origins', $allowed_origins);
        echo '<div class="notice notice-success"><p>Settings saved!</p></div>';
    }
    
    $allowed_origins = get_option('mcp_api_allowed_origins', '');
    ?>
    <div class="wrap">
        <h1>MCP API Settings</h1>
        <form method="post" action="">
            <?php wp_nonce_field('mcp_api_settings'); ?>
            <table class="form-table">
                <tr>
                    <th scope="row">
                        <label for="mcp_api_allowed_origins">Allowed Origins</label>
                    </th>
                    <td>
                        <textarea name="mcp_api_allowed_origins" id="mcp_api_allowed_origins" rows="5" cols="50"><?php echo esc_textarea($allowed_origins); ?></textarea>
                        <p class="description">
                            Enter allowed origins (one per line or comma-separated).<br>
                            Examples: http://localhost:3000, https://example.com<br>
                            Use * to allow all origins (not recommended for production).
                        </p>
                    </td>
                </tr>
            </table>
            <?php submit_button(); ?>
        </form>
    </div>
    <?php
}

// Grant capabilities to users with appropriate roles (not just admin)
add_action('init', function() {
    // Get all users with administrator role
    $administrators = get_users(array('role' => 'administrator'));
    
    foreach ($administrators as $admin) {
        // Ensure administrators have all necessary capabilities
        $capabilities = array(
            'publish_posts',
            'edit_posts',
            'delete_posts',
            'edit_others_posts',
            'delete_others_posts',
            'upload_files',
            'edit_pages',
            'edit_others_pages',
            'publish_pages',
            'delete_pages',
            'delete_others_pages'
        );
        
        foreach ($capabilities as $cap) {
            if (!$admin->has_cap($cap)) {
                $admin->add_cap($cap);
            }
        }
    }
});

// Enhanced logging for authentication events
add_action('wp_login_failed', function($username) {
    // Sanitize username before logging
    $safe_username = sanitize_user($username);
    error_log(sprintf(
        'MCP API Enabler: Login failed for user "%s" from IP %s',
        $safe_username,
        $_SERVER['REMOTE_ADDR'] ?? 'unknown'
    ));
});

add_action('wp_login', function($user_login, $user) {
    error_log(sprintf(
        'MCP API Enabler: Login successful for user "%s" (ID: %d) from IP %s',
        $user_login,
        $user->ID,
        $_SERVER['REMOTE_ADDR'] ?? 'unknown'
    ));
}, 10, 2);

// Add plugin activation hook to set default options
register_activation_hook(__FILE__, function() {
    // Set default allowed origins for development
    if (!get_option('mcp_api_allowed_origins')) {
        if (defined('WP_DEBUG') && WP_DEBUG) {
            update_option('mcp_api_allowed_origins', "http://localhost:3000\nhttp://localhost:8080\nhttp://localhost:8090");
        }
    }
});
?>