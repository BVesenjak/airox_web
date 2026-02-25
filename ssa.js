// ════════════════════════════════════════════════════════════
// SHOPIFY STOREFRONT API - COMPLETE SOLUTION
// ════════════════════════════════════════════════════════════

// 1. Initialize Shopify client
if (typeof ShopifyBuy === 'undefined') {
    console.warn('ShopifyBuy SDK not loaded');
}
window.client = ShopifyBuy.buildClient({
    domain: 'jnr35f-j0.myshopify.com',
    storefrontAccessToken: '6d2b3371273563fc70b1554be9a6750d',
});

var client = window.client;

// 2. Initialize UI component (optional - not used by custom drawer)
try {
    var ui = ShopifyBuy.UI.init(client);
    ui.createComponent('cart', {
        options: {
            cart: {
                iframe: false,
                popup: false,
                startOpen: false,
                styles: { button: { 'display': 'none' } }
            }
        }
    });
} catch (e) {
    console.warn('Shopify UI init skipped:', e);
}

// 3. Variant mapping
const BUNDLE_VARIANTS = {
    'single': '52428271354194',
    'duo': '52357333156178',
    'family': '52357333188946'
};

// Reverse map: variant ID -> bundle label (bilingual)
const VARIANT_LABELS = {
    '52428271354194': { en: '1-Pack', de: '1er-Pack' },
    '52357333156178': { en: '2-Pack BOGO', de: '2er-Pack BOGO' },
    '52357333188946': { en: 'Family (4-Pack)', de: 'Familienpack (4er)' }
};

function getBundleLabel(variantGid) {
    const numericId = String(variantGid).split('/').pop();
    const labels = VARIANT_LABELS[numericId];
    if (!labels) return '';
    return (window.currentLanguage || 'en') === 'de' ? labels.de : labels.en;
}

let currentCheckout = null;

// ════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ════════════════════════════════════════════════════════════

async function getOrCreateCheckout() {
    const checkoutId = localStorage.getItem('shopify_checkout_id');

    if (checkoutId) {
        try {
            currentCheckout = await client.checkout.fetch(checkoutId);
            if (currentCheckout.completedAt) {
                localStorage.removeItem('shopify_checkout_id');
                currentCheckout = await client.checkout.create();
                localStorage.setItem('shopify_checkout_id', currentCheckout.id);
            }
            return currentCheckout;
        } catch (e) {
            localStorage.removeItem('shopify_checkout_id');
        }
    }

    currentCheckout = await client.checkout.create();
    localStorage.setItem('shopify_checkout_id', currentCheckout.id);
    return currentCheckout;
}

function getSelectedBundle() {
    const selectedBundle = document.querySelector('.pill--bundle.pill--active').dataset.value;
    const fanChips = document.querySelectorAll('.bundle-contents-chips .fan-chip');
    const colors = Array.from(fanChips).map(chip => {
        const label = chip.querySelector('.fan-chip__label');
        return label ? label.textContent.trim() : 'Onyx';
    });

    return {
        variantId: 'gid://shopify/ProductVariant/' + BUNDLE_VARIANTS[selectedBundle],
        colors: colors.join(', ')
    };
}

function closeCartDrawer() {
    const drawer = document.getElementById('cartDrawer');
    if (drawer) {
        drawer.classList.remove('open');
        document.body.style.overflow = '';
    }
}

// ════════════════════════════════════════════════════════════
// ADD TO CART ARC ANIMATION
// ════════════════════════════════════════════════════════════

function animateAddToCartArc(startElement) {
    const cartIcon = document.querySelector('.cart-icon');
    if (!startElement || !cartIcon) return;

    const startRect = startElement.getBoundingClientRect();
    const endRect = cartIcon.getBoundingClientRect();

    const dot = document.createElement('div');
    dot.className = 'cart-arc-dot';
    dot.style.left = (startRect.left + startRect.width / 2) + 'px';
    dot.style.top = (startRect.top + startRect.height / 2) + 'px';
    document.body.appendChild(dot);

    const startX = startRect.left + startRect.width / 2;
    const startY = startRect.top + startRect.height / 2;
    const endX = endRect.left + endRect.width / 2;
    const endY = endRect.top + endRect.height / 2;

    // Control point for arc (far above midpoint for dramatic curve)
    const cpX = (startX + endX) / 2;
    const cpY = Math.min(startY, endY) - 400;

    const duration = 1800;
    const startTime = performance.now();

    function step(now) {
        const elapsed = now - startTime;
        const t = Math.min(elapsed / duration, 1);
        // ease-in-out
        const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

        // Quadratic bezier
        const x = (1 - ease) * (1 - ease) * startX + 2 * (1 - ease) * ease * cpX + ease * ease * endX;
        const y = (1 - ease) * (1 - ease) * startY + 2 * (1 - ease) * ease * cpY + ease * ease * endY;

        dot.style.left = x + 'px';
        dot.style.top = y + 'px';
        dot.style.opacity = 1 - (t * 0.3);

        if (t < 1) {
            requestAnimationFrame(step);
        } else {
            dot.remove();
            // Bounce the cart icon
            cartIcon.classList.remove('cart-icon--bounce');
            void cartIcon.offsetWidth; // force reflow
            cartIcon.classList.add('cart-icon--bounce');
            setTimeout(() => cartIcon.classList.remove('cart-icon--bounce'), 200);
        }
    }

    requestAnimationFrame(step);
}

