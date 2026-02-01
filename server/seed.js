require("dotenv").config();
const bcrypt = require("bcryptjs");
const { run } = require("./db");

async function main() {
  // Admins
  await run(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      password_hash TEXT
    )
  `);

  // Settings
  await run(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      name_ar TEXT, name_en TEXT,
      phone TEXT, email TEXT,
      address_ar TEXT, address_en TEXT,
      facebook TEXT, instagram TEXT
    )
  `);

  // Services
  await run(`
    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title_ar TEXT, title_en TEXT,
      desc_ar TEXT, desc_en TEXT,
      price INTEGER,
      image_url TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Products (Pickup only)
  await run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title_ar TEXT, title_en TEXT,
      desc_ar TEXT, desc_en TEXT,
      price INTEGER,
      sale_price INTEGER,
      in_stock INTEGER DEFAULT 1,
      image_url TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Offers
  await run(`
    CREATE TABLE IF NOT EXISTS offers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title_ar TEXT, title_en TEXT,
      desc_ar TEXT, desc_en TEXT,
      discount_percent INTEGER,
      image_url TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Blog posts
  await run(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE,
      title_ar TEXT, title_en TEXT,
      excerpt_ar TEXT, excerpt_en TEXT,
      content_ar TEXT, content_en TEXT,
      image_url TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Bookings
  await run(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT,
      phone TEXT,
      service_id INTEGER,
      date TEXT,
      time TEXT,
      lang TEXT,
      note TEXT,
      status TEXT DEFAULT 'new',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Orders
  await run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT,
      phone TEXT,
      items_json TEXT,
      pickup_date TEXT,
      pickup_time TEXT,
      lang TEXT,
      status TEXT DEFAULT 'new',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Default settings row (your real data)
  await run(`
    INSERT OR IGNORE INTO settings (id, name_ar, name_en, phone, email, address_ar, address_en, facebook, instagram)
    VALUES (1,
      'Beauty Center Sharm El Sheikh',
      'Beauty Center Sharm El Sheikh',
      '01092807902',
      'info@buoty.com',
      'السوق القديم مول تيرانا امام فندق ابروتيل بالاس',
      'Old Market, Tirana Mall, in front of Iberotel Palace Hotel',
      'https://www.facebook.com/profile.php?id=100046601996285',
      'https://www.instagram.com/beautycenter7071'
    )
  `);

  // Admin user
  const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
  await run(`INSERT OR IGNORE INTO admins (email, password_hash) VALUES (?, ?)`, [process.env.ADMIN_EMAIL, hash]);

  // Seed Services (with placeholder images)
  await run(`INSERT INTO services (title_ar,title_en,desc_ar,desc_en,price,image_url) VALUES (?,?,?,?,?,?)`, [
    "هارد جيل", "Hard Gel",
    "ثبات قوي ولمعة عالية للأظافر.", "Strong hold and glossy nails finish.",
    650,
    "/assets/img/ph-nails.svg"
  ]);

  await run(`INSERT INTO services (title_ar,title_en,desc_ar,desc_en,price,image_url) VALUES (?,?,?,?,?,?)`, [
    "رموش ميجا فوليم", "Mega Volume Lashes",
    "كثافة واضحة ونتيجة فخمة بشكل طبيعي.", "Bold volume with a natural-looking finish.",
    550,
    "/assets/img/ph-lashes.svg"
  ]);

  await run(`INSERT INTO services (title_ar,title_en,desc_ar,desc_en,price,image_url) VALUES (?,?,?,?,?,?)`, [
    "تنظيف بشرة عميق", "Deep Facial Cleansing",
    "تنظيف + ترطيب لإشراقة واضحة.", "Deep cleansing + hydration for glowing skin.",
    700,
    "/assets/img/ph-skin.svg"
  ]);

  await run(`INSERT INTO services (title_ar,title_en,desc_ar,desc_en,price,image_url) VALUES (?,?,?,?,?,?)`, [
    "كيراتين و علاج شعر", "Keratin & Hair Treatment",
    "نعومة وتقليل هيشان مع نتائج ملحوظة.", "Smoother hair and reduced frizz with visible results.",
    1800,
    "/assets/img/ph-hair.svg"
  ]);

  // Seed Products (pickup only)
  await run(`INSERT INTO products (title_ar,title_en,desc_ar,desc_en,price,sale_price,in_stock,image_url,is_active) VALUES (?,?,?,?,?,?,?,?,?)`, [
    "سيروم شعر", "Hair Serum",
    "منتج للعناية بالشعر داخل البيوتي سنتر.", "In-salon hair care product.",
    450, null, 1, "/assets/img/ph-hair.svg", 1
  ]);

  await run(`INSERT INTO products (title_ar,title_en,desc_ar,desc_en,price,sale_price,in_stock,image_url,is_active) VALUES (?,?,?,?,?,?,?,?,?)`, [
    "زيت أظافر", "Nail Oil",
    "ترطيب وحماية للأظافر والجلد المحيط.", "Hydration & protection for nails and cuticles.",
    220, 190, 1, "/assets/img/ph-nails.svg", 1
  ]);

  // Seed Offer
  await run(`INSERT INTO offers (title_ar,title_en,desc_ar,desc_en,discount_percent,image_url,is_active) VALUES (?,?,?,?,?,?,?)`, [
    "عرض الأسبوع", "Weekly Offer",
    "خصم على باكيدج الرموش + تنظيف البشرة.", "Discount on lashes + facial package.",
    15, "/assets/img/ph-offer.svg", 1
  ]);

  // Seed Blog post
  await run(`INSERT INTO posts (slug,title_ar,title_en,excerpt_ar,excerpt_en,content_ar,content_en,image_url,is_active) VALUES (?,?,?,?,?,?,?,?,?)`, [
    "lash-guide",
    "إزاي تختاري نوع الرموش المناسب؟",
    "How to Choose the Right Lashes?",
    "دليل سريع بين Classic / Volume / Mega Volume.",
    "A quick guide: Classic / Volume / Mega Volume.",
    "<p>اختيار الرموش بيعتمد على شكل العين واللوك اللي بتحبيه. لو عايزة مظهر طبيعي ابدئي بـ Classic، ولو عايزة كثافة أعلى اختاري Volume أو Mega Volume.</p>",
    "<p>Lash choice depends on eye shape and the look you want. For a natural look, start with Classic. For more density, choose Volume or Mega Volume.</p>",
    "/assets/img/ph-blog.svg",
    1
  ]);

  console.log("✅ Seed completed");
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
