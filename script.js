const IMAGE_BASE = "https://xl4as.github.io/invit/images/";
const loader = document.getElementById("loader");
const content = document.getElementById("content");
const audio = document.getElementById("weddingAudio");

// Ambil parameter dari URL
const urlParams = new URLSearchParams(location.search);
const id = urlParams.get("id");
const to = urlParams.get("to") || "Tamu Undangan";

// Set nama tamu di cover
document.getElementById("guest-name").textContent = to;

if(!id){
    loader.innerHTML = "<div style='text-align:center;'><h3>ID Undangan Tidak Valid</h3><p>Gunakan link yang benar.</p></div>";
} else {
    const DATA_URL = `https://raw.githubusercontent.com/XL4AS/invit/main/data/${id}_invitation.json`;
    
    fetch(DATA_URL, {cache: "no-store"})
        .then(r => {
            if (!r.ok) throw new Error("Data tidak ditemukan");
            return r.json();
        })
        .then(data => {
            renderData(data);
            setupCountdown(data.akad.date);
        })
        .catch(err => {
            loader.innerHTML = `<div style='text-align:center;'><h3>Maaf</h3><p>Data undangan <b>${id}</b> tidak tersedia.</p></div>`;
        });
}

function openInvitation() {
    // Sembunyikan cover dan mulai musik
    document.getElementById("cover").style.transform = "translateY(-100%)";
    audio.play();
    
    // Aktifkan scroll
    document.body.classList.remove("no-scroll");
    document.getElementById("music-control").style.display = "flex";
    
    // Hapus elemen cover dari DOM setelah animasi selesai
    setTimeout(() => {
        document.getElementById("cover").style.display = "none";
    }, 1000);
    
    AOS.refresh();
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

function renderData(data) {
    // Isi data ke elemen HTML
    document.getElementById("cover-couple-name").textContent = `${data.groom.name} & ${data.bride.name}`;
    document.getElementById("couple-name").textContent = `${data.groom.name} & ${data.bride.name}`;
    document.title = data.title || "Undangan Pernikahan";

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

    if(data.maps && data.maps.includes("http")) {
        document.getElementById("map-frame-container").innerHTML = 
        `<iframe src="${data.maps}" loading="lazy" allowfullscreen></iframe>`;
    }

    const gallery = document.getElementById("gallery-grid");
    gallery.innerHTML = "";
    data.gallery.forEach((imgName, index) => {
        const img = document.createElement("img");
        img.src = IMAGE_BASE + imgName;
        img.setAttribute('data-aos', 'zoom-in');
        img.setAttribute('data-aos-delay', index * 100);
        gallery.appendChild(img);
    });

    const waText = encodeURIComponent(`Halo, saya konfirmasi hadir di pernikahan ${data.groom.name} & ${data.bride.name}. Terima kasih.`);
    document.getElementById("whatsapp-btn").href = `https://wa.me/${data.phone}?text=${waText}`;

    // Tampilkan Konten utama
    loader.style.display = "none";
    content.style.display = "block";
    
    AOS.init({
        duration: 1000,
        once: true,
        offset: 100
    });
}

function setupCountdown(dateStr) {
    const target = new Date(dateStr).getTime();
    const timerElement = document.getElementById("timer");

    setInterval(() => {
        const now = new Date().getTime();
        const diff = target - now;

        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);

        if (diff > 0) {
            timerElement.innerHTML = `
                <div class="count-item"><span>${d}</span><br><small>Hari</small></div>
                <div class="count-item"><span>${h}</span><br><small>Jam</small></div>
                <div class="count-item"><span>${m}</span><br><small>Menit</small></div>
                <div class="count-item"><span>${s}</span><br><small>Detik</small></div>
            `;
        } else {
            timerElement.innerHTML = "<h3>Acara Telah Berlangsung</h3>";
        }
    }, 1000);
}

function formatDate(dateStr) {
    if(!dateStr) return "";
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('id-ID', options);
}

// Logika Navigasi Aktif saat Scroll
window.addEventListener('scroll', () => {
    let current = "";
    const sections = document.querySelectorAll("section");
    sections.forEach(section => {
        if (pageYOffset >= section.offsetTop - 200) {
            current = section.getAttribute("id");
        }
    });

    document.querySelectorAll(".nav-item").forEach(item => {
        item.classList.remove("active");
        if (item.getAttribute("href").includes(current)) {
            item.classList.add("active");
        }
    });
});
