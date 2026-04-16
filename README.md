# EcoWise Market - Complete Guide

A sustainable eco-friendly e-commerce platform built with Node.js, Express, and PostgreSQL (Neon database).

---

## 🚀 Getting Started

### Running the Server
```bash
cd ER-Diagram-Database
node server.js
```
Server runs on **http://localhost:3000**

---

# 🏠 HOME PAGE GUIDE

## Navigation Bar (Top)

| Element | Function |
|---------|----------|
| **eco-wise logo** | Click to go to home page |
| **Search bar** | Search products by name |
| **Search button** | Execute search |
| **Hello, sign in** | Go to login page |
| **Account & Lists** | Go to account (if logged in) |
| **Cart icon** | Open cart sidebar |
| **Cart count** | Show number of items in cart |

## Category Strip

| Link | Function |
|------|----------|
| **All** | Show all products |
| **Eco Home** | Filter eco home products |
| **Organic Food** | Filter food products |
| **Fashion** | Filter fashion items |
| **Zero Waste** | Filter zero waste items |
| **Green Tech** | Filter tech products |
| **Beauty** | Filter beauty products |
| **Kitchen** | Filter kitchen items |
| **Our Impact** | Scroll to impact section |
| **Account** | Go to account (requires login) |
| **Admin** | Go to login (admin verification) |

## Hero Section

- **"Shop with the Planet in Mind"** - Main headline
- **Shop Today's Deals** - Scroll to featured products
- **Browse Categories** - Scroll to category section

## Marquee (Scrolling Text)

Shows certifications: FAIR TRADE CERTIFIED, ZERO-WASTE PACKAGING, B CORP PRODUCTS, CARBON OFFSET SHIPPING, USDA ORGANIC, ETHICAL SOURCING

## Shop by Category

- **Category boxes** - Click to filter products by that category
- Each shows an emoji icon and category name

## Featured Products

| Element | Function |
|---------|----------|
| **Product image** | Product picture or emoji |
| **Product name** | Product title |
| **Price** | Price in FCAF |
| **CO₂ badge** | Environmental impact |
| **Add to Cart** | Add product to cart (requires login) |
| **Details** | View full product details (requires login) |

## Cart Sidebar

| Element | Function |
|---------|----------|
| **Close button (×)** | Close cart sidebar |
| **Quantity +/-** | Change product quantity |
| **Delete** | Remove item from cart |
| **Cart Total** | Total price in FCAF |
| **Proceed to Checkout** | Go to checkout (requires login) |

## Why Shop EcoWise? (Feature Cards)

Click each card to see popup with info:
- **Carbon Footprint Tracker** - Track environmental impact
- **Verified Badges** - Fair Trade, B Corp info
- **Eco Shipping** - Carbon-neutral delivery
- **Easy Returns** - 30-day return policy

## Customer Reviews

Shows customer feedback with star ratings and "Verified" badges

## Newsletter Signup

- **Email input** - Enter your email
- **Subscribe** - Submit email

## Footer Sections

| Section | Links |
|---------|-------|
| **Know Your Impact** | Carbon Tracker, Impact Dashboard |
| **Shop** | All Products, Categories, Today's Deals |
| **Company** | About Us, Our Mission, Careers |
| **Help** | Customer Service, Shipping, Returns |

---

# 🔐 AUTHENTICATION SYSTEM

## User Roles

| Role | Access Level |
|------|-------------|
| **Guest** | Browse only |
| **User** | Full shopping |
| **Admin** | Full shopping + Admin panel |

## Login Credentials

### Admin Account (Pre-created)
```
Email: admin@ecowise.com
Password: admin123
```

### User Account (Create yourself)
1. Go to /signup.html
2. Fill in name, email, password
3. Click "Create Account"
4. Then login at /login.html

## What Happens When You Click

### ❌ Guest (Not Logged In)

| Action | Result |
|--------|--------|
| Browse products | ✅ Works |
| Search products | ✅ Works |
| Add to Cart | → Redirects to login |
| Details button | → Redirects to login |
| Account link | → Redirects to login |
| Checkout | → Redirects to login |
| Admin | → Redirects to login |

### ✅ Logged In (User)

| Action | Result |
|--------|--------|
| Browse products | ✅ Works |
| Add to Cart | ✅ Added |
| View Details | ✅ Shows modal |
| Account | ✅ Goes to account |
| Checkout | ✅ Goes to checkout |
| Admin | ❌ Shows error |

