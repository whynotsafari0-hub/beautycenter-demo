const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { get, all, run } = require("./db");
const { requireAdmin } = require("./auth");

const router = express.Router();

const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase() || ".jpg";
    cb(null, `img_${Date.now()}${ext}`);
  }
});
const upload = multer({ storage });

router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  const admin = await get(`SELECT * FROM admins WHERE email=?`, [email]);
  if (!admin) return res.status(401).json({ ok: false, error: "invalid_login" });
  const ok = await bcrypt.compare(password, admin.password_hash);
  if (!ok) return res.status(401).json({ ok: false, error: "invalid_login" });

  const token = jwt.sign({ role: "admin", email }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.json({ ok: true, token });
});

router.get("/dashboard", requireAdmin, async (req, res) => {
  const services = await get(`SELECT COUNT(*) as c FROM services`);
  const products = await get(`SELECT COUNT(*) as c FROM products`);
  const bookings = await get(`SELECT COUNT(*) as c FROM bookings`);
  const orders = await get(`SELECT COUNT(*) as c FROM orders`);
  const offers = await get(`SELECT COUNT(*) as c FROM offers`);
  const posts = await get(`SELECT COUNT(*) as c FROM posts`);
  res.json({ ok: true, data: { services: services.c, products: products.c, bookings: bookings.c, orders: orders.c, offers: offers.c, posts: posts.c }});
});

router.get("/settings", requireAdmin, async (req, res) => {
  const s = await get(`SELECT * FROM settings WHERE id=1`);
  res.json({ ok: true, data: s });
});

router.put("/settings", requireAdmin, async (req, res) => {
  const s = req.body || {};
  await run(
    `UPDATE settings SET name_ar=?,name_en=?,phone=?,email=?,address_ar=?,address_en=?,facebook=?,instagram=? WHERE id=1`,
    [s.name_ar, s.name_en, s.phone, s.email, s.address_ar, s.address_en, s.facebook, s.instagram]
  );
  res.json({ ok: true });
});

/* Upload image */
router.post("/upload", requireAdmin, upload.single("image"), async (req, res) => {
  const url = `/api/uploads/${req.file.filename}`;
  res.json({ ok: true, url });
});

/* Services CRUD */
router.get("/services", requireAdmin, async (req, res) => {
  const rows = await all(`SELECT * FROM services ORDER BY id DESC`);
  res.json({ ok: true, data: rows });
});

router.post("/services", requireAdmin, async (req, res) => {
  const s = req.body || {};
  await run(
    `INSERT INTO services (title_ar,title_en,desc_ar,desc_en,price,image_url,is_active) VALUES (?,?,?,?,?,?,?)`,
    [s.title_ar||"", s.title_en||"", s.desc_ar||"", s.desc_en||"", Number(s.price||0), s.image_url||"", Number(s.is_active??1)]
  );
  res.json({ ok: true });
});

router.put("/services/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const s = req.body || {};
  await run(
    `UPDATE services SET title_ar=?,title_en=?,desc_ar=?,desc_en=?,price=?,image_url=?,is_active=? WHERE id=?`,
    [s.title_ar||"", s.title_en||"", s.desc_ar||"", s.desc_en||"", Number(s.price||0), s.image_url||"", Number(s.is_active??1), id]
  );
  res.json({ ok: true });
});

/* Products CRUD */
router.get("/products", requireAdmin, async (req, res) => {
  const rows = await all(`SELECT * FROM products ORDER BY id DESC`);
  res.json({ ok: true, data: rows });
});

router.post("/products", requireAdmin, async (req, res) => {
  const p = req.body || {};
  await run(
    `INSERT INTO products (title_ar,title_en,desc_ar,desc_en,price,sale_price,in_stock,image_url,is_active)
     VALUES (?,?,?,?,?,?,?,?,?)`,
    [
      p.title_ar||"", p.title_en||"", p.desc_ar||"", p.desc_en||"",
      Number(p.price||0), p.sale_price ? Number(p.sale_price) : null,
      Number(p.in_stock??1), p.image_url||"", Number(p.is_active??1)
    ]
  );
  res.json({ ok: true });
});

router.put("/products/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const p = req.body || {};
  await run(
    `UPDATE products SET title_ar=?,title_en=?,desc_ar=?,desc_en=?,price=?,sale_price=?,in_stock=?,image_url=?,is_active=? WHERE id=?`,
    [
      p.title_ar||"", p.title_en||"", p.desc_ar||"", p.desc_en||"",
      Number(p.price||0), p.sale_price ? Number(p.sale_price) : null,
      Number(p.in_stock??1), p.image_url||"", Number(p.is_active??1), id
    ]
  );
  res.json({ ok: true });
});

/* Offers */
router.get("/offers", requireAdmin, async (req, res) => {
  const rows = await all(`SELECT * FROM offers ORDER BY id DESC`);
  res.json({ ok: true, data: rows });
});

router.post("/offers", requireAdmin, async (req, res) => {
  const o = req.body || {};
  await run(
    `INSERT INTO offers (title_ar,title_en,desc_ar,desc_en,discount_percent,image_url,is_active)
     VALUES (?,?,?,?,?,?,?)`,
    [o.title_ar||"", o.title_en||"", o.desc_ar||"", o.desc_en||"", Number(o.discount_percent||0), o.image_url||"", Number(o.is_active??1)]
  );
  res.json({ ok: true });
});

router.put("/offers/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const o = req.body || {};
  await run(
    `UPDATE offers SET title_ar=?,title_en=?,desc_ar=?,desc_en=?,discount_percent=?,image_url=?,is_active=? WHERE id=?`,
    [o.title_ar||"", o.title_en||"", o.desc_ar||"", o.desc_en||"", Number(o.discount_percent||0), o.image_url||"", Number(o.is_active??1), id]
  );
  res.json({ ok: true });
});

/* Posts */
router.get("/posts", requireAdmin, async (req, res) => {
  const rows = await all(`SELECT * FROM posts ORDER BY id DESC`);
  res.json({ ok: true, data: rows });
});

router.post("/posts", requireAdmin, async (req, res) => {
  const p = req.body || {};
  await run(
    `INSERT INTO posts (slug,title_ar,title_en,excerpt_ar,excerpt_en,content_ar,content_en,image_url,is_active)
     VALUES (?,?,?,?,?,?,?,?,?)`,
    [p.slug||"", p.title_ar||"", p.title_en||"", p.excerpt_ar||"", p.excerpt_en||"", p.content_ar||"", p.content_en||"", p.image_url||"", Number(p.is_active??1)]
  );
  res.json({ ok: true });
});

router.put("/posts/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const p = req.body || {};
  await run(
    `UPDATE posts SET slug=?,title_ar=?,title_en=?,excerpt_ar=?,excerpt_en=?,content_ar=?,content_en=?,image_url=?,is_active=? WHERE id=?`,
    [p.slug||"", p.title_ar||"", p.title_en||"", p.excerpt_ar||"", p.excerpt_en||"", p.content_ar||"", p.content_en||"", p.image_url||"", Number(p.is_active??1), id]
  );
  res.json({ ok: true });
});

/* Orders & Bookings list */
router.get("/orders", requireAdmin, async (req, res) => {
  const rows = await all(`SELECT * FROM orders ORDER BY id DESC`);
  res.json({ ok: true, data: rows });
});

router.get("/bookings", requireAdmin, async (req, res) => {
  const rows = await all(`SELECT * FROM bookings ORDER BY id DESC`);
  res.json({ ok: true, data: rows });
});

module.exports = router;
