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
        solo: 38.99,
        duo: 38.99, // 15% off
        family: 105.99 // 45% off
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
    const lang = window.currentLanguage || 'en';
    showToast(lang === 'de' ? `${qty} Artikel in den Warenkorb gelegt!` : `Added ${qty} item(s) to cart!`);
    
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
    showToast((window.currentLanguage || 'en') === 'de' ? 'Weiterleitung zur Kasse...' : 'Redirecting to checkout...');
    
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
    const thumbnailStrip = document.querySelector('.hero-buy__thumbnails');

    if (!heroBuyImage || !thumbnails.length) return;

    let currentIndex = 0;

    function scrollToThumb(index) {
        if (!thumbnailStrip) return;
        const thumb = thumbnails[index];
        // Center the active thumbnail within the strip
        const scrollTarget = thumb.offsetLeft - (thumbnailStrip.clientWidth / 2) + (thumb.offsetWidth / 2);
        thumbnailStrip.scrollTo({ left: scrollTarget, behavior: 'smooth' });
    }

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
        scrollToThumb(index);
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

    // Mouse drag-to-scroll with momentum on desktop
    if (thumbnailStrip) {
        let isDown = false;
        let startX;
        let scrollLeft;
        let velTrack = [];
        let momentumId = null;

        function disableSnap() {
            thumbnailStrip.style.scrollSnapType = 'none';
            thumbnailStrip.style.scrollBehavior = 'auto';
        }

        function enableSnap() {
            thumbnailStrip.style.scrollSnapType = '';
            thumbnailStrip.style.scrollBehavior = '';
        }

        function stopMomentum() {
            if (momentumId) {
                cancelAnimationFrame(momentumId);
                momentumId = null;
            }
        }

        function startDrag(e) {
            stopMomentum();
            isDown = true;
            thumbnailStrip.style.cursor = 'grabbing';
            disableSnap();
            startX = e.pageX;
            scrollLeft = thumbnailStrip.scrollLeft;
            velTrack = [{ x: e.pageX, t: Date.now() }];
        }

        function endDrag() {
            if (!isDown) return;
            isDown = false;
            thumbnailStrip.style.cursor = 'grab';

            // Calculate release velocity from last 80ms of movement
            const now = Date.now();
            const recent = velTrack.filter(function(p) { return now - p.t < 80; });
            let velocity = 0;

            if (recent.length >= 2) {
                const first = recent[0];
                const last = recent[recent.length - 1];
                const dt = last.t - first.t;
                if (dt > 0) {
                    velocity = (first.x - last.x) / dt; // px/ms
                }
            }

            // Launch with momentum if flung fast enough
            if (Math.abs(velocity) > 0.1) {
                var v = velocity * 18; // px per frame at ~60fps
                var friction = 0.97;   // slow, smooth deceleration

                function momentumStep() {
                    v *= friction;
                    thumbnailStrip.scrollLeft += v;

                    // Smooth phase — keep going
                    if (Math.abs(v) > 0.5) {
                        momentumId = requestAnimationFrame(momentumStep);
                    } else {
                        // Final settle — re-enable snap so it clicks into place
                        momentumId = null;
                        enableSnap();
                    }
                }

                momentumId = requestAnimationFrame(momentumStep);
            } else {
                // No fling — just re-enable snap for a gentle settle
                enableSnap();
            }
        }

        function onDrag(e) {
            if (!isDown) return;
            e.preventDefault();
            var dx = e.pageX - startX;
            thumbnailStrip.scrollLeft = scrollLeft - dx;

            velTrack.push({ x: e.pageX, t: Date.now() });
            if (velTrack.length > 10) velTrack.shift();
        }

        thumbnailStrip.addEventListener('mousedown', startDrag);
        document.addEventListener('mouseup', endDrag);
        document.addEventListener('mousemove', onDrag);

        thumbnailStrip.addEventListener('dragstart', function(e) {
            e.preventDefault();
        });

        thumbnailStrip.style.cursor = 'grab';
    }
}