// ════════════════════════════════════════════════════════════
// CART DRAWER
// ════════════════════════════════════════════════════════════

function openCartDrawer(isLoading) {
    var drawer = document.getElementById('cartDrawer');
    var itemsContainer = document.getElementById('cartItems');
    var emptyState = document.getElementById('cartEmpty');
    var footerEl = document.querySelector('.cart-drawer__footer');
    var lang = window.currentLanguage || 'en';

    if (!drawer) return;

    // Lock body scroll
    document.body.style.overflow = 'hidden';

    if (isLoading) {
        var loadingText = lang === 'de' ? 'Wird zum Warenkorb hinzugefügt...' : 'Adding to cart...';
        itemsContainer.innerHTML = '<p style="text-align:center;padding:40px 20px;color:#888;">' + loadingText + '</p>';
        if (emptyState) emptyState.style.display = 'none';
        if (footerEl) footerEl.style.display = 'block';
        drawer.classList.add('open');
        return;
    }

    // Empty cart
    if (!currentCheckout || currentCheckout.lineItems.length === 0) {
        itemsContainer.innerHTML = '';
        if (emptyState) emptyState.style.display = 'flex';
        if (footerEl) footerEl.style.display = 'none';
        document.getElementById('cartCount').textContent = '0';
        if (window.updateNavbarCartBadge) window.updateNavbarCartBadge(0);
        drawer.classList.add('open');
        return;
    }

    // Has items
    if (emptyState) emptyState.style.display = 'none';
    if (footerEl) footerEl.style.display = 'block';

    // Group items by variant + colors
    var groupedItems = {};
    var lineItemIds = {};

    currentCheckout.lineItems.forEach(function(item) {
        var colors = item.customAttributes.find(function(a) { return a.key === 'Colors'; });
        colors = colors ? colors.value : '';
        var key = item.variant.id + '-' + colors;

        if (groupedItems[key]) {
            groupedItems[key].quantity += item.quantity;
            lineItemIds[key].push(item.id);
        } else {
            groupedItems[key] = {
                id: item.id,
                title: item.title,
                variant: item.variant,
                quantity: item.quantity,
                colors: colors
            };
            lineItemIds[key] = [item.id];
        }
    });

    window.cartGroupedItems = groupedItems;
    window.cartLineItemIds = lineItemIds;

    // Render line items
    var colorsLabel = lang === 'de' ? 'Farben' : 'Colors';
    var html = '';

    Object.keys(groupedItems).forEach(function(key) {
        var item = groupedItems[key];
        var bundleLabel = getBundleLabel(item.variant.id);
        var linePrice = (parseFloat(item.variant.price.amount) * item.quantity).toFixed(2);
        var isLastOne = item.quantity <= 1;
        var decreaseContent = isLastOne
            ? '<i class="fas fa-trash-alt"></i>'
            : '&minus;';
        var decreaseClass = isLastOne ? 'qty-btn qty-btn--trash' : 'qty-btn';

        html += '<div class="cart-item">' +
            '<img src="' + item.variant.image.src + '" alt="' + item.title + '" class="cart-item__img">' +
            '<div class="cart-item__details">' +
                '<p class="cart-item__name">AIROX Vortex Pro</p>' +
                '<p class="cart-item__meta">' + colorsLabel + ': ' + item.colors + '</p>' +
                (bundleLabel ? '<p class="cart-item__meta">' + bundleLabel + '</p>' : '') +
                '<p class="cart-item__price">$' + linePrice + '</p>' +
                '<div class="cart-item__qty">' +
                    '<button class="' + decreaseClass + '" data-action="decrease" data-key="' + key + '">' + decreaseContent + '</button>' +
                    '<span class="qty-value">' + item.quantity + '</span>' +
                    '<button class="qty-btn" data-action="increase" data-key="' + key + '">+</button>' +
                '</div>' +
            '</div>' +
        '</div>';
    });

    itemsContainer.innerHTML = html;

    // Update counts & totals
    var totalItems = 0;
    Object.keys(groupedItems).forEach(function(k) { totalItems += groupedItems[k].quantity; });
    document.getElementById('cartCount').textContent = totalItems;

    var subtotalEl = document.getElementById('cartSubtotal');
    var totalEl = document.getElementById('cartTotal');
    var subtotalAmount = currentCheckout.subtotalPrice ? currentCheckout.subtotalPrice.amount : currentCheckout.totalPrice.amount;
    if (subtotalEl) subtotalEl.textContent = '$' + parseFloat(subtotalAmount).toFixed(2);
    if (totalEl) totalEl.textContent = '$' + parseFloat(currentCheckout.totalPrice.amount).toFixed(2);

    if (window.updateNavbarCartBadge) {
        window.updateNavbarCartBadge(totalItems);
    }

    drawer.classList.add('open');

    // Attach quantity handlers
    document.querySelectorAll('#cartItems .qty-btn, #cartItems .qty-btn--trash').forEach(function(btn) {
        btn.addEventListener('click', async function() {
            var action = this.dataset.action;
            var itemKey = this.dataset.key;
            var ids = window.cartLineItemIds[itemKey];

            this.disabled = true;
            var originalHTML = this.innerHTML;
            this.textContent = '...';

            try {
                if (action === 'increase') {
                    var firstItem = currentCheckout.lineItems.find(function(li) { return ids.includes(li.id); });
                    currentCheckout = await client.checkout.updateLineItems(currentCheckout.id, [{
                        id: firstItem.id,
                        quantity: firstItem.quantity + 1
                    }]);

                } else if (action === 'decrease') {
                    var firstItem = currentCheckout.lineItems.find(function(li) { return ids.includes(li.id); });

                    if (firstItem.quantity > 1) {
                        currentCheckout = await client.checkout.updateLineItems(currentCheckout.id, [{
                            id: firstItem.id,
                            quantity: firstItem.quantity - 1
                        }]);
                    } else {
                        currentCheckout = await client.checkout.removeLineItems(currentCheckout.id, ids);
                    }
                }

                var updatedTotal = currentCheckout.lineItems.reduce(function(sum, item) { return sum + item.quantity; }, 0);
                if (window.updateNavbarCartBadge) {
                    window.updateNavbarCartBadge(updatedTotal);
                }

                openCartDrawer(false);

            } catch (error) {
                console.error('Quantity update error:', error);
                this.disabled = false;
                this.innerHTML = originalHTML;
            }
        });
    });
}

