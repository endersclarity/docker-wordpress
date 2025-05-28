<?php
/**
 * Narissa Jennings Real Estate Theme Functions
 * Premium real estate website functionality
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Theme Setup
 */
function narissa_theme_setup() {
    // Add theme support for various features
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('custom-logo');
    add_theme_support('html5', array(
        'search-form',
        'comment-form',
        'comment-list',
        'gallery',
        'caption',
    ));
    
    // Add custom image sizes for property galleries
    add_image_size('property-hero', 1920, 1080, true);
    add_image_size('property-thumbnail', 400, 300, true);
    add_image_size('testimonial-avatar', 80, 80, true);
}
add_action('after_setup_theme', 'narissa_theme_setup');

/**
 * Enqueue Styles and Scripts
 */
function narissa_theme_scripts() {
    // Main theme stylesheet
    wp_enqueue_style('narissa-style', get_stylesheet_uri(), array(), '1.0.0');
    
    // Google Fonts for luxury typography
    wp_enqueue_style('narissa-fonts', 
        'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@300;400;500;600&family=Inter:wght@300;400;500;600;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&display=swap',
        array(), '1.0.0'
    );
    
    // Custom JavaScript for interactions
    wp_enqueue_script('narissa-js', get_template_directory_uri() . '/js/main.js', array('jquery'), '1.0.0', true);
    
    // Localize script for AJAX functionality
    wp_localize_script('narissa-js', 'narissa_ajax', array(
        'ajax_url' => admin_url('admin-ajax.php'),
        'nonce' => wp_create_nonce('narissa_nonce')
    ));
}
add_action('wp_enqueue_scripts', 'narissa_theme_scripts');

/**
 * Custom Post Types for Real Estate
 */
function narissa_custom_post_types() {
    // Properties Post Type
    register_post_type('property', array(
        'labels' => array(
            'name' => 'Properties',
            'singular_name' => 'Property',
            'add_new' => 'Add New Property',
            'add_new_item' => 'Add New Property',
            'edit_item' => 'Edit Property',
            'new_item' => 'New Property',
            'view_item' => 'View Property',
            'search_items' => 'Search Properties',
            'not_found' => 'No properties found',
            'not_found_in_trash' => 'No properties found in trash'
        ),
        'public' => true,
        'has_archive' => true,
        'rewrite' => array('slug' => 'properties'),
        'supports' => array('title', 'editor', 'thumbnail', 'custom-fields'),
        'menu_icon' => 'dashicons-admin-home',
        'show_in_rest' => true
    ));
    
    // Testimonials Post Type
    register_post_type('testimonial', array(
        'labels' => array(
            'name' => 'Testimonials',
            'singular_name' => 'Testimonial',
            'add_new' => 'Add New Testimonial',
            'add_new_item' => 'Add New Testimonial',
            'edit_item' => 'Edit Testimonial',
            'new_item' => 'New Testimonial',
            'view_item' => 'View Testimonial',
            'search_items' => 'Search Testimonials',
            'not_found' => 'No testimonials found',
            'not_found_in_trash' => 'No testimonials found in trash'
        ),
        'public' => true,
        'has_archive' => false,
        'supports' => array('title', 'editor', 'thumbnail'),
        'menu_icon' => 'dashicons-format-quote',
        'show_in_rest' => true
    ));
}
add_action('init', 'narissa_custom_post_types');

/**
 * Custom Taxonomies
 */
function narissa_custom_taxonomies() {
    // Property Types
    register_taxonomy('property_type', 'property', array(
        'labels' => array(
            'name' => 'Property Types',
            'singular_name' => 'Property Type',
            'search_items' => 'Search Property Types',
            'all_items' => 'All Property Types',
            'edit_item' => 'Edit Property Type',
            'update_item' => 'Update Property Type',
            'add_new_item' => 'Add New Property Type',
            'new_item_name' => 'New Property Type Name',
            'menu_name' => 'Property Types'
        ),
        'hierarchical' => true,
        'rewrite' => array('slug' => 'property-type'),
        'show_in_rest' => true
    ));
    
    // Property Status
    register_taxonomy('property_status', 'property', array(
        'labels' => array(
            'name' => 'Property Status',
            'singular_name' => 'Property Status',
            'search_items' => 'Search Property Status',
            'all_items' => 'All Property Status',
            'edit_item' => 'Edit Property Status',
            'update_item' => 'Update Property Status',
            'add_new_item' => 'Add New Property Status',
            'new_item_name' => 'New Property Status Name',
            'menu_name' => 'Property Status'
        ),
        'hierarchical' => false,
        'rewrite' => array('slug' => 'status'),
        'show_in_rest' => true
    ));
}
add_action('init', 'narissa_custom_taxonomies');

/**
 * Add Custom Meta Boxes for Properties
 */
