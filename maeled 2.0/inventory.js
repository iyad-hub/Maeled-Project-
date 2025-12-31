document.addEventListener('DOMContentLoaded', function() {
  console.log('Inventory page loading...');
  
  initInventory();
  setupMobileMenu();
});

function initInventory() {
  console.log('Initializing inventory...');
  
  loadInventory();
  setupInventoryEventListeners();
}

function loadInventory() {
  console.log('Loading inventory from localStorage...');
  
  const inventory = JSON.parse(localStorage.getItem('maeled_inventory') || '[]');
  console.log('Found inventory items:', inventory);
  
  const searchTerm = document.getElementById('searchInventory')?.value.toLowerCase() || '';
  const categoryFilter = document.getElementById('categoryFilter')?.value || 'all';
  const stockFilter = document.getElementById('stockFilter')?.value || 'all';
  
  let filteredData = inventory.filter(item => {
    const matchesSearch = !searchTerm || 
      (item.name && item.name.toLowerCase().includes(searchTerm)) ||
      (item.category && item.category.toLowerCase().includes(searchTerm)) ||
      (item.supplier && item.supplier.toLowerCase().includes(searchTerm));
    
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    
    let matchesStock = true;
    if (stockFilter === 'low') {
      matchesStock = item.quantity <= item.minQuantity && item.quantity > 0;
    } else if (stockFilter === 'out') {
      matchesStock = item.quantity <= 0;
    } else if (stockFilter === 'normal') {
      matchesStock = item.quantity > item.minQuantity;
    }
    
    return matchesSearch && matchesCategory && matchesStock;
  });
  
  filteredData.sort((a, b) => {
    if (a.quantity <= a.minQuantity && b.quantity > b.minQuantity) return -1;
    if (a.quantity > a.minQuantity && b.quantity <= b.minQuantity) return 1;
    if (a.quantity <= 0 && b.quantity > 0) return -1;
    return a.name.localeCompare(b.name);
  });
  
  renderInventoryTable(filteredData);
  updateInventoryStats(inventory);
}

function updateInventoryStats(inventory) {
  console.log('Updating inventory stats...');
  
  const stats = {
    totalItems: inventory.length,
    lowStock: inventory.filter(item => item.quantity <= item.minQuantity && item.quantity > 0).length,
    outOfStock: inventory.filter(item => item.quantity <= 0).length,
    totalValue: inventory.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0)
  };
  
  console.log('Inventory stats:', stats);
  
  const totalEl = document.getElementById('totalItems');
  const lowStockEl = document.getElementById('lowStockItems');
  const outOfStockEl = document.getElementById('outOfStockItems');
  const totalValueEl = document.getElementById('totalValue');
  
  if (totalEl) totalEl.textContent = stats.totalItems;
  if (lowStockEl) lowStockEl.textContent = stats.lowStock;
  if (outOfStockEl) outOfStockEl.textContent = stats.outOfStock;
  if (totalValueEl) totalValueEl.textContent = stats.totalValue.toFixed(2) + ' €';
}

