# ER-Diagram-Database
An entity‑relationship diagram that displays the entities and attributes for an e‑commerce website.

# Ecowise Database Schema

This document describes the database schema for the GlobalMart e‑commerce platform, called Ecowise. It includes all tables, their columns, primary keys, foreign keys, and relationships.

The accompanying Node/Express server serves a static welcome page located under `public/WelcomePage`. When running, visiting `http://localhost:3000` returns `welcome.html`; the server no longer expects `public/index.html`.

---

## Tables

### Customers
| Column       | Type      | Constraints | Description               |
|--------------|-----------|-------------|---------------------------|
| customer_id  | serial    | PRIMARY KEY | Unique customer identifier |
| tier_id      | int       | FOREIGN KEY | References `customer_tiers(tier_id)` |
| full_name    | varchar   | NOT NULL    | Customer's full name       |
| email        | varchar   | UNIQUE      | Email address              |
| created_at   | timestamp |             | Registration timestamp     |

---

### Customer_Tiers
| Column       | Type      | Constraints | Description               |
|--------------|-----------|-------------|---------------------------|
| tier_id      | serial    | PRIMARY KEY | Unique tier identifier     |
| tier_name    | varchar   | NOT NULL    | e.g., Bronze, Silver, Gold |
| discount_pct | int       |             | Discount percentage        |
| min_spend    | int       |             | Minimum spend to qualify   |

---

### Orders
| Column       | Type      | Constraints | Description               |
|--------------|-----------|-------------|---------------------------|
| order_id     | serial    | PRIMARY KEY | Unique order identifier    |
| customer_id  | int       | FOREIGN KEY | References `customers(customer_id)` |
| currency_id  | int       | FOREIGN KEY | References `currencies(currency_id)` |
| order_date   | timestamp | NOT NULL    | Date and time of order     |
| status       | varchar   |             | e.g., Pending, Shipped     |
| total_amount | int       |             | Total order amount         |

---

### Products
| Column       | Type      | Constraints | Description               |
|--------------|-----------|-------------|---------------------------|
| product_id   | serial    | PRIMARY KEY | Unique product identifier  |
| sku          | varchar   | UNIQUE      | Stock keeping unit         |
| product_name | varchar   | NOT NULL    | Product name               |
| base_price   | decimal   | NOT NULL    | Price in default currency  |
| is_active    | boolean   |             | Whether product is active  |

---

### Attributes
| Column         | Type      | Constraints | Description               |
|----------------|-----------|-------------|---------------------------|
| attribute_id   | serial    | PRIMARY KEY | Unique attribute identifier|
| attribute_name | varchar   | NOT NULL    | e.g., Color, Size         |
| data_type      | varchar   |             | Type of attribute value    |
| unit           | varchar   |             | Unit of measurement        |

---

### Product_Attributes
| Column       | Type      | Constraints                     | Description               |
|--------------|-----------|---------------------------------|---------------------------|
| product_id   | int       | PRIMARY KEY, FOREIGN KEY (Products) | References `products(product_id)` |
| attribute_id | int       | PRIMARY KEY, FOREIGN KEY (Attributes) | References `attributes(attribute_id)` |
| value        | varchar   | NOT NULL                        | Actual attribute value     |

This table resolves the many‑to‑many relationship between products and attributes.

---

### Warehouses
| Column         | Type      | Constraints | Description               |
|----------------|-----------|-------------|---------------------------|
| warehouse_id   | serial    | PRIMARY KEY | Unique warehouse identifier|
| warehouse_code | varchar   | NOT NULL    | Short code for warehouse   |
| location       | varchar   |             | Physical location          |
| capacity       | int       |             | Maximum storage units      |

---

### Inventory
| Column       | Type      | Constraints | Description               |
|--------------|-----------|-------------|---------------------------|
| inventory_id | serial    | PRIMARY KEY | Unique inventory record    |
| warehouse_id | int       | FOREIGN KEY | References `warehouses(warehouse_id)` |
| product_id   | int       | FOREIGN KEY | References `products(product_id)` |
| quantity     | int       | NOT NULL    | Stock count                |
| last_updated | timestamp |             | Last stock update          |

Each product can be stored in multiple warehouses; this table tracks stock per warehouse.

---

### Order_Items
| Column        | Type      | Constraints | Description               |
|---------------|-----------|-------------|---------------------------|
| order_item_id | serial    | PRIMARY KEY | Unique line item identifier|
| order_id      | int       | FOREIGN KEY | References `orders(order_id)` |
| product_id    | int       | FOREIGN KEY | References `products(product_id)` |
| quantity      | int       | NOT NULL    | Number of units            |
| unit_price    | int       | NOT NULL    | Price at time of order     |
| discount      | int       |             | Discount applied           |

---

### Currencies
| Column       | Type      | Constraints | Description               |
|--------------|-----------|-------------|---------------------------|
| currency_id  | serial    | PRIMARY KEY | Unique currency identifier |
| currency_code| varchar(3)| NOT NULL    | e.g., USD, EUR             |
| currency_name| varchar   | NOT NULL    | Full name                  |
| symbol       | varchar   |             | e.g., $, €                 |

---

### Exchange_Rates
| Column            | Type      | Constraints | Description               |
|-------------------|-----------|-------------|---------------------------|
| rate_id           | serial    | PRIMARY KEY | Unique rate identifier     |
| from_currency_id  | int       | FOREIGN KEY | References `currencies(currency_id)` |
| to_currency_id    | int       | FOREIGN KEY | References `currencies(currency_id)` |
| rate              | decimal   | NOT NULL    | Conversion rate            |
| effective_date    | timestamp | NOT NULL    | Date when rate becomes valid|

This table records exchange rates between currencies over time.

---

## Relationships Summary

| Table (Child)    | Foreign Key         | References (Parent) | Cardinality |
|------------------|----------------------|----------------------|-------------|
| Customers        | tier_id              | Customer_Tiers       | N:1         |
| Orders           | customer_id          | Customers            | N:1         |
| Orders           | currency_id          | Currencies           | N:1         |
| Product_Attributes | product_id         | Products             | N:1         |
| Product_Attributes | attribute_id       | Attributes           | N:1         |
| Inventory        | warehouse_id         | Warehouses           | N:1         |
| Inventory        | product_id           | Products             | N:1         |
| Order_Items      | order_id             | Orders               | N:1         |
| Order_Items      | product_id           | Products             | N:1         |
| Exchange_Rates   | from_currency_id     | Currencies           | N:1         |
| Exchange_Rates   | to_currency_id       | Currencies           | N:1         |

---

## Notes

- All primary keys use the `serial` type (auto‑incrementing integer).
- Foreign key constraints maintain referential integrity.
- The `Product_Attributes` table implements a many‑to‑many relationship between products and attributes.
- `Exchange_Rates` supports historical currency conversion by storing rates with an effective date.
- The schema is designed to support core e‑commerce functionality: customers, orders, products, inventory, and multi‑currency.
