// =================================
// WARCHARGE Landing Page JavaScript
// =================================

// Handle missing images gracefully
document.addEventListener('DOMContentLoaded', () => {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        if (!img.hasAttribute('onerror')) {
            img.onerror = function() {
                this.style.opacity = '0.3';
                this.style.border = '2px dashed #444';
                console.warn('Image not found:', this.src);
            };
        }
    });
});

// Language detection and switching
let currentLanguage = 'en';

// Detect DACH region (Germany, Austria, Switzerland)
function detectLanguage() {
    const userLanguage = navigator.language || navigator.userLanguage;
    const countryCode = userLanguage.split('-')[1];
    
    // DACH region codes
    const dachRegions = ['DE', 'AT', 'CH'];
    
    if (dachRegions.includes(countryCode)) {
        currentLanguage = 'de';
    } else {
        currentLanguage = 'en';
    }
    
    applyLanguage(currentLanguage);
}

// Apply language to all elements
function applyLanguage(lang) {
    currentLanguage = lang;
    
    document.querySelectorAll('[data-en]').forEach(element => {
        const text = element.getAttribute(`data-${lang}`);
        if (text) {
            if (element.tagName === 'INPUT') {
                element.placeholder = text;
            } else {
                element.textContent = text;
            }
        }
    });
    
    // Update placeholders
    document.querySelectorAll('input[data-en-placeholder]').forEach(input => {
        const placeholder = input.getAttribute(`data-${lang}-placeholder`);
        if (placeholder) {
            input.placeholder = placeholder;
        }
    });
}

// Toggle language manually
document.addEventListener('DOMContentLoaded', () => {
    detectLanguage();
    
    const langToggle = document.getElementById('langToggle');
    if (langToggle) {
        langToggle.addEventListener('click', () => {
            currentLanguage = currentLanguage === 'en' ? 'de' : 'en';
            applyLanguage(currentLanguage);
        });
    }
});

// =================================
// NAVBAR CONDITIONAL VISIBILITY
// =================================

const navbar = document.getElementById('navbar');
let lastScrollPosition = 0;
let isNavbarVisible = true;

function handleNavbarVisibility() {
    const currentScroll = window.pageYOffset;
    
    // No scroll = transparent navbar background
    if (currentScroll <= 50) {
        navbar.classList.add('transparent');
        navbar.classList.remove('visible-opaque', 'shrunk');
    }
    // Any scroll = navbar appears with background
    else {
        navbar.classList.remove('transparent');
        navbar.classList.add('visible-opaque', 'shrunk');
    }
    
    lastScrollPosition = currentScroll;
}

// =================================
// STICKY FOOTER CTA
// =================================

const stickyFooterCTA = document.getElementById('stickyFooterCTA');

function handleStickyFooter() {
    const scrollPosition = window.pageYOffset;
    const heroSection = document.getElementById('hero');
    const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
    
    // Show sticky footer after scrolling past hero
    if (scrollPosition > heroBottom + 200) {
        stickyFooterCTA.classList.add('visible');
    } else {
        stickyFooterCTA.classList.remove('visible');
    }
}

// =================================
// HAMBURGER MENU
// =================================

const hamburgerBtn = document.getElementById('hamburgerBtn');
const sideMenu = document.getElementById('sideMenu');
const closeMenuBtn = document.getElementById('closeMenuBtn');

if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', () => {
        sideMenu.classList.add('active');
    });
}

if (closeMenuBtn) {
    closeMenuBtn.addEventListener('click', () => {
        sideMenu.classList.remove('active');
    });
}

// Close menu when clicking on menu items
document.querySelectorAll('.menu-list a').forEach(link => {
    link.addEventListener('click', () => {
        sideMenu.classList.remove('active');
    });
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    if (!sideMenu.contains(e.target) && !hamburgerBtn.contains(e.target)) {
        sideMenu.classList.remove('active');
    }
});

