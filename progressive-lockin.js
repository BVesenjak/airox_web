// ═══════════════════════════════════════════════════════════════════════════
// PROGRESSIVE LOCK-IN COLOR SELECTION SYSTEM
// 
// State Machine:
// - SELECTING: User is progressing through fan selections
// - COMPLETE: All colors selected, showing summary + edit
// 
// Key Features:
// - Bundle contents visualizer with clickable fan chips
// - Default colors preselected (never blocked)
// - Direct unit editing via chip click
// - Persistent micro-feedback (never vanishes)
// - Slow, calm transitions (280ms)
// - Two equal-height panels (no layout jump)
// - Edit functionality (return to any fan)
// - Bundle-aware (single=1, duo=2, family=4)
// ═══════════════════════════════════════════════════════════════════════════
(function() {
    'use strict';
    
    // ═══════════════════════════════════════════════════════════
    // STATE MANAGEMENT
    // ═══════════════════════════════════════════════════════════
    const state = {
        bundle: 'single',           // 'single', 'duo', or 'family'
        fanCount: 1,                // single=1, duo=2, family=4
        currentFanIndex: 0,         // Current fan being edited (0-based)
        selectedColors: [],         // Array of selected colors (e.g. ['black', 'white'])
        activeUnitIndex: 0,         // Which unit chip is currently active
        isComplete: false,          // Selection complete flag
        isLocked: false,            // Temporary lock during transitions
        hasCustomized: false        // True if user has changed any color from defaults
    };
    
    // Get current language
    function lang() { return window.currentLanguage || 'en'; }

    // Color name mapping
    const COLOR_NAMES = {
        'black': 'Stealth',
        'white': 'Arctic',
        'violet': 'Ion'
    };

    // German UI strings
    const I18N = {
        bundleLabel: { en: (n, w) => `Your bundle includes ${n} ${w} — tap any fan to change its color`, de: (n, w) => `Dein Bundle enthält ${n} ${w} — tippe auf einen Ventilator, um die Farbe zu ändern` },
        fanWord: { en: (n) => n === 1 ? 'fan' : 'fans', de: (n) => n === 1 ? 'Ventilator' : 'Ventilatoren' },
        fanAriaLabel: { en: (i, c) => `Fan ${i} color: ${c}. Click to edit.`, de: (i, c) => `Ventilator ${i} Farbe: ${c}. Klicken zum Ändern.` },
        selectorLabel: { en: (n) => `Choose color for Fan ${n}`, de: (n) => `Farbe für Ventilator ${n} wählen` },
        defaultReady: { en: '✓ Defaults preselected — tap any fan to customize (optional)', de: '✓ Voreinstellungen gewählt — tippe auf einen Ventilator zum Anpassen (optional)' },
        activeReady: { en: "✓ Selections updated · you're ready to checkout", de: '✓ Auswahl aktualisiert · bereit zum Kauf' },
        confirmation: { en: (c) => `✓ ${c} selected`, de: (c) => `✓ ${c} ausgewählt` },
        ctaDisabled: { en: 'Complete color selection to continue', de: 'Farbauswahl abschließen, um fortzufahren' },
        pickColor: { en: '👉 Pick a color to continue', de: '👉 Wähle eine Farbe, um fortzufahren' }
    };
    
    // Icon mapping
    const COLOR_ICONS = {
        'black': 'assets/icons/LOLO3.png',
        'white': 'assets/icons/eins.png',
        'violet': 'assets/icons/2.png'
    };
    
    // Bundle defaults (key: bundle value, value: array of colors)
    const BUNDLE_DEFAULTS = {
        'single': ['white'],
        'duo': ['black', 'white'],
        'family': ['black', 'black', 'white', 'violet']
    };
    
    // Color shorthand mapping for session tracking
    const COLOR_SHORTHAND = {
        'black': 's',    // Stealth
        'white': 'a',    // Arctic
        'violet': 'i'    // Ion
    };
    
    // Shopify button mapping
    const SHOPIFY_BUTTON_IDS = {
        'single': 'product-component-1767037492944',
        'duo': 'product-component-1767471509348',
        'family': 'product-component-1767471363799'
    };
    
    // Session order tracking (e.g., "1s,2s,3a,4i")
    let sessionOrder = '';
    
    // ═══════════════════════════════════════════════════════════
    // DOM REFERENCES
    // ═══════════════════════════════════════════════════════════
    const els = {
        // Bundle
        bundleButtons: document.querySelectorAll('[data-variant-type="bundle"]'),
        
        // Bundle Contents Visualizer
        bundleContentsSection: document.getElementById('bundleContentsSection'),
        bundleContentsLabel: document.getElementById('bundleContentsLabel'),
        bundleContentsChips: document.getElementById('bundleContentsChips'),
        
        // Panels
        panelA: document.getElementById('panelA'),
        panelB: document.getElementById('panelB'),
        
        // Selector state
        selectorState: document.getElementById('progressiveSelectorState'),
        selectorLabel: document.getElementById('selectorLabel'),
        colorPills: document.getElementById('colorPills').querySelectorAll('.pill--color'),
        microFeedback: document.getElementById('microFeedback'),
        feedbackText: document.getElementById('feedbackText'),
        
        // Summary state
        summaryState: document.getElementById('summaryState'),
        summaryList: document.getElementById('summaryList'),
        editBtn: document.getElementById('editSelectionsBtn'),
        editHint: document.getElementById('editHint'),
        
        // CTA
        ctaStatus: document.getElementById('ctaStatus'),
        buyNowBtn: document.getElementById('buyNow'),
        addToCartBtn: document.getElementById('addtocart-btn')
    };
    
    // ═══════════════════════════════════════════════════════════
    // SESSION ORDER TRACKING
    // ═══════════════════════════════════════════════════════════
    
    /**
     * Generate order string from current colors (e.g., "1s,2s,3a,4i")
     */
    function generateOrderString() {
        const orderParts = [];
        for (let i = 0; i < state.fanCount; i++) {
            const color = state.selectedColors[i] || 'black';
            const shorthand = COLOR_SHORTHAND[color];
            orderParts.push(`${i + 1}${shorthand}`);
        }
        return orderParts.join(',');
    }
    
    /**
     * Update session order
     */
    function updateSessionOrder() {
        sessionOrder = generateOrderString();
        console.log('Session order updated:', sessionOrder);
    }
    
    // ═══════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════
    function init() {
        setupBundleListeners();
        setupColorPillListeners();
        setupEditListener();
        
        // Set defaults for initial bundle
        setDefaultsForBundle(state.bundle);
        
        // Update initial pricing (1-pack is default)
        const activeButton = document.querySelector('[data-variant-type="bundle"].pill--active');
        if (activeButton) {
            updatePricing(activeButton);
        }
        
        // Render initial bundle contents
        renderBundleContentsIcons();
        
        // Sync initial pill selection
        syncSelectedPill();
        
        // Enable CTAs since we have defaults
        enableCTAs();
        
        // Update UI to show we're ready
        updateMicroFeedback('defaultready');
        
        // Initialize session order
        updateSessionOrder();
        
        // Setup checkout button handler
        setupCheckoutHandler();
        
        updateUI();
    }
    
    // ═══════════════════════════════════════════════════════════
    // BUNDLE SELECTION
    // ═══════════════════════════════════════════════════════════
    function setupBundleListeners() {
        els.bundleButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                // Update active state
                els.bundleButtons.forEach(b => {
                    b.classList.remove('pill--active');
                    b.setAttribute('aria-checked', 'false');
                });
                this.classList.add('pill--active');
                this.setAttribute('aria-checked', 'true');
                
                // Update pricing display
                updatePricing(this);
                
                // Update state
                const newBundle = this.dataset.value;
                setBundle(newBundle);
            });
        });
    }
    
    /**
     * Update pricing display based on selected bundle
     */
    function updatePricing(bundleButton) {
        const price = bundleButton.dataset.price;
        const comparePrice = bundleButton.dataset.compare;
        const l = lang();
        const savings = bundleButton.dataset[`savings${l === 'de' ? 'De' : 'En'}`] || bundleButton.dataset.savings;
        
        // Update price elements
        const currentPriceEl = document.getElementById('currentPrice');
        const comparePriceEl = document.getElementById('comparePrice');
        const savingsBadgeEl = document.getElementById('savingsBadge');
        
        if (currentPriceEl) currentPriceEl.textContent = `$${price}`;
        if (comparePriceEl) comparePriceEl.textContent = `$${comparePrice}`;
        if (savingsBadgeEl) {
            savingsBadgeEl.textContent = savings;
            // Hide badge if empty
            savingsBadgeEl.style.display = savings ? 'inline-block' : 'none';
        }
    }
    
    /**
     * Set bundle and apply defaults
     */
    function setBundle(bundleValue) {
        state.bundle = bundleValue;
        
        // Set fan count based on bundle
        if (bundleValue === 'single') {
            state.fanCount = 1;
        } else if (bundleValue === 'duo') {
            state.fanCount = 2;
        } else if (bundleValue === 'family') {
            state.fanCount = 4;
        }
        
        // Apply defaults
        setDefaultsForBundle(bundleValue);
        
        // Reset to first unit
        state.activeUnitIndex = 0;
        state.currentFanIndex = 0;
        state.isComplete = false;
        state.hasCustomized = false;
        
        // Render bundle contents
        renderBundleContentsIcons();
        
        // Reset UI
        updateSelectorLabel();
        updateMicroFeedback('defaultready');
        
        // Sync pill selection to default color
        syncSelectedPill();
        
        // Ensure CTAs are enabled (we have defaults)
        enableCTAs();
        
        // Update session order with new defaults
        updateSessionOrder();
        
        updateUI();
    }
    
    /**
     * Set default colors for a bundle
     */
    function setDefaultsForBundle(bundleValue) {
        state.selectedColors = [...BUNDLE_DEFAULTS[bundleValue]];
    }
    
    // ═══════════════════════════════════════════════════════════
    // BUNDLE CONTENTS VISUALIZER
    // ═══════════════════════════════════════════════════════════
    
    /**
     * Render the fan chips showing current bundle configuration
     */
    function renderBundleContentsIcons() {
        if (!els.bundleContentsChips) return;
        
        // Update label
        const l = lang();
        const fanWord = I18N.fanWord[l](state.fanCount);
        els.bundleContentsLabel.textContent = I18N.bundleLabel[l](state.fanCount, fanWord);
        
        // Clear existing chips
        els.bundleContentsChips.innerHTML = '';
        
        // Create chips for each fan
        for (let i = 0; i < state.fanCount; i++) {
            const color = state.selectedColors[i] || 'black';
            const colorName = COLOR_NAMES[color];
            const iconSrc = COLOR_ICONS[color];
            
            const chip = document.createElement('button');
            chip.className = 'fan-chip';
            chip.setAttribute('type', 'button');
            chip.setAttribute('aria-label', I18N.fanAriaLabel[lang()](i + 1, colorName));
            chip.dataset.unitIndex = i;
            
            // Active state
            if (i === state.activeUnitIndex) {
                chip.classList.add('active');
            }
            
            // Badge (unit number)
            const badge = document.createElement('span');
            badge.className = 'unit-badge';
            badge.textContent = i + 1;
            
            // Icon
            const icon = document.createElement('img');
            icon.className = 'fan-chip__icon';
            icon.src = iconSrc;
            icon.alt = colorName;
            
            // Label (color name - now shrunk)
            const label = document.createElement('span');
            label.className = 'fan-chip__label';
            label.textContent = colorName;
            
            chip.appendChild(badge);
            chip.appendChild(icon);
            chip.appendChild(label);
            
            // Click handler
            chip.addEventListener('click', () => handleUnitChipClick(i));
            
            els.bundleContentsChips.appendChild(chip);
        }
    }
    
    /**
     * Sync pill selection to match active unit's color
     * Ensures exactly ONE pill shows selected state
     */
    function syncSelectedPill() {
        if (!els.colorPills || els.colorPills.length === 0) return;
        
        // Get active unit's current color
        const activeColor = state.selectedColors[state.activeUnitIndex];
        if (!activeColor) return;
        
        // Remove selected state from all pills
        els.colorPills.forEach(pill => {
            pill.classList.remove('pill--active');
            pill.setAttribute('aria-checked', 'false');
            pill.style.pointerEvents = 'auto';
            pill.style.opacity = '1';
        });
        
        // Find and select the matching pill
        els.colorPills.forEach(pill => {
            if (pill.dataset.value === activeColor) {
                pill.classList.add('pill--active');
                pill.setAttribute('aria-checked', 'true');
            }
        });
    }
    
    /**
     * Handle clicking a unit chip (selects which fan to edit)
     */
    function handleUnitChipClick(index) {
        if (state.isLocked) return;
        
        // Update active unit
        state.activeUnitIndex = index;
        state.currentFanIndex = index;
        
        // Re-render chips to update active state
        renderBundleContentsIcons();
        
        // Update selector label
        updateSelectorLabel();
        
        // Show ready feedback
        updateMicroFeedback(getReadyMode());
        
        // Sync pill selection to active unit
        syncSelectedPill();
    }
    
    // ═══════════════════════════════════════════════════════════
    // COLOR PILL INTERACTION
    // ═══════════════════════════════════════════════════════════
    function setupColorPillListeners() {
        els.colorPills.forEach(pill => {
            pill.addEventListener('click', function() {
                if (state.isLocked) return;
                
                const color = this.dataset.value;
                handleColorPillClick(color, this);
            });
        });
    }
    
    /**
     * Handle color pill click - updates the active unit's color
     */
    function handleColorPillClick(color, pillElement) {
        // Check if this is actually a different color
        const currentColor = state.selectedColors[state.activeUnitIndex];
        const isDifferentColor = currentColor !== color;
        
        // Lock interaction briefly for premium feel
        state.isLocked = true;
        
        // Brief visual feedback on pill (but not persistent)
        pillElement.style.transform = 'scale(0.95)';
        setTimeout(() => {
            pillElement.style.transform = '';
        }, 150);
        
        // Update the active unit's color
        state.selectedColors[state.activeUnitIndex] = color;
        
        // Mark as customized only if user changed to a different color
        if (isDifferentColor) {
            state.hasCustomized = true;
            
            // Update session order tracking
            updateSessionOrder();
        }
        
        // Re-render bundle contents to show new icon/label
        renderBundleContentsIcons();
        
        // Update micro-feedback with confirmation
        updateMicroFeedback('confirmation', color);
        
        // Auto-advance to next unit with wrap-around
        setTimeout(() => {
            // Unlock interaction
            state.isLocked = false;
            
            // Advance to next unit, cycling back to first if at the end
            state.activeUnitIndex++;
            if (state.activeUnitIndex >= state.fanCount) {
                state.activeUnitIndex = 0;
            }
            state.currentFanIndex = state.activeUnitIndex;
            
            // Update UI for new active unit
            renderBundleContentsIcons();
            updateSelectorLabel();
            updateMicroFeedback(getReadyMode());
            
            // Sync pill selection to new color
            syncSelectedPill();
            
        }, 280);
    }
    
    // ═══════════════════════════════════════════════════════════
    // UI UPDATES - PERSISTENT MICRO-FEEDBACK
    // ═══════════════════════════════════════════════════════════
    
    /**
     * Update the selector label to show which fan is being edited
     */
    function updateSelectorLabel() {
        const fanNumber = state.activeUnitIndex + 1;
        els.selectorLabel.textContent = I18N.selectorLabel[lang()](fanNumber);
    }
    
    /**
     * Get the appropriate ready mode based on customization state
     */
    function getReadyMode() {
        return state.hasCustomized ? 'activeready' : 'defaultready';
    }
    
    /**
     * Update micro-feedback based on mode
     * Modes: 'defaultready', 'activeready', 'confirmation'
     */
    function updateMicroFeedback(mode, data = null) {
        if (!els.feedbackText) return;
        
        const l = lang();
        switch(mode) {
            case 'defaultready':
                els.feedbackText.innerHTML = I18N.defaultReady[l];
                els.microFeedback.style.background = 'rgba(153, 255, 255, 0.08)';
                break;

            case 'activeready':
                els.feedbackText.innerHTML = I18N.activeReady[l];
                els.microFeedback.style.background = 'rgba(21, 204, 190, 0.10)';
                break;

            case 'confirmation':
                const colorName = COLOR_NAMES[data] || data;
                els.feedbackText.innerHTML = I18N.confirmation[l](colorName);
                els.microFeedback.style.background = 'rgba(21, 204, 190, 0.15)';
                break;
        }
    }
    
    // ═══════════════════════════════════════════════════════════
    // CTA MANAGEMENT
    // ═══════════════════════════════════════════════════════════
    function disableCTAs() {
        // Disable Add to Cart
        if (els.addToCartBtn) {
            els.addToCartBtn.style.opacity = '0.4';
            els.addToCartBtn.style.pointerEvents = 'none';
            els.addToCartBtn.setAttribute('disabled', 'true');
        }
        
        // Update status
        if (els.ctaStatus) {
            els.ctaStatus.textContent = I18N.ctaDisabled[lang()];
            els.ctaStatus.style.opacity = '1';
        }
    }
    
    function enableCTAs() {
        // Enable Add to Cart
        if (els.addToCartBtn) {
            els.addToCartBtn.style.opacity = '1';
            els.addToCartBtn.style.pointerEvents = 'auto';
            els.addToCartBtn.removeAttribute('disabled');
        }
        
        // Ensure CHECKOUT NOW button is always enabled
        if (els.buyNowBtn) {
            els.buyNowBtn.style.opacity = '1';
            els.buyNowBtn.style.pointerEvents = 'auto';
            els.buyNowBtn.removeAttribute('disabled');
        }
        
        // Update status
        if (els.ctaStatus) {
            els.ctaStatus.textContent = '';
            els.ctaStatus.style.opacity = '0';
        }
    }
    
    // ═══════════════════════════════════════════════════════════
    // EDIT FUNCTIONALITY (Legacy - kept for compatibility)
    // ═══════════════════════════════════════════════════════════
    function setupEditListener() {
        if (els.editBtn) {
            els.editBtn.addEventListener('click', () => {
                // Reset to first fan
                state.activeUnitIndex = 0;
                state.currentFanIndex = 0;
                renderBundleContentsIcons();
                updateSelectorLabel();
                updateMicroFeedback(getReadyMode());
                syncSelectedPill();
            });
        }
    }
    
    // ═══════════════════════════════════════════════════════════
    // CHECKOUT HANDLER
    // ═══════════════════════════════════════════════════════════
    function setupCheckoutHandler() {
        const buyNowBtn = document.getElementById('buyNow');
        if (buyNowBtn) {
            buyNowBtn.addEventListener('click', function(e) {
                // Get the Shopify button ID based on current bundle
                const shopifyButtonId = SHOPIFY_BUTTON_IDS[state.bundle];
                
                // Find the container and click its button
                const container = document.getElementById(shopifyButtonId);
                if (container) {
                    const shopifyBtn = container.querySelector('.shopify-buy__btn');
                    if (shopifyBtn) {
                        console.log('Programmatically clicking Shopify button for:', state.bundle, 'Order:', sessionOrder);
                        shopifyBtn.click();
                    } else {
                        console.error('Shopify button not found in container:', shopifyButtonId);
                    }
                } else {
                    console.error('Shopify container not found:', shopifyButtonId);
                }
            });
        }
    }
    
    // ═══════════════════════════════════════════════════════════
    // GENERAL UI UPDATE
    // ═══════════════════════════════════════════════════════════
    function updateUI() {
        // This function can be used for any additional UI updates if needed
        // Currently most updates are handled by specific functions
    }
    
    // ═══════════════════════════════════════════════════════════
    // START
    // ═══════════════════════════════════════════════════════════
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // ═══════════════════════════════════════════════════════════
    // EXPOSE STATE FOR SHOPIFY INTEGRATION
    // ═══════════════════════════════════════════════════════════
    window.ProgressiveLockInState = {
        getState: () => state,
        getSelectedColors: () => state.selectedColors,
        getColorNames: () => state.selectedColors.map(c => COLOR_NAMES[c]),
        getBundle: () => state.bundle,
        getFanCount: () => state.fanCount,
        reRenderLanguage: () => {
            renderBundleContentsIcons();
            updateSelectorLabel();
            if (state.isComplete) {
                updateMicroFeedback(getReadyMode());
            } else {
                els.feedbackText.innerHTML = I18N.pickColor[lang()];
            }
            if (!state.isComplete) disableCTAs();
        }
    };
    
})();


