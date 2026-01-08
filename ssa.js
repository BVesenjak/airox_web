// ════════════════════════════════════════════════════════════
// SHOPIFY STOREFRONT API - COMPLETE SOLUTION
// ════════════════════════════════════════════════════════════

// 1. Initialize Shopify client
var client = ShopifyBuy.buildClient({
    domain: 'jnr35f-j0.myshopify.com',
    storefrontAccessToken: '6d2b3371273563fc70b1554be9a6750d',
  });
  
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
  
  // ════════════════════════════════════════════════════════════
  // ADD TO CART BUTTON
  // ════════════════════════════════════════════════════════════
  
  document.getElementById('addToCart').addEventListener('click', async function() {
    try {
      const { variantId, colors } = getSelectedBundle();
      const checkout = await getOrCreateCheckout();
      
      currentCheckout = await client.checkout.addLineItems(checkout.id, [{
        variantId: variantId,
        quantity: 1,
        customAttributes: [{ key: 'Colors', value: colors }]
      }]);
      
      // Update and open cart drawer
      ui.components.cart[0].updateProperties({ lineItems: currentCheckout.lineItems });
      ui.components.cart[0].open();
      
    } catch (error) {
      console.error('Add to cart error:', error);
      alert('Failed to add to cart');
    }
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
      }
      
      // Redirect to checkout
      window.location.href = currentCheckout.webUrl;
      
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Something went wrong. Please try again.');
    }
  });