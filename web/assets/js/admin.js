const TOKEN_KEY = "beauty_admin_token";
const token = ()=> localStorage.getItem(TOKEN_KEY)||"";

async function api(path, method="GET", body){
  const r = await fetch(path, {
    method,
    headers: {
      "Content-Type":"application/json",
      "Authorization": token()? `Bearer ${token()}` : ""
    },
    body: body ? JSON.stringify(body) : undefined
  });
  return r.json();
}

function showApp(yes){
  document.getElementById("loginBox").style.display = yes ? "none" : "block";
  document.getElementById("appBox").style.display = yes ? "block" : "none";
}

async function login(){
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const res = await api("/api/admin/login","POST",{email,password});
  if(res.ok){
    localStorage.setItem(TOKEN_KEY, res.token);
    document.getElementById("loginMsg").textContent = "";
    showApp(true);
    refreshAll();
  }else{
    document.getElementById("loginMsg").textContent = "بيانات الدخول غير صحيحة";
  }
}
function logout(){
  localStorage.removeItem(TOKEN_KEY);
  showApp(false);
}

async function refreshAll(){
  const dash = await api("/api/admin/dashboard");
  if(dash.ok){
    document.getElementById("kServices").textContent = dash.data.services;
    document.getElementById("kProducts").textContent = dash.data.products;
    document.getElementById("kOrders").textContent = dash.data.orders;
    document.getElementById("kBookings").textContent = dash.data.bookings;
    document.getElementById("kOffers").textContent = dash.data.offers;
    document.getElementById("kPosts").textContent = dash.data.posts;
  }
  await loadServices();
  await loadProducts();
  await loadOffers();
  await loadPosts();
  await loadOrders();
  await loadBookings();
  await loadSettings();
}

async function uploadImageIfAny(fileInputId, labelId){
  const fileInput = document.getElementById(fileInputId);
  if(!fileInput || !fileInput.files || !fileInput.files[0]) return "";
  const fd = new FormData();
  fd.append("image", fileInput.files[0]);

  const r = await fetch("/api/admin/upload", {
    method:"POST",
    headers:{ "Authorization": `Bearer ${token()}` },
    body: fd
  }).then(r=>r.json());

  if(r.ok){
    if(labelId) document.getElementById(labelId).textContent = `✅ ${r.url}`;
    return r.url;
  }
  return "";
}

/* SETTINGS */
async function loadSettings(){
  const res = await api("/api/admin/settings");
  if(!res.ok) return;
  const s = res.data;
  document.getElementById("set_name_ar").value = s.name_ar||"";
  document.getElementById("set_name_en").value = s.name_en||"";
  document.getElementById("set_phone").value = s.phone||"";
  document.getElementById("set_email").value = s.email||"";
  document.getElementById("set_address_ar").value = s.address_ar||"";
  document.getElementById("set_address_en").value = s.address_en||"";
  document.getElementById("set_facebook").value = s.facebook||"";
  document.getElementById("set_instagram").value = s.instagram||"";
}
async function saveSettings(){
  const body = {
    name_ar: document.getElementById("set_name_ar").value,
    name_en: document.getElementById("set_name_en").value,
    phone: document.getElementById("set_phone").value,
    email: document.getElementById("set_email").value,
    address_ar: document.getElementById("set_address_ar").value,
    address_en: document.getElementById("set_address_en").value,
    facebook: document.getElementById("set_facebook").value,
    instagram: document.getElementById("set_instagram").value
  };
  const res = await api("/api/admin/settings","PUT",body);
  alert(res.ok ? "✅ تم حفظ الإعدادات" : "Error");
}

/* SERVICES */
async function createService(){
  const image_url = await uploadImageIfAny("s_img","s_img_url");
  const body = {
    title_ar: document.getElementById("s_ar").value,
    title_en: document.getElementById("s_en").value,
    desc_ar: document.getElementById("s_desc_ar").value,
    desc_en: document.getElementById("s_desc_en").value,
    price: Number(document.getElementById("s_price").value||0),
    image_url
  };
  const res = await api("/api/admin/services","POST",body);
  alert(res.ok ? "✅ تم إضافة الخدمة" : "Error");
  refreshAll();
}

