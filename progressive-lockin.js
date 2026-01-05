// ═══════════════════════════════════════════════════════════════════════════
// PROGRESSIVE LOCK-IN COLOR SELECTION SYSTEM
// 
// State Machine:
// - SELECTING: User is progressing through fan selections
// - COMPLETE: All colors selected, showing summary + edit
// 
// Key Features:
// - Persistent micro-feedback (never vanishes)
// - Slow, calm transitions (280ms)
// - Two equal-height panels (no layout jump)
// - Edit functionality (return to any fan)
// - Bundle-aware (duo=2, family=4)
// ═══════════════════════════════════════════════════════════════════════════
(function() {
    'use strict';
    
    // ═══════════════════════════════════════════════════════════
    // STATE MANAGEMENT
    // ═══════════════════════════════════════════════════════════
    const state = {
        bundle: 'duo',              // 'duo' or 'family'
        fanCount: 2,                // duo=2, family=4
        currentFanIndex: 0,         // Current fan being selected (0-based)
        selectedColors: [],         // Array of selected colors
        isComplete: false,          // Selection complete flag
        isLocked: false             // Temporary lock during transitions
    };
    
    // Color name mapping
    const COLOR_NAMES = {
        'black': 'Stealth',
        'white': 'Arctic',
        'violet': 'Ion'
    };
    
    // ═══════════════════════════════════════════════════════════
    // DOM REFERENCES
    // ═══════════════════════════════════════════════════════════
    const els = {
        // Bundle
        bundleButtons: document.querySelectorAll('[data-variant-type="bundle"]'),
        
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
        disableCTAs(); // Start with Add to Cart disabled (CONFIRM SELECTION stays enabled)
        
        // Ensure CONFIRM SELECTION button is always enabled
        if (els.buyNowBtn) {
            els.buyNowBtn.style.opacity = '1';
            els.buyNowBtn.style.pointerEvents = 'auto';
            els.buyNowBtn.removeAttribute('disabled');
        }
        
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
                state.bundle = this.dataset.value;
                state.fanCount = state.bundle === 'duo' ? 2 : 4;
                
                // Reset color selection
                resetSelection();
            });
        });
    }
    
    // ═══════════════════════════════════════════════════════════
    // COLOR PILL INTERACTION
    // ═══════════════════════════════════════════════════════════
    function setupColorPillListeners() {
        els.colorPills.forEach(pill => {
            pill.addEventListener('click', function() {
                if (state.isLocked || state.isComplete) return;
                
                const color = this.dataset.value;
                handleColorSelection(color, this);
            });
        });
    }
    
    /**
     * Handle color selection with calm, controlled interaction
     * Timing: ~280ms lock period for premium feel
     * Context-aware: Handles both sequential progression and specific fan edits
     */
    function handleColorSelection(color, pillElement) {
        // Lock interaction
        state.isLocked = true;
        
        // Visual feedback: highlight selected pill
        els.colorPills.forEach(p => {
            p.classList.remove('pill--active');
            p.setAttribute('aria-checked', 'false');
            p.style.pointerEvents = 'none';
            p.style.opacity = '0.5';
        });
        
        pillElement.classList.add('pill--active');
        pillElement.setAttribute('aria-checked', 'true');
        pillElement.style.opacity = '1';
        
        // Store selection
        state.selectedColors[state.currentFanIndex] = color;
        
        // Update micro-feedback with confirmation
        updateMicroFeedback('confirmation', color);
        
        // Determine next action based on context
        setTimeout(() => {
            // Check if we were editing a specific fan (all fans already selected)
            const wasEditingSpecific = state.selectedColors.filter(c => c).length === state.fanCount;
            
            if (wasEditingSpecific) {
                // Return to completed summary state
                completeSelection();
            } else {
                // Continue sequential progression
                advanceSelection();
            }
        }, 280);
    }
    
    /**
     * Advance to next fan or complete selection
     */
    function advanceSelection() {
        state.currentFanIndex++;
        
        // Check if complete
        if (state.currentFanIndex >= state.fanCount) {
            completeSelection();
            return;
        }
        
        // Reset pills for next selection
        els.colorPills.forEach(p => {
            p.classList.remove('pill--active');
            p.setAttribute('aria-checked', 'false');
            p.style.pointerEvents = 'auto';
            p.style.opacity = '1';
        });
        
        // Update UI for next fan
        updateSelectorLabel();
        updateMicroFeedback('progress');
        
        // Unlock
        state.isLocked = false;
    }
    
    // ═══════════════════════════════════════════════════════════
    // UI UPDATES - PERSISTENT MICRO-FEEDBACK
    // ═══════════════════════════════════════════════════════════
    
    /**
     * Update selector label dynamically
     */
    function updateSelectorLabel() {
        const fanNum = state.currentFanIndex + 1;
        els.selectorLabel.textContent = `Choose color for Fan ${fanNum}`;
    }
    
    /**
     * Update micro-feedback - NEVER vanishes, always guides
     * @param {string} mode - 'initial', 'confirmation', 'progress', 'editing'
     * @param {*} data - selectedColor for confirmation, fanIndex for editing
     */
    function updateMicroFeedback(mode, data = null) {
        let message = '';
        
        switch(mode) {
            case 'initial':
                message = '👉 Pick a color to continue';
                break;
                
            case 'confirmation':
                const selectedColor = data;
                const remaining = state.fanCount - state.currentFanIndex - 1;
                if (remaining > 0) {
                    message = `✓ ${COLOR_NAMES[selectedColor]} selected · ${remaining} fan${remaining > 1 ? 's' : ''} remaining`;
                } else {
                    message = `✓ ${COLOR_NAMES[selectedColor]} selected · Complete!`;
                }
                break;
                
            case 'progress':
                const selected = state.selectedColors
                    .slice(0, state.currentFanIndex)
                    .map(c => COLOR_NAMES[c])
                    .join(' · ');
                const nextFan = state.currentFanIndex + 1;
                message = `Selected: ${selected} · Now choosing Fan ${nextFan}`;
                break;
                
            case 'editing':
                const fanIndex = data;
                const fanNum = fanIndex + 1;
                const currentColor = state.selectedColors[fanIndex];
                message = `✏️ Editing Fan ${fanNum} (currently ${COLOR_NAMES[currentColor]}) · Choose new color`;
                break;
        }
        
        // Smooth text transition
        els.feedbackText.style.opacity = '0';
        setTimeout(() => {
            els.feedbackText.textContent = message;
            els.feedbackText.style.opacity = '1';
        }, 140);
    }
    
    // ═══════════════════════════════════════════════════════════
    // COMPLETION STATE
    // ═══════════════════════════════════════════════════════════
    
    /**
     * Complete selection - transition to summary state
     * Smooth transition: 280ms fade, no layout jump
     */
    function completeSelection() {
        state.isComplete = true;
        
        // Fade out selector state
        els.selectorState.style.opacity = '0';
        els.selectorState.style.transform = 'translateY(-8px)';
        
        setTimeout(() => {
            // Hide selector, show summary
            els.selectorState.style.display = 'none';
            els.summaryState.style.display = 'block';
            
            // Build summary
            buildSummaryList();
            
            // Fade in summary
            setTimeout(() => {
                els.summaryState.style.opacity = '1';
                
                // Show hint text after summary fades in
                showEditHint();
            }, 50);
            
            // Update CTA status
            enableCTAs();
            
        }, 280);
    }
    
    /**
     * Show temporary hint text under edit button
     * ONE-TIME PER SESSION: only shows on first completion
     * Hint displays for 3s, button glow lasts 4s
     */
    function showEditHint() {
        if (!els.editHint || !els.editBtn) return;
        
        // Check if hint has already been shown this session
        const hintShown = sessionStorage.getItem('editHintShown');
        if (hintShown === 'true') {
            return; // Don't show again after edits
        }
        
        // Mark as shown for this session (won't show after reload)
        sessionStorage.setItem('editHintShown', 'true');
        
        // Apply glow effect to button text (synchronized with hint appearance)
        setTimeout(() => {
            els.editBtn.classList.add('edit-btn--glow');
            els.editHint.classList.add('edit-hint--show');
        }, 100);
        
        // After 3 seconds, fade out hint
        setTimeout(() => {
            els.editHint.classList.remove('edit-hint--show');
            els.editHint.classList.add('edit-hint--fadeout');
            
            // Clean up hint classes after fade-out completes
            setTimeout(() => {
                els.editHint.classList.remove('edit-hint--fadeout');
            }, 400);
        }, 3100); // 100ms initial + 3000ms display
        
        // After 4 seconds, remove button glow (1s longer than hint)
        setTimeout(() => {
            els.editBtn.classList.remove('edit-btn--glow');
        }, 4100); // 100ms initial + 4000ms glow
    }
    
    /**
     * Build the summary list showing all selections
     * Visual: Color dots (not squares/checkboxes) - informational markers
     * Layout: Grid adjusts based on fanCount (2x2 for 4 fans, 1x2 for 2 fans)
     * Interaction: Clickable items to edit specific fan color
     */
    function buildSummaryList() {
        // Apply grid layout class based on fan count
        els.summaryList.className = state.fanCount === 4 ? 'summary-grid summary-grid--4fans' : 'summary-grid summary-grid--2fans';
        
        const items = state.selectedColors.map((color, idx) => {
            return `<div class="summary-item" data-fan-index="${idx}" role="button" tabindex="0" aria-label="Edit Fan ${idx + 1} color">
                <span class="color-dot" data-color="${color}" style="background: ${getColorHex(color)};" title="${COLOR_NAMES[color]}"></span>
                <span class="fan-label">Fan ${idx + 1}</span>
                <span class="color-name">${COLOR_NAMES[color]}</span>
            </div>`;
        }).join('');
        
        els.summaryList.innerHTML = items;
        
        // Add click handlers to summary items for quick edit
        setupSummaryItemListeners();
    }
    
    /**
     * Get color hex for visual display
     */
    function getColorHex(color) {
        const colorMap = {
            'black': '#000000',
            'white': '#ffffff',
            'violet': '#9b59b6'
        };
        return colorMap[color] || '#999';
    }
    
    // ═══════════════════════════════════════════════════════════
    // EDIT FUNCTIONALITY
    // ═══════════════════════════════════════════════════════════
    
    /**
     * Setup edit button listener (edit all from start)
     */
    function setupEditListener() {
        els.editBtn.addEventListener('click', function() {
            resetSelection();
        });
    }
    
    /**
     * Setup summary item click listeners (edit specific fan)
     */
    function setupSummaryItemListeners() {
        const summaryItems = els.summaryList.querySelectorAll('.summary-item');
        summaryItems.forEach(item => {
            item.addEventListener('click', function() {
                const fanIndex = parseInt(this.dataset.fanIndex, 10);
                editSpecificFan(fanIndex);
            });
            
            // Keyboard accessibility
            item.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const fanIndex = parseInt(this.dataset.fanIndex, 10);
                    editSpecificFan(fanIndex);
                }
            });
        });
    }
    
    /**
     * Edit a specific fan's color (jump to that fan in the selector)
     * @param {number} fanIndex - The fan to edit (0-based)
     */
    function editSpecificFan(fanIndex) {
        // Return to selector state
        state.isComplete = false;
        state.currentFanIndex = fanIndex;
        state.isLocked = false;
        
        // Transition from summary to selector
        els.summaryState.style.opacity = '0';
        setTimeout(() => {
            els.summaryState.style.display = 'none';
            els.selectorState.style.display = 'block';
            els.selectorState.style.opacity = '0';
            els.selectorState.style.transform = 'translateY(-8px)';
            
            setTimeout(() => {
                els.selectorState.style.opacity = '1';
                els.selectorState.style.transform = 'translateY(0)';
            }, 50);
        }, 280);
        
        // Reset pills and highlight current selection if exists
        els.colorPills.forEach(p => {
            p.classList.remove('pill--active');
            p.setAttribute('aria-checked', 'false');
            p.style.pointerEvents = 'auto';
            p.style.opacity = '1';
            
            // Pre-select current color for this fan
            if (state.selectedColors[fanIndex] && p.dataset.value === state.selectedColors[fanIndex]) {
                p.classList.add('pill--active');
                p.setAttribute('aria-checked', 'true');
            }
        });
        
        // Update UI
        updateSelectorLabel();
        updateMicroFeedback('editing', fanIndex);
        disableCTAs();
    }
    
    /**
     * Reset selection - return to step 1
     * Preserves previous selections for prefill (optional enhancement)
     */
    function resetSelection() {
        // Reset state
        const previousSelections = [...state.selectedColors]; // Keep for potential prefill
        state.currentFanIndex = 0;
        state.selectedColors = [];
        state.isComplete = false;
        state.isLocked = false;
        
        // Show selector, hide summary
        els.summaryState.style.opacity = '0';
        setTimeout(() => {
            els.summaryState.style.display = 'none';
            els.selectorState.style.display = 'block';
            els.selectorState.style.opacity = '0';
            els.selectorState.style.transform = 'translateY(-8px)';
            
            setTimeout(() => {
                els.selectorState.style.opacity = '1';
                els.selectorState.style.transform = 'translateY(0)';
            }, 50);
        }, 280);
        
        // Reset pills
        els.colorPills.forEach(p => {
            p.classList.remove('pill--active');
            p.setAttribute('aria-checked', 'false');
            p.style.pointerEvents = 'auto';
            p.style.opacity = '1';
        });
        
        // Reset UI
        updateSelectorLabel();
        updateMicroFeedback('initial');
        disableCTAs();
    }
    
    // ═══════════════════════════════════════════════════════════
    // CTA MANAGEMENT
    // ═══════════════════════════════════════════════════════════
    
    /**
     * Disable CTAs during selection
     */
    function disableCTAs() {
        // Keep "CONFIRM SELECTION" button always enabled
        // Only disable Add to Cart
        if (els.addToCartBtn) {
            els.addToCartBtn.style.opacity = '0.5';
            els.addToCartBtn.style.pointerEvents = 'none';
            els.addToCartBtn.setAttribute('disabled', 'true');
        }
        
        els.ctaStatus.textContent = 'Complete color selection to continue';
        els.ctaStatus.style.color = 'rgba(255,255,255,0.6)';
    }
    
    /**
     * Enable CTAs after completion
     */
    function enableCTAs() {
        // "CONFIRM SELECTION" button is always enabled, so no need to enable it here
        // Only enable Add to Cart
        if (els.addToCartBtn) {
            els.addToCartBtn.style.opacity = '1';
            els.addToCartBtn.style.pointerEvents = 'auto';
            els.addToCartBtn.removeAttribute('disabled');
        }
        
        els.ctaStatus.innerHTML = '✓ <strong style="color: rgb(153, 255, 255);">Selections saved</strong> · Ready to purchase';
        els.ctaStatus.style.color = 'rgba(255,255,255,0.85)';
    }
    
    // ═══════════════════════════════════════════════════════════
    // GENERAL UI UPDATE
    // ═══════════════════════════════════════════════════════════
    function updateUI() {
        updateSelectorLabel();
        updateMicroFeedback('initial');
    }
    
    // ═══════════════════════════════════════════════════════════
    // START
    // ═══════════════════════════════════════════════════════════
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Expose state for Shopify integration
    window.ProgressiveLockInState = {
        get selectedColors() {
            return state.selectedColors.slice(); // Return copy
        },
        get bundle() {
            return state.bundle;
        },
        get fanCount() {
            return state.fanCount;
        },
        get isComplete() {
            return state.isComplete;
        }
    };
    
})();

