document.addEventListener('DOMContentLoaded', function() {
  console.log('Orders page loading...');
  
  initOrders();
  setupMobileMenu();
});

function initOrders() {
  console.log('Initializing orders...');
  
  loadOrders();
  
  setupOrdersEventListeners();
}

function loadOrders() {
  console.log('Loading orders from localStorage...');
  
  const orders = JSON.parse(localStorage.getItem('maeled_orders') || '[]');
  console.log('Found orders:', orders);
  
  const searchTerm = document.getElementById('searchOrders')?.value.toLowerCase() || '';
  const statusFilter = document.getElementById('statusFilter')?.value || 'all';
  const timeFilter = document.getElementById('timeFilter')?.value || 'all';
  
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  let filteredData = orders.filter(order => {
    const matchesSearch = !searchTerm || 
      (order.table && order.table.toLowerCase().includes(searchTerm)) ||
      (order.id && order.id.toString().includes(searchTerm)) ||
      (order.notes && order.notes.toLowerCase().includes(searchTerm));
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    let matchesTime = true;
    if (timeFilter === 'today') {
      matchesTime = order.date === today;
    } else if (timeFilter === 'yesterday') {
      matchesTime = order.date === yesterdayStr;
    } else if (timeFilter === 'week') {
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);
      const startOfWeekStr = startOfWeek.toISOString().split('T')[0];
      matchesTime = order.date >= startOfWeekStr;
    }
    
    return matchesSearch && matchesStatus && matchesTime;
  });
  
  console.log('Filtered orders:', filteredData);
  
  filteredData.sort((a, b) => {
    try {
      const timeA = new Date(`${a.date} ${a.time}`);
      const timeB = new Date(`${b.date} ${b.time}`);
      return timeB - timeA;
    } catch (e) {
      return 0;
    }
  });
  
  renderOrdersTable(filteredData);
  
  updateOrderStats(orders);
}

function updateOrderStats(orders) {
  console.log('Updating order stats...');
  
  const stats = {
    pending: orders.filter(o => o.status === 'en attente').length,
    preparing: orders.filter(o => o.status === 'en préparation').length,
    completed: orders.filter(o => o.status === 'servie').length,
    cancelled: orders.filter(o => o.status === 'annulée').length
  };
  
  console.log('Stats:', stats);
  
  const pendingEl = document.getElementById('pendingOrders');
  const preparingEl = document.getElementById('preparingOrders');
  const completedEl = document.getElementById('completedOrders');
  const cancelledEl = document.getElementById('cancelledOrders');
  
  if (pendingEl) pendingEl.textContent = stats.pending;
  if (preparingEl) preparingEl.textContent = stats.preparing;
  if (completedEl) completedEl.textContent = stats.completed;
  if (cancelledEl) cancelledEl.textContent = stats.cancelled;
}

