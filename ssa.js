// ════════════════════════════════════════════════════════════
// SHOPIFY STOREFRONT API - SIMPLE INTEGRATION
// ════════════════════════════════════════════════════════════

// 1. Initialize Shopify client (add this to your existing script)
var client = ShopifyBuy.buildClient({
    domain: 'jnr35f-j0.myshopify.com',
    storefrontAccessToken: '6d2b3371273563fc70b1554be9a6750d',
  });
  
  // 2. Variant mapping (your 3 bundle variants)
  const BUNDLE_VARIANTS = {
    'single': '52428271354194',   // 1-Pack
    'duo': '52357333156178',       // 2-Pack
    'family': '52357333188946'     // 4-Pack
  };
  
  // 3. Add click handler to your CHECKOUT NOW button
  document.getElementById('buyNow').addEventListener('click', function() {
    
    // Get selected bundle (from your existing code)
    const selectedBundle = document.querySelector('.pill--bundle.pill--active').dataset.value;
    
    // Get all selected colors from your fan chips (from your existing code)
    const fanChips = document.querySelectorAll('.bundle-contents-chips .fan-chip');
    const colors = Array.from(fanChips).map(chip => {
      const label = chip.querySelector('.fan-chip__label');
      return label ? label.textContent.trim() : 'Stealth';
    });
    
    
    // Format colors as comma-separated string
    const colorString = colors.join(', ');
    
    // Get variant ID
    const variantId = 'gid://shopify/ProductVariant/' + BUNDLE_VARIANTS[selectedBundle];
    
    // Create checkout with color attribute
    client.checkout.create().then(function(checkout) {
      const lineItems = [{
        variantId: variantId,
        quantity: 1,
        customAttributes: [{
          key: 'Colors',
          value: colorString  // e.g. "black, white" or "violet, black, white, black"
        }]
      }];
      
      return client.checkout.addLineItems(checkout.id, lineItems);
    }).then(function(checkout) {
      // Redirect to Shopify checkout
      window.location.href = checkout.webUrl;
    }).catch(function(error) {
      console.error('Checkout error:', error);
      alert('Something went wrong. Please try again.');
    });
    
  });