// =================================
// TESTIMONIALS CAROUSEL
// =================================

const testimonials = [
    {
        name: "MATILDA D.",
        quote: "It’s funny how something so small can change the whole mood of a day. You feel lighter, cooler more yourself. It’s not just a breeze, it's that peaceful, slowed-down feeling it produces. It's like the breeze understands you. That’s what I love the most about it. It’s a tiny piece of freedom I can hold in my hand every day.",
        credentials: "Creative Director · Style Founder",
        image: "assets/testimonial-matilda.jpg"
    },
    {
        name: "NAOTO F.",
        quote: "When an object fits naturally into daily life, you stop thinking about it, yet you’d miss it if it were gone. That’s the balance I respect. A device that moves the air softly, breezily even, intuitively it reminds you that comfort doesn’t need to make a hassle. It just needs to happen, at the right time, in the right way.",
        credentials: " Product Designer · MUJI Collaborator",
        image: "assets/testimonial-naoto.jpg"
    },
    {
        name: "DIETER R.",
        quote: "The best tools almost disappear — they simply work. Nothing excessive, nothing constrained, everything just so. Fresh air on demand is a small thing, but it’s also the essence of comfort. In an age that celebrates more, it’s the less that restores you. True luxury is found in what doesn’t ask for attention, but quietly makes life better.",
        credentials: "Industrial Designer · Minimalist Thinker",
        image: "assets/testimonial-dieter.jpg"
    }
];

let currentTestimonialIndex = 0;

function loadTestimonial(index) {
    const testimonial = testimonials[index];
    const content = document.querySelector('.testimonial-content');
    
    // Fade out
    content.classList.add('fade-out');
    
    setTimeout(() => {
        // Update content
        document.querySelector('.testimonial-quote').textContent = testimonial.quote;
        document.querySelector('.testimonial-signature').textContent = testimonial.name;
        document.querySelector('.testimonial-credentials').textContent = testimonial.credentials;
        document.querySelector('.testimonial-image').src = testimonial.image;
        document.querySelector('.testimonial-image').alt = testimonial.name;
        
        // Fade in
        content.classList.remove('fade-out');
        content.classList.add('fade-in');
        
        // Update active button
        document.querySelectorAll('.testimonial-nav-btn').forEach((btn, i) => {
            btn.classList.toggle('active', i === index);
        });
    }, 300);
}

// Navigation buttons
document.querySelectorAll('.testimonial-nav-btn').forEach((btn, index) => {
    btn.addEventListener('click', () => {
        currentTestimonialIndex = index;
        loadTestimonial(index);
    });
});

// Arrow controls
document.querySelector('.testimonial-prev')?.addEventListener('click', () => {
    currentTestimonialIndex = (currentTestimonialIndex - 1 + testimonials.length) % testimonials.length;
    loadTestimonial(currentTestimonialIndex);
});

document.querySelector('.testimonial-next')?.addEventListener('click', () => {
    currentTestimonialIndex = (currentTestimonialIndex + 1) % testimonials.length;
    loadTestimonial(currentTestimonialIndex);
});

// Load first testimonial on page load
window.addEventListener('DOMContentLoaded', () => {
    loadTestimonial(0);
});

// =================================
// VIDEO TESTIMONIALS CAROUSEL
// =================================

let currentVideoSlide = 0;
const videoCarouselTrack = document.querySelector('.video-carousel-track');
const dots = document.querySelectorAll('.carousel-pagination .dot');

function updateVideoCarousel() {
    const slideWidth = 100; // percentage
    if (videoCarouselTrack) {
        videoCarouselTrack.style.transform = `translateX(-${currentVideoSlide * slideWidth}%)`;
    }
    
    // Update dots
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentVideoSlide);
    });
}

// Auto-rotate video carousel
let videoCarouselInterval = setInterval(() => {
    currentVideoSlide = (currentVideoSlide + 1) % dots.length;
    updateVideoCarousel();
}, 5000);