function narissa_property_meta_boxes() {
    add_meta_box(
        'property_details',
        'Property Details',
        'narissa_property_details_callback',
        'property',
        'normal',
        'high'
    );
}
add_action('add_meta_boxes', 'narissa_property_meta_boxes');

/**
 * Property Details Meta Box Callback
 */
function narissa_property_details_callback($post) {
    wp_nonce_field('narissa_property_details', 'narissa_property_nonce');
    
    $price = get_post_meta($post->ID, '_property_price', true);
    $bedrooms = get_post_meta($post->ID, '_property_bedrooms', true);
    $bathrooms = get_post_meta($post->ID, '_property_bathrooms', true);
    $square_feet = get_post_meta($post->ID, '_property_square_feet', true);
    $lot_size = get_post_meta($post->ID, '_property_lot_size', true);
    $address = get_post_meta($post->ID, '_property_address', true);
    ?>
    <table class="form-table">
        <tr>
            <th><label for="property_price">Price</label></th>
            <td><input type="text" id="property_price" name="property_price" value="<?php echo esc_attr($price); ?>" /></td>
        </tr>
        <tr>
            <th><label for="property_bedrooms">Bedrooms</label></th>
            <td><input type="number" id="property_bedrooms" name="property_bedrooms" value="<?php echo esc_attr($bedrooms); ?>" /></td>
        </tr>
        <tr>
            <th><label for="property_bathrooms">Bathrooms</label></th>
            <td><input type="number" step="0.5" id="property_bathrooms" name="property_bathrooms" value="<?php echo esc_attr($bathrooms); ?>" /></td>
        </tr>
        <tr>
            <th><label for="property_square_feet">Square Feet</label></th>
            <td><input type="number" id="property_square_feet" name="property_square_feet" value="<?php echo esc_attr($square_feet); ?>" /></td>
        </tr>
        <tr>
            <th><label for="property_lot_size">Lot Size</label></th>
            <td><input type="text" id="property_lot_size" name="property_lot_size" value="<?php echo esc_attr($lot_size); ?>" /></td>
        </tr>
        <tr>
            <th><label for="property_address">Address</label></th>
            <td><textarea id="property_address" name="property_address" rows="3" cols="50"><?php echo esc_textarea($address); ?></textarea></td>
        </tr>
    </table>
    <?php
}

/**
 * Save Property Meta Box Data
 */
function narissa_save_property_meta($post_id) {
    if (!isset($_POST['narissa_property_nonce']) || !wp_verify_nonce($_POST['narissa_property_nonce'], 'narissa_property_details')) {
        return;
    }
    
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
        return;
    }
    
    if (!current_user_can('edit_post', $post_id)) {
        return;
    }
    
    $fields = array(
        'property_price',
        'property_bedrooms',
        'property_bathrooms',
        'property_square_feet',
        'property_lot_size',
        'property_address'
    );
    
    foreach ($fields as $field) {
        if (isset($_POST[$field])) {
            update_post_meta($post_id, '_' . $field, sanitize_text_field($_POST[$field]));
        }
    }
}
add_action('save_post', 'narissa_save_property_meta');

/**
 * Contact Form Shortcode
 */
function narissa_contact_form_shortcode($atts) {
    $atts = shortcode_atts(array(
        'title' => 'Contact Narissa',
        'subtitle' => 'Ready to start your real estate journey?'
    ), $atts);
    
    ob_start();
    ?>
    <div class="narissa-contact-form">
        <div style="text-align: center; margin-bottom: 3rem;">
            <h3 style="color: var(--primary-dark); margin-bottom: 1rem;"><?php echo esc_html($atts['title']); ?></h3>
            <p style="color: var(--text-muted); font-size: 1.1rem;"><?php echo esc_html($atts['subtitle']); ?></p>
        </div>
        
        <form id="narissa-contact" method="post" style="max-width: 600px; margin: 0 auto;">
            <?php wp_nonce_field('narissa_contact_form', 'narissa_contact_nonce'); ?>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
                <div>
                    <label for="contact_name" style="display: block; margin-bottom: 0.5rem; color: var(--text-dark); font-weight: 500;">Name *</label>
                    <input type="text" id="contact_name" name="contact_name" required 
                           style="width: 100%; padding: 1rem; border: 1px solid #ddd; border-radius: var(--border-radius); font-family: var(--font-secondary);">
                </div>
                <div>
                    <label for="contact_email" style="display: block; margin-bottom: 0.5rem; color: var(--text-dark); font-weight: 500;">Email *</label>
                    <input type="email" id="contact_email" name="contact_email" required 
                           style="width: 100%; padding: 1rem; border: 1px solid #ddd; border-radius: var(--border-radius); font-family: var(--font-secondary);">
                </div>
            </div>
            
            <div style="margin-bottom: 1.5rem;">
                <label for="contact_phone" style="display: block; margin-bottom: 0.5rem; color: var(--text-dark); font-weight: 500;">Phone</label>
                <input type="tel" id="contact_phone" name="contact_phone" 
                       style="width: 100%; padding: 1rem; border: 1px solid #ddd; border-radius: var(--border-radius); font-family: var(--font-secondary);">
            </div>
            
            <div style="margin-bottom: 1.5rem;">
                <label for="contact_subject" style="display: block; margin-bottom: 0.5rem; color: var(--text-dark); font-weight: 500;">Subject</label>
                <select id="contact_subject" name="contact_subject" 
                        style="width: 100%; padding: 1rem; border: 1px solid #ddd; border-radius: var(--border-radius); font-family: var(--font-secondary);">
                    <option value="">Select a topic...</option>
                    <option value="buying">Buying a Home</option>
                    <option value="selling">Selling a Home</option>
                    <option value="market_analysis">Market Analysis</option>
                    <option value="consultation">Free Consultation</option>
                    <option value="other">Other</option>
                </select>
            </div>
            
            <div style="margin-bottom: 2rem;">
                <label for="contact_message" style="display: block; margin-bottom: 0.5rem; color: var(--text-dark); font-weight: 500;">Message *</label>
                <textarea id="contact_message" name="contact_message" rows="5" required 
                          style="width: 100%; padding: 1rem; border: 1px solid #ddd; border-radius: var(--border-radius); font-family: var(--font-secondary); resize: vertical;"
                          placeholder="Tell me about your real estate goals..."></textarea>
            </div>
            
            <div style="text-align: center;">
                <button type="submit" class="cta-button">Send Message</button>
            </div>
        </form>
    </div>
    
    <style>
    @media (max-width: 768px) {
        .narissa-contact-form form > div:first-of-type {
            grid-template-columns: 1fr;
        }
    }
    </style>
    <?php
    return ob_get_clean();
}
add_shortcode('narissa_contact', 'narissa_contact_form_shortcode');

