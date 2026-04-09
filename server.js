require('dotenv').config();
const express = require('express');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

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
});

// ── PRODUCTS ──────────────────────────────────────
app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products WHERE is_active = true');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── CUSTOMERS ─────────────────────────────────────
app.get('/api/customers', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM customers');
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
      [customer_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── INVENTORY ─────────────────────────────────────
app.get('/api/inventory', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT inventory.*, products.product_name, warehouses.location FROM inventory JOIN products ON inventory.product_id = products.product_id JOIN warehouses ON inventory.warehouse_id = warehouses.warehouse_id'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});