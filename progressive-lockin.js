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
        bundle: 'duo',              // 'single', 'duo', or 'family'
        fanCount: 2,                // single=1, duo=2, family=4
        currentFanIndex: 0,         // Current fan being edited (0-based)
        selectedColors: [],         // Array of selected colors (e.g. ['black', 'white'])
        activeUnitIndex: 0,         // Which unit chip is currently active
        isComplete: false,          // Selection complete flag
        isLocked: false,            // Temporary lock during transitions
        hasCustomized: false        // True if user has changed any color from defaults
    };
    
    // Color name mapping
    const COLOR_NAMES = {
        'black': 'Stealth',
        'white': 'Arctic',
        'violet': 'Ion'
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
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════
    function init() {
        setupBundleListeners();
        setupColorPillListeners();
        setupEditListener();
        
        // Set defaults for initial bundle
        setDefaultsForBundle(state.bundle);
        
        // Render initial bundle contents
        renderBundleContentsIcons();
        
        // Sync initial pill selection
        syncSelectedPill();
        
        // Enable CTAs since we have defaults
        enableCTAs();
        
        // Update UI to show we're ready
        updateMicroFeedback('defaultready');
        
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
                
                // Update state
                const newBundle = this.dataset.value;
                setBundle(newBundle);
            });
        });
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
        const fanWord = state.fanCount === 1 ? 'fan' : 'fans';
        els.bundleContentsLabel.textContent = `Your bundle includes ${state.fanCount} ${fanWord} — tap any fan to change its color`;
        
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
            chip.setAttribute('aria-label', `Fan ${i + 1} color: ${colorName}. Click to edit.`);
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
        // Lock interaction briefly for premium feel
        state.isLocked = true;
        
        // Brief visual feedback on pill (but not persistent)
        pillElement.style.transform = 'scale(0.95)';
        setTimeout(() => {
            pillElement.style.transform = '';
        }, 150);
        
        // Update the active unit's color
        state.selectedColors[state.activeUnitIndex] = color;
        
        // Mark as customized (user has made a change)
        state.hasCustomized = true;
        
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
        els.selectorLabel.textContent = `Choose color for Fan ${fanNumber}`;
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
        
        switch(mode) {
            case 'defaultready':
                els.feedbackText.innerHTML = '✓ Defaults preselected — tap any fan to customize (optional)';
                els.microFeedback.style.background = 'rgba(153, 255, 255, 0.08)';
                break;
                
            case 'activeready':
                els.feedbackText.innerHTML = "✓ Selections updated · you're ready to checkout";
                els.microFeedback.style.background = 'rgba(21, 204, 190, 0.10)';
                break;
                
            case 'confirmation':
                const colorName = COLOR_NAMES[data] || data;
                els.feedbackText.innerHTML = `✓ ${colorName} selected`;
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
            els.ctaStatus.textContent = 'Complete color selection to continue';
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
        getFanCount: () => state.fanCount
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
