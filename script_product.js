/* ========================================
   Cyber-Zen Product Page JavaScript
   ======================================== */

// State Management
const state = {
    selectedVariant: {
        model: 'black',
        bundle: 'solo'
    },
    cart: {
        items: [],
        total: 0
    },
    quantity: 1,
    giftWrap: false,
    prices: {
        solo: 39.99,
        duo: 67.98, // 15% off
        family: 87.97 // 45% off
    }
};

// Variant ID Generator
function getVariantId() {
    return `${state.selectedVariant.model}-${state.selectedVariant.bundle}`;
}

// Price Calculator
function getCurrentPrice() {
    let price = state.prices[state.selectedVariant.bundle];
    if (state.giftWrap) {
        price += 5.00;
    }
    return price.toFixed(2);
}

// Update Price Display
function updatePriceDisplay() {
    const priceElements = document.querySelectorAll('#currentPrice, .price-callout__value');
    const currentPrice = getCurrentPrice();
    priceElements.forEach(el => {
        if (el) el.textContent = `$${currentPrice}`;
    });
    
    // Update sticky cart price
    const stickyPrice = document.getElementById('stickyPrice');
    if (stickyPrice) {
        stickyPrice.textContent = `$${currentPrice}`;
    }
}

// Product page navbar scroll behavior (desktop only)
(function() {
    const navbar = document.getElementById('navbarProduct');
    if (!navbar) return;
    
    function handleScroll() {
        // Only apply scroll effects on desktop
        if (window.innerWidth > 767) {
            const currentScrollY = window.scrollY;
            
            if (currentScrollY < 50) {
                navbar.classList.add('transparent');
                navbar.classList.remove('visible-opaque', 'shrunk');
            } else {
                navbar.classList.remove('transparent');
                navbar.classList.add('visible-opaque', 'shrunk');
            }
        }
    }
    
    // Throttle scroll events for performance
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                handleScroll();
                ticking = false;
            });
            ticking = true;
        }
    });
    
    // Initial call
    handleScroll();
    
    // Handle window resize
    window.addEventListener('resize', handleScroll);
})();

// Update Variant Display in Sticky Cart
function updateStickyVariant() {
    const stickyVariant = document.getElementById('stickyVariant');
    if (stickyVariant) {
        const { model, bundle } = state.selectedVariant;
        const displayText = `${model.charAt(0).toUpperCase() + model.slice(1)} / ${bundle.charAt(0).toUpperCase() + bundle.slice(1)}`;
        stickyVariant.textContent = displayText;
    }
}

// Toast Notification
function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Add to Cart
function addToCart(qty = 1) {
    const variantId = getVariantId();
    const price = parseFloat(getCurrentPrice());
    
    // Find existing item
    const existingItem = state.cart.items.find(item => item.variantId === variantId);
    
    if (existingItem) {
        existingItem.qty += qty;
    } else {
        state.cart.items.push({
            variantId,
            qty,
            price
        });
    }
    
    // Update total
    state.cart.total = state.cart.items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    
    // Update mini cart count
    const totalItems = state.cart.items.reduce((sum, item) => sum + item.qty, 0);
    const miniCartCount = document.getElementById('miniCartCount');
    if (miniCartCount) {
        miniCartCount.textContent = totalItems;
    }
    
    // Show toast
    showToast(`Added ${qty} item(s) to cart!`);
    
    // Analytics (placeholder)
    console.log('Cart:', state.cart);
}

// Build Checkout URL
function buildCheckoutUrl() {
    const variantId = getVariantId();
    const qty = state.quantity;
    
    // Placeholder - replace with actual checkout URL
    const baseUrl = 'https://warcharge.store/checkout';
    const params = new URLSearchParams({
        variant: variantId,
        qty: qty
    });
    
    return `${baseUrl}?${params.toString()}`;
}

// Buy Now Handler
function handleBuyNow() {
    const checkoutUrl = buildCheckoutUrl();
    showToast('Redirecting to checkout...');
    
    setTimeout(() => {
        // window.location.href = checkoutUrl;
        console.log('Redirect to:', checkoutUrl);
    }, 1000);
}