function renderOrdersTable(data) {
  console.log('Rendering orders table with', data.length, 'orders');
  
  const tbody = document.getElementById('ordersTableBody');
  if (!tbody) {
    console.error('Table body not found!');
    return;
  }
  
  tbody.innerHTML = '';
  
  if (data.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 40px; color: #666;">
          Aucune commande trouvée
        </td>
      </tr>
    `;
    updateOrdersPaginationInfo(0, 0, 0);
    return;
  }
  
  data.forEach(order => {
    const row = document.createElement('tr');
    
    let statusBadge = '';
    switch(order.status) {
      case 'en attente':
        statusBadge = '<span class="badge badge-warning">En attente</span>';
        break;
      case 'en préparation':
        statusBadge = '<span class="badge badge-warning">En préparation</span>';
        break;
      case 'servie':
        statusBadge = '<span class="badge badge-success">Servie</span>';
        break;
      case 'annulée':
        statusBadge = '<span class="badge badge-danger">Annulée</span>';
        break;
      default:
        statusBadge = `<span class="badge badge-secondary">${order.status || 'Inconnu'}</span>`;
    }
    
    const itemCount = Array.isArray(order.items) ? 
      order.items.reduce((sum, item) => sum + (item.quantity || 1), 0) : 0;
    
    const firstItemName = Array.isArray(order.items) && order.items.length > 0 ? 
      order.items[0].name : 'Aucun article';
    
    row.innerHTML = `
      <td><strong>#${order.id || 'N/A'}</strong></td>
      <td>
        <div style="font-weight: bold; color: #2c3e50;">${order.table || 'N/A'}</div>
        <small style="color: #666;">${order.guests || 1} pers.</small>
      </td>
      <td>
        ${itemCount} article(s)<br>
        <small style="color: #666;">${firstItemName}${order.items && order.items.length > 1 ? ' +' + (order.items.length - 1) : ''}</small>
      </td>
      <td><strong>${(order.total || 0).toFixed(2)} €</strong></td>
      <td>
        ${statusBadge}
        <button class="status-change" data-id="${order.id}" title="Changer statut" style="margin-left: 5px; background: none; border: none; color: #666; cursor: pointer;">
          <i class="fas fa-sync-alt"></i>
        </button>
      </td>
      <td>${order.time || 'N/A'}<br><small>${order.date || 'N/A'}</small></td>
      <td>
        <div class="table-actions">
          <button class="action-btn view" data-id="${order.id}" title="Voir détails">
            <i class="fas fa-eye"></i>
          </button>
          <button class="action-btn edit" data-id="${order.id}" title="Modifier">
            <i class="fas fa-edit"></i>
          </button>
          <button class="action-btn delete" data-id="${order.id}" title="Supprimer">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    `;
    
    tbody.appendChild(row);
  });
  
  updateOrdersPaginationInfo(data.length, 1, data.length);
  
  setupOrdersActionButtons();
}

function updateOrdersPaginationInfo(total, start, end) {
  const paginationInfo = document.getElementById('paginationInfo');
  if (paginationInfo) {
    paginationInfo.textContent = `Affichage de ${start} à ${end} sur ${total} commandes`;
  }
}

function setupOrdersActionButtons() {
  console.log('Setting up action buttons...');
  
  document.querySelectorAll('.action-btn.view').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = parseInt(this.getAttribute('data-id'));
      console.log('View order:', id);
      showOrderDetails(id);
    });
  });

  document.querySelectorAll('.action-btn.edit').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = parseInt(this.getAttribute('data-id'));
      console.log('Edit order:', id);
      editOrder(id);
    });
  });
  
  document.querySelectorAll('.action-btn.delete').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = parseInt(this.getAttribute('data-id'));
      console.log('Delete order:', id);
      deleteOrder(id);
    });
  });
  
  document.querySelectorAll('.status-change').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = parseInt(this.getAttribute('data-id'));
      console.log('Change status for order:', id);
      changeOrderStatus(id);
    });
  });
}

function editOrder(id) {
  const orders = JSON.parse(localStorage.getItem('maeled_orders') || '[]');
  const order = Array.isArray(orders) ? orders.find(o => String(o.id) === String(id)) : null;
  if (!order) {
    alert('Commande introuvable');
    return;
  }

  // Prefer modal edit (so you can change items)
  const modal = document.getElementById('addOrderModal');
  const form = document.getElementById('orderForm');
  if (modal && form) {
    openAddOrderModal(order);
    return;
  }

  // Fallback prompts
  const newTable = prompt('Table / Emporter / Livraison :', order.table || 'T1');
  if (!newTable) return;
  const newGuests = parseInt(prompt('Nombre de personnes :', String(order.guests || 1)) || String(order.guests || 1), 10) || (order.guests || 1);
  const newStatus = prompt('Statut (en attente / en préparation / servie / annulée) :', order.status || 'en attente') || order.status;
  const newNotes = prompt('Notes :', order.notes || '') ?? order.notes;

  order.table = newTable;
  order.guests = newGuests;
  order.status = newStatus;
  order.notes = newNotes;
  localStorage.setItem('maeled_orders', JSON.stringify(orders));
  loadOrders();
  alert('✅ Commande modifiée');
}

function showOrderDetails(id) {
  console.log('Showing details for order:', id);
  
  const orders = JSON.parse(localStorage.getItem('maeled_orders') || '[]');
  const order = orders.find(o => o.id === id);
  
  if (!order) {
    alert('Commande non trouvée!');
    return;
  }
  
  const modalTitle = document.getElementById('orderDetailsTitle');
  const modalContent = document.getElementById('orderDetailsContent');
  
  if (modalTitle) modalTitle.textContent = `Commande #${order.id}`;
  
  if (modalContent) {
    let detailsHTML = `
      <div style="margin-bottom: 20px;">
        <p><strong>Table:</strong> ${order.table || 'N/A'}</p>
        <p><strong>Personnes:</strong> ${order.guests || 1}</p>
        <p><strong>Heure:</strong> ${order.time || 'N/A'} (${order.date || 'N/A'})</p>
        <p><strong>Statut:</strong> <span class="badge ${getStatusClass(order.status)}">${order.status || 'Inconnu'}</span></p>
        <p><strong>Serveur:</strong> ${order.waiter || 'Non spécifié'}</p>
      </div>
      
      <h4>Articles Commandés:</h4>
    `;
    
    if (Array.isArray(order.items) && order.items.length > 0) {
      detailsHTML += `
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background: #f8f9fa;">
              <th style="padding: 8px; border: 1px solid #ddd;">Article</th>
              <th style="padding: 8px; border: 1px solid #ddd;">Quantité</th>
              <th style="padding: 8px; border: 1px solid #ddd;">Prix Unitaire</th>
              <th style="padding: 8px; border: 1px solid #ddd;">Total</th>
            </tr>
          </thead>
          <tbody>
      `;
      
      order.items.forEach(item => {
        const itemTotal = (item.price || 0) * (item.quantity || 0);
        detailsHTML += `
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;">${item.name || 'Article'}</td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${item.quantity || 1}</td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${(item.price || 0).toFixed(2)} €</td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${itemTotal.toFixed(2)} €</td>
          </tr>
        `;
      });
      
      detailsHTML += `
          </tbody>
          <tfoot>
            <tr style="font-weight: bold;">
              <td colspan="3" style="padding: 8px; border: 1px solid #ddd; text-align: right;">Sous-total:</td>
              <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${(order.subtotal || order.total - 2 || 0).toFixed(2)} €</td>
            </tr>
            <tr style="font-weight: bold;">
              <td colspan="3" style="padding: 8px; border: 1px solid #ddd; text-align: right;">Frais service:</td>
              <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">2.00 €</td>
            </tr>
            <tr style="font-weight: bold;">
              <td colspan="3" style="padding: 8px; border: 1px solid #ddd; text-align: right;">Total:</td>
              <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${(order.total || 0).toFixed(2)} €</td>
            </tr>
          </tfoot>
        </table>
      `;
    } else {
      detailsHTML += `<p>Aucun article dans cette commande.</p>`;
    }
    
    if (order.notes) {
      detailsHTML += `
        <h4>Notes:</h4>
        <p style="background: #f8f9fa; padding: 10px; border-radius: 5px;">${order.notes}</p>
      `;
    }
    
    detailsHTML += `
      <div style="margin-top: 20px; text-align: center;">
        <button onclick="printInvoice(${order.id})" class="btn btn-primary" style="margin-right: 10px;">
          <i class="fas fa-print"></i> Imprimer Facture
        </button>
        <button onclick="closeOrderDetails()" class="btn">
          Fermer
        </button>
      </div>
    `;
    
    modalContent.innerHTML = detailsHTML;
  }
  
  const modal = document.getElementById('orderDetailsModal');
  if (modal) {
    modal.style.display = 'flex';
  }
}

function getStatusClass(status) {
  switch(status) {
    case 'en attente': return 'badge-warning';
    case 'en préparation': return 'badge-warning';
    case 'servie': return 'badge-success';
    case 'annulée': return 'badge-danger';
    default: return 'badge-secondary';
  }
}

function closeOrderDetails() {
  const modal = document.getElementById('orderDetailsModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

function printInvoice(orderId) {
  const orders = JSON.parse(localStorage.getItem('maeled_orders') || '[]');
  const order = orders.find(o => o.id === orderId);
  
  if (!order) {
    alert('Commande non trouvée!');
    return;
  }
  
  const subtotal = order.subtotal || order.total - 2 || 0;
  
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <html>
      <head>
        <title>Facture MAELED #${order.id}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; }
          .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px; }
          .info { margin-bottom: 20px; }
          .items { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .items th, .items td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          .footer { margin-top: 50px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>MAELED Restaurant</h1>
          <p>Authentique cuisine italienne</p>
          <p>Tél: 0606060606</p>
        </div>
        <div class="info">
          <p><strong>Facture #${order.id}</strong></p>
          <p><strong>Date:</strong> ${order.date || 'N/A'} ${order.time || 'N/A'}</p>
          <p><strong>Table:</strong> ${order.table || 'N/A'}</p>
          <p><strong>Personnes:</strong> ${order.guests || 1}</p>
        </div>
        <table class="items">
          <thead>
            <tr>
              <th>Description</th>
              <th>Qté</th>
              <th>Prix Unitaire</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${Array.isArray(order.items) ? order.items.map(item => `
              <tr>
                <td>${item.name || 'Article'}</td>
                <td>${item.quantity || 1}</td>
                <td>${(item.price || 0).toFixed(2)} €</td>
                <td>${((item.price || 0) * (item.quantity || 1)).toFixed(2)} €</td>
              </tr>
            `).join('') : ''}
          </tbody>
          <tfoot>
            <tr style="font-weight: bold;">
              <td colspan="3" style="text-align: right;">Sous-total:</td>
              <td>${subtotal.toFixed(2)} €</td>
            </tr>
            <tr style="font-weight: bold;">
              <td colspan="3" style="text-align: right;">Frais service:</td>
              <td>2.00 €</td>
            </tr>
            <tr style="font-weight: bold;">
              <td colspan="3" style="text-align: right;">Total:</td>
              <td>${(order.total || 0).toFixed(2)} €</td>
            </tr>
          </tfoot>
        </table>
        <div class="footer">
          <p>Merci de votre visite ! À bientôt !</p>
          <p>MAELED Restaurant - contact@maeled-restaurant.com - 0606060606</p>
        </div>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.print();
}

function changeOrderStatus(id) {
  const orders = JSON.parse(localStorage.getItem('maeled_orders') || '[]');
  const order = orders.find(o => o.id === id);
  
  if (!order) {
    alert('Commande non trouvée!');
    return;
  }
  
  const statuses = ['en attente', 'en préparation', 'servie', 'annulée'];
  const currentIndex = statuses.indexOf(order.status);
  const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % statuses.length;
  
  order.status = statuses[nextIndex];
  localStorage.setItem('maeled_orders', JSON.stringify(orders));
  
  const notifications = JSON.parse(localStorage.getItem('maeled_notifications') || '[]');
  notifications.unshift({
    id: notifications.length + 1,
    message: `Commande #${id}: ${order.status}`,
    time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    read: false
  });
  localStorage.setItem('maeled_notifications', JSON.stringify(notifications));
  
  loadOrders();
  alert(`Statut de la commande #${id} changé à: ${order.status}`);
}

function deleteOrder(id) {
  if (!confirm(`Supprimer la commande #${id} ?`)) {
    return;
  }
  
  const orders = JSON.parse(localStorage.getItem('maeled_orders') || '[]');
  const order = orders.find(o => o.id === id);
  
  if (!order) {
    alert('Commande non trouvée!');
    return;
  }
  
  const newOrders = orders.filter(o => o.id !== id);
  localStorage.setItem('maeled_orders', JSON.stringify(newOrders));
  
  const notifications = JSON.parse(localStorage.getItem('maeled_notifications') || '[]');
  notifications.unshift({
    id: notifications.length + 1,
    message: `Commande #${id} supprimée`,
    time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    read: false
  });
  localStorage.setItem('maeled_notifications', JSON.stringify(notifications));
  
  loadOrders();
  alert('Commande supprimée !');
}

function setupOrdersEventListeners() {
  console.log('Setting up event listeners...');
  
  const searchInput = document.getElementById('searchOrders');
  if (searchInput) {
    searchInput.addEventListener('input', loadOrders);
  }
  
  const statusFilter = document.getElementById('statusFilter');
  if (statusFilter) {
    statusFilter.addEventListener('change', loadOrders);
  }
  
  const timeFilter = document.getElementById('timeFilter');
  if (timeFilter) {
    timeFilter.addEventListener('change', loadOrders);
  }
  
  const printBtn = document.getElementById('printOrdersBtn');
  if (printBtn) {
    printBtn.addEventListener('click', printOrdersReport);
  }
  
  document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', function() {
      if (this.closest('#orderDetailsModal')) {
        closeOrderDetails();
      }
    });
  });
  
  const orderDetailsModal = document.getElementById('orderDetailsModal');
  if (orderDetailsModal) {
    orderDetailsModal.addEventListener('click', function(e) {
      if (e.target === this) {
        closeOrderDetails();
      }
    });
  }

  // NEW/UPDATED: Add order from admin
  // If the page provides the full modal (orders.html), we use it (so you can select items).
  // Otherwise we fallback to simple prompts.
  const addOrderBtn = document.getElementById('addOrderBtn') ||
                      document.getElementById('addOrder') ||
                      document.querySelector('[data-action="add-order"]');

  const addOrderModal = document.getElementById('addOrderModal');
  const orderForm = document.getElementById('orderForm');

  if (addOrderBtn) {
    addOrderBtn.addEventListener('click', function() {
      if (addOrderModal && orderForm) {
        openAddOrderModal();
      } else {
        addNewOrderPrompt();
      }
    });
  } else {
    // Fallback: create a floating button if the template doesn't include one
    const floating = document.createElement('button');
    floating.textContent = '➕ Nouvelle commande';
    floating.style.position = 'fixed';
    floating.style.bottom = '20px';
    floating.style.right = '20px';
    floating.style.zIndex = '9999';
    floating.style.padding = '10px 14px';
    floating.style.border = 'none';
    floating.style.borderRadius = '8px';
    floating.style.cursor = 'pointer';
    floating.style.background = '#2ecc71';
    floating.style.color = 'white';
    floating.style.fontWeight = 'bold';
    floating.onclick = function() {
      if (addOrderModal && orderForm) {
        openAddOrderModal();
      } else {
        addNewOrderPrompt();
      }
    };
    document.body.appendChild(floating);
  }

  // Hook modal close buttons (in orders.html there are multiple modals)
  if (addOrderModal) {
    addOrderModal.addEventListener('click', function(e) {
      if (e.target === this) closeAddOrderModal();
    });
  }

  // Submit handler for modal
  if (orderForm) {
    orderForm.addEventListener('submit', function(e) {
      e.preventDefault();
      saveOrderFromModal();
    });
  }

  // Add missing edit action for CRUD
  // (Orders table HTML already has View/Delete; we inject Edit if not present)
  ensureOrdersEditAction();

}

