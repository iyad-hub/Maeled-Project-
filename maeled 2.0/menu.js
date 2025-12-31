document.addEventListener('DOMContentLoaded', function() {
  initMenu();
  setupMobileMenu();
});

function initMenu() {
  const sampleMenu = [
    { id: 1, name: 'Salade César', category: 'entrées', price: 8.50, cost: 3.20, available: true, popularity: 85, ingredients: 'Laitue, poulet, croutons, parmesan', description: 'Salade fraîche avec poulet grillé', prepTime: 10 },
    { id: 2, name: 'Pizza 4 Fromages', category: 'pizzas', price: 12.00, cost: 4.50, available: true, popularity: 92, ingredients: 'Mozzarella, gorgonzola, parmesan, ricotta', description: 'Pizza traditionnelle aux 4 fromages', prepTime: 20 },
    { id: 3, name: 'Carbonara', category: 'pâtes', price: 12.00, cost: 4.00, available: true, popularity: 78, ingredients: 'Pâtes, lardons, œuf, parmesan', description: 'Spaghetti à la carbonara', prepTime: 15 },
    { id: 4, name: 'Tiramisu', category: 'desserts', price: 7.00, cost: 2.50, available: true, popularity: 88, ingredients: 'Mascarpone, café, cacao, biscuits', description: 'Dessert italien au café', prepTime: 0 },
    { id: 5, name: 'Burrata', category: 'entrées', price: 6.00, cost: 2.80, available: false, popularity: 65, ingredients: 'Burrata, tomates, basilic', description: 'Burrata fraîche avec tomates', prepTime: 5 }
  ];
  
  if (!localStorage.getItem('maeled_menu')) {
    localStorage.setItem('maeled_menu', JSON.stringify(sampleMenu));
  }
  
  loadMenu();
  
  setupMenuEventListeners();
}

function loadMenu() {
  const menuItems = JSON.parse(localStorage.getItem('maeled_menu') || '[]');
  const searchTerm = document.getElementById('searchMenu').value.toLowerCase();
  const categoryFilter = document.getElementById('categoryFilter').value;
  const availabilityFilter = document.getElementById('availabilityFilter').value;
  
  let filteredData = menuItems.filter(item => {
    const matchesSearch = !searchTerm || 
      item.name.toLowerCase().includes(searchTerm) ||
      item.description.toLowerCase().includes(searchTerm) ||
      item.ingredients.toLowerCase().includes(searchTerm);
    
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    
    let matchesAvailability = true;
    if (availabilityFilter === 'available') {
      matchesAvailability = item.available === true;
    } else if (availabilityFilter === 'unavailable') {
      matchesAvailability = item.available === false;
    }
    
    return matchesSearch && matchesCategory && matchesAvailability;
  });
  
  filteredData.sort((a, b) => b.popularity - a.popularity);
  
  renderMenuTable(filteredData);
}

function renderMenuTable(data) {
  const tbody = document.getElementById('menuTableBody');
  tbody.innerHTML = '';
  
  if (data.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 40px; color: #666;">
          Aucun plat trouvé
        </td>
      </tr>
    `;
    updateMenuPaginationInfo(0, 0, 0);
    return;
  }
  
  data.forEach(item => {
    const row = document.createElement('tr');
    
    const margin = item.cost ? ((item.price - item.cost) / item.price * 100).toFixed(1) : 'N/A';
    
    row.innerHTML = `
      <td>${item.id}</td>
      <td>
        <strong>${item.name}</strong><br>
        <small style="color: #666;">${item.description || 'Pas de description'}</small>
      </td>
      <td><span class="category-badge">${item.category}</span></td>
      <td>
        <strong>${item.price.toFixed(2)} €</strong><br>
        <small style="color: #666;">Marge: ${margin}%</small>
      </td>
      <td>
        <label class="availability-toggle">
          <input type="checkbox" ${item.available ? 'checked' : ''} data-id="${item.id}">
          <span class="toggle-slider"></span>
        </label>
      </td>
      <td>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${item.popularity}%">
            <span class="progress-text">${item.popularity}%</span>
          </div>
        </div>
      </td>
      <td>
        <div class="table-actions">
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
  
  updateMenuPaginationInfo(data.length, 1, data.length);
  
  setupMenuActionButtons();
  setupAvailabilityToggles();
}

function updateMenuPaginationInfo(total, start, end) {
  document.getElementById('paginationInfo').textContent = 
    `Affichage de ${start} à ${end} sur ${total} plats`;
}

function setupAvailabilityToggles() {
  document.querySelectorAll('.availability-toggle input').forEach(toggle => {
    toggle.addEventListener('change', function() {
      const id = parseInt(this.getAttribute('data-id'));
      const menuItems = JSON.parse(localStorage.getItem('maeled_menu'));
      const item = menuItems.find(m => m.id === id);
      
      if (item) {
        item.available = this.checked;
        localStorage.setItem('maeled_menu', JSON.stringify(menuItems));
        
        const notifications = JSON.parse(localStorage.getItem('maeled_notifications') || '[]');
        notifications.unshift({
          id: notifications.length + 1,
          message: `"${item.name}" ${item.available ? 'disponible' : 'indisponible'}`,
          time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          read: false
        });
        localStorage.setItem('maeled_notifications', JSON.stringify(notifications));
        
        alert(`Le plat "${item.name}" est maintenant ${item.available ? 'disponible' : 'indisponible'}`);
      }
    });
  });
}

function setupMenuActionButtons() {
  document.querySelectorAll('.action-btn.edit').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = parseInt(this.getAttribute('data-id'));
      editMenuItem(id);
    });
  });
  
  document.querySelectorAll('.action-btn.delete').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = parseInt(this.getAttribute('data-id'));
      deleteMenuItem(id);
    });
  });
}

