/* ============================================
   orderWITHa4 — Global Constants & Utilities
   ============================================ */
window.esc = (str) => {
  if (!str) return '';
  return String(str).replace(/'/g, '&apos;').replace(/"/g, '&quot;');
};
window.cleanPriceNum = (str) => {
  if (typeof str !== 'string') str = String(str || "");
  // Remove currency prefix and split by decimal point to ignore cents
  let basePart = str.split('.')[0];
  let digits = basePart.replace(/[^0-9]/g, '');
  return parseInt(digits, 10) || 0;
};
const PAYHERE_MERCHANT_ID = "1211149"; // Sandbox ID
const IS_SANDBOX = true;

const catData = {
  'fan': { title: 'Fans & Cooling', icon: '🌀' },
  'oven': { title: 'Ovens & Grills', icon: '🍕' },
  'blender': { title: 'Blenders & Mixers', icon: '🥤' },
  'iron': { title: 'Irons', icon: '👔' },
  'ac': { title: 'Air Conditioners', icon: '❄️' },
  'light': { title: 'Lighting', icon: '💡' },
  'dispenser': { title: 'Water Dispensers & Kettles', icon: '💧' },
  'other': { title: 'Other Appliances', icon: '📦' }
};

// GLOBAL DATA SYNC & BACKUP
// CRITICAL: Capture the ORIGINAL products data from window.products BEFORE localStorage overrides it
if (typeof window.originalProducts === 'undefined' || window.originalProducts.length === 0) {
  try {
    if (typeof window.products !== 'undefined' && window.products.length > 0) {
      window.originalProducts = JSON.parse(JSON.stringify(window.products));
    } else {
      window.originalProducts = [];
    }
  } catch(e) { window.originalProducts = []; }
}

// Default initialization (Fallback)
window.products = window.products || [];
window.brands = window.brands || [];

// Override with Local Storage if available (Admin edits Cache)
if (localStorage.getItem('orderWITHa4_local_products')) {
  try {
    window.products = JSON.parse(localStorage.getItem('orderWITHa4_local_products'));
  } catch(e) {}
}
if (localStorage.getItem('orderWITHa4_local_brands')) {
  try {
    window.brands = JSON.parse(localStorage.getItem('orderWITHa4_local_brands'));
  } catch(e) {}
}

// Global scope aliases
var products = window.products;
var brands = window.brands;
var cart = [];
try {
  cart = JSON.parse(localStorage.getItem('orderWITHa4_cart')) || [];
} catch(e) {}
window.cart = cart;

// --- FIREBASE LIVE SYNC ---
function initStorefrontSync() {
  if (!window.firebaseDB) return;

  // Listen for Brands
  window.firebaseDB.ref('brands').on('value', (snapshot) => {
    const val = snapshot.val();
    if (val) {
      window.brands = val;
      brands = val;
      console.log("☁️ Brands updated from Cloud");
      if (typeof window.renderBrands === 'function') window.renderBrands();
    }
  });

  // Listen for Products
  window.firebaseDB.ref('products').on('value', (snapshot) => {
    const val = snapshot.val();
    if (val) {
      window.products = val;
      products = val;
      console.log("☁️ Products updated from Cloud");
      // Re-render everything that depends on products
      if (typeof window.renderCatalog === 'function') window.renderCatalog();
      if (typeof window.renderBrands === 'function') window.renderBrands(); 
    }
  });
}

// Start sync when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initStorefrontSync();
});

window.generateOrderID = function() {
  return 'ORD-' + Date.now();
};



window.getCategoryImage = function(desc) {
  desc = desc.toLowerCase();
  if (desc.includes('iron')) return { icon: '👔', type: 'Iron' };
  if (desc.includes('cooler')) return { icon: '🧊', type: 'Air Cooler' };
  if (desc.includes('heater')) return { icon: '♨️', type: 'Water Heater' };
  if (desc.includes('mixer') || desc.includes('grinder') || desc.includes('blender')) return { icon: '🥤', type: 'Blender/Mixer' };
  if (desc.includes('ceiling fan')) return { icon: '🔄', type: 'Ceiling Fan' };
  if (desc.includes('fan')) return { icon: '🌀', type: 'Fan' };
  if (desc.includes('air conditioner') || desc.includes('btu')) return { icon: '❄️', type: 'AC' };
  if (desc.includes('oven')) return { icon: '🍕', type: 'Oven' };
  if (desc.includes('light')) return { icon: '💡', type: 'Light' };
  if (desc.includes('water dispens') || desc.includes('kettle')) return { icon: '💧', type: 'Dispenser' };
  return { icon: '📦', type: 'Appliance' };
};