// -------------------------
// Add/Edit order modal logic
// -------------------------

let __orderDraft = { items: [] };

function openAddOrderModal(existingOrder) {
  const modal = document.getElementById('addOrderModal');
  const form = document.getElementById('orderForm');
  if (!modal || !form) return;

  const isEdit = !!existingOrder;
  __orderDraft = {
    id: isEdit ? existingOrder.id : null,
    table: isEdit ? (existingOrder.table || '') : '',
    guests: isEdit ? (existingOrder.guests || 2) : 2,
    notes: isEdit ? (existingOrder.notes || '') : '',
    status: isEdit ? (existingOrder.status || 'en attente') : 'en attente',
    items: Array.isArray(existingOrder?.items) ? existingOrder.items.map(i => ({
      id: i.id,
      name: i.name,
      price: Number(i.price || 0),
      quantity: Number(i.quantity || 1)
    })) : []
  };

  // Fill basic fields
  const tableEl = document.getElementById('orderTable');
  const guestsEl = document.getElementById('orderGuests');
  const notesEl = document.getElementById('orderNotes');

  if (tableEl) tableEl.value = __orderDraft.table;
  if (guestsEl) guestsEl.value = __orderDraft.guests;
  if (notesEl) notesEl.value = __orderDraft.notes;

  // Title
  const header = modal.querySelector('.modal-header h3');
  if (header) header.textContent = isEdit ? `Modifier la commande #${existingOrder.id}` : 'Nouvelle Commande';

  // Populate menu list
  buildMenuSelectionList();
  renderSelectedItems();

  modal.style.display = 'flex';

  // Close button
  modal.querySelectorAll('.close-modal').forEach(btn => {
    btn.onclick = closeAddOrderModal;
  });
}

