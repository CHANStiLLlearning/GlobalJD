const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Universal CORS middleware — guarantees CORS headers on ALL requests (including errors & cold starts)
const ALLOWED_ORIGINS = [
  'https://global-jd.vercel.app',
  'https://global-c1bb2r632-chanstilllearnings-projects.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000'
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  // Allow all vercel.app subdomains + explicit origins
  if (!origin || ALLOWED_ORIGINS.includes(origin) || /\.vercel\.app$/.test(origin)) {
    res.header('Access-Control-Allow-Origin', origin || '*');
  } else {
    res.header('Access-Control-Allow-Origin', '*');
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin) || /\.vercel\.app$/.test(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all for now; tighten in production
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));

app.use(express.json());

// Helper — pick between Supabase and JSON file fallback
const useSupabase = () => db.useSupabase();

// ---------------------------------------------------------------
// 1. PRODUCTS API
// ---------------------------------------------------------------
app.get('/api/products', async (req, res) => {
  try {
    let products;
    if (useSupabase()) {
      products = await db.getProducts();
    } else {
      const data = db.readJsonFallback();
      products = data.products || [];
    }

    const { category, search, brand } = req.query;
    if (category) {
      const c = category.toLowerCase();
      products = products.filter(p => (p.category || '').toLowerCase().includes(c));
    }
    if (brand) {
      const b = brand.toLowerCase();
      products = products.filter(p => (p.brand || '').toLowerCase().includes(b));
    }
    if (search) {
      const s = search.toLowerCase();
      products = products.filter(p =>
        (p.name || '').toLowerCase().includes(s) ||
        (p.description || '').toLowerCase().includes(s) ||
        (p.brand || '').toLowerCase().includes(s) ||
        (p.sku || '').toLowerCase().includes(s)
      );
    }
    res.json(products);
  } catch (err) {
    console.error('GET /api/products error:', err.message);
    res.status(500).json({ error: 'Failed to fetch products', details: err.message });
  }
});

