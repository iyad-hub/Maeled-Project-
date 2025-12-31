document.addEventListener('DOMContentLoaded', function() {
  initDashboard();
  setupMobileMenu();
  setupNotifications();
});

function initDashboard() {
  if (typeof Chart === 'undefined') {
    loadChartJS();
  } else {
    createCharts();
  }
  
  updateKPIData();
}

function loadChartJS() {
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
  script.onload = createCharts;
  document.head.appendChild(script);
}

function createCharts() {
  const orders = JSON.parse(localStorage.getItem('maeled_orders') || '[]');
  const reservations = JSON.parse(localStorage.getItem('maeled_reservations') || '[]');
  const menu = JSON.parse(localStorage.getItem('maeled_menu') || '[]');
  const staff = JSON.parse(localStorage.getItem('maeled_staff') || '[]');
  const inventory = JSON.parse(localStorage.getItem('maeled_inventory') || '[]');
  
  createSalesByCategoryChart(orders, menu);
  createOrdersByHourChart(orders);
  createRevenueChart(orders);
  createPopularDishesChart(orders, menu);
  createOrdersStatusChart(orders);
  
  // New charts for staff and inventory
  createStaffChart(staff);
  createInventoryChart(inventory);
}

function createSalesByCategoryChart(orders, menu) {
  const ctx = document.getElementById('salesChart');
  if (!ctx) return;
  
  const categories = {
    'entrées': 0,
    'pizzas': 0,
    'pâtes': 0,
    'desserts': 0,
    'boissons': 0
  };
  
  orders.forEach(order => {
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach(item => {
        const menuItem = menu.find(m => m.id === item.id);
        if (menuItem && menuItem.category) {
          const category = menuItem.category;
          if (categories[category] !== undefined) {
            categories[category] += (item.price * item.quantity);
          }
        }
      });
    }
  });
  
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: Object.keys(categories),
      datasets: [{
        data: Object.values(categories),
        backgroundColor: [
          '#3498db', 
          '#2ecc71', 
          '#e74c3c', 
          '#f39c12', 
          '#9b59b6'  
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 20
          }
        }
      }
    }
  });
}

function createOrdersByHourChart(orders) {
  const ctx = document.getElementById('ordersHourChart');
  if (!ctx) return;
  
  const hourCounts = {};
  for (let i = 10; i <= 22; i++) {
    hourCounts[i + 'h'] = 0;
  }
  
  orders.forEach(order => {
    if (order.time) {
      const hour = parseInt(order.time.split(':')[0]);
      const hourKey = hour + 'h';
      if (hourCounts[hourKey] !== undefined) {
        hourCounts[hourKey] += 1;
      }
    }
  });
  
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(hourCounts),
      datasets: [{
        label: 'Nombre de Commandes',
        data: Object.values(hourCounts),
        backgroundColor: '#3498db',
        borderColor: '#2980b9',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      }
    }
  });
}

function createRevenueChart(orders) {
  const ctx = document.getElementById('revenueChart');
  if (!ctx) return;
  
  const dates = [];
  const revenues = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    dates.push(formatChartDate(date));
    
    const dayRevenue = orders
      .filter(o => o.date === dateStr)
      .reduce((sum, order) => sum + (order.total || 0), 0);
    
    revenues.push(dayRevenue);
  }
  
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [{
        label: 'Revenus (€)',
        data: revenues,
        backgroundColor: 'rgba(46, 204, 113, 0.2)',
        borderColor: '#2ecc71',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return value + ' €';
            }
          }
        }
      }
    }
  });
}

function createPopularDishesChart(orders, menu) {
  const ctx = document.getElementById('popularDishesChart');
  if (!ctx) return;
  
  const dishCounts = {};
  
  orders.forEach(order => {
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach(item => {
        dishCounts[item.name] = (dishCounts[item.name] || 0) + item.quantity;
      });
    }
  });
  
  const topDishes = Object.entries(dishCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  
  const dishNames = topDishes.map(d => d[0]);
  const dishQuantities = topDishes.map(d => d[1]);
  
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: dishNames,
      datasets: [{
        label: 'Quantité Vendue',
        data: dishQuantities,
        backgroundColor: '#9b59b6'
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          beginAtZero: true
        }
      }
    }
  });
}

