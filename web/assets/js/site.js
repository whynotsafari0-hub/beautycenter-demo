async function apiGet(path){
  const r = await fetch(path);
  return r.json();
}

function setText(id, txt){
  const el = document.getElementById(id);
  if(el) el.textContent = txt || "";
}

async function loadSettings(lang){
  const res = await apiGet("/api/settings");
  if(!res.ok) return;
  const s = res.data;

  setText("sitePhone", s.phone);
  setText("siteEmail", s.email);
  setText("siteAddress", lang === "ar" ? s.address_ar : s.address_en);

  const fb = document.getElementById("siteFacebook");
  const ig = document.getElementById("siteInstagram");
  if(fb) fb.href = s.facebook;
  if(ig) ig.href = s.instagram;

  const ld = {
    "@context":"https://schema.org",
    "@type":"BeautySalon",
    "name": (lang==="ar" ? s.name_ar : s.name_en) || "Beauty Center",
    "telephone": s.phone,
    "email": s.email,
    "address": {
      "@type":"PostalAddress",
      "streetAddress": (lang==="ar" ? s.address_ar : s.address_en),
      "addressLocality":"Sharm El Sheikh",
      "addressCountry":"EG"
    },
    "url": location.origin + "/" + lang + "/"
  };
  const tag = document.getElementById("jsonld");
  if(tag) tag.textContent = JSON.stringify(ld);
}