function renderInventoryTable(data) {
  console.log('Rendering inventory table with', data.length, 'items');
  
  const tbody = document.getElementById('inventoryTableBody');
  if (!tbody) {
    console.error('Inventory table body not found!');
    return;
  }
  
  tbody.innerHTML = '';
  
  if (data.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="10" style="text-align: center; padding: 40px; color: #666;">
          Aucun article en stock trouvé
        </td>
      </tr>
    `;
    updateInventoryPaginationInfo(0, 0, 0);
    return;
  }
  
  data.forEach(item => {
    const row = document.createElement('tr');
    
    const itemValue = (item.quantity || 0) * (item.unitCost || 0);
    
    let statusBadge = '';
    if (item.quantity <= 0) {
      statusBadge = '<span class="badge badge-danger">Rupture</span>';
    } else if (item.quantity <= item.minQuantity) {
      statusBadge = '<span class="badge badge-warning">Faible stock</span>';
    } else {
      statusBadge = '<span class="badge badge-success">Disponible</span>';
    }
    
    const progressWidth = item.quantity <= 0 ? 0 : Math.min(100, (item.quantity / (item.minQuantity * 3)) * 100);
    const progressColor = item.quantity <= 0 ? '#e74c3c' : (item.quantity <= item.minQuantity ? '#f39c12' : '#2ecc71');
    
    row.innerHTML = `
      <td><strong>#${item.id || 'N/A'}</strong></td>
      <td>
        <div style="font-weight: bold; color: #2c3e50;">${item.name || 'N/A'}</div>
        <small style="color: #666;">${item.supplier || 'Pas de fournisseur'}</small>
      </td>
      <td><span class="category-badge">${item.category || 'N/A'}</span></td>
      <td>
        <div style="font-weight: bold; font-size: 16px;">${formatQuantity(item.quantity)}</div>
        <div class="progress-bar" style="height: 6px; margin-top: 5px;">
          <div class="progress-fill" style="width: ${progressWidth}%; background: ${progressColor};"></div>
        </div>
      </td>
      <td>${item.unit || 'N/A'}</td>
      <td>${formatQuantity(item.minQuantity)}</td>
      <td><strong>${(item.unitCost || 0).toFixed(2)} €</strong></td>
      <td><strong style="color: #27ae60;">${itemValue.toFixed(2)} €</strong></td>
      <td>${statusBadge}</td>
      <td>
        <div class="table-actions">
          <button class="action-btn adjust" data-id="${item.id}" title="Ajuster stock">
            <i class="fas fa-exchange-alt"></i>
          </button>
          <button class="action-btn edit" data-id="${item.id}" title="Modifier">
            <i class="fas fa-edit"></i>
          </button>
          <button class="action-btn delete" data-id="${item.id}" title="Supprimer">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    `;
    
    tbody.appendChild(row);
  });
  
  updateInventoryPaginationInfo(data.length, 1, data.length);
  setupInventoryActionButtons();
}

function formatQuantity(qty) {
  if (qty === null || qty === undefined) return '0';
  return qty % 1 === 0 ? qty.toString() : qty.toFixed(2);
}

function updateInventoryPaginationInfo(total, start, end) {
  const paginationInfo = document.getElementById('paginationInfo');
  if (paginationInfo) {
    paginationInfo.textContent = `Affichage de ${start} à ${end} sur ${total} articles`;
  }
}

function setupInventoryActionButtons() {
  console.log('Setting up inventory action buttons...');
  
  document.querySelectorAll('.action-btn.adjust').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = parseInt(this.getAttribute('data-id'));
      console.log('Adjust item:', id);
      showAdjustQuantityModal(id);
    });
  });
  
  document.querySelectorAll('.action-btn.edit').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = parseInt(this.getAttribute('data-id'));
      console.log('Edit item:', id);
      editInventoryItem(id);
    });
  });
  
  document.querySelectorAll('.action-btn.delete').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = parseInt(this.getAttribute('data-id'));
      console.log('Delete item:', id);
      deleteInventoryItem(id);
    });
  });
}

function showAdjustQuantityModal(id) {
  const inventory = JSON.parse(localStorage.getItem('maeled_inventory') || '[]');
  const item = inventory.find(i => i.id === id);
  
  if (!item) {
    alert('Article non trouvé!');
    return;
  }
  
  document.getElementById('adjustItemId').value = id;
  document.getElementById('adjustItemName').textContent = item.name;
  document.getElementById('currentQuantity').textContent = formatQuantity(item.quantity) + ' ' + item.unit;
  
  const modal = document.getElementById('adjustQuantityModal');
  if (modal) {
    modal.style.display = 'flex';
  }
}

function editInventoryItem(id) {
  const inventory = JSON.parse(localStorage.getItem('maeled_inventory') || '[]');
  const item = inventory.find(i => i.id === id);
  if (!item) return;

  document.getElementById('editInventoryId').value = String(item.id);
  document.getElementById('editItemName').value = item.name || '';
  document.getElementById('editItemCategory').value = item.category || '';
  document.getElementById('editItemQuantity').value = Number.isFinite(item.quantity) ? item.quantity : 0;
  document.getElementById('editItemUnit').value = item.unit || '';
  document.getElementById('editItemMin').value = Number.isFinite(item.minStock) ? item.minStock : 0;
  document.getElementById('editItemSupplier').value = item.supplier || '';
  document.getElementById('editItemCost').value = Number.isFinite(item.cost) ? item.cost : 0;
  document.getElementById('editItemLocation').value = item.location || '';
  document.getElementById('editItemExpiry').value = item.expiryDate || '';
  document.getElementById('editItemNotes').value = item.notes || '';

  showEditItemModal();
}

function showEditItemModal() {
  const modal = document.getElementById('editItemModal');
  if (modal) modal.style.display = 'flex';
}

function hideEditItemModal() {
  const modal = document.getElementById('editItemModal');
  if (modal) modal.style.display = 'none';
}

function deleteInventoryItem(id) {
  const inventory = JSON.parse(localStorage.getItem('maeled_inventory') || '[]');
  const item = inventory.find(i => i.id === id);
  
  if (!item) {
    alert('Article non trouvé!');
    return;
  }
  
  if (!confirm(`Supprimer l'article "${item.name}" de l'inventaire ?`)) {
    return;
  }
  
  const newInventory = inventory.filter(i => i.id !== id);
  localStorage.setItem('maeled_inventory', JSON.stringify(newInventory));
  
  const notifications = JSON.parse(localStorage.getItem('maeled_notifications') || '[]');
  notifications.unshift({
    id: notifications.length + 1,
    message: `Article supprimé de l'inventaire: ${item.name}`,
    time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    read: false
  });
  localStorage.setItem('maeled_notifications', JSON.stringify(notifications));
  
  loadInventory();
  alert('Article supprimé de l\'inventaire !');
}

