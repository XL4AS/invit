const DB_LINKS = {
  anang: "https://raw.githubusercontent.com/XL4AS/invit/main/data/anang_invitation.json"
};

const id = new URLSearchParams(location.search).get("id");

if (!DB_LINKS[id]) {
  document.getElementById("loader").innerHTML = "ID undangan tidak ditemukan";
} else {
  fetch(DB_LINKS[id])
    .then(r => r.json())
    .then(renderData)
    .catch(() => {
      document.getElementById("loader").innerHTML = "Gagal memuat data";
    });
}

function renderData(data){
  document.getElementById("couple-name").textContent =
    `${data.groom} & ${data.bride}`;

  document.getElementById("event-date").textContent =
    new Date(data.date+"T00:00:00").toLocaleDateString("id-ID",{
      weekday:"long",day:"numeric",month:"long",year:"numeric"
    });

  document.getElementById("event-location").textContent = data.location;

  document.getElementById("map-frame-container").innerHTML =
    `<iframe src="${data.maps}" loading="lazy"></iframe>`;

  const g = document.getElementById("gallery-slider");
  data.gallery.forEach(src=>{
    const img=document.createElement("img");
    img.src=src;
    g.appendChild(img);
  });

  document.getElementById("whatsapp-btn").href =
    `https://wa.me/${data.phone}?text=Saya%20akan%20hadir`;

  document.getElementById("loader").style.display="none";
  document.getElementById("content").style.display="block";
}
