const IMAGE_BASE = "https://xl4as.github.io/invit/images/";
const loader = document.getElementById("loader");
const content = document.getElementById("content");

const id = new URLSearchParams(location.search).get("id");

if(!id){
    loader.innerHTML = "ID Undangan Tidak Valid";
} else {
    const DATA_URL = `https://raw.githubusercontent.com/XL4AS/invit/main/data/${id}_invitation.json`;
    
    fetch(DATA_URL, {cache: "no-store"})
        .then(r => r.json())
        .then(data => {
            renderData(data);
            // Sembunyikan loader dan tampilkan konten
            loader.style.display = "none";
            content.style.display = "block";
            // Jalankan AOS setelah konten muncul
            AOS.init({ duration: 1000, once: false }); 
        })
        .catch(err => {
            loader.innerHTML = "Gagal memuat data.";
        });
}

function renderData(data) {
    // Hero Section
    document.getElementById("couple-name-hero").textContent = `${data.groom.name} & ${data.bride.name}`;
    document.getElementById("hero-date").textContent = formatDate(data.akad.date);

    // Quote
    document.getElementById("quote-text").textContent = data.quote;

    // Mempelai
    document.getElementById("groom-name").textContent = data.groom.name;
    document.getElementById("groom-parents").textContent = data.groom.parent;
    document.getElementById("bride-name").textContent = data.bride.name;
    document.getElementById("bride-parents").textContent = data.bride.parent;

    // Acara
    document.getElementById("akad-date").textContent = formatDate(data.akad.date);
    document.getElementById("akad-time").textContent = data.akad.time;
    document.getElementById("resepsi-date").textContent = formatDate(data.resepsi.date);
    document.getElementById("resepsi-time").textContent = data.resepsi.time;

    // Lokasi & Maps
    document.getElementById("event-location").textContent = data.location;
    if(data.maps && data.maps.includes("http")) {
        document.getElementById("map-frame-container").innerHTML = 
        `<iframe src="${data.maps}" loading="lazy"></iframe>`;
    }

    // Galeri
    const gallery = document.getElementById("gallery-container");
    gallery.innerHTML = "";
    (data.gallery || []).slice(0, 4).forEach(name => { // Ambil 4 foto saja agar pas di layar
        const img = document.createElement("img");
        img.src = IMAGE_BASE + name;
        gallery.appendChild(img);
    });

    // WhatsApp Button
    document.getElementById("wa-btn").href = `https://wa.me/${data.phone}?text=Saya akan hadir di pernikahan ${data.groom.name} %26 ${data.bride.name}`;
}

function formatDate(dateStr) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('id-ID', options);
}