window.getCategoryClassification = function(desc) {
  if (!desc) return 'other';
  desc = desc.toLowerCase();
  if (desc.includes('iron')) return 'iron';
  if (desc.includes('ac ') || desc.includes('air conditioner') || desc.includes('btu')) return 'ac';
  if (desc.includes('oven')) return 'oven';
  if (desc.includes('light')) return 'light';
  if (desc.includes('water dispens') || desc.includes('kettle')) return 'dispenser';
  if (desc.includes('fan') || desc.includes('cooler')) return 'fan';
  if (desc.includes('mixer') || desc.includes('grinder') || desc.includes('blender')) return 'blender';
  return 'other';
};

/* ============================================
   UI HELPERS & RENDERERS
   ============================================ */

window.renderCatalog = function(searchQuery = '') {
  const container = document.getElementById('catalog-container');
  if (!container || !window.products) return;

  // Toggle other sections visibility on search
  const otherSections = ['home', 'products', 'brands', 'features', 'about'];
  otherSections.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = searchQuery ? 'none' : 'block';
  });

  const grouped = {};
  let totalVisible = 0;

  products.forEach((prod, index) => {
    prod.index = index;
    prod.uid = (prod.brand + '_' + (prod.item || 'item')).replace(/[^a-zA-Z0-9]/g, '_').toLowerCase() + '_' + index;
    
    if (prod.image) prod.image = prod.image.replace(/\\/g, '/');
    if (prod.gallery) prod.gallery = prod.gallery.map(g => g.replace(/\\/g, '/'));
    if (prod.variants) {
      prod.variants.forEach(v => { if (v.image) v.image = v.image.replace(/\\/g, '/'); });
    }

    if (searchQuery) {
      const s = searchQuery.toLowerCase();
      const matches = (prod.item || "").toLowerCase().includes(s) || 
                      (prod.description || "").toLowerCase().includes(s) || 
                      (prod.brand || "").toLowerCase().includes(s) ||
                      (prod.variants && prod.variants.some(v => (v.name || "").toLowerCase().includes(s)));
      if (!matches) return;
    }

    const cat = window.getCategoryClassification(prod.description) || 'other';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(prod);
    totalVisible++;
  });

  if (totalVisible === 0 && searchQuery) {
    container.innerHTML = `<div class="empty-state" style="text-align:center; padding:100px 20px;">
                              <h3 style="color:var(--text-secondary)">No products found for "${searchQuery}"</h3>
                              <p style="color:var(--text-muted)">Try a different keyword or browse our categories.</p>
                           </div>`;
    return;
  }

  let html = '';
  const order = ['fan', 'oven', 'blender', 'iron', 'ac', 'dispenser', 'light', 'other'];
  order.forEach(catKey => {
    if (!grouped[catKey] || grouped[catKey].length === 0) return;
    grouped[catKey].sort((a,b) => (a.brand || "").localeCompare(b.brand || ""));
    const info = catData[catKey];
    html += `<div id="cat-${catKey}" class="catalog-section" style="padding: 40px 0 20px;">
                <div class="section-header" style="text-align: left; margin-bottom: 30px;">
                    <span class="section-tag" style="display: inline-block;">${info.icon}</span>
                    <h2 style="display: inline-block; margin-left: 10px; margin-bottom: 0;">${info.title}</h2>
                </div>
                <div class="products-grid">`;
    grouped[catKey].forEach(prod => {
      html += window.createProductCardHtml(prod, prod.index);
    });
    html += `</div></div>`;
  });
  container.innerHTML = html;
  setTimeout(() => { document.querySelectorAll('.product-card').forEach(el => el.classList.add('visible')); }, 100);
};

window.renderBrands = function() {
  const grid = document.getElementById('brandsGrid');
  if (grid && window.brands) {
    let html = '';
    brands.forEach((b, index) => {
      // loading="lazy" on brand logos — don't load off-screen images until needed
      const logoHtml = b.logo ? `<img src="${b.logo}" alt="${b.name} Logo" loading="lazy" decoding="async" style="width: 100%; height: 100%; object-fit: contain;">` : `<div style="font-size:2rem;">🏷️</div>`;
      html += `<a href="brand.html?id=${b.id}" class="brand-card fade-in" style="animation-delay: ${index * 0.1}s">
          <div class="brand-icon" style="background:transparent; border:none;">${logoHtml}</div>
          <h3>${b.name}</h3>
          <p>${b.description}</p>
        </a>`;
    });
    grid.innerHTML = html;
    setTimeout(() => grid.querySelectorAll('.brand-card').forEach(el => el.classList.add('visible')), 100);
  }
};

window.setupSearch = function() {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        window.renderCatalog(e.target.value.trim().toLowerCase());
      }, 300); // 300ms debounce — reduces renders while typing
    });
  }
};

window.setupBackToTop = function() {
  const topBtn = document.getElementById('backToTop');
  if (!topBtn) return;
  let rafPending = false;
  window.addEventListener('scroll', () => {
    if (!rafPending) {
      rafPending = true;
      requestAnimationFrame(() => {
        if (window.scrollY > 500) topBtn.classList.add('show');
        else topBtn.classList.remove('show');
        rafPending = false;
      });
    }
  }, { passive: true }); // passive: true = browser won't wait for JS before scrolling
  topBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
};