// Initialize Variant Pills
function initVariantPills() {
    const pillGroups = document.querySelectorAll('.variant-pills');
    
    pillGroups.forEach(group => {
        const pills = group.querySelectorAll('.pill');
        
        pills.forEach(pill => {
            pill.addEventListener('click', function() {
                // Remove active from siblings
                pills.forEach(p => {
                    p.classList.remove('pill--active');
                    p.setAttribute('aria-checked', 'false');
                });
                
                // Set active
                this.classList.add('pill--active');
                this.setAttribute('aria-checked', 'true');
                
                // Update state
                const variantType = this.dataset.variantType;
                const value = this.dataset.value;
                state.selectedVariant[variantType] = value;
                
                // Update displays
                updatePriceDisplay();
                updateStickyVariant();
            });
        });
    });
}

// Initialize Quantity Stepper
function initQuantityStepper() {
    const quantityInput = document.getElementById('quantity');
    const decreaseBtn = document.querySelector('[data-action="decrease"]');
    const increaseBtn = document.querySelector('[data-action="increase"]');
    
    if (!quantityInput) return;
    
    function updateQuantity(newQty) {
        const clamped = Math.max(1, Math.min(99, newQty));
        quantityInput.value = clamped;
        state.quantity = clamped;
        
        // Update sticky cart qty
        const stickyQty = document.getElementById('stickyQty');
        if (stickyQty) {
            stickyQty.textContent = clamped;
        }
    }
    
    if (decreaseBtn) {
        decreaseBtn.addEventListener('click', () => {
            updateQuantity(parseInt(quantityInput.value) - 1);
        });
    }
    
    if (increaseBtn) {
        increaseBtn.addEventListener('click', () => {
            updateQuantity(parseInt(quantityInput.value) + 1);
        });
    }
    
    quantityInput.addEventListener('input', function() {
        updateQuantity(parseInt(this.value) || 1);
    });
    
    // Keyboard support
    quantityInput.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            updateQuantity(parseInt(this.value) + 1);
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            updateQuantity(parseInt(this.value) - 1);
        }
    });
}

// Initialize Gift Wrap Checkbox
function initGiftWrapCheckbox() {
    const giftWrapCheckbox = document.getElementById('giftWrap');
    
    if (giftWrapCheckbox) {
        giftWrapCheckbox.addEventListener('change', function() {
            state.giftWrap = this.checked;
            updatePriceDisplay();
        });
    }
}

// Initialize Add to Cart Buttons
function initAddToCartButtons() {
    const addToCartBtns = document.querySelectorAll('#addToCart, #addToCartSecondary');
    
    addToCartBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            addToCart(state.quantity);
        });
    });
}

// Initialize Buy Now Buttons
function initBuyNowButtons() {
    const buyNowBtns = document.querySelectorAll('#buyNow, #buyNowSticky');
    
    buyNowBtns.forEach(btn => {
        btn.addEventListener('click', handleBuyNow);
    });
}