app.get('/api/categories', async (req, res) => {
  try {
    const products = useSupabase() ? await db.getProducts() : (db.readJsonFallback().products || []);
    const counts = {};
    products.forEach(p => {
      const cat = p.category || 'Uncategorized';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    res.json(counts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories', details: err.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const products = useSupabase() ? await db.getProducts() : (db.readJsonFallback().products || []);
    const product = products.find(p => p.id === id);
    if (product) return res.json(product);
    res.status(404).json({ error: 'Product not found' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch product', details: err.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const { name, price } = req.body;
    if (!name || !price) return res.status(400).json({ error: 'Name and price are required' });

    const newProduct = {
      id: Date.now(),
      ...req.body,
      price: Number(price),
      originalPrice: req.body.originalPrice ? Number(req.body.originalPrice) : null,
      image: req.body.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      rating: req.body.rating || '5.0 (1 review)',
      ratingValue: req.body.ratingValue || 5.0,
      category: req.body.category || 'electronics',
      inStock: req.body.inStock !== undefined ? req.body.inStock : true
    };

    if (useSupabase()) {
      const saved = await db.upsertProduct(newProduct);
      return res.status(201).json(saved);
    } else {
      const data = db.readJsonFallback();
      data.products.unshift(newProduct);
      db.saveJsonFallback(data);
      return res.status(201).json(newProduct);
    }
  } catch (err) {
    console.error('POST /api/products error:', err.message);
    res.status(500).json({ error: 'Failed to create product', details: err.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (useSupabase()) {
      const products = await db.getProducts();
      const existing = products.find(p => p.id === id);
      if (!existing) return res.status(404).json({ error: 'Product not found' });

      const updated = {
        ...existing,
        ...req.body,
        id,
        price: req.body.price ? Number(req.body.price) : existing.price,
        originalPrice: req.body.originalPrice ? Number(req.body.originalPrice) : existing.originalPrice,
      };
      const saved = await db.upsertProduct(updated);
      return res.json(saved);
    } else {
      const data = db.readJsonFallback();
      const idx = data.products.findIndex(p => p.id === id);
      if (idx === -1) return res.status(404).json({ error: 'Product not found' });
      data.products[idx] = {
        ...data.products[idx],
        ...req.body,
        price: req.body.price ? Number(req.body.price) : data.products[idx].price,
        originalPrice: req.body.originalPrice ? Number(req.body.originalPrice) : data.products[idx].originalPrice,
      };
      db.saveJsonFallback(data);
      return res.json(data.products[idx]);
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to update product', details: err.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (useSupabase()) {
      await db.deleteProduct(id);
      return res.status(204).send();
    } else {
      const data = db.readJsonFallback();
      const idx = data.products.findIndex(p => p.id === id);
      if (idx === -1) return res.status(404).json({ error: 'Product not found' });
      data.products.splice(idx, 1);
      db.saveJsonFallback(data);
      return res.status(204).send();
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete product', details: err.message });
  }
});

app.patch('/api/products/:id/toggle-stock', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (useSupabase()) {
      const products = await db.getProducts();
      const prod = products.find(p => p.id === id);
      if (!prod) return res.status(404).json({ error: 'Product not found' });
      const newStock = req.body.inStock !== undefined ? Boolean(req.body.inStock) : !prod.inStock;
      const saved = await db.upsertProduct({ ...prod, inStock: newStock });
      return res.json(saved);
    } else {
      const data = db.readJsonFallback();
      const idx = data.products.findIndex(p => p.id === id);
      if (idx === -1) return res.status(404).json({ error: 'Product not found' });
      data.products[idx].inStock = req.body.inStock !== undefined ? Boolean(req.body.inStock) : !data.products[idx].inStock;
      db.saveJsonFallback(data);
      return res.json(data.products[idx]);
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle stock', details: err.message });
  }
});

app.patch('/api/products/:id/flash-deal', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const products = useSupabase() ? await db.getProducts() : (db.readJsonFallback().products || []);
    const prod = products.find(p => p.id === id);
    if (!prod) return res.status(404).json({ error: 'Product not found' });

    const { isFlashDeal, discountPercent } = req.body;
    if (isFlashDeal) {
      const pct = Number(discountPercent) || 20;
      const originalPrice = prod.originalPrice || Number(prod.price) || 100;
      const newPrice = Number((originalPrice * (1 - pct / 100)).toFixed(2));
      prod.discount = `${pct}% Off`;
      prod.originalPrice = originalPrice;
      prod.price = newPrice;
      prod.tag = { type: 'discount', label: `-${pct}%`, text: 'Flash Deal' };
    } else {
      prod.discount = null;
      if (prod.originalPrice) prod.price = prod.originalPrice;
      prod.tag = null;
    }

    if (useSupabase()) {
      const saved = await db.upsertProduct(prod);
      return res.json(saved);
    } else {
      const data = db.readJsonFallback();
      const idx = data.products.findIndex(p => p.id === id);
      data.products[idx] = prod;
      db.saveJsonFallback(data);
      return res.json(prod);
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to update flash deal', details: err.message });
  }
});

app.post('/api/products/:id/reviews', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { username, rating, comment } = req.body;
    const products = useSupabase() ? await db.getProducts() : (db.readJsonFallback().products || []);
    const prod = products.find(p => p.id === id);
    if (!prod) return res.status(404).json({ error: 'Product not found' });

    if (!prod.customerReviews) prod.customerReviews = [];
    const newReview = {
      id: Date.now(),
      username: username || 'Anonymous',
      rating: Number(rating) || 5,
      date: new Date().toISOString().split('T')[0],
      comment: comment || ''
    };
    prod.customerReviews.unshift(newReview);

    if (useSupabase()) {
      await db.upsertProduct(prod);
    } else {
      const data = db.readJsonFallback();
      const idx = data.products.findIndex(p => p.id === id);
      data.products[idx] = prod;
      db.saveJsonFallback(data);
    }
    res.status(201).json({ message: 'Review added successfully', review: newReview, reviews: prod.customerReviews });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add review', details: err.message });
  }
});

// ---------------------------------------------------------------
// 2. CUSTOM ITEMS API
// ---------------------------------------------------------------
app.get('/api/custom-items', async (req, res) => {
  try {
    if (useSupabase()) {
      return res.json(await db.getCustomItems());
    }
    res.json(db.readJsonFallback().customItems || []);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch custom items', details: err.message });
  }
});

app.post('/api/custom-items', async (req, res) => {
  try {
    const { title, category, status } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });
    const newItem = { id: Date.now(), title, category: category || 'General', status: status || 'Active' };

    if (useSupabase()) {
      const saved = await db.insertCustomItem(newItem);
      return res.status(201).json({ message: 'Custom item created!', item: saved });
    }
    const data = db.readJsonFallback();
    if (!data.customItems) data.customItems = [];
    data.customItems.unshift(newItem);
    db.saveJsonFallback(data);
    res.status(201).json({ message: 'Custom item created!', item: newItem });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create custom item', details: err.message });
  }
});

app.delete('/api/custom-items/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (useSupabase()) {
      await db.deleteCustomItem(id);
      return res.status(200).json({ message: 'Custom item deleted!' });
    }
    const data = db.readJsonFallback();
    data.customItems = (data.customItems || []).filter(i => i.id !== id);
    db.saveJsonFallback(data);
    res.status(200).json({ message: 'Custom item deleted!' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete custom item', details: err.message });
  }
});

// ---------------------------------------------------------------
// 3. ANALYTICS API
// ---------------------------------------------------------------
app.get('/api/analytics', async (req, res) => {
  try {
    const products = useSupabase() ? await db.getProducts() : (db.readJsonFallback().products || []);
    const orders = useSupabase() ? await db.getOrders() : (db.readJsonFallback().orders || []);

    const totalRevenue = orders.reduce((sum, o) => {
      return sum + (parseFloat(String(o.amount || '0').replace('$', '')) || 0);
    }, 0);
    const categoryBreakdown = {};
    products.forEach(p => {
      const cat = p.category || 'other';
      categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + 1;
    });

    res.json({
      totalProducts: products.length,
      inStockCount: products.filter(p => p.inStock !== false).length,
      outOfStockCount: products.filter(p => p.inStock === false).length,
      totalOrders: orders.length,
      totalRevenue: `$${totalRevenue.toFixed(2)}`,
      categoryBreakdown
    });
  } catch (err) {
    console.error('GET /api/analytics error:', err.message);
    res.status(500).json({ error: 'Failed to fetch analytics', details: err.message });
  }
});

// ---------------------------------------------------------------
// ADMIN DASHBOARD API (/api/admin/dashboard)
// ---------------------------------------------------------------
app.get('/api/admin/dashboard', async (req, res) => {
  try {
    const products = useSupabase() ? await db.getProducts() : (db.readJsonFallback().products || []);
    const orders = useSupabase() ? await db.getOrders() : (db.readJsonFallback().orders || []);
    const users = useSupabase() ? await db.getUsers() : (db.readJsonFallback().users || []);

    const totalOrders = orders.length;
    const totalCustomers = users.filter(u => u.role !== 'admin').length || users.length;
    const totalRevenue = orders.reduce((sum, o) => {
      const num = parseFloat(String(o.amount || o.total || '0').replace('$', '').replace(',', '')) || 0;
      return sum + num;
    }, 0);

    const recentOrders = orders.slice(0, 10).map(o => ({
      id: o.id,
      orderNumber: o.id || o.orderNumber,
      customer: o.customer,
      email: o.email || o.customer,
      product: o.product || 'Purchased Items',
      total: typeof o.amount === 'number' ? o.amount : parseFloat(String(o.amount || o.total || '0').replace('$', '')) || 0,
      amount: typeof o.amount === 'string' ? o.amount : `$${(o.amount || o.total || 0).toFixed(2)}`,
      status: o.status || 'Processing',
      createdAt: o.created_at || o.date || new Date().toISOString(),
      date: o.date || (o.created_at ? o.created_at.split('T')[0] : new Date().toISOString().split('T')[0])
    }));

    const responseData = {
      stats: {
        totalOrders,
        totalCustomers,
        totalRevenue: Number(totalRevenue.toFixed(2)),
        totalProducts: products.length,
        inStockCount: products.filter(p => p.inStock !== false).length,
        outOfStockCount: products.filter(p => p.inStock === false).length
      },
      recentOrders
    };

    console.log('[BACKEND DASHBOARD QUERY RESULTS]:', {
      totalOrders,
      totalCustomers,
      totalRevenue: responseData.stats.totalRevenue,
      recentOrdersCount: recentOrders.length
    });

    res.json(responseData);
  } catch (err) {
    console.error('GET /api/admin/dashboard error:', err.message);
    res.status(500).json({ error: 'Failed to fetch admin dashboard data', details: err.message });
  }
});

// ---------------------------------------------------------------
// 4. ORDERS API
// ---------------------------------------------------------------
app.get('/api/orders', async (req, res) => {
  try {
    const { username } = req.query;
    if (useSupabase()) {
      return res.json(await db.getOrders(username || null));
    }
    const orders = db.readJsonFallback().orders || [];
    res.json(username ? orders.filter(o => o.customer === username) : orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders', details: err.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { customer, product, amount, status } = req.body;
    if (!customer || !product || !amount) {
      console.warn('[BACKEND ORDER CREATION FAILED]: Missing required fields', req.body);
      return res.status(400).json({ error: 'Missing required order fields' });
    }

    const timestamp = Date.now().toString().slice(-5);
    const orderId = `#ORD-${timestamp}`;

    const newOrder = {
      id: orderId,
      customer: String(customer).trim(),
      product: String(product).trim(),
      amount: typeof amount === 'number' ? `$${amount.toFixed(2)}` : String(amount),
      status: status || 'Processing',
      date: new Date().toISOString().split('T')[0]
    };

    let saved;
    if (useSupabase()) {
      saved = await db.insertOrder(newOrder);
    } else {
      const data = db.readJsonFallback();
      if (!data.orders) data.orders = [];
      data.orders.unshift(newOrder);
      db.saveJsonFallback(data);
      saved = newOrder;
    }

    console.log('[BACKEND ORDER CREATION]: Order created successfully:', saved);
    res.status(201).json(saved);
  } catch (err) {
    console.error('[BACKEND ORDER CREATION ERROR]:', err.message);
    res.status(500).json({ error: 'Failed to create order', details: err.message });
  }
});

app.put('/api/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (useSupabase()) {
      const updated = await db.updateOrderStatus(id, status);
      return res.json(updated);
    }

    const data = db.readJsonFallback();
    const order = data.orders.find(o => o.id === id || o.id === `#${id}` || o.id.replace('#', '') === id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    order.status = status;
    db.saveJsonFallback(data);
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order status', details: err.message });
  }
});

