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

function openInvitation() {
    if (audio) audio.play().catch(() => console.log("Audio play blocked"));
    cover.style.transform = "translateY(-100%)";
    document.body.classList.remove("no-scroll");
    document.getElementById("music-control").style.display = "flex";
    content.style.display = "block";
    setTimeout(() => {
        cover.style.display = "none";
        AOS.refresh();
    }, 1000);
}

document.addEventListener("DOMContentLoaded", function() {
    const btnOpen = document.getElementById("btnOpen");
    if (btnOpen) btnOpen.addEventListener("click", openInvitation);

    if(!id){
        if(loader) loader.innerHTML = "<h3>ID Undangan Tidak Ditemukan</h3>";
        return;
    }

    // Ambil Data JSON
    const DATA_URL = `https://raw.githubusercontent.com/XL4AS/invit/main/data/${id}_invitation.json`;
    fetch(DATA_URL, {cache: "no-store"})
        .then(r => {
            if(!r.ok) throw new Error();
            return r.json();
        })
        .then(data => {
            renderData(data);
            setupCountdown(data.akad.date);
            loadWishes();
        })
        .catch(() => {
            if(loader) loader.innerHTML = "<h3>Gagal Memuat Data. Cek Nama File JSON Anda.</h3>";
        });

    // Kirim Ucapan
    const wishForm = document.getElementById('wish-form');
    if(wishForm) {
        wishForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const btn = document.getElementById('btn-kirim');
            const formData = new FormData();
            formData.append('nama', document.getElementById('wish-name').value);
            formData.append('ucapan', document.getElementById('wish-message').value);

            btn.disabled = true;
            btn.innerText = "Mengirim...";

            fetch(SCRIPT_URL, { method: 'POST', body: formData })
            .then(() => {
                btn.disabled = false;
                btn.innerText = "Kirim Ucapan";
                wishForm.reset();
                loadWishes();
            });
        });
    }
});

function renderData(data) {
    document.getElementById("cover-couple-name").textContent = data.title;
    document.getElementById("couple-name").textContent = data.title;
    document.getElementById("groom-name").textContent = data.groom.name;
    document.getElementById("bride-name").textContent = data.bride.name;
    document.getElementById("groom-parents").textContent = data.groom.parent;
    document.getElementById("bride-parents").textContent = data.bride.parent;
    document.getElementById("quote").textContent = data.quote;
    document.getElementById("wedding-date-hero").textContent = formatDate(data.akad.date);
    document.getElementById("akad-date").textContent = formatDate(data.akad.date);
    document.getElementById("akad-time").textContent = data.akad.time;
    document.getElementById("resepsi-date").textContent = formatDate(data.resepsi.date);
    document.getElementById("resepsi-time").textContent = data.resepsi.time;
    document.getElementById("event-location").textContent = data.location;

    // Google Maps
    if(data.maps) {
        document.getElementById("map-frame-container").innerHTML = `<iframe src="${data.maps}" allowfullscreen></iframe>`;
    }

    // QRIS Fitur
    if(data.qris) {
        document.getElementById("qris-image").src = IMAGE_BASE + data.qris;
        document.getElementById("qris-container").style.display = "block";
    }

    // Gallery
    const gallery = document.getElementById("gallery-grid");
    if(gallery && data.gallery) {
        gallery.innerHTML = "";
        data.gallery.forEach((imgName, index) => {
            const img = document.createElement("img");
            img.src = IMAGE_BASE + imgName;
            img.setAttribute('data-aos', 'zoom-in');
            gallery.appendChild(img);
        });
    }

    const waText = encodeURIComponent(`Halo, saya ingin konfirmasi kehadiran di pernikahan ${data.title}.`);
    document.getElementById("whatsapp-btn").href = `https://wa.me/${data.phone}?text=${waText}`;

    if(loader) {
        loader.style.opacity = "0";
        setTimeout(() => loader.style.display = "none", 500);
    }
    AOS.init({ duration: 1000, once: true });
}

function loadWishes() {
    const display = document.getElementById('wish-display');
    fetch(SCRIPT_URL).then(res => res.json()).then(data => {
        display.innerHTML = '';
        if(data.length === 0) display.innerHTML = '<p style="text-align:center;">Belum ada ucapan.</p>';
        data.reverse().forEach(item => {
            const div = document.createElement('div');
            div.className = 'wish-item';
            div.innerHTML = `<strong>${item.nama}</strong><p>${item.ucapan}</p>`;
            display.appendChild(div);
        });
    });
}

function setupCountdown(dateStr) {
    const target = new Date(dateStr).getTime();
    setInterval(() => {
        const diff = target - new Date().getTime();
        if (diff > 0) {
            const d = Math.floor(diff / 86400000);
            const h = Math.floor((diff % 86400000) / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            document.getElementById("timer").innerHTML = `
                <div class="count-item"><span>${d}</span><br><small>Hari</small></div>
                <div class="count-item"><span>${h}</span><br><small>Jam</small></div>
                <div class="count-item"><span>${m}</span><br><small>Menit</small></div>
                <div class="count-item"><span>${s}</span><br><small>Detik</small></div>`;
        }
    }, 1000);
}

function formatDate(s) { return new Date(s).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }); }

function toggleMusic() {
    const icon = document.getElementById("music-icon");
    if (audio.paused) { audio.play(); icon.classList.add("fa-spin"); } 
    else { audio.pause(); icon.classList.remove("fa-spin"); }
}
