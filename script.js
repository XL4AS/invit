const DB_LINKS = {
  anang: "https://raw.githubusercontent.com/XL4AS/invit/main/data/anang_invitation.json"
};

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

if (!id || !DB_LINKS[id]) {
  showError("ID undangan tidak ditemukan");
} else {
  loadData(DB_LINKS[id]);
}

async function loadData(url) {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error("Fetch gagal");

    const data = await res.json();
    renderData(data);

  } catch (err) {
    console.error(err);
    showError("Gagal memuat data undangan");
  }
}

/* =============================
   RENDER DATA (ANTI MACET)
============================= */
function renderData(data) {

  document.getElementById("couple-name").textContent =
    `${data.groom} & ${data.bride}`;

  // DATE SAFE
  document.getElementById("event-date").textContent =
    new Date(data.date + "T00:00:00").toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });

  document.getElementById("event-location").textContent =
    data.location || "";

  /* MAP – WAJIB EMBED */
  if (data.maps && data.maps.includes("output=embed")) {
    document.getElementById("map-frame-container").innerHTML = `
      <iframe 
        src="${data.maps}"
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade">
      </iframe>`;
  } else {
    document.getElementById("map-frame-container").innerHTML =
      `<p>Peta tidak tersedia</p>`;
  }

  /* GALLERY */
  const gallery = document.getElementById("gallery-slider");
  gallery.innerHTML = "";
  if (Array.isArray(data.gallery)) {
    data.gallery.forEach(src => {
      const img = document.createElement("img");
      img.src = src;
      img.loading = "lazy";
      img.onerror = () => img.remove();
      gallery.appendChild(img);
    });
  }

  /* WHATSAPP */
  document.getElementById("whatsapp-btn").href =
    `https://wa.me/${data.phone}?text=Saya%20akan%20hadir`;

  // ⬇️ WAJIB ADA
  document.getElementById("loader").style.display = "none";
  document.getElementById("content").style.display = "block";
}

/* =============================
   ERROR HANDLER (ANTI LOADING LOOP)
============================= */
function showError(msg) {
  const loader = document.getElementById("loader");
  loader.innerHTML = `<p>${msg}</p>`;
}