function closeAddOrderModal() {
  const modal = document.getElementById('addOrderModal');
  if (modal) modal.style.display = 'none';
}

function buildMenuSelectionList() {
  const list = document.getElementById('menuItemsList');
  if (!list) return;

  const menu = JSON.parse(localStorage.getItem('maeled_menu') || '[]');
  const safeMenu = Array.isArray(menu) ? menu.filter(m => m && m.available !== false) : [];

  if (safeMenu.length === 0) {
    list.innerHTML = '<div style="color:#666; padding:8px;">Aucun plat disponible dans le menu.</div>';
    return;
  }

  // sort by popularity then name
  safeMenu.sort((a, b) => (b.popularity || 0) - (a.popularity || 0) || String(a.name||'').localeCompare(String(b.name||'')));

  list.innerHTML = safeMenu.map(item => {
    const id = item.id;
    const inDraft = __orderDraft.items.find(i => String(i.id) === String(id));
    const qty = inDraft ? (inDraft.quantity || 1) : 0;
    const checked = qty > 0;
    return `
      <div class="menu-pick" style="display:flex; align-items:center; justify-content:space-between; gap:10px; padding:8px; border-bottom:1px solid #f0f0f0;">
        <label style="display:flex; align-items:center; gap:10px; cursor:pointer; flex:1;">
          <input type="checkbox" data-id="${id}" ${checked ? 'checked' : ''}>
          <span style="font-weight:600;">${item.name || 'Plat'}</span>
          <span style="color:#666; font-size:12px;">(${Number(item.price||0).toFixed(2)} €)</span>
        </label>
        <div style="display:flex; align-items:center; gap:6px;">
          <button type="button" class="qty-btn" data-id="${id}" data-delta="-1" style="width:28px;height:28px;border-radius:8px;border:1px solid #ddd;background:#fff;cursor:pointer;">-</button>
          <input type="number" min="0" class="qty-input" data-id="${id}" value="${qty}" style="width:58px; padding:6px; border:1px solid #ddd; border-radius:8px;">
          <button type="button" class="qty-btn" data-id="${id}" data-delta="1" style="width:28px;height:28px;border-radius:8px;border:1px solid #ddd;background:#fff;cursor:pointer;">+</button>
        </div>
      </div>
    `;
  }).join('');

  // Events
  list.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', function() {
      const id = String(this.getAttribute('data-id'));
      const menuItem = safeMenu.find(m => String(m.id) === id);
      if (!menuItem) return;
      const existing = __orderDraft.items.find(i => String(i.id) === id);
      if (this.checked) {
        if (!existing) {
          __orderDraft.items.push({ id: menuItem.id, name: menuItem.name, price: Number(menuItem.price||0), quantity: 1 });
        } else {
          existing.quantity = Math.max(1, Number(existing.quantity||1));
        }
      } else {
        __orderDraft.items = __orderDraft.items.filter(i => String(i.id) !== id);
      }
      // sync qty input
      const qtyInput = list.querySelector(`.qty-input[data-id="${CSS.escape(id)}"]`);
      if (qtyInput) qtyInput.value = this.checked ? '1' : '0';
      renderSelectedItems();
    });
  });

  list.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = String(this.getAttribute('data-id'));
      const delta = parseInt(this.getAttribute('data-delta') || '0', 10);
      const qtyInput = list.querySelector(`.qty-input[data-id="${CSS.escape(id)}"]`);
      const current = parseInt(qtyInput?.value || '0', 10) || 0;
      const next = Math.max(0, current + delta);
      if (qtyInput) qtyInput.value = String(next);
      updateDraftQty(id, next, safeMenu);
      renderSelectedItems();
    });
  });

  list.querySelectorAll('.qty-input').forEach(inp => {
    inp.addEventListener('change', function() {
      const id = String(this.getAttribute('data-id'));
      const next = Math.max(0, parseInt(this.value || '0', 10) || 0);
      this.value = String(next);
      updateDraftQty(id, next, safeMenu);
      renderSelectedItems();
    });
  });
}

