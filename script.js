const DB_LINKS = {
    "anang": "https://api.allorigins.win/raw?url=" + encodeURIComponent("https://drive.google.com/uc?export=download&id=1T5c6bRTKWonADq7psuHGciQ1_GOqvhr1"),
    "andi": "https://api.allorigins.win/raw?url=" + encodeURIComponent("https://drive.google.com/uc?export=download&id=FILE_ID_JSON_ANDI"),
    "budi": "https://api.allorigins.win/raw?url=" + encodeURIComponent("https://drive.google.com/uc?export=download&id=FILE_ID_JSON_BUDI")
};

async function init() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (!id || !DB_LINKS[id]) {
        document.getElementById('loader').innerHTML = "<h1>Undangan Tidak Ditemukan</h1><p>Gunakan ?id=anang di URL</p>";
        return;
    }

    try {
        const response = await fetch(DB_LINKS[id]);
        if (!response.ok) throw new Error();
        const data = await response.json();
        renderData(data);
    } catch (e) {
        document.getElementById('loader').innerHTML = "<h1>Gagal Memuat Data</h1><p>Pastikan JSON di Drive bersifat Publik.</p>";
    }
}

function renderData(data) {
    document.getElementById('groom-name').innerText = data.groom || "Pria";
    document.getElementById('bride-name').innerText = data.bride || "Wanita";
    document.getElementById('location-text').innerText = data.location || "";

    // Render Gallery Slider
    const slider = document.getElementById('gallery-slider');
    if (data.gallery) {
        data.gallery.forEach(imgUrl => {
            const img = document.createElement('img');
            img.src = imgUrl;
            img.className = 'slider-item';
            slider.appendChild(img);
        });
    }

    // Render Peta Otomatis (Embed)
    const mapContainer = document.getElementById('map-frame-container');
    if (data.location) {
        const query = encodeURIComponent(data.location);
        mapContainer.innerHTML = `<iframe width="100%" height="300" frameborder="0" style="border:0" src="https://maps.google.com/maps?q=${query}&t=&z=14&ie=UTF8&iwloc=&output=embed" allowfullscreen></iframe>`;
    }

    // WhatsApp RSVP
    const rsvpBtn = document.getElementById('rsvp-btn');
    const msg = encodeURIComponent(`Halo ${data.groom} & ${data.bride}, saya ingin konfirmasi kehadiran di acara Anda.`);
    rsvpBtn.href = `https://wa.me/${data.phone || '628'}?text=${msg}`;

    if (data.date) startCountdown(data.date);

    // Hilangkan Loader
    const loader = document.getElementById('loader');
    loader.style.opacity = '0';
    setTimeout(() => loader.style.display = 'none', 500);
}

function openInvitation() {
    const music = document.getElementById('bg-music');
    music.play().catch(() => console.log("Musik diblokir browser"));
    
    document.getElementById('cover').style.transform = 'translateY(-100%)';
    document.getElementById('main-content').style.display = 'block';
    setTimeout(() => {
        document.getElementById('main-content').style.opacity = '1';
    }, 100);
}

function startCountdown(dateStr) {
    const target = new Date(dateStr).getTime();
    const timer = setInterval(() => {
        const now = new Date().getTime();
        const diff = target - now;

        if (diff <= 0) {
            clearInterval(timer);
            return;
        }

        document.getElementById('days').innerText = Math.floor(diff / (1000 * 60 * 60 * 24));
        document.getElementById('hours').innerText = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        document.getElementById('mins').innerText = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    }, 1000);
}

window.onload = init;
