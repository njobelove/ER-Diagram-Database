// ============================================
// EcoWise Market - Main Application
// Amazon-style e-commerce platform
// ============================================

function ecoWiseApp() {
  return {
    // ========== UI State ==========
    currentPage: 'home',
    currentAdminPage: 'dashboard',
    isLoggedIn: false,
    showLoginModal: false,
    showSignupModal: false,
    searchQuery: '',
    cartCount: 0,
    
    // ========== User Data ==========
    currentUser: { name: '', email: '' },
    users: [],
    loginEmail: '',
    loginPassword: '',
    signupName: '',
    signupEmail: '',
    signupPassword: '',
    
    // ========== Admin Menu ==========
    menuItems: [
      { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-chart-line' },
      { id: 'productManagement', label: 'Product Management', icon: 'fas fa-box' },
      { id: 'orderManagement', label: 'Order Management', icon: 'fas fa-truck' },
      { id: 'customers', label: 'Customers', icon: 'fas fa-users' },
      { id: 'reports', label: 'Reports', icon: 'fas fa-chart-bar' }
    ],
    
    // ========== Data Models ==========
    products: [],
    orders: [],
    customers: [],
    featuredProducts: [],
    
    // Product Form
    productForm: { 
      id: null, 
      sku: '', 
      name: '', 
      price: 0, 
      stock: 0, 
      active: 1, 
      icon: '🌿',
      description: '',
      carbon: 0
    },
    editingProduct: null,
    reportData: 'Select a report type to view sales data...',
    
    // Impact Stats
    stats: { 
      treesPlanted: 12480, 
      plasticSaved: 4750, 
      co2Offset: 320 
    },
    
    // ========== Computed Properties ==========
    get totalRevenue() {
      return this.orders.reduce((sum, order) => sum + order.total, 0);
    },
    
    // ========== Initialization ==========
    initData() {
      this.loadUsers();
      this.loadProducts();
      this.loadOrders();
      this.loadCustomers();
      this.loadStats();
    },
    
    loadUsers() {
      const savedUsers = localStorage.getItem('ecowise_users');
      if (savedUsers) {
        this.users = JSON.parse(savedUsers);
      } else {
        // Default admin user
        this.users = [
          { name: 'Admin User', email: 'admin@ecowise.com', password: 'admin123', role: 'admin', createdAt: new Date().toISOString() }
        ];
        localStorage.setItem('ecowise_users', JSON.stringify(this.users));
      }
    },
    
    loadProducts() {
      this.products = [
        { id: 1, sku: 'BAM-001', name: 'Bamboo Utensil Set', price: 24.99, stock: 45, active: true, icon: '🎋', carbon: 0.2, description: 'Eco-friendly bamboo utensils set - perfect for zero waste lifestyle' },
        { id: 2, sku: 'SOL-002', name: 'Solar Charger Pro', price: 59.99, stock: 23, active: true, icon: '☀️', carbon: 1.1, description: 'Portable solar charger for all your devices' },
        { id: 3, sku: 'ORG-003', name: 'Organic Cotton Tote', price: 19.99, stock: 89, active: true, icon: '👜', carbon: 0.3, description: 'Reusable organic cotton shopping bag' },
        { id: 4, sku: 'ZER-004', name: 'Zero Waste Starter Kit', price: 39.99, stock: 12, active: true, icon: '♻️', carbon: 0.5, description: 'Complete zero waste starter pack' },
        { id: 5, sku: 'ECO-005', name: 'Beeswax Wraps', price: 14.99, stock: 34, active: true, icon: '🐝', carbon: 0.1, description: 'Reusable food wraps made from organic beeswax' },
        { id: 6, sku: 'GRE-006', name: 'Glass Water Bottle', price: 22.99, stock: 56, active: true, icon: '💧', carbon: 0.4, description: 'Sleek glass water bottle with bamboo lid' }
      ];
      this.featuredProducts = this.products.slice(0, 4);
    },
    
    loadOrders() {
      this.orders = [
        { id: 1001, customerName: 'Alice Johnson', date: '2025-04-07', total: 84.98, status: 'Paid', items: 3 },
        { id: 1002, customerName: 'Bob Smith', date: '2025-04-06', total: 59.99, status: 'Shipped', items: 2 },
        { id: 1003, customerName: 'Carol Davis', date: '2025-04-05', total: 44.97, status: 'Delivered', items: 2 },
        { id: 1004, customerName: 'David Wilson', date: '2025-04-04', total: 129.99, status: 'Pending', items: 4 },
        { id: 1005, customerName: 'Emma Brown', date: '2025-04-03', total: 34.99, status: 'Delivered', items: 1 }
      ];
    },
    
    loadCustomers() {
      this.customers = [
        { id: 1, name: 'Alice Johnson', email: 'alice@example.com', totalSpent: 250, tier: 'Silver', joined: '2024-01-15' },
        { id: 2, name: 'Bob Smith', email: 'bob@example.com', totalSpent: 180, tier: 'Bronze', joined: '2024-02-20' },
        { id: 3, name: 'Carol Davis', email: 'carol@example.com', totalSpent: 520, tier: 'Gold', joined: '2023-11-10' },
        { id: 4, name: 'David Wilson', email: 'david@example.com', totalSpent: 95, tier: 'Bronze', joined: '2024-03-05' }
      ];
    },
    
    loadStats() {
      // Stats already initialized
    },
    
    // ========== Authentication ==========
    openLoginModal() { 
      this.showLoginModal = true; 
      this.loginEmail = ''; 
      this.loginPassword = ''; 
    },
    
    openSignupModal() { 
      this.showSignupModal = true; 
      this.signupName = ''; 
      this.signupEmail = ''; 
      this.signupPassword = ''; 
    },
    
    login() {
      const user = this.users.find(u => u.email === this.loginEmail && u.password === this.loginPassword);
      if (user) {
        this.isLoggedIn = true;
        this.currentUser = { name: user.name, email: user.email, role: user.role };
        this.showLoginModal = false;
        this.currentPage = 'admin';
        this.currentAdminPage = 'dashboard';
        
        // Show welcome message
        alert(`Welcome back, ${user.name}! 👋`);
      } else {
        alert('Invalid email or password.\n\nDemo credentials:\nEmail: admin@ecowise.com\nPassword: admin123');
      }
    },
    
    signup() {
      if (this.signupPassword.length < 6) {
        alert('Password must be at least 6 characters');
        return;
      }
      if (this.users.find(u => u.email === this.signupEmail)) {
        alert('Email already registered. Please login instead.');
        return;
      }
      
      const newUser = { 
        name: this.signupName, 
        email: this.signupEmail, 
        password: this.signupPassword, 
        role: 'user',
        createdAt: new Date().toISOString()
      };
      
      this.users.push(newUser);
      localStorage.setItem('ecowise_users', JSON.stringify(this.users));
      
      alert('Account created successfully! Please login.');
      this.showSignupModal = false;
      this.openLoginModal();
    },
    
    logout() {
      this.isLoggedIn = false;
      this.currentPage = 'home';
      this.currentUser = { name: '', email: '' };
      alert('You have been logged out.');
    },
    
    // ========== Product Management ==========
    openProductForm(prod) {
      if (prod) {
        this.editingProduct = prod;
        this.productForm = { 
          ...prod, 
          active: prod.active ? 1 : 0 
        };
      } else {
        this.editingProduct = null;
        this.productForm = { 
          id: null, 
          sku: '', 
          name: '', 
          price: 0, 
          stock: 0, 
          active: 1, 
          icon: '🌿',
          description: '',
          carbon: 0
        };
      }
      this.currentAdminPage = 'addEditProduct';
    },
    
    saveProduct() {
      const productData = {
        ...this.productForm,
        active: !!this.productForm.active,
        carbon: this.productForm.carbon || 0.5
      };
      
      if (this.productForm.id) {
        const index = this.products.findIndex(p => p.id === this.productForm.id);
        if (index !== -1) {
          this.products[index] = productData;
        }
      } else {
        productData.id = Date.now();
        this.products.push(productData);
      }
      
      this.featuredProducts = this.products.slice(0, 4);
      this.currentAdminPage = 'productManagement';
      alert('Product saved successfully!');
    },
    
    deleteProduct(id) {
      if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
        this.products = this.products.filter(p => p.id !== id);
        this.featuredProducts = this.products.slice(0, 4);
        alert('Product deleted successfully.');
      }
    },
    
    // ========== Reports ==========
    generateReport(type) {
      const totalSales = this.orders.reduce((sum, o) => sum + o.total, 0);
      const avgOrder = (totalSales / this.orders.length).toFixed(2);
      const totalItems = this.orders.reduce((sum, o) => sum + (o.items || 0), 0);
      
      const date = new Date();
      const dateStr = date.toLocaleDateString();
      const timeStr = date.toLocaleTimeString();
      
      this.reportData = `
╔══════════════════════════════════════════════════════════╗
║                    ${type.toUpperCase()} SALES REPORT                    ║
╠══════════════════════════════════════════════════════════╣
║  Generated: ${dateStr} at ${timeStr}
╠══════════════════════════════════════════════════════════╣
║  📊 KEY METRICS
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
║  Total Orders:     ${this.orders.length.toString().padStart(8)} 
║  Total Revenue:    $${totalSales.toFixed(2).padStart(8)}
║  Average Order:    $${avgOrder.padStart(8)}
║  Total Items Sold: ${totalItems.toString().padStart(8)}
╠══════════════════════════════════════════════════════════╣
║  🏆 TOP PERFORMING PRODUCTS
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${this.products.slice(0, 3).map((p, i) => `║  ${i + 1}. ${p.name.padEnd(25)} $${p.price.toFixed(2)}`).join('\n')}
╠══════════════════════════════════════════════════════════╣
║  🌱 IMPACT METRICS
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
║  Trees Planted:    ${this.stats.treesPlanted.toLocaleString().padStart(8)}
║  Plastic Saved:    ${this.stats.plasticSaved.toLocaleString().padStart(8)} kg
║  CO₂ Offset:       ${this.stats.co2Offset.toLocaleString().padStart(8)} tonnes
╚══════════════════════════════════════════════════════════╝
      `;
    }
  };
    let allProducts = [];
    let cartItems   = [];
    let CUSTOMER_ID = 1;

    window.addEventListener('load', async () => {
      checkLoginStatus();
      await loadProducts();
      await loadCategories();
      await loadCart();
      loadImpactStats();
    });

    // ── AUTHENTICATION FUNCTIONS ──
    function checkLoginStatus() {
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      const userName = localStorage.getItem('userName') || '';
      const userRole = localStorage.getItem('userRole') || '';
      const userId = localStorage.getItem('userId');
      
      if (userId) CUSTOMER_ID = parseInt(userId);
      
      const authButtons = document.getElementById('authButtons');
      const userInfo = document.getElementById('userInfo');
      const userNameSpan = document.getElementById('userName');
      const adminLink = document.getElementById('adminLink');
      
      if (isLoggedIn) {
        authButtons.classList.add('hidden');
        userInfo.classList.remove('hidden');
        if (userNameSpan) userNameSpan.textContent = userName;
        
        // Show admin link only for admin users
        if (adminLink) {
          if (userRole === 'admin') {
            adminLink.classList.remove('hidden');
          } else {
            adminLink.classList.add('hidden');
          }
        }
      } else {
        authButtons.classList.remove('hidden');
        userInfo.classList.add('hidden');
        if (adminLink) adminLink.classList.add('hidden');
      }
    }

    function openLoginModal() {
      document.getElementById('loginModal').classList.remove('hidden');
    }

    function closeLoginModal() {
      document.getElementById('loginModal').classList.add('hidden');
    }

    function openSignupModal() {
      document.getElementById('signupModal').classList.remove('hidden');
    }

    function closeSignupModal() {
      document.getElementById('signupModal').classList.add('hidden');
    }

    function openSellerModal() {
      const role = localStorage.getItem('userRole');
      if (role !== 'seller' && role !== 'admin') {
        showNotif('Please sign up as a Seller first!', 'error');
        openSignupModal();
        return;
      }
      document.getElementById('sellerModal').classList.remove('hidden');
    }

    function closeSellerModal() {
      document.getElementById('sellerModal').classList.add('hidden');
    }

    function handleLogin(event) {
      event.preventDefault();
      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;
      
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find(u => u.email === email && u.password === password);
      
      if (user) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userRole', user.role);
        localStorage.setItem('userName', user.name);
        localStorage.setItem('userId', user.id);
        localStorage.setItem('customerId', user.id);
        CUSTOMER_ID = user.id;
        
        showNotif(`Welcome back, ${user.name}!`, 'success');
        closeLoginModal();
        checkLoginStatus();
        loadCart();
        
        // Redirect admin to admin dashboard
        if (user.role === 'admin') {
          window.location.href = '/admin-dashboard.html';
        }
      } else {
        showNotif('Invalid email or password', 'error');
      }
    }

    function handleSignup(event) {
      event.preventDefault();
      const name = document.getElementById('signupName').value;
      const email = document.getElementById('signupEmail').value;
      const password = document.getElementById('signupPassword').value;
      const role = document.getElementById('signupRole').value;
      
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      
      if (users.find(u => u.email === email)) {
        showNotif('Email already registered', 'error');
        return;
      }
      
      const newUser = {
        id: users.length + 1,
        name: name,
        email: email,
        password: password,
        role: role
      };
      
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userRole', role);
      localStorage.setItem('userName', name);
      localStorage.setItem('userId', newUser.id);
      localStorage.setItem('customerId', newUser.id);
      CUSTOMER_ID = newUser.id;
      
      showNotif(`Welcome to EcoWise, ${name}!`, 'success');
      closeSignupModal();
      checkLoginStatus();
      loadCart();
      
      if (role === 'admin') {
        window.location.href = '/admin-dashboard.html';
      }
    }

    function handleAddProduct(event) {
      event.preventDefault();
      const productName = document.getElementById('productName').value;
      const productSku = document.getElementById('productSku').value;
      const productPrice = document.getElementById('productPrice').value;
      
      showNotif(`Product "${productName}" submitted for review!`, 'success');
      closeSellerModal();
      document.getElementById('productName').value = '';
      document.getElementById('productSku').value = '';
      document.getElementById('productPrice').value = '';
    }

    function logout() {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userName');
      localStorage.removeItem('userId');
      localStorage.removeItem('customerId');
      CUSTOMER_ID = 1;
      checkLoginStatus();
      loadCart();
      showNotif('Logged out successfully', 'info');
    }

    // ── PRODUCTS & CART FUNCTIONS ──
    async function loadProducts() {
      try {
        const res = await fetch('/api/products');
        allProducts = await res.json();
        renderProducts(allProducts);
      } catch {
        document.getElementById('productsGrid').innerHTML =
          '<p class="col-span-4 text-center text-gray-500 py-8">Could not load products.</p>';
      }
    }

    async function loadCategories() {
      try {
        const res  = await fetch('/api/categories');
        const cats = await res.json();
        renderCategories(cats);
      } catch {
        document.getElementById('categoryGrid').innerHTML =
          '<p class="col-span-5 text-center text-gray-500">Could not load categories.</p>';
      }
    }

    async function loadCart() {
      try {
        const res = await fetch(`/api/cart/${CUSTOMER_ID}`);
        cartItems = await res.json();
        renderCart();
      } catch { cartItems = []; }
    }

    function renderProducts(products) {
      const grid = document.getElementById('productsGrid');
      if (!products.length) {
        grid.innerHTML = '<p class="col-span-4 text-center text-gray-500 py-8">No products found. 🌿</p>';
        return;
      }
      grid.innerHTML = products.map(p => `
        <div class="bg-white rounded-lg shadow-md p-4 hover:shadow-xl transition-shadow flex flex-col">
          <div class="text-6xl text-center py-4 bg-green-50 rounded-lg mb-3">${getEmoji(p.product_name)}</div>
          <span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full w-fit mb-2">🌱 Eco-Friendly</span>
          <h3 class="font-semibold text-gray-800 flex-1 text-sm">${escHtml(p.product_name)}</h3>
          <div class="flex items-center justify-between mt-2">
            <span class="text-xl font-bold text-green-700">$${parseFloat(p.base_price).toFixed(2)}</span>
            <span class="text-xs text-gray-500">🌍 ${(Math.random()*4+0.3).toFixed(1)} kg CO₂</span>
          </div>
          <button onclick="addToCart(${p.product_id}, '${escHtml(p.product_name)}', ${p.base_price})"
            class="w-full mt-3 bg-[#ff9900] text-black py-2 rounded-md font-semibold hover:bg-[#fa8900] transition text-sm">
            Add to Cart 🛒
          </button>
        </div>
      `).join('');
    }

    function renderCategories(cats) {
      const icons = { 'Eco Home':'🏡','Organic Food':'🥦','Fashion':'👗','Cleaning':'🧼','Beverages':'🍵' };
      document.getElementById('categoryGrid').innerHTML = cats.map(c => `
        <div onclick="filterByCategory('${escHtml(c.category_name)}')"
          class="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-green-500 hover:shadow-md transition flex flex-col items-center gap-2">
          <span class="text-4xl">${icons[c.category_name] || '🌿'}</span>
          <h3 class="font-semibold text-gray-800 text-sm">${escHtml(c.category_name)}</h3>
          <span class="text-xs text-gray-500">Sustainable products</span>
        </div>
      `).join('');
    }

    function renderCart() {
      const el    = document.getElementById('cartItems');
      const total = document.getElementById('cartTotal');
      const count = document.getElementById('cartCount');
      if (!cartItems.length) {
        el.innerHTML = '<p class="text-gray-400 text-center mt-8">Your cart is empty. 🌿</p>';
        if (total) total.textContent = '$0.00';
        if (count) count.textContent = '0';
        return;
      }
      let sum = 0;
      el.innerHTML = cartItems.map(item => {
        const qty = parseInt(item.quantity) || 1;
        const price = parseFloat(item.base_price) || 0;
        sum += qty * price;
        return `
          <div class="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
            <span class="text-2xl">${getEmoji(item.product_name)}</span>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold truncate">${escHtml(item.product_name)}</p>
              <p class="text-xs text-gray-500">$${price.toFixed(2)} × ${qty}</p>
            </div>
            <div class="flex items-center gap-1">
              <button onclick="updateCart(${item.product_id},${qty-1})" class="w-6 h-6 bg-gray-200 rounded text-sm font-bold hover:bg-gray-300">−</button>
              <span class="text-sm font-bold w-5 text-center">${qty}</span>
              <button onclick="updateCart(${item.product_id},${qty+1})" class="w-6 h-6 bg-gray-200 rounded text-sm font-bold hover:bg-gray-300">+</button>
              <button onclick="removeFromCart(${item.product_id})" class="w-6 h-6 bg-red-100 text-red-600 rounded text-xs hover:bg-red-200 ml-1">✕</button>
            </div>
          </div>`;
      }).join('');
      if (total) total.textContent = `$${sum.toFixed(2)}`;
      if (count) count.textContent = cartItems.reduce((s,i) => s + (parseInt(i.quantity)||1), 0);
    }

    async function addToCart(productId, name, price) {
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      if (!isLoggedIn) {
        showNotif('Please sign in first!', 'error');
        openLoginModal();
        return;
      }
      try {
        await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ customer_id: CUSTOMER_ID, product_id: productId, quantity: 1 })
        });
        await loadCart();
        showNotif(`Added ${name} to cart! 🛒`, 'success');
      } catch { showNotif('Could not add to cart.', 'error'); }
    }

    async function updateCart(productId, quantity) {
      if (quantity <= 0) return removeFromCart(productId);
      try {
        await fetch(`/api/cart/${CUSTOMER_ID}/${productId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quantity })
        });
        await loadCart();
      } catch { showNotif('Could not update cart.', 'error'); }
    }

    async function removeFromCart(productId) {
      try {
        await fetch(`/api/cart/${CUSTOMER_ID}/${productId}`, { method: 'DELETE' });
        await loadCart();
        showNotif('Item removed.', 'info');
      } catch { showNotif('Could not remove item.', 'error'); }
    }

    function handleSearch() {
      const term = (document.getElementById('searchInput')?.value || '').toLowerCase();
      const filtered = allProducts.filter(p => p.product_name.toLowerCase().includes(term));
      renderProducts(filtered);
      document.getElementById('featured')?.scrollIntoView({ behavior: 'smooth' });
    }
    document.getElementById('searchInput')?.addEventListener('keyup', e => { if (e.key === 'Enter') handleSearch(); });

    function filterByCategory(name) {
      const keywords = {
        'Eco Home':['bamboo','solar','lamp','home','candle','cutting'],
        'Organic Food':['organic','coffee','seed','grain'],
        'Fashion':['shirt','dress','cotton','wear','fashion'],
        'Cleaning':['soap','cleaner','detergent','brush','laundry'],
        'Beverages':['tea','juice','water','drink','beverage','bottle','herbal']
      };
      const kws = keywords[name] || [name.toLowerCase()];
      const filtered = allProducts.filter(p => kws.some(k => p.product_name.toLowerCase().includes(k)));
      renderProducts(filtered.length ? filtered : allProducts);
      document.getElementById('featured')?.scrollIntoView({ behavior: 'smooth' });
      showNotif(`Showing ${name} products`, 'info');
    }

    async function loadImpactStats() {
      try {
        const res = await fetch('/api/orders');
        const orders = await res.json();
        const c = orders.length;
        animateNum(document.getElementById('countTrees'),   84  + Math.floor(c * 0.7));
        animateNum(document.getElementById('countPlastic'), 126 + Math.floor(c * 1.2));
        animateNum(document.getElementById('countCO2'),     245 + Math.floor(c * 2.5));
      } catch {}
    }

    function animateNum(el, target) {
      if (!el) return;
      let cur = 0; const step = target / 50;
      const t = setInterval(() => {
        cur += step;
        if (cur >= target) { el.textContent = target; clearInterval(t); }
        else el.textContent = Math.floor(cur);
      }, 40);
    }

    function handleNewsletter() {
      const email = document.getElementById('ctaEmail')?.value.trim();
      const note  = document.getElementById('ctaNote');
      const btn   = document.getElementById('ctaBtn');
      if (!email || !email.includes('@')) {
        if (note) { note.textContent = 'Please enter a valid email. 🌿'; note.style.color = '#fca5a5'; }
        return;
      }
      if (btn) { btn.textContent = 'Subscribing…'; btn.disabled = true; }
      setTimeout(() => {
        if (note) { note.textContent = 'Welcome to EcoWise! 🌿'; note.style.color = '#86efac'; }
        if (btn)  { btn.textContent = 'Join EcoWise'; btn.disabled = false; }
        document.getElementById('ctaEmail').value = '';
        showNotif('Successfully subscribed!', 'success');
      }, 1000);
    }

    function toggleCart() {
      document.getElementById('cartSidebar').classList.toggle('translate-x-full');
      document.getElementById('cartOverlay').classList.toggle('hidden');
    }

    function showNotif(msg, type = 'success') {
      const el = document.getElementById('notification');
      const colors = { success:'bg-green-800', error:'bg-red-700', info:'bg-blue-700' };
      el.className = `fixed bottom-6 right-6 text-white px-5 py-3 rounded-lg shadow-lg z-50 ${colors[type]}`;
      document.getElementById('notifMsg').textContent = msg;
      el.classList.remove('hidden');
      setTimeout(() => el.classList.add('hidden'), 3000);
    }

    function getEmoji(name = '') {
      const n = name.toLowerCase();
      if (n.includes('bamboo'))  return '🎋';
      if (n.includes('solar'))   return '☀️';
      if (n.includes('tea') || n.includes('herbal')) return '🍵';
      if (n.includes('coffee'))  return '☕';
      if (n.includes('organic')) return '🥬';
      if (n.includes('shirt') || n.includes('cotton') || n.includes('dress')) return '👕';
      if (n.includes('soap') || n.includes('clean') || n.includes('detergent') || n.includes('laundry')) return '🧼';
      if (n.includes('water') || n.includes('bottle')) return '💧';
      if (n.includes('juice')) return '🥤';
      if (n.includes('lamp'))  return '💡';
      if (n.includes('cutting') || n.includes('board')) return '🪵';
      return '🌱';
    }

    function escHtml(str) {
      return String(str || '').replace(/[&<>"']/g, m =>
        ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
    }
  
}