// ═══════════════════════════════════════════════════════════════════════════
// SIMPLE SHOPIFY INTEGRATION
// Clicks the correct Shopify button based on bundle selection
// ═══════════════════════════════════════════════════════════════════════════
(function() {
    'use strict';
    
    const SHOPIFY_BUTTONS = {
        '2pack': 'product-component-1767037426572',
        '4pack': 'product-component-1767037492944'
    };
    
    function handleAddToCart() {
        // Get bundle selection
        const activePill = document.querySelector('.pill--bundle.pill--active');
        if (!activePill) return;
        
        const bundleType = activePill.dataset.value === 'duo' ? '2pack' : '4pack';
        const componentId = SHOPIFY_BUTTONS[bundleType];
        
        // Wait for video to finish, then click Shopify button
        const activeVideo = document.querySelector('#addtocart-btn .btn-video-cart-active');
        
        const clickShopify = () => {
            const btn = document.querySelector(`#${componentId} .shopify-buy__btn, #${componentId} button`);
            if (btn) btn.click();
        };
        
        if (activeVideo && !activeVideo.paused) {
            activeVideo.addEventListener('ended', clickShopify, { once: true });
            setTimeout(clickShopify, 2000); // Fallback
        } else {
            setTimeout(clickShopify, 100);
        }
    }
    
    // Attach handler
    const btn = document.getElementById('addtocart-btn');
    if (btn) btn.addEventListener('click', handleAddToCart);
    
})();