// Manual dot navigation
dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
        currentVideoSlide = index;
        updateVideoCarousel();
        
        // Reset auto-rotate
        clearInterval(videoCarouselInterval);
        videoCarouselInterval = setInterval(() => {
            currentVideoSlide = (currentVideoSlide + 1) % dots.length;
            updateVideoCarousel();
        }, 5000);
    });
});

// =================================
// ADD TO CART CTA VIDEO CONTROL
// =================================
    // Video state management for #addtocart button
    (function() {
        const button = document.getElementById('addtocart-btn');
        if (!button) return;
  
        const idleVideo = button.querySelector('.btn-video-idle');
        const hoverVideo = button.querySelector('.btn-video-cart-hover');
        const activeVideo = button.querySelector('.btn-video-cart-active');
        
        let isHovering = false;
        let isPlayingActive = false;
  
        // Function to show only one video
        function showVideo(video) {
          [idleVideo, hoverVideo, activeVideo].forEach(v => {
            v.style.opacity = '0';
            v.pause();
          });
          
          if (video) {
            video.style.opacity = '1';
            video.currentTime = 0;
            video.play().catch(err => console.log('Video play error:', err));
          }
        }
  
        // Function to set idle state (100% opacity background, no video)
        function setIdleState() {
          [idleVideo, hoverVideo, activeVideo].forEach(v => {
            v.style.opacity = '0';
            v.pause();
          });
          button.style.backgroundColor = 'rgba(255, 179, 0, 1)'; // 100% opacity
        }
  
        // Function to set hover state
        function setHoverState() {
          if (isPlayingActive) return; // Don't interrupt active video
          button.style.backgroundColor = 'transparent';
          showVideo(hoverVideo);
        }
  
        // Function to set active state
        function setActiveState() {
          isPlayingActive = true;
          button.style.backgroundColor = 'transparent';
          showVideo(activeVideo);
        }
  
        // Initialize in idle state
        setIdleState();
  
        // Hover event
        button.addEventListener('mouseenter', function() {
          isHovering = true;
          if (!isPlayingActive) {
            setHoverState();
          }
        });
  
        // Leave event
        button.addEventListener('mouseleave', function() {
          isHovering = false;
          if (!isPlayingActive) {
            setIdleState();
          }
        });
  
        // Click event
        button.addEventListener('click', function(e) {
          setActiveState();
        });
  
        // When active video ends
        activeVideo.addEventListener('ended', function() {
          isPlayingActive = false;
          if (isHovering) {
            setHoverState();
          } else {
            setIdleState();
          }
        });
      })();

// =================================
// FAQ ACCORDION
// =================================

document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', () => {
        const faqItem = question.parentElement;
        const isActive = faqItem.classList.contains('active');
        
        // Close all FAQ items
        document.querySelectorAll('.faq-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Open clicked item if it wasn't active
        if (!isActive) {
            faqItem.classList.add('active');
        }
        
        // Update icon
        const icon = question.querySelector('.faq-icon');
        if (icon) {
            icon.textContent = isActive ? '+' : '×';
        }
    });
});

// =================================
// EMAIL SIGNUP FORM
// =================================

const signupForm = document.querySelector('.signup-form');
if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = signupForm.querySelector('input[type="email"]').value;
        
        // Here you would typically send the email to your backend
        console.log('Email submitted:', email);
        
        // Show success message
        alert(currentLanguage === 'en' 
            ? 'Thank you for subscribing! Check your email for confirmation.' 
            : 'Vielen Dank für Ihre Anmeldung! Überprüfen Sie Ihre E-Mail zur Bestätigung.');
        
        // Reset form
        signupForm.reset();
    });
}