function createOrdersStatusChart(orders) {
  const ctx = document.getElementById('ordersStatusChart');
  if (!ctx) return;
  
  const statusCounts = {
    'en attente': 0,
    'en préparation': 0,
    'servie': 0,
    'annulée': 0
  };
  
  orders.forEach(order => {
    if (order.status && statusCounts[order.status] !== undefined) {
      statusCounts[order.status] += 1;
    }
  });
  
  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: Object.keys(statusCounts),
      datasets: [{
        data: Object.values(statusCounts),
        backgroundColor: [
          '#f39c12', 
          '#3498db', 
          '#2ecc71', 
          '#e74c3c'  
        ]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}

// NEW: Staff distribution chart
function createStaffChart(staff) {
  const ctx = document.getElementById('staffChart');
  if (!ctx) return;
  
  const roles = {};
  staff.forEach(employee => {
    roles[employee.role] = (roles[employee.role] || 0) + 1;
  });
  
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: Object.keys(roles),
      datasets: [{
        data: Object.values(roles),
        backgroundColor: [
          '#3498db',
          '#2ecc71',
          '#e74c3c',
          '#f39c12',
          '#9b59b6'
        ]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}

// NEW: Inventory status chart
function createInventoryChart(inventory) {
  const ctx = document.getElementById('inventoryChart');
  if (!ctx) return;
  
  const stats = {
    'Stock normal': inventory.filter(item => item.quantity > item.minQuantity).length,
    'Faible stock': inventory.filter(item => item.quantity <= item.minQuantity && item.quantity > 0).length,
    'Rupture': inventory.filter(item => item.quantity <= 0).length
  };
  
  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: Object.keys(stats),
      datasets: [{
        data: Object.values(stats),
        backgroundColor: [
          '#2ecc71',
          '#f39c12',
          '#e74c3c'
        ]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}

function formatChartDate(date) {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  return `${day}/${month}`;
}

function setupNotifications() {
  updateNotificationBadge();
  
  document.querySelector('.notification-btn')?.addEventListener('click', showNotifications);
}

function updateNotificationBadge() {
  const notifications = JSON.parse(localStorage.getItem('maeled_notifications') || '[]');
  const unread = notifications.filter(n => !n.read).length;
  const badge = document.getElementById('notificationCount');
  if (badge) {
    badge.textContent = unread;
    badge.style.display = unread > 0 ? 'flex' : 'none';
  }
}

function showNotifications() {
  const notifications = JSON.parse(localStorage.getItem('maeled_notifications') || '[]');
  
  let message = "NOTIFICATIONS\n\n";
  if (notifications.length === 0) {
    message = "Aucune notification";
  } else {
    notifications.slice(0, 10).forEach(n => {
      message += `• ${n.message} (${n.time})\n`;
    });
  }
  
  notifications.forEach(n => n.read = true);
  localStorage.setItem('maeled_notifications', JSON.stringify(notifications));
  updateNotificationBadge();
  
  alert(message);
}

function updateKPIData() {
  const orders = JSON.parse(localStorage.getItem('maeled_orders') || '[]');
  const reservations = JSON.parse(localStorage.getItem('maeled_reservations') || '[]');
  const staff = JSON.parse(localStorage.getItem('maeled_staff') || '[]');
  const inventory = JSON.parse(localStorage.getItem('maeled_inventory') || '[]');
  
  // Total Clients
  const uniqueClients = new Set();
  reservations.forEach(r => {
    if (r.phone) uniqueClients.add(r.phone);
  });
  const totalUsersEl = document.getElementById('totalUsers');
  if (totalUsersEl) totalUsersEl.textContent = uniqueClients.size;
  
  // Total Orders
  const totalOrdersEl = document.getElementById('totalOrders');
  if (totalOrdersEl) totalOrdersEl.textContent = orders.length;
  
  // Total Revenue
  const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
  const totalRevenueEl = document.getElementById('totalRevenue');
  if (totalRevenueEl) totalRevenueEl.textContent = totalRevenue.toFixed(0) + ' €';
  
  // Pending Orders
  const pendingOrders = orders.filter(o => o.status === 'en attente').length;
  const pendingOrdersEl = document.getElementById('pendingOrders');
  if (pendingOrdersEl) pendingOrdersEl.textContent = pendingOrders;
  
  // NEW: Staff Statistics
  const activeStaff = staff.filter(s => s.status === 'actif').length;
  const activeStaffEl = document.getElementById('activeStaff');
  if (activeStaffEl) activeStaffEl.textContent = activeStaff;
  
  // NEW: Inventory Statistics
  const lowStockItems = inventory.filter(item => item.quantity <= item.minQuantity && item.quantity > 0).length;
  const lowStockEl = document.getElementById('lowStockItems');
  if (lowStockEl) lowStockEl.textContent = lowStockItems;
  
  console.log('Dashboard KPIs updated:', {
    clients: uniqueClients.size,
    orders: orders.length,
    revenue: totalRevenue,
    pendingOrders: pendingOrders,
    activeStaff: activeStaff,
    lowStockItems: lowStockItems
  });
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