function editMenuItem(id) {
  const menuItems = JSON.parse(localStorage.getItem('maeled_menu') || '[]');
  const item = menuItems.find(m => m.id === id);
  if (!item) return;

  // Remplir le formulaire
  document.getElementById('editItemId').value = String(item.id);
  document.getElementById('editItemName').value = item.name || '';
  document.getElementById('editItemCategory').value = item.category || '';
  document.getElementById('editItemPrice').value = Number.isFinite(item.price) ? item.price : 0;
  document.getElementById('editItemCost').value = (item.cost === null || typeof item.cost === "undefined") ? "" : item.cost;
  document.getElementById('editItemPrepTime').value = (item.prepTime === null || typeof item.prepTime === "undefined") ? "" : item.prepTime;
  document.getElementById('editItemIngredients').value = item.ingredients || '';
  document.getElementById('editItemDescription').value = item.description || '';
  const _editImgInput = document.getElementById('editItemImage');
  const _editChangeImg = document.getElementById('editChangeImage');
  const _editImgGroup = document.getElementById('editImageGroup');

  if (_editImgInput) {
    const originalImg = item.image || '';
    _editImgInput.value = ''; // par défaut, on ne modifie pas l'image
    _editImgInput.dataset.original = originalImg;
    _editImgInput.disabled = true;
  }
  if (_editChangeImg) _editChangeImg.checked = false;
  if (_editImgGroup) _editImgGroup.style.display = 'none';

  document.getElementById('editItemAvailable').checked = item.available !== false;

  showEditMenuItemModal();
}

function showEditMenuItemModal() {
  const modal = document.getElementById('editMenuItemModal');
  if (modal) modal.style.display = 'flex';
}

function hideEditMenuItemModal() {
  const modal = document.getElementById('editMenuItemModal');
  if (modal) modal.style.display = 'none';
}

// Gestion du checkbox "Changer l'image" dans l'édition Menu
document.addEventListener('change', function(e) {
  if (e.target && e.target.id === 'editChangeImage') {
    const imgGroup = document.getElementById('editImageGroup');
    const imgInput = document.getElementById('editItemImage');
    const checked = e.target.checked;

    if (imgGroup) imgGroup.style.display = checked ? 'block' : 'none';
    if (imgInput) {
      imgInput.disabled = !checked;
      if (!checked) imgInput.value = ''; // on ne touche pas à l'image
    }
  }
});

function deleteMenuItem(id) {
  const menuItems = JSON.parse(localStorage.getItem('maeled_menu'));
  const item = menuItems.find(m => m.id === id);
  
  if (item && confirm(`Supprimer "${item.name}" du menu ?`)) {
    const newMenu = menuItems.filter(m => m.id !== id);
    localStorage.setItem('maeled_menu', JSON.stringify(newMenu));
    loadMenu();
    alert('Plat supprimé du menu !');
  }
}

