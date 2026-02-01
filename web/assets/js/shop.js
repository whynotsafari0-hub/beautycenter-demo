let PRODUCTS = [];

async function loadProducts(){
  const res = await fetch("/api/products").then(r=>r.json());
  if(res.ok) PRODUCTS = res.data;
}

function moneyEGP(n){ return `${Number(n||0)} EGP`; }

function renderProducts(lang){
  const grid = document.getElementById("productsGrid");
  if(!grid) return;

  grid.innerHTML = PRODUCTS.map(p=>{
    const title = lang==="ar" ? p.title_ar : p.title_en;
    const desc  = lang==="ar" ? p.desc_ar  : p.desc_en;
    const price = p.sale_price ? `<s class="muted">${moneyEGP(p.price)}</s> <b>${moneyEGP(p.sale_price)}</b>` : `<b>${moneyEGP(p.price)}</b>`;
    const img = p.image_url ? `<img src="${p.image_url}" alt="${title}" />` : `<div class="ph">IMG</div>`;
    const stock = p.in_stock ? (lang==="ar" ? "متوفر" : "Available") : (lang==="ar" ? "غير متوفر" : "Out of stock");

    return `
      <div class="card item">
        <div class="thumb">${img}</div>
        <h3>${title}</h3>
        <p class="muted">${desc}</p>
        <div class="row">
          <span class="chip">${stock}</span>
          <span class="price">${price}</span>
        </div>
        <button ${p.in_stock? "" : "disabled"} class="btn primary" onclick="addToCart(${p.id})">
          ${lang==="ar" ? "أضف للطلب" : "Add to Order"}
        </button>

        <script type="application/ld+json">
          ${JSON.stringify({
            "@context":"https://schema.org",
            "@type":"Product",
            "name": title,
            "description": desc,
            "offers": {
              "@type":"Offer",
              "priceCurrency":"EGP",
              "price": p.sale_price || p.price,
              "availability": p.in_stock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
            }
          })}
        </script>
      </div>
    `;
  }).join("");
}

const CART_KEY = "beauty_pickup_cart_v1";
function getCart(){ try {return JSON.parse(localStorage.getItem(CART_KEY))||[];} catch {return [];} }
function setCart(c){ localStorage.setItem(CART_KEY, JSON.stringify(c)); updateCartBadge(); }
function updateCartBadge(){
  const b = document.getElementById("cartCount");
  if(!b) return;
  b.textContent = getCart().reduce((a,x)=>a+x.qty,0);
}

function addToCart(id){
  const cart = getCart();
  const it = cart.find(x=>x.id===id);
  if(it) it.qty += 1;
  else cart.push({id, qty:1});
  setCart(cart);
  alert("✅ تمت الإضافة");
}

function openOrder(lang){
  const modal = document.getElementById("orderModal");
  if(!modal) return;
  renderOrder(lang);
  modal.showModal();
}

function renderOrder(lang){
  const box = document.getElementById("orderBox");
  const cart = getCart();
  const map = new Map(PRODUCTS.map(p=>[p.id,p]));
  if(cart.length===0){
    box.innerHTML = `<p class="muted">${lang==="ar"?"الطلب فارغ":"Cart is empty"}</p>`;
    return;
  }
  box.innerHTML = `
    <div class="list">
      ${cart.map(x=>{
        const p = map.get(x.id);
        const title = lang==="ar"?p.title_ar:p.title_en;
        return `<div class="li">
          <span>${title}</span>
          <input type="number" min="1" value="${x.qty}" onchange="changeQty(${x.id}, this.value)" />
          <button class="btn" onclick="removeItem(${x.id})">${lang==="ar"?"حذف":"Remove"}</button>
        </div>`;
      }).join("")}
    </div>

    <hr/>

    <form id="pickupForm">
      <div class="grid">
        <div>
          <label>${lang==="ar"?"الاسم":"Full Name"}</label>
          <input name="full_name" required />
        </div>
        <div>
          <label>${lang==="ar"?"الموبايل":"Phone"}</label>
          <input name="phone" required />
        </div>
        <div>
          <label>${lang==="ar"?"تاريخ الاستلام":"Pickup Date"}</label>
          <input type="date" name="pickup_date" required />
        </div>
        <div>
          <label>${lang==="ar"?"وقت الاستلام":"Pickup Time"}</label>
          <input type="time" name="pickup_time" required />
        </div>
      </div>
      <p class="muted">${lang==="ar"?"الدفع والاستلام داخل المكان فقط (بدون شحن).":"Pickup & pay in-store only (no shipping)."}</p>
      <button class="btn primary" type="submit">${lang==="ar"?"تأكيد الطلب":"Confirm Order"}</button>
    </form>
  `;

  const form = document.getElementById("pickupForm");
  form.addEventListener("submit", async (e)=>{
    e.preventDefault();
    const fd = new FormData(form);
    const payload = Object.fromEntries(fd.entries());
    payload.items = getCart();
    payload.lang = lang;

    const r = await fetch("/api/order", {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify(payload)
    }).then(r=>r.json());

    if(r.ok){
      alert(lang==="ar" ? "✅ تم إرسال الطلب للاستلام" : "✅ Order sent for pickup");
      setCart([]);
      document.getElementById("orderModal").close();
    } else {
      alert("Error");
    }
  });
}

function changeQty(id, v){
  const cart = getCart();
  const it = cart.find(x=>x.id===id);
  if(!it) return;
  it.qty = Math.max(1, Number(v||1));
  setCart(cart);
}
function removeItem(id){
  setCart(getCart().filter(x=>x.id!==id));
}
