const IMAGE_BASE = "https://xl4as.github.io/invit/images/";
const loader = document.getElementById("loader");

const id = new URLSearchParams(location.search).get("id");

if(!id){
    loader.innerHTML = "ID Undangan tidak ditemukan";
} else {
    const DATA_URL = `https://raw.githubusercontent.com/XL4AS/invit/main/data/${id}_invitation.json`;
    
    fetch(DATA_URL, {cache: "no-store"})
        .then(r => r.json())
        .then(renderData)
        .catch(err => {
            loader.innerHTML = "Data tidak ditemukan";
        });
}

// Fungsi untuk pindah Tab
function showTab(sectionId, element) {
    // Sembunyikan semua section
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    // Hapus class active di nav
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });

    // Tampilkan section yang dipilih
    document.getElementById(sectionId).classList.add('active');
    // Set nav menjadi active
    element.classList.add('active');
    
    // Scroll ke atas otomatis setiap pindah menu
    window.scrollTo(0,0);
}

function renderData(data) {
    // Header & Nama
    document.getElementById("header-names").textContent = `${data.groom.name} & ${data.bride.name}`;
    document.getElementById("groom-name").textContent = data.groom.name;
    document.getElementById("bride-name").textContent = data.bride.name;
    document.getElementById("groom-parents").textContent = data.groom.parent;
    document.getElementById("bride-parents").textContent = data.bride.parent;
    
    // Doa/Quote
    document.getElementById("quote-text").textContent = data.quote;
    
    // Tanggal
    document.getElementById("akad-date").textContent = formatDate(data.akad.date);
    document.getElementById("akad-time").textContent = data.akad.time;
    document.getElementById("resepsi-date").textContent = formatDate(data.resepsi.date);
    document.getElementById("resepsi-time").textContent = data.resepsi.time;
    document.getElementById("event-location").textContent = data.location;

    // Maps
    if(data.maps && data.maps.includes("http")) {
        document.getElementById("map-frame-container").innerHTML = 
        `<iframe src="${data.maps}" loading="lazy"></iframe>`;
    }

    // Galeri
    const gallery = document.getElementById("gallery-grid");
    gallery.innerHTML = "";
    (data.gallery || []).forEach(name => {
        const img = document.createElement("img");
        img.src = IMAGE_BASE + name;
        gallery.appendChild(img);
    });

    // WhatsApp
    document.getElementById("whatsapp-btn").href = `https://wa.me/${data.phone}?text=Halo, saya konfirmasi kehadiran di pernikahan ${data.groom.name} %26 ${data.bride.name}`;

    // Hilangkan loader
    loader.style.display = "none";
}

function formatDate(dateStr) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('id-ID', options);
}
