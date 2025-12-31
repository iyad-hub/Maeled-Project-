document.addEventListener('DOMContentLoaded', function() {
  console.log('Staff page loading...');
  
  initStaff();
  setupMobileMenu();
});

function initStaff() {
  console.log('Initializing staff...');
  
  loadStaff();
  setupStaffEventListeners();
}

function loadStaff() {
  console.log('Loading staff from localStorage...');
  
  const staff = JSON.parse(localStorage.getItem('maeled_staff') || '[]');
  console.log('Found staff:', staff);
  
  const searchTerm = document.getElementById('searchStaff')?.value.toLowerCase() || '';
  const roleFilter = document.getElementById('roleFilter')?.value || 'all';
  const statusFilter = document.getElementById('statusFilter')?.value || 'all';
  
  let filteredData = staff.filter(employee => {
    const matchesSearch = !searchTerm || 
      (employee.name && employee.name.toLowerCase().includes(searchTerm)) ||
      (employee.email && employee.email.toLowerCase().includes(searchTerm)) ||
      (employee.phone && employee.phone.includes(searchTerm));
    
    const matchesRole = roleFilter === 'all' || employee.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || employee.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });
  
  filteredData.sort((a, b) => {
    if (a.status === 'actif' && b.status !== 'actif') return -1;
    if (a.status !== 'actif' && b.status === 'actif') return 1;
    return a.name.localeCompare(b.name);
  });
  
  renderStaffTable(filteredData);
  updateStaffStats(staff);
}

function updateStaffStats(staff) {
  console.log('Updating staff stats...');
  
  const today = new Date().getDay();
  const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const todayName = days[today];
  
  const stats = {
    total: staff.length,
    onDuty: staff.filter(s => s.status === 'actif' && s.shiftDays && s.shiftDays.includes(todayName)).length,
    todayShifts: staff.filter(s => s.shiftDays && s.shiftDays.includes(todayName)).length,
    absent: staff.filter(s => s.status === 'inactif' || s.status === 'congé').length
  };
  
  console.log('Staff stats:', stats);
  
  const totalEl = document.getElementById('totalStaff');
  const onDutyEl = document.getElementById('staffOnDuty');
  const todayShiftsEl = document.getElementById('todayShifts');
  const absentEl = document.getElementById('absentStaff');
  
  if (totalEl) totalEl.textContent = stats.total;
  if (onDutyEl) onDutyEl.textContent = stats.onDuty;
  if (todayShiftsEl) todayShiftsEl.textContent = stats.todayShifts;
  if (absentEl) absentEl.textContent = stats.absent;
}

