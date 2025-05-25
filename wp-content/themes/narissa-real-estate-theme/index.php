<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Narissa Jennings - Premium Real Estate Services in Grass Valley & Nevada City, CA. Coldwell Banker specialist with exceptional local market expertise.">
    
    <!-- Luxury Typography Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@300;400;500;600&family=Inter:wght@300;400;500;600;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&display=swap" rel="stylesheet">
    
    <title><?php wp_title('|', true, 'right'); ?><?php bloginfo('name'); ?></title>
    
    <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>

<!-- Luxury Page Loader -->
<div class="page-loader" id="pageLoader">
    <div class="loader-content">
        <div class="loader-logo">Narissa Jennings</div>
        <div style="color: #f7f5f3; font-family: var(--font-secondary); font-size: 0.9rem; letter-spacing: 0.2em; margin-top: 1rem; text-transform: uppercase;">Real Estate Excellence</div>
    </div>
</div>

<!-- Sophisticated Navigation -->
<nav class="main-navigation">
    <div class="nav-container">
        <a href="#home" class="logo">Narissa Jennings</a>
        <ul class="nav-menu">
            <li><a href="#home">Home</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#services">Services</a></li>
            <li><a href="#testimonials">Testimonials</a></li>
            <li><a href="#contact">Contact</a></li>
        </ul>
    </div>
</nav>

<!-- Hero Section (Above the Clouds Inspired) -->
<section id="home" class="hero-section">
    <div class="hero-background"></div>
    <div class="hero-content">
        <div class="hero-badge">Coldwell Banker Real Estate LLC</div>
        <h1 class="hero-title">Narissa Jennings</h1>
        <p class="subtitle">Premium Real Estate Excellence</p>
        <p class="hero-description">
            Discover luxury living in Grass Valley & Nevada City with Nevada County's most trusted real estate specialist. 
            Experience unparalleled service, local expertise, and a commitment to exceeding your expectations.
        </p>
        <a href="#contact" class="cta-button">Start Your Journey</a>
    </div>
</section>

<!-- About Section (Saisei Minimalism) -->
<section id="about" class="section section-cream">
    <div class="container">
        <div style="max-width: 800px; margin: 0 auto; text-align: center;">
            <h2 style="color: var(--primary-dark); margin-bottom: 2rem;">Local Expertise, Global Standards</h2>
            <p style="font-size: 1.2rem; line-height: 1.8; color: var(--text-muted); margin-bottom: 3rem;">
                With deep roots in Nevada County and years of experience with Coldwell Banker Real Estate LLC, 
                I bring unmatched local market knowledge combined with world-class service standards. 
                Every client receives personalized attention and strategic guidance tailored to their unique real estate goals.
            </p>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 3rem; margin-top: 4rem;">
                <div style="text-align: center;">
                    <h3 style="color: var(--accent-gold); margin-bottom: 1rem;">Local Market Expert</h3>
                    <p style="color: var(--text-muted);">Intimate knowledge of Grass Valley & Nevada City neighborhoods, pricing trends, and market opportunities.</p>
                </div>
                <div style="text-align: center;">
                    <h3 style="color: var(--accent-gold); margin-bottom: 1rem;">Responsive Service</h3>
                    <p style="color: var(--text-muted);">Quick communication, prompt follow-up, and always available when you need guidance or support.</p>
                </div>
                <div style="text-align: center;">
                    <h3 style="color: var(--accent-gold); margin-bottom: 1rem;">Proven Results</h3>
                    <p style="color: var(--text-muted);">Successful transactions, satisfied clients, and a reputation built on integrity and excellence.</p>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- Services Section -->
<section id="services" class="section section-dark">
    <div class="container">
        <div style="text-align: center; margin-bottom: 4rem;">
            <h2 style="color: var(--text-light);">Comprehensive Real Estate Services</h2>
            <p style="font-size: 1.2rem; color: rgba(255, 255, 255, 0.8); max-width: 600px; margin: 0 auto;">
                From first-time buyers to luxury estates, I provide full-service real estate solutions 
                tailored to your specific needs in Nevada County.
            </p>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 3rem;">
            <div style="background: rgba(255, 255, 255, 0.05); padding: 3rem; border-radius: var(--border-radius); border: 1px solid rgba(255, 255, 255, 0.1);">
                <h3 style="color: var(--accent-gold); margin-bottom: 1.5rem;">Buyer Representation</h3>
                <p style="color: rgba(255, 255, 255, 0.9); line-height: 1.7;">
                    Expert guidance through every step of the home buying process. Market analysis, 
                    property search, negotiation, and closing support in Grass Valley and Nevada City.
                </p>
            </div>
            
            <div style="background: rgba(255, 255, 255, 0.05); padding: 3rem; border-radius: var(--border-radius); border: 1px solid rgba(255, 255, 255, 0.1);">
                <h3 style="color: var(--accent-gold); margin-bottom: 1.5rem;">Seller Representation</h3>
                <p style="color: rgba(255, 255, 255, 0.9); line-height: 1.7;">
                    Strategic marketing, professional staging guidance, and skilled negotiation to 
                    maximize your property's value and minimize time on market.
                </p>
            </div>
            
            <div style="background: rgba(255, 255, 255, 0.05); padding: 3rem; border-radius: var(--border-radius); border: 1px solid rgba(255, 255, 255, 0.1);">
                <h3 style="color: var(--accent-gold); margin-bottom: 1.5rem;">Market Analysis</h3>
                <p style="color: rgba(255, 255, 255, 0.9); line-height: 1.7;">
                    Comprehensive market reports, pricing strategies, and investment analysis 
                    based on deep local knowledge and current market conditions.
                </p>
            </div>
        </div>
    </div>
