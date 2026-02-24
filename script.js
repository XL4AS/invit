/**
 * KONFIGURASI DATA
 * Mapping ID di URL ke Link Google Drive via Proxy (Anti-CORS)
 */
const DB_LINKS = {
    "anang": "https://api.allorigins.win/raw?url=" + encodeURIComponent("https://drive.google.com/uc?export=download&id=1oxPrq9UWukSjDr2FQPgv4NBsh7kZs08G"),
    "andi": "https://api.allorigins.win/raw?url=" + encodeURIComponent("https://drive.google.com/uc?export=download&id=FILE_ID_JSON_ANDI"),
    "budi": "https://api.allorigins.win/raw?url=" + encodeURIComponent("https://drive.google.com/uc?export=download&id=FILE_ID_JSON_BUDI")
    
};

/**
 * FUNGSI UTAMA: Load Data JSON dari Google Drive
 */
async function init() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (!id || !DB_LINKS[id]) {
        document.getElementById('loader').innerHTML = `
            <div style="text-align:center; padding:20px; font-family:sans-serif;">
                <h1 style="color:#d4af37;">404</h1>
                <p>Undangan tidak ditemukan.</p>
                <small>Gunakan parameter ?id=anang di URL</small>
            </div>`;
        return;
    }

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
                <button onclick="location.reload()" style="padding:10px 20px; border-radius:20px; border:none; background:#d4af37; color:white; cursor:pointer;">Coba Lagi</button>
            </div>`;
    }
}

/**
 * FUNGSI RENDER: Memasukkan data JSON ke HTML
 */
function renderData(data) {
    // 1. Nama Mempelai
    document.getElementById('groom-name').innerText = data.groom || "Pria";
    document.getElementById('bride-name').innerText = data.bride || "Wanita";
    
    // 2. Lokasi & Google Maps Embed Otomatis
    document.getElementById('location-text').innerText = data.location || "";
    const mapContainer = document.getElementById('map-container');
    
    if (data.location) {
        // Membuat preview peta otomatis berdasarkan teks lokasi
        const encodedLoc = encodeURIComponent(data.location);
        mapContainer.innerHTML = `
            <div class="map-wrapper" style="margin-top:20px; border-radius:15px; overflow:hidden; box-shadow:0 8px 20px rgba(0,0,0,0.1);">
                <iframe width="100%" height="250" frameborder="0" style="border:0" 
                    src="https://maps.google.com/maps?q=${encodedLoc}&t=&z=14&ie=UTF8&iwloc=&output=embed" allowfullscreen>
                </iframe>
            </div>
            <a href="${data.maps || '#'}" target="_blank" class="btn-whatsapp" style="display:inline-block; margin-top:15px; background:#25d366;">
                Petunjuk Jalan (Google Maps)
            </a>`;
    }
    
    // 3. Galeri Foto (Sistem Slide/Grid)
    const galleryContainer = document.getElementById('gallery');
    if (galleryContainer) {
        galleryContainer.innerHTML = ""; 
        if (data.gallery && data.gallery.length > 0) {
            data.gallery.forEach(imgUrl => {
                const img = document.createElement('img');
                img.src = imgUrl; 
                img.loading = "lazy";
                img.classList.add('gallery-item'); 
                img.onerror = function() { this.style.display='none'; };
                galleryContainer.appendChild(img);
            });
        }
    }

    // 4. RSVP WhatsApp
    const rsvpBtn = document.getElementById('rsvp-btn');
    if (rsvpBtn) {
        const textWA = encodeURIComponent(`Halo ${data.groom} & ${data.bride}, saya ingin mengonfirmasi kehadiran di acara Anda.`);
        rsvpBtn.href = `https://wa.me/${data.phone || '628'}?text=${textWA}`;
    }

    // 5. Countdown Logika
    if (data.date) startCountdown(data.date);

    // 6. Hilangkan Loader
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

    if (music) {
        music.play().catch(e => console.log("Autoplay diblokir browser, musik akan menyala setelah interaksi."));
    }

    cover.style.transform = 'translateY(-100%)';
    cover.style.opacity = '0';

    mainContent.style.display = 'block';
    setTimeout(() => {
        mainContent.style.opacity = '1';
        setTimeout(() => { cover.style.display = 'none'; }, 1000);
    }, 50);
}

/**
 * FUNGSI LOGIKA: Hitung Mundur Presisi
 */
function startCountdown(dateStr) {
    const target = new Date(dateStr).getTime();
    
    const updateTimer = () => {
        const now = new Date().getTime();
        const diff = target - now;

        if (diff <= 0) {
            document.getElementById('countdown').innerHTML = "<h3 style='color:var(--primary)'>Acara Sedang Berlangsung!</h3>";
            return;
        }

        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        document.getElementById('days').innerText = d;
        document.getElementById('hours').innerText = h;
        document.getElementById('mins').innerText = m;
    };

    updateTimer(); // Jalankan sekali di awal
    setInterval(updateTimer, 60000); // Update setiap 1 menit (lebih hemat baterai)
}

window.onload = init;


