function adminApp() {
  return {
    // Navigation
    currentPage: 'dashboard',
    menuItems: [
      { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-chart-line' },
      { id: 'productManagement', label: 'Product Management', icon: 'fas fa-box' },
      { id: 'attributeManagement', label: 'Attributes', icon: 'fas fa-tags' },
      { id: 'inventoryOverview', label: 'Inventory & Warehouses', icon: 'fas fa-warehouse' },
      { id: 'orderManagement', label: 'Orders', icon: 'fas fa-truck' },
      { id: 'currencyManagement', label: 'Currencies & FX', icon: 'fas fa-dollar-sign' },
      { id: 'loyaltyTiers', label: 'Loyalty & Customers', icon: 'fas fa-gem' },
      { id: 'systemConfig', label: 'System Config', icon: 'fas fa-cog' },
      { id: 'reports', label: 'Reports', icon: 'fas fa-chart-simple' }
    ],
    
    // Data Models
    products: [],
    warehouses: [],
    inventoryItems: [],
    orders: [],
    currencies: [],
    exchangeRates: [],
    loyaltyTiers: [],
    customers: [],
    attributeList: [],
    
    // Forms & UI State
    productForm: { id: null, sku: '', name: '', price: 0, active: 1, attrRaw: '' },
    editingProduct: null,
    inventorySearch: '',
    stockAdjustModalOpen: false,
    adjustItem: null,
    adjustQty: 0,
    orderFilterStatus: '',
    orderFilterDate: '',
    sysConfig: { siteName: 'Amazon Style Admin', defaultCurrency: 'USD', timeZone: 'America/New_York' },
    reportData: 'Click any report button to generate sample insights.',
    
    // Dashboard computed stats
    dashboardStats: { recentOrders: 0, lowStockAlerts: 0, topProduct: 'N/A' },
    lowStockItems: [],
    recentOrdersList: [],
    
    // Initialize with sample data
    initData() {
      // Sample Products
      this.products = [
        { id: 1, sku: 'MUG-001', name: 'Eco Ceramic Mug', price: 12.99, active: true, attributes: [{ name: 'Material', value: 'Recycled Clay' }], attributesDisplay: 'Material: Recycled Clay' },
        { id: 2, sku: 'TSH-GRN', name: 'Organic Cotton Tee', price: 24.5, active: true, attributes: [{ name: 'Size', value: 'M' },{ name:'Cert', value:'GOTS' }], attributesDisplay: 'Size: M, Cert: GOTS' }
      ];
      
      // Warehouses
      this.warehouses = [
        { id: 1, name: 'Fulfillment Center ORD', location: 'Chicago, IL', capacity: 5000 },
        { id: 2, name: 'West Coast Hub', location: 'Ontario, CA', capacity: 3000 }
      ];
      
      // Inventory Items
      this.inventoryItems = [
        { id: 101, productId: 1, productName: 'Eco Ceramic Mug', sku: 'MUG-001', warehouse: 'Fulfillment Center ORD', qty: 3, timestamp: '2025-03-01' },
        { id: 102, productId: 2, sku: 'TSH-GRN', productName: 'Organic Cotton Tee', warehouse: 'West Coast Hub', qty: 12, timestamp: '2025-03-10' }
      ];
      
      // Orders
      this.orders = [
        { id: 1001, customerName: 'Alice Johnson', date: '2025-03-20', total: 37.49, status: 'Paid' },
        { id: 1002, customerName: 'Bob Smith', date: '2025-03-21', total: 12.99, status: 'Shipped' }
      ];
      
      // Currencies & Exchange Rates
      this.currencies = [
        { code: 'USD', name: 'US Dollar', symbol: '$' },
        { code: 'EUR', name: 'Euro', symbol: '€' }
      ];
      this.exchangeRates = [
        { id: 1, currency: 'EUR', rate: 0.92, effectiveDate: '2025-03-01' }
      ];
      
      // Loyalty Tiers & Customers
      this.loyaltyTiers = [
        { id: 1, name: 'Silver', discountPercent: 5, minSpend: 200 },
        { id: 2, name: 'Gold', discountPercent: 10, minSpend: 500 }
      ];
      this.customers = [
        { id: 1, name: 'Emily Davis', tierId: 1, totalSpend: 250 },
        { id: 2, name: 'Michael Lee', tierId: 2, totalSpend: 780 }
      ];
      
      // Attributes
      this.attributeList = [
        { id: 1, name: 'Size', values: ['S', 'M', 'L'] },
        { id: 2, name: 'Eco Certification', values: ['GOTS', 'Recycled'] }
      ];
      
      this.updateDashboard();
    },
    
    // Dashboard Helpers
    updateDashboard() {
      this.dashboardStats.recentOrders = this.orders.length;
      this.dashboardStats.lowStockAlerts = this.inventoryItems.filter(i => i.qty < 5).length;
      this.dashboardStats.topProduct = this.products[0]?.name || 'N/A';
      this.lowStockItems = this.inventoryItems.filter(i => i.qty < 5).map(i => ({ name: i.productName, qty: i.qty, sku: i.sku }));
      this.recentOrdersList = this.orders.slice(0, 3);
    },
    
    // Inventory Helpers
    filteredInventory() {
      return this.inventoryItems.filter(i => 
        i.productName.toLowerCase().includes(this.inventorySearch.toLowerCase()) || 
        i.warehouse.toLowerCase().includes(this.inventorySearch.toLowerCase())
      );
    },
    
    openStockAdjust(item) {
      this.adjustItem = item;
      this.adjustQty = item.qty;
      this.stockAdjustModalOpen = true;
    },
    
    saveStockAdjustment() {
      if (this.adjustItem) {
        this.adjustItem.qty = this.adjustQty;
        this.adjustItem.timestamp = new Date().toISOString().slice(0, 10);
        this.stockAdjustModalOpen = false;
        this.updateDashboard();
      }
    },
    
    // Product Management
    openProductForm(prod) {
      if (prod) {
        this.editingProduct = prod;
        this.productForm = {
          id: prod.id,
          sku: prod.sku,
          name: prod.name,
          price: prod.price,
          active: prod.active ? 1 : 0,
          attrRaw: prod.attributes?.map(a => `${a.name}: ${a.value}`).join(', ') || ''
        };
      } else {
        this.editingProduct = null;
        this.productForm = { id: null, sku: '', name: '', price: 0, active: 1, attrRaw: '' };
      }
      this.currentPage = 'addEditProduct';
    },
    
    saveProduct() {
      const newProd = {
        id: this.productForm.id || Date.now(),
        sku: this.productForm.sku,
        name: this.productForm.name,
        price: parseFloat(this.productForm.price),
        active: !!this.productForm.active,
        attributes: [],
        attributesDisplay: this.productForm.attrRaw
      };
      
      if (this.productForm.id) {
        const idx = this.products.findIndex(p => p.id == this.productForm.id);
        if (idx !== -1) this.products[idx] = newProd;
      } else {
        this.products.push(newProd);
      }
      this.currentPage = 'productManagement';
      this.updateDashboard();
    },
    
    deleteProduct(id) {
      this.products = this.products.filter(p => p.id !== id);
    },
    
    // Attribute Management
    addNewAttribute() {
      const name = prompt('Attribute name:');
      if (name) this.attributeList.push({ id: Date.now(), name, values: [] });
    },
    
    editAttributePrompt(attr) {
      const vals = prompt('Enter comma separated values', attr.values.join(','));
      if (vals !== null) attr.values = vals.split(',').map(v => v.trim());
    },
    
    deleteAttribute(id) {
      this.attributeList = this.attributeList.filter(a => a.id !== id);
    },
    
    // Warehouse Management
    openWarehouseModal() {
      const name = prompt('Warehouse name');
      if (name) {
        const loc = prompt('Location');
        const cap = prompt('Capacity');
        this.warehouses.push({ id: Date.now(), name, location: loc, capacity: parseInt(cap) || 0 });
      }
    },
    
    editWarehouse(wh) {
      wh.name = prompt('Edit name', wh.name) || wh.name;
      wh.location = prompt('Location', wh.location);
    },
    
    deleteWarehouse(id) {
      this.warehouses = this.warehouses.filter(w => w.id !== id);
    },
    
    // Order Management
    filteredOrders() {
      let filtered = this.orders;
      if (this.orderFilterStatus) filtered = filtered.filter(o => o.status === this.orderFilterStatus);
      if (this.orderFilterDate) filtered = filtered.filter(o => o.date === this.orderFilterDate);
      return filtered;
    },
    
    updateOrderStatus(order) {
      // Status already updated via x-model binding
      this.updateDashboard();
    },
    
    viewOrderDetails(order) {
      alert(`Order #${order.id}\nCustomer: ${order.customerName}\nTotal: $${order.total}\nStatus: ${order.status}\nFull details mock (admin view)`);
    },
    
    // Currency & Exchange Rate Management
    addCurrencyPrompt() {
      const code = prompt('Currency Code (USD)');
      if (code) {
        this.currencies.push({ 
          code, 
          name: prompt('Name'), 
          symbol: prompt('Symbol') 
        });
      }
    },
    
    deleteCurrency(code) {
      this.currencies = this.currencies.filter(c => c.code !== code);
    },
    
    addExchangeRate() {
      const curr = prompt('Currency');
      const rate = prompt('Rate');
      const date = prompt('Effective date YYYY-MM-DD');
      if (curr && rate) {
        this.exchangeRates.push({ 
          id: Date.now(), 
          currency: curr, 
          rate, 
          effectiveDate: date || '2025-04-01' 
        });
      }
    },
    
    // Loyalty Tiers & Customers
    addTier() {
      const name = prompt('Tier name');
      if (name) {
        this.loyaltyTiers.push({ 
          id: Date.now(), 
          name, 
          discountPercent: parseInt(prompt('Discount %')) || 0, 
          minSpend: parseInt(prompt('Min Spend')) || 0 
        });
      }
    },
    
    editTier(tier) {
      tier.name = prompt('Name', tier.name);
      tier.discountPercent = parseInt(prompt('Discount', tier.discountPercent));
      tier.minSpend = parseInt(prompt('Min spend', tier.minSpend));
    },
    
    updateCustomerTier(cust) {
      alert(`Tier updated for ${cust.name}`);
    },
    
    adjustSpending(cust) {
      const newSpend = prompt('New total spending', cust.totalSpend);
      if (newSpend) cust.totalSpend = parseFloat(newSpend);
    },
    
    // System Configuration
    saveSysConfig() {
      alert('Configuration saved');
    },
    
    // Reports
    generateReport(type) {
      this.reportData = `📊 ${type.toUpperCase()} REPORT (sample)\nTop selling: ${this.products[0]?.name} with 45 units\nRevenue by ${type}: $12,340\nTimestamp: ${new Date().toLocaleString()}\nExport ready.`;
    }
  };
}