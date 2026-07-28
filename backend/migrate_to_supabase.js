/**
 * One-time migration script: imports database.json data into Supabase.
 * Run ONCE after setting up your Supabase project and tables:
 *
 *   node backend/migrate_to_supabase.js
 *
 * Make sure backend/.env has SUPABASE_URL and SUPABASE_KEY set.
 */

require('dotenv').config({ path: __dirname + '/.env' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY || SUPABASE_URL.includes('YOUR_PROJECT')) {
  console.error('❌ Please set SUPABASE_URL and SUPABASE_KEY in backend/.env first');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function migrate() {
  const dbPath = path.join(__dirname, 'data', 'database.json');
  if (!fs.existsSync(dbPath)) {
    console.error('❌ database.json not found at', dbPath);
    process.exit(1);
  }

  const raw = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  console.log(`📦 Loaded database.json: ${raw.products?.length || 0} products, ${raw.orders?.length || 0} orders`);

  // --- Migrate Products ---
  if (raw.products && raw.products.length > 0) {
    console.log('\n🔄 Migrating products...');
    for (const product of raw.products) {
      const { id, ...rest } = product;
      const { error } = await supabase.from('products').upsert({ id, data: rest });
      if (error) console.error(`  ❌ Product ${id}:`, error.message);
      else console.log(`  ✅ Product: ${product.name}`);
    }
  }

  // --- Migrate Orders ---
  if (raw.orders && raw.orders.length > 0) {
    console.log('\n🔄 Migrating orders...');
    for (const order of raw.orders) {
      const { error } = await supabase.from('orders').upsert(order);
      if (error) console.error(`  ❌ Order ${order.id}:`, error.message);
      else console.log(`  ✅ Order: ${order.id}`);
    }
  }

  // --- Migrate Users ---
  if (raw.users && raw.users.length > 0) {
    console.log('\n🔄 Migrating users...');
    for (const user of raw.users) {
      const { error } = await supabase.from('users').upsert(user, { onConflict: 'username' });
      if (error) console.error(`  ❌ User ${user.username}:`, error.message);
      else console.log(`  ✅ User: ${user.username}`);
    }
  }

  // --- Migrate Coupons ---
  if (raw.coupons && raw.coupons.length > 0) {
    console.log('\n🔄 Migrating coupons...');
    for (const coupon of raw.coupons) {
      const row = { code: coupon.code, discount_percent: coupon.discountPercent, active: coupon.active };
      const { error } = await supabase.from('coupons').upsert(row, { onConflict: 'code' });
      if (error) console.error(`  ❌ Coupon ${coupon.code}:`, error.message);
      else console.log(`  ✅ Coupon: ${coupon.code}`);
    }
  }

  console.log('\n🎉 Migration complete! Your Supabase database now has your real data.');
  console.log('👉 Set SUPABASE_URL and SUPABASE_KEY in your Render environment variables.');
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
