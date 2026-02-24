/**
 * KONFIGURASI DATA
 * Mapping ID di URL ke Link Google Drive via Proxy (Anti-CORS)
 */
const DB_LINKS = {
    "anang": "https://api.allorigins.win/raw?url=" + encodeURIComponent("https://drive.google.com/uc?export=download&id=1T5c6bRTKWonADq7psuHGciQ1_GOqvhr1"),
    "andi": "https://api.allorigins.win/raw?url=" + encodeURIComponent("https://drive.google.com/uc?export=download&id=FILE_ID_JSON_ANDI"),
    "budi": "https://api.allorigins.win/raw?url=" + encodeURIComponent("https://drive.google.com/uc?export=download&id=FILE_ID_JSON_BUDI")
    
};

/**
 * FUNGSI UTAMA: Load Data JSON dari Google Drive
 */
async function init() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    // 1. Validasi ID
    if (!id || !DB_LINKS[id]) {
        document.getElementById('loader').innerHTML = `
            <div style="text-align:center; padding:20px; font-family:sans-serif;">
                <h1 style="color:#d4af37;">404</h1>
                <p>Undangan tidak ditemukan.</p>
                <small>Gunakan parameter ?id=anang di URL</small>
            </div>`;
        return;
    }

    // 2. Fetch Data
    try {
        const response = await fetch(DB_LINKS[id]);
        if (!response.ok) throw new Error("Gagal mengambil data dari Drive");
        
        const data = await response.json();
        renderData(data);
    } catch (error) {
        console.error("Fetch Error:", error);
        document.getElementById('loader').innerHTML = `
            <div style="text-align:center; padding:20px; font-family:sans-serif;">
                <p>⚠️ Maaf, gagal memuat data.</p>
                <p><small>Pastikan file JSON di Drive sudah disetting "Public".</small></p>
                <button onclick="location.reload()" style="padding:10px 20px; border-radius:20px; border:none; background:#d4af37; color:white; cursor:pointer;">Coba Lagi</button>
            </div>`;
    }
}

/**
 * FUNGSI RENDER: Memasukkan data JSON ke HTML
 */
function renderData(data) {
    // Nama Mempelai
    document.getElementById('groom-name').innerText = data.groom || "Pria";
    document.getElementById('bride-name').innerText = data.bride || "Wanita";
    
    // Lokasi & Maps
    document.getElementById('location-text').innerText = data.location || "";
    if (data.maps) {
        document.getElementById('map-container').innerHTML = `
            <a href="${data.maps}" target="_blank" class="btn-whatsapp" style="display:inline-block; margin-top:10px; background:#25d366;">Buka Google Maps</a>`;
    }
    
// Galeri Foto
const galleryContainer = document.getElementById('gallery');
galleryContainer.innerHTML = ""; 
if (data.gallery && data.gallery.length > 0) {
    data.gallery.forEach(imgUrl => {
        const img = document.createElement('img');
        // Gunakan URL apa adanya karena generator sudah memformatnya dengan benar
        img.src = imgUrl; 
        img.loading = "lazy";
        img.classList.add('gallery-item'); // Tambahkan class untuk styling
        img.onerror = function() { this.style.display='none'; };
        galleryContainer.appendChild(img);
    });
}

    // RSVP Link
    const rsvpBtn = document.getElementById('rsvp-btn');
    if (rsvpBtn) {
        const textWA = encodeURIComponent(`Halo ${data.groom} & ${data.bride}, saya ingin mengonfirmasi kehadiran di acara Anda.`);
        rsvpBtn.href = `https://wa.me/${data.phone || '628'}?text=${textWA}`;
    }

    // Countdown
    if (data.date) startCountdown(data.date);

    // Hilangkan Loader
    const loader = document.getElementById('loader');
    loader.style.opacity = '0';
    setTimeout(() => loader.style.display = 'none', 500);
}

/**
 * FUNGSI TOMBOL: Membuka Undangan
 */
function openInvitation() {
    const cover = document.getElementById('cover');
    const mainContent = document.getElementById('main-content');
    const music = document.getElementById('bg-music');

    // Putar Musik
    if (music) {
        music.play().catch(e => console.log("Autoplay musik diblokir."));
    }

    // Animasi Keluar Cover
    cover.style.transition = 'transform 1s ease-in-out, opacity 1s ease-in-out';
    cover.style.transform = 'translateY(-100%)';
    cover.style.opacity = '0';

    // Tampilkan Konten Utama (Fade In)
    mainContent.style.display = 'block';
    setTimeout(() => {
        mainContent.style.opacity = '1';
        // Hapus cover agar tidak menghalangi interaksi
        setTimeout(() => {
            cover.style.display = 'none';
        }, 1000);
    }, 50);
}

/**
 * FUNGSI LOGIKA: Hitung Mundur
 */
function startCountdown(dateStr) {
    const target = new Date(dateStr).getTime();
    const interval = setInterval(() => {
        const now = new Date().getTime();
        const diff = target - now;

        if (diff <= 0) {
            clearInterval(interval);
            return;
        }

        document.getElementById('days').innerText = Math.floor(diff / (1000 * 60 * 60 * 24));
        document.getElementById('hours').innerText = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        document.getElementById('mins').innerText = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    }, 1000);
}

window.onload = init;



