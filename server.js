require('dotenv').config();
const express = require('express');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

const path    = require('path');
const { Pool } = require('pg');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── DATABASE CONNECTION ───────────────────────────
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.query('SET search_path TO public').then(() => {
  console.log('Connected to Neon database successfully!');
}).catch(err => {
  console.error('Database connection failed:', err.message);
});

pool.connect((err, client, release) => {
  if (err) {
    console.error('Database connection failed:', err.message);
  } else {
    console.log('Connected to Neon database successfully!');
    release();
  }
});

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'WelcomePage', 'index.html'));
    client.query('SET search_path TO public', (err2) => {
      release();
      if (err2) {
        console.error('Search path error:', err2.message);
      } else {
        console.log('Connected to Neon database successfully!');
      }
    });
  }
});

// ── MIDDLEWARE ────────────────────────────────────
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── ROOT ROUTE ────────────────────────────────────
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── PRODUCTS ──────────────────────────────────────
app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products WHERE is_active = true');
    const result = await pool.query(
      'SELECT * FROM products WHERE is_active = true ORDER BY product_id'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── CATEGORIES ────────────────────────────────────
app.get('/api/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM category ORDER BY category_id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── CUSTOMERS ─────────────────────────────────────
app.get('/api/customers', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM customers');
    const result = await pool.query('SELECT * FROM customers ORDER BY customer_id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── ORDERS ────────────────────────────────────────
app.get('/api/orders', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM orders ORDER BY order_date DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── CATEGORIES ────────────────────────────────────
app.get('/api/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM category');
// ── CART — GET items for a customer ───────────────
app.get('/api/cart/:customer_id', async (req, res) => {
  try {
    const { customer_id } = req.params;
    const result = await pool.query(
      `SELECT cart.card_id, cart.customer_id, cart.product_id, cart.quantity, cart.added_at,
              products.product_name, products.base_price
       FROM cart
       JOIN products ON cart.product_id = products.product_id
       WHERE cart.customer_id = $1
       ORDER BY cart.added_at DESC`,
      [customer_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── CART ──────────────────────────────────────────
app.get('/api/cart/:customer_id', async (req, res) => {
  try {
    const { customer_id } = req.params;
    const result = await pool.query(
      'SELECT cart.*, products.product_name, products.base_price FROM cart JOIN products ON cart.product_id = products.product_id WHERE cart.customer_id = $1',
// ── CART — ADD item ───────────────────────────────
app.post('/api/cart', async (req, res) => {
  try {
    const { customer_id, product_id, quantity } = req.body;

    const existing = await pool.query(
      'SELECT * FROM cart WHERE customer_id = $1 AND product_id = $2',
      [customer_id, product_id]
    );

    if (existing.rows.length > 0) {
      const newQty = parseInt(existing.rows[0].quantity) + (quantity || 1);
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

    const result = await pool.query(
      `SELECT cart.card_id, cart.customer_id, cart.product_id, cart.quantity, cart.added_at,
              products.product_name, products.base_price
       FROM cart
       JOIN products ON cart.product_id = products.product_id
       WHERE cart.customer_id = $1`,
      [customer_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── CART — UPDATE quantity ────────────────────────
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
    res.status(500).json({ error: err.message });
  }
});

// ── CART — REMOVE item ────────────────────────────
app.delete('/api/cart/:customer_id/:product_id', async (req, res) => {
  try {
    const { customer_id, product_id } = req.params;
    await pool.query(
      'DELETE FROM cart WHERE customer_id = $1 AND product_id = $2',
      [customer_id, product_id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── INVENTORY ─────────────────────────────────────
app.get('/api/inventory', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT inventory.*, products.product_name, warehouses.location FROM inventory JOIN products ON inventory.product_id = products.product_id JOIN warehouses ON inventory.warehouse_id = warehouses.warehouse_id'
      `SELECT inventory.*, products.product_name, warehouses.location
       FROM inventory
       JOIN products   ON inventory.product_id   = products.product_id
       JOIN warehouses ON inventory.warehouse_id = warehouses.warehouse_id`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
// ── START SERVER ──────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});