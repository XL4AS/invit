/* =============================
   KONFIGURASI
============================= */
const IMAGE_BASE =
  "https://xl4as.github.io/invit/images/";

/* =============================
   AMBIL ID URL
============================= */
const loader  = document.getElementById("loader");
const content = document.getElementById("content");

const id = new URLSearchParams(location.search).get("id");

if(!id){
  loader.innerHTML = "ID undangan tidak ada di URL";
  throw new Error("Missing ID");
}

/* =============================
   LOAD JSON
============================= */
const DATA_URL =
  `https://raw.githubusercontent.com/XL4AS/invit/main/data/${id}_invitation.json`;

fetch(DATA_URL,{cache:"no-store"})
  .then(r=>{
    if(!r.ok) throw new Error("JSON tidak ditemukan");
    return r.json();
  })
  .then(renderData)
  .catch(err=>{
    console.error(err);
    loader.innerHTML = `Data undangan <b>${id}</b> tidak ditemukan`;
  });

/* =============================
   RENDER DATA SESUAI JSON BARU
============================= */
function renderData(data){

  document.getElementById("title").textContent = data.title || "";

  document.getElementById("couple-name").textContent =
    `${data.groom.name} & ${data.bride.name}`;

  document.getElementById("quote").textContent =
    data.quote || "";

  document.getElementById("akad-date").textContent =
    formatDate(data.akad.date);

  document.getElementById("akad-time").textContent =
    data.akad.time;

  document.getElementById("resepsi-date").textContent =
    formatDate(data.resepsi.date);

  document.getElementById("resepsi-time").textContent =
    data.resepsi.time;

  document.getElementById("event-location").textContent =
    data.location || "";

  /* MAP */
  document.getElementById("map-frame-container").innerHTML =
    data.maps && data.maps.includes("embed")
    ? `<iframe src="${data.maps}" loading="lazy"></iframe>`
    : "<p>Peta tidak tersedia</p>";

  /* GALERI (NAMA FILE SAJA) */
  const gallery = document.getElementById("gallery-slider");
  gallery.innerHTML = "";

  (data.gallery || []).forEach(name=>{
    const img = new Image();
    img.src = IMAGE_BASE + name;
    img.loading = "lazy";
    img.onerror = ()=>img.remove();
    gallery.appendChild(img);
  });

  /* WHATSAPP */
  document.getElementById("whatsapp-btn").href =
    `https://wa.me/${data.phone}?text=Saya%20akan%20hadir`;

  loader.style.display="none";
  content.style.display="block";
}

/* =============================
   FORMAT TANGGAL
============================= */
function formatDate(date){
  return new Date(date+"T00:00:00").toLocaleDateString("id-ID",{
    weekday:"long",
    day:"numeric",
    month:"long",
    year:"numeric"
  });
}
