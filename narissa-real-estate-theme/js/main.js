/**
 * Narissa Jennings Real Estate - Main JavaScript
 * Premium interactions and animations
 */

(function($) {
    'use strict';

    // Document ready
    $(document).ready(function() {
        initializeNarissaTheme();
    });

    /**
     * Initialize all theme functionality
     */
    function initializeNarissaTheme() {
        initLuxuryLoader();
        initSmoothScrolling();
        initNavigationEffects();
        initParallaxEffects();
        initPropertyGalleries();
        initContactForm();
        initAnimationsOnScroll();
        initTestimonialCarousel();
    }

    /**
     * Luxury Page Loader
     */
    function initLuxuryLoader() {
        $(window).on('load', function() {
            setTimeout(function() {
                $('#pageLoader').fadeOut(800, function() {
                    $('body').addClass('loaded');
                    initRevealAnimations();
                });
            }, 1200);
        });
    }

    /**
     * Smooth Scrolling Navigation
     */
    function initSmoothScrolling() {
        $('a[href^="#"]').on('click', function(e) {
            e.preventDefault();
            
            const target = $(this.getAttribute('href'));
            if (target.length) {
                $('html, body').animate({
                    scrollTop: target.offset().top - 80
                }, 800, 'easeInOutCubic');
            }
        });

        // Custom easing function
        $.easing.easeInOutCubic = function(x, t, b, c, d) {
            if ((t/=d/2) < 1) return c/2*t*t*t + b;
            return c/2*((t-=2)*t*t + 2) + b;
        };
    }

    /**
     * Navigation Effects
     */
    function initNavigationEffects() {
        let lastScrollTop = 0;
        const nav = $('.main-navigation');
        
        $(window).on('scroll', function() {
            const scrollTop = $(this).scrollTop();
            
            // Navigation background opacity
            if (scrollTop > 100) {
                nav.css('background', 'rgba(26, 26, 26, 0.95)');
                nav.css('backdrop-filter', 'blur(20px)');
            } else {
                nav.css('background', 'rgba(26, 26, 26, 0.9)');
                nav.css('backdrop-filter', 'blur(10px)');
            }
            
            // Hide/show navigation on scroll
            if (scrollTop > lastScrollTop && scrollTop > 200) {
                nav.css('transform', 'translateY(-100%)');
            } else {
                nav.css('transform', 'translateY(0)');
            }
            
            lastScrollTop = scrollTop;
        });

        // Active navigation highlighting
        const sections = $('section[id]');
        $(window).on('scroll', function() {
            const scrollPos = $(window).scrollTop() + 100;
            
            sections.each(function() {
                const section = $(this);
                const sectionTop = section.offset().top;
                const sectionHeight = section.height();
                const sectionId = section.attr('id');
                
                if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                    $('.nav-menu a').removeClass('active');
                    $('.nav-menu a[href="#' + sectionId + '"]').addClass('active');
                }
            });
        });
    }

    /**
     * Parallax Effects
     */
    function initParallaxEffects() {
        $(window).on('scroll', function() {
            const scrolled = $(window).scrollTop();
            const parallax = $('.hero-background');
            const speed = 0.5;
            
            parallax.css('transform', 'translateY(' + (scrolled * speed) + 'px)');
        });

        // Parallax for other elements
        $('.parallax-element').each(function() {
            const element = $(this);
            const speed = element.data('speed') || 0.3;
            
            $(window).on('scroll', function() {
                const scrolled = $(window).scrollTop();
                const elementTop = element.offset().top;
                const windowHeight = $(window).height();
                
                if (scrolled + windowHeight > elementTop) {
                    const yPos = -(scrolled - elementTop) * speed;
                    element.css('transform', 'translateY(' + yPos + 'px)');
                }
            });
        });
    }

    /**
     * Property Galleries
     */
    function initPropertyGalleries() {
        // Property image lightbox
        if (typeof lightbox !== 'undefined') {
            lightbox.option({
                'resizeDuration': 200,
                'wrapAround': true,
                'showImageNumberLabel': false
            });
        }

        // Property grid hover effects
        $('.property-card').on('mouseenter', function() {
            $(this).find('.property-image').css('transform', 'scale(1.05)');
            $(this).find('.property-overlay').css('opacity', '1');
        }).on('mouseleave', function() {
            $(this).find('.property-image').css('transform', 'scale(1)');
            $(this).find('.property-overlay').css('opacity', '0');
        });
    }

    /**
     * Contact Form Enhancement
     */
    function initContactForm() {
        const contactForm = $('#narissa-contact');
        
        contactForm.on('submit', function(e) {
            e.preventDefault();
            
            const form = $(this);
            const submitBtn = form.find('button[type="submit"]');
            const originalText = submitBtn.text();
            
            // Validate form
            if (!validateContactForm(form)) {
                return;
            }
            
            // Show loading state
            submitBtn.text('Sending...').prop('disabled', true);
            
            // Simulate form submission (replace with actual AJAX)
            setTimeout(function() {
                showContactSuccess();
                form[0].reset();
                submitBtn.text(originalText).prop('disabled', false);
            }, 2000);
        });

        // Real-time validation
        contactForm.find('input[required], textarea[required]').on('blur', function() {
            validateField($(this));
        });
    }

    /**
     * Validate Contact Form
     */
    function validateContactForm(form) {
        let isValid = true;
        
        form.find('input[required], textarea[required]').each(function() {
            if (!validateField($(this))) {
                isValid = false;
            }
        });
        
        return isValid;
    }

    /**
     * Validate Individual Field
     */
    function validateField(field) {
        const value = field.val().trim();
        const fieldType = field.attr('type');
        let isValid = true;
        
        // Remove existing error styling
        field.removeClass('error');
        field.next('.error-message').remove();
        
        // Required field validation
        if (field.prop('required') && !value) {
            isValid = false;
            showFieldError(field, 'This field is required.');
        }
        
        // Email validation
        if (fieldType === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                showFieldError(field, 'Please enter a valid email address.');
            }
        }
        
        return isValid;
    }

    /**
     * Show Field Error
     */
    function showFieldError(field, message) {
        field.addClass('error');
        $('<div class="error-message" style="color: #e74c3c; font-size: 0.9rem; margin-top: 0.5rem;">' + message + '</div>')
            .insertAfter(field);
    }

    /**
     * Show Contact Success Message
     */
    function showContactSuccess() {
        const successMessage = $('<div class="success-message" style="background: #27ae60; color: white; padding: 1rem; border-radius: 4px; margin: 1rem 0; text-align: center;">Thank you! Your message has been sent successfully. I\'ll get back to you soon.</div>');
        
        $('#narissa-contact').before(successMessage);
        
        setTimeout(function() {
            successMessage.fadeOut(500, function() {
                $(this).remove();
            });
        }, 5000);
    }

    /**
     * Animations on Scroll
     */
    function initAnimationsOnScroll() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // Observe elements for animation
        document.querySelectorAll('.animate-on-scroll').forEach(function(el) {
            observer.observe(el);
        });
    }

    /**
     * Testimonial Carousel
     */
    function initTestimonialCarousel() {
        const testimonials = $('.testimonial-card');
        let currentTestimonial = 0;
        
        if (testimonials.length > 1) {
            // Auto-rotate testimonials on mobile
            if ($(window).width() <= 768) {
                setInterval(function() {
                    testimonials.removeClass('active');
                    currentTestimonial = (currentTestimonial + 1) % testimonials.length;
                    testimonials.eq(currentTestimonial).addClass('active');
                }, 5000);
            }
        }
    }

    /**
     * Reveal Animations
     */
    function initRevealAnimations() {
        // Stagger animation for elements
        $('.stagger-animation').each(function(index) {
            const element = $(this);
            setTimeout(function() {
                element.addClass('animate-in');
            }, index * 100);
        });
    }

    /**
     * Utility Functions
     */
    
    // Debounce function for performance
    function debounce(func, wait, immediate) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            const later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    }

    // Throttle function for scroll events
    function throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Use throttled scroll for performance
    $(window).on('scroll', throttle(function() {
        // Scroll-dependent functions are called here
    }, 16)); // ~60fps

})(jQuery);