### ✅ Logged In (Admin)

| Action | Result |
|--------|--------|
| All user features | ✅ Works |
| Admin link | ✅ Goes to admin panel |

## Access Control Points

All these places check if user is logged in:
1. **Add to Cart button** - home.html
2. **Details button** - home.html
3. **Cart checkout** - home.html
4. **Account page** - account.html
5. **Checkout page** - checkout.html
6. **Admin link** - home.html
7. **Admin pages** - admin.html, admin-products.html

## How Login Works (Step by Step)

1. Enter email and password
2. Click "Sign In"
3. Server checks database
4. If correct, server returns user info
5. Browser saves to localStorage:
   - `isLoggedIn` = "true"
   - `userEmail` = your email
   - `userName` = your name
   - `userRole` = "user" or "admin"
   - `customerId` = your ID
6. Redirect based on role

## Logout

- Click "Logout" button
- All localStorage cleared
- You become a guest again

---

# 🛒 FEATURES

## 1. Home Page (home.html)
- Amazon-style layout with forest green theme
- Product grid from database
- Category navigation
- Search functionality
- Cart sidebar
- Impact statistics

## 2. Login (login.html)
- Email/password authentication
- Role-based redirects
- Error messages

## 3. Signup (signup.html)
- Create new account
- Auto-assigns Bronze tier

## 4. Product Details (product-detail.html or modal)
- Full product info
- Image display
- Price in FCAF
- Add to cart button

## 5. Account (account.html)
- View profile
- Order history
- Address management
- Password change

## 6. Checkout (checkout.html)
- Select address
- Select payment method
- Place order
- Order confirmation

## 7. Admin Panel (admin-products.html / admin.html)
- Add products with image upload
- Edit products
- Delete products
- View all orders
- View customers
- Reports

---

# 💾 DATABASE TABLES

| Table | Purpose |
|------|---------|
| customers | User profiles |
| users | Login credentials |
| customer_tiers | Bronze, Silver, Gold |
| products | Product catalog |
| product_images | Product images |
| category | Categories |
| orders | Customer orders |
| order_items | Order line items |
| cart | Shopping cart |
| address | Delivery addresses |
| payments | Payment records |

---

# 🎨 DESIGN

## Colors (Forest Green Theme)
- `#228B22` - Natural Green (primary)
- `#2E8B57` - Forest Green
- `#6B8E23` - Olive Green
- `#9CAF88` - Sage Green

## Currency
- **FCAF** (XOF - West African CFA franc)

---

# 📁 KEY FILES

```
ER-Diagram-Database/
├── server.js           # Express server
├── .env              # Database config
├── public/
│   ├── home.html    # Main store
│   ├── login.html   # Login
│   ├── signup.html # Register
│   ├── account.html # Account
│   ├── checkout.html # Checkout
│   ├── admin-products.html # Product management
│   ├── admin.html  # Admin page
│   └── uploads/   # Product images
```

---

# 🔗 API ENDPOINTS

## Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Signup
- `GET /api/auth/me` - Current user

## Products
- `GET /api/products` - All products
- `POST /api/products` - Add product
- `PUT /api/products/:id` - Update
- `DELETE /api/products/:id` - Delete

## Cart
- `GET /api/cart/:id` - Get cart
- `POST /api/cart` - Add to cart
- `PUT /api/cart/:c/:p` - Update qty
- `DELETE /api/cart/:c/:p` - Remove

## Orders
- `GET /api/orders` - All orders
- `POST /api/orders` - Create order

---

# 🧪 HOW TO TEST

1. Start server: `node server.js`
2. Open: http://localhost:3000/home.html

### Test Guest
- Browse products ✅
- Click Add to Cart → Should go to login

### Test User
- Sign up at /signup.html
- Login at /login.html
- Add to cart → Should work

### Test Admin
- Login: admin@ecowise.com / admin123
- Click Admin → Should go to admin panel

### Test User accessing Admin
- Login as regular user
- Click Admin → Should show error

---

# 👥 TEAM NOTES

- **Images**: Uploaded to /public/uploads/, URLs saved in database
- **Admin verification**: Every admin click redirects to login
- **Order creation**: Automatically creates delivery and payment records
- **Role check**: If not admin, cannot access admin panel
- **Passwords**: Stored in plain text (demo only - use hashing in production)