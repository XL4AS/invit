<script>
/* ==========================
   DATABASE LINK
========================== */
const DB_LINKS = {
  anang: "https://raw.githubusercontent.com/XL4AS/invit/main/data/anang_invitation.json"
};

/* ==========================
   AMBIL PARAMETER URL
========================== */
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

/* ==========================
   VALIDASI ID
========================== */
if (!id || !DB_LINKS[id]) {
  showError("ID undangan tidak ditemukan");
} else {
  loadData(DB_LINKS[id]);
}

/* ==========================
   FETCH JSON
========================== */
async function loadData(url) {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error("Fetch gagal");

    const data = await res.json();
    renderData(data);

    document.getElementById("loader").style.display = "none";
    document.getElementById("content").style.display = "block";
  } catch (err) {
    console.error(err);
    showError("Gagal memuat data undangan");
  }
}

/* ==========================
   RENDER DATA
========================== */
function renderData(data) {
  /* Nama Pasangan */
  document.getElementById("couple-name").textContent =
    `${data.groom} & ${data.bride}`;

  /* Tanggal */
  document.getElementById("event-date").textContent =
    new Date(data.date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });

  /* Lokasi */
  document.getElementById("event-location").textContent =
    data.location || "-";

  /* MAP (HARUS EMBED GOOGLE MAPS) */
  if (data.maps) {
    document.getElementById("map-frame-container").innerHTML = `
      <iframe
        src="${data.maps}"
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
      ></iframe>
    `;
  }

  /* GALERI */
  const gallery = document.getElementById("gallery-slider");
  gallery.innerHTML = "";

  if (Array.isArray(data.gallery) && data.gallery.length > 0) {
    data.gallery.forEach(url => {
      const img = document.createElement("img");
      img.src = url;
      img.loading = "lazy";
      img.alt = "Galeri";
      gallery.appendChild(img);
    });
  } else {
    gallery.innerHTML = "<p>Galeri belum tersedia</p>";
  }

  /* WHATSAPP */
  if (data.phone) {
    document.getElementById("whatsapp-btn").href =
      `https://wa.me/${data.phone}?text=Assalamualaikum,%20saya%20akan%20hadir`;
  }
}

/* ==========================
   ERROR HANDLER
========================== */
function showError(msg) {
  document.getElementById("loader").innerHTML =
    `<p style="color:red;text-align:center">${msg}</p>`;
}
</script>
