const IMAGE_BASE = "https://xl4as.github.io/invit/images/";
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyQE4D1I7djJSg-CL2BFJvK5R_ppxI0s9gQ1hZXjRgL21I8gXGwjgHgjgDhXTfiE7GH/exec";

const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("id"); // Diambil dari ?id=iklas
const toGuest = urlParams.get("to") || "Tamu Undangan";
const isAdmin = urlParams.get("admin") === "123";

document.getElementById("guest-name").textContent = toGuest;

function openInvitation() {
    const audio = document.getElementById("weddingAudio");
    audio.play().catch(() => console.log("Audio play blocked"));
    
    document.getElementById("cover").style.transform = "translateY(-100%)";
    document.body.classList.remove("no-scroll");
    document.getElementById("music-control").style.display = "flex";
    document.getElementById("content").style.display = "block";
    
    setTimeout(() => {
        document.getElementById("cover").style.display = "none";
        AOS.init();
    }, 1000);
}

document.addEventListener("DOMContentLoaded", function() {
    if(!id) {
        document.getElementById("loader").innerHTML = "<h2>ID Tidak Ditemukan</h2>";
        return;
    }

    // MEMANGGIL DATA BERDASARKAN ID (iklas.json atau iklas_invitation.json)
    // Coba panggil iklas_invitation.json sesuai pola awal Anda
    const DATA_URL = `https://raw.githubusercontent.com/XL4AS/invit/main/data/${id}_invitation.json`;

    fetch(DATA_URL)
        .then(res => {
            if(!res.ok) throw new Error("File tidak ditemukan");
            return res.json();
        })
        .then(data => {
            renderPage(data);
            setupCountdown(data.akad.date);
            loadWishes();
        })
        .catch(err => {
            console.error(err);
            // Jika iklas_invitation.json gagal, coba iklas.json
            fetch(`https://raw.githubusercontent.com/XL4AS/invit/main/data/${id}.json`)
                .then(res => res.json())
                .then(data => {
                    renderPage(data);
                    setupCountdown(data.akad.date);
                    loadWishes();
                })
                .catch(() => {
                    document.getElementById("loader").innerHTML = "<h2>Data Gagal Dimuat</h2>";
                });
        });
});

function renderPage(data) {
    document.getElementById("cover-title").textContent = data.title;
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

    if(data.maps) {
        document.getElementById("map-container").innerHTML = `<iframe src="${data.maps}"></iframe>`;
    }

    // QRIS
    if(data.qris) {
        document.getElementById("qris-box").innerHTML = `
            <img src="${IMAGE_BASE + data.qris}" style="max-width:200px; border:5px solid white; border-radius:10px; margin-top:10px;">
        `;
    }

    // Galeri
    const gal = document.getElementById("gallery-grid");
    if(data.gallery) {
        gal.innerHTML = "";
        data.gallery.forEach(img => {
            const el = document.createElement("img");
            el.src = IMAGE_BASE + img;
            gal.appendChild(el);
        });
    }

    const waText = encodeURIComponent(`Halo, saya ingin konfirmasi kehadiran di pernikahan ${data.title}.`);
    document.getElementById("wa-link").href = `https://wa.me/${data.phone}?text=${waText}`;

    document.getElementById("loader").style.display = "none";
}

function loadWishes() {
    fetch(SCRIPT_URL)
    .then(r => r.json())
    .then(data => {
        const container = document.getElementById("wish-display");
        container.innerHTML = "";
        [...data].reverse().forEach((item, index) => {
            const div = document.createElement("div");
            div.className = "wish-item";
            div.innerHTML = `<strong>${item.nama}</strong><p>${item.ucapan}</p>`;
            container.appendChild(div);
        });
    });
}

// Wish Form Logic
document.getElementById("wish-form").onsubmit = function(e) {
    e.preventDefault();
    const btn = document.getElementById("btn-send");
    btn.disabled = true;
    btn.textContent = "Mengirim...";
    
    const formData = new FormData();
    formData.append("nama", document.getElementById("w-name").value);
    formData.append("ucapan", document.getElementById("w-msg").value);

    fetch(SCRIPT_URL, { method: "POST", body: formData })
    .then(() => {
        btn.disabled = false;
        btn.textContent = "Kirim";
        document.getElementById("wish-form").reset();
        loadWishes();
    });
};

function setupCountdown(dateStr) {
    const target = new Date(dateStr).getTime();
    setInterval(() => {
        const diff = target - new Date().getTime();
        if(diff > 0) {
            const d = Math.floor(diff/86400000);
            const h = Math.floor((diff%86400000)/3600000);
            const m = Math.floor((diff%3600000)/60000);
            const s = Math.floor((diff%60000)/1000);
            document.getElementById("timer").innerHTML = `
                <div class="count-item"><span>${d}</span><br><small>Hari</small></div>
                <div class="count-item"><span>${h}</span><br><small>Jam</small></div>
                <div class="count-item"><span>${m}</span><br><small>Menit</small></div>
                <div class="count-item"><span>${s}</span><br><small>Detik</small></div>
            `;
        }
    }, 1000);
}

function formatDate(s) {
    return new Date(s).toLocaleDateString('id-ID', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
}

function toggleMusic() {
    const audio = document.getElementById("weddingAudio");
    const icon = document.getElementById("music-icon");
    if(audio.paused) { audio.play(); icon.classList.add("fa-spin"); }
    else { audio.pause(); icon.classList.remove("fa-spin"); }
}
