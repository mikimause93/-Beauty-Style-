/**
 * Beauty & Style - Main JavaScript
 */

// ============================================================
// DOM Ready
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initScrollTop();
  initMobileNav();
  initFilters();
  initWishlist();
  initNewsletterForm();
  initAnimations();
  initCounters();
});

// ============================================================
// Navbar scroll behavior
// ============================================================
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  const handleScroll = () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // Set active nav link based on current page
  const currentPath = window.location.pathname;
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href && currentPath.endsWith(href)) {
      link.classList.add('active');
    }
  });
}

// ============================================================
// Scroll to top button
// ============================================================
function initScrollTop() {
  const scrollBtn = document.querySelector('.scroll-top');
  if (!scrollBtn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      scrollBtn.classList.add('visible');
    } else {
      scrollBtn.classList.remove('visible');
    }
  }, { passive: true });

  scrollBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ============================================================
// Mobile Navigation
// ============================================================
function initMobileNav() {
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav');
  if (!hamburger || !mobileNav) return;

  let isOpen = false;

  hamburger.addEventListener('click', () => {
    isOpen = !isOpen;
    mobileNav.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
    hamburger.setAttribute('aria-expanded', isOpen);

    // Animate hamburger
    const spans = hamburger.querySelectorAll('span');
    if (isOpen) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    }
  });

  // Close on link click
  mobileNav.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', () => {
      isOpen = false;
      mobileNav.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (isOpen && !hamburger.contains(e.target) && !mobileNav.contains(e.target)) {
      isOpen = false;
      mobileNav.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
}

// ============================================================
// Product/Service Filters
// ============================================================
function initFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const items = document.querySelectorAll('[data-category]');
  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const category = btn.dataset.filter;

      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      items.forEach(item => {
        const itemCategory = item.dataset.category;
        if (category === 'all' || itemCategory === category) {
          item.style.display = '';
          item.style.animation = 'fadeIn 0.3s ease';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });
}

// ============================================================
// Wishlist / Favorites
// ============================================================
function initWishlist() {
  const wishlistBtns = document.querySelectorAll('.product-wishlist');
  if (!wishlistBtns.length) return;

  let wishlist = JSON.parse(localStorage.getItem('bs_wishlist') || '[]');
  updateWishlistCount(wishlist.length);

  wishlistBtns.forEach(btn => {
    const productId = btn.closest('[data-id]')?.dataset.id;
    if (productId && wishlist.includes(productId)) {
      btn.classList.add('active');
      btn.textContent = '♥';
    }

    btn.addEventListener('click', () => {
      const id = btn.closest('[data-id]')?.dataset.id || Math.random().toString(36).slice(2);
      btn.closest('[data-id]')?.setAttribute('data-id', id);

      if (btn.classList.contains('active')) {
        btn.classList.remove('active');
        btn.textContent = '♡';
        wishlist = wishlist.filter(item => item !== id);
        showToast('Removed from wishlist', 'info');
      } else {
        btn.classList.add('active');
        btn.textContent = '♥';
        if (!wishlist.includes(id)) wishlist.push(id);
        showToast('Added to wishlist! ♥', 'success');
      }

      localStorage.setItem('bs_wishlist', JSON.stringify(wishlist));
      updateWishlistCount(wishlist.length);
    });
  });
}

function updateWishlistCount(count) {
  const badge = document.querySelector('.nav-badge');
  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  }
}

// ============================================================
// Add to Cart
// ============================================================
let cart = JSON.parse(localStorage.getItem('bs_cart') || '[]');

document.addEventListener('click', (e) => {
  const btn = e.target.closest('.btn-add-cart');
  if (!btn) return;

  const card = btn.closest('[data-id]');
  const productName = card?.querySelector('.product-name')?.textContent || 'Product';
  const productId = card?.dataset.id || Math.random().toString(36).slice(2);

  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: productId, name: productName, qty: 1 });
  }

  localStorage.setItem('bs_cart', JSON.stringify(cart));
  showToast(`${productName} added to cart 🛒`, 'success');

  // Animate button
  btn.textContent = '✓ Added';
  btn.style.background = '#2e7d32';
  setTimeout(() => {
    btn.textContent = 'Add to Cart';
    btn.style.background = '';
  }, 1500);
});