function setupInventoryEventListeners() {
  console.log('Setting up inventory event listeners...');
  
  const searchInput = document.getElementById('searchInventory');
  if (searchInput) {
    searchInput.addEventListener('input', loadInventory);
  }
  
  const categoryFilter = document.getElementById('categoryFilter');
  if (categoryFilter) {
    categoryFilter.addEventListener('change', loadInventory);
  }
  
  const stockFilter = document.getElementById('stockFilter');
  if (stockFilter) {
    stockFilter.addEventListener('change', loadInventory);
  }
  
  const addItemBtn = document.getElementById('addItemBtn');
  if (addItemBtn) {
    addItemBtn.addEventListener('click', showAddItemModal);
  }
  
  const orderSuppliesBtn = document.getElementById('orderSuppliesBtn');
  if (orderSuppliesBtn) {
    orderSuppliesBtn.addEventListener('click', showOrderSupplies);
  

  // Edit modal listeners
  document.querySelector('#editItemModal .close-modal')?.addEventListener('click', hideEditItemModal);

  document.getElementById('editInventoryForm')?.addEventListener('submit', function(e) {
    e.preventDefault();

    const inventory = JSON.parse(localStorage.getItem('maeled_inventory') || '[]');
    const id = parseInt(document.getElementById('editInventoryId').value, 10);
    const item = inventory.find(x => x.id === id);
    if (!item) return;

    const updated = {
      id,
      name: document.getElementById('editItemName').value.trim(),
      category: document.getElementById('editItemCategory').value.trim(),
      quantity: parseFloat(document.getElementById('editItemQuantity').value || '0'),
      unit: document.getElementById('editItemUnit').value.trim(),
      minQuantity: parseFloat(document.getElementById('editItemMin').value || '0'),
      supplier: document.getElementById('editItemSupplier').value.trim(),
      cost: parseFloat(document.getElementById('editItemCost').value || '0'),
      location: document.getElementById('editItemLocation').value.trim(),
      expiryDate: document.getElementById('editItemExpiry').value || null,
      notes: document.getElementById('editItemNotes').value.trim()
    };

    if (!updated.name || !updated.category || !updated.unit) {
      alert('Veuillez remplir correctement les champs obligatoires.');
      return;
    }

    Object.assign(item, updated);
    localStorage.setItem('maeled_inventory', JSON.stringify(inventory));

    hideEditItemModal();
    loadInventory();
    alert('✅ Article modifié avec succès !');
  });

  document.getElementById('editItemModal')?.addEventListener('click', function(e) {
    if (e.target === this) hideEditItemModal();
  });
}
  
  document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', function() {
      const modal = this.closest('.modal');
      if (modal) {
        modal.style.display = 'none';
      }
    });
  });
  
  const addItemModal = document.getElementById('addItemModal');
  if (addItemModal) {
    addItemModal.addEventListener('click', function(e) {
      if (e.target === this) {
        this.style.display = 'none';
      }
    });
  }
  
  const adjustModal = document.getElementById('adjustQuantityModal');
  if (adjustModal) {
    adjustModal.addEventListener('click', function(e) {
      if (e.target === this) {
        this.style.display = 'none';
      }
    });
  }
  
  const inventoryForm = document.getElementById('inventoryForm');
  if (inventoryForm) {
    inventoryForm.addEventListener('submit', saveInventoryItem);
  }
  
  const adjustForm = document.getElementById('adjustForm');
  if (adjustForm) {
    adjustForm.addEventListener('submit', adjustItemQuantity);
  }
}

