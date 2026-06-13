// Shared cart engine - localStorage based, namespaced per store
(function () {
  const STORE_KEY = document.body.dataset.store || 'default';
  const CART_KEY = `cart_${STORE_KEY}`;

  function getCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartCount();
  }

  function addToCart(id, name, price, image, qty = 1) {
    const cart = getCart();
    const existing = cart.find((item) => item.id === id);
    if (existing) {
      existing.qty += qty;
    } else {
      cart.push({ id, name, price, image, qty });
    }
    saveCart(cart);
    showToast(`${name} added to cart`);
  }

  function removeFromCart(id) {
    let cart = getCart();
    cart = cart.filter((item) => item.id !== id);
    saveCart(cart);
    renderCartPage();
  }

  function updateQty(id, qty) {
    const cart = getCart();
    const item = cart.find((i) => i.id === id);
    if (item) {
      item.qty = Math.max(1, qty);
      saveCart(cart);
      renderCartPage();
    }
  }

  function cartTotal() {
    return getCart().reduce((sum, item) => sum + item.price * item.qty, 0);
  }

  function cartCount() {
    return getCart().reduce((sum, item) => sum + item.qty, 0);
  }

  function updateCartCount() {
    document.querySelectorAll('.cart-count').forEach((el) => {
      el.textContent = cartCount();
    });
  }

  function showToast(message) {
    let toast = document.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('show'), 2200);
  }

  function fmt(num) {
    return '$' + num.toFixed(2);
  }

  function renderCartPage() {
    const container = document.querySelector('#cart-items');
    const totalEl = document.querySelector('#cart-total');
    const emptyEl = document.querySelector('#cart-empty');
    if (!container) return;

    const cart = getCart();
    container.innerHTML = '';

    if (cart.length === 0) {
      if (emptyEl) emptyEl.style.display = 'block';
      container.style.display = 'none';
      if (totalEl) totalEl.textContent = fmt(0);
      const checkoutBtn = document.querySelector('#checkout-btn');
      if (checkoutBtn) checkoutBtn.setAttribute('disabled', 'true');
      return;
    }

    if (emptyEl) emptyEl.style.display = 'none';
    container.style.display = '';
    const checkoutBtn = document.querySelector('#checkout-btn');
    if (checkoutBtn) checkoutBtn.removeAttribute('disabled');

    cart.forEach((item) => {
      const row = document.createElement('div');
      row.className = 'cart-row';
      row.innerHTML = `
        <img src="${item.image}" alt="${item.name}" class="cart-row-img" />
        <div class="cart-row-info">
          <div class="cart-row-name">${item.name}</div>
          <div class="cart-row-price">${fmt(item.price)} each</div>
        </div>
        <div class="cart-row-qty">
          <button class="qty-btn" data-action="dec" data-id="${item.id}">−</button>
          <span>${item.qty}</span>
          <button class="qty-btn" data-action="inc" data-id="${item.id}">+</button>
        </div>
        <div class="cart-row-subtotal">${fmt(item.price * item.qty)}</div>
        <button class="remove-btn" data-id="${item.id}" aria-label="Remove ${item.name}">×</button>
      `;
      container.appendChild(row);
    });

    container.querySelectorAll('.qty-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const cart = getCart();
        const item = cart.find((i) => i.id === id);
        if (!item) return;
        const delta = btn.dataset.action === 'inc' ? 1 : -1;
        if (item.qty + delta <= 0) {
          removeFromCart(id);
        } else {
          updateQty(id, item.qty + delta);
        }
      });
    });

    container.querySelectorAll('.remove-btn').forEach((btn) => {
      btn.addEventListener('click', () => removeFromCart(btn.dataset.id));
    });

    if (totalEl) totalEl.textContent = fmt(cartTotal());
  }

  function handleCheckout(e) {
    e.preventDefault();
    const cart = getCart();
    if (cart.length === 0) return;
    localStorage.removeItem(CART_KEY);
    const modal = document.querySelector('#order-modal');
    if (modal) {
      const orderNum = 'DEMO-' + Math.floor(100000 + Math.random() * 900000);
      const orderNumEl = modal.querySelector('.order-number');
      if (orderNumEl) orderNumEl.textContent = orderNum;
      modal.classList.add('show');
    }
    updateCartCount();
    renderCartPage();
  }

  document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    renderCartPage();

    document.querySelectorAll('[data-add-to-cart]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const { id, name, price, image } = btn.dataset;
        addToCart(id, name, parseFloat(price), image);
      });
    });

    const checkoutForm = document.querySelector('#checkout-form');
    if (checkoutForm) {
      checkoutForm.addEventListener('submit', handleCheckout);
    }

    const modalClose = document.querySelector('#order-modal .modal-close');
    if (modalClose) {
      modalClose.addEventListener('click', () => {
        document.querySelector('#order-modal').classList.remove('show');
        window.location.href = 'index.html';
      });
    }
  });

  window.demoCart = { addToCart, getCart, cartTotal, fmt };
})();