// ---------------------------------------------------------------
// 5. WISHLIST API
// ---------------------------------------------------------------
app.get('/api/wishlist', async (req, res) => {
  try {
    const { username } = req.query;
    if (!username) return res.status(400).json({ error: 'Username required' });

    if (useSupabase()) {
      const wishlists = await db.getWishlists(username);
      const allProducts = await db.getProducts();
      const wished = allProducts.filter(p => wishlists.some(w => w.product_id === p.id));
      return res.json(wished);
    }

    const data = db.readJsonFallback();
    const userWishlist = data.wishlists.filter(w => w.username === username);
    res.json(data.products.filter(p => userWishlist.some(w => w.productId === p.id)));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch wishlist', details: err.message });
  }
});

app.post('/api/wishlist', async (req, res) => {
  try {
    const { username, productId } = req.body;
    if (!username || !productId) return res.status(400).json({ error: 'Username and productId required' });

    if (useSupabase()) {
      await db.upsertWishlist({ id: Date.now(), username, product_id: Number(productId), created_at: new Date().toISOString() });
      return res.status(201).json({ message: 'Added to wishlist' });
    }

    const data = db.readJsonFallback();
    const exists = data.wishlists.some(w => w.username === username && w.productId === Number(productId));
    if (!exists) {
      data.wishlists.push({ id: Date.now(), username, productId: Number(productId) });
      db.saveJsonFallback(data);
    }
    res.status(201).json({ message: 'Added to wishlist' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add to wishlist', details: err.message });
  }
});

app.delete('/api/wishlist', async (req, res) => {
  try {
    const { username, productId } = req.body;
    if (useSupabase()) {
      await db.deleteWishlist(username, Number(productId));
      return res.status(200).json({ message: 'Removed from wishlist' });
    }
    const data = db.readJsonFallback();
    data.wishlists = data.wishlists.filter(w => !(w.username === username && w.productId === Number(productId)));
    db.saveJsonFallback(data);
    res.status(200).json({ message: 'Removed from wishlist' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove from wishlist', details: err.message });
  }
});

// ---------------------------------------------------------------
// 6. COUPONS API
// ---------------------------------------------------------------
app.post('/api/coupons/validate', async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'Coupon code required' });

    const coupons = useSupabase() ? await db.getCoupons() : (db.readJsonFallback().coupons || []);
    const coupon = coupons.find(c =>
      (c.code || '').toUpperCase() === String(code).toUpperCase() &&
      (c.active || c.active === undefined)
    );

    if (coupon) {
      return res.json({ valid: true, discountPercent: coupon.discountPercent || coupon.discount_percent, code: coupon.code });
    }
    res.status(404).json({ valid: false, error: 'Invalid or expired coupon' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to validate coupon', details: err.message });
  }
});

// ---------------------------------------------------------------
// 7. SETTINGS & AUTH API
// ---------------------------------------------------------------
app.get('/api/settings', async (req, res) => {
  try {
    if (useSupabase()) {
      return res.json(await db.getStoreSettings());
    }
    res.json(db.readJsonFallback().storeSettings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch settings', details: err.message });
  }
});

app.put('/api/settings', async (req, res) => {
  try {
    if (useSupabase()) {
      return res.json(await db.updateStoreSettings(req.body));
    }
    const data = db.readJsonFallback();
    data.storeSettings = { ...data.storeSettings, ...req.body };
    db.saveJsonFallback(data);
    res.json(data.storeSettings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update settings', details: err.message });
  }
});

app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

    const users = useSupabase() ? await db.getUsers() : (db.readJsonFallback().users || []);
    if (users.find(u => u.username === username)) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const newUser = { username, password, role: 'user' };
    if (useSupabase()) {
      await db.insertUser(newUser);
    } else {
      const data = db.readJsonFallback();
      data.users.push(newUser);
      db.saveJsonFallback(data);
    }
    res.status(201).json({ message: 'Registration successful', user: { username, role: 'user' } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to register', details: err.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const users = useSupabase() ? await db.getUsers() : (db.readJsonFallback().users || []);
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      return res.json({ message: 'Login successful', user: { username: user.username, role: user.role } });
    }
    res.status(401).json({ error: 'Invalid username or password' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to login', details: err.message });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = useSupabase() ? await db.getUsers() : (db.readJsonFallback().users || []);
    res.json(users.map(u => ({ username: u.username })));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users', details: err.message });
  }
});

app.delete('/api/users/:username', async (req, res) => {
  try {
    const { username } = req.params;
    if (useSupabase()) {
      await db.deleteUser(username);
      return res.status(204).send();
    }
    const data = db.readJsonFallback();
    const initial = data.users.length;
    data.users = data.users.filter(u => u.username !== username);
    if (data.users.length < initial) {
      db.saveJsonFallback(data);
      return res.status(204).send();
    }
    res.status(404).json({ error: 'User not found' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user', details: err.message });
  }
});

// ---------------------------------------------------------------
// Start server
// ---------------------------------------------------------------
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Database: ${db.useSupabase() ? '☁️  Supabase (cloud)' : '📁 database.json (local)'}`);
  });
}

module.exports = app;