// Initialize Scroll Cue
function initScrollCue() {
    const scrollCue = document.querySelector('.scroll-cue');
    
    if (scrollCue) {
        scrollCue.addEventListener('click', function() {
            const benefitsSection = document.getElementById('benefits');
            if (benefitsSection) {
                benefitsSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
}

// Initialize Gallery Thumbnails
function initGalleryThumbnails() {
    const mainImage = document.getElementById('mainProductImage');
    const thumbnails = document.querySelectorAll('.thumb');
    
    thumbnails.forEach(thumb => {
        thumb.addEventListener('click', function() {
            // Remove active from all
            thumbnails.forEach(t => t.classList.remove('thumb--active'));
            
            // Set active
            this.classList.add('thumb--active');
            
            // Update main image
            const newSrc = this.dataset.src;
            if (mainImage && newSrc) {
                mainImage.src = newSrc;
            }
        });
    });
}

// Initialize Brand Video
function initBrandVideo() {
    const poster = document.getElementById('brandVideoPoster');
    const playBtn = document.getElementById('brandVideoPlay');
    const video = document.getElementById('brandVideo');
    
    if (playBtn && video) {
        playBtn.addEventListener('click', function() {
            if (poster) poster.style.display = 'none';
            this.style.display = 'none';
            video.style.display = 'block';
            video.play();
        });
    }
}

// Initialize Accordion
function initAccordion() {
    const accordionItems = document.querySelectorAll('.accordion__item');
    
    accordionItems.forEach(item => {
        const trigger = item.querySelector('.accordion__trigger');
        const content = item.querySelector('.accordion__content');
        
        if (trigger && content) {
            trigger.addEventListener('click', function() {
                const isExpanded = this.getAttribute('aria-expanded') === 'true';
                
                // Close all other items
                accordionItems.forEach(otherItem => {
                    const otherTrigger = otherItem.querySelector('.accordion__trigger');
                    const otherContent = otherItem.querySelector('.accordion__content');
                    
                    if (otherItem !== item) {
                        otherTrigger.setAttribute('aria-expanded', 'false');
                        otherContent.setAttribute('hidden', '');
                        otherContent.style.maxHeight = '0';
                    }
                });
                
                // Toggle current item
                if (isExpanded) {
                    this.setAttribute('aria-expanded', 'false');
                    content.setAttribute('hidden', '');
                    content.style.maxHeight = '0';
                } else {
                    this.setAttribute('aria-expanded', 'true');
                    content.removeAttribute('hidden');
                    content.style.maxHeight = content.scrollHeight + 'px';
                }
            });
        }
    });
}

// Initialize Lightbox
function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const lightboxClose = document.querySelector('.lightbox__close');
    const galleryItems = document.querySelectorAll('.gallery__item');
    
    if (!lightbox) return;
    
    // Open lightbox
    galleryItems.forEach(item => {
        item.addEventListener('click', function() {
            const imgSrc = this.dataset.lightbox;
            const caption = this.dataset.caption || '';
            const variantPreselect = this.dataset.variant;
            
            if (lightboxImg) lightboxImg.src = imgSrc;
            if (lightboxCaption) lightboxCaption.textContent = caption;
            
            lightbox.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
            
            // Focus trap
            lightboxClose.focus();
            
            // Preselect variant if available
            if (variantPreselect) {
                const [size, color, bundle] = variantPreselect.split('-');
                if (size) state.selectedVariant.size = size;
                if (color) state.selectedVariant.color = color;
                if (bundle) state.selectedVariant.bundle = bundle;
                
                // Update pills
                document.querySelectorAll('.pill').forEach(pill => {
                    const type = pill.dataset.variantType;
                    const value = pill.dataset.value;
                    
                    if (state.selectedVariant[type] === value) {
                        pill.classList.add('pill--active');
                        pill.setAttribute('aria-checked', 'true');
                    } else {
                        pill.classList.remove('pill--active');
                        pill.setAttribute('aria-checked', 'false');
                    }
                });
                
                updatePriceDisplay();
                updateStickyVariant();
            }
        });
    });
    
    // Close lightbox
    function closeLightbox() {
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }
    
    if (lightboxClose) {
        lightboxClose.addEventListener('click', closeLightbox);
    }
    
    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
    
    // ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && lightbox.getAttribute('aria-hidden') === 'false') {
            closeLightbox();
        }
    });
}

// Initialize Sticky Cart
function initStickyCart() {
    const stickyCart = document.getElementById('sticky-cart');
    const heroSection = document.getElementById('hero-buy');
    
    if (!stickyCart || !heroSection) return;
    
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) {
                    stickyCart.setAttribute('aria-hidden', 'false');
                } else {
                    stickyCart.setAttribute('aria-hidden', 'true');
                }
            });
        },
        {
            threshold: 0,
            rootMargin: '0px'
        }
    );
    
    observer.observe(heroSection);
    
    // Sticky cart quantity controls
    const decreaseSticky = document.querySelector('[data-action="decrease-sticky"]');
    const increaseSticky = document.querySelector('[data-action="increase-sticky"]');
    const stickyQty = document.getElementById('stickyQty');
    const mainQtyInput = document.getElementById('quantity');
    
    function updateStickyQty(newQty) {
        const clamped = Math.max(1, Math.min(99, newQty));
        if (stickyQty) stickyQty.textContent = clamped;
        if (mainQtyInput) mainQtyInput.value = clamped;
        state.quantity = clamped;
    }
    
    if (decreaseSticky) {
        decreaseSticky.addEventListener('click', () => {
            updateStickyQty(state.quantity - 1);
        });
    }
    
    if (increaseSticky) {
        increaseSticky.addEventListener('click', () => {
            updateStickyQty(state.quantity + 1);
        });
    }
    
    // Quick add buttons
    const quickAddBtns = document.querySelectorAll('.quick-add');
    quickAddBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const qty = parseInt(this.dataset.qty);
            addToCart(qty);
        });
    });
}

// Initialize Video Autoplay on Scroll
function initVideoAutoplay() {
    const videos = document.querySelectorAll('.hero-product__video, .hero-buy__video');
    
    if (!videos.length) return;
    
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.play().catch(err => {
                        console.log('Autoplay prevented:', err);
                    });
                } else {
                    entry.target.pause();
                }
            });
        },
        {
            threshold: 0.5
        }
    );
    
    videos.forEach(video => observer.observe(video));
}