function updateDraftQty(id, qty, safeMenu) {
  const cb = document.querySelector(`#menuItemsList input[type="checkbox"][data-id="${CSS.escape(id)}"]`);
  const existing = __orderDraft.items.find(i => String(i.id) === id);
  if (qty <= 0) {
    __orderDraft.items = __orderDraft.items.filter(i => String(i.id) !== id);
    if (cb) cb.checked = false;
    return;
  }
  if (cb) cb.checked = true;
  if (existing) {
    existing.quantity = qty;
  } else {
    const menuItem = safeMenu.find(m => String(m.id) === id);
    if (!menuItem) return;
    __orderDraft.items.push({ id: menuItem.id, name: menuItem.name, price: Number(menuItem.price||0), quantity: qty });
  }
}

function renderSelectedItems() {
  const container = document.getElementById('selectedItems');
  const totalEl = document.getElementById('orderTotal');
  if (!container || !totalEl) return;

  if (!Array.isArray(__orderDraft.items) || __orderDraft.items.length === 0) {
    container.innerHTML = 'Aucun plat sélectionné';
    totalEl.textContent = '0.00 €';
    return;
  }

  const total = __orderDraft.items.reduce((sum, i) => sum + (Number(i.price||0) * Number(i.quantity||1)), 0);
  totalEl.textContent = total.toFixed(2) + ' €';

  container.innerHTML = __orderDraft.items.map(i => `
    <div style="display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px dashed #eee;">
      <div>
        <strong>${i.name || 'Plat'}</strong>
        <div style="color:#666; font-size:12px;">${Number(i.price||0).toFixed(2)} € × ${i.quantity || 1}</div>
      </div>
      <div style="font-weight:700;">${(Number(i.price||0) * Number(i.quantity||1)).toFixed(2)} €</div>
    </div>
  `).join('');
}

