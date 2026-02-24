const IMAGE_BASE = "https://xl4as.github.io/invit/images/";
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyQE4D1I7djJSg-CL2BFJvK5R_ppxI0s9gQ1hZXjRgL21I8gXGwjgHgjgDhXTfiE7GH/exec";

// Ambil parameter ID dari URL (?id=...)
const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("id");
const toGuest = urlParams.get("to") || "Tamu Undangan";

document.getElementById("guest-name").textContent = toGuest;

// Fungsi Buka Undangan
function openInvitation() {
    const audio = document.getElementById("weddingAudio");
    audio.play().catch(() => console.log("Audio diblokir browser"));
    
    document.getElementById("cover").style.transform = "translateY(-100%)";
    document.body.classList.remove("no-scroll");
    document.getElementById("music-control").style.display = "flex";
    document.getElementById("content").style.display = "block";
    
    setTimeout(() => { 
        document.getElementById("cover").style.display = "none";
        AOS.init({ duration: 1000, once: true });
    }, 1000);
}

// Inisialisasi saat halaman dimuat
document.addEventListener("DOMContentLoaded", function() {
    if(!id) {
        document.getElementById("loader").innerHTML = "<h2>ID Tidak Ditemukan</h2>";
        return;
    }

    // Mengambil data dari JSDelivr (Proxy GitHub yang lebih stabil)
    const DATA_URL = `https://cdn.jsdelivr.net/gh/XL4AS/invit@main/data/${id}_invitation.json`;

    fetch(DATA_URL)
        .then(res => {
            if(!res.ok) throw new Error("File JSON tidak ditemukan");
            return res.json();
        })
        .then(data => {
            renderPage(data);
            setupCountdown(data.akad.date);
            loadWishes();
        })
        .catch(err => {
            console.error(err);
            document.getElementById("loader").innerHTML = `<h2>Data Gagal Dimuat</h2><p>Cek file data/${id}_invitation.json di GitHub.</p>`;
        });
});

// Fungsi Menampilkan Data ke HTML
function renderPage(data) {
    document.getElementById("cover-couple-name").textContent = data.title;
    document.getElementById("main-title").textContent = data.title;
    document.getElementById("hero-date").textContent = formatDate(data.akad.date);
    document.getElementById("groom-name").textContent = data.groom.name;
    document.getElementById("groom-parents").textContent = data.groom.parent;
    document.getElementById("bride-name").textContent = data.bride.name;
    document.getElementById("bride-parents").textContent = data.bride.parent;
    document.getElementById("quote-text").textContent = data.quote;
    document.getElementById("akad-date").textContent = formatDate(data.akad.date);
    document.getElementById("akad-time").textContent = data.akad.time;
    document.getElementById("resepsi-date").textContent = formatDate(data.resepsi.date);
    document.getElementById("resepsi-time").textContent = data.resepsi.time;
    document.getElementById("address-text").textContent = data.location;

    // Google Maps
    if(data.maps) {
        document.getElementById("map-container").innerHTML = `<iframe src="${data.maps}"></iframe>`;
    }

    // QRIS
    if(data.qris) {
        document.getElementById("qris-img").src = IMAGE_BASE + data.qris;
        document.getElementById("qris-box").style.display = "block";
    }

    // Gallery
    const gal = document.getElementById("gallery-grid");
    if(data.gallery) {
        gal.innerHTML = "";
        data.gallery.forEach(img => {
            const el = document.createElement("img");
            el.src = IMAGE_BASE + img;
            gal.appendChild(el);
        });
    }

    // WA Link
    const waText = encodeURIComponent(`Halo, saya ingin konfirmasi kehadiran di pernikahan ${data.title}.`);
    document.getElementById("wa-link").href = `https://wa.me/${data.phone}?text=${waText}`;
    
    // Hilangkan Loader
    document.getElementById("loader").style.display = "none";
}

// Fungsi Load Ucapan
function loadWishes() {
    const container = document.getElementById("wish-display");
    container.innerHTML = "<p style='text-align:center'>Memuat ucapan...</p>";
    
    fetch(SCRIPT_URL)
        .then(r => r.json())
        .then(data => {
            container.innerHTML = "";
            if(data.length === 0) container.innerHTML = "<p style='text-align:center'>Belum ada ucapan.</p>";
            data.reverse().forEach(item => {
                const div = document.createElement("div");
                div.className = "wish-item";
                div.innerHTML = `<strong>${item.nama}</strong><p>${item.ucapan}</p>`;
                container.appendChild(div);
            });
        })
        .catch(() => {
            container.innerHTML = "<p style='text-align:center; color:red'>Gagal memuat ucapan.</p>";
        });
}

// Form Kirim Ucapan
document.getElementById("wish-form").onsubmit = function(e) {
    e.preventDefault();
    const btn = document.getElementById("btn-send");
    const name = document.getElementById("w-name").value;
    const msg = document.getElementById("w-msg").value;

    btn.disabled = true; 
    btn.textContent = "Mengirim...";

    const formData = new FormData();
    formData.append("nama", name);
    formData.append("ucapan", msg);

    fetch(SCRIPT_URL, { method: "POST", body: formData })
        .then(() => {
            btn.disabled = false; 
            btn.textContent = "Kirim Ucapan";
            document.getElementById("wish-form").reset();
            loadWishes();
        })
        .catch(() => {
            alert("Gagal mengirim ucapan.");
            btn.disabled = false;
            btn.textContent = "Kirim Ucapan";
        });
};

// Hitung Mundur
function setupCountdown(dateStr) {
    const target = new Date(dateStr).getTime();
    const timerElement = document.getElementById("timer");

    const x = setInterval(() => {
        const now = new Date().getTime();
        const diff = target - now;
        
        if(diff > 0) {
            const d = Math.floor(diff / (1000 * 60 * 60 * 24));
            const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((diff % (1000 * 60)) / 1000);
            
            timerElement.innerHTML = `
                <div class="count-item"><span>${d}</span><br><small>Hari</small></div>
                <div class="count-item"><span>${h}</span><br><small>Jam</small></div>
                <div class="count-item"><span>${m}</span><br><small>Menit</small></div>
                <div class="count-item"><span>${s}</span><br><small>Detik</small></div>`;
        } else {
            clearInterval(x);
            timerElement.innerHTML = "<h3>Acara Sedang Berlangsung</h3>";
        }
    }, 1000);
}

// Format Tanggal Indonesia
function formatDate(s) {
    if(!s) return "";
    return new Date(s).toLocaleDateString('id-ID', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
}

// Kontrol Musik
function toggleMusic() {
    const audio = document.getElementById("weddingAudio");
    const icon = document.getElementById("music-icon");
    if(audio.paused) { 
        audio.play(); 
        icon.classList.add("fa-spin"); 
    } else { 
        audio.pause(); 
        icon.classList.remove("fa-spin"); 
    }
}
