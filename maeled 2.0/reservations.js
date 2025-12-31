document.addEventListener('DOMContentLoaded', function() {
  initReservations();
  setupMobileMenu();
});

function initReservations() {
  loadReservations();
  setupEventListeners();
}

function loadReservations() {
  const reservations = JSON.parse(localStorage.getItem('maeled_reservations') || '[]');
  const searchTerm = document.getElementById('searchReservations').value.toLowerCase();
  const statusFilter = document.getElementById('statusFilter').value;
  
  let filteredData = reservations.filter(res => {
    const matchesSearch = !searchTerm || 
      res.name.toLowerCase().includes(searchTerm) ||
      res.phone.includes(searchTerm) ||
      (res.table && res.table.toLowerCase().includes(searchTerm));
    
    const matchesFilter = statusFilter === 'all' || res.status === statusFilter;
    
    return matchesSearch && matchesFilter;
  });
  
  filteredData.sort((a, b) => {
    const dateA = new Date(a.date + ' ' + a.time);
    const dateB = new Date(b.date + ' ' + b.time);
    return dateB - dateA; // Reverse for most recent first
  });
  
  renderReservationsTable(filteredData);
}

function renderReservationsTable(data) {
  const tbody = document.getElementById('reservationsTableBody');
  tbody.innerHTML = '';
  
  if (data.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 40px; color: #666;">
          Aucune réservation trouvée
        </td>
      </tr>
    `;
    updatePaginationInfo(0, 0, 0);
    return;
  }
  
  data.forEach(reservation => {
    const row = document.createElement('tr');
    
    let statusBadge = '';
    switch(reservation.status) {
      case 'confirmée':
        statusBadge = '<span class="badge badge-success">Confirmée</span>';
        break;
      case 'en attente':
        statusBadge = '<span class="badge badge-warning">En attente</span>';
        break;
      case 'annulée':
        statusBadge = '<span class="badge badge-danger">Annulée</span>';
        break;
      default:
        statusBadge = '<span class="badge badge-secondary">' + reservation.status + '</span>';
    }
    
    row.innerHTML = `
      <td>${reservation.id}</td>
      <td>
        <strong>${reservation.name}</strong><br>
        <small>${reservation.phone}</small>
      </td>
      <td>${formatDate(reservation.date)}</td>
      <td>${reservation.time}</td>
      <td>${reservation.guests} pers.</td>
      <td>${statusBadge}</td>
      <td>${reservation.table || '-'}</td>
      <td>
        <div class="table-actions">
          <button class="action-btn confirm" data-id="${reservation.id}" title="Confirmer" ${reservation.status === 'confirmée' ? 'disabled' : ''}>
            <i class="fas fa-check"></i>
          </button>
          <button class="action-btn edit" data-id="${reservation.id}" title="Modifier">
            <i class="fas fa-edit"></i>
          </button>
          <button class="action-btn delete" data-id="${reservation.id}" title="Supprimer">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    `;
    
    tbody.appendChild(row);
  });
  
  updatePaginationInfo(data.length, 1, data.length);
  
  setupTableActionButtons();
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });
}

function updatePaginationInfo(total, start, end) {
  document.getElementById('paginationInfo').textContent = 
    `Affichage de ${start} à ${end} sur ${total} réservations`;
}

function setupTableActionButtons() {
  document.querySelectorAll('.action-btn.confirm').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = parseInt(this.getAttribute('data-id'));
      confirmReservation(id);
    });
  });
  
  document.querySelectorAll('.action-btn.delete').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = parseInt(this.getAttribute('data-id'));
      deleteReservation(id);
    });
  });

  document.querySelectorAll('.action-btn.edit').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = parseInt(this.getAttribute('data-id'));
      editReservation(id);
    });
  });
}

function confirmReservation(id) {
  const reservations = JSON.parse(localStorage.getItem('maeled_reservations'));
  const reservation = reservations.find(r => r.id === id);
  
  if (reservation && confirm(`Confirmer la réservation de ${reservation.name} ?`)) {
    reservation.status = 'confirmée';
    if (!reservation.table) {
      reservation.table = 'T' + (Math.floor(Math.random() * 20) + 1);
    }
    localStorage.setItem('maeled_reservations', JSON.stringify(reservations));
    
    const notifications = JSON.parse(localStorage.getItem('maeled_notifications') || '[]');
    notifications.unshift({
      id: notifications.length + 1,
      message: `Réservation #${id} confirmée - Table ${reservation.table}`,
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      read: false
    });
    localStorage.setItem('maeled_notifications', JSON.stringify(notifications));
    
    loadReservations();
    alert('Réservation confirmée !');
  }
}

function editReservation(id) {
  const reservations = JSON.parse(localStorage.getItem('maeled_reservations') || '[]');
  const r = reservations.find(x => x.id === id);
  if (!r) return;

  document.getElementById('editReservationId').value = String(r.id);
  document.getElementById('editClientName').value = r.name || '';
  document.getElementById('editClientPhone').value = r.phone || '';
  document.getElementById('editGuestsNumber').value = r.guests || 1;
  document.getElementById('editTableNumber').value = r.table || '';
  document.getElementById('editReservationDate').value = r.date || '';
  document.getElementById('editReservationTime').value = r.time || '';
  document.getElementById('editReservationNotes').value = r.notes || '';

  showEditReservationModal();
}

