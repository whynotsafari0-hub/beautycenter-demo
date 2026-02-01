require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");

const publicRoutes = require("./routes.public");
const adminRoutes = require("./routes.admin");

const app = express();
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json({ limit: "5mb" }));

// Serve uploads
app.use("/api/uploads", express.static(path.join(__dirname, "uploads")));

// API
app.use("/api", publicRoutes);
app.use("/api/admin", adminRoutes);

// Serve static web
app.use(express.static(path.join(__dirname, "..", "web")));

// Basic sitemap (static file)
app.get("/sitemap.xml", (_, res) => res.sendFile(path.join(__dirname, "..", "web", "sitemap.xml")));
app.get("/robots.txt", (_, res) => res.sendFile(path.join(__dirname, "..", "web", "robots.txt")));

// Default redirect
app.get("/", (_, res) => res.redirect("/ar/"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Running on http://localhost:${PORT}`));
