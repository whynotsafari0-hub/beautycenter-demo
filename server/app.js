const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 8080;

// Serve static website
app.use(express.static(path.join(__dirname, "../web")));

// Default route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../web/ar/index.html"));
});

app.listen(PORT, () => {
  console.log(`Running on port ${PORT}`);
});