function showAddItemModal() {
  const form = document.getElementById('inventoryForm');
  form.reset();
  
  const tomorrow = new Date();
  tomorrow.setMonth(tomorrow.getMonth() + 3);
  document.getElementById('itemExpiry').value = tomorrow.toISOString().split('T')[0];
  
  document.getElementById('addItemModal').style.display = 'flex';
}

function showOrderSupplies() {
  const inventory = JSON.parse(localStorage.getItem('maeled_inventory') || '[]');
  const lowStockItems = inventory.filter(item => item.quantity <= item.minQuantity);
  
  if (lowStockItems.length === 0) {
    alert('✅ Aucun article en faible stock à commander!');
    return;
  }
  
  let orderList = '📋 LISTE DE COMMANDE\n\n';
  let totalCost = 0;
  
  lowStockItems.forEach(item => {
    const orderQty = Math.max(item.minQuantity * 2 - item.quantity, item.minQuantity);
    const itemCost = orderQty * item.unitCost;
    totalCost += itemCost;
    
    orderList += `• ${item.name}: ${formatQuantity(orderQty)} ${item.unit}\n`;
    orderList += `  Fournisseur: ${item.supplier || 'Non spécifié'}\n`;
    orderList += `  Coût: ${itemCost.toFixed(2)} €\n\n`;
  });
  
  orderList += `\n💰 TOTAL ESTIMÉ: ${totalCost.toFixed(2)} €`;
  
  if (confirm(`Générer une liste de commande pour ${lowStockItems.length} articles ?\n\nCliquez sur OK pour voir la liste.`)) {
    alert(orderList);
  }
}