/**
 * Handle Contact Form Submission
 */
function narissa_handle_contact_form() {
    if (isset($_POST['contact_name']) && wp_verify_nonce($_POST['narissa_contact_nonce'], 'narissa_contact_form')) {
        
        $name = sanitize_text_field($_POST['contact_name']);
        $email = sanitize_email($_POST['contact_email']);
        $phone = sanitize_text_field($_POST['contact_phone']);
        $subject = sanitize_text_field($_POST['contact_subject']);
        $message = sanitize_textarea_field($_POST['contact_message']);
        
        // Prepare email
        $to = get_option('admin_email'); // You can change this to Narissa's email
        $email_subject = 'New Contact from Narissa Jennings Real Estate: ' . $subject;
        $email_body = "New contact form submission:\n\n";
        $email_body .= "Name: $name\n";
        $email_body .= "Email: $email\n";
        $email_body .= "Phone: $phone\n";
        $email_body .= "Subject: $subject\n\n";
        $email_body .= "Message:\n$message\n";
        
        $headers = array(
            'Content-Type: text/plain; charset=UTF-8',
            'From: ' . $name . ' <' . $email . '>',
            'Reply-To: ' . $email
        );
        
        // Send email
        $sent = wp_mail($to, $email_subject, $email_body, $headers);
        
        if ($sent) {
            wp_redirect(add_query_arg('contact', 'success', wp_get_referer()));
        } else {
            wp_redirect(add_query_arg('contact', 'error', wp_get_referer()));
        }
        exit;
    }
}
add_action('init', 'narissa_handle_contact_form');

/**
 * Admin Customizations
 */
function narissa_admin_styles() {
    echo '<style>
    .post-type-property .dashicons-admin-home:before,
    .post-type-testimonial .dashicons-format-quote:before {
        color: #d4af37;
    }
    </style>';
}
add_action('admin_head', 'narissa_admin_styles');

/**
 * Remove unnecessary WordPress features for cleaner admin
 */
function narissa_remove_menu_pages() {
    if (!current_user_can('administrator')) {
        remove_menu_page('edit-comments.php');
    }
}
add_action('admin_menu', 'narissa_remove_menu_pages');

/**
 * Custom login page styling
 */
function narissa_custom_login_styles() {
    ?>
    <style type="text/css">
    body.login {
        background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
    }
    .login h1 a {
        background-image: none;
        font-family: 'Playfair Display', serif;
        font-size: 2rem;
        color: #d4af37;
        text-decoration: none;
        width: auto;
        height: auto;
    }
    .login h1 a:before {
        content: 'Narissa Jennings Real Estate';
    }
    .login form {
        background: rgba(255, 255, 255, 0.95);
        border-radius: 8px;
    }
    .wp-core-ui .button-primary {
        background: #d4af37;
        border-color: #d4af37;
        text-shadow: none;
        box-shadow: none;
    }
    .wp-core-ui .button-primary:hover {
        background: #b8941f;
        border-color: #b8941f;
    }
    </style>
    <?php
}
add_action('login_enqueue_scripts', 'narissa_custom_login_styles');
?>