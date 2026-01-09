// ════════════════════════════════════════════════════════════
// SHOPIFY STOREFRONT API - COMPLETE SOLUTION
// ════════════════════════════════════════════════════════════

// 1. Initialize Shopify client
window.client = ShopifyBuy.buildClient({
    domain: 'jnr35f-j0.myshopify.com',
    storefrontAccessToken: '6d2b3371273563fc70b1554be9a6750d',
  });
  
  var client = window.client;
  
  // 2. Initialize UI component for cart drawer
  const ui = ShopifyBuy.UI.init(client);
  
  ui.createComponent('cart', {
    options: {
      cart: {
        iframe: false,
        popup: false,
        startOpen: false,
        styles: {
          button: {
            'display': 'none' // Hide default cart button
          }
        }
      }
    }
  });
  
  // 3. Variant mapping
  const BUNDLE_VARIANTS = {
    'single': '52428271354194',
    'duo': '52357333156178',
    'family': '52357333188946'
  };
  
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
      return label ? label.textContent.trim() : 'Stealth';
    });
    
    return {
      variantId: 'gid://shopify/ProductVariant/' + BUNDLE_VARIANTS[selectedBundle],
      colors: colors.join(', ')
    };
  }
  
  // ==================================================================
  // NAVBAR CART
  // ==================================================================
  document.querySelector('.cart-icon').addEventListener('click', async function() {
    // Fetch latest cart state
    const checkout = await getOrCreateCheckout();
    currentCheckout = checkout;
    
    // Open drawer
    openCartDrawer(false);
  });


  // ════════════════════════════════════════════════════════════
  // ADD TO CART BUTTON
  // ════════════════════════════════════════════════════════════
  
  document.getElementById('addToCart').addEventListener('click', async function() {
    try {
      const { variantId, colors } = getSelectedBundle();
      const checkout = await getOrCreateCheckout();
      
      // Open drawer immediately with loading state
      openCartDrawer(true); // Pass loading flag
      
      currentCheckout = await client.checkout.addLineItems(checkout.id, [{
        variantId: variantId,
        quantity: 1,
        customAttributes: [{ key: 'Colors', value: colors }]
      }]);
      
      // Update navbar badge immediately
      const totalItems = currentCheckout.lineItems.reduce((sum, item) => sum + item.quantity, 0);
      if (window.updateNavbarCartBadge) {
        window.updateNavbarCartBadge(totalItems);
      }
      
      // Update with real data
      openCartDrawer(false);
      
    } catch (error) {
      console.error('Error:', error);
      document.getElementById('cartDrawer').classList.remove('open');
    }
  });
  
  function openCartDrawer(isLoading = false) {
    const drawer = document.getElementById('cartDrawer');
    const itemsContainer = document.getElementById('cartItems');
    
    if (isLoading) {
      itemsContainer.innerHTML = '<p style="text-align:center;padding:20px;">Adding to cart...</p>';
      drawer.classList.add('open');
      return;
    }
    
    // Group items by variant ID + colors
    const groupedItems = {};
    const lineItemIds = {}; // Track line item IDs for updates
    
    currentCheckout.lineItems.forEach(item => {
      const colors = item.customAttributes.find(a => a.key === 'Colors')?.value || '';
      const key = `${item.variant.id}-${colors}`;
      
      if (groupedItems[key]) {
        groupedItems[key].quantity += item.quantity;
        lineItemIds[key].push(item.id);
      } else {
        groupedItems[key] = {
          ...item,
          quantity: item.quantity,
          colors: colors
        };
        lineItemIds[key] = [item.id];
      }
    });
    
    // Store globally for handlers to access
    window.cartGroupedItems = groupedItems;
    window.cartLineItemIds = lineItemIds;
    
    // Render with quantity picker
    itemsContainer.innerHTML = Object.entries(groupedItems).map(([key, item]) => `
      <div class="cart-item">
        <img src="${item.variant.image.src}" alt="${item.title}">
        <div style="flex: 1;">
          <p><strong>${item.title}</strong></p>
          <p style="color: #666; font-size: 14px;">Colors: ${item.colors}</p>
          <p><strong>$${(parseFloat(item.variant.price.amount) * item.quantity).toFixed(2)}</strong></p>
           <div class="quantity-picker" style="display: flex; align-items: center; gap: 10px; margin-top: 10px;">
             <button class="qty-btn" data-action="decrease" data-key="${key}" style="padding: 8px 12px;; border: 1px solid; border-radius: 4px; cursor: pointer; font-size: 16px; font-weight: bold; min-width: 32px; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='rgba(255,255,255,0.1)'">−</button>
             <span class="qty-value" style="min-width: 40px; text-align: center; font-weight: bold; font-size: 18px; color: #15ccbe;">${item.quantity}</span>
             <button class="qty-btn" data-action="increase" data-key="${key}" style="padding: 8px 12px;; border: 1px solid; border-radius: 4px; cursor: pointer; font-size: 16px; font-weight: bold; min-width: 32px; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='rgba(255,255,255,0.1)'">+</button>
           </div>
        </div>
      </div>
    `).join('');
    
    const totalItems = Object.values(groupedItems).reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cartCount').textContent = totalItems;
    document.getElementById('cartTotal').textContent = `$${currentCheckout.totalPrice.amount}`;
    
    // Update navbar badge
    if (window.updateNavbarCartBadge) {
      window.updateNavbarCartBadge(totalItems);
    }
    
    drawer.classList.add('open');
    
    // Attach handlers
    document.querySelectorAll('.qty-btn').forEach(btn => {
      btn.addEventListener('click', async function() {
        const action = this.dataset.action;
        const key = this.dataset.key;
        const lineItemIds = window.cartLineItemIds[key];
        const currentQty = window.cartGroupedItems[key].quantity;
        
        // Disable button during update
        this.disabled = true;
        const originalText = this.textContent;
        this.textContent = '...';
        
        try {
          if (action === 'increase') {
            // Find the first line item to get variant info
            const firstLineItem = currentCheckout.lineItems.find(li => lineItemIds.includes(li.id));
            
            // Update the line item quantity by 1
            const lineItemsToUpdate = [{
              id: firstLineItem.id,
              quantity: firstLineItem.quantity + 1
            }];
            
            currentCheckout = await client.checkout.updateLineItems(currentCheckout.id, lineItemsToUpdate);
            console.log('Increased quantity for:', key, 'New qty:', firstLineItem.quantity + 1);
            
          } else if (action === 'decrease') {
            // Find the first line item
            const firstLineItem = currentCheckout.lineItems.find(li => lineItemIds.includes(li.id));
            
            if (firstLineItem.quantity > 1) {
              // Decrease quantity by 1
              const lineItemsToUpdate = [{
                id: firstLineItem.id,
                quantity: firstLineItem.quantity - 1
              }];
              
              currentCheckout = await client.checkout.updateLineItems(currentCheckout.id, lineItemsToUpdate);
              console.log('Decreased quantity for:', key, 'New qty:', firstLineItem.quantity - 1);
              
            } else {
              // Last one - remove all line items in this group
              currentCheckout = await client.checkout.removeLineItems(currentCheckout.id, lineItemIds);
              console.log('Removed last item for:', key);
            }
          }
          
          // Update navbar badge
          const totalItems = currentCheckout.lineItems.reduce((sum, item) => sum + item.quantity, 0);
          if (window.updateNavbarCartBadge) {
            window.updateNavbarCartBadge(totalItems);
          }
          
          // Re-render drawer with updated cart
          openCartDrawer(false);
          
        } catch (error) {
          console.error('Quantity update error:', error);
          alert('Failed to update quantity. Please try again.');
          
          // Re-enable button
          this.disabled = false;
          this.textContent = originalText;
        }
      });
    });
  }
  
  // Close cart handlers
  document.getElementById('closeCart').addEventListener('click', () => {
    document.getElementById('cartDrawer').classList.remove('open');
  });
  
  document.querySelector('.cart-drawer__overlay').addEventListener('click', () => {
    document.getElementById('cartDrawer').classList.remove('open');
  });
  
  // Checkout from cart
  document.getElementById('cartCheckout').addEventListener('click', () => {
    window.location.href = currentCheckout.webUrl;
  });
  
  // ════════════════════════════════════════════════════════════
  // CHECKOUT NOW BUTTON
  // ════════════════════════════════════════════════════════════
  
  document.getElementById('buyNow').addEventListener('click', async function() {
    try {
      const checkout = await getOrCreateCheckout();
      
      // If cart empty, add current selection
      if (checkout.lineItems.length === 0) {
        const { variantId, colors } = getSelectedBundle();
        currentCheckout = await client.checkout.addLineItems(checkout.id, [{
          variantId: variantId,
          quantity: 1,
          customAttributes: [{ key: 'Colors', value: colors }]
        }]);
        
        // Update navbar badge
        const totalItems = currentCheckout.lineItems.reduce((sum, item) => sum + item.quantity, 0);
        if (window.updateNavbarCartBadge) {
          window.updateNavbarCartBadge(totalItems);
        }
      }
      
      // Redirect to checkout
      window.location.href = currentCheckout.webUrl;
      
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Something went wrong. Please try again.');
    }
  });