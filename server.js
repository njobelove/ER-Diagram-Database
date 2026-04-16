require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const path    = require('path');
const { Pool } = require('pg');
const multer  = require('multer');
const fs      = require('fs');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── FILE UPLOAD SETUP ───────────────────────────────
// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter - only images
const fileFilter = (req, file, cb) => {
  const allowedExts = /jpeg|jpg|png|gif|webp/;
  const extname = allowedExts.test(path.extname(file.originalname).toLowerCase());
  
  if (extname) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// ── DATABASE CONNECTION ───────────────────────────
const pool = new Pool({
  connectionString: process.env.DATABASE_URL + '&uselibpqcompat=true'
});

pool.on('error', (err) => {
  console.error('Unexpected database error:', err.message);
});

pool.connect((err, client, release) => {
  if (err) {
    console.error('Database connection failed:', err.message);
  } else {
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

// Make uploads folder publicly accessible
app.use('/uploads', express.static(uploadDir));

// ── ROOT ROUTE ────────────────────────────────────
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── ADMIN ROUTE ────────────────────────────────────
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// ── AUTHENTICATION ──────────────────────────────────
// Login - authenticate user
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const result = await pool.query(
      'SELECT c.customer_id, c.full_name, c.email, ct.tier_name, ct.discount_pct FROM customers c LEFT JOIN customer_tiers ct ON c.tier_id = ct.tier_id WHERE c.email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Check password (simple comparison - in production use bcrypt)
    // For demo, we'll check against the users table password_hash
    const userResult = await pool.query(
      'SELECT userid, customerid, username, password_hash FROM users WHERE customerid = $1',
      [result.rows[0].customer_id]
    );
    
    // If no user account exists, create one with default password
    let storedHash = userResult.rows[0]?.password_hash;
    
    // For demo purposes - accept 'admin123' for admin, or check stored hash
    if (!storedHash) {
      // First time login - set default
      if (email === 'admin@ecowise.com' && password === 'admin123') {
        // Return admin user
        return res.json({
          customer_id: result.rows[0].customer_id,
          full_name: result.rows[0].full_name,
          email: result.rows[0].email,
          role: 'admin',
          tier: result.rows[0].tier_name || 'Bronze',
          discount: result.rows[0].discount_pct || 0
        });
      }
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Simple password check (in production use bcrypt.compare)
    if (password === storedHash || (email === 'admin@ecowise.com' && password === 'admin123')) {
      // Determine role - admin if email matches admin email
      const role = email === 'admin@ecowise.com' ? 'admin' : 'user';
      
      return res.json({
        customer_id: result.rows[0].customer_id,
        full_name: result.rows[0].full_name,
        email: result.rows[0].email,
        role: role,
        tier: result.rows[0].tier_name || 'Bronze',
        discount: result.rows[0].discount_pct || 0
      });
    }
    
    res.status(401).json({ error: 'Invalid email or password' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Register - create new user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { full_name, email, password } = req.body;
    
    // Check if email already exists
    const existing = await pool.query(
      'SELECT customer_id FROM customers WHERE email = $1',
      [email]
    );
    
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    // Get default tier (Bronze)
    const tierResult = await pool.query(
      "SELECT tier_id FROM customer_tiers WHERE tier_name = 'Bronze'"
    );
    const tierId = tierResult.rows[0]?.tier_id || 1;
    
    // Create customer
    const customerResult = await pool.query(
      'INSERT INTO customers (full_name, email, tier_id) VALUES ($1, $2, $3) RETURNING customer_id, full_name, email',
      [full_name, email, tierId]
    );
    
    const customerId = customerResult.rows[0].customer_id;
    
    // Create user account
    await pool.query(
      'INSERT INTO users (customerid, username, password_hash) VALUES ($1, $2, $3)',
      [customerId, email, password] // In production, hash the password!
    );
    
    res.status(201).json({
      customer_id: customerId,
      full_name: full_name,
      email: email,
      role: 'user',
      tier: 'Bronze',
      discount: 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get current user session
app.get('/api/auth/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const { customer_id } = JSON.parse(authHeader);
    
    const result = await pool.query(
      'SELECT c.customer_id, c.full_name, c.email, ct.tier_name, ct.discount_pct FROM customers c LEFT JOIN customer_tiers ct ON c.tier_id = ct.tier_id WHERE c.customer_id = $1',
      [customer_id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = result.rows[0];
    const role = user.email === 'admin@ecowise.com' ? 'admin' : 'user';
    
    res.json({
      customer_id: user.customer_id,
      full_name: user.full_name,
      email: user.email,
      role: role,
      tier: user.tier_name || 'Bronze',
      discount: user.discount_pct || 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PRODUCTS ──────────────────────────────────────
// GET all products
app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM products WHERE is_active = true ORDER BY product_id'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST - Create new product (with optional image URL or file upload)
app.post('/api/products', upload.single('product_image'), async (req, res) => {
  try {
    const { product_name, sku, base_price, is_active, image_url, description } = req.body;

    // Get the image URL (from JSON body or file upload)
    let imageUrl = image_url || null;
    if (!imageUrl && req.file) {
      imageUrl = '/uploads/' + req.file.filename;
    }

    // Insert the product
    const result = await pool.query(
      `INSERT INTO products (product_name, sku, base_price, is_active, description) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [product_name, sku || null, base_price, is_active !== false, description || null]
    );

    const newProduct = result.rows[0];

    // If image was uploaded, add it to product_images
    if (imageUrl) {
      await pool.query(
        `INSERT INTO product_images (product_id, image_url, is_primary) 
         VALUES ($1, $2, 'true')`,
        [newProduct.product_id, imageUrl]
      );
    }

    res.status(201).json(newProduct);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT - Update product (with optional image URL or file upload)
app.put('/api/products/:id', upload.single('product_image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { product_name, sku, base_price, is_active, image_url, description } = req.body;

    // Get new image URL (from JSON body or file upload)
    let imageUrl = image_url || null;
    if (!imageUrl && req.file) {
      imageUrl = '/uploads/' + req.file.filename;
    }

    // Update product
    await pool.query(
      `UPDATE products SET product_name = $1, sku = $2, base_price = $3, is_active = $4, description = $5 WHERE product_id = $6`,
      [product_name, sku || null, base_price, is_active !== false, description || null, id]
    );

    // Update or add image if a new file was uploaded
    if (imageUrl) {
      const existingImg = await pool.query(
        'SELECT * FROM product_images WHERE product_id = $1',
        [id]
      );
      
      if (existingImg.rows.length > 0) {
        await pool.query(
          'UPDATE product_images SET image_url = $1 WHERE product_id = $2',
          [imageUrl, id]
        );
      } else {
        await pool.query(
          'INSERT INTO product_images (product_id, image_url, is_primary) VALUES ($1, $2, true)',
          [id, imageUrl]
        );
      }
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE - Remove product
app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // First delete product images
    await pool.query('DELETE FROM product_images WHERE product_id = $1', [id]);
    
    // Then delete the product
    await pool.query('DELETE FROM products WHERE product_id = $1', [id]);
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT - Update product
app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { product_name, sku, base_price, is_active, image_url } = req.body;

    // Update product
    await pool.query(
      `UPDATE products SET product_name = $1, sku = $2, base_price = $3, is_active = $4 WHERE product_id = $5`,
      [product_name, sku || null, base_price, is_active !== false, id]
    );

    // Update or add image if provided
    if (image_url) {
      // Check if image exists
      const existingImg = await pool.query(
        'SELECT * FROM product_images WHERE product_id = $1',
        [id]
      );
      
      if (existingImg.rows.length > 0) {
        await pool.query(
          'UPDATE product_images SET image_url = $1 WHERE product_id = $2',
          [image_url, id]
        );
      } else {
        await pool.query(
          'INSERT INTO product_images (product_id, image_url, is_primary) VALUES ($1, $2, true)',
          [id, image_url]
        );
      }
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET product images
app.get('/api/product-images', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM product_images');
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

// ── CURRENCIES ───────────────────────────────────
// Get currencies or create default XOF
app.get('/api/currencies', async (req, res) => {
  try {
    // Check if currencies exist, if not create defaults
    const check = await pool.query('SELECT COUNT(*) as count FROM currencies');
    
    if (parseInt(check.rows[0].count) === 0) {
      // Insert default currencies including XOF for FCAF
      await pool.query(`
        INSERT INTO currencies (currency_code, currency_name, symbol) VALUES 
        ('XOF', 'West African CFA Franc', 'FCAF'),
        ('USD', 'US Dollar', '$'),
        ('EUR', 'Euro', '€')
      `);
    }
    
    const result = await pool.query('SELECT * FROM currencies');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── CUSTOMERS ─────────────────────────────────────
app.get('/api/customers', async (req, res) => {
  try {
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

// Get orders for a specific customer
app.get('/api/orders/customer/:customer_id', async (req, res) => {
  try {
    const { customer_id } = req.params;
    const result = await pool.query(
      'SELECT * FROM orders WHERE customer_id = $1 ORDER BY order_date DESC',
      [customer_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get order items for an order
app.get('/api/order-items/:order_id', async (req, res) => {
  try {
    const { order_id } = req.params;
    const result = await pool.query(
      'SELECT * FROM order_items WHERE order_id = $1',
      [order_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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

// ── ADDRESSES ─────────────────────────────────────
// Get addresses for a customer
app.get('/api/addresses/:customer_id', async (req, res) => {
  try {
    const { customer_id } = req.params;
    const result = await pool.query(
      'SELECT * FROM address WHERE customer_id = $1 ORDER BY address_id',
      [customer_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new address
app.post('/api/addresses', async (req, res) => {
  try {
    const { customer_id, street, city, country, is_default } = req.body;
    
    // If this is default, unset other defaults first
    if (is_default) {
      await pool.query(
        'UPDATE address SET is_default = \'false\' WHERE customer_id = $1',
        [customer_id]
      );
    }
    
    const result = await pool.query(
      `INSERT INTO address (customer_id, street, city, country, is_default) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [customer_id, street, city, country, is_default ? 'true' : 'false']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete address
app.delete('/api/addresses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM address WHERE address_id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update customer
app.put('/api/customers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name } = req.body;
    
    await pool.query(
      'UPDATE customers SET full_name = $1 WHERE customer_id = $2',
      [full_name, id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── ORDERS ──────────────────────────────────────────
// Create new order
app.post('/api/orders', async (req, res) => {
  try {
    const { customer_id, total_amount, status } = req.body;
    
    // Get default currency (XOF = CFA Franc)
    const currencyResult = await pool.query(
      "SELECT currency_id FROM currencies WHERE currency_code = 'XOF'"
    );
    const currencyId = currencyResult.rows[0]?.currency_id || 1;
    
    const result = await pool.query(
      `INSERT INTO orders (customer_id, currency_id, total_amount, status) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [customer_id, currencyId, total_amount, status || 'pending']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── ORDER ITEMS ────────────────────────────────────
// Create order item
app.post('/api/order-items', async (req, res) => {
  try {
    const { order_id, product_id, quantity, unit_price, discount } = req.body;
    
    const result = await pool.query(
      `INSERT INTO order_items (order_id, product_id, quantity, unit_price, discount) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [order_id, product_id, quantity, unit_price, discount || 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── DELIVERIES ────────────────────────────────────
// Create delivery record
app.post('/api/deliveries', async (req, res) => {
  try {
    const { order_id, address, delivery_status } = req.body;
    
    const result = await pool.query(
      `INSERT INTO deliveries (order_id, address, delivery_status) 
       VALUES ($1, $2, $3) RETURNING *`,
      [order_id, address, delivery_status || 'pending']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PAYMENTS ───────────────────────────────────────
// Create payment record
app.post('/api/payments', async (req, res) => {
  try {
    const { order_id, payment_method, payment_status, amount } = req.body;
    
    const result = await pool.query(
      `INSERT INTO payments (order_id, payment_method, payment_status, amount, paid_at) 
       VALUES ($1, $2, $3, $4, NOW()) RETURNING *`,
      [order_id, payment_method, payment_status || 'pending', amount]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── CHANGE PASSWORD ────────────────────────────────
app.post('/api/auth/change-password', async (req, res) => {
  try {
    const { customer_id, current_password, new_password } = req.body;
    
    // Get user record
    const userResult = await pool.query(
      'SELECT * FROM users WHERE customerid = $1',
      [customer_id]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Verify current password (simple comparison - in production use bcrypt)
    const storedHash = userResult.rows[0].password_hash;
    if (storedHash !== current_password) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }
    
    // Update password
    await pool.query(
      'UPDATE users SET password_hash = $1 WHERE customerid = $2',
      [new_password, customer_id]
    );
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── START SERVER ────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});