// ════════════════════════════════════════════════════════════
// EVENT LISTENERS
// ════════════════════════════════════════════════════════════

// Navbar cart icon
var cartIconEl = document.querySelector('.cart-icon');
if (cartIconEl) {
    cartIconEl.addEventListener('click', async function() {
        try {
            var checkout = await getOrCreateCheckout();
            currentCheckout = checkout;
        } catch (e) {
            console.warn('Cart fetch failed:', e);
            currentCheckout = null;
        }
        openCartDrawer(false);
    });
}

// Add to Cart (product page only)
var addToCartBtn = document.getElementById('addToCart');
if (addToCartBtn) {
    addToCartBtn.addEventListener('click', async function() {
        var self = this;

        // Fire arc animation immediately (visual feedback)
        animateAddToCartArc(self);

        try {
            var bundle = getSelectedBundle();
            var checkout = await getOrCreateCheckout();

            // Delay drawer opening so arc is visible
            setTimeout(function() { openCartDrawer(true); }, 1200);

            currentCheckout = await client.checkout.addLineItems(checkout.id, [{
                variantId: bundle.variantId,
                quantity: 1,
                customAttributes: [{ key: 'Colors', value: bundle.colors }]
            }]);

            var totalItems = currentCheckout.lineItems.reduce(function(sum, item) { return sum + item.quantity; }, 0);
            if (window.updateNavbarCartBadge) {
                window.updateNavbarCartBadge(totalItems);
            }

            openCartDrawer(false);

        } catch (error) {
            console.warn('Add to cart failed (Shopify may be unavailable):', error);
            currentCheckout = null;
            // Still open drawer after arc finishes — shows empty state
            setTimeout(function() { openCartDrawer(false); }, 1800);
        }
    });
}