/* ============================================
   🛒 SHOPPING CART & ORDER FLOW
   ============================================ */

window.addToCart = function(productName, variantName, price, image, uid) {
  const vGroup = document.getElementById(`variants-group-${uid}`);
  const cGroup = document.getElementById(`colors-group-${uid}`);
  let activeSelection = vGroup ? vGroup.querySelector('.color-tag.active') : (cGroup ? cGroup.querySelector('.color-tag.active') : null);

  if ((vGroup || cGroup) && !activeSelection) {
    const targetGroup = vGroup || cGroup;
    const variants = Array.from(targetGroup.querySelectorAll('.color-tag')).map(btn => btn.textContent.replace(' (Out)', '').trim());
    const variantLinks = variants.map(v => `<span class="alert-variant-tag">${v}</span>`).join('');
    window.showCustomAlert(`
      <div style="text-align:center;">
        <div class="alert-emoji">👋</div>
        <div class="alert-title">Select Style</div>
        <p class="alert-desc">Please choose a variant of <b>${productName}</b> to continue:</p>
        <div style="display:flex; flex-wrap:wrap; justify-content:center; gap:8px; margin-bottom:10px;">${variantLinks}</div>
        <button onclick="closeCustomAlert()" class="alert-btn-primary">OK, I UNDERSTAND</button>
      </div>
    `);
    return;
  }

  let finalName = productName;
  if (activeSelection) {
    if (activeSelection.classList.contains('variant-oos')) {
       window.showCustomAlert(`
         <div style="text-align:center;">
           <div class="alert-emoji" style="font-size:2.5rem; margin-bottom:15px; animation: none;">❌</div>
           <div class="alert-title" style="color:#ff4757; font-size:1.6rem; margin-bottom:10px;">Unavailable</div>
           <p class="alert-desc" style="margin-bottom:25px;">Sorry, this variant is currently <b>Out of Stock</b>.</p>
           <button onclick="closeCustomAlert()" class="alert-btn-primary" style="background:var(--gradient-1); border:none;">GO BACK</button>
         </div>
       `);
       return;
    }
    finalName = `${productName} (${activeSelection.textContent.replace(' (Out)', '').trim()})`;
  }

  const priceEl = document.getElementById(`price-${uid}`);
  const rawPriceText = priceEl ? priceEl.textContent : (price || '0');
  const finalPrice = window.cleanPriceNum(rawPriceText).toString(); 
  
  const imgEl   = document.getElementById(`img-${uid}`);
  const finalImage = image || (imgEl ? imgEl.src : '');

  const existingItem = cart.find(item => item.name === finalName);
  
  const origPriceEl = document.getElementById(`original-price-${uid}`);
  let finalOriginalPrice = origPriceEl ? window.cleanPriceNum(origPriceEl.textContent).toString() : '';

  // Fallback: If no original-price element was on the card, find it for MRP from backup data
  if (!finalOriginalPrice && window.originalProducts && window.originalProducts.length > 0) {
    const searchName = String(productName || "").trim().toLowerCase();
    const vNameOnly = activeSelection ? activeSelection.textContent.replace(' (Out)', '').trim().toLowerCase() : '';

    const source = window.originalProducts.find(p => {
      const pItem = String(p.item || p.name || "").trim().toLowerCase();
      return pItem === searchName;
    });

    if (source) {
      let finalSource = source;
      if (source.variants && source.variants.length > 0 && vNameOnly) {
        const variant = source.variants.find(v => String(v.name).trim().toLowerCase() === vNameOnly);
        if (variant) finalSource = variant;
      }
      
      const rawDBOriginal = finalSource.originalPrice || finalSource.price;
      if (rawDBOriginal) {
        finalOriginalPrice = window.cleanPriceNum(rawDBOriginal).toString();
      }
    }
  }
  
  // Last resort safety: if no original price found at all, use current price
  if (!finalOriginalPrice || finalOriginalPrice === "0") finalOriginalPrice = finalPrice;

  if (existingItem) {
    existingItem.qty += 1;
    // Keep prices synced in case they were updated in Admin
    existingItem.price = finalPrice;
    existingItem.originalPrice = finalOriginalPrice;
  } else {
    cart.push({ 
      name: finalName, 
      price: finalPrice, 
      originalPrice: finalOriginalPrice, 
      image: finalImage, 
      qty: 1 
    });
  }

  localStorage.setItem('orderWITHa4_cart', JSON.stringify(cart));
  updateBagUI();
  
  const cartBtn = document.querySelector(`#card-${uid} .btn-cart`);
  if (cartBtn) {
    const original = cartBtn.innerHTML; cartBtn.innerHTML = '✅';
    setTimeout(() => { cartBtn.innerHTML = original; }, 1500);
  }
  if (!document.getElementById('cartDrawer').classList.contains('active')) toggleCart();
};