// =================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// =================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        
        if (target) {
            const offsetTop = target.offsetTop - 100; // Account for fixed navbar
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// =================================
// SCROLL EVENT HANDLERS
// =================================

let scrollTimeout;

window.addEventListener('scroll', () => {
    // Clear timeout on scroll
    clearTimeout(scrollTimeout);
    
    // Set timeout to run functions
    scrollTimeout = setTimeout(() => {
        handleNavbarVisibility();
        handleStickyFooter();
    }, 10);
});

// Initial check on page load
window.addEventListener('load', () => {
    handleNavbarVisibility();
    handleStickyFooter();
});

// =================================
// SCROLL ANIMATIONS
// =================================

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-element');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe sections for fade-in animation
document.querySelectorAll('section').forEach(section => {
    observer.observe(section);
});


// =================================
// CHOOSE NOW BUTTON ARROW ANIMATION
// =================================

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.btn-choose').forEach(button => {
        button.addEventListener('click', function(e) {
            console.log('Button clicked!'); // Debug message
            
            // Add animation class
            this.classList.add('arrow-shoot');
            
            // Remove class after animation completes
            setTimeout(() => {
                this.classList.remove('arrow-shoot');
            }, 400);
        });
    });
});
// =================================
// CART FUNCTIONALITY (Basic)
// =================================

let cartCount = 0;
const cartCountElement = document.querySelector('.cart-count');

// Add to cart buttons
document.querySelectorAll('.btn-cta, .btn-hero, .btn-choose').forEach(btn => {
    btn.addEventListener('click', (e) => {
        // Don't add to cart if it's a link
        if (btn.tagName === 'A') return;
        
        cartCount++;
        if (cartCountElement) {
            cartCountElement.textContent = cartCount;
            
            // Add animation
            cartCountElement.style.transform = 'scale(1.5)';
            setTimeout(() => {
                cartCountElement.style.transform = 'scale(1)';
            }, 200);
        }
        
        // Show success message (you can replace with a better notification)
        const message = currentLanguage === 'en' 
            ? 'Added to cart!' 
            : 'Zum Warenkorb hinzugefügt!';
        
        // Create temporary notification
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background-color: #e50914;
            color: white;
            padding: 15px 25px;
            border-radius: 5px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 2000);
    });
});

// Add animation keyframes dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

// =================================
// INLINE VIDEO PLAYER (Simple)
// =================================

// Video sources - replace with your actual video paths
const videoSources = {
    'promo': 'assets/promo-airbo.mp4',
    'testimonial-1': 'https://www.w3schools.com/html/mov_bbb.mp4',
    'testimonial-2': 'https://www.w3schools.com/html/mov_bbb.mp4',
    'testimonial-3': 'https://www.w3schools.com/html/mov_bbb.mp4'
};

// Handle play button clicks - replace thumbnail with video
document.querySelectorAll('.play-button, .play-button-small').forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Find the parent container
        const videoThumbnail = button.closest('.video-thumbnail') || button.closest('.video-thumb');
        
        if (!videoThumbnail) return;
        
        // Determine which video to play
        let videoSrc;
        const videoCard = button.closest('.video-card');
        const isPromo = button.closest('.media-frame');
        
        if (isPromo) {
            videoSrc = videoSources['promo'];
        } else if (videoCard) {
            const cards = Array.from(document.querySelectorAll('.video-card'));
            const index = cards.indexOf(videoCard);
            videoSrc = videoSources[`testimonial-${index + 1}`] || videoSources['promo'];
        } else {
            videoSrc = videoSources['promo'];
        }
        
        // Store original content in case of error
        const originalContent = videoThumbnail.innerHTML;
        
        // Create video element
        const video = document.createElement('video');
        video.src = videoSrc;
        video.controls = true;
        video.autoplay = true;
        video.style.width = '100%';
        video.style.height = '100%';
        video.style.objectFit = 'contain';
        video.style.backgroundColor = '#2255';
        
        // Error handling - restore thumbnail if video fails
        video.addEventListener('error', () => {
            console.error('Video failed to load:', videoSrc);
            videoThumbnail.innerHTML = originalContent;
            alert('Video not found. Please add video files to the assets folder.');
        });
        
        // Only replace content when video starts loading
        video.addEventListener('loadstart', () => {
            videoThumbnail.innerHTML = '';
            videoThumbnail.appendChild(video);
            videoThumbnail.style.position = 'relative';
        });
    });
});

