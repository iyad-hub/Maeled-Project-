let cart = JSON.parse(localStorage.getItem('cart')) || [];

function updateCartCount() {
  const count = cart.reduce((total, item) => total + (item.quantity || 0), 0);
  const cartCountElements = document.querySelectorAll('#panier-count');
  
  cartCountElements.forEach(el => {
    el.textContent = count;
  });
}

document.addEventListener('click', function(e) {
  if (e.target.classList.contains('add-to-cart')) {
    e.preventDefault();
    
    const id = e.target.dataset.id;
    const name = e.target.dataset.name;
    const price = parseFloat(e.target.dataset.price);
    
    const existingItem = cart.find(item => item.id === id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ id, name, price, quantity: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    
    alert(`${name} a été ajouté à votre panier!`);
  }
});

if (window.location.pathname.includes('panier.html') || window.location.href.includes('panier.html')) {
  function displayCartItems() {
    const cartContainer = document.getElementById('panier-items');
    if (!cartContainer) return;
    
    if (cart.length === 0) {
      cartContainer.innerHTML = '<p class="empty-cart">Votre panier est vide</p>';
      const checkoutBtn = document.querySelector('.checkout-btn');
      if (checkoutBtn) checkoutBtn.disabled = true;
      return;
    }
    
    cartContainer.innerHTML = '';
    
    let subtotal = 0;
    
    cart.forEach(item => {
      const itemTotal = (item.price || 0) * (item.quantity || 0);
      subtotal += itemTotal;
      
      const itemEl = document.createElement('div');
      itemEl.className = 'cart-item';
      itemEl.innerHTML = `
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name || 'Article'}</div>
          <div class="cart-item-price">${(item.price || 0).toFixed(2)} €</div>
        </div>
        <div class="cart-item-actions">
          <input type="number" class="cart-item-quantity" value="${item.quantity || 1}" min="1" data-id="${item.id}">
          <button class="remove-item" data-id="${item.id}">×</button>
        </div>
      `;
      
      cartContainer.appendChild(itemEl);
    });
    
    const subtotalEl = document.getElementById('subtotal');
    const totalEl = document.getElementById('total');
    const checkoutBtn = document.querySelector('.checkout-btn');
    
    if (subtotalEl) subtotalEl.textContent = subtotal.toFixed(2) + ' €';
    if (totalEl) totalEl.textContent = (subtotal + 2).toFixed(2) + ' €';
    
    if (checkoutBtn) {
      checkoutBtn.disabled = false;
      checkoutBtn.onclick = function() {
        if (cart.length === 0) {
          alert('Votre panier est vide!');
          return;
        }
        
        const tableNumber = prompt('Numéro de table? (ou "emporter" pour à emporter):', 'T1');
        if (!tableNumber) return;
        
        let orders = JSON.parse(localStorage.getItem('maeled_orders') || '[]');
        
        const newId = orders.length > 0 ? Math.max(...orders.map(o => o.id || 0)) + 1 : 1001;
        
        const orderSubtotal = cart.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0);
        const orderTotal = orderSubtotal + 2.00;
        
        const newOrder = {
          id: newId,
          table: tableNumber,
          items: cart.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity
          })),
          subtotal: orderSubtotal,
          total: orderTotal,
          status: 'en attente',
          time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          date: new Date().toISOString().split('T')[0],
          guests: 1,
          notes: '',
          waiter: 'Client'
        };
        
        orders.push(newOrder);
        localStorage.setItem('maeled_orders', JSON.stringify(orders));
        
        let notifications = JSON.parse(localStorage.getItem('maeled_notifications') || '[]');
        notifications.unshift({
          id: notifications.length + 1,
          message: `Nouvelle commande #${newId} sur ${tableNumber} - ${orderTotal.toFixed(2)} €`,
          time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          read: false
        });
        localStorage.setItem('maeled_notifications', JSON.stringify(notifications));
        
        cart = [];
        localStorage.setItem('cart', JSON.stringify(cart));
        displayCartItems();
        updateCartCount();
        
        alert(`✅ Commande #${newId} créée avec succès!\n\nTable: ${tableNumber}\nTotal: ${orderTotal.toFixed(2)} €\n\nMerci pour votre commande!`);
      };
    }
    
    setTimeout(() => {
      document.querySelectorAll('.cart-item-quantity').forEach(input => {
        input.addEventListener('change', function() {
          const id = this.dataset.id;
          const newQuantity = parseInt(this.value) || 1;
          
          const item = cart.find(item => item.id === id);
          if (item) {
            item.quantity = newQuantity;
            localStorage.setItem('cart', JSON.stringify(cart));
            displayCartItems();
          }
        });
      });
      
      document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', function() {
          const id = this.dataset.id;
          cart = cart.filter(item => item.id !== id);
          localStorage.setItem('cart', JSON.stringify(cart));
          displayCartItems();
          updateCartCount();
        });
      });
    }, 100);
  }
  
  displayCartItems();
}

updateCartCount();

// ===== Dynamic menu rendering (client side) =====
function renderMenuPage() {
  const container = document.getElementById('menuDynamic');
  if (!container) return;

  const menu = JSON.parse(localStorage.getItem('maeled_menu') || '[]');

  if (!Array.isArray(menu) || menu.length === 0) {
    container.innerHTML = '<p style="padding:20px; color:#666;">Menu indisponible pour le moment.</p>';
    return;
  }

  const categoriesOrder = [
    { key: 'entrées', label: 'Entrées' },
    { key: 'pizzas', label: 'Pizzas' },
    { key: 'pâtes', label: 'Pâtes' },
    { key: 'desserts', label: 'Desserts' },
    { key: 'boissons', label: 'Boissons' }
  ];

  const availableMenu = menu.filter(i => i && i.available !== false);

  const byCategory = {};
  availableMenu.forEach(item => {
    const cat = item.category || 'autres';
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(item);
  });

  // Sort by popularity (desc)
  Object.keys(byCategory).forEach(cat => {
    byCategory[cat].sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
  });

  const standardKeys = new Set(categoriesOrder.map(c => c.key));

  function renderCategory(catKey, label) {
    const items = byCategory[catKey];
    if (!items || items.length === 0) return '';

    const cards = items.map(item => {
      const img = item.image || 'pics/ph1.jpg';
      const safeName = String(item.name || 'Plat').replace(/"/g, '&quot;');
      const price = Number(item.price || 0).toFixed(2);
      return `
        <div class="menu-item">
          <img src="${img}" alt="${safeName}" onerror="this.onerror=null;this.src='pics/ph1.jpg';">
          <h3>${safeName}</h3>
          <div class="item-footer center">
  <span class="price">${price} €</span>
</div>
        </div>`;
    }).join('');

    return `
      <div class="menu-category">
        <h2>${label}</h2>
        <div class="menu-items">${cards}</div>
      </div>`;
  }

  let html = '';

  // Standard categories
  categoriesOrder.forEach(({ key, label }) => {
    html += renderCategory(key, label);
  });

  // Extra categories
  Object.keys(byCategory).forEach(cat => {
    if (standardKeys.has(cat)) return;
    html += renderCategory(cat, cat);
  });

  container.innerHTML = html || '<p style="padding:20px; color:#666;">Aucun plat disponible.</p>';
}

// Render menu on menu.html
document.addEventListener('DOMContentLoaded', function() {
  if (document.getElementById('menuDynamic')) {
    renderMenuPage();
  }
});

// Refresh menu if admin updates it in another tab
window.addEventListener('storage', function(e) {
  if (e.key === 'maeled_menu' && document.getElementById('menuDynamic')) {
    renderMenuPage();
  }
});
