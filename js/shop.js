/**
 * Beauty & Style - Shop JavaScript
 */

document.addEventListener('DOMContentLoaded', initShop);

function initShop() {
  initSearch();
  initSorting();
  initQuickView();
  updateCartCount();
}

// ============================================================
// Search
// ============================================================
function initSearch() {
  const searchInput = document.getElementById('shop-search');
  if (!searchInput) return;

  searchInput.addEventListener('input', debounce(() => {
    const query = searchInput.value.toLowerCase().trim();
    const cards = document.querySelectorAll('.product-card');

    cards.forEach(card => {
      const name = card.querySelector('.product-name')?.textContent.toLowerCase() || '';
      const brand = card.querySelector('.product-brand')?.textContent.toLowerCase() || '';
      const visible = !query || name.includes(query) || brand.includes(query);
      card.closest('[data-id]')?.style.setProperty('display', visible ? '' : 'none');
    });
  }, 250));
}

// ============================================================
// Sorting
// ============================================================
function initSorting() {
  const sortSelect = document.getElementById('shop-sort');
  if (!sortSelect) return;

  sortSelect.addEventListener('change', () => {
    const val = sortSelect.value;
    const grid = document.getElementById('shop-products-grid');
    if (!grid) return;

    const cards = Array.from(grid.querySelectorAll('[data-id]'));

    cards.sort((a, b) => {
      const priceA = parseFloat(a.dataset.price || 0);
      const priceB = parseFloat(b.dataset.price || 0);
      const nameA = a.querySelector('.product-name')?.textContent || '';
      const nameB = b.querySelector('.product-name')?.textContent || '';

      switch (val) {
        case 'price-asc': return priceA - priceB;
        case 'price-desc': return priceB - priceA;
        case 'name-asc': return nameA.localeCompare(nameB);
        case 'popular': return (parseInt(b.dataset.reviews || 0) - parseInt(a.dataset.reviews || 0));
        default: return 0;
      }
    });

    cards.forEach(card => grid.appendChild(card));
  });
}

// ============================================================
// Quick View Modal
// ============================================================
function initQuickView() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-quick-view');
    if (!btn) return;

    const card = btn.closest('[data-id]');
    if (!card) return;

    const name = card.querySelector('.product-name')?.textContent || '';
    const brand = card.querySelector('.product-brand')?.textContent || '';
    const price = card.querySelector('.price-current')?.textContent || '';
    const emoji = card.querySelector('.product-image')?.textContent?.trim().slice(0, 2) || '✨';
    const rating = card.querySelector('.stars')?.textContent || '★★★★★';
    const count = card.querySelector('.rating-count')?.textContent || '';

    openQuickViewModal({ name, brand, price, emoji, rating, count });
  });
}

function openQuickViewModal({ name, brand, price, emoji, rating, count }) {
  const existing = document.getElementById('quick-view-modal');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'quick-view-modal';
  overlay.className = 'modal-overlay open';
  overlay.innerHTML = `
    <div class="modal" style="max-width:680px; padding:0; overflow:hidden;">
      <div style="display:grid; grid-template-columns:1fr 1fr;">
        <div style="background:linear-gradient(135deg,#fdf0e0,#fce4ec); display:flex; align-items:center; justify-content:center; font-size:6rem; min-height:300px;">
          ${emoji}
        </div>
        <div style="padding:32px;">
          <div class="modal-header" style="margin-bottom:12px;">
            <div>
              <div style="font-size:.75rem; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:var(--primary); margin-bottom:4px;">${brand}</div>
              <h3 style="font-family:var(--font-primary); font-size:1.2rem;">${name}</h3>
            </div>
            <button class="modal-close">✕</button>
          </div>
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:16px;">
            <span style="color:#f5a623;">${rating}</span>
            <span style="font-size:.8rem; color:var(--gray-500);">${count}</span>
          </div>
          <div style="font-family:var(--font-primary); font-size:1.8rem; color:var(--secondary); font-weight:700; margin-bottom:16px;">${price}</div>
          <p style="font-size:.88rem; color:var(--gray-600); line-height:1.7; margin-bottom:20px;">Premium quality product from ${brand}. This item features exceptional formulation designed for lasting results and maximum effectiveness.</p>
          <button class="btn btn-primary btn-block" onclick="window.BS?.showToast('${name} added to cart 🛒', 'success'); this.textContent = '✓ Added to Cart'; setTimeout(() => this.textContent = 'Add to Cart', 1500);">Add to Cart</button>
          <button class="btn btn-outline btn-block" style="margin-top:8px;">View Full Details</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay || e.target.classList.contains('modal-close')) {
      overlay.remove();
      document.body.style.overflow = '';
    }
  });
}

// ============================================================
// Cart Count
// ============================================================
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('bs_cart') || '[]');
  const totalQty = cart.reduce((sum, item) => sum + (item.qty || 1), 0);

  const cartBadge = document.getElementById('cart-count');
  if (cartBadge) {
    cartBadge.textContent = totalQty;
    cartBadge.style.display = totalQty > 0 ? 'flex' : 'none';
  }
}

// ============================================================
// Utility
// ============================================================
function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