// ═══════════════════════════════════════════════════════════════════════════
// SIMPLE SHOPIFY INTEGRATION
// Maps internal selection to Shopify Buy Button clicks
// ═══════════════════════════════════════════════════════════════════════════
(function() {
    'use strict';
    
    // Map bundle values to Shopify button IDs
    const SHOPIFY_BUTTONS = {
        'single': 'product-component-1767471363799',  // 1-pack
        'duo': 'product-component-1767037426572',      // 2-pack
        'family': 'product-component-1767037492944'    // 4-pack
    };
    
    /**
     * Handle Add to Cart click
     * Triggers the appropriate Shopify Buy Button based on bundle selection
     */
    function handleAddToCart() {
        // Get current state
        const state = window.ProgressiveLockInState.getState();
        const bundle = state.bundle;
        
        // Get corresponding Shopify button container
        const shopifyContainerId = SHOPIFY_BUTTONS[bundle];
        const container = document.getElementById(shopifyContainerId);
        
        if (!container) {
            console.error('Shopify button container not found for bundle:', bundle);
            return;
        }
        
        // Find and click the Shopify "Add to cart" button
        const shopifyBtn = container.querySelector('.shopify-buy__btn');
        if (shopifyBtn) {
            shopifyBtn.click();
        } else {
            console.error('Shopify button not found in container:', shopifyContainerId);
        }
    }
    
    // Attach handler to custom Add to Cart button
    const btn = document.getElementById('addtocart-btn');
    if (btn) {
        btn.addEventListener('click', handleAddToCart);
    }
    
})();