function saveOrderFromModal() {
  const tableEl = document.getElementById('orderTable');
  const guestsEl = document.getElementById('orderGuests');
  const notesEl = document.getElementById('orderNotes');

  const table = (tableEl?.value || '').trim();
  const guests = parseInt(guestsEl?.value || '1', 10) || 1;
  const notes = notesEl?.value || '';

  if (!table) {
    alert('Veuillez choisir une table.');
    return;
  }
  if (!Array.isArray(__orderDraft.items) || __orderDraft.items.length === 0) {
    alert('Veuillez sélectionner au moins un plat.');
    return;
  }

  let orders = [];
  try {
    orders = JSON.parse(localStorage.getItem('maeled_orders') || '[]');
    if (!Array.isArray(orders)) orders = [];
  } catch (e) {
    orders = [];
  }

  const nowDate = new Date().toISOString().split('T')[0];
  const nowTime = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const subtotal = __orderDraft.items.reduce((sum, i) => sum + (Number(i.price||0) * Number(i.quantity||1)), 0);
  const total = subtotal; // no delivery fee in admin

  if (__orderDraft.id) {
    const idx = orders.findIndex(o => String(o.id) === String(__orderDraft.id));
    if (idx >= 0) {
      orders[idx] = {
        ...orders[idx],
        table,
        guests,
        notes,
        items: __orderDraft.items,
        subtotal,
        total,
        time: orders[idx].time || nowTime,
        date: orders[idx].date || nowDate
      };
      localStorage.setItem('maeled_orders', JSON.stringify(orders));
      closeAddOrderModal();
      loadOrders();
      alert('✅ Commande modifiée !');
      return;
    }
  }

  const nextId = getNextOrderId(orders);
  const newOrder = {
    id: nextId,
    table,
    items: __orderDraft.items,
    subtotal,
    total,
    status: 'en attente',
    time: nowTime,
    date: nowDate,
    guests,
    notes,
    waiter: 'Admin'
  };
  orders.push(newOrder);
  localStorage.setItem('maeled_orders', JSON.stringify(orders));

  const notifications = JSON.parse(localStorage.getItem('maeled_notifications') || '[]');
  if (Array.isArray(notifications)) {
    notifications.unshift({
      id: notifications.length + 1,
      message: `Nouvelle commande #${nextId} sur ${table} - ${total.toFixed(2)} €`,
      time: nowTime,
      read: false
    });
    localStorage.setItem('maeled_notifications', JSON.stringify(notifications));
  }

  closeAddOrderModal();
  loadOrders();
  alert('✅ Commande ajoutée !');
}

