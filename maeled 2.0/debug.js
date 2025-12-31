function debugReservation() {
  console.log('=== DEBUG RESERVATION SYSTEM ===');
  
  console.log('1. localStorage available:', typeof localStorage !== 'undefined');
  
  const reservations = JSON.parse(localStorage.getItem('maeled_reservations') || '[]');
  console.log('2. Current reservations:', reservations);
  console.log('   Count:', reservations.length);
  
  const testReservation = {
    id: 999,
    name: 'Test Client',
    phone: '0600000000',
    date: '2024-12-25',
    time: '20:00',
    guests: 2,
    status: 'en attente',
    table: '',
    notes: 'Test reservation'
  };
  
  reservations.push(testReservation);
  localStorage.setItem('maeled_reservations', JSON.stringify(reservations));
  console.log('3. Test reservation added');
  
  const updatedReservations = JSON.parse(localStorage.getItem('maeled_reservations') || '[]');
  console.log('4. Updated reservations:', updatedReservations);
  console.log('   New count:', updatedReservations.length);
  
  alert('Debug complete! Check console (F12) for details.');
}

document.addEventListener('DOMContentLoaded', function() {
  const debugBtn = document.createElement('button');
  debugBtn.textContent = 'Debug Reservation';
  debugBtn.style.position = 'fixed';
  debugBtn.style.top = '10px';
  debugBtn.style.right = '10px';
  debugBtn.style.zIndex = '9999';
  debugBtn.style.padding = '10px';
  debugBtn.style.background = 'red';
  debugBtn.style.color = 'white';
  debugBtn.style.border = 'none';
  debugBtn.style.cursor = 'pointer';
  debugBtn.onclick = debugReservation;
  
  document.body.appendChild(debugBtn);
});