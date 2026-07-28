const express = require('express');
const cors = require('cors');
const { readDb, saveDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Helper to get fresh database state
const getDb = () => readDb();

// Routes

// -------------------------------------------------------------
// 1. PRODUCTS & CATEGORIES API
// -------------------------------------------------------------
app.get('/api/products', (req, res) => {
  const db = getDb();
  let products = db.products || [];
  const { category, search, brand } = req.query;

  if (category) {
    const catLower = String(category).toLowerCase();
    products = products.filter(p => (p.category || '').toLowerCase().includes(catLower));
  }

  if (brand) {
    const brandLower = String(brand).toLowerCase();
    products = products.filter(p => (p.brand || '').toLowerCase().includes(brandLower));
  }

  if (search) {
    const searchLower = String(search).toLowerCase();
    products = products.filter(p => 
      (p.name || '').toLowerCase().includes(searchLower) ||
      (p.description || '').toLowerCase().includes(searchLower) ||
      (p.brand || '').toLowerCase().includes(searchLower) ||
      (p.sku || '').toLowerCase().includes(searchLower)
    );
  }

  res.json(products);
});

app.get('/api/categories', (req, res) => {
  const db = getDb();
  const categoryCounts = {};
  (db.products || []).forEach(p => {
    const cat = p.category || 'Uncategorized';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });
  res.json(categoryCounts);
});

app.get('/api/products/:id', (req, res) => {
  const db = getDb();
  const product = db.products.find(p => p.id === parseInt(req.params.id));
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ error: "Product not found" });
  }
});

app.post('/api/products', (req, res) => {
  const db = getDb();
  const { name, price } = req.body;
  if (!name || !price) {
    return res.status(400).json({ error: 'Name and price are required' });
  }

  let newProduct = {
    id: Date.now(),
    ...req.body,
    price: Number(price),
    originalPrice: req.body.originalPrice ? Number(req.body.originalPrice) : null,
    image: req.body.image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
    rating: req.body.rating || "5.0 (1 review)",
    ratingValue: req.body.ratingValue || 5.0,
    category: req.body.category || "electronics",
    inStock: req.body.inStock !== undefined ? req.body.inStock : true
  };
  db.products.unshift(newProduct);
  saveDb(db);
  res.status(201).json(newProduct);
});

app.put('/api/products/:id', (req, res) => {
  const db = getDb();
  const id = parseInt(req.params.id);
  
  const idx = db.products.findIndex(p => p.id === id);
  if (idx !== -1) {
    db.products[idx] = {
      ...db.products[idx],
      ...req.body,
      price: req.body.price ? Number(req.body.price) : db.products[idx].price,
      originalPrice: req.body.originalPrice ? Number(req.body.originalPrice) : db.products[idx].originalPrice,
    };
    saveDb(db);
    res.json(db.products[idx]);
  } else {
    res.status(404).json({ error: "Product not found" });
  }
});

app.delete('/api/products/:id', (req, res) => {
  const db = getDb();
  const id = parseInt(req.params.id);
  const index = db.products.findIndex(p => p.id === id);
  
  if (index !== -1) {
    db.products.splice(index, 1);
    saveDb(db);
    res.status(204).send();
  } else {
    res.status(404).json({ error: "Product not found" });
  }
});

app.patch('/api/products/:id/toggle-stock', (req, res) => {
  const db = getDb();
  const id = parseInt(req.params.id);
  const idx = db.products.findIndex(p => p.id === id);
  if (idx !== -1) {
    if (req.body.inStock !== undefined) {
      db.products[idx].inStock = Boolean(req.body.inStock);
    } else {
      db.products[idx].inStock = !db.products[idx].inStock;
    }
    saveDb(db);
    return res.json(db.products[idx]);
  }
  res.status(404).json({ error: "Product not found" });
});

