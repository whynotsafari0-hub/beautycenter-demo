const jwt = require("jsonwebtoken");

function requireAdmin(req, res, next) {
  try {
    const token = (req.headers.authorization || "").replace("Bearer ", "").trim();
    if (!token) return res.status(401).json({ ok: false, error: "missing_token" });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (!payload || payload.role !== "admin") return res.status(403).json({ ok: false, error: "forbidden" });
    req.admin = payload;
    next();
  } catch {
    return res.status(401).json({ ok: false, error: "invalid_token" });
  }
}

module.exports = { requireAdmin };
