-- ================================
-- E-COMMERCE DATABASE SCHEMA
-- ================================

-- 1. Customer Tiers
CREATE TABLE customer_tiers (
  tier_id     SERIAL PRIMARY KEY,
  tier_name   VARCHAR(100) NOT NULL,
  discount_pct INT,
  min_spend   INT
);

-- 2. Customers
CREATE TABLE customers (
  customer_id SERIAL PRIMARY KEY,
  tier_id     INT REFERENCES customer_tiers(tier_id),
  full_name   VARCHAR(150) NOT NULL,
  email       VARCHAR(150) UNIQUE NOT NULL,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- 3. Users (login accounts)
CREATE TABLE users (
  userid        SERIAL PRIMARY KEY,
  customerid    INT REFERENCES customers(customer_id),
  username      VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL
);

-- 4. Address
CREATE TABLE address (
  address_id  SERIAL PRIMARY KEY,
  customer_id INT REFERENCES customers(customer_id),
  street      VARCHAR(255),
  city        VARCHAR(100),
  country     VARCHAR(100),
  is_default  VARCHAR(10)
);

-- 5. Currencies
CREATE TABLE currencies (
  currency_id   SERIAL PRIMARY KEY,
  currency_code VARCHAR(10) NOT NULL,
  currency_name VARCHAR(100),
  symbol        VARCHAR(10)
);

-- 6. Exchange Rates
CREATE TABLE exchange_rates (
  rate_id          SERIAL PRIMARY KEY,
  from_currency_id INT REFERENCES currencies(currency_id),
  to_currency_id   INT REFERENCES currencies(currency_id),
  rate             DECIMAL(18,6) NOT NULL,
  effective_date   TIMESTAMP DEFAULT NOW()
);

-- 7. Category
CREATE TABLE category (
  category_id     SERIAL PRIMARY KEY,
  category_name   VARCHAR(150) NOT NULL,
  parent_category INT REFERENCES category(category_id)
);

-- 8. Attributes
CREATE TABLE attributes (
  attribute_id   SERIAL PRIMARY KEY,
  attribute_name VARCHAR(100) NOT NULL,
  data_type      VARCHAR(50),
  unit           VARCHAR(50)
);

-- 9. Products
CREATE TABLE products (
  product_id   SERIAL PRIMARY KEY,
  sku          VARCHAR(100) UNIQUE,
  product_name VARCHAR(200) NOT NULL,
  base_price   DECIMAL(12,2) NOT NULL,
  is_active    BOOLEAN DEFAULT TRUE
);

-- 10. Product Images
CREATE TABLE product_images (
  image_id   SERIAL PRIMARY KEY,
  product_id INT REFERENCES products(product_id),
  image_url  VARCHAR(500),
  is_primary VARCHAR(10)
);

-- 11. Product Attributes (junction)
CREATE TABLE product_attributes (
  product_id   INT REFERENCES products(product_id),
  attribute_id INT REFERENCES attributes(attribute_id),
  value        VARCHAR(255),
  PRIMARY KEY (product_id, attribute_id)
);

-- 12. Warehouses
CREATE TABLE warehouses (
  warehouse_id   SERIAL PRIMARY KEY,
  warehouse_code VARCHAR(50) UNIQUE,
  location       VARCHAR(200),
  capacity       INT
);

-- 13. Inventory
CREATE TABLE inventory (
  inventory_id SERIAL PRIMARY KEY,
  warehouse_id INT REFERENCES warehouses(warehouse_id),
  product_id   INT REFERENCES products(product_id),
  quantity     INT DEFAULT 0,
  last_updated TIMESTAMP DEFAULT NOW()
);

-- 14. Coupons
CREATE TABLE coupons (
  coupon_id        SERIAL PRIMARY KEY,
  code             VARCHAR(50) UNIQUE NOT NULL,
  discount_product INT,
  expiry_date      TIMESTAMP,
  is_active        INT DEFAULT 1
);

-- 15. Orders
CREATE TABLE orders (
  order_id     SERIAL PRIMARY KEY,
  customer_id  INT REFERENCES customers(customer_id),
  currency_id  INT REFERENCES currencies(currency_id),
  order_date   TIMESTAMP DEFAULT NOW(),
  status       VARCHAR(50),
  total_amount INT
);

-- 16. Order Items
CREATE TABLE order_items (
  order_item_id SERIAL PRIMARY KEY,
  order_id      INT REFERENCES orders(order_id),
  product_id    INT REFERENCES products(product_id),
  quantity      INT NOT NULL,
  unit_price    INT NOT NULL,
  discount      INT DEFAULT 0
);

-- 17. Payment
CREATE TABLE payment (
  payment_id     SERIAL PRIMARY KEY,
  order_id       INT REFERENCES orders(order_id),
  payment_method VARCHAR(100),
  payment_status VARCHAR(50),
  amount         DECIMAL(12,2),
  paid_at        TIMESTAMP
);

-- 18. Deliveries
CREATE TABLE deliveries (
  delivery_id     SERIAL PRIMARY KEY,
  order_id        INT REFERENCES orders(order_id),
  address         VARCHAR(255),
  delivery_status VARCHAR(50),
  shipped_at      TIMESTAMP,
  delivery_at     TIMESTAMP
);

-- 19. Cart
CREATE TABLE cart (
  card_id     SERIAL PRIMARY KEY,
  customer_id INT REFERENCES customers(customer_id),
  product_id  INT REFERENCES products(product_id),
  quantity    VARCHAR(50),
  added_at    TIMESTAMP DEFAULT NOW()
);

-- 20. Reviews
CREATE TABLE reviews (
  review_id   SERIAL PRIMARY KEY,
  product_id  INT REFERENCES products(product_id),
  customer_id INT REFERENCES customers(customer_id),
  rating      INT,
  comment     INT,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- 21. Notification
CREATE TABLE notification (
  notification_id SERIAL PRIMARY KEY,
  customer_id     INT REFERENCES customers(customer_id),
  message         VARCHAR(500),
  is_read         VARCHAR(10),
  created_at      TIMESTAMP DEFAULT NOW()
);

-- Done! All 21 tables created.