// Post review for product
app.post('/api/products/:id/reviews', (req, res) => {
  const db = getDb();
  const id = parseInt(req.params.id);
  const { username, rating, comment } = req.body;

  const idx = db.products.findIndex(p => p.id === id);
  if (idx !== -1) {
    const product = db.products[idx];
    if (!product.customerReviews) product.customerReviews = [];

    const newReview = {
      id: Date.now(),
      username: username || 'Anonymous',
      rating: Number(rating) || 5,
      date: new Date().toISOString().split('T')[0],
      comment: comment || ''
    };

    product.customerReviews.unshift(newReview);
    saveDb(db);
    res.status(201).json({ message: 'Review added successfully', review: newReview, reviews: product.customerReviews });
  } else {
    res.status(404).json({ error: "Product not found" });
  }
});

// -------------------------------------------------------------
// 2. YOUR CUSTOM API ROUTE (/api/custom-items)
// -------------------------------------------------------------
app.get('/api/custom-items', (req, res) => {
  const db = getDb();
  res.json(db.customItems || []);
});

app.post('/api/custom-items', (req, res) => {
  const db = getDb();
  const { title, category, status } = req.body;
  if (!title) {
    return res.status(400).json({ error: "Title is required for custom items!" });
  }

  const newItem = {
    id: Date.now(),
    title,
    category: category || "General",
    status: status || "Active"
  };

  if (!db.customItems) db.customItems = [];
  db.customItems.unshift(newItem);
  saveDb(db);

  res.status(201).json({ message: "Custom item created successfully!", item: newItem });
});

app.delete('/api/custom-items/:id', (req, res) => {
  const db = getDb();
  const id = Number(req.params.id);
  const initialLength = (db.customItems || []).length;
  db.customItems = (db.customItems || []).filter(item => item.id !== id);

  if (db.customItems.length < initialLength) {
    saveDb(db);
    res.status(200).json({ message: "Custom item deleted successfully!" });
  } else {
    res.status(404).json({ error: "Custom item not found" });
  }
});

// -------------------------------------------------------------
// 3. ANALYTICS API (/api/analytics)
// -------------------------------------------------------------
app.get('/api/analytics', (req, res) => {
  const db = getDb();
  const totalProducts = db.products.length;
  const inStockCount = db.products.filter(p => p.inStock !== false).length;
  const outOfStockCount = db.products.filter(p => p.inStock === false).length;
  const totalRevenue = db.orders.reduce((sum, o) => {
    const num = parseFloat(String(o.amount).replace('$', '')) || 0;
    return sum + num;
  }, 0);

  const categoryBreakdown = {};
  db.products.forEach(p => {
    const cat = p.category || 'other';
    categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + 1;
  });

  res.json({
    totalProducts,
    inStockCount,
    outOfStockCount,
    totalOrders: db.orders.length,
    totalRevenue: `$${totalRevenue.toFixed(2)}`,
    categoryBreakdown
  });
});

// -------------------------------------------------------------
// 4. ORDERS API
// -------------------------------------------------------------
app.get('/api/orders', (req, res) => {
  const db = getDb();
  const { username } = req.query;
  if (username) {
    const userOrders = db.orders.filter(o => o.customer === username);
    return res.json(userOrders);
  }
  res.json(db.orders);
});

app.post('/api/orders', (req, res) => {
  const db = getDb();
  const { customer, product, amount, status } = req.body;
  if (!customer || !product || !amount) {
    return res.status(400).json({ error: "Missing required order fields" });
  }
  const newOrder = {
    id: `#ORD-${String(db.orders.length + 1).padStart(3, '0')}`,
    customer,
    product,
    amount,
    status: status || 'Processing',
    date: new Date().toISOString().split('T')[0]
  };
  db.orders.unshift(newOrder);
  saveDb(db);
  res.status(201).json(newOrder);
});

