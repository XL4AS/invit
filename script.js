const IMAGE_BASE = "https://xl4as.github.io/invit/images/";
const loader = document.getElementById("loader");
const content = document.getElementById("content");
const audio = document.getElementById("weddingAudio");
const cover = document.getElementById("cover");

const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("id");
const to = urlParams.get("to") || "Tamu Undangan";

document.getElementById("guest-name").textContent = to;

function openInvitation() {
    if (audio) {
        audio.play().catch(err => console.log("Audio play blocked"));
    }
    cover.style.opacity = "0";
    cover.style.transform = "translateY(-100%)";
    document.body.classList.remove("no-scroll");
    document.documentElement.style.overflow = "auto";
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
        if(loader) loader.innerHTML = "<h3>ID Undangan Tidak Valid</h3>";
    } else {
        const DATA_URL = `https://raw.githubusercontent.com/XL4AS/invit/main/data/${id}_invitation.json`;
        fetch(DATA_URL, {cache: "no-store"})
            .then(r => r.json())
            .then(data => {
                renderData(data);
                setupCountdown(data.akad.date);
            })
            .catch(err => {
                console.error(err);
                if(loader) loader.style.display = "none";
            });
    }
});

function renderData(data) {
    // COVER & HERO: Gunakan Nama Panggilan (title)
    document.getElementById("cover-couple-name").textContent = data.title;
    document.getElementById("couple-name").textContent = data.title;
    document.title = data.title;

    // ISI: Nama panjang dalam 1 baris (normal)
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

    if(data.maps) {
        document.getElementById("map-frame-container").innerHTML = 
        `<iframe src="${data.maps}" loading="lazy" allowfullscreen></iframe>`;
    }

    const gallery = document.getElementById("gallery-grid");
    if(gallery) {
        gallery.innerHTML = "";
        data.gallery.forEach((imgName, index) => {
            const img = document.createElement("img");
            img.src = IMAGE_BASE + imgName;
            img.setAttribute('data-aos', 'zoom-in');
            img.setAttribute('data-aos-delay', (index * 100).toString());
            gallery.appendChild(img);
        });
    }

    const waText = encodeURIComponent(`Halo, saya ingin konfirmasi kehadiran di pernikahan ${data.groom.name} & ${data.bride.name}.`);
    document.getElementById("whatsapp-btn").href = `https://wa.me/${data.phone}?text=${waText}`;

    if(loader) loader.style.opacity = "0";
    setTimeout(() => { if(loader) loader.style.display = "none"; }, 500);
    AOS.init({ duration: 1000, once: true, offset: 50 });
}

function setupCountdown(dateStr) {
    const target = new Date(dateStr).getTime();
    const timerElement = document.getElementById("timer");
    setInterval(() => {
        const now = new Date().getTime();
        const diff = target - now;
        if (diff > 0) {
            const d = Math.floor(diff / (1000 * 60 * 60 * 24));
            const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((diff % (1000 * 60)) / 1000);
            timerElement.innerHTML = `
                <div class="count-item"><span>${d}</span><br><small>Hari</small></div>
                <div class="count-item"><span>${h}</span><br><small>Jam</small></div>
                <div class="count-item"><span>${m}</span><br><small>Menit</small></div>
                <div class="count-item"><span>${s}</span><br><small>Detik</small></div>
            `;
        }
    }, 1000);
}

function toggleMusic() {
    const icon = document.getElementById("music-icon");
    if (audio.paused) { audio.play(); icon.classList.add("fa-spin"); } 
    else { audio.pause(); icon.classList.remove("fa-spin"); }
}

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

window.addEventListener('scroll', () => {
    let current = "";
    document.querySelectorAll("section").forEach(s => {
        if (pageYOffset >= s.offsetTop - 250) current = s.getAttribute("id");
    });
    document.querySelectorAll(".nav-item").forEach(item => {
        item.classList.remove("active");
        if (item.getAttribute("href").includes(current)) item.classList.add("active");
    });
});