function renderStaffTable(data) {
  console.log('Rendering staff table with', data.length, 'employees');
  
  const tbody = document.getElementById('staffTableBody');
  if (!tbody) {
    console.error('Staff table body not found!');
    return;
  }
  
  tbody.innerHTML = '';
  
  if (data.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 40px; color: #666;">
          Aucun employé trouvé
        </td>
      </tr>
    `;
    updateStaffPaginationInfo(0, 0, 0);
    return;
  }
  
  data.forEach(employee => {
    const row = document.createElement('tr');
    
    let statusBadge = '';
    switch(employee.status) {
      case 'actif':
        statusBadge = '<span class="badge badge-success">Actif</span>';
        break;
      case 'inactif':
        statusBadge = '<span class="badge badge-danger">Inactif</span>';
        break;
      case 'congé':
        statusBadge = '<span class="badge badge-warning">En congé</span>';
        break;
      default:
        statusBadge = '<span class="badge badge-secondary">' + (employee.status || 'Inconnu') + '</span>';
    }
    
    let shiftText = employee.shiftDays ? 
      employee.shiftDays.join(', ') : 
      'Non défini';
    
    if (shiftText.length > 20) {
      shiftText = shiftText.substring(0, 20) + '...';
    }
    
    row.innerHTML = `
      <td><strong>#${employee.id || 'N/A'}</strong></td>
      <td>
        <div style="font-weight: bold; color: #2c3e50;">${employee.name || 'N/A'}</div>
        <small style="color: #666;">${employee.role || 'Non spécifié'}</small>
      </td>
      <td><span class="category-badge">${employee.role || 'N/A'}</span></td>
      <td>${employee.email || 'N/A'}</td>
      <td>${employee.phone || 'N/A'}</td>
      <td>${statusBadge}</td>
      <td>
        <div style="font-size: 12px;">${shiftText}</div>
        <small style="color: #666;">${employee.shiftTime || ''}</small>
      </td>
      <td>
        <div class="table-actions">
          <button class="action-btn edit" data-id="${employee.id}" title="Modifier">
            <i class="fas fa-edit"></i>
          </button>
          <button class="action-btn delete" data-id="${employee.id}" title="Supprimer">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    `;
    
    tbody.appendChild(row);
  });
  
  updateStaffPaginationInfo(data.length, 1, data.length);
  setupStaffActionButtons();
}

function updateStaffPaginationInfo(total, start, end) {
  const paginationInfo = document.getElementById('paginationInfo');
  if (paginationInfo) {
    paginationInfo.textContent = `Affichage de ${start} à ${end} sur ${total} employés`;
  }
}

function setupStaffActionButtons() {
  console.log('Setting up staff action buttons...');
  
  document.querySelectorAll('.action-btn.edit').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = parseInt(this.getAttribute('data-id'));
      console.log('Edit employee:', id);
      editEmployee(id);
    });
  });
  
  document.querySelectorAll('.action-btn.delete').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = parseInt(this.getAttribute('data-id'));
      console.log('Delete employee:', id);
      deleteEmployee(id);
    });
  });
}

function editEmployee(id) {
  const staff = JSON.parse(localStorage.getItem('maeled_staff') || '[]');
  const employee = staff.find(e => e.id === id);
  if (!employee) return;

  document.getElementById('editStaffId').value = String(employee.id);
  document.getElementById('editStaffName').value = employee.name || '';
  document.getElementById('editStaffRole').value = employee.role || '';
  document.getElementById('editStaffPhone').value = employee.phone || '';
  document.getElementById('editStaffEmail').value = employee.email || '';
  document.getElementById('editStaffAddress').value = employee.address || '';
  document.getElementById('editStaffHireDate').value = employee.hireDate || '';
  document.getElementById('editStaffSalary').value = Number.isFinite(employee.salary) ? employee.salary : 0;
  document.getElementById('editStaffHours').value = Number.isFinite(employee.hours) ? employee.hours : 0;
  document.getElementById('editStaffStatus').value = employee.status || 'actif';

  showEditStaffModal();
}

function showEditStaffModal() {
  const modal = document.getElementById('editStaffModal');
  if (modal) modal.style.display = 'flex';
}

function hideEditStaffModal() {
  const modal = document.getElementById('editStaffModal');
  if (modal) modal.style.display = 'none';
}

function deleteEmployee(id) {
  const staff = JSON.parse(localStorage.getItem('maeled_staff') || '[]');
  const employee = staff.find(e => e.id === id);
  
  if (!employee) {
    alert('Employé non trouvé!');
    return;
  }
  
  if (!confirm(`Supprimer l'employé "${employee.name}" ?`)) {
    return;
  }
  
  const newStaff = staff.filter(e => e.id !== id);
  localStorage.setItem('maeled_staff', JSON.stringify(newStaff));
  
  const notifications = JSON.parse(localStorage.getItem('maeled_notifications') || '[]');
  notifications.unshift({
    id: notifications.length + 1,
    message: `Employé supprimé: ${employee.name}`,
    time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    read: false
  });
    localStorage.setItem('maeled_notifications', JSON.stringify(notifications));
  
  loadStaff();
  alert('Employé supprimé !');
}

function setupStaffEventListeners() {
  console.log('Setting up staff event listeners...');
  
  const searchInput = document.getElementById('searchStaff');
  if (searchInput) {
    searchInput.addEventListener('input', loadStaff);
  }
  
  const roleFilter = document.getElementById('roleFilter');
  if (roleFilter) {
    roleFilter.addEventListener('change', loadStaff);
  }
  
  const statusFilter = document.getElementById('statusFilter');
  if (statusFilter) {
    statusFilter.addEventListener('change', loadStaff);
  }
  
  const addStaffBtn = document.getElementById('addStaffBtn');
  if (addStaffBtn) {
    addStaffBtn.addEventListener('click', showAddStaffModal);
  }
  
  const scheduleBtn = document.getElementById('scheduleBtn');
  if (scheduleBtn) {
    scheduleBtn.addEventListener('click', showScheduleModal);
  }
  
  document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', function() {
      const modal = this.closest('.modal');
      if (modal) {
        modal.style.display = 'none';
      }
    });
  });
  
  const addStaffModal = document.getElementById('addStaffModal');
  if (addStaffModal) {
    addStaffModal.addEventListener('click', function(e) {
      if (e.target === this) {
        this.style.display = 'none';
      }
    });
  }
  
  const staffForm = document.getElementById('staffForm');
  if (staffForm) {
    staffForm.addEventListener('submit', saveEmployee);
  }


  // Edit modal listeners
  document.querySelector('#editStaffModal .close-modal')?.addEventListener('click', hideEditStaffModal);

  document.getElementById('editStaffForm')?.addEventListener('submit', function(e) {
    e.preventDefault();

    const staff = JSON.parse(localStorage.getItem('maeled_staff') || '[]');
    const id = parseInt(document.getElementById('editStaffId').value, 10);
    const employee = staff.find(x => x.id === id);
    if (!employee) return;

    const updated = {
      id,
      name: document.getElementById('editStaffName').value.trim(),
      role: document.getElementById('editStaffRole').value.trim(),
      phone: document.getElementById('editStaffPhone').value.trim(),
      email: document.getElementById('editStaffEmail').value.trim(),
      address: document.getElementById('editStaffAddress').value.trim(),
      hireDate: document.getElementById('editStaffHireDate').value,
      salary: parseFloat(document.getElementById('editStaffSalary').value || '0'),
      hours: parseFloat(document.getElementById('editStaffHours').value || '0'),
      status: document.getElementById('editStaffStatus').value || 'actif'
    };

    if (!updated.name || !updated.role) {
      alert('Veuillez remplir correctement les champs obligatoires.');
      return;
    }

    Object.assign(employee, updated);
    localStorage.setItem('maeled_staff', JSON.stringify(staff));

    hideEditStaffModal();
    loadStaff();
    alert('Personnel modifié avec succès !');
  });

  document.getElementById('editStaffModal')?.addEventListener('click', function(e) {
    if (e.target === this) hideEditStaffModal();
  });
}

