const IMAGE_BASE = "https://xl4as.github.io/invit/images/";
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyQE4D1I7djJSg-CL2BFJvK5R_ppxI0s9gQ1hZXjRgL21I8gXGwjgHgjgDhXTfiE7GH/exec";

const loader = document.getElementById("loader");
const content = document.getElementById("content");
const audio = document.getElementById("weddingAudio");
const cover = document.getElementById("cover");
const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("id");
const to = urlParams.get("to") || "Tamu Undangan";

document.getElementById("guest-name").textContent = to;

// Fungsi Buka Undangan (Opsi Paling Stabil untuk Mobile)
function openInvitation() {
    if (audio) {
        audio.play().catch(() => console.log("Audio autoplay diblokir browser"));
    }
    
    // Gunakan Opacity & Scale agar tidak terjadi layout shifting/flicker
    cover.style.opacity = "0";
    cover.style.transform = "scale(1.1)";
    
    // Unlock Scroll dengan metode fixed position fix
    document.body.classList.remove("no-scroll");
    document.documentElement.style.overflow = "auto";
    
    content.style.display = "block";
    document.getElementById("music-control").style.display = "flex";

    setTimeout(() => {
        cover.style.display = "none";
        AOS.refresh();
    }, 800);
}

document.addEventListener("DOMContentLoaded", function() {
    // Tombol Buka
    const btnOpen = document.getElementById("btnOpen");
    if(btnOpen) btnOpen.onclick = openInvitation;

    // Inisialisasi AOS (Matikan di layar kecil jika masih kedip parah)
    AOS.init({ 
        duration: 800, 
        once: true, 
        disable: window.innerWidth < 768 
    });

    // Fetch Data
    if(id) {
        fetch(`https://raw.githubusercontent.com/XL4AS/invit/main/data/${id}_invitation.json`, { cache: "no-store" })
        .then(r => r.json())
        .then(data => {
            renderData(data);
            setupCountdown(data.akad.date);
            loadWishes();
        })
        .catch(err => {
            console.error("Gagal load data:", err);
            if(loader) loader.style.display = "none";
        });
    } else {
        if(loader) loader.innerHTML = "<h3>ID Tidak Ditemukan</h3>";
    }

    // Form Ucapan
    const wishForm = document.getElementById('wish-form');
    if(wishForm) {
        wishForm.onsubmit = function(e) {
            e.preventDefault();
            const btn = document.getElementById('btn-kirim');
            btn.disabled = true;
            btn.innerText = "Mengirim...";

            const formData = new FormData();
            formData.append('nama', document.getElementById('wish-name').value);
            formData.append('ucapan', document.getElementById('wish-message').value);

            fetch(SCRIPT_URL, { method: 'POST', body: formData })
            .then(() => {
                btn.disabled = false;
                btn.innerText = "Kirim";
                wishForm.reset();
                loadWishes();
            })
            .catch(() => {
                alert("Gagal mengirim ucapan");
                btn.disabled = false;
            });
        };
    }
});

function renderData(data) {
    document.title = data.title;
    document.getElementById("cover-couple-name").textContent = data.title;
    document.getElementById("couple-name").textContent = data.title;
    document.getElementById("groom-name").textContent = data.groom.name;
    document.getElementById("bride-name").textContent = data.bride.name;
    document.getElementById("groom-parents").textContent = data.groom.parent;
    document.getElementById("bride-parents").textContent = data.bride.parent;
    document.getElementById("quote").textContent = data.quote;
    document.getElementById("wedding-date-hero").textContent = data.akad.date;
    document.getElementById("akad-date").textContent = data.akad.date;
    document.getElementById("akad-time").textContent = data.akad.time;

    const gallery = document.getElementById("gallery-grid");
    if(gallery && data.gallery) {
        gallery.innerHTML = "";
        data.gallery.forEach(img => {
            const el = document.createElement("img");
            el.src = IMAGE_BASE + img;
            gallery.appendChild(el);
        });
    }

    // Hilangkan Loader
    if(loader) {
        loader.style.opacity = "0";
        setTimeout(() => loader.style.display = "none", 500);
    }
}

function loadWishes() {
    const display = document.getElementById('wish-display');
    fetch(SCRIPT_URL)
    .then(r => r.json())
    .then(data => {
        display.innerHTML = "";
        data.reverse().forEach(item => {
            const div = document.createElement('div');
            div.style = "background:white; padding:10px; border-radius:8px; margin-bottom:10px; border-left:4px solid var(--gold); font-size:0.85rem;";
            div.innerHTML = `<strong>${item.nama}</strong><p style="margin:5px 0 0;">${item.ucapan}</p>`;
            display.appendChild(div);
        });
    })
    .catch(() => {
        display.innerHTML = "<p>Gagal memuat ucapan.</p>";
    });
}

function setupCountdown(dateStr) {
    const target = new Date(dateStr).getTime();
    const timer = document.getElementById("timer");
    setInterval(() => {
        const now = new Date().getTime();
        const diff = target - now;
        if(diff > 0) {
            const d = Math.floor(diff / 86400000);
            const h = Math.floor((diff % 86400000) / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            timer.innerHTML = `
                <div class="count-item"><b>${d}</b><br><small>Hari</small></div>
                <div class="count-item"><b>${h}</b><br><small>Jam</small></div>
                <div class="count-item"><b>${m}</b><br><small>Menit</small></div>
                <div class="count-item"><b>${s}</b><br><small>Detik</small></div>`;
        }
    }, 1000);
}

function toggleMusic() {
    const icon = document.getElementById("music-icon");
    if (audio.paused) { 
        audio.play(); 
        icon.classList.add("fa-spin"); 
    } else { 
        audio.pause(); 
        icon.classList.remove("fa-spin"); 
    }
}