window.toggleCart = function() {
  document.getElementById('cartDrawer').classList.toggle('active');
  document.getElementById('cartOverlay').classList.toggle('active');
};

function updateBagUI() {
  const container = document.getElementById('cartItems');
  const badge = document.getElementById('cartBadge');
  const totalDisplay = document.getElementById('cartTotalDisplay');
  const subtotalEl = document.getElementById('cartSubtotal');
  const savingsRow = document.getElementById('cartSavingsRow');
  const savingsDisplay = document.getElementById('cartSavingsDisplay');
  const clearBtn = document.getElementById('clearCartBtn');

  if (!container) return;

  // Sync Badge
  const totalItems = cart.reduce((sum, item) => sum + (parseInt(item.qty) || 0), 0);
  if (badge) badge.textContent = totalItems;

  if (!cart || cart.length === 0) {
    if (clearBtn) clearBtn.style.display = 'none';
    container.innerHTML = '<p class="empty-cart-msg">Your cart is empty.</p>';
    if (totalDisplay) totalDisplay.textContent = 'Rs. 0';
    if (subtotalEl) subtotalEl.textContent = 'Rs. 0';
    if (savingsRow) savingsRow.style.display = 'none';
    return;
  }

  if (clearBtn) clearBtn.style.display = 'block';
  let html = '';
  let grandTotal = 0;
  let subtotalMRP = 0;

  cart.forEach((item, index) => {
    if (!item) return;
    const pStr = String(item.price || "0");
    const qtyInt = parseInt(item.qty) || 1;
    const priceNum = window.cleanPriceNum(pStr);
    let mrpNum = 0;

    // Extract base product name & variant name from cart item
    const cartName = String(item.name || "");
    const nameClean = cartName.replace(/\s*\(.*\)$/, '').trim().toLowerCase();
    const variantMatch = cartName.match(/\((.*)\)$/);
    const variantName = variantMatch ? variantMatch[1].trim().toLowerCase() : '';

    // === STRATEGY 1: Check CURRENT products (window.products) for originalPrice field ===
    if (window.products && window.products.length > 0) {
      const curProd = window.products.find(p => {
        const pName = String(p.item || p.name || "").trim().toLowerCase();
        return pName === nameClean || nameClean.includes(pName) || pName.includes(nameClean);
      });
      if (curProd) {
        if (curProd.originalPrice) {
          mrpNum = Math.max(mrpNum, window.cleanPriceNum(curProd.originalPrice));
        }
        // Check variants too
        if (curProd.variants && variantName) {
          const cv = curProd.variants.find(v => String(v.name).trim().toLowerCase() === variantName);
          if (cv && cv.originalPrice) {
            mrpNum = Math.max(mrpNum, window.cleanPriceNum(cv.originalPrice));
          }
        }
      }
    }

    // === STRATEGY 2: Lookup TRUE MRP from originalProducts (products.js static backup) ===
    if (window.originalProducts && window.originalProducts.length > 0) {
      // Try multiple matching strategies: exact → includes → startsWith
      let srcProd = window.originalProducts.find(p => {
        const pItem = String(p.item || p.name || "").trim().toLowerCase();
        return pItem === nameClean;
      });
      if (!srcProd) {
        srcProd = window.originalProducts.find(p => {
          const pItem = String(p.item || p.name || "").trim().toLowerCase();
          return nameClean.includes(pItem) || pItem.includes(nameClean);
        });
      }

      if (srcProd) {
        let srcPrice = srcProd.price || '0';

        // For variant products, find matching variant price
        if (srcProd.variants && srcProd.variants.length > 0 && variantName) {
          const mv = srcProd.variants.find(v => 
            String(v.name).trim().toLowerCase() === variantName
          );
          if (mv) srcPrice = mv.price || srcPrice;
        }

        const lookupMRP = window.cleanPriceNum(srcPrice);
        if (lookupMRP > 0) {
          mrpNum = Math.max(mrpNum, lookupMRP);
        }
      }
    }

    // === STRATEGY 3: Fallback to cart item's own originalPrice ===
    if (item.originalPrice) {
      mrpNum = Math.max(mrpNum, window.cleanPriceNum(item.originalPrice));
    }

    const actualMRP = Math.max(priceNum, mrpNum);

    const lineTotal = priceNum * qtyInt;
    grandTotal  += lineTotal;
    subtotalMRP += (actualMRP * qtyInt);

    const originalDisplay = (actualMRP > priceNum) 
                            ? `<span class="cart-item-original" style="text-decoration: line-through; opacity: 0.5; font-size: 0.8rem; margin-right: 8px; color: #888;">Rs. ${actualMRP.toLocaleString()}</span>` 
                            : '';

    html += `<div class="cart-item fade-in-up" style="animation-delay: ${index * 0.08}s">
        <div class="cart-item-img">${item.image ? `<img src="${item.image}">` : '📦'}</div>
        <div class="cart-item-info">
          <h4>${item.name || 'Unnamed Item'}</h4>
          <div class="cart-item-price-container" style="display: flex; flex-direction: column; gap: 2px;">
            <div style="display: flex; align-items: center; gap: 5px;">
              ${originalDisplay}
              <span class="cart-item-price" style="font-weight: 700; color: var(--accent);">Rs. ${priceNum.toLocaleString()}</span>
            </div>
            <div style="font-size: 0.85rem; color: #aaa;">
              <span>${qtyInt} × Rs. ${priceNum.toLocaleString()}</span>
              <span style="font-weight: 700; color: #fff; margin-left: 5px;">= Rs. ${lineTotal.toLocaleString()}</span>
            </div>
          </div>
          <div class="cart-item-controls" style="margin-top: 10px;">
            <div class="qty-controls">
              <button class="qty-btn" onclick="updateQty(${index}, -1)">-</button>
              <span class="qty-val">${qtyInt}</span>
              <button class="qty-btn" onclick="updateQty(${index}, 1)">+</button>
            </div>
            <button class="remove-item" onclick="removeFromCart(${index})">Remove</button>
          </div>
        </div>
      </div>`;
  });

  container.innerHTML = html;

  const totalSavings = subtotalMRP - grandTotal;
  
  // Format with "Rs." and Locale String (commas)
  if (totalDisplay) totalDisplay.textContent = 'Rs. ' + Math.round(grandTotal).toLocaleString();
  if (subtotalEl) subtotalEl.textContent = 'Rs. ' + Math.round(subtotalMRP).toLocaleString();
  
  if (totalSavings > 1) { 
    if (savingsRow) savingsRow.style.display = 'flex';
    if (savingsDisplay) savingsDisplay.textContent = '- Rs. ' + Math.round(totalSavings).toLocaleString();
  } else {
    if (savingsRow) savingsRow.style.display = 'none';
  }
}

