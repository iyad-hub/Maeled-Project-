document.addEventListener('DOMContentLoaded', function() {
  console.log('Initializing MAELED data...');
  
  // Check if we need to initialize
  const needsInitialization = 
    !localStorage.getItem('maeled_menu') || 
    JSON.parse(localStorage.getItem('maeled_menu')).length === 0 ||
    !localStorage.getItem('maeled_staff') ||
    !localStorage.getItem('maeled_inventory');

  if (!needsInitialization) {
    console.log('✅ Data already initialized');
    return;
  }

  console.log('🔄 Initializing fresh data...');

  // 1. MENU DATA
  const sampleMenu = [
    { id: 1, name: 'Salade César', category: 'entrées', image: 'pics/salade-cesar.jpg', price: 8.50, cost: 3.20, available: true, popularity: 85, ingredients: 'Laitue, poulet, croutons, parmesan', description: 'Salade fraîche avec poulet grillé', prepTime: 10 },
    { id: 2, name: 'Soupe du jour', category: 'entrées', image: 'pics/soupe-du-jour.jpg', price: 6.00, cost: 2.50, available: true, popularity: 70, ingredients: 'Légumes de saison, crème', description: 'Soupe maison du jour', prepTime: 5 },
    { id: 3, name: 'Salade Grecque', category: 'entrées', image: 'pics/salade-grecque.jpg', price: 6.00, cost: 2.80, available: true, popularity: 75, ingredients: 'Tomates, concombre, feta, olives', description: 'Salade traditionnelle grecque', prepTime: 8 },
    { id: 4, name: 'Burrata', category: 'entrées', image: 'pics/burrata.jpg', price: 6.00, cost: 3.00, available: true, popularity: 80, ingredients: 'Burrata, tomates cerise, basilic', description: 'Burrata fraîche avec tomates', prepTime: 5 },
    { id: 5, name: 'Salade Sicilienne', category: 'entrées', image: 'pics/salade-sicilienne.jpg', price: 6.00, cost: 2.60, available: true, popularity: 72, ingredients: 'Oranges, olives, oignons rouges', description: 'Salade fraîche sicilienne', prepTime: 8 },
    { id: 6, name: 'Pizza 4 Fromages', category: 'pizzas', image: 'pics/pizza-4-fromages.jpg', price: 12.00, cost: 4.50, available: true, popularity: 92, ingredients: 'Mozzarella, gorgonzola, parmesan, ricotta', description: 'Pizza traditionnelle aux 4 fromages', prepTime: 20 },
    { id: 7, name: 'Pizza Black Pen', category: 'pizzas', image: 'pics/pizza-black-pan.jpg', price: 12.00, cost: 4.20, available: true, popularity: 78, ingredients: 'Mozzarella, tomates, olives noires', description: 'Pizza aux olives noires', prepTime: 20 },
    { id: 8, name: 'Pizza Burratina', category: 'pizzas', image: 'pics/pizza-burratina.jpg', price: 12.00, cost: 4.80, available: true, popularity: 85, ingredients: 'Burrata, jambon cru, roquette', description: 'Pizza à la burrata', prepTime: 20 },
    { id: 9, name: 'Pizza Calzone', category: 'pizzas', image: 'pics/pizza-calzone.jpg', price: 12.00, cost: 4.30, available: true, popularity: 88, ingredients: 'Jambon, fromage, champignons', description: 'Pizza pliée farcie', prepTime: 25 },
    { id: 10, name: 'Pizza Caprese Origan', category: 'pizzas', image: 'pics/pizza-caprese-origan.jpg', price: 12.00, cost: 4.00, available: true, popularity: 76, ingredients: 'Mozzarella, tomates, basilic', description: 'Pizza tomate-mozzarella', prepTime: 20 },
    { id: 11, name: 'Pizza Don Donato', category: 'pizzas', image: 'pics/pizza-don-donato.jpg', price: 12.00, cost: 4.50, available: true, popularity: 82, ingredients: 'Chorizo, poivrons, oignons', description: 'Pizza épicée au chorizo', prepTime: 20 },
    { id: 12, name: 'Pizza Frutti di Mare', category: 'pizzas', image: 'pics/pizza-frutti-di-mare.jpg', price: 12.00, cost: 4.80, available: true, popularity: 79, ingredients: 'Fruits de mer, ail, persil', description: 'Pizza aux fruits de mer', prepTime: 22 },
    { id: 13, name: 'Pizza Mexicaine', category: 'pizzas', image: 'pics/pizza-mex.jpg', price: 12.00, cost: 4.20, available: true, popularity: 75, ingredients: 'Bœuf haché, poivrons, maïs', description: 'Pizza mexicaine épicée', prepTime: 20 },
    { id: 14, name: 'Pizza Napoletana', category: 'pizzas', image: 'pics/pizza-napoletana.jpg', price: 12.00, cost: 4.00, available: true, popularity: 81, ingredients: 'Anchois, câpres, olives', description: 'Pizza napolitaine traditionnelle', prepTime: 20 },
    { id: 15, name: 'Pizza Panuozzo', category: 'pizzas', image: 'pics/pizza-panuozzo.jpg', price: 12.00, cost: 4.30, available: true, popularity: 77, ingredients: 'Jambon, mozzarella, tomates', description: 'Sandwich pizza', prepTime: 15 },
    { id: 16, name: 'Pizza Parma', category: 'pizzas', image: 'pics/pizza-parma.jpg', price: 12.00, cost: 4.50, available: true, popularity: 83, ingredients: 'Jambon de Parme, roquette', description: 'Pizza au jambon de Parme', prepTime: 20 },
    { id: 17, name: 'Pizza Pepperoni', category: 'pizzas', image: 'pics/pizza-pepperoni.jpg', price: 12.00, cost: 4.20, available: true, popularity: 90, ingredients: 'Pepperoni, fromage', description: 'Pizza au pepperoni', prepTime: 20 },
    { id: 18, name: 'Pizza Tartufo', category: 'pizzas', image: 'pics/pizza-tartufo.jpg', price: 12.00, cost: 4.80, available: true, popularity: 84, ingredients: 'Truffes, fromage, crème', description: 'Pizza aux truffes', prepTime: 22 },
    { id: 19, name: 'Pizza Végétarienne', category: 'pizzas', image: 'pics/pizza-vegetarienne.jpg', price: 12.00, cost: 3.80, available: true, popularity: 76, ingredients: 'Légumes grillés, fromage', description: 'Pizza végétarienne', prepTime: 20 },
    { id: 20, name: 'Pâtes al Pomodoro', category: 'pâtes', image: 'pics/pates-pomodoro.jpg', price: 12.00, cost: 3.80, available: true, popularity: 82, ingredients: 'Pâtes, sauce tomate, basilic', description: 'Spaghetti à la sauce tomate', prepTime: 15 },
    { id: 21, name: 'Pâtes Aglio Olio', category: 'pâtes', image: 'pics/pates-aglio-olio.jpg', price: 12.00, cost: 3.50, available: true, popularity: 78, ingredients: 'Pâtes, ail, huile d\'olive, piment', description: 'Spaghetti ail et huile d\'olive', prepTime: 12 },
    { id: 22, name: 'Pâtes Carbonara', category: 'pâtes', image: 'pics/pates-carbonara.jpg', price: 12.00, cost: 4.00, available: true, popularity: 85, ingredients: 'Pâtes, lardons, œuf, parmesan', description: 'Spaghetti à la carbonara', prepTime: 15 },
    { id: 23, name: 'Pâtes aux Gambas', category: 'pâtes', image: 'pics/pates-gambas.jpg', price: 12.00, cost: 4.50, available: true, popularity: 80, ingredients: 'Pâtes, gambas, ail, persil', description: 'Spaghetti aux gambas', prepTime: 18 },
    { id: 24, name: 'Linguine de Mare', category: 'pâtes', image: 'pics/pates-fruits-de-mer.jpg', price: 12.00, cost: 4.80, available: true, popularity: 79, ingredients: 'Linguine, fruits de mer, sauce tomate', description: 'Linguine aux fruits de mer', prepTime: 20 },
    { id: 25, name: 'Linguine Cacio e Pepe', category: 'pâtes', image: 'pics/pates-cacio-e-pepe.jpg', price: 12.00, cost: 3.70, available: true, popularity: 77, ingredients: 'Linguine, fromage, poivre', description: 'Linguine fromage et poivre', prepTime: 12 },
    { id: 26, name: 'Rigatoni aux Fromages', category: 'pâtes', image: 'pics/pates-fromages.jpg', price: 12.00, cost: 4.20, available: true, popularity: 81, ingredients: 'Rigatoni, 3 fromages, crème', description: 'Rigatoni aux 3 fromages', prepTime: 15 },
    { id: 27, name: 'Tarte aux Pommes', category: 'desserts', image: 'pics/dessert-tarte-pommes.jpg', price: 7.00, cost: 2.20, available: true, popularity: 79, ingredients: 'Pommes, pâte feuilletée, cannelle', description: 'Tarte aux pommes traditionnelle', prepTime: 0 },
    { id: 28, name: 'Brownie au Chocolat', category: 'desserts', image: 'pics/dessert-brownie.jpg', price: 7.00, cost: 2.50, available: true, popularity: 85, ingredients: 'Chocolat noir, noix, beurre', description: 'Brownie fondant au chocolat', prepTime: 0 },
    { id: 29, name: 'Cannoli Sicilien', category: 'desserts', image: 'pics/dessert-cannoli.jpg', price: 7.00, cost: 2.80, available: true, popularity: 82, ingredients: 'Ricotta, pâte croustillante, pistaches', description: 'Cannoli sicilien traditionnel', prepTime: 0 },
    { id: 30, name: 'Panna Cotta', category: 'desserts', image: 'pics/dessert-panna-cotta.jpg', price: 7.00, cost: 2.30, available: true, popularity: 80, ingredients: 'Crème, vanille, coulis fruits rouges', description: 'Panna cotta à la vanille', prepTime: 0 },
    { id: 31, name: 'Profiteroles', category: 'desserts', image: 'pics/dessert-profiteroles.jpg', price: 7.00, cost: 2.60, available: true, popularity: 83, ingredients: 'Choux, crème, chocolat', description: 'Profiteroles au chocolat', prepTime: 0 },
    { id: 32, name: 'Tarte aux Noix', category: 'desserts', image: 'pics/dessert-tarte-noix.jpg', price: 7.00, cost: 2.70, available: true, popularity: 78, ingredients: 'Noix, miel, pâte sablée', description: 'Tarte aux noix et miel', prepTime: 0 },
    { id: 33, name: 'Tiramisu', category: 'desserts', image: 'pics/dessert-tiramisu.jpg', price: 7.00, cost: 2.50, available: true, popularity: 95, ingredients: 'Mascarpone, café, cacao, biscuits', description: 'Tiramisu italien traditionnel', prepTime: 0 }
  ];
  
  localStorage.setItem('maeled_menu', JSON.stringify(sampleMenu));
  console.log('✅ Menu initialized with', sampleMenu.length, 'items');

  // 2. STAFF DATA
  const sampleStaff = [
    {
      id: 1,
      name: 'Jean Dupont',
      role: 'gérant',
      email: 'jean.dupont@maeled.com',
      phone: '0601010101',
      salary: 18.50,
      hireDate: '2024-01-15',
      address: '123 Rue de Paris, Berrechid',
      hoursPerWeek: 40,
      status: 'actif',
      shiftDays: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'],
      shiftTime: '09:00-18:00',
      created: '2024-01-15T09:00:00Z'
    },
    {
      id: 2,
      name: 'Marie Martin',
      role: 'serveur',
      email: 'marie.martin@maeled.com',
      phone: '0602020202',
      salary: 12.50,
      hireDate: '2024-02-20',
      address: '456 Avenue des Fleurs, Berrechid',
      hoursPerWeek: 35,
      status: 'actif',
      shiftDays: ['Lundi', 'Mardi', 'Mercredi', 'Vendredi', 'Samedi'],
      shiftTime: '11:00-20:00',
      created: '2024-02-20T09:00:00Z'
    },
    {
      id: 3,
      name: 'Paul Bernard',
      role: 'cuisinier',
      email: 'paul.bernard@maeled.com',
      phone: '0603030303',
      salary: 15.00,
      hireDate: '2024-03-10',
      address: '789 Boulevard du Commerce, Berrechid',
      hoursPerWeek: 38,
      status: 'actif',
      shiftDays: ['Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
      shiftTime: '10:00-19:00',
      created: '2024-03-10T09:00:00Z'
    },
    {
      id: 4,
      name: 'Sophie Petit',
      role: 'serveur',
      email: 'sophie.petit@maeled.com',
      phone: '0604040404',
      salary: 12.00,
      hireDate: '2024-04-05',
      address: '321 Rue du Marché, Berrechid',
      hoursPerWeek: 30,
      status: 'actif',
      shiftDays: ['Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'],
      shiftTime: '12:00-21:00',
      created: '2024-04-05T09:00:00Z'
    },
    {
      id: 5,
      name: 'Luc Moreau',
      role: 'barman',
      email: 'luc.moreau@maeled.com',
      phone: '0605050505',
      salary: 13.50,
      hireDate: '2024-05-12',
      address: '654 Rue des Vignes, Berrechid',
      hoursPerWeek: 32,
      status: 'actif',
      shiftDays: ['Jeudi', 'Vendredi', 'Samedi', 'Dimanche'],
      shiftTime: '18:00-02:00',
      created: '2024-05-12T09:00:00Z'
    }
  ];
  
  localStorage.setItem('maeled_staff', JSON.stringify(sampleStaff));
  console.log('✅ Staff initialized with', sampleStaff.length, 'employees');

  // 3. INVENTORY DATA
  const sampleInventory = [
    {
      id: 1,
      name: 'Tomates fraîches',
      category: 'légumes',
      quantity: 15.5,
      unit: 'kg',
      minQuantity: 5,
      unitCost: 2.50,
      supplier: 'Fournisseur Légumes SA',
      expiryDate: '2025-01-20',
      location: 'frigo1',
      notes: 'Tomates bio',
      lastUpdated: new Date().toISOString(),
      created: new Date().toISOString()
    },
    {
      id: 2,
      name: 'Bœuf haché',
      category: 'viande',
      quantity: 8.2,
      unit: 'kg',
      minQuantity: 3,
      unitCost: 12.00,
      supplier: 'Boucherie Deluxe',
      expiryDate: '2025-12-25',
      location: 'frigo2',
      notes: 'Viande premium',
      lastUpdated: new Date().toISOString(),
      created: new Date().toISOString()
    },
    {
      id: 3,
      name: 'Mozzarella',
      category: 'produits laitiers',
      quantity: 4.5,
      unit: 'kg',
      minQuantity: 2,
      unitCost: 8.50,
      supplier: 'Fromagerie Italiana',
      expiryDate: '2025-12-30',
      location: 'frigo1',
      notes: 'Pour pizzas',
      lastUpdated: new Date().toISOString(),
      created: new Date().toISOString()
    },
    {
      id: 4,
      name: 'Farine',
      category: 'pains',
      quantity: 25,
      unit: 'kg',
      minQuantity: 10,
      unitCost: 1.20,
      supplier: 'Minoterie du Sud',
      expiryDate: '2026-06-30',
      location: 'réserve sèche',
      notes: 'Farine type 55',
      lastUpdated: new Date().toISOString(),
      created: new Date().toISOString()
    },
    {
      id: 5,
      name: 'Huile d\'olive',
      category: 'condiments',
      quantity: 3,
      unit: 'L',
      minQuantity: 1,
      unitCost: 15.00,
      supplier: 'Producteur Olives',
      expiryDate: '2026-03-15',
      location: 'stock cuisine',
      notes: 'Extra vierge',
      lastUpdated: new Date().toISOString(),
      created: new Date().toISOString()
    },
    {
      id: 6,
      name: 'Eau minérale',
      category: 'boissons',
      quantity: 12,
      unit: 'carton',
      minQuantity: 5,
      unitCost: 8.00,
      supplier: 'Eaux de Source',
      expiryDate: '2026-12-31',
      location: 'cellier',
      notes: 'Carton de 12 bouteilles',
      lastUpdated: new Date().toISOString(),
      created: new Date().toISOString()
    },
    {
      id: 7,
      name: 'Basilic frais',
      category: 'épices',
      quantity: 0.2,
      unit: 'kg',
      minQuantity: 0.5,
      unitCost: 25.00,
      supplier: 'Herbes Fraîches SARL',
      expiryDate: '2025-12-22',
      location: 'frigo1',
      notes: 'FAIBLE STOCK',
      lastUpdated: new Date().toISOString(),
      created: new Date().toISOString()
    },
    {
      id: 8,
      name: 'Assiettes jetables',
      category: 'fournitures',
      quantity: 0,
      unit: 'paquet',
      minQuantity: 2,
      unitCost: 12.00,
      supplier: 'Fournitures Resto',
      expiryDate: null,
      location: 'stock cuisine',
      notes: 'RUPTURE DE STOCK - À COMMANDER',
      lastUpdated: new Date().toISOString(),
      created: new Date().toISOString()
    },
    {
      id: 9,
      name: 'Café en grains',
      category: 'boissons',
      quantity: 4.5,
      unit: 'kg',
      minQuantity: 2,
      unitCost: 18.00,
      supplier: 'Torréfacteur Italien',
      expiryDate: '2026-04-30',
      location: 'réserve sèche',
      notes: 'Arabica 100%',
      lastUpdated: new Date().toISOString(),
      created: new Date().toISOString()
    },
    {
      id: 10,
      name: 'Poulet entier',
      category: 'viande',
      quantity: 6.8,
      unit: 'kg',
      minQuantity: 4,
      unitCost: 9.50,
      supplier: 'Boucherie Deluxe',
      expiryDate: '2025-12-23',
      location: 'frigo2',
      notes: 'Poulet fermier',
      lastUpdated: new Date().toISOString(),
      created: new Date().toISOString()
    }
  ];
  
  localStorage.setItem('maeled_inventory', JSON.stringify(sampleInventory));
  console.log('✅ Inventory initialized with', sampleInventory.length, 'items');

  // 4. DEFAULT EMPTY DATA
  if (!localStorage.getItem('maeled_reservations')) {
    localStorage.setItem('maeled_reservations', JSON.stringify([]));
    console.log('✅ Reservations initialized (empty)');
  }
  
  if (!localStorage.getItem('maeled_orders')) {
    localStorage.setItem('maeled_orders', JSON.stringify([]));
    console.log('✅ Orders initialized (empty)');
  }
  
  if (!localStorage.getItem('maeled_notifications')) {
    localStorage.setItem('maeled_notifications', JSON.stringify([]));
    console.log('✅ Notifications initialized (empty)');
  }
  
  if (!localStorage.getItem('cart')) {
    localStorage.setItem('cart', JSON.stringify([]));
    console.log('✅ Cart initialized (empty)');
  }

  console.log('🎉 All data initialization complete!');
});