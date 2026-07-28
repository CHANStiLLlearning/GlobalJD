const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'data', 'database.json');
const TMP_DB_FILE = path.join('/tmp', 'database.json');

let memoryDbCache = null;

// Ensure data directory exists if writable
try {
  const dataDir = path.dirname(DB_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
} catch (e) {
  // Read-only filesystem on serverless environments
}

// Minimal empty structure - all real data comes from database.json
const emptyDb = {
  products: [],
  orders: [],
  users: [{ username: "admin", password: "password", role: "admin" }],
  wishlists: [],
  coupons: [],
  reviews: [],
  customItems: [],
  storeSettings: { storeName: "GlobalJD", email: "admin@globaljd.com", currency: "USD" }
};

// Read database - always from disk file, memory cache updated by saveDb only
function readDb() {
  // Use memory cache (only populated after a saveDb write in the same session)
  if (memoryDbCache) return memoryDbCache;

  try {
    let targetPath = DB_FILE;

    // Fallback to /tmp if primary file missing
    if (!fs.existsSync(targetPath) && fs.existsSync(TMP_DB_FILE)) {
      targetPath = TMP_DB_FILE;
    }

    if (!fs.existsSync(targetPath)) {
      // No database file exists yet — use empty structure
      memoryDbCache = emptyDb;
      return emptyDb;
    }

    const raw = fs.readFileSync(targetPath, 'utf8');
    const data = JSON.parse(raw);

    // Ensure all required top-level tables exist (do NOT overwrite with demo data)
    if (!data.products) data.products = [];
    if (!data.orders) data.orders = [];
    if (!data.users) data.users = emptyDb.users;
    if (!data.wishlists) data.wishlists = [];
    if (!data.coupons) data.coupons = [];
    if (!data.reviews) data.reviews = [];
    if (!data.customItems) data.customItems = [];
    if (!data.storeSettings) data.storeSettings = emptyDb.storeSettings;

    memoryDbCache = data;
    return data;

  } catch (err) {
    console.error("Error reading database.json:", err.message);
    return emptyDb;
  }
}

// Write database to file and update memory cache
function saveDb(data) {
  // Update in-memory cache immediately
  memoryDbCache = data;

  // Try writing to primary file location
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    // Fallback to /tmp on read-only filesystems (e.g. Vercel serverless)
    try {
      fs.writeFileSync(TMP_DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (tmpErr) {
      console.warn("Could not write to disk, changes are in memory only:", tmpErr.message);
    }
  }
}

module.exports = { readDb, saveDb };
