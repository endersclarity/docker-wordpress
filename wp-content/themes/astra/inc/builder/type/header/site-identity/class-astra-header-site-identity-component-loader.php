<?php
/**
 * Site_Identity Styling Loader for Astra theme.
 *
 * @package     astra-builder
 * @link        https://wpastra.com/
 * @since 3.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Customizer Initialization
 *
 * @since 3.0.0
 */
class Astra_Header_Site_Identity_Component_Loader {
	/**
	 * Constructor
	 *
	 * @since 3.0.0
	 */
	public function __construct() {
		add_action( 'customize_preview_init', array( $this, 'preview_scripts' ), 110 );
	}

	/**
	 * Customizer Preview
	 *
	 * @since 3.0.0
	 */
	public function preview_scripts() {
		/**
		 * Load unminified if SCRIPT_DEBUG is true.
		 */
		/* Directory and Extension */
		$dir_name    = SCRIPT_DEBUG ? 'unminified' : 'minified';
		$file_prefix = SCRIPT_DEBUG ? '' : '.min';
		wp_enqueue_script( 'astra-site-identity-customizer-preview-js', ASTRA_HEADER_SITE_IDENTITY_URI . '/assets/js/' . $dir_name . '/customizer-preview' . $file_prefix . '.js', array( 'customize-preview', 'astra-customizer-preview-js' ), ASTRA_THEME_VERSION, true );
	}
}

/**
 *  Kicking this off by creating the object of the class.
 */
new Astra_Header_Site_Identity_Component_Loader();