function showEditReservationModal() {
  const modal = document.getElementById('editReservationModal');
  if (modal) modal.style.display = 'flex';
}

function hideEditReservationModal() {
  const modal = document.getElementById('editReservationModal');
  if (modal) modal.style.display = 'none';
}

function deleteReservation(id) {
  const reservations = JSON.parse(localStorage.getItem('maeled_reservations'));
  const reservation = reservations.find(r => r.id === id);
  
  if (reservation && confirm(`Supprimer la réservation de ${reservation.name} ?`)) {
    const newReservations = reservations.filter(r => r.id !== id);
    localStorage.setItem('maeled_reservations', JSON.stringify(newReservations));
    
    const notifications = JSON.parse(localStorage.getItem('maeled_notifications') || '[]');
    notifications.unshift({
      id: notifications.length + 1,
      message: `Réservation #${id} supprimée`,
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      read: false
    });
    localStorage.setItem('maeled_notifications', JSON.stringify(notifications));
    
    loadReservations();
    alert('Réservation supprimée !');
  }
}

function setupEventListeners() {
  document.getElementById('searchReservations').addEventListener('input', loadReservations);
  
  document.getElementById('statusFilter').addEventListener('change', loadReservations);
  
  document.getElementById('itemsPerPage').addEventListener('change', loadReservations);
  
  document.getElementById('addReservationBtn').addEventListener('click', showAddModal);
  
  document.querySelector('.close-modal').addEventListener('click', hideAddModal);
  
  document.getElementById('reservationForm').addEventListener('submit', saveReservation);
  
  document.getElementById('addReservationModal').addEventListener('click', function(e) {
    if (e.target === this) {
      hideAddModal();
    }
  });


  // Edit modal listeners
  document.querySelector('#editReservationModal .close-modal')?.addEventListener('click', hideEditReservationModal);

  document.getElementById('editReservationForm')?.addEventListener('submit', function(e) {
    e.preventDefault();

    const reservations = JSON.parse(localStorage.getItem('maeled_reservations') || '[]');
    const id = parseInt(document.getElementById('editReservationId').value, 10);
    const r = reservations.find(x => x.id === id);
    if (!r) return;

    const updated = {
      id,
      name: document.getElementById('editClientName').value.trim(),
      phone: document.getElementById('editClientPhone').value.trim() || 'Non renseigné',
      date: document.getElementById('editReservationDate').value,
      time: document.getElementById('editReservationTime').value,
      guests: parseInt(document.getElementById('editGuestsNumber').value || '1', 10),
      status: r.status || 'en attente',
      table: document.getElementById('editTableNumber').value || '',
      notes: document.getElementById('editReservationNotes').value
    };

    if (!updated.name || !updated.date || !updated.time || !Number.isFinite(updated.guests) || updated.guests < 1) {
      alert('Veuillez remplir correctement les champs obligatoires.');
      return;
    }

    const conflict = reservations.find(x =>
      x.id !== id &&
      x.table === updated.table &&
      x.date === updated.date &&
      x.time === updated.time
    );

    if (conflict) {
      alert("❌ Cette table est déjà réservée à cette date et heure.");
      return;
    }

    Object.assign(r, updated);

    localStorage.setItem('maeled_reservations', JSON.stringify(reservations));
    hideEditReservationModal();
    loadReservations();
    alert('Réservation modifiée avec succès !');
  });

  document.getElementById('editReservationModal')?.addEventListener('click', function(e) {
    if (e.target === this) hideEditReservationModal();
  });
}

function showAddModal() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  document.getElementById('reservationDate').value = tomorrow.toISOString().split('T')[0];
  
  document.getElementById('reservationTime').value = '20:00';
  
  document.getElementById('addReservationModal').style.display = 'flex';
}

function hideAddModal() {
  document.getElementById('addReservationModal').style.display = 'none';
  document.getElementById('reservationForm').reset();
}

function saveReservation(e) {
  e.preventDefault();
  
  const reservations = JSON.parse(localStorage.getItem('maeled_reservations') || '[]');
  const newId = reservations.length > 0 ? Math.max(...reservations.map(r => r.id)) + 1 : 1;
  
  const newReservation = {
    id: newId,
    name: document.getElementById('clientName').value,
    phone: document.getElementById('clientPhone').value || 'Non renseigné',
    date: document.getElementById('reservationDate').value,
    time: document.getElementById('reservationTime').value,
    guests: parseInt(document.getElementById('guestsNumber').value),
    status: 'en attente',
    table: document.getElementById('tableNumber').value || '',
    notes: document.getElementById('reservationNotes').value,
    created: new Date().toISOString()
  };

  const conflict = reservations.find(r =>
  r.table === newReservation.table &&
  r.date === newReservation.date &&
  r.time === newReservation.time
);

if (conflict) {
  alert("❌ Cette table est déjà réservée à cette date et heure.");
  return;
}

  
  reservations.push(newReservation);
  localStorage.setItem('maeled_reservations', JSON.stringify(reservations));
  
  const notifications = JSON.parse(localStorage.getItem('maeled_notifications') || '[]');
  notifications.unshift({
    id: notifications.length + 1,
    message: `Nouvelle réservation: ${newReservation.name} pour ${newReservation.guests} personnes`,
    time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    read: false
  });
  localStorage.setItem('maeled_notifications', JSON.stringify(notifications));
  
  hideAddModal();
  loadReservations();
  alert('Réservation ajoutée avec succès !');
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