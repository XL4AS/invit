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
    const res = await fetch(url);
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

function renderData(data) {
  document.getElementById("couple-name").textContent =
    `${data.groom} & ${data.bride}`;

  document.getElementById("event-date").textContent =
    new Date(data.date).toLocaleString("id-ID");

  document.getElementById("event-location").textContent =
    data.location;

  document.getElementById("map-frame-container").innerHTML =
    `<iframe src="${data.maps}" loading="lazy"></iframe>`;

  const gallery = document.getElementById("gallery-slider");
  gallery.innerHTML = "";
  data.gallery.forEach(img => {
    const i = document.createElement("img");
    i.src = img;
    i.loading = "lazy";
    gallery.appendChild(i);
  });

  document.getElementById("whatsapp-btn").href =
    `https://wa.me/${data.phone}?text=Saya%20akan%20hadir`;
}

function showError(msg) {
  document.getElementById("loader").innerHTML = `<p>${msg}</p>`;
}