function ensureOrdersEditAction() {
  // When rendering rows, we can add edit button. But some older cached HTML may not.
  // We patch via delegation in setupOrdersActionButtons by adding listeners for .action-btn.edit
  // and also update renderOrdersTable to include the edit button.
}

function printOrdersReport() {
  const orders = JSON.parse(localStorage.getItem('maeled_orders') || '[]');
  const today = new Date().toISOString().split('T')[0];
  const todayOrders = orders.filter(o => o.date === today);
  
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <html>
      <head>
        <title>Rapport Commandes MAELED</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px; }
          .stats { display: flex; justify-content: space-around; margin-bottom: 30px; }
          .stat-box { text-align: center; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
          .orders-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .orders-table th, .orders-table td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          .total-row { font-weight: bold; }
          .footer { margin-top: 50px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Rapport des Commandes</h1>
          <p>MAELED Restaurant - ${new Date().toLocaleDateString('fr-FR')}</p>
        </div>
        
        <div class="stats">
          <div class="stat-box">
            <h3>${todayOrders.length}</h3>
            <p>Commandes aujourd'hui</p>
          </div>
          <div class="stat-box">
            <h3>${todayOrders.filter(o => o.status === 'servie').length}</h3>
            <p>Commandes servies</p>
          </div>
          <div class="stat-box">
            <h3>${todayOrders.reduce((sum, o) => sum + (o.total || 0), 0).toFixed(2)} €</h3>
            <p>Chiffre d'affaires</p>
          </div>
        </div>
        
        <h3>Commandes du Jour</h3>
        <table class="orders-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Table</th>
              <th>Articles</th>
              <th>Total</th>
              <th>Statut</th>
              <th>Heure</th>
            </tr>
          </thead>
          <tbody>
            ${todayOrders.map(order => `
              <tr>
                <td>${order.id || 'N/A'}</td>
                <td>${order.table || 'N/A'}</td>
                <td>${Array.isArray(order.items) ? order.items.reduce((sum, item) => sum + (item.quantity || 1), 0) : 0}</td>
                <td>${(order.total || 0).toFixed(2)} €</td>
                <td>${order.status || 'N/A'}</td>
                <td>${order.time || 'N/A'}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr class="total-row">
              <td colspan="3">Total du jour:</td>
              <td>${todayOrders.reduce((sum, o) => sum + (o.total || 0), 0).toFixed(2)} €</td>
              <td colspan="2"></td>
            </tr>
          </tfoot>
        </table>
        
        <div class="footer">
          <p>Généré le ${new Date().toLocaleString('fr-FR')}</p>
          <p>MAELED Restaurant - Système de Gestion</p>
        </div>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.print();
}

function setupMobileMenu() {
  const menuToggle = document.querySelector('.mobile-menu-toggle');
  const sidebar = document.querySelector('.sidebar');
  
  if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', function() {
      sidebar.classList.toggle('active');
    });
  }
}


/**
 * NEW: Allow admin to create a new order directly from the Orders page (dashboard).
 * Uses simple prompts so it works even if the HTML modal is missing.
 */
function addNewOrderPrompt() {
  const table = prompt('Numéro de table ? (ex: T1) ou "emporter" :', 'T1');
  if (!table) return;

  const guestsRaw = prompt('Nombre de personnes ?', '1');
  const guests = parseInt(guestsRaw || '1', 10);

  const totalRaw = prompt('Total (€) ? (ex: 29.50). Laisse vide pour 0 :', '');
  const total = parseFloat((totalRaw || '0').replace(',', '.')) || 0;

  const statuses = ['en attente', 'en préparation', 'servie', 'annulée'];
  const statusRaw = prompt('Statut ? (en attente / en préparation / servie / annulée)', 'en attente');
  const status = statuses.includes((statusRaw || '').trim()) ? (statusRaw || 'en attente').trim() : 'en attente';

  const notes = prompt('Notes (optionnel) :', '') || '';

  let orders = [];
  try {
    orders = JSON.parse(localStorage.getItem('maeled_orders') || '[]');
    if (!Array.isArray(orders)) orders = [];
  } catch (e) {
    orders = [];
  }

  const nextId = getNextOrderId(orders);

  // If admin doesn't enter items, we keep items empty.
  const newOrder = {
    id: nextId,
    table: table,
    items: [],
    subtotal: Math.max(total - 2, 0),
    total: total,
    status: status,
    time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    date: new Date().toISOString().split('T')[0],
    guests: isNaN(guests) ? 1 : guests,
    notes: notes,
    waiter: 'Admin'
  };

  orders.push(newOrder);
  localStorage.setItem('maeled_orders', JSON.stringify(orders));

  // Notification
  const notifications = JSON.parse(localStorage.getItem('maeled_notifications') || '[]');
  if (Array.isArray(notifications)) {
    notifications.unshift({
      id: notifications.length + 1,
      message: `Nouvelle commande #${nextId} sur ${table} - ${total.toFixed(2)} €`,
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      read: false
    });
    localStorage.setItem('maeled_notifications', JSON.stringify(notifications));
  }

  // Refresh UI
  loadOrders();
  alert('✅ Commande ajoutée !');
}

function getNextOrderId(orders) {
  const ids = (orders || [])
    .map(o => typeof o.id === 'number' ? o.id : parseInt(o.id || '0', 10))
    .filter(n => Number.isFinite(n) && n > 0);
  const maxId = ids.length ? Math.max(...ids) : 1000;
  return maxId + 1;
}

window.printInvoice = printInvoice;
window.closeOrderDetails = closeOrderDetails;