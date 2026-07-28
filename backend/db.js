require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------
// Supabase client — reads from env variables
// ---------------------------------------------------------------
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

let supabase = null;

if (SUPABASE_URL && SUPABASE_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  console.log('✅ Supabase connected');
} else {
  console.warn('⚠️  SUPABASE_URL / SUPABASE_KEY not set — falling back to database.json');
}

// ---------------------------------------------------------------
// JSON file fallback (local dev without Supabase creds)
// ---------------------------------------------------------------
const DB_FILE = path.join(__dirname, 'data', 'database.json');
let memoryCache = null;

function readJsonFallback() {
  if (memoryCache) return memoryCache;
  try {
    if (!fs.existsSync(DB_FILE)) return getEmptyDb();
    const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    memoryCache = data;
    return data;
  } catch (e) {
    return getEmptyDb();
  }
}

function saveJsonFallback(data) {
  memoryCache = data;
  try { fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8'); } catch (_) {}
}

function getEmptyDb() {
  return {
    products: [], orders: [], users: [{ username: 'admin', password: 'password', role: 'admin' }],
    wishlists: [], coupons: [{ code: 'GLOBAL20', discountPercent: 20, active: true }],
    reviews: [], customItems: [],
    storeSettings: { storeName: 'GlobalJD', email: 'admin@globaljd.com', currency: 'USD' }
  };
}

// ---------------------------------------------------------------
// Supabase helpers — map Supabase rows ↔ app objects
// ---------------------------------------------------------------

// Products: stored as { id, data: {...full product} }
async function getProducts() {
  const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(row => ({ id: row.id, ...row.data }));
}

async function upsertProduct(product) {
  const { id, ...rest } = product;
  const { data, error } = await supabase.from('products').upsert({ id, data: rest }).select().single();
  if (error) throw error;
  return { id: data.id, ...data.data };
}

async function deleteProduct(id) {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
}

async function getOrders(username = null) {
  let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
  if (username) query = query.eq('customer', username);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

async function insertOrder(order) {
  const { data, error } = await supabase.from('orders').insert(order).select().single();
  if (error) throw error;
  return data;
}

async function updateOrderStatus(id, status) {
  // Try matching id with or without # prefix
  const { data, error } = await supabase.from('orders').update({ status })
    .or(`id.eq.${id},id.eq.%23${id}`)
    .select().single();
  if (error) {
    // Try alternate format
    const { data: d2, error: e2 } = await supabase.from('orders').update({ status }).eq('id', `#${id}`).select().single();
    if (e2) throw e2;
    return d2;
  }
  return data;
}

async function getUsers() {
  const { data, error } = await supabase.from('users').select('*');
  if (error) throw error;
  return data || [];
}

async function insertUser(user) {
  const { data, error } = await supabase.from('users').insert(user).select().single();
  if (error) throw error;
  return data;
}

async function deleteUser(username) {
  const { error } = await supabase.from('users').delete().eq('username', username);
  if (error) throw error;
}

async function getCoupons() {
  const { data, error } = await supabase.from('coupons').select('*');
  if (error) throw error;
  return data || [];
}

async function getWishlists(username = null) {
  let query = supabase.from('wishlists').select('*');
  if (username) query = query.eq('username', username);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

async function upsertWishlist(item) {
  const { error } = await supabase.from('wishlists').upsert(item, { onConflict: 'username,product_id' });
  if (error) throw error;
}

async function deleteWishlist(username, productId) {
  const { error } = await supabase.from('wishlists').delete().eq('username', username).eq('product_id', productId);
  if (error) throw error;
}

async function getCustomItems() {
  const { data, error } = await supabase.from('custom_items').select('*').order('id', { ascending: false });
  if (error) throw error;
  return data || [];
}

async function insertCustomItem(item) {
  const { data, error } = await supabase.from('custom_items').insert(item).select().single();
  if (error) throw error;
  return data;
}

async function deleteCustomItem(id) {
  const { error } = await supabase.from('custom_items').delete().eq('id', id);
  if (error) throw error;
}

async function getStoreSettings() {
  const { data, error } = await supabase.from('store_settings').select('*').eq('id', 1).single();
  if (error) throw error;
  return {
    storeName: data.store_name,
    email: data.email,
    currency: data.currency,
    notifications: data.notifications
  };
}

async function updateStoreSettings(updates) {
  const mapped = {};
  if (updates.storeName !== undefined) mapped.store_name = updates.storeName;
  if (updates.email !== undefined) mapped.email = updates.email;
  if (updates.currency !== undefined) mapped.currency = updates.currency;
  if (updates.notifications !== undefined) mapped.notifications = updates.notifications;
  const { data, error } = await supabase.from('store_settings').update(mapped).eq('id', 1).select().single();
  if (error) throw error;
  return { storeName: data.store_name, email: data.email, currency: data.currency, notifications: data.notifications };
}

// ---------------------------------------------------------------
// Exports — unified API used by server.js
// ---------------------------------------------------------------
module.exports = {
  useSupabase: () => !!supabase,
  // Products
  getProducts,
  upsertProduct,
  deleteProduct,
  // Orders
  getOrders,
  insertOrder,
  updateOrderStatus,
  // Users
  getUsers,
  insertUser,
  deleteUser,
  // Coupons
  getCoupons,
  // Wishlists
  getWishlists,
  upsertWishlist,
  deleteWishlist,
  // Custom items
  getCustomItems,
  insertCustomItem,
  deleteCustomItem,
  // Settings
  getStoreSettings,
  updateStoreSettings,
  // JSON fallback (used when Supabase not configured)
  readJsonFallback,
  saveJsonFallback
};