function setupMenuEventListeners() {
  document.getElementById('searchMenu').addEventListener('input', loadMenu);
  
  document.getElementById('categoryFilter').addEventListener('change', loadMenu);
  document.getElementById('availabilityFilter').addEventListener('change', loadMenu);
  
  document.getElementById('addMenuItemBtn').addEventListener('click', showAddMenuItemModal);
  
  document.querySelector('.close-modal').addEventListener('click', hideAddMenuItemModal);
  
  document.getElementById('menuItemForm').addEventListener('submit', saveMenuItem);
  
  document.getElementById('addMenuItemModal').addEventListener('click', function(e) {
    if (e.target === this) {
      hideAddMenuItemModal();
    }
  });


  // Edit modal listeners
  document.querySelector('#editMenuItemModal .close-modal')?.addEventListener('click', hideEditMenuItemModal);

  document.getElementById('editMenuItemForm')?.addEventListener('submit', function(e) {
    e.preventDefault();

    const menuItems = JSON.parse(localStorage.getItem('maeled_menu') || '[]');
    const id = parseInt(document.getElementById('editItemId').value, 10);
    const item = menuItems.find(m => m.id === id);
    if (!item) return;

    const name = document.getElementById('editItemName').value.trim();
    const category = document.getElementById('editItemCategory').value.trim();
    const price = parseFloat(document.getElementById('editItemPrice').value);
    const costRaw = document.getElementById('editItemCost').value.trim();
    const cost = costRaw === "" ? null : parseFloat(costRaw);
    const prepRaw = document.getElementById('editItemPrepTime').value.trim();
    const prepTime = prepRaw === "" ? null : parseInt(prepRaw, 10);
    const ingredients = document.getElementById('editItemIngredients').value.trim();
    const description = document.getElementById('editItemDescription').value.trim();
    const _imgInput = document.getElementById('editItemImage');
    const _changeImg = document.getElementById('editChangeImage');
    const wantsChangeImage = _changeImg ? _changeImg.checked : false;

    // Si l'utilisateur ne veut pas changer l'image, on conserve l'ancienne.
    // Si l'utilisateur coche "changer l'image" mais laisse vide, on conserve aussi l'ancienne.
    const image = wantsChangeImage
      ? ((_imgInput && _imgInput.value) ? _imgInput.value.trim() : '')
      : ((_imgInput && _imgInput.dataset) ? (_imgInput.dataset.original || '') : (item.image || ''));

    const finalImage = (wantsChangeImage && image !== '') ? image : (item.image || ( (_imgInput && _imgInput.dataset && _imgInput.dataset.original) ? _imgInput.dataset.original : '' ));
    const available = document.getElementById('editItemAvailable').checked;

    if (!name || !category || !Number.isFinite(price) || price < 0 || (cost !== null && (!Number.isFinite(cost) || cost < 0)) || (prepTime !== null && (!Number.isFinite(prepTime) || prepTime < 0))) {
      alert('Veuillez remplir correctement les champs obligatoires.');
      return;
    }

    item.name = name;
    item.category = category;
    item.price = price;
    item.cost = cost;
    item.prepTime = prepTime;
    item.ingredients = ingredients;
    item.description = description;
    item.image = finalImage;
    item.available = available;

    localStorage.setItem('maeled_menu', JSON.stringify(menuItems));
    hideEditMenuItemModal();
    loadMenu();
    alert('Plat modifié avec succès !');
  });

  document.getElementById('editMenuItemModal')?.addEventListener('click', function(e) {
    if (e.target === this) hideEditMenuItemModal();
  });
}

function showAddMenuItemModal() {
  document.getElementById('menuItemForm').reset();
  if (document.getElementById('itemImage')) document.getElementById('itemImage').value = '';
  document.getElementById('itemAvailable').checked = true;
  
  document.getElementById('addMenuItemModal').style.display = 'flex';
}

function hideAddMenuItemModal() {
  document.getElementById('addMenuItemModal').style.display = 'none';
  document.getElementById('menuItemForm').reset();
}

function saveMenuItem(e) {
  e.preventDefault();
  
  const menuItems = JSON.parse(localStorage.getItem('maeled_menu'));
  const newId = menuItems.length > 0 ? Math.max(...menuItems.map(m => m.id)) + 1 : 1;
  
  const newItem = {
    id: newId,
    name: document.getElementById('itemName').value,
    category: document.getElementById('itemCategory').value,
    price: parseFloat(document.getElementById('itemPrice').value),
    cost: document.getElementById('itemCost').value ? parseFloat(document.getElementById('itemCost').value) : null,
    available: document.getElementById('itemAvailable').checked,
    popularity: Math.floor(Math.random() * 30) + 60, // Random popularity 60-90%
    ingredients: document.getElementById('itemIngredients').value || '',
    description: document.getElementById('itemDescription').value || '',
    image: document.getElementById('itemImage') ? document.getElementById('itemImage').value.trim() : '',
    prepTime: document.getElementById('itemPrepTime').value ? parseInt(document.getElementById('itemPrepTime').value) : null,
    image: (document.getElementById('itemImage')?.value || "").trim()
  };
  
  menuItems.push(newItem);
  localStorage.setItem('maeled_menu', JSON.stringify(menuItems));
  
  const notifications = JSON.parse(localStorage.getItem('maeled_notifications') || '[]');
  notifications.unshift({
    id: notifications.length + 1,
    message: `Nouveau plat ajouté: "${newItem.name}"`,
    time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    read: false
  });
  localStorage.setItem('maeled_notifications', JSON.stringify(notifications));
  
  hideAddMenuItemModal();
  loadMenu();
  alert('Plat ajouté au menu avec succès !');
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