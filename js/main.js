document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.main-nav');
    const body = document.body;

    if (hamburger) {
        hamburger.addEventListener('click', function() {
            this.classList.toggle('active');
            navMenu.classList.toggle('active');
            body.classList.toggle('menu-open');
        });
    }

    // Close mobile menu when clicking on a nav link
    const navLinks = document.querySelectorAll('.main-nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (hamburger.classList.contains('active')) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                body.classList.remove('menu-open');
            }
        });
    });

    // Add to cart functionality
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    const cartCount = document.querySelector('.cart-count');
    let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];

    // Update cart count on page load
    updateCartCount();

    addToCartButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const product = this.getAttribute('data-product');
            
            // Add to cart
            cartItems.push(product);
            localStorage.setItem('cartItems', JSON.stringify(cartItems));
            
            // Update cart count
            updateCartCount();
            
            // Show added to cart message
            showNotification('Added to cart!');
        });
    });

    // Update cart count function
    function updateCartCount() {
        if (cartCount) {
            cartCount.textContent = cartItems.length;
        }
    }

    // Show notification function
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Add show class after a small delay
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 100, // Account for fixed header
                    behavior: 'smooth'
                });
            }
        });
    });

    // Newsletter form submission
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = this.querySelector('input[type="email"]');
            const email = emailInput.value.trim();
            
            if (validateEmail(email)) {
                // Here you would typically send this to your server
                showNotification('Thank you for subscribing!');
                emailInput.value = '';
            } else {
                showNotification('Please enter a valid email address');
            }
        });
    }

    // Email validation helper function
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    }

    // Add animation on scroll
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.feature, .product-card, .section-header');
        
        elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementTop < windowHeight - 100) {
                element.classList.add('animate');
            }
        });
    };

    // Run once on page load
    animateOnScroll();
    
    // Run on scroll
    window.addEventListener('scroll', animateOnScroll);

    // Add animation classes to features on page load
    const features = document.querySelectorAll('.feature');
    features.forEach((feature, index) => {
        feature.style.transitionDelay = `${index * 0.1}s`;
    });
});

// Add CSS for notification
const style = document.createElement('style');
style.textContent = `
    .notification {
        position: fixed;
        bottom: 30px;
        right: 30px;
        background-color: var(--color-primary);
        color: var(--color-darker);
        padding: 15px 25px;
        border-radius: 4px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 1000;
        transform: translateY(100px);
        opacity: 0;
        transition: transform 0.3s ease, opacity 0.3s ease;
        font-weight: 500;
    }
    
    .notification.show {
        transform: translateY(0);
        opacity: 1;
    }
    
    /* Animation classes */
    .feature, .product-card, .section-header {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }
    
    .feature.animate, .product-card.animate, .section-header.animate {
        opacity: 1;
        transform: translateY(0);
    }
`;
document.head.appendChild(style);
