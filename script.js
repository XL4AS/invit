/**
 * KONFIGURASI DATA
 */
const DB_LINKS = {
    "anang": "https://api.allorigins.win/raw?url=" + encodeURIComponent("https://drive.google.com/uc?export=download&id=12gCivEb_jZx_sqV8uXl022WEe31J0C0U"),
    "andi": "https://api.allorigins.win/raw?url=" + encodeURIComponent("https://drive.google.com/uc?export=download&id=FILE_ID_JSON_ANDI"),
    "budi": "https://api.allorigins.win/raw?url=" + encodeURIComponent("https://drive.google.com/uc?export=download&id=FILE_ID_JSON_BUDI")
};

async function init() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (!id || !DB_LINKS[id]) {
        document.getElementById('loader').innerHTML = `<div style="text-align:center; padding:20px;"><h1>404</h1><p>Undangan tidak ditemukan.</p></div>`;
        return;
    }

    try {
        const response = await fetch(DB_LINKS[id]);
        if (!response.ok) throw new Error("Gagal akses database");
        const data = await response.json();
        renderData(data);
    } catch (error) {
        console.error(error);
        alert("Maaf, gagal memuat data. Pastikan koneksi internet stabil.");
    }
}

function renderData(data) {
    document.getElementById('groom-name').innerText = data.groom || "Pria";
    document.getElementById('bride-name').innerText = data.bride || "Wanita";
    document.getElementById('location-text').innerText = data.location || "";
    
    if (data.maps) {
        document.getElementById('map-container').innerHTML = `<a href="${data.maps}" target="_blank" class="btn-whatsapp" style="display:inline-block; background:#25d366;">Buka Google Maps</a>`;
    }
    
    const galleryContainer = document.getElementById('gallery');
    if (data.gallery) {
        data.gallery.forEach(imgUrl => {
            const cleanUrl = imgUrl.replace("file/d/", "uc?export=download&id=").split('/view')[0];
            const img = document.createElement('img');
            img.src = cleanUrl;
            img.onerror = function() { this.style.display='none'; };
            galleryContainer.appendChild(img);
        });
    }

    const rsvpBtn = document.getElementById('rsvp-btn');
    if (rsvpBtn) {
        rsvpBtn.href = `https://wa.me/${data.phone || '628'}?text=Halo, saya akan hadir di pernikahan ${data.groom} & ${data.bride}`;
    }

    if (data.date) startCountdown(data.date);

    // Hilangkan loader
    const loader = document.getElementById('loader');
    loader.style.opacity = '0';
    setTimeout(() => loader.style.display = 'none', 500);
}

/**
 * PERBAIKAN FUNGSI BUKA UNDANGAN
 */
function openInvitation() {
    const cover = document.getElementById('cover');
    const mainContent = document.getElementById('main-content');
    const music = document.getElementById('bg-music');

    // 1. Jalankan musik
    if (music) {
        music.play().catch(e => console.log("Musik butuh interaksi user"));
    }

    // 2. Animasi Cover menghilang (geser ke atas)
    cover.style.transition = 'transform 1s ease-in-out, opacity 1s ease-in-out';
    cover.style.transform = 'translateY(-100%)';
    cover.style.opacity = '0';

    // 3. Tampilkan Konten Utama
    // Kita set display block dulu, lalu di frame berikutnya ubah opacity agar fade-in bekerja
    mainContent.style.display = 'block';
    
    setTimeout(() => {
        mainContent.style.opacity = '1';
        // Hapus elemen cover dari DOM setelah animasi selesai agar tidak menghalangi klik
        setTimeout(() => {
            cover.style.display = 'none';
        }, 1000);
    }, 50);
}

function startCountdown(dateStr) {
    const target = new Date(dateStr).getTime();
    setInterval(() => {
        const now = new Date().getTime();
        const diff = target - now;
        if (diff > 0) {
            document.getElementById('days').innerText = Math.floor(diff / (1000 * 60 * 60 * 24));
            document.getElementById('hours').innerText = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            document.getElementById('mins').innerText = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        }
    }, 1000);
}

window.onload = init;