// =================================
// RESPONSIVE ADJUSTMENTS
// =================================

function handleResponsive() {
    const width = window.innerWidth;
    
    // Adjust video carousel for mobile
    if (width < 768) {
        document.querySelectorAll('.video-card').forEach(card => {
            card.style.minWidth = '100%';
        });
    } else if (width < 992) {
        document.querySelectorAll('.video-card').forEach(card => {
            card.style.minWidth = 'calc(50% - 15px)';
        });
    } else {
        document.querySelectorAll('.video-card').forEach(card => {
            card.style.minWidth = 'calc(33.333% - 20px)';
        });
    }
}

window.addEventListener('resize', handleResponsive);
window.addEventListener('load', handleResponsive);

/*
// Custom Cursor Click Animation
let clickAnimationTimeout = null;

document.addEventListener('click', function(e) {
    // Check if click target is or is within a .btn-cta element
    const ctaButton = e.target.closest('.btn-cta');
    
    if (ctaButton) {
        // Clear any existing animation timeout to restart animation
        if (clickAnimationTimeout) {
            clearTimeout(clickAnimationTimeout);
        }
        
        // Add click cursor class
        document.body.classList.add('cursor-click');
        
        // Remove after 260ms and return to hover cursor
        clickAnimationTimeout = setTimeout(function() {
            document.body.classList.remove('cursor-click');
            clickAnimationTimeout = null;
        }, 260);
    }
});
*/

// Hero video - play once and fade out
window.addEventListener('load', () => {
    const heroVideo = document.getElementById('heroVideo');
    
    if (heroVideo) {
        console.log('Hero video found');
        
        // Force play (some browsers need this)
        heroVideo.play().then(() => {
            console.log('Video playing');
        }).catch(err => {
            console.error('Video play failed:', err);
            // If autoplay fails, fade out immediately
            heroVideo.classList.add('fade-out');
            setTimeout(() => heroVideo.remove(), 800);
        });
        
        // When video ends, fade it out
        heroVideo.addEventListener('ended', () => {
            console.log('Video ended');
            heroVideo.classList.add('fade-out');
            setTimeout(() => {
                heroVideo.remove();
            }, 800);
        });
    }
});

// =================================
// PERFORMANCE OPTIMIZATION
// =================================

// Lazy load images
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                observer.unobserve(img);
            }
        });
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// =================================
// WORLDWIDE ICON ANIMATED GLOW
// =================================

// Randomly trigger twitch animation after each base loop (30% chance)
function initWorldwideIconAnimation() {
    const icons = document.querySelectorAll('.worldwide-icon-wrapper');
    
    icons.forEach(icon => {
        // Base animation duration is 1.05s (1050ms)
        setInterval(() => {
            // 30% chance to trigger twitch
            if (Math.random() < 0.3) {
                icon.classList.add('twitch');
                
                // Remove class after twitch animation completes (0.2s)
                setTimeout(() => {
                    icon.classList.remove('twitch');
                }, 200);
            }
        }, 1050); // Check after each base loop
    });
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWorldwideIconAnimation);
} else {
    initWorldwideIconAnimation();
}

// =================================
// CONSOLE BRANDING
// =================================

console.log('%c🔥 WARCHARGE', 'font-size: 24px; font-weight: bold; color: #e50914;');
console.log('%cPeak Performance Nutrition', 'font-size: 14px; color: #b3b3b3;');
console.log('%cWebsite developed with warrior precision', 'font-size: 12px; font-style: italic; color: #666;');