// Initialize Smooth Scroll for Links
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

// Initialize Hover Animations for Buttons
function initButtonHoverAnimations() {
    const animatedButtons = document.querySelectorAll('.pill--animated, .btn.pill--animated');
    
    animatedButtons.forEach(button => {
        const animationSrc = button.dataset.animation;
        
        if (!animationSrc) return;
        
        // Create video element
        const video = document.createElement('video');
        video.className = 'pill--animated__video';
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        
        const source = document.createElement('source');
        source.src = animationSrc;
        source.type = 'video/mp4';
        
        video.appendChild(source);
        
        // Handle video load error silently
        video.addEventListener('error', (e) => {
            // Silently fail - remove video element
            if (video.parentNode) {
                video.parentNode.removeChild(video);
            }
        });
        
        // Prepend video to button
        button.insertBefore(video, button.firstChild);
        
        // Play on hover
        button.addEventListener('mouseenter', () => {
            video.play().catch(() => {
                // Silently ignore play errors
            });
        });
        
        // Pause on leave
        button.addEventListener('mouseleave', () => {
            video.pause();
            video.currentTime = 0;
        });
    });
}

// Initialize Hero Buy Image Switching
function initHeroBuyImageSwitching() {
    const heroBuyImage = document.getElementById('heroBuyImage');
    const modelButtons = document.querySelectorAll('[data-variant-type="model"]');
    
    if (!heroBuyImage) return;
    
    modelButtons.forEach(button => {
        button.addEventListener('click', function() {
            const newImageSrc = this.dataset.image;
            
            if (newImageSrc && heroBuyImage) {
                // Fade out
                heroBuyImage.style.opacity = '0';
                
                // Change image after fade
                setTimeout(() => {
                    heroBuyImage.src = newImageSrc;
                    // Fade in
                    heroBuyImage.style.opacity = '1';
                }, 300);
            }
        });
    });
}

// Initialize Hero Buy Thumbnail Gallery
function initHeroBuyThumbnails() {
    const heroBuyImage = document.getElementById('heroBuyImage');
    const thumbnails = document.querySelectorAll('.thumb-buy');
    const leftArrow = document.querySelector('.carousel-arrow--left');
    const rightArrow = document.querySelector('.carousel-arrow--right');
    
    if (!heroBuyImage || !thumbnails.length) return;
    
    let currentIndex = 0;
    
    function updateActiveThumb(index) {
        // Remove active from all thumbnails
        thumbnails.forEach(t => t.classList.remove('thumb-buy--active'));
        
        // Set active on current thumbnail
        thumbnails[index].classList.add('thumb-buy--active');
        
        // Update main image
        const newImageSrc = thumbnails[index].dataset.image;
        if (newImageSrc) {
            // Fade out
            heroBuyImage.style.opacity = '0';
            
            // Change image after fade
            setTimeout(() => {
                heroBuyImage.src = newImageSrc;
                // Fade in
                heroBuyImage.style.opacity = '1';
            }, 300);
        }
        
        currentIndex = index;
    }
    
    // Thumbnail click handlers
    thumbnails.forEach((thumb, index) => {
        thumb.addEventListener('click', function() {
            updateActiveThumb(index);
        });
    });
    
    // Arrow navigation
    if (leftArrow) {
        leftArrow.addEventListener('click', function() {
            const newIndex = currentIndex > 0 ? currentIndex - 1 : thumbnails.length - 1;
            updateActiveThumb(newIndex);
        });
    }
    
    if (rightArrow) {
        rightArrow.addEventListener('click', function() {
            const newIndex = currentIndex < thumbnails.length - 1 ? currentIndex + 1 : 0;
            updateActiveThumb(newIndex);
        });
    }
}

// Initialize All
function init() {
    // Variant & Cart
    initVariantPills();
    initQuantityStepper();
    initGiftWrapCheckbox();
    initAddToCartButtons();
    initBuyNowButtons();
    
    // UI Elements
    initScrollCue();
    // initGalleryThumbnails(); // Removed - no longer using thumbnails
    initBrandVideo();
    initAccordion();
    initLightbox();
    initStickyCart();
    initVideoAutoplay();
    initSmoothScroll();
    
    // New Features
    initButtonHoverAnimations();
    initHeroBuyImageSwitching();
    initHeroBuyThumbnails();
    
    // Initial updates
    updatePriceDisplay();
    updateStickyVariant();
    
    console.log('Product page initialized');
}

// Wait for DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