function showAddStaffModal() {
  const form = document.getElementById('staffForm');
  form.reset();
  
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  document.getElementById('staffHireDate').value = tomorrow.toISOString().split('T')[0];
  
  document.getElementById('addStaffModal').style.display = 'flex';
}

function showScheduleModal() {
  const staff = JSON.parse(localStorage.getItem('maeled_staff') || '[]');
  
  let scheduleHTML = '<h3>Planning du Personnel</h3><table style="width:100%; border-collapse:collapse; margin-top:20px;">';
  scheduleHTML += '<tr><th>Employé</th><th>Rôle</th><th>Lundi</th><th>Mardi</th><th>Mercredi</th><th>Jeudi</th><th>Vendredi</th><th>Samedi</th><th>Dimanche</th></tr>';
  
  staff.forEach(employee => {
    scheduleHTML += `<tr>
      <td>${employee.name}</td>
      <td>${employee.role}</td>`;
    
    const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    days.forEach(day => {
      const hasShift = employee.shiftDays && employee.shiftDays.includes(day);
      scheduleHTML += `<td style="text-align:center; padding:5px; border:1px solid #ddd;">
        ${hasShift ? '✓' : ''}
      </td>`;
    });
    
    scheduleHTML += '</tr>';
  });
  
  scheduleHTML += '</table>';
  
  alert(scheduleHTML);
}

function saveEmployee(e) {
  e.preventDefault();
  console.log('Saving new employee...');
  
  const staff = JSON.parse(localStorage.getItem('maeled_staff') || '[]');
  const newId = staff.length > 0 ? Math.max(...staff.map(e => e.id || 0)) + 1 : 1;
  
  const newEmployee = {
    id: newId,
    name: document.getElementById('staffName').value,
    role: document.getElementById('staffRole').value,
    email: document.getElementById('staffEmail').value,
    phone: document.getElementById('staffPhone').value,
    salary: parseFloat(document.getElementById('staffSalary').value) || 12.50,
    hireDate: document.getElementById('staffHireDate').value || new Date().toISOString().split('T')[0],
    address: document.getElementById('staffAddress').value || '',
    hoursPerWeek: parseInt(document.getElementById('staffHours').value) || 35,
    status: document.getElementById('staffStatus').value || 'actif',
    shiftDays: getDefaultShiftDays(document.getElementById('staffRole').value),
    shiftTime: '09:00-17:00',
    created: new Date().toISOString()
  };
  
  staff.push(newEmployee);
  localStorage.setItem('maeled_staff', JSON.stringify(staff));
  
  const notifications = JSON.parse(localStorage.getItem('maeled_notifications') || '[]');
  notifications.unshift({
    id: notifications.length + 1,
    message: `Nouvel employé ajouté: ${newEmployee.name} (${newEmployee.role})`,
    time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    read: false
  });
  localStorage.setItem('maeled_notifications', JSON.stringify(notifications));
  
  document.getElementById('addStaffModal').style.display = 'none';
  form.reset();
  loadStaff();
  
  alert(`✅ Employé ajouté avec succès !\n\nNom: ${newEmployee.name}\nRôle: ${newEmployee.role}\nSalaire: ${newEmployee.salary}€/h\nStatut: ${newEmployee.status}`);
}

function getDefaultShiftDays(role) {
  switch(role) {
    case 'serveur':
    case 'barman':
    case 'réceptionniste':
      return ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    case 'cuisinier':
    case 'gestionnaire':
      return ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
    case 'gérant':
      return ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    default:
      return ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
  }
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