async function loadServices(){
  const res = await api("/api/admin/services");
  if(!res.ok) return;
  const rows = res.data;
  document.getElementById("servicesTable").innerHTML = `
    <div class="list">
      ${rows.map(s=>`
        <div class="li card" style="padding:10px">
          <div>
            <b>${s.title_ar}</b>
            <div class="muted">${s.title_en}</div>
            <div class="muted">Price: ${s.price} EGP</div>
            <div class="muted">${s.image_url||""}</div>
          </div>
          <div class="row">
            <button class="btn" onclick="toggleService(${s.id}, ${s.is_active?0:1})">${s.is_active? "إخفاء":"إظهار"}</button>
          </div>
        </div>
      `).join("")}
    </div>
  `;
}
async function toggleService(id, is_active){
  const list = await api("/api/admin/services");
  const s = list.data.find(x=>x.id===id);
  if(!s) return;
  const res = await api(`/api/admin/services/${id}`,"PUT",{...s, is_active});
  if(res.ok) refreshAll();
}

/* PRODUCTS */
async function createProduct(){
  const image_url = await uploadImageIfAny("p_img","p_img_url");
  const body = {
    title_ar: document.getElementById("p_ar").value,
    title_en: document.getElementById("p_en").value,
    desc_ar: document.getElementById("p_desc_ar").value,
    desc_en: document.getElementById("p_desc_en").value,
    price: Number(document.getElementById("p_price").value||0),
    sale_price: document.getElementById("p_sale").value ? Number(document.getElementById("p_sale").value) : null,
    in_stock: 1,
    image_url
  };
  const res = await api("/api/admin/products","POST",body);
  alert(res.ok ? "✅ تم إضافة المنتج" : "Error");
  refreshAll();
}
async function loadProducts(){
  const res = await api("/api/admin/products");
  if(!res.ok) return;
  const rows = res.data;

  document.getElementById("productsTable").innerHTML = `
    <div class="list">
      ${rows.map(p=>`
        <div class="li card" style="padding:10px">
          <div>
            <b>${p.title_ar}</b>
            <div class="muted">${p.title_en}</div>
            <div class="muted">Price: ${p.price} EGP ${p.sale_price? `| Sale: ${p.sale_price} EGP`:""}</div>
            <div class="muted">${p.image_url||""}</div>
          </div>
          <div class="row">
            <button class="btn" onclick="toggleProduct(${p.id}, ${p.is_active?0:1})">${p.is_active? "إخفاء":"إظهار"}</button>
          </div>
        </div>
      `).join("")}
    </div>
  `;
}
async function toggleProduct(id, is_active){
  const list = await api("/api/admin/products");
  const p = list.data.find(x=>x.id===id);
  if(!p) return;
  const res = await api(`/api/admin/products/${id}`,"PUT",{...p, is_active});
  if(res.ok) refreshAll();
}

/* OFFERS */
async function createOffer(){
  const image_url = await uploadImageIfAny("o_img","o_img_url");
  const body = {
    title_ar: document.getElementById("o_ar").value,
    title_en: document.getElementById("o_en").value,
    desc_ar: document.getElementById("o_desc_ar").value,
    desc_en: document.getElementById("o_desc_en").value,
    discount_percent: Number(document.getElementById("o_disc").value||0),
    image_url
  };
  const res = await api("/api/admin/offers","POST",body);
  alert(res.ok ? "✅ تم إضافة العرض" : "Error");
  refreshAll();
}
async function loadOffers(){
  const res = await api("/api/admin/offers");
  if(!res.ok) return;
  const rows = res.data;
  document.getElementById("offersTable").innerHTML = `
    <div class="list">
      ${rows.map(o=>`
        <div class="li card" style="padding:10px">
          <div>
            <b>${o.title_ar}</b>
            <div class="muted">${o.title_en}</div>
            <div class="muted">Discount: ${o.discount_percent||0}%</div>
            <div class="muted">${o.image_url||""}</div>
          </div>
          <div class="row">
            <button class="btn" onclick="toggleOffer(${o.id}, ${o.is_active?0:1})">${o.is_active? "إخفاء":"إظهار"}</button>
          </div>
        </div>
      `).join("")}
    </div>
  `;
}
async function toggleOffer(id, is_active){
  const list = await api("/api/admin/offers");
  const o = list.data.find(x=>x.id===id);
  if(!o) return;
  const res = await api(`/api/admin/offers/${id}`,"PUT",{...o, is_active});
  if(res.ok) refreshAll();
}