// ============================================================
// Newsletter Form
// ============================================================
function initNewsletterForm() {
  const form = document.querySelector('.newsletter-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = form.querySelector('.newsletter-input');
    const email = input.value.trim();

    if (!email || !isValidEmail(email)) {
      showToast('Please enter a valid email address', 'error');
      return;
    }

    showToast('Thank you for subscribing! 🌸', 'success');
    input.value = '';
  });
}

// ============================================================
// Animations on scroll
// ============================================================
function initAnimations() {
  if (!('IntersectionObserver' in window)) return;

  const elements = document.querySelectorAll(
    '.service-card, .product-card, .team-card, .blog-card, .testimonial-card, .gallery-item, .section-header'
  );

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animation = 'fadeInUp 0.5s ease forwards';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  elements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    observer.observe(el);
  });

  // Add keyframe dynamically
  if (!document.querySelector('#bs-animations')) {
    const style = document.createElement('style');
    style.id = 'bs-animations';
    style.textContent = `
      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }
}

// ============================================================
// Animated counters
// ============================================================
function initCounters() {
  const counters = document.querySelectorAll('.hero-stat-number, .counter');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => observer.observe(counter));
}

function animateCounter(el) {
  const text = el.textContent;
  const numMatch = text.match(/\d+/);
  if (!numMatch) return;

  const target = parseInt(numMatch[0]);
  const suffix = text.replace(/[\d,]/g, '');
  let current = 0;
  const duration = 1500;
  const step = target / (duration / 16);

  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = Math.floor(current) + suffix;
    if (current >= target) clearInterval(timer);
  }, 16);
}

// ============================================================
// Toast Notifications
// ============================================================
function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const icons = { success: '✓', error: '✕', info: 'ℹ' };
  toast.innerHTML = `<span>${icons[type] || 'ℹ'}</span> ${message}`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// ============================================================
// Modal
// ============================================================
function openModal(modalId) {
  const overlay = document.getElementById(modalId);
  if (!overlay) return;
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
  const overlay = document.getElementById(modalId);
  if (!overlay) return;
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (e.target.classList.contains('modal-close')) {
    const overlay = e.target.closest('.modal-overlay');
    if (overlay) {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach(modal => {
      modal.classList.remove('open');
      document.body.style.overflow = '';
    });
  }
});

// ============================================================
// Gallery lightbox
// ============================================================
function initGalleryLightbox() {
  const items = document.querySelectorAll('.gallery-item');
  if (!items.length) return;

  items.forEach(item => {
    item.addEventListener('click', () => {
      const emoji = item.querySelector('.gallery-thumb')?.textContent?.trim() || '🌸';
      const title = item.querySelector('.gallery-overlay-content strong')?.textContent || 'Gallery Image';

      const overlay = document.createElement('div');
      overlay.className = 'modal-overlay open';
      overlay.innerHTML = `
        <div class="modal" style="max-width:600px; text-align:center;">
          <div class="modal-header">
            <h3 style="font-family:var(--font-primary)">${title}</h3>
            <button class="modal-close">✕</button>
          </div>
          <div style="height:300px; background:linear-gradient(135deg,#fdf0e0,#fce4ec); border-radius:var(--radius-lg); display:flex; align-items:center; justify-content:center; font-size:6rem; margin-bottom:16px;">
            ${emoji}
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
    });
  });
}

document.addEventListener('DOMContentLoaded', initGalleryLightbox);

// ============================================================
// Utility helpers
// ============================================================
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function formatPrice(price) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
}

function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// ============================================================
// Expose global utilities
// ============================================================
window.BS = {
  showToast,
  openModal,
  closeModal,
  formatPrice,
  isValidEmail
};