/**
 * CSS Custom Properties for JavaScript animations
 */
document.documentElement.style.setProperty('--js-scroll-y', '0px');

window.addEventListener('scroll', function() {
    document.documentElement.style.setProperty('--js-scroll-y', window.scrollY + 'px');
});

/**
 * Custom CSS for animations
 */
const animationStyles = `
<style>
.animate-on-scroll {
    opacity: 0;
    transform: translateY(30px);
    transition: all 0.8s ease-out;
}

.animate-on-scroll.animate-in {
    opacity: 1;
    transform: translateY(0);
}

.stagger-animation {
    opacity: 0;
    transform: translateY(20px);
    transition: all 0.6s ease-out;
}

.stagger-animation.animate-in {
    opacity: 1;
    transform: translateY(0);
}

.error {
    border-color: #e74c3c !important;
    box-shadow: 0 0 0 2px rgba(231, 76, 60, 0.2) !important;
}

body.loaded .hero-content > * {
    animation: fadeInUp 1s ease-out forwards;
    opacity: 0;
}

body.loaded .hero-content > *:nth-child(1) { animation-delay: 0.2s; }
body.loaded .hero-content > *:nth-child(2) { animation-delay: 0.4s; }
body.loaded .hero-content > *:nth-child(3) { animation-delay: 0.6s; }
body.loaded .hero-content > *:nth-child(4) { animation-delay: 0.8s; }
body.loaded .hero-content > *:nth-child(5) { animation-delay: 1s; }

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.nav-menu a.active {
    color: var(--accent-gold);
}

.nav-menu a.active::after {
    width: 100%;
}

@media (max-width: 768px) {
    .testimonial-card {
        display: none;
    }
    
    .testimonial-card.active,
    .testimonial-card:first-child {
        display: block;
    }
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', animationStyles);