function saveInventoryItem(e) {
  e.preventDefault();
  console.log('Saving new inventory item...');
  
  const inventory = JSON.parse(localStorage.getItem('maeled_inventory') || '[]');
  const newId = inventory.length > 0 ? Math.max(...inventory.map(i => i.id || 0)) + 1 : 1;
  
  const newItem = {
    id: newId,
    name: document.getElementById('itemName').value,
    category: document.getElementById('itemCategory').value,
    quantity: parseFloat(document.getElementById('itemQuantity').value) || 0,
    unit: document.getElementById('itemUnit').value,
    minQuantity: parseFloat(document.getElementById('itemMin').value) || 0,
    unitCost: parseFloat(document.getElementById('itemCost').value) || 0,
    supplier: document.getElementById('itemSupplier').value || '',
    expiryDate: document.getElementById('itemExpiry').value || null,
    location: document.getElementById('itemLocation').value || '',
    notes: document.getElementById('itemNotes').value || '',
    lastUpdated: new Date().toISOString(),
    created: new Date().toISOString()
  };
  
  inventory.push(newItem);
  localStorage.setItem('maeled_inventory', JSON.stringify(inventory));
  
  const notifications = JSON.parse(localStorage.getItem('maeled_notifications') || '[]');
  notifications.unshift({
    id: notifications.length + 1,
    message: `Nouvel article ajouté: ${newItem.name} (${newItem.quantity} ${newItem.unit})`,
    time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    read: false
  });
  localStorage.setItem('maeled_notifications', JSON.stringify(notifications));
  
  document.getElementById('addItemModal').style.display = 'none';
  document.getElementById('inventoryForm').reset();
  loadInventory();
  
  alert(`✅ Article ajouté à l'inventaire !\n\nNom: ${newItem.name}\nQuantité: ${newItem.quantity} ${newItem.unit}\nSeuil min: ${newItem.minQuantity} ${newItem.unit}\nCoût: ${newItem.unitCost}€/${newItem.unit}`);
}

function adjustItemQuantity(e) {
  e.preventDefault();
  
  const id = parseInt(document.getElementById('adjustItemId').value);
  const adjustType = document.getElementById('adjustType').value;
  const adjustAmount = parseFloat(document.getElementById('adjustAmount').value);
  const reason = document.getElementById('adjustReason').value;
  const notes = document.getElementById('adjustNotes').value;
  
  if (isNaN(adjustAmount) || adjustAmount <= 0) {
    alert('Quantité invalide!');
    return;
  }
  
  const inventory = JSON.parse(localStorage.getItem('maeled_inventory') || '[]');
  const item = inventory.find(i => i.id === id);
  
  if (!item) {
    alert('Article non trouvé!');
    return;
  }
  
  let newQuantity = item.quantity;
  let operation = '';
  
  switch(adjustType) {
    case 'add':
      newQuantity += adjustAmount;
      operation = 'ajouté';
      break;
    case 'remove':
      if (adjustAmount > item.quantity) {
        if (!confirm(`Retirer ${adjustAmount} ${item.unit} alors qu'il n'y a que ${item.quantity} ${item.unit} en stock ?`)) {
          return;
        }
      }
      newQuantity -= adjustAmount;
      if (newQuantity < 0) newQuantity = 0;
      operation = 'retiré';
      break;
    case 'set':
      newQuantity = adjustAmount;
      operation = 'défini à';
      break;
  }
  
  const oldQuantity = item.quantity;
  item.quantity = newQuantity;
  item.lastUpdated = new Date().toISOString();
  
  localStorage.setItem('maeled_inventory', JSON.stringify(inventory));
  
  const notifications = JSON.parse(localStorage.getItem('maeled_notifications') || '[]');
  notifications.unshift({
    id: notifications.length + 1,
    message: `Stock ajusté: ${item.name} ${operation} ${adjustAmount} ${item.unit}`,
    time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    read: false
  });
  localStorage.setItem('maeled_notifications', JSON.stringify(notifications));
  
  document.getElementById('adjustQuantityModal').style.display = 'none';
  document.getElementById('adjustForm').reset();
  loadInventory();
  
  alert(`✅ Stock ajusté !\n\n${item.name}: ${oldQuantity} → ${newQuantity} ${item.unit}\nRaison: ${reason || 'Non spécifiée'}`);
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