</section>

<!-- Testimonials Section (Trust & Credibility) -->
<section id="testimonials" class="testimonials-section section">
    <div class="container">
        <div style="text-align: center; margin-bottom: 4rem;">
            <h2>What Clients Say</h2>
            <p style="font-size: 1.2rem; color: rgba(255, 255, 255, 0.8); max-width: 600px; margin: 0 auto;">
                Real experiences from satisfied clients who trusted me with their most important real estate decisions.
            </p>
        </div>
        
        <div class="testimonials-grid">
            <div class="testimonial-card">
                <p class="testimonial-text">
                    "Narissa was incredibly responsive and knowledgeable about the local market. 
                    She helped us find the perfect home in Nevada City and made the entire process smooth and stress-free. 
                    Her attention to detail and personal service exceeded our expectations."
                </p>
                <div class="testimonial-author">Sarah & Michael Chen</div>
            </div>
            
            <div class="testimonial-card">
                <p class="testimonial-text">
                    "Working with Narissa was exceptional. She understood exactly what we were looking for 
                    and guided us through every step with patience and expertise. Her local knowledge of Grass Valley 
                    was invaluable in finding our dream property."
                </p>
                <div class="testimonial-author">Jennifer Martinez</div>
            </div>
            
            <div class="testimonial-card">
                <p class="testimonial-text">
                    "Narissa's professionalism and market insight helped us sell our home quickly and at a great price. 
                    She was always available to answer questions and provided excellent guidance throughout the process. 
                    Highly recommended for anyone buying or selling in Nevada County."
                </p>
                <div class="testimonial-author">Robert & Linda Thompson</div>
            </div>
        </div>
    </div>
</section>

<!-- Contact Section -->
<section id="contact" class="section section-cream">
    <div class="container">
        <div style="max-width: 800px; margin: 0 auto; text-align: center;">
            <h2 style="color: var(--primary-dark); margin-bottom: 2rem;">Ready to Begin Your Real Estate Journey?</h2>
            <p style="font-size: 1.2rem; line-height: 1.8; color: var(--text-muted); margin-bottom: 3rem;">
                Contact me today for a personalized consultation. Let's discuss your real estate goals 
                and how I can help you achieve them in Nevada County's beautiful communities.
            </p>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 3rem; margin: 3rem 0;">
                <div style="text-align: center;">
                    <h3 style="color: var(--accent-gold); margin-bottom: 1rem;">Office</h3>
                    <p style="color: var(--text-dark); font-weight: 500;">Coldwell Banker Real Estate LLC</p>
                    <p style="color: var(--text-muted);">Serving Grass Valley & Nevada City</p>
                </div>
                
                <div style="text-align: center;">
                    <h3 style="color: var(--accent-gold); margin-bottom: 1rem;">Service Area</h3>
                    <p style="color: var(--text-dark); font-weight: 500;">Nevada County, California</p>
                    <p style="color: var(--text-muted);">Grass Valley • Nevada City • Surrounding Areas</p>
                </div>
                
                <div style="text-align: center;">
                    <h3 style="color: var(--accent-gold); margin-bottom: 1rem;">Contact</h3>
                    <p style="color: var(--text-dark); font-weight: 500;">Narissa Jennings</p>
                    <p style="color: var(--text-muted);">Real Estate Professional</p>
                </div>
            </div>
            
            <a href="mailto:narissa@coldwellbanker.com" class="cta-button" style="margin-top: 2rem;">Get In Touch</a>
        </div>
    </div>
</section>

<!-- Footer -->
<footer class="section-dark" style="padding: 3rem 0; text-align: center;">
    <div class="container">
        <p style="color: rgba(255, 255, 255, 0.7); font-size: 0.9rem;">
            © <?php echo date('Y'); ?> Narissa Jennings, Coldwell Banker Real Estate LLC. All rights reserved.
        </p>
        <p style="color: rgba(255, 255, 255, 0.5); font-size: 0.8rem; margin-top: 1rem;">
            Premium Real Estate Services • Nevada County, California
        </p>
    </div>
</footer>

<!-- Luxury JavaScript -->
<script>
// Page loader with luxury timing
window.addEventListener('load', function() {
    setTimeout(function() {
        const loader = document.getElementById('pageLoader');
        loader.style.opacity = '0';
        setTimeout(function() {
            loader.style.display = 'none';
        }, 500);
    }, 1500);
});

// Smooth scrolling for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navigation background on scroll
window.addEventListener('scroll', function() {
    const nav = document.querySelector('.main-navigation');
    if (window.scrollY > 100) {
        nav.style.background = 'rgba(26, 26, 26, 0.95)';
    } else {
        nav.style.background = 'rgba(26, 26, 26, 0.9)';
    }
});

// Parallax effect for hero background
window.addEventListener('scroll', function() {
    const heroBackground = document.querySelector('.hero-background');
    const scrolled = window.pageYOffset;
    if (heroBackground) {
        heroBackground.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});
</script>

<?php wp_footer(); ?>
</body>
</html>