window.updateQty = function(index, change) {
  cart[index].qty += change;
  if (cart[index].qty <= 0) cart.splice(index, 1);
  localStorage.setItem('orderWITHa4_cart', JSON.stringify(cart));
  updateBagUI();
};

window.clearCart = function() {
  window.showCustomAlert(`
    <div style="text-align:center;">
      <div class="alert-emoji" style="margin-bottom:15px; display:inline-block; animation: waveHand 1.5s infinite;">
        <svg viewBox="0 0 24 24" fill="none" stroke="#ff4757" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="60" height="60"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
      </div>
      <div class="alert-title" style="color:#ff4757; font-size:1.6rem; margin-bottom:10px;">Clear Cart</div>
      <p class="alert-desc" style="margin-bottom:25px;">Are you sure you want to completely clear your cart? This action cannot be undone.</p>
      <div style="display:flex; gap:10px; justify-content:center;">
        <button onclick="closeCustomAlert()" class="alert-btn-primary" style="background:rgba(255,255,255,0.05); color:#fff; border:1px solid rgba(255,255,255,0.1); width:auto; flex:1;">CANCEL</button>
        <button onclick="confirmClearCart()" class="alert-btn-primary" style="background:#ff4757; color:#fff; border:none; width:auto; flex:1; box-shadow:0 10px 25px rgba(255, 71, 87, 0.2);">YES, CLEAR IT</button>
      </div>
    </div>
  `);
};

window.confirmClearCart = function() {
  cart = [];
  localStorage.setItem('orderWITHa4_cart', JSON.stringify(cart));
  updateBagUI();
  closeCustomAlert();
};

window.removeFromCart = function(index) {
  cart.splice(index, 1);
  localStorage.setItem('orderWITHa4_cart', JSON.stringify(cart));
  updateBagUI();
};

window.checkoutCart = function() {
  if (cart.length === 0) return;
  const orderID = window.generateOrderID();
  let message = `*ORDER REFERENCE: ${orderID}*\n\nItems:\n`;
  let grandTotal = 0;
  cart.forEach((item, i) => {
    const p = window.cleanPriceNum(item.price);
    const sub = p * item.qty;
    grandTotal += sub;
    message += `${i+1}. ${item.name} x ${item.qty} = Rs. ${sub.toLocaleString()}\n`;
  });
  message += `\n*TOTAL: Rs. ${grandTotal.toLocaleString()}*`;
  window.open(`https://wa.me/94726298987?text=${encodeURIComponent(message)}`, '_blank');
};

