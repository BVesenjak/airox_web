/*<![CDATA[*/
(function () {
var scriptURL = 'https://sdks.shopifycdn.com/buy-button/latest/buy-button-storefront.min.js';
if (window.ShopifyBuy) {
    if (window.ShopifyBuy.UI) {
    ShopifyBuyInit();
    } else {
    loadScript();
    }
} else {
    loadScript();
}
function loadScript() {
    var script = document.createElement('script');
    script.async = true;
    script.src = scriptURL;
    (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(script);
    script.onload = ShopifyBuyInit;
}
function ShopifyBuyInit() {
    var client = ShopifyBuy.buildClient({
    domain: 'jnr35f-j0.myshopify.com',
    storefrontAccessToken: '6d2b3371273563fc70b1554be9a6750d',
    });
    ShopifyBuy.UI.onReady(client).then(function (ui) {
    ui.createComponent('product', {
        id: '10493710762322',
        variantId: '52357333156178',
        node: document.getElementById('product-component-1767037426572'),
        moneyFormat: '%E2%82%AC%7B%7Bamount_with_comma_separator%7D%7D',
        options: {
    "product": {
        "styles": {
        "product": {
            "@media (min-width: 601px)": {
            "max-width": "calc(25% - 20px)",
            "margin-left": "20px",
            "margin-bottom": "50px"
            }
        },
        "button": {
            "font-weight": "bold",
            "font-size": "14px",
            "padding-top": "15px",
            "padding-bottom": "15px",
            ":hover": {
            "background-color": "#13b8ab"
            },
            "background-color": "#15ccbe",
            ":focus": {
            "background-color": "#13b8ab"
            },
            "padding-left": "100px",
            "padding-right": "100px"
        },
        "quantityInput": {
            "font-size": "14px",
            "padding-top": "15px",
            "padding-bottom": "15px"
        }
        },
        "contents": {
        "img": false,
        "title": false,
        "price": false,
        "options": false
        },
        "text": {
        "button": "Add to cart"
        }
    },
    "productSet": {
        "styles": {
        "products": {
            "@media (min-width: 601px)": {
            "margin-left": "-20px"
            }
        }
        }
    },
    "modalProduct": {
        "contents": {
        "img": false,
        "imgWithCarousel": true,
        "button": false,
        "buttonWithQuantity": true
        },
        "styles": {
        "product": {
            "@media (min-width: 601px)": {
            "max-width": "100%",
            "margin-left": "0px",
            "margin-bottom": "0px"
            }
        },
        "button": {
            "font-weight": "bold",
            "font-size": "14px",
            "padding-top": "15px",
            "padding-bottom": "15px",
            ":hover": {
            "background-color": "#13b8ab"
            },
            "background-color": "#15ccbe",
            ":focus": {
            "background-color": "#13b8ab"
            },
            "padding-left": "100px",
            "padding-right": "100px"
        },
        "quantityInput": {
            "font-size": "14px",
            "padding-top": "15px",
            "padding-bottom": "15px"
        }
        },
        "text": {
        "button": "Add to cart"
        }
    },
    "option": {},
    "cart": {
        "styles": {
        "button": {
            "font-weight": "bold",
            "font-size": "14px",
            "padding-top": "15px",
            "padding-bottom": "15px",
            ":hover": {
            "background-color": "#13b8ab"
            },
            "background-color": "#15ccbe",
            ":focus": {
            "background-color": "#13b8ab"
            }
        }
        },
        "text": {
        "total": "Subtotal",
        "button": "Checkout"
        }
    },
    "toggle": {
        "styles": {
        "toggle": {
            "font-weight": "bold",
            "background-color": "#15ccbe",
            ":hover": {
            "background-color": "#13b8ab"
            },
            ":focus": {
            "background-color": "#13b8ab"
            }
        },
        "count": {
            "font-size": "14px"
        }
        }
    }
    },
        });
        });
    }
})();
/*]]>*/

/*<![CDATA[*/
(function () {
var scriptURL = 'https://sdks.shopifycdn.com/buy-button/latest/buy-button-storefront.min.js';
if (window.ShopifyBuy) {
    if (window.ShopifyBuy.UI) {
    ShopifyBuyInit();
    } else {
    loadScript();
    }
} else {
    loadScript();
}
function loadScript() {
    var script = document.createElement('script');
    script.async = true;
    script.src = scriptURL;
    (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(script);
    script.onload = ShopifyBuyInit;
}
function ShopifyBuyInit() {
    var client = ShopifyBuy.buildClient({
    domain: 'jnr35f-j0.myshopify.com',
    storefrontAccessToken: '6d2b3371273563fc70b1554be9a6750d',
    });
    ShopifyBuy.UI.onReady(client).then(function (ui) {
    ui.createComponent('product', {
        id: '10493710762322',
        variantId: '52357333188946',
        node: document.getElementById('product-component-1767037492944'),
        moneyFormat: '%E2%82%AC%7B%7Bamount_with_comma_separator%7D%7D',
        options: {
    "product": {
        "styles": {
        "product": {
            "@media (min-width: 601px)": {
            "max-width": "calc(25% - 20px)",
            "margin-left": "20px",
            "margin-bottom": "50px"
            }
        },
        "button": {
            "font-weight": "bold",
            "font-size": "14px",
            "padding-top": "15px",
            "padding-bottom": "15px",
            ":hover": {
            "background-color": "#13b8ab"
            },
            "background-color": "#15ccbe",
            ":focus": {
            "background-color": "#13b8ab"
            },
            "padding-left": "100px",
            "padding-right": "100px"
        },
        "quantityInput": {
            "font-size": "14px",
            "padding-top": "15px",
            "padding-bottom": "15px"
        }
        },
        "contents": {
        "img": false,
        "title": false,
        "price": false,
        "options": false
        },
        "text": {
        "button": "Add to cart"
        },
        "variantId": "52357333188946"
    },
    "productSet": {
        "styles": {
        "products": {
            "@media (min-width: 601px)": {
            "margin-left": "-20px"
            }
        }
        }
    },
    "modalProduct": {
        "contents": {
        "img": false,
        "imgWithCarousel": true,
        "button": false,
        "buttonWithQuantity": true
        },
        "styles": {
        "product": {
            "@media (min-width: 601px)": {
            "max-width": "100%",
            "margin-left": "0px",
            "margin-bottom": "0px"
            }
        },
        "button": {
            "font-weight": "bold",
            "font-size": "14px",
            "padding-top": "15px",
            "padding-bottom": "15px",
            ":hover": {
            "background-color": "#13b8ab"
            },
            "background-color": "#15ccbe",
            ":focus": {
            "background-color": "#13b8ab"
            },
            "padding-left": "100px",
            "padding-right": "100px"
        },
        "quantityInput": {
            "font-size": "14px",
            "padding-top": "15px",
            "padding-bottom": "15px"
        }
        },
        "text": {
        "button": "Add to cart"
        }
    },
    "option": {},
    "cart": {
        "styles": {
        "button": {
            "font-weight": "bold",
            "font-size": "14px",
            "padding-top": "15px",
            "padding-bottom": "15px",
            ":hover": {
            "background-color": "#13b8ab"
            },
            "background-color": "#15ccbe",
            ":focus": {
            "background-color": "#13b8ab"
            }
        }
        },
        "text": {
        "total": "Subtotal",
        "button": "Checkout"
        }
    },
    "toggle": {
        "styles": {
        "toggle": {
            "font-weight": "bold",
            "background-color": "#15ccbe",
            ":hover": {
            "background-color": "#13b8ab"
            },
            ":focus": {
            "background-color": "#13b8ab"
            }
        },
        "count": {
            "font-size": "14px"
        }
        }
    }
    },
        });
        });
    }
})();
/*]]>*/

/*<![CDATA[*/
(function () {
  var scriptURL = 'https://sdks.shopifycdn.com/buy-button/latest/buy-button-storefront.min.js';
  if (window.ShopifyBuy) {
    if (window.ShopifyBuy.UI) {
      ShopifyBuyInit();
    } else {
      loadScript();
    }
  } else {
    loadScript();
  }
  function loadScript() {
    var script = document.createElement('script');
    script.async = true;
    script.src = scriptURL;
    (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(script);
    script.onload = ShopifyBuyInit;
  }
  function ShopifyBuyInit() {
    var client = ShopifyBuy.buildClient({
      domain: 'jnr35f-j0.myshopify.com',
      storefrontAccessToken: '6d2b3371273563fc70b1554be9a6750d',
    });
    ShopifyBuy.UI.onReady(client).then(function (ui) {
      ui.createComponent('product', {
        id: '10493710762322',
          variantId: '52357333156178',
        node: document.getElementById('product-component-1767471363799'),
        moneyFormat: '%E2%82%AC%7B%7Bamount_with_comma_separator%7D%7D',
        options: {
  "product": {
    "styles": {
      "product": {
        "@media (min-width: 601px)": {
          "max-width": "calc(25% - 20px)",
          "margin-left": "20px",
          "margin-bottom": "50px"
        }
      },
      "button": {
        "font-weight": "bold",
        "font-size": "14px",
        "padding-top": "15px",
        "padding-bottom": "15px",
        ":hover": {
          "background-color": "#13b8ab"
        },
        "background-color": "#15ccbe",
        ":focus": {
          "background-color": "#13b8ab"
        },
        "padding-left": "100px",
        "padding-right": "100px"
      },
      "quantityInput": {
        "font-size": "14px",
        "padding-top": "15px",
        "padding-bottom": "15px"
      }
    },
    "contents": {
      "img": false,
      "title": false,
      "price": false,
      "options": false
    },
    "text": {
      "button": "Add to cart"
    }
  },
  "productSet": {
    "styles": {
      "products": {
        "@media (min-width: 601px)": {
          "margin-left": "-20px"
        }
      }
    }
  },
  "modalProduct": {
    "contents": {
      "img": false,
      "imgWithCarousel": true,
      "button": false,
      "buttonWithQuantity": true
    },
    "styles": {
      "product": {
        "@media (min-width: 601px)": {
          "max-width": "100%",
          "margin-left": "0px",
          "margin-bottom": "0px"
        }
      },
      "button": {
        "font-weight": "bold",
        "font-size": "14px",
        "padding-top": "15px",
        "padding-bottom": "15px",
        ":hover": {
          "background-color": "#13b8ab"
        },
        "background-color": "#15ccbe",
        ":focus": {
          "background-color": "#13b8ab"
        },
        "padding-left": "100px",
        "padding-right": "100px"
      },
      "quantityInput": {
        "font-size": "14px",
        "padding-top": "15px",
        "padding-bottom": "15px"
      }
    },
    "text": {
      "button": "Add to cart"
    }
  },
  "option": {},
  "cart": {
    "styles": {
      "button": {
        "font-weight": "bold",
        "font-size": "14px",
        "padding-top": "15px",
        "padding-bottom": "15px",
        ":hover": {
          "background-color": "#13b8ab"
        },
        "background-color": "#15ccbe",
        ":focus": {
          "background-color": "#13b8ab"
        }
      }
    },
    "text": {
      "total": "Subtotal",
      "button": "Checkout"
    }
  },
  "toggle": {
    "styles": {
      "toggle": {
        "font-weight": "bold",
        "background-color": "#15ccbe",
        ":hover": {
          "background-color": "#13b8ab"
        },
        ":focus": {
          "background-color": "#13b8ab"
        }
      },
      "count": {
        "font-size": "14px"
      }
    }
  }
},
      });
    });
  }
})();
/*]]>*/

/*<![CDATA[*/
(function () {
  var scriptURL = 'https://sdks.shopifycdn.com/buy-button/latest/buy-button-storefront.min.js';
  if (window.ShopifyBuy) {
    if (window.ShopifyBuy.UI) {
      ShopifyBuyInit();
    } else {
      loadScript();
    }
  } else {
    loadScript();
  }
  function loadScript() {
    var script = document.createElement('script');
    script.async = true;
    script.src = scriptURL;
    (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(script);
    script.onload = ShopifyBuyInit;
  }
  function ShopifyBuyInit() {
    var client = ShopifyBuy.buildClient({
      domain: 'jnr35f-j0.myshopify.com',
      storefrontAccessToken: '6d2b3371273563fc70b1554be9a6750d',
    });
    ShopifyBuy.UI.onReady(client).then(function (ui) {
      ui.createComponent('product', {
        id: '10493710762322',
          variantId: '52357333188946',
        node: document.getElementById('product-component-1767471509348'),
        moneyFormat: '%E2%82%AC%7B%7Bamount_with_comma_separator%7D%7D',
        options: {
  "product": {
    "styles": {
      "product": {
        "@media (min-width: 601px)": {
          "max-width": "calc(25% - 20px)",
          "margin-left": "20px",
          "margin-bottom": "50px"
        }
      },
      "button": {
        "font-weight": "bold",
        "font-size": "14px",
        "padding-top": "15px",
        "padding-bottom": "15px",
        ":hover": {
          "background-color": "#13b8ab"
        },
        "background-color": "#15ccbe",
        ":focus": {
          "background-color": "#13b8ab"
        },
        "padding-left": "100px",
        "padding-right": "100px"
      },
      "quantityInput": {
        "font-size": "14px",
        "padding-top": "15px",
        "padding-bottom": "15px"
      }
    },
    "buttonDestination": "checkout",
    "contents": {
      "img": false,
      "title": false,
      "price": false,
      "options": false
    },
    "text": {
      "button": "Buy now"
    },
    "variantId": "52357333188946"
  },
  "productSet": {
    "styles": {
      "products": {
        "@media (min-width: 601px)": {
          "margin-left": "-20px"
        }
      }
    }
  },
  "modalProduct": {
    "contents": {
      "img": false,
      "imgWithCarousel": true,
      "button": false,
      "buttonWithQuantity": true
    },
    "styles": {
      "product": {
        "@media (min-width: 601px)": {
          "max-width": "100%",
          "margin-left": "0px",
          "margin-bottom": "0px"
        }
      },
      "button": {
        "font-weight": "bold",
        "font-size": "14px",
        "padding-top": "15px",
        "padding-bottom": "15px",
        ":hover": {
          "background-color": "#13b8ab"
        },
        "background-color": "#15ccbe",
        ":focus": {
          "background-color": "#13b8ab"
        },
        "padding-left": "100px",
        "padding-right": "100px"
      },
      "quantityInput": {
        "font-size": "14px",
        "padding-top": "15px",
        "padding-bottom": "15px"
      }
    },
    "text": {
      "button": "Add to cart"
    }
  },
  "option": {},
  "cart": {
    "styles": {
      "button": {
        "font-weight": "bold",
        "font-size": "14px",
        "padding-top": "15px",
        "padding-bottom": "15px",
        ":hover": {
          "background-color": "#13b8ab"
        },
        "background-color": "#15ccbe",
        ":focus": {
          "background-color": "#13b8ab"
        }
      }
    },
    "text": {
      "total": "Subtotal",
      "button": "Checkout"
    }
  },
  "toggle": {
    "styles": {
      "toggle": {
        "font-weight": "bold",
        "background-color": "#15ccbe",
        ":hover": {
          "background-color": "#13b8ab"
        },
        ":focus": {
          "background-color": "#13b8ab"
        }
      },
      "count": {
        "font-size": "14px"
      }
    }
  }
},
      });
    });
  }
})();
/*]]>*/