// Close cart handlers
var closeCartBtn = document.getElementById('closeCart');
if (closeCartBtn) closeCartBtn.addEventListener('click', closeCartDrawer);

var overlayEl = document.querySelector('.cart-drawer__overlay');
if (overlayEl) overlayEl.addEventListener('click', closeCartDrawer);

// Continue Shopping buttons (empty state + footer link)
document.querySelectorAll('.cart-drawer__continue-btn, .cart-drawer__continue-link').forEach(function(btn) {
    btn.addEventListener('click', closeCartDrawer);
});

// Checkout
var checkoutBtn = document.getElementById('cartCheckout');
if (checkoutBtn) {
    checkoutBtn.addEventListener('click', function() {
        if (currentCheckout && currentCheckout.webUrl) {
            window.location.href = currentCheckout.webUrl;
        }
    });
}

// ════════════════════════════════════════════════════════════
// PROMO CODE
// ════════════════════════════════════════════════════════════

var promoToggle = document.getElementById('promoToggle');
var promoBody = document.getElementById('promoBody');

if (promoToggle && promoBody) {
    promoToggle.addEventListener('click', function() {
        promoBody.classList.toggle('open');
        promoToggle.querySelector('.cart-drawer__promo-chevron').classList.toggle('open');
    });
}

var promoApply = document.getElementById('promoApply');
var promoInput = document.getElementById('promoInput');
var promoMessage = document.getElementById('promoMessage');

if (promoApply && promoInput && promoMessage) {
    promoApply.addEventListener('click', async function() {
        var code = promoInput.value.trim();
        if (!code) return;

        var lang = window.currentLanguage || 'en';
        promoApply.disabled = true;
        promoApply.textContent = '...';
        promoMessage.textContent = '';
        promoMessage.className = 'cart-drawer__promo-message';

        try {
            currentCheckout = await client.checkout.addDiscount(currentCheckout.id, code);

            if (currentCheckout.discountApplications && currentCheckout.discountApplications.length > 0) {
                promoMessage.textContent = lang === 'de' ? 'Code eingelöst!' : 'Code applied!';
                promoMessage.classList.add('cart-drawer__promo-message--success');
                promoInput.value = '';
            } else {
                promoMessage.textContent = lang === 'de' ? 'Ungültiger Code' : 'Invalid code';
                promoMessage.classList.add('cart-drawer__promo-message--error');
            }

            // Update totals
            var subtotalEl = document.getElementById('cartSubtotal');
            var totalEl = document.getElementById('cartTotal');
            var subtotalAmount = currentCheckout.subtotalPrice ? currentCheckout.subtotalPrice.amount : currentCheckout.totalPrice.amount;
            if (subtotalEl) subtotalEl.textContent = '$' + parseFloat(subtotalAmount).toFixed(2);
            if (totalEl) totalEl.textContent = '$' + parseFloat(currentCheckout.totalPrice.amount).toFixed(2);

        } catch (error) {
            console.error('Promo code error:', error);
            promoMessage.textContent = lang === 'de' ? 'Ungültiger Code' : 'Invalid code';
            promoMessage.classList.add('cart-drawer__promo-message--error');
        }

        promoApply.disabled = false;
        promoApply.textContent = lang === 'de' ? 'Einlösen' : 'Apply';
    });
}

// ════════════════════════════════════════════════════════════
// CHECKOUT NOW BUTTON (product page only)
// ════════════════════════════════════════════════════════════

var buyNowBtn = document.getElementById('buyNow');
if (buyNowBtn) {
    buyNowBtn.addEventListener('click', async function() {
        try {
            var checkout = await getOrCreateCheckout();

            if (checkout.lineItems.length === 0) {
                var bundle = getSelectedBundle();
                currentCheckout = await client.checkout.addLineItems(checkout.id, [{
                    variantId: bundle.variantId,
                    quantity: 1,
                    customAttributes: [{ key: 'Colors', value: bundle.colors }]
                }]);

                var totalItems = currentCheckout.lineItems.reduce(function(sum, item) { return sum + item.quantity; }, 0);
                if (window.updateNavbarCartBadge) {
                    window.updateNavbarCartBadge(totalItems);
                }
            }

            window.location.href = currentCheckout.webUrl;

        } catch (error) {
            console.error('Checkout error:', error);
            alert((window.currentLanguage || 'en') === 'de' ? 'Etwas ist schiefgelaufen. Bitte versuche es erneut.' : 'Something went wrong. Please try again.');
        }
    });
}
