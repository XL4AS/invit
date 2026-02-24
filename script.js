/* =========================
   DATABASE JSON UNDANGAN
========================= */
const DB_LINKS = {
  anang: "https://raw.githubusercontent.com/XL4AS/invit/main/data/anang_invitation.json",
  iklas: "https://raw.githubusercontent.com/XL4AS/invit/main/data/iklas_invitation.json"
};

/* =========================
   AMBIL ID DARI URL
========================= */
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

const loader  = document.getElementById("loader");
const content = document.getElementById("content");

if (!id) {
  loader.innerHTML = "ID undangan tidak ada di URL";
  throw new Error("ID kosong");
}

if (!DB_LINKS[id]) {
  loader.innerHTML = "ID undangan tidak ditemukan";
  throw new Error("ID tidak terdaftar");
}

/* =========================
   LOAD JSON
========================= */
fetch(DB_LINKS[id], { cache: "no-store" })
  .then(res => {
    if (!res.ok) throw new Error("File JSON tidak ditemukan");
    return res.json();
  })
  .then(renderData)
  .catch(err => {
    console.error(err);
    loader.innerHTML = "Gagal memuat data undangan";
  });

/* =========================
   RENDER DATA
========================= */
function renderData(data) {

  // Nama pasangan
  document.getElementById("couple-name").textContent =
    `${data.groom} & ${data.bride}`;

  // Tanggal (AMAN FORMAT)
  document.getElementById("event-date").textContent =
    new Date(data.date + "T00:00:00").toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    });

  // Lokasi
  document.getElementById("event-location").textContent =
    data.location || "";

  // MAP (WAJIB EMBED)
  const mapBox = document.getElementById("map-frame-container");
  if (data.maps && data.maps.includes("output=embed")) {
    mapBox.innerHTML = `
      <iframe
        src="${data.maps}"
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade">
      </iframe>`;
  } else {
    mapBox.innerHTML = "<p>Peta tidak tersedia</p>";
  }

  // GALERI (AMAN JIKA KOSONG)
  const gallery = document.getElementById("gallery-slider");
  gallery.innerHTML = "";

  if (Array.isArray(data.gallery)) {
    data.gallery.forEach(src => {
      const img = document.createElement("img");
      img.src = src;
      img.loading = "lazy";
      img.onerror = () => img.remove(); // hapus jika error
      gallery.appendChild(img);
    });
  }

  // WHATSAPP
  document.getElementById("whatsapp-btn").href =
    `https://wa.me/${data.phone}?text=Saya%20akan%20hadir`;

  // TAMPILKAN KONTEN
  loader.style.display  = "none";
  content.style.display = "block";
}
