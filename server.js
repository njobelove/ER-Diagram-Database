require('dotenv').config();
const express = require('express');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

console.log('📁 Environment check:');
console.log('   DATABASE_URL exists:', process.env.DATABASE_URL ? '✅ Yes' : '❌ No');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
  } else {
    console.log('✅ Connected to Neon database successfully!');
    release();
  }
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── TEST ROUTE ───────────────────────────
app.get('/api/test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as current_time');
    res.json({ success: true, message: 'Database connected!', time: result.rows[0].current_time });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── PRODUCTS ──────────────────────────────
app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products WHERE is_active = true ORDER BY product_id');
    res.json(result.rows);
  } catch (err) {
    console.error('Products error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── CATEGORIES ────────────────────────────
app.get('/api/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM category ORDER BY category_id');
    res.json(result.rows);
  } catch (err) {
    console.error('Categories error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── CUSTOMERS ─────────────────────────────
app.get('/api/customers', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM customers ORDER BY customer_id');
    res.json(result.rows);
  } catch (err) {
    console.error('Customers error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── ORDERS ────────────────────────────────
app.get('/api/orders', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM orders ORDER BY order_date DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Orders error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── CART — SIMPLIFIED VERSION (works with any structure) ──
app.get('/api/cart/:customer_id', async (req, res) => {
  try {
    const { customer_id } = req.params;
    
    // Get cart items with product details
    const result = await pool.query(
      `SELECT 
        c.customer_id, 
        c.product_id, 
        c.quantity,
        p.product_name, 
        p.base_price
       FROM cart c
       JOIN products p ON c.product_id = p.product_id
       WHERE c.customer_id = $1`,
      [customer_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Cart GET error:', err.message);
    // If table doesn't exist, return empty array
    if (err.message.includes('does not exist')) {
      res.json([]);
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

app.post('/api/cart', async (req, res) => {
  try {
    const { customer_id, product_id, quantity } = req.body;
    
    // Check if item exists
    const existing = await pool.query(
      'SELECT quantity FROM cart WHERE customer_id = $1 AND product_id = $2',
      [customer_id, product_id]
    );
    
    if (existing.rows.length > 0) {
      const newQty = existing.rows[0].quantity + (quantity || 1);
      await pool.query(
        'UPDATE cart SET quantity = $1 WHERE customer_id = $2 AND product_id = $3',
        [newQty, customer_id, product_id]
      );
    } else {
      await pool.query(
        'INSERT INTO cart (customer_id, product_id, quantity) VALUES ($1, $2, $3)',
        [customer_id, product_id, quantity || 1]
      );
    }
    
    // Return updated cart
    const result = await pool.query(
      `SELECT 
        c.customer_id, 
        c.product_id, 
        c.quantity,
        p.product_name, 
        p.base_price
       FROM cart c
       JOIN products p ON c.product_id = p.product_id
       WHERE c.customer_id = $1`,
      [customer_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Cart POST error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/cart/:customer_id/:product_id', async (req, res) => {
  try {
    const { customer_id, product_id } = req.params;
    const { quantity } = req.body;
    await pool.query(
      'UPDATE cart SET quantity = $1 WHERE customer_id = $2 AND product_id = $3',
      [quantity, customer_id, product_id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Cart PUT error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/cart/:customer_id/:product_id', async (req, res) => {
  try {
    const { customer_id, product_id } = req.params;
    await pool.query(
      'DELETE FROM cart WHERE customer_id = $1 AND product_id = $2',
      [customer_id, product_id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Cart DELETE error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── INVENTORY ──────────────────────────────
app.get('/api/inventory', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT i.*, p.product_name, w.location
       FROM inventory i
       JOIN products p ON i.product_id = p.product_id
       JOIN warehouses w ON i.warehouse_id = w.warehouse_id`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Inventory error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── HTML ROUTES ────────────────────────────
app.get('/home.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/signup.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

app.get('/admin-dashboard.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin-dashboard.html'));
});

app.get('/cart.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'cart.html'));
});

// Fallback for other HTML files
app.get('*.html', (req, res) => {
  const filePath = path.join(__dirname, 'public', req.path);
  res.sendFile(filePath);
});

// ── START SERVER ────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📦 Products API: http://localhost:${PORT}/api/products`);
  console.log(`🏠 Home: http://localhost:${PORT}/home.html`);
  console.log(`\n💡 If cart errors appear, the table may need to be created.\n`);
});