app.put('/api/orders/:id/status', (req, res) => {
  const db = getDb();
  const { id } = req.params;
  const { status } = req.body;
  const order = db.orders.find(o => o.id === id || o.id === `#${id}` || o.id.replace('#', '') === id);
  if (order) {
    order.status = status;
    saveDb(db);
    return res.json(order);
  }
  res.status(404).json({ error: "Order not found" });
});

// -------------------------------------------------------------
// 5. WISHLIST API
// -------------------------------------------------------------
app.get('/api/wishlist', (req, res) => {
  const db = getDb();
  const { username } = req.query;
  if (!username) {
    return res.status(400).json({ error: "Username query parameter is required" });
  }
  const userWishlist = db.wishlists.filter(w => w.username === username);
  const wishlistedProducts = db.products.filter(p => userWishlist.some(w => w.productId === p.id));
  res.json(wishlistedProducts);
});

app.post('/api/wishlist', (req, res) => {
  const db = getDb();
  const { username, productId } = req.body;
  if (!username || !productId) {
    return res.status(400).json({ error: "Username and productId are required" });
  }
  const exists = db.wishlists.some(w => w.username === username && w.productId === Number(productId));
  if (!exists) {
    db.wishlists.push({ id: Date.now(), username, productId: Number(productId), createdAt: new Date().toISOString() });
    saveDb(db);
  }
  res.status(201).json({ message: "Product added to wishlist" });
});

app.delete('/api/wishlist', (req, res) => {
  const db = getDb();
  const { username, productId } = req.body;
  db.wishlists = db.wishlists.filter(w => !(w.username === username && w.productId === Number(productId)));
  saveDb(db);
  res.status(200).json({ message: "Product removed from wishlist" });
});

// -------------------------------------------------------------
// 6. COUPONS API
// -------------------------------------------------------------
app.post('/api/coupons/validate', (req, res) => {
  const db = getDb();
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ error: "Coupon code is required" });
  }
  const coupon = db.coupons.find(c => c.code.toUpperCase() === String(code).toUpperCase() && c.active);
  if (coupon) {
    res.json({ valid: true, discountPercent: coupon.discountPercent, code: coupon.code });
  } else {
    res.status(404).json({ valid: false, error: "Invalid or expired coupon code" });
  }
});

// -------------------------------------------------------------
// 7. SETTINGS & AUTH API
// -------------------------------------------------------------
app.get('/api/settings', (req, res) => {
  const db = getDb();
  res.json(db.storeSettings);
});

app.put('/api/settings', (req, res) => {
  const db = getDb();
  db.storeSettings = { ...db.storeSettings, ...req.body };
  saveDb(db);
  res.json(db.storeSettings);
});

app.post('/api/register', (req, res) => {
  const db = getDb();
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }
  const existingUser = db.users.find(u => u.username === username);
  if (existingUser) {
    return res.status(400).json({ error: "Username already exists" });
  }
  
  const newUser = { username, password, role: 'user' };
  db.users.push(newUser);
  saveDb(db);
  res.status(201).json({ message: "Registration successful", user: { username: newUser.username, role: newUser.role } });
});

app.post('/api/login', (req, res) => {
  const db = getDb();
  const { username, password } = req.body;
  const user = db.users.find(u => u.username === username && u.password === password);
  if (user) {
    res.json({ message: "Login successful", user: { username: user.username, role: user.role } });
  } else {
    res.status(401).json({ error: "Invalid username or password" });
  }
});

app.get('/api/users', (req, res) => {
  const db = getDb();
  const safeUsers = db.users.map(u => ({ username: u.username }));
  res.json(safeUsers);
});

app.delete('/api/users/:username', (req, res) => {
  const db = getDb();
  const { username } = req.params;
  const initialLength = db.users.length;
  db.users = db.users.filter(u => u.username !== username);
  
  if (db.users.length < initialLength) {
    saveDb(db);
    res.status(204).send();
  } else {
    res.status(404).json({ error: "User not found" });
  }
});

// Start server if run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

module.exports = app;