/* POSTS */
async function createPost(){
  const image_url = await uploadImageIfAny("b_img","b_img_url");
  const body = {
    slug: document.getElementById("b_slug").value.trim(),
    title_ar: document.getElementById("b_ar").value,
    title_en: document.getElementById("b_en").value,
    excerpt_ar: document.getElementById("b_ex_ar").value,
    excerpt_en: document.getElementById("b_ex_en").value,
    content_ar: document.getElementById("b_ct_ar").value,
    content_en: document.getElementById("b_ct_en").value,
    image_url
  };
  const res = await api("/api/admin/posts","POST",body);
  alert(res.ok ? "✅ تم إضافة المقال" : "Error (slug لازم يكون Unique)");
  refreshAll();
}
async function loadPosts(){
  const res = await api("/api/admin/posts");
  if(!res.ok) return;
  const rows = res.data;
  document.getElementById("postsTable").innerHTML = `
    <div class="list">
      ${rows.map(p=>`
        <div class="card" style="padding:10px">
          <div class="row">
            <b>${p.title_ar}</b>
            <span class="chip">${p.slug}</span>
          </div>
          <div class="muted">${p.title_en}</div>
          <div class="muted">${p.image_url||""}</div>
          <div style="margin-top:8px">
            <button class="btn" onclick="togglePost(${p.id}, ${p.is_active?0:1})">${p.is_active? "إخفاء":"إظهار"}</button>
          </div>
        </div>
      `).join("")}
    </div>
  `;
}
async function togglePost(id, is_active){
  const list = await api("/api/admin/posts");
  const p = list.data.find(x=>x.id===id);
  if(!p) return;
  const res = await api(`/api/admin/posts/${id}`,"PUT",{...p, is_active});
  if(res.ok) refreshAll();
}

/* Orders & Bookings */
async function loadOrders(){
  const res = await api("/api/admin/orders");
  if(!res.ok) return;
  const rows = res.data;
  document.getElementById("ordersTable").innerHTML = `
    <div class="list">
      ${rows.map(o=>`
        <div class="card" style="padding:10px">
          <div class="row">
            <b>#${o.id} — ${o.full_name} (${o.phone})</b>
            <span class="chip">${o.status}</span>
          </div>
          <div class="muted">Pickup: ${o.pickup_date} ${o.pickup_time}</div>
          <div class="muted">Items: ${o.items_json}</div>
        </div>
      `).join("")}
    </div>
  `;
}
async function loadBookings(){
  const res = await api("/api/admin/bookings");
  if(!res.ok) return;
  const rows = res.data;
  document.getElementById("bookingsTable").innerHTML = `
    <div class="list">
      ${rows.map(b=>`
        <div class="card" style="padding:10px">
          <div class="row">
            <b>#${b.id} — ${b.full_name} (${b.phone})</b>
            <span class="chip">${b.status}</span>
          </div>
          <div class="muted">Date: ${b.date} ${b.time} | Service ID: ${b.service_id}</div>
          <div class="muted">${b.note||""}</div>
        </div>
      `).join("")}
    </div>
  `;
}

(function init(){
  if(token()) { showApp(true); refreshAll(); }
  else showApp(false);
})();
