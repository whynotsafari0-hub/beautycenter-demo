const express = require("express");
const { get, all, run } = require("./db");

const router = express.Router();

router.get("/settings", async (req, res) => {
  const s = await get(`SELECT * FROM settings WHERE id=1`);
  res.json({ ok: true, data: s });
});

router.get("/services", async (req, res) => {
  const rows = await all(`SELECT * FROM services WHERE is_active=1 ORDER BY id DESC`);
  res.json({ ok: true, data: rows });
});

router.get("/products", async (req, res) => {
  const rows = await all(`SELECT * FROM products WHERE is_active=1 ORDER BY id DESC`);
  res.json({ ok: true, data: rows });
});

router.get("/offers", async (req, res) => {
  const rows = await all(`SELECT * FROM offers WHERE is_active=1 ORDER BY id DESC`);
  res.json({ ok: true, data: rows });
});

router.get("/posts", async (req, res) => {
  const rows = await all(`SELECT id,slug,title_ar,title_en,excerpt_ar,excerpt_en,image_url,created_at FROM posts WHERE is_active=1 ORDER BY id DESC`);
  res.json({ ok: true, data: rows });
});

router.get("/posts/:slug", async (req, res) => {
  const row = await get(`SELECT * FROM posts WHERE slug=? AND is_active=1`, [req.params.slug]);
  if (!row) return res.status(404).json({ ok:false, error:"not_found" });
  res.json({ ok:true, data: row });
});

router.post("/booking", async (req, res) => {
  const { full_name, phone, service_id, date, time, lang, note } = req.body || {};
  if (!full_name || !phone || !service_id || !date || !time) {
    return res.status(400).json({ ok: false, error: "missing_fields" });
  }
  await run(
    `INSERT INTO bookings (full_name,phone,service_id,date,time,lang,note) VALUES (?,?,?,?,?,?,?)`,
    [full_name, phone, service_id, date, time, lang || "ar", note || ""]
  );
  res.json({ ok: true });
});

router.post("/order", async (req, res) => {
  const { full_name, phone, items, pickup_date, pickup_time, lang } = req.body || {};
  if (!full_name || !phone || !Array.isArray(items) || items.length === 0 || !pickup_date || !pickup_time) {
    return res.status(400).json({ ok: false, error: "missing_fields" });
  }
  await run(
    `INSERT INTO orders (full_name,phone,items_json,pickup_date,pickup_time,lang) VALUES (?,?,?,?,?,?)`,
    [full_name, phone, JSON.stringify(items), pickup_date, pickup_time, lang || "ar"]
  );
  res.json({ ok: true });
});

module.exports = router;