// Video Testimonials Carousel — scroll-based with drag/momentum, auto-rotate, iOS-style dots
function initVideoTestimonialsCarousel() {
    var track = document.querySelector('.video-carousel-track');
    var cards = track ? track.querySelectorAll('.video-card') : [];
    var pagination = document.querySelector('.carousel-pagination');

    if (!track || !cards.length || !pagination) return;

    var totalSlides = cards.length;
    var currentSlide = 0;

    // --- Build dots dynamically ---
    var dots = [];
    for (var i = 0; i < totalSlides; i++) {
        var dot = document.createElement('span');
        dot.className = 'dot';
        dot.dataset.index = i;
        pagination.appendChild(dot);
        dots.push(dot);
    }

    // --- Dot visibility: max 5 visible, edge-aware window ---
    // Determines which dot indices are visible and their role
    function updateDots() {
        var last = totalSlides - 1;

        // Calculate the visible window [start, end] clamped to array bounds
        // Active is centered when possible; at edges the window shifts
        var winStart, winEnd;

        if (currentSlide <= 0) {
            // First page: show 3 (active, +1, +2)
            winStart = 0;
            winEnd = Math.min(2, last);
        } else if (currentSlide === 1) {
            // Second page: show 4 (-1, active, +1, +2)
            winStart = 0;
            winEnd = Math.min(3, last);
        } else if (currentSlide >= last) {
            // Last page: show 3 (-2, -1, active)
            winStart = Math.max(last - 2, 0);
            winEnd = last;
        } else if (currentSlide === last - 1) {
            // Second-to-last: show 4 (-2, -1, active, +1)
            winStart = Math.max(last - 3, 0);
            winEnd = last;
        } else {
            // Middle: show 5 (-2, -1, active, +1, +2)
            winStart = currentSlide - 2;
            winEnd = currentSlide + 2;
        }

        for (var i = 0; i < totalSlides; i++) {
            if (i < winStart || i > winEnd) {
                dots[i].dataset.vis = 'hidden';
            } else if (i === currentSlide) {
                dots[i].dataset.vis = 'active';
            } else {
                var dist = Math.abs(i - currentSlide);
                dots[i].dataset.vis = dist === 1 ? 'adjacent' : 'far';
            }
        }
    }

    // Scroll to a specific card index
    function scrollToCard(index) {
        var card = cards[index];
        if (!card) return;
        var style = getComputedStyle(track);
        var gap = parseFloat(style.gap) || 20;
        var scrollTarget = (card.offsetWidth + gap) * index;
        track.scrollTo({ left: scrollTarget, behavior: 'smooth' });
        currentSlide = index;
        updateDots();
    }

    // Detect which card is closest to the start after manual scroll/drag
    function detectCurrentSlide() {
        var style = getComputedStyle(track);
        var gap = parseFloat(style.gap) || 20;
        var cardWidth = cards[0].offsetWidth + gap;
        var newIndex = Math.round(track.scrollLeft / cardWidth);
        newIndex = Math.max(0, Math.min(newIndex, totalSlides - 1));
        if (newIndex !== currentSlide) {
            currentSlide = newIndex;
            updateDots();
        }
    }

    // Dot click navigation
    dots.forEach(function(dot, index) {
        dot.addEventListener('click', function() {
            scrollToCard(index);
        });
    });

    // Update dots on scroll settle (for drag/swipe)
    var scrollTimer = null;
    track.addEventListener('scroll', function() {
        if (scrollTimer) clearTimeout(scrollTimer);
        scrollTimer = setTimeout(detectCurrentSlide, 100);
    }, { passive: true });

    // Initial dot state
    updateDots();

    // --- Desktop drag-to-scroll with momentum (mirrors initHeroBuyThumbnails) ---
    var isDown = false;
    var startX;
    var scrollLeft;
    var velTrack = [];
    var momentumId = null;

    function disableSnap() {
        track.style.scrollSnapType = 'none';
        track.style.scrollBehavior = 'auto';
    }

    function enableSnap() {
        track.style.scrollSnapType = '';
        track.style.scrollBehavior = '';
    }

    function stopMomentum() {
        if (momentumId) {
            cancelAnimationFrame(momentumId);
            momentumId = null;
        }
    }

    function startDrag(e) {
        stopMomentum();
        isDown = true;
        track.style.cursor = 'grabbing';
        disableSnap();
        startX = e.pageX;
        scrollLeft = track.scrollLeft;
        velTrack = [{ x: e.pageX, t: Date.now() }];
        resetAutoRotate();
    }

    function endDrag() {
        if (!isDown) return;
        isDown = false;
        track.style.cursor = 'grab';

        var now = Date.now();
        var recent = velTrack.filter(function(p) { return now - p.t < 80; });
        var velocity = 0;

        if (recent.length >= 2) {
            var first = recent[0];
            var last = recent[recent.length - 1];
            var dt = last.t - first.t;
            if (dt > 0) {
                velocity = (first.x - last.x) / dt;
            }
        }

        if (Math.abs(velocity) > 0.1) {
            var v = velocity * 18;
            var friction = 0.97;

            function momentumStep() {
                v *= friction;
                track.scrollLeft += v;

                if (Math.abs(v) > 0.5) {
                    momentumId = requestAnimationFrame(momentumStep);
                } else {
                    momentumId = null;
                    enableSnap();
                }
            }

            momentumId = requestAnimationFrame(momentumStep);
        } else {
            enableSnap();
        }
    }

    function onDrag(e) {
        if (!isDown) return;
        e.preventDefault();
        var dx = e.pageX - startX;
        track.scrollLeft = scrollLeft - dx;

        velTrack.push({ x: e.pageX, t: Date.now() });
        if (velTrack.length > 10) velTrack.shift();
    }

    track.addEventListener('mousedown', startDrag);
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('mousemove', onDrag);

    track.addEventListener('dragstart', function(e) {
        e.preventDefault();
    });

    track.style.cursor = 'grab';
}

// Initialize Sticky Footer CTA (show after hero scrolls away, dismiss on close)
function initStickyFooterCTA() {
    const footer = document.getElementById('stickyFooterCTA');
    const hero = document.getElementById('hero-buy');
    const closeBtn = document.getElementById('footerCtaClose');
    if (!footer || !hero) return;

    let dismissed = false;

    const observer = new IntersectionObserver(
        ([entry]) => {
            if (dismissed) return;
            footer.setAttribute('aria-hidden', entry.isIntersecting ? 'true' : 'false');
        },
        { threshold: 0 }
    );
    observer.observe(hero);

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            dismissed = true;
            footer.setAttribute('aria-hidden', 'true');
        });
    }
}

// Initialize All
function init() {
    // Variant & Cart
    initVariantPills();
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
    initVideoTestimonialsCarousel();
    initStickyFooterCTA();

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