window.payWithPayHere = function() {
  if (!cart.length) return;
  const orderID = window.generateOrderID();
  const total = cart.reduce((s, i) => s + (window.cleanPriceNum(i.price) * i.qty), 0);
  
  const payment = {
    "sandbox": IS_SANDBOX, "merchant_id": PAYHERE_MERCHANT_ID, "order_id": orderID,
    "items": cart.map(i => i.name).join(', '), "amount": total.toFixed(2), "currency": "LKR",
    "first_name": "Customer", "last_name": "Name", "email": "customer@example.com", "phone": "0771234567",
    "address": "Colombo", "city": "Colombo", "country": "Sri Lanka"
  };
  payhere.onCompleted = () => { cart = []; localStorage.setItem('orderWITHa4_cart', '[]'); updateBagUI(); window.location.href = "checkout_success.html?order_id=" + orderID; };
  payhere.startPayment(payment);
};

/* ============================================
   PRODUCT CARD COMPONENT
   ============================================ */

window.createProductCardHtml = function(prod, index) {
  const uid = (prod.brand + '_' + (prod.item || 'item')).replace(/[^a-zA-Z0-9]/g, '_').toLowerCase() + '_' + (prod.index !== undefined ? prod.index : index);
  const mainImgRaw = prod.image || (prod.variants && prod.variants[0] ? prod.variants[0].image : '') || '';
  const mainImg = mainImgRaw.replace(/\\/g, '/');
  const gallery = (prod.gallery || []).map(g => g.replace(/\\/g, '/'));
  const allImgs = mainImg ? [mainImg, ...gallery] : gallery;

  const imgHtml = allImgs.length
    ? `<img id="img-${uid}" src="${allImgs[0]}" data-main-img="${allImgs[0]}" alt="${window.esc(prod.item)}" loading="lazy">`
    : `<div class="card-placeholder-icon">📦</div>`;

  const galControls = allImgs.length > 1
    ? `<div class="gallery-controls">
         <button class="gallery-btn" onclick="changeGalleryImage(event,'${uid}',-1)">&#10094;</button>
         <button class="gallery-btn" onclick="changeGalleryImage(event,'${uid}',1)">&#10095;</button>
       </div>
       <div class="gallery-dots">${allImgs.map((s,i) => `<span class="gallery-dot ${i===0?'active':''}" data-src="${s}"></span>`).join('')}</div>`
    : '';

  let displayPrice = prod.price || (prod.variants && prod.variants[0] ? prod.variants[0].price : '0');
  let displayOriginalPrice = prod.originalPrice || (prod.variants && prod.variants[0] ? prod.variants[0].originalPrice : '');

  let selectionsHtml = '';
  if (prod.variants && prod.variants.length) {
    const tags = prod.variants.map(v => {
      const vStock = v.stock || 'available';
      const oos = vStock === 'out_of_stock' ? 'variant-oos' : '';
      const vImg = (v.image || '').replace(/\\/g, '/');
      return `<button class="color-tag ${oos}" onclick="selectVariant(event,'${uid}','${window.esc(v.name)}','${window.esc(v.price||'0')}','${window.esc(vImg)}','${vStock}','${window.esc(v.originalPrice||'')}')">${v.name}${vStock==='out_of_stock'?' ✕':''}</button>`;
    }).join('');
    selectionsHtml = `<div class="variants-scroll" id="variants-group-${uid}">${tags}</div>`;
  } else if (prod.colors && prod.colors.length) {
    const tags = prod.colors.map(c =>
      `<button class="color-tag" onclick="selectColor(event,'${uid}','${window.esc(c)}')">${c}</button>`
    ).join('');
    selectionsHtml = `<div class="variants-scroll" id="colors-group-${uid}">${tags}</div>`;
  }

  const allOOS = prod.stock === 'out_of_stock' ||
    (prod.variants && prod.variants.length && prod.variants.every(v => v.stock === 'out_of_stock'));

  const cartSvg = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="18" height="18">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
    <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" stroke-width="2"/>
    <path d="M16 10a4 4 0 01-8 0" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  </svg>`;

  const actionsHtml = allOOS
    ? `<div id="actions-${uid}" class="oos-notice">⚠ Out of Stock</div>`
    : `<div id="actions-${uid}" class="card-actions">
         <button class="btn-cart" title="Add to Cart" onclick="addToCart('${window.esc(prod.item)}','','${displayPrice}','${mainImg}','${uid}')">${cartSvg}</button>
         <button class="btn-order" onclick="placeOrderWithColor('${window.esc(prod.item)}','${uid}')">Buy Now</button>
       </div>`;

  let discountBadgeHtml = '';
  let priceHtml = `<div id="price-container-${uid}" style="display:flex; flex-direction:column;">
                     <span class="price">Rs.&nbsp;<span id="price-${uid}">${displayPrice}</span></span>
                   </div>`;
  
  if (displayOriginalPrice && displayPrice) {
    const origNum = parseInt(displayOriginalPrice.replace(/,/g, ''));
    const currNum = parseInt(displayPrice.replace(/,/g, ''));
    if (origNum > currNum && currNum > 0) {
      const discountPct = Math.round(((origNum - currNum) / origNum) * 100);
      const savings = origNum - currNum;
      discountBadgeHtml = `<div class="discount-badge" id="discount-badge-${uid}">-${discountPct}% OFF</div>`;
      priceHtml = `<div id="price-container-${uid}" style="display:flex; flex-direction:column;">
                     <span class="original-price" id="original-price-${uid}"><del>Rs. ${displayOriginalPrice}</del></span>
                     <span class="price">Rs.&nbsp;<span id="price-${uid}">${displayPrice}</span></span>
                     <span class="savings-label" id="savings-${uid}">SAVE Rs. ${savings.toLocaleString()}</span>
                   </div>`;
    }
  } else {
    // Hidden structures for dynamic update
    discountBadgeHtml = `<div class="discount-badge" id="discount-badge-${uid}" style="display:none;"></div>`;
  }

  return `
    <div class="product-card" id="card-${uid}">
      <div class="product-image">
        ${discountBadgeHtml}
        <span class="oos-img-badge" id="oos-badge-${uid}" style="display:${allOOS ? 'block' : 'none'}">Out of Stock</span>
        ${imgHtml}
        ${galControls}
      </div>
      <div class="product-info">
        <div class="card-top">
          <span class="brand-badge">${prod.brand}</span>
          <h3 class="card-title" id="name-${uid}">${prod.item}</h3>
          <p class="card-desc">${prod.description}</p>
          ${selectionsHtml}
        </div>
        <div class="card-bottom">
          <div class="card-price">
            <span class="price-label">Price</span>
            ${priceHtml}
          </div>
          ${actionsHtml}
        </div>
      </div>
    </div>`;
};

window.selectVariant = function (event, uid, name, price, img, stock, originalPrice) {
  const group = document.getElementById(`variants-group-${uid}`);
  if (!group) return;
  group.querySelectorAll('.color-tag').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');

  // Update Price Area
  const priceContainer = document.getElementById(`price-container-${uid}`);
  const discountBadge = document.getElementById(`discount-badge-${uid}`);

  let newPriceHtml = `<span class="price">Rs.&nbsp;<span id="price-${uid}">${price}</span></span>`;
  
  if (originalPrice && price) {
    const origNum = parseInt(originalPrice.replace(/,/g, ''));
    const currNum = parseInt(price.replace(/,/g, ''));
    if (origNum > currNum && currNum > 0) {
      const discountPct = Math.round(((origNum - currNum) / origNum) * 100);
      const savings = origNum - currNum;
      if (discountBadge) {
        discountBadge.textContent = `-${discountPct}% OFF`;
        discountBadge.style.display = 'block';
      }
      newPriceHtml = `
        <span class="original-price" id="original-price-${uid}"><del>Rs. ${originalPrice}</del></span>
        <span class="price">Rs.&nbsp;<span id="price-${uid}">${price}</span></span>
        <span class="savings-label" id="savings-${uid}">SAVE Rs. ${savings.toLocaleString()}</span>`;
    } else {
      if (discountBadge) discountBadge.style.display = 'none';
    }
  } else {
    if (discountBadge) discountBadge.style.display = 'none';
  }
  
  if (priceContainer) priceContainer.innerHTML = newPriceHtml;
  const imgEl = document.getElementById(`img-${uid}`);
  if (imgEl) imgEl.src = img || imgEl.getAttribute('data-main-img');

  const actions   = document.getElementById(`actions-${uid}`);
  const oosBadge  = document.getElementById(`oos-badge-${uid}`);

  if (stock === 'out_of_stock') {
    if (oosBadge) oosBadge.style.display = 'block';
    actions.className = 'oos-notice';
    actions.innerHTML = '⚠ Out of Stock';
    actions.style = '';
  } else {
    if (oosBadge) oosBadge.style.display = 'none';
    actions.className = 'card-actions';
    actions.style = '';
    const itemName = document.getElementById(`name-${uid}`).textContent;
    actions.innerHTML = `
      <button class="btn-cart" title="Add to Cart" onclick="addToCart('${window.esc(itemName)}','${window.esc(name)}','${price}','','${uid}')">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="18" height="18">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
          <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" stroke-width="2"/>
          <path d="M16 10a4 4 0 01-8 0" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
      <button class="btn-order" onclick="placeOrderWithColor('${window.esc(itemName)}','${uid}', '${window.esc(name)}')">Buy Now</button>`;
  }
};

window.selectColor = function(event, uid, color) {
  const group = document.getElementById(`colors-group-${uid}`);
  if (group) {
    group.querySelectorAll('.color-tag').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
  }
};

window.placeOrderWithColor = function(name, uid, variant = '') {
  const priceEl = document.getElementById(`price-${uid}`);
  const imgEl   = document.getElementById(`img-${uid}`);
  
  const price = priceEl ? priceEl.textContent : '0';
  const img   = imgEl ? imgEl.src : '';
  
  window.addToCart(name, variant, price, img, uid);
  
  // Auto-open cart for "Buy Now"
  const cartOverlay = document.getElementById('cartOverlay');
  if (cartOverlay && !cartOverlay.classList.contains('active')) {
    window.toggleCart();
  }
};

window.changeGalleryImage = function(event, uid, dir) {
  event.stopPropagation();
  const card = document.getElementById(`card-${uid}`);
  const dots = card ? Array.from(card.querySelectorAll('.gallery-dot')) : [];
  if (!dots.length) return;
  let idx = dots.findIndex(d => d.classList.contains('active'));
  idx = (idx + dir + dots.length) % dots.length;
  const next = dots[idx];
  const img = document.getElementById(`img-${uid}`);
  if (img && next) {
    img.src = next.getAttribute('data-src');
    dots.forEach(d => d.classList.remove('active'));
    next.classList.add('active');
  }
};

/* ============================================
   CUSTOM ALERT
   ============================================ */

window.showCustomAlert = function(contentHtml) {
  const overlay = document.getElementById('customAlertOverlay');
  const content = document.getElementById('customAlertContent');
  if (overlay && content) {
    content.innerHTML = contentHtml;
    overlay.style.display = 'flex';
  }
};

window.closeCustomAlert = function() {
  const overlay = document.getElementById('customAlertOverlay');
  if (overlay) overlay.style.display = 'none';
};

/* ============================================
   INITIALIZATION
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Re-sync localStorage overrides BEFORE rendering
  try {
    const lp = localStorage.getItem('orderWITHa4_local_products');
    if (lp) window.products = JSON.parse(lp);
    const lb = localStorage.getItem('orderWITHa4_local_brands');
    if (lb) window.brands = JSON.parse(lb);
    products = window.products;
    brands = window.brands;
  } catch(e) {}

  window.setupSearch();
  window.setupBackToTop();
  window.renderBrands();
  window.renderCatalog();
  updateBagUI();

  // ---------------- Cart UI events ----------------
  const floatingCart = document.getElementById('floatingCart');
  const closeCart    = document.getElementById('closeCart');
  const cartOverlay  = document.getElementById('cartOverlay');
  const checkoutBtn  = document.getElementById('checkoutBtn');
  const payOnlineBtn = document.getElementById('payOnlineBtn');
  const clearCartBtn = document.getElementById('clearCartBtn');

  if (floatingCart) floatingCart.addEventListener('click', window.toggleCart);
  if (closeCart)    closeCart.addEventListener('click', window.toggleCart);
  if (cartOverlay)  cartOverlay.addEventListener('click', window.toggleCart);

  if (checkoutBtn)  checkoutBtn.addEventListener('click', window.checkoutCart);
  if (clearCartBtn) clearCartBtn.addEventListener('click', window.clearCart);
  if (payOnlineBtn) payOnlineBtn.addEventListener('click', () => {
    window.payWithPayHere();
  });

  // ---------------- Contact Form ----------------
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name    = document.getElementById('name').value.trim();
      const email   = document.getElementById('email').value.trim();
      const message = document.getElementById('message').value.trim();
      if (!name || !email || !message) return;
      const msg = `*New Inquiry*\nName: ${name}\nEmail: ${email}\nMsg: ${message}`;
      window.open(`https://wa.me/94726298987?text=${encodeURIComponent(msg)}`, '_blank');
      const success = document.getElementById('successMessage');
      if (success) { success.classList.add('show'); setTimeout(() => success.classList.remove('show'), 5000); }
      form.reset();
    });
  }

  // ---------------- Scroll animations ----------------
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }});
  }, { threshold: 0.1 });
  document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right').forEach(el => obs.observe(el));

  // ---------------- Navbar scroll (throttled with rAF) ----------------
  const nav = document.getElementById('navbar');
  if (nav) {
    let navRafPending = false;
    window.addEventListener('scroll', () => {
      if (!navRafPending) {
        navRafPending = true;
        requestAnimationFrame(() => {
          nav.classList.toggle('scrolled', window.scrollY > 50);
          navRafPending = false;
        });
      }
    }, { passive: true });
  }

  // ---------------- Mobile menu ----------------
  const ham   = document.getElementById('hamburger');
  const nLinks = document.getElementById('navLinks');
  if (ham && nLinks) ham.addEventListener('click', () => {
    ham.classList.toggle('active');
    nLinks.classList.toggle('active');
  });
});

// Gallery dot clicks (delegated)
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('gallery-dot')) {
    const dot  = e.target;
    const img  = dot.closest('.product-image').querySelector('img');
    const dots = dot.parentElement.querySelectorAll('.gallery-dot');
    if (img) img.src = dot.getAttribute('data-src');
    dots.forEach(d => d.classList.remove('active'));
    dot.classList.add('active');
  }
});
