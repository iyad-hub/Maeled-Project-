function createTestOrders() {
  console.log('Creating test orders...');
  
  const testOrders = [
    {
      id: 1001,
      table: 'T12',
      items: [
        { id: 1, name: 'Salade César', price: 8.50, quantity: 1 },
        { id: 6, name: 'Pizza 4 Fromages', price: 12.00, quantity: 1 },
        { id: 33, name: 'Tiramisu', price: 7.00, quantity: 1 }
      ],
      subtotal: 27.50,
      total: 29.50,
      status: 'servie',
      time: '19:45',
      date: new Date().toISOString().split('T')[0],
      guests: 2,
      notes: 'Table près de la fenêtre',
      waiter: 'Jean'
    },
    {
      id: 1002,
      table: 'T05',
      items: [
        { id: 3, name: 'Carbonara', price: 12.00, quantity: 1 },
        { id: 10, name: 'Eau minérale', price: 3.00, quantity: 2 }
      ],
      subtotal: 18.00,
      total: 20.00,
      status: 'en préparation',
      time: '20:15',
      date: new Date().toISOString().split('T')[0],
      guests: 1,
      notes: 'Sans fromage',
      waiter: 'Marie'
    },
    {
      id: 1003,
      table: 'T08',
      items: [
        { id: 5, name: 'Burrata', price: 6.00, quantity: 1 },
        { id: 6, name: 'Pizza Pepperoni', price: 12.00, quantity: 2 }
      ],
      subtotal: 30.00,
      total: 32.00,
      status: 'en attente',
      time: '21:30',
      date: new Date().toISOString().split('T')[0],
      guests: 4,
      notes: '',
      waiter: 'Pierre'
    }
  ];
  
  localStorage.setItem('maeled_orders', JSON.stringify(testOrders));
  console.log('Test orders created:', testOrders);
  alert('✅ 3 commandes de test créées!\n\nOuvrez le panneau Admin → Commandes pour les voir.');
}

document.addEventListener('DOMContentLoaded', function() {
  if (window.location.pathname.includes('index.html') || 
      window.location.pathname === '/' || 
      window.location.href.includes('index.html')) {
    
    const testBtn = document.createElement('button');
    testBtn.textContent = 'TEST: Créer Commandes';
    testBtn.style.position = 'fixed';
    testBtn.style.bottom = '20px';
    testBtn.style.right = '20px';
    testBtn.style.zIndex = '9999';
    testBtn.style.padding = '10px 15px';
    testBtn.style.background = '#e74c3c';
    testBtn.style.color = 'white';
    testBtn.style.border = 'none';
    testBtn.style.borderRadius = '5px';
    testBtn.style.cursor = 'pointer';
    testBtn.style.fontWeight = 'bold';
    testBtn.onclick = createTestOrders;
    
    document.body.appendChild(testBtn);
  }
});