/**
 * KONFIGURASI DATA
 * Mapping ID di URL ke Link Direct Download JSON Google Drive
 */
const DB_LINKS = {
    "anang": "https://api.allorigins.win/raw?url=" + encodeURIComponent("https://drive.google.com/uc?export=download&id=12gCivEb_jZx_sqV8uXl022WEe31J0C0U"),
    "andi": "https://api.allorigins.win/raw?url=" + encodeURIComponent("https://drive.google.com/uc?export=download&id=FILE_ID_JSON_ANDI"),
    "budi": "https://api.allorigins.win/raw?url=" + encodeURIComponent("https://drive.google.com/uc?export=download&id=FILE_ID_JSON_BUDI")
};

/**
 * FUNGSI UTAMA: Inisialisasi Data
 */
async function init() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    // 1. Validasi ID di URL
    if (!id || !DB_LINKS[id]) {
        console.error("ID Undangan tidak ditemukan dalam database.");
        document.getElementById('loader').innerHTML = `
            <div style="text-align:center; padding:20px;">
                <h1 style="color:#d4af37;">404</h1>
                <p>Maaf, undangan tidak ditemukan atau link salah.</p>
                <small>Pastikan URL mengandung ?id=anang</small>
            </div>`;
        return;
    }

    // 2. Ambil data JSON
    try {
        console.log("Sedang memuat data untuk ID:", id);
        const response = await fetch(DB_LINKS[id]);
        
        if (!response.ok) throw new Error("Gagal akses file di Drive");
        
        const data = await response.json();
        console.log("Data berhasil dimuat:", data);
        
        renderData(data);
    } catch (error) {
        console.error("Detail Error:", error);
        document.getElementById('loader').innerHTML = `
            <div style="text-align:center; padding:20px;">
                <p>⚠️ Terjadi kesalahan saat memuat data.</p>
                <button onclick="location.reload()" style="padding:8px 15px; border-radius:20px; border:none; background:#d4af37; color:white;">Coba Lagi</button>
            </div>`;
    }
}

/**
 * FUNGSI RENDER: Menampilkan data ke HTML
 */
function renderData(data) {
    // Nama Mempelai
    document.getElementById('groom-name').innerText = data.groom || "Pria";
    document.getElementById('bride-name').innerText = data.bride || "Wanita";
    
    // Lokasi & Maps
    document.getElementById('location-text').innerText = data.location || "Lokasi menyusul";
    if (data.maps) {
        const mapContainer = document.getElementById('map-container');
        mapContainer.innerHTML = `<a href="${data.maps}" target="_blank" class="btn-whatsapp" style="display:inline-block; margin-top:10px; background:#25d366;">Buka Google Maps</a>`;
    }
    
    // Galeri Foto
    const galleryContainer = document.getElementById('gallery');
    if (data.gallery && data.gallery.length > 0) {
        data.gallery.forEach(imgUrl => {
            // Pastikan link galeri juga format direct link
            const cleanUrl = imgUrl.replace("file/d/", "uc?export=download&id=").replace("/view?usp=sharing", "").replace("/view?usp=drive_link", "");
            
            const img = document.createElement('img');
            img.src = cleanUrl;
            img.loading = "lazy";
            img.alt = "Wedding Gallery";
            img.onerror = function() { this.style.display='none'; }; // Sembunyikan jika gambar gagal load
            galleryContainer.appendChild(img);
        });
    }

    // RSVP WhatsApp
    const rsvpBtn = document.getElementById('rsvp-btn');
    if (rsvpBtn) {
        const pesanWA = encodeURIComponent(`Halo ${data.groom} & ${data.bride}, saya akan datang ke acara pernikahan kalian!`);
        rsvpBtn.href = `https://wa.me/${data.phone || '62812345678'}?text=${pesanWA}`;
    }

    // Jalankan Countdown
    if (data.date) {
        startCountdown(data.date);
    }

    // Hilangkan Loading Screen
    setTimeout(() => {
        const loader = document.getElementById('loader');
        loader.style.opacity = '0';
        setTimeout(() => loader.style.display = 'none', 500);
    }, 1000);
}

/**
 * FUNGSI TOMBOL: Buka Undangan & Play Music
 */
function openInvitation() {
    document.getElementById('cover').style.transition = '0.8s';
    document.getElementById('cover').style.transform = 'translateY(-100%)';
    
    setTimeout(() => {
        document.getElementById('cover').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';
        
        const music = document.getElementById('bg-music');
        if (music) {
            music.play().catch(e => console.log("Autoplay diblokir browser, musik akan menyala setelah interaksi."));
        }
    }, 800);
}

/**
 * FUNGSI LOGIKA: Countdown Timer
 */
function startCountdown(dateStr) {
    const target = new Date(dateStr).getTime();
    
    const timer = setInterval(() => {
        const now = new Date().getTime();
        const diff = target - now;
        
        if (diff < 0) {
            clearInterval(timer);
            document.getElementById('countdown').innerHTML = "<h4>Acara Sudah Berlangsung</h4>";
            return;
        }
        
        document.getElementById('days').innerText = Math.floor(diff / (1000 * 60 * 60 * 24));
        document.getElementById('hours').innerText = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        document.getElementById('mins').innerText = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    }, 1000);
}

// Jalankan aplikasi saat halaman terbuka
window.onload = init;
