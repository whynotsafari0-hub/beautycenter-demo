Beauty Center Custom Website (AR/EN) + Admin Dashboard
Domain: https://beautycenter-sharm.com

Local Preview:
1) Install Node.js 18+
2) Open terminal inside project folder
3) Copy .env.example to .env and edit if needed
4) Run:
   npm install
   npm run seed
   npm start
5) Open:
   http://localhost:3000/ar/
   http://localhost:3000/en/
Admin:
   http://localhost:3000/ar/admin.html
   http://localhost:3000/en/admin.html

Hosting:
- Requires Node.js hosting (VPS / cPanel Node app / PaaS)
- Run npm install && npm run seed && npm start
- Point domain to the server and use reverse proxy (Nginx/Apache) to port 3000

Notes:
- Replace /web/assets/img/logo.png with your logo file.
- Upload images from the dashboard; they will be stored under /server/uploads and served at /api/uploads/...
