// Konfigurasi Mapping ID Undangan ke Link Direct Download Google Drive
const DB_LINKS = {
    "andi": "https://drive.google.com/uc?export=download&id=FILE_ID_JSON_ANDI",
    "budi": "https://drive.google.com/uc?export=download&id=FILE_ID_JSON_BUDI",
    "anang": "https://drive.google.com/uc?export=download&id=12gCivEb_jZx_sqV8uXl022WEe31J0C0U"
};

async function init() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (!id || !DB_LINKS[id]) {
        alert("Undangan tidak ditemukan!");
        document.getElementById('loader').innerHTML = "<h1>404 Not Found</h1>";
        return;
    }

    try {
        const response = await fetch(DB_LINKS[id]);
        if (!response.ok) throw new Error("Gagal mengambil data");
        const data = await response.json();
        
        renderData(data);
    } catch (error) {
        console.error(error);
        alert("Maaf, terjadi kesalahan saat memuat data.");
    }
}

function renderData(data) {
    document.getElementById('groom-name').innerText = data.groom;
    document.getElementById('bride-name').innerText = data.bride;
    document.getElementById('location-text').innerText = data.location;
    
    // Gallery
    const galleryContainer = document.getElementById('gallery');
    data.gallery.forEach(imgUrl => {
        const img = document.createElement('img');
        img.src = imgUrl;
        galleryContainer.appendChild(img);
    });

    // RSVP Link
    document.getElementById('rsvp-btn').href = `https://wa.me/${data.phone || '62812345678'}?text=Halo%20saya%20akan%20datang`;

    // Start Countdown
    startCountdown(data.date);

    // Remove Loader
    document.getElementById('loader').style.display = 'none';
}

function openInvitation() {
    document.getElementById('cover').style.display = 'none';
    document.getElementById('main-content').style.display = 'block';
    document.getElementById('bg-music').play();
}

function startCountdown(dateStr) {
    const target = new Date(dateStr).getTime();
    setInterval(() => {
        const now = new Date().getTime();
        const diff = target - now;
        
        document.getElementById('days').innerText = Math.floor(diff / (1000 * 60 * 60 * 24));
        document.getElementById('hours').innerText = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        document.getElementById('mins').innerText = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    }, 1000);
}


window.onload = init;

