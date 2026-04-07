/**
 * Premium Admin Dashboard Logic — orderWITHa4
 */

window.esc = (str) => String(str || "").replace(/'/g, '&apos;').replace(/"/g, '&quot;');

let localProducts = [];
let localBrands = [];
let orders = JSON.parse(localStorage.getItem('orderWITHa4_local_orders')) || JSON.parse(localStorage.getItem('orderWITHa4_orders')) || [];
let salesChart, brandChart;

// Initialize local data from localStorage first as a fallback/loading state
try {
    localProducts = JSON.parse(localStorage.getItem('orderWITHa4_local_products')) || [...products];
    localBrands = JSON.parse(localStorage.getItem('orderWITHa4_local_brands')) || [...brands];
} catch(e) {
    localProducts = [...products];
    localBrands = [...brands];
}

document.addEventListener('DOMContentLoaded', () => {
    if (sessionStorage.getItem('adminAuth') === 'true') {
        unlockDashboard();
    }
});

function checkPass() {
    const pass = document.getElementById('adminPass').value;
    if (pass === 'admin123') {
        sessionStorage.setItem('adminAuth', 'true');
        unlockDashboard();
    } else {
        document.getElementById('loginError').style.display = 'block';
    }
}

function logout() {
    sessionStorage.removeItem('adminAuth');
    location.reload();
}

function unlockDashboard() {
    document.getElementById('loginOverlay').style.display = 'none';
    populateBrandSelect();
    updateDashboard();
    initCharts();
    initFirebaseSync(); // Start syncing with the cloud
}

function initFirebaseSync() {
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');
    
    if (statusText) statusText.innerText = "Connecting...";

    if (!window.firebaseDB) {
        console.error("Firebase not initialized!");
        if (statusText) statusText.innerText = "Setup Error";
        return;
    }

    const productsRef = window.firebaseDB.ref('products');
    const brandsRef = window.firebaseDB.ref('brands');

    // Fetch Brands
    brandsRef.once('value').then(snapshot => {
        const val = snapshot.val();
        if (val) {
            localBrands = val;
            console.log("✅ Brands synced from Firebase");
        } else {
            console.log("📤 Migrating brands to Firebase...");
            brandsRef.set(localBrands);
        }
        
        // Update Status to Online
        if (statusDot) {
            statusDot.style.background = "#00ab55";
            statusDot.style.boxShadow = "0 0 10px #00ab55";
        }
        if (statusText) statusText.innerText = "Cloud Online";

        populateBrandSelect();
        renderBrandsTable();
    }).catch(err => {
        console.error("Firebase Error:", err);
        if (statusText) statusText.innerText = "Sync Failed";
    });

    // Fetch Products
    productsRef.once('value').then(snapshot => {
        const val = snapshot.val();
        if (val) {
            localProducts = val;
            console.log("✅ Products synced from Firebase");
        } else {
            console.log("📤 Migrating products to Firebase...");
            productsRef.set(localProducts);
        }
        renderProductsTable();
        calculateStats();
    });
}

function populateBrandSelect() {
    const select = document.getElementById('prodBrand');
    if (!select) return;
    select.innerHTML = localBrands.map(b => `<option value="${b.id}">${b.name}</option>`).join('');
}

// --- VIEW NAVIGATION ---
function showView(viewId, btn) {
    const views = document.querySelectorAll('.admin-view');
    views.forEach(v => {
        v.style.display = 'none';
        v.style.animation = 'none';
    });

    const activeView = document.getElementById(viewId + '-view');
    activeView.style.display = 'block';
    activeView.style.animation = 'fadeIn 0.5s ease-out forwards';

    // Update active button
    if (btn) {
        document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    }

    // Update title text
    const titles = {
        'dashboard': ['Statistics Overview', 'Enterprise Resource Management'],
        'items': ['Inventory Assets', 'Control your product catalog'],
        'brands': ['Brand Ecosystem', 'Manage labels and identities'],
        'sales': ['Revenue Ledger', 'Detailed transaction analysis'],
        'analytics': ['Performance Insights', 'Visual data dynamics']
    };
    document.getElementById('viewTitleText').textContent = titles[viewId][0];
    document.getElementById('viewDescText').textContent = titles[viewId][1];

    // Show sync button on items and brands views
    document.getElementById('btnCode').style.display = (viewId === 'items' || viewId === 'brands') ? 'block' : 'none';

    if (viewId === 'items') renderProductsTable();
    if (viewId === 'brands') renderBrandsTable();
    if (viewId === 'analytics') updateCharts();
}

// --- DASHBOARD & SALES ---
function updateDashboard() {
    renderProductsTable();
    renderBrandsTable();
    renderOrdersTable();
    calculateStats();
}

function calculateStats() {
    let revenue = 0;
    orders.forEach(o => revenue += (parseFloat(o.total) || 0));
    
    document.getElementById('stat-revenue').textContent = 'Rs. ' + revenue.toLocaleString();
    document.getElementById('stat-orders').textContent = orders.length;
    document.getElementById('stat-products').textContent = localProducts.length;
}

function renderOrdersTable() {
    const recentBody = document.getElementById('recentOrdersBody');
    const fullBody = document.getElementById('fullSalesBody');
    if (!recentBody || !fullBody) return;

    recentBody.innerHTML = '';
    fullBody.innerHTML = '';

    const sorted = [...orders].sort((a,b) => new Date(b.date) - new Date(a.date));

    sorted.forEach((o, i) => {
        const dateStr = new Date(o.date).toLocaleString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' });
        const itemsStr = o.items.map(it => `${it.name} (x${it.qty})`).join(', ');
        const badgeClass = o.status === 'Paid' || o.status === 'Delivered' ? 'status-paid' : 'status-pending';

        const rowHtml = `
            <tr>
                <td style="font-family:monospace; color:var(--accent); font-weight:700;">#${o.id.split('-').pop()}</td>
                <td>${dateStr}</td>
                <td style="font-weight:700;">Rs. ${o.total.toLocaleString()}</td>
                <td>${o.type}</td>
                <td><span style="font-size:0.75rem; padding:4px 10px; border-radius:20px; background:rgba(255,255,255,0.05); border:1px solid var(--glass-border);">${o.status}</span></td>
            </tr>
        `;

        const fullRowHtml = `
            <tr>
                <td style="font-family:monospace; color:var(--accent);">${o.id}</td>
                <td>${dateStr}</td>
                <td style="max-width:300px; font-size:0.8rem; color:var(--text-muted);">${itemsStr}</td>
                <td style="font-weight:700;">Rs. ${o.total.toLocaleString()}</td>
                <td><span style="font-size:0.7rem; font-weight:700;">${o.status.toUpperCase()}</span></td>
            </tr>
        `;

        if (i < 5) recentBody.innerHTML += rowHtml;
        fullBody.innerHTML += fullRowHtml;
    });
}

function clearOrders() {
    if (confirm('CAUTION: This will delete all order history. Continue?')) {
        localStorage.removeItem('orderWITHa4_orders');
        orders = [];
        updateDashboard();
    }
}

// --- PRODUCT MANAGEMENT ---
function filterProducts() {
    const query = document.getElementById('productSearch').value.toLowerCase();
    const filtered = localProducts.filter(p => 
        (p.item && p.item.toLowerCase().includes(query)) || 
        (p.brand && p.brand.toLowerCase().includes(query)) || 
        (p.description && p.description.toLowerCase().includes(query)) ||
        (p.variants && p.variants.some(v => v.name.toLowerCase().includes(query))) ||
        (p.colors && p.colors.some(c => c.toLowerCase().includes(query)))
    );
    renderProductsTable(filtered);
    
    // AUTO-EXPAND grouped rows if searching
    if (query.length > 0) {
        document.querySelectorAll('tr[class^="brand-row-"]').forEach(row => {
            row.style.display = 'table-row';
        });
        document.querySelectorAll('span[id^="toggle-icon-"]').forEach(icon => {
            icon.style.transform = 'rotate(90deg)';
        });
    }
}

function toggleBrandGroup(brandId) {
    const rows = document.querySelectorAll(`.brand-row-${brandId}`);
    const toggleIcon = document.getElementById(`toggle-icon-${brandId}`);
    if (rows.length === 0) return;
    
    const isHidden = rows[0].style.display === 'none';
    rows.forEach(row => {
        row.style.display = isHidden ? 'table-row' : 'none';
    });
    if (toggleIcon) {
        toggleIcon.style.transform = isHidden ? 'rotate(90deg)' : 'rotate(0deg)';
    }
}

function renderProductsTable(dataToRender = localProducts) {
    const tbody = document.getElementById('productTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    // Step 1: Group items by brand (Handle undefined/empty brands)
    const grouped = {};
    dataToRender.forEach(p => {
        const b = p.brand || 'Uncategorized';
        if (!grouped[b]) grouped[b] = [];
        grouped[b].push(p);
    });

        // Step 2: Sort brands alphabetically
    const sortedBrands = Object.keys(grouped).sort();

    sortedBrands.forEach((brandName, bIdx) => {
        const brandId = `brand-${bIdx}`;
        // Add a brand header row (Clickable)
        const headerRow = document.createElement('tr');
        headerRow.style.cursor = 'pointer';
        headerRow.onclick = () => toggleBrandGroup(brandId);
        headerRow.innerHTML = `
            <td colspan="7" style="background: rgba(0, 212, 255, 0.08); padding: 15px 20px; border-bottom: 1px solid var(--glass-border); transition: 0.3s; user-select: none;">
                <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 15px;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <span id="toggle-icon-${brandId}" style="display: inline-block; transition: 0.3s; font-size: 0.8rem; opacity: 0.7;">▶</span>
                        <span style="font-size: 1.1rem; font-weight: 800; color: var(--accent); text-transform: uppercase; letter-spacing: 1px;">🏷️ ${brandName}</span>
                        <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600; padding: 2px 8px; background: rgba(255,255,255,0.05); border-radius: 10px;">${grouped[brandName].length} Items</span>
                    </div>
                    
                    <div style="display: flex; align-items: center; gap: 10px;" onclick="event.stopPropagation()">
                        <div style="display: flex; gap: 5px; align-items: center; background: rgba(255,255,255,0.05); padding: 5px 10px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1);">
                            <span style="font-size: 0.6rem; color: var(--text-muted); font-weight: 700;">BULK % :</span>
                            <input type="number" id="bulk-pct-${bIdx}" placeholder="%" style="width: 45px; background: none; border: none; color: var(--accent); text-align: center; font-weight: 800; outline: none; font-size: 0.8rem;">
                            <button onclick="bulkApplyDiscount('${window.esc(brandName)}', ${bIdx})" style="background: var(--accent); color: #000; border: none; padding: 4px 10px; border-radius: 6px; font-weight: 800; cursor: pointer; font-size: 0.65rem;">APPLY ALL</button>
                        </div>
                        <button onclick="bulkResetDiscount('${window.esc(brandName)}')" style="background: rgba(255,255,255,0.05); color: #fff; border: 1px solid rgba(255,255,255,0.1); padding: 5px 12px; border-radius: 10px; font-weight: 700; cursor: pointer; font-size: 0.65rem;">RESET ALL</button>
                    </div>

                    <span style="font-size: 0.7rem; color: var(--accent); opacity: 0.5; font-weight: 700; letter-spacing: 1px;">CLICK GROUP TO TOGGLE</span>
                </div>
            </td>
        `;
        tbody.appendChild(headerRow);

        // STABLE SORT: Create a copy before sorting to avoid modifying original mapping
        const itemsInBrand = [...grouped[brandName]].sort((a, b) => (a.item || "").localeCompare(b.item || ""));

        itemsInBrand.forEach(p => {
            // FIND TRUE INDEX: Use a unique ID check
            const realIndex = localProducts.findIndex(lp => (lp.uid && p.uid && lp.uid === p.uid) || (lp.item === p.item && lp.brand === p.brand));
            const row = document.createElement('tr');
            row.className = `brand-row-${brandId}`;
            row.style.display = 'none'; // START COLLAPSED FOR CLEAN LOOK
            
            const priceDisplay = p.price ? `Rs. ${p.price}` : 'Variants';
            const imgSrc = p.image || (p.variants && p.variants[0] ? p.variants[0].image : '') || '';
            const statusBadge = p.stock === 'out_of_stock' 
                ? '<span style="font-size:0.75rem; padding:4px 10px; border-radius:20px; background:rgba(255,59,59,0.1); color:#ff3b3b; border:1px solid rgba(255,59,59,0.2);">Out of Stock</span>'
                : '<span style="font-size:0.75rem; padding:4px 10px; border-radius:20px; background:rgba(0,171,85,0.1); color:#00ab55; border:1px solid rgba(0,171,85,0.2);">Available</span>';
            
            let variantDisplay = '';
            const displayVariants = (p.variants && p.variants.length > 0) ? p.variants : 
                                   (p.colors && p.colors.length > 0 ? p.colors.map(c => ({ name: c, stock: 'available' })) : []);

            if (displayVariants.length > 0) {
                variantDisplay = `<div style="margin-top:8px; display:flex; flex-wrap:wrap; gap:5px;">`;
                displayVariants.forEach(v => {
                    const vStockColor = v.stock === 'out_of_stock' ? '#ff3b3b' : '#00ab55';
                    const vStockBg = v.stock === 'out_of_stock' ? 'rgba(255,59,59,0.1)' : 'rgba(0,171,85,0.1)';
                    variantDisplay += `<span style="font-size:0.65rem; padding:2px 6px; border-radius:4px; background:${vStockBg}; color:${vStockColor}; border:1px solid ${vStockColor}33;">${v.name}</span>`;
                });
                variantDisplay += `</div>`;
            }

            row.innerHTML = `
                <td>
                    <div style="font-weight:700; color:#fff;">${p.item}</div>
                    <div style="font-size:0.75rem; color:var(--text-muted); max-width:200px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${p.description}</div>
                    ${variantDisplay}
                </td>
                <td><img src="${imgSrc}" class="img-preview" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2244%22 height=%2244%22><rect width=%22100%%22 height=%22100%%22 fill=%22%23111%22/><text x=%2250%%22 y=%2250%%22 fill=%22%23444%22 dy=%22.3em%22 text-anchor=%22middle%22>📦</text></svg>'"></td>
                <td style="text-transform: capitalize; font-weight:500;">${p.brand}</td>
                <td>${statusBadge}</td>
                <td style="font-weight:700;">${priceDisplay}</td>
                <td style="text-align:right;">
                    <div style="display:flex; gap:8px; justify-content:flex-end;">
                      <button class="action-btn edit-btn" onclick="openEditModal(${realIndex})">✎</button>
                      <button class="action-btn delete-btn" onclick="deleteProduct(${realIndex})">✕</button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    });
}

const pModal = document.getElementById('productModal');
const vList = document.getElementById('variantsList');

function openAddModal() {
    populateBrandSelect();
    document.getElementById('modalTitle').textContent = 'Asset Registration';
    document.getElementById('editIndex').value = '';
    document.getElementById('productForm').reset();
    document.getElementById('prodStock').value = 'available';
    vList.innerHTML = '';
    updateLivePreview('prodImage', 'prodImagePreview');
    pModal.style.display = 'flex';
}

function openEditModal(index) {
    if (index === -1 || !localProducts[index]) return;
    populateBrandSelect();
    const p = localProducts[index];
    document.getElementById('modalTitle').textContent = 'Modify Asset';
    document.getElementById('editIndex').value = index;
    document.getElementById('prodBrand').value = p.brand || '';
    document.getElementById('prodItem').value = p.item || '';
    document.getElementById('prodDesc').value = p.description;
    
    // MRP Detection: If price exists but originalPrice is missing, treat price as MRP.
    const hasOriginal = p.originalPrice && p.originalPrice !== '';
    if (hasOriginal) {
        document.getElementById('prodOriginalPrice').value = p.originalPrice;
        document.getElementById('prodPrice').value = p.price || '';
    } else {
        document.getElementById('prodOriginalPrice').value = p.price || '';
        document.getElementById('prodPrice').value = ''; 
    }

    document.getElementById('prodStock').value = p.stock || 'available';
    document.getElementById('prodImage').value = p.image || '';

    // Load Gallery
    const galleryList = document.getElementById('galleryList');
    galleryList.innerHTML = '';
    if (p.gallery) {
        p.gallery.forEach(img => addGalleryField(img));
    }

    vList.innerHTML = '';
    if (p.variants && p.variants.length > 0) {
        p.variants.forEach(v => addVariantField(v.name, v.price, v.image, v.stock, v.originalPrice));
    } else if (p.colors && p.colors.length > 0) {
        // Handle legacy colors data
        p.colors.forEach(color => addVariantField(color, p.price, '', 'available', p.originalPrice));
    }
    
    // Initial Previews
    updateLivePreview('prodImage', 'prodImagePreview');
    pModal.style.display = 'flex';
}

function closeModal() { pModal.style.display = 'none'; }

function addVariantField(name='', price='', image='', stock='available', originalPrice='') {
    const id = 'v-' + Date.now() + Math.random().toString(36).substr(2, 5);
    const div = document.createElement('div');
    div.className = 'variant-row';
    div.id = `row-${id}`;
    div.style = 'display: grid; grid-template-columns: 1fr auto; gap: 10px; margin-bottom: 20px; padding: 15px; background: rgba(255,255,255,0.02); border-radius: 12px; border: 1px solid var(--glass-border);';
    const stockVal = stock || 'available';

    // MRP Detection for Variants
    let displayOrig = originalPrice;
    let displaySale = price;
    if (!originalPrice && price) {
        displayOrig = price;
        displaySale = '';
    }

    div.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 10px;">
            <div class="form-group">
                <label style="font-size:0.65rem;">Flavor/Model</label>
                <input type="text" placeholder="e.g. 64GB" class="v-name v-input" value="${name}">
            </div>
            <div class="form-group">
                <label style="font-size:0.65rem;">MRP (Original)</label>
                <input type="text" placeholder="Full Price" class="v-orig-price v-input" value="${displayOrig}" id="orig-${id}">
            </div>
            <div class="form-group">
                <label style="font-size:0.65rem;">Sale Price</label>
                <input type="text" placeholder="Discounted" class="v-price v-input" value="${displaySale}" id="sale-${id}">
            </div>
            <div class="form-group">
                <label style="font-size:0.65rem;">Stock</label>
                <select class="v-stock v-input" style="cursor:pointer;">
                    <option value="available"${stockVal === 'available' ? ' selected' : ''} style="color:#000;">Available</option>
                    <option value="out_of_stock"${stockVal === 'out_of_stock' ? ' selected' : ''} style="color:#000;">Out of Stock</option>
                </select>
            </div>
            <div style="grid-column: span 4; display: flex; gap: 5px; margin-top: -5px; margin-bottom: 5px; align-items: center; flex-wrap: wrap;">
                <span style="font-size:0.6rem; font-weight:700; color:var(--text-muted);">% :</span>
                <button type="button" onclick="applyVariantDiscount('${id}', 10)" style="font-size:0.65rem; padding:2px 6px; border-radius:4px; background:rgba(0,212,255,0.05); color:var(--accent); border:1px solid rgba(0,212,255,0.1); cursor:pointer;">10%</button>
                <button type="button" onclick="applyVariantDiscount('${id}', 20)" style="font-size:0.65rem; padding:2px 6px; border-radius:4px; background:rgba(0,212,255,0.05); color:var(--accent); border:1px solid rgba(0,212,255,0.1); cursor:pointer;">20%</button>
                <button type="button" onclick="applyVariantDiscount('${id}', 30)" style="font-size:0.65rem; padding:2px 6px; border-radius:4px; background:rgba(0,212,255,0.05); color:var(--accent); border:1px solid rgba(0,212,255,0.1); cursor:pointer;">30%</button>
                <button type="button" onclick="applyVariantDiscount('${id}', 40)" style="font-size:0.65rem; padding:2px 6px; border-radius:4px; background:rgba(0,212,255,0.05); color:var(--accent); border:1px solid rgba(0,212,255,0.1); cursor:pointer;">40%</button>
                <button type="button" onclick="applyVariantDiscount('${id}', 50)" style="font-size:0.65rem; padding:2px 6px; border-radius:4px; background:rgba(255,71,87,0.05); color:#ff4757; border:1px solid rgba(255,71,87,0.1); cursor:pointer;">50%</button>
                
                <div style="display: flex; gap: 3px; align-items: center; background: rgba(255,255,255,0.05); padding: 2px 5px; border-radius: 4px;">
                  <input type="number" id="custom-v-${id}" placeholder="%" style="width: 32px; background: none; border: none; color: #fff; text-align: center; font-size: 0.65rem; outline: none;">
                  <button type="button" onclick="applyVariantDiscount('${id}')" style="background: var(--accent); color: #000; border: none; padding: 1px 5px; border-radius: 3px; font-weight: 800; cursor: pointer; font-size: 0.6rem;">↵</button>
                </div>

                <button type="button" onclick="applyVariantDiscount('${id}', 0)" style="font-size:0.65rem; padding:2px 6px; border-radius:4px; background:rgba(255,255,255,0.05); color:#fff; border:1px solid rgba(255,255,255,0.1); cursor:pointer; margin-left:auto;">Reset</button>
            </div>
            <div style="grid-column: span 4; position: relative;">
                <input type="text" placeholder="Media URL" class="v-image v-input" value="${image}" 
                    id="input-${id}" oninput="updateLivePreview('input-${id}', 'prev-${id}')">
                <div class="live-preview-box" id="prev-${id}" style="height: 60px; margin-top: 8px;">
                    <img src="${image}" onerror="this.style.display='none'" onload="this.style.display='block'">
                </div>
            </div>
        </div>
        <button type="button" onclick="this.parentElement.remove()" style="color:#ff3b3b; background:none; border:none; font-size:1.2rem; cursor:pointer; opacity:0.8; align-self:start; margin-top:5px;">✕</button>
    `;
    vList.appendChild(div);
}

function saveProduct(e) {
    e.preventDefault();
    const index = document.getElementById('editIndex').value;
    const pData = {
        brand: document.getElementById('prodBrand').value,
        item: document.getElementById('prodItem').value,
        description: document.getElementById('prodDesc').value,
        price: document.getElementById('prodPrice').value,
        originalPrice: document.getElementById('prodOriginalPrice') ? document.getElementById('prodOriginalPrice').value : '',
        stock: document.getElementById('prodStock').value,
        image: document.getElementById('prodImage').value
    };

    const variants = [];
    vList.querySelectorAll('.variant-row').forEach(row => {
        const n = row.querySelector('.v-name').value.trim();
        let p = row.querySelector('.v-price').value.trim();
        const op = row.querySelector('.v-orig-price') ? row.querySelector('.v-orig-price').value.trim() : '';
        const i = row.querySelector('.v-image').value.trim();
        const s = row.querySelector('.v-stock') ? row.querySelector('.v-stock').value : 'available';
        
        // Logical Fallback: If sale price is empty, use original price as selling price
        if (!p && op) p = op;

        if (n && p) {
            let obj = { name: n, price: p, stock: s };
            if (op && op !== p) obj.originalPrice = op;
            if (i) obj.image = i;
            variants.push(obj);
        }
    });

    if (!pData.price && pData.originalPrice) pData.price = pData.originalPrice;
    
    // Clean up: If original is same as sale, don't store original separately
    if (pData.originalPrice === pData.price) pData.originalPrice = '';

    if (variants.length > 0) pData.variants = variants;

    // Collect gallery images
    const gallery = [];
    document.querySelectorAll('.g-image').forEach(input => {
        const val = input.value.trim();
        if (val) gallery.push(val);
    });
    if (gallery.length > 0) pData.gallery = gallery;

    if (index === '') localProducts.unshift(pData);
    else localProducts[index] = pData;

    saveToLocalStorage();
    updateDashboard();
    closeModal();
}

function saveToLocalStorage() {
    localStorage.setItem('orderWITHa4_local_products', JSON.stringify(localProducts));
    localStorage.setItem('orderWITHa4_local_brands', JSON.stringify(localBrands));

    // Also sync to Firebase
    if (window.firebaseDB) {
        window.firebaseDB.ref('products').set(localProducts);
        window.firebaseDB.ref('brands').set(localBrands);
        console.log("☁️ Data synced to Firebase Cloud");
    }
}

function resetLocalData() {
    if (confirm('CAUTION: This will undo ALL changes and revert to the original products.js data. Continue?')) {
        localStorage.removeItem('orderWITHa4_local_products');
        localStorage.removeItem('orderWITHa4_local_brands');
        localStorage.removeItem('orderWITHa4_local_orders');
        location.reload();
    }
}

function deleteProduct(index) {
    if (confirm('Permanently delete this asset?')) {
        localProducts.splice(index, 1);
        saveToLocalStorage();
        updateDashboard();
    }
}

// --- BRAND MANAGEMENT ---
function renderBrandsTable() {
    const tbody = document.getElementById('brandTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    localBrands.forEach((b, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><div style="font-weight:700; color:#fff;">${b.name}</div></td>
            <td><img src="${b.logo}" class="img-preview" style="background:#000; padding:5px; object-fit:contain;" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2244%22 height=%2244%22><rect width=%22100%%22 height=%22100%%22 fill=%22%23111%22/><text x=%2250%%22 y=%2250%%22 fill=%22%23444%22 dy=%22.3em%22 text-anchor=%22middle%22>🏷️</text></svg>'"></td>
            <td style="font-family:monospace; font-size:0.85rem; color:var(--accent); font-weight:700;">${b.id}</td>
            <td style="font-size:0.8rem; color:var(--text-muted); max-width:250px;">${b.description}</td>
            <td style="text-align:right;">
               <div style="display:flex; gap:8px; justify-content:flex-end;">
                  <button class="action-btn edit-btn" onclick="openBrandEditModal(${index})">✎</button>
                  <button class="action-btn delete-btn" onclick="deleteBrand(${index})">✕</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

const bModal = document.getElementById('brandModal');
function openBrandModal() {
    document.getElementById('brandModalTitle').textContent = 'Identity Registration';
    document.getElementById('editBrandIndex').value = '';
    document.getElementById('brandForm').reset();
    updateLivePreview('brandLogo', 'brandLogoPreview');
    bModal.style.display = 'flex';
}

function openBrandEditModal(index) {
    const b = localBrands[index];
    document.getElementById('brandModalTitle').textContent = 'Modify Identity';
    document.getElementById('editBrandIndex').value = index;
    document.getElementById('brandId').value = b.id;
    document.getElementById('brandName').value = b.name;
    document.getElementById('brandLogo').value = b.logo;
    document.getElementById('brandDesc').value = b.description;
    
    // Initial Preview
    updateLivePreview('brandLogo', 'brandLogoPreview');
    bModal.style.display = 'flex';
}

function closeBrandModal() { bModal.style.display = 'none'; }

function saveBrand(e) {
    e.preventDefault();
    const index = document.getElementById('editBrandIndex').value;
    const bData = {
        id: document.getElementById('brandId').value.trim().toLowerCase(),
        name: document.getElementById('brandName').value.trim(),
        logo: document.getElementById('brandLogo').value.trim(),
        description: document.getElementById('brandDesc').value.trim(),
    };

    if (index === '') localBrands.push(bData);
    else localBrands[index] = bData;

    saveToLocalStorage();
    populateBrandSelect();
    updateDashboard();
    closeBrandModal();
}

function deleteBrand(index) {
    if (confirm('De-register this brand identifier?')) {
        localBrands.splice(index, 1);
        saveToLocalStorage();
        populateBrandSelect();
        updateDashboard();
    }
}

// --- ANALYTICS ---
function initCharts() {
    const ctxSales = document.getElementById('salesChart').getContext('2d');
    const ctxBrand = document.getElementById('brandChart').getContext('2d');

    if (salesChart) salesChart.destroy();
    if (brandChart) brandChart.destroy();

    salesChart = new Chart(ctxSales, {
        type: 'line',
        data: { labels: [], datasets: [{ label: 'Revenue (LKR)', data: [], borderColor: '#00d4ff', backgroundColor: 'rgba(0,212,255,0.05)', fill: true, tension: 0.4, borderWidth: 3, pointBackgroundColor: '#00d4ff', pointRadius: 5 }] },
        options: { 
            responsive: true, maintainAspectRatio: false, 
            plugins: { legend: { display: false } }, 
            scales: { 
                y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#fff', font: { size: 10 } } },
                x: { grid: { display: false }, ticks: { color: '#fff', font: { size: 10 } } }
            } 
        }
    });

    brandChart = new Chart(ctxBrand, {
        type: 'doughnut',
        data: { labels: [], datasets: [{ data: [], backgroundColor: ['#00d4ff', '#7b61ff', '#ff00d4', '#ffbe0b', '#00ab55', '#fb5607'], borderWidth: 0, hoverOffset: 15 }] },
        options: { 
            responsive: true, maintainAspectRatio: false, 
            plugins: { legend: { position: 'bottom', labels: { color: '#fff', boxWidth: 8, padding: 20, font: { size: 11 } } } },
            cutout: '75%'
        }
    });
}

function updateCharts() {
    const brandCounts = {};
    localProducts.forEach(p => brandCounts[p.brand] = (brandCounts[p.brand] || 0) + 1);
    
    brandChart.data.labels = Object.keys(brandCounts).map(k => k.toUpperCase());
    brandChart.data.datasets[0].data = Object.values(brandCounts);
    brandChart.update();

    const recent = orders.slice(0, 10).reverse();
    salesChart.data.labels = recent.map(o => new Date(o.date).toLocaleDateString([], { day: '2-digit', month: 'short' }));
    salesChart.data.datasets[0].data = recent.map(o => o.total);
    salesChart.update();
}

// --- SYNC ---
function generateCode() {
    let str = 'const brands = [\n';
    localBrands.forEach((b, i) => {
        str += `  { id: "${b.id}", name: "${b.name}", logo: "${b.logo}", description: "${b.description}" }`;
        if (i < localBrands.length - 1) str += ',';
        str += '\n';
    });
    str += '];\n\nconst products = [\n';
    localProducts.forEach(p => {
        str += `  { brand: "${p.brand}", item: "${p.item}", description: "${p.description}"`;
        if (p.price) str += `, price: "${p.price}"`;
        if (p.originalPrice) str += `, originalPrice: "${p.originalPrice}"`;
        if (p.image) str += `, image: "${p.image}"`;
        if (p.stock) str += `, stock: "${p.stock}"`;
        if (p.gallery) {
            str += `, gallery: [${p.gallery.map(g => `"${g}"`).join(', ')}]`;
        }
        if (p.variants) {
            str += `, variants: [\n`;
            p.variants.forEach((v, i) => {
                str += `    { name: "${v.name}", price: "${v.price}"${v.originalPrice?`, originalPrice:"${v.originalPrice}"`:''}${v.image?`, image:"${v.image}"`:''}, stock: "${v.stock || 'available'}" }`;
                if (i < p.variants.length-1) str += ',';
                str += '\n';
            });
            str += `  ]`;
        }
        str += ` },\n`;
    });
    str += '];';
    document.getElementById('generatedCode').textContent = str;
    document.getElementById('codeModal').style.display = 'flex';
}

function copyToClipboard() {
    const code = document.getElementById('generatedCode').textContent;
    navigator.clipboard.writeText(code).then(() => {
        const btn = document.querySelector('[onclick="copyToClipboard()"]');
        const oldText = btn.textContent;
        btn.textContent = 'Copied! ✅';
        btn.style.background = '#00ab55';
        setTimeout(() => {
            btn.textContent = oldText;
            btn.style.background = 'var(--accent)';
        }, 2000);
    });
}

function addGalleryField(url = '') {
    const id = 'g-' + Date.now() + Math.random().toString(36).substr(2, 5);
    const list = document.getElementById('galleryList');
    const div = document.createElement('div');
    div.style = 'display: flex; flex-direction: column; gap: 8px; background: rgba(0,0,0,0.2); padding: 12px; border-radius: 14px; border: 1px solid var(--glass-border);';
    div.innerHTML = `
        <div style="display: flex; gap: 10px; align-items: center;">
            <input type="text" class="g-image v-input" value="${url}" placeholder="Gallery Image URL" 
                id="input-${id}" oninput="updateLivePreview('input-${id}', 'prev-${id}')" style="flex:1;">
            <button type="button" onclick="this.parentElement.parentElement.remove()" style="color:#ff3b3b; background:none; border:none; font-size:1.1rem; cursor:pointer; opacity:0.8;">✕</button>
        </div>
        <div class="live-preview-box" id="prev-${id}" style="height: 80px;">
            <img src="${url}" onerror="this.style.display='none'" onload="this.style.display='block'">
        </div>
    `;
    list.appendChild(div);
}

/**
 * Universal Image Preview Utility
 */
function updateLivePreview(inputId, previewId) {
    const input = document.getElementById(inputId);
    const previewContainer = document.getElementById(previewId);
    if (!input || !previewContainer) return;

    const img = previewContainer.querySelector('img');
    const val = input.value.trim();
    
    if (val) {
        img.src = val;
        // The onload/onerror in HTML will handle visibility
    } else {
        img.src = "";
        img.style.display = 'none';
    }
}

/**
 * Quick Discount Logic
 */
window.applyQuickDiscount = function(pct) {
    const origInput = document.getElementById('prodOriginalPrice');
    const saleInput = document.getElementById('prodPrice');
    const customInp = document.getElementById('customDiscountPct');
    if (!origInput || !saleInput) return;

    if (pct === 0) {
        saleInput.value = '';
        if (customInp) customInp.value = '';
        return;
    }

    // If pct is not passed, use custom input
    const finalPct = pct !== undefined ? pct : (parseInt(customInp.value) || 0);
    if (finalPct <= 0) return;

    const origVal = parseInt(origInput.value.replace(/,/g, '')) || 0;
    if (origVal > 0) {
        const saleVal = Math.round(origVal * (1 - finalPct/100));
        saleInput.value = saleVal.toLocaleString();
    }
};

window.applyVariantDiscount = function(id, pct) {
    const origInput = document.getElementById(`orig-${id}`);
    const saleInput = document.getElementById(`sale-${id}`);
    const customInp = document.getElementById(`custom-v-${id}`);
    if (!origInput || !saleInput) return;

    if (pct === 0) {
        saleInput.value = '';
        if (customInp) customInp.value = '';
        return;
    }

    const finalPct = pct !== undefined ? pct : (parseInt(customInp.value) || 0);
    if (finalPct <= 0) return;

    const origVal = parseInt(origInput.value.replace(/,/g, '')) || 0;
    if (origVal > 0) {
        const saleVal = Math.round(origVal * (1 - finalPct/100));
        saleInput.value = saleVal.toLocaleString();
    }
};

window.autoUpdateSalePrice = function() {
    // Optional: Real-time logic if needed
};

/**
 * Bulk Brand Discounts
 */
window.bulkApplyDiscount = function(brandName, bIdx) {
    const pctInput = document.getElementById(`bulk-pct-${bIdx}`);
    const pct = parseInt(pctInput ? pctInput.value : 0);
    if (!pct || pct <= 0) {
        alert("Please enter a valid percentage (e.g. 15)");
        return;
    }

    const count = localProducts.filter(p => p.brand === brandName).length;
    if (!confirm(`Are you sure you want to apply a ${pct}% discount to ALL ${count} items in ${brandName}?`)) return;

    localProducts.forEach(p => {
        if (p.brand === brandName) {
            // Apply to main product
            const base = p.originalPrice || p.price;
            if (base) {
                p.originalPrice = base;
                const baseVal = parseInt(base.replace(/,/g, '')) || 0;
                p.price = Math.round(baseVal * (1 - pct/100)).toLocaleString();
            }

            // Apply to variants
            if (p.variants) {
                p.variants.forEach(v => {
                    const vBase = v.originalPrice || v.price;
                    if (vBase) {
                        v.originalPrice = vBase;
                        const vBaseVal = parseInt(vBase.replace(/,/g, '')) || 0;
                        v.price = Math.round(vBaseVal * (1 - pct/100)).toLocaleString();
                    }
                });
            }
        }
    });

    saveToLocalStorage();
    updateDashboard();
    alert(`Success: ${pct}% discount applied to ${brandName}.`);
};

window.bulkResetDiscount = function(brandName) {
    if (!confirm(`Are you sure you want to RESET ALL discounts for ${brandName}?`)) return;

    localProducts.forEach(p => {
        if (p.brand === brandName) {
            // Reset main product
            if (p.originalPrice) {
                p.price = p.originalPrice;
                p.originalPrice = '';
            }

            // Reset variants
            if (p.variants) {
                p.variants.forEach(v => {
                    if (v.originalPrice) {
                        v.price = v.originalPrice;
                        v.originalPrice = '';
                    }
                });
            }
        }
    });

    saveToLocalStorage();
    updateDashboard();
    alert(`Success: All discounts reset for ${brandName}.`);
};
