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
}