const IMAGE_BASE = "https://xl4as.github.io/invit/images/";
const loader = document.getElementById("loader");
const content = document.getElementById("content");
const audio = document.getElementById("weddingAudio");
const cover = document.getElementById("cover");

// 1. Ambil parameter dari URL
const urlParams = new URLSearchParams(location.search);
const id = urlParams.get("id");
const to = urlParams.get("to") || "Tamu Undangan";

// Set nama tamu di cover segera
document.getElementById("guest-name").textContent = to;

// 2. Fungsi Buka Undangan (Dipindah ke atas agar selalu siap dipanggil)
function openInvitation() {
    // Geser cover ke atas
    cover.style.transform = "translateY(-100%)";
    
    // Putar musik (dengan try-catch agar tidak error di beberapa browser)
    audio.play().catch(error => console.log("Autoplay dicegah browser"));
    
    // Aktifkan scroll
    document.body.classList.remove("no-scroll");
    document.getElementById("music-control").style.display = "flex";
    
    // Hapus cover dari tampilan setelah animasi selesai (1 detik)
    setTimeout(() => {
        cover.style.display = "none";
    }, 1000);
    
    // Refresh animasi AOS
    AOS.refresh();
}

// 3. Ambil Data JSON
if(!id){
    loader.innerHTML = "<div style='text-align:center;'><h3>ID Undangan Tidak Valid</h3></div>";
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
            console.error(err);
            // Jika data gagal dimuat, kita tetap sembunyikan loader agar tombol buka bisa terlihat
            loader.style.display = "none";
            document.getElementById("cover-couple-name").textContent = "Anang & Indri"; // Nama cadangan jika gagal load
        });
}

function renderData(data) {
    // Isi data ke Cover
    document.getElementById("cover-couple-name").textContent = `${data.groom.name} & ${data.bride.name}`;
    
    // Isi data ke Konten Utama
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

    // Google Maps
    if(data.maps) {
        document.getElementById("map-frame-container").innerHTML = 
        `<iframe src="${data.maps}" loading="lazy" allowfullscreen></iframe>`;
    }

    // Galeri
    const gallery = document.getElementById("gallery-grid");
    gallery.innerHTML = "";
    data.gallery.forEach((imgName, index) => {
        const img = document.createElement("img");
        img.src = IMAGE_BASE + imgName;
        img.setAttribute('data-aos', 'zoom-in');
        img.setAttribute('data-aos-delay', index * 100);
        gallery.appendChild(img);
    });

    // WhatsApp
    const waText = encodeURIComponent(`Halo, saya ingin konfirmasi kehadiran di pernikahan ${data.groom.name} & ${data.bride.name}.`);
    document.getElementById("whatsapp-btn").href = `https://wa.me/${data.phone}?text=${waText}`;

    // Sembunyikan Loader
    loader.style.display = "none";
    content.style.display = "block";
    
    // Jalankan AOS
    AOS.init({ duration: 1000, once: true });
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
    if (audio.paused) {
        audio.play();
        icon.classList.add("fa-spin");
    } else {
        audio.pause();
        icon.classList.remove("fa-spin");
    }
}

function formatDate(dateStr) {
    if(!dateStr) return "";
    return new Date(dateStr).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

window.addEventListener('scroll', () => {
    let current = "";
    const sections = document.querySelectorAll("section");
    sections.forEach(s => { if (pageYOffset >= s.offsetTop - 200) current = s.getAttribute("id"); });
    document.querySelectorAll(".nav-item").forEach(item => {
        item.classList.remove("active");
        if (item.getAttribute("href").includes(current)) item.classList.add("active");
    });
});
