const IMAGE_BASE = "https://xl4as.github.io/invit/images/";
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyQE4D1I7djJSg-CL2BFJvK5R_ppxI0s9gQ1hZXjRgL21I8gXGwjgHgjgDhXTfiE7GH/exec";

const loader = document.getElementById("loader");
const content = document.getElementById("content");
const audio = document.getElementById("weddingAudio");
const cover = document.getElementById("cover");

const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("id");
const to = urlParams.get("to") || "Tamu Undangan";
const isAdmin = urlParams.get("admin") === "123";

document.getElementById("guest-name").textContent = to;

// Fungsi Buka Undangan - Diperbaiki untuk Chrome Mobile
function openInvitation() {
    if (audio) {
        audio.play().catch(() => console.log("Audio autoplay blocked"));
    }
    
    cover.style.opacity = "0";
    cover.style.transform = "scale(1.1)";
    
    // Unlock Scroll
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
    // AOS Init Ringan untuk HP
    AOS.init({ duration: 800, once: true, disable: 'mobile' });

    const btnOpen = document.getElementById("btnOpen");
    if (btnOpen) btnOpen.onclick = openInvitation;

    if(!id){
        if(loader) loader.innerHTML = "<h3>ID Tidak Ditemukan</h3>";
    } else {
        fetch(`https://raw.githubusercontent.com/XL4AS/invit/main/data/${id}_invitation.json`, {cache: "no-store"})
            .then(r => r.json())
            .then(data => {
                renderData(data);
                setupCountdown(data.akad.date);
                loadWishes();
            })
            .catch(() => { if(loader) loader.style.display = "none"; });
    }

    // Form Handler
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
            }).catch(() => {
                alert("Gagal terkirim");
                btn.disabled = false;
            });
        };
    }
});

function renderData(data) {
    document.title = data.title;
    document.getElementById("cover-couple-name").textContent = data.title;
    document.getElementById("couple-name-hero").textContent = data.title;
    document.getElementById("closing-names").textContent = data.title;

    document.getElementById("groom-name").textContent = data.groom.name;
    document.getElementById("groom-parents").textContent = data.groom.parent;
    document.getElementById("bride-name").textContent = data.bride.name;
    document.getElementById("bride-parents").textContent = data.bride.parent;
    
    document.getElementById("quote").textContent = data.quote;
    document.getElementById("wedding-date-hero").textContent = formatDate(data.akad.date);
    document.getElementById("akad-date").textContent = formatDate(data.akad.date);
    document.getElementById("akad-time").textContent = data.akad.time;
    document.getElementById("resepsi-date").textContent = formatDate(data.resepsi.date);
    document.getElementById("resepsi-time").textContent = data.resepsi.time;
    document.getElementById("event-location").textContent = data.location;

    if(data.maps) {
        document.getElementById("map-frame-container").innerHTML = `<iframe src="${data.maps}" width="100%" height="250" style="border-radius:15px; border:none;" allowfullscreen></iframe>`;
    }

    // Gallery
    const gallery = document.getElementById("gallery-grid");
    if(gallery && data.gallery) {
        gallery.innerHTML = "";
        data.gallery.forEach(img => {
            const el = document.createElement("img");
            el.src = IMAGE_BASE + img;
            gallery.appendChild(el);
        });
    }

    // QRIS
    if(data.qris) {
        document.getElementById("gifts").style.display = "block";
        document.getElementById("qris-container").innerHTML = `<img src="${IMAGE_BASE}${data.qris}">`;
    }

    document.getElementById("whatsapp-btn").href = `https://wa.me/${data.phone}?text=Halo, saya akan hadir!`;

    if(loader) {
        loader.style.opacity = "0";
        setTimeout(() => loader.style.display = "none", 500);
    }
}

function loadWishes() {
    const display = document.getElementById('wish-display');
    fetch(SCRIPT_URL).then(r => r.json()).then(data => {
        display.innerHTML = "";
        data.reverse().forEach((item, index) => {
            const rowIdx = data.length - index;
            const del = isAdmin ? `<button onclick="deleteWish(${rowIdx})" style="color:red; float:right; border:none; background:none; font-size:0.7rem;">Hapus</button>` : '';
            const div = document.createElement('div');
            div.style = "background:white; padding:10px; border-radius:8px; margin-bottom:10px; border-left:4px solid var(--gold); font-size:0.85rem;";
            div.innerHTML = `${del}<strong>${item.nama}</strong><p style="margin:5px 0 0;">${item.ucapan}</p>`;
            display.appendChild(div);
        });
    });
}

function deleteWish(id) {
    if(confirm("Hapus?")) fetch(`${SCRIPT_URL}?del=${id}`).then(() => loadWishes());
}

function setupCountdown(date) {
    const target = new Date(date).getTime();
    setInterval(() => {
        const diff = target - new Date().getTime();
        if(diff > 0) {
            const d = Math.floor(diff / 86400000);
            const h = Math.floor((diff % 86400000) / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            document.getElementById("timer").innerHTML = `<div class="count-item"><b>${d}</b><br><small>Hari</small></div><div class="count-item"><b>${h}</b><br><small>Jam</small></div><div class="count-item"><b>${m}</b><br><small>Menit</small></div><div class="count-item"><b>${s}</b><br><small>Detik</small></div>`;
        }
    }, 1000);
}

function toggleMusic() {
    const icon = document.getElementById("music-icon");
    if (audio.paused) { audio.play(); icon.classList.add("fa-spin"); } 
    else { audio.pause(); icon.classList.remove("fa-spin"); }
}

function formatDate(s) {
    if(!s) return "";
    return new Date(s).toLocaleDateString('id-ID', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
}
