/* =========================================
   KONFIGURASI & AMBIL ID URL
   ========================================= */
const IMAGE_BASE = "https://xl4as.github.io/invit/images/";
const loader = document.getElementById("loader");
const content = document.getElementById("content");

// Mengambil ID dari URL (misal: index.html?id=anang)
const id = new URLSearchParams(location.search).get("id");

if (!id) {
    loader.innerHTML = "ID Undangan Tidak Ditemukan di URL";
} else {
    const DATA_URL = `https://raw.githubusercontent.com/XL4AS/invit/main/data/${id}_invitation.json`;
    
    fetch(DATA_URL, { cache: "no-store" })
        .then(r => {
            if (!r.ok) throw new Error("File JSON tidak ditemukan");
            return r.json();
        })
        .then(renderData)
        .catch(err => {
            console.error(err);
            loader.innerHTML = `Data undangan <b>${id}</b> tidak ditemukan`;
        });
}

/* =========================================
   FUNGSI RENDER DATA KE HTML
   ========================================= */
function renderData(data) {
    // 1. Bagian Hero
    document.getElementById("title").textContent = data.title || "THE WEDDING OF";
    document.getElementById("couple-name-hero").textContent = `${data.groom.name} & ${data.bride.name}`;
    document.getElementById("hero-date").textContent = formatDate(data.akad.date);

    // 2. Bagian Mempelai
    document.getElementById("groom-name").textContent = data.groom.name;
    document.getElementById("groom-parents").textContent = data.groom.parent;
    document.getElementById("bride-name").textContent = data.bride.name;
    document.getElementById("bride-parents").textContent = data.bride.parent;

    // 3. Bagian Quote
    document.getElementById("quote").textContent = data.quote || "";

    // 4. Bagian Acara (Akad & Resepsi)
    document.getElementById("akad-date").textContent = formatDate(data.akad.date);
    document.getElementById("akad-time").textContent = data.akad.time;
    document.getElementById("resepsi-date").textContent = formatDate(data.resepsi.date);
    document.getElementById("resepsi-time").textContent = data.resepsi.time;

    // 5. Bagian Lokasi
    document.getElementById("event-location").textContent = data.location;
    if (data.maps && data.maps.includes("http")) {
        document.getElementById("map-frame-container").innerHTML = 
            `<iframe src="${data.maps}" loading="lazy"></iframe>`;
    }

    // 6. Bagian Galeri (Grid)
    const gallery = document.getElementById("gallery-grid");
    gallery.innerHTML = ""; 
    (data.gallery || []).forEach(name => {
        const img = document.createElement("img");
        img.src = IMAGE_BASE + name;
        img.setAttribute('data-aos', 'zoom-in');
        img.loading = "lazy";
        img.onerror = () => img.remove(); 
        gallery.appendChild(img);
    });

    // 7. Tombol WhatsApp Konfirmasi
    const textWA = `Halo, saya ingin konfirmasi kehadiran di pernikahan ${data.groom.name} %26 ${data.bride.name}`;
    document.getElementById("whatsapp-btn").href = `https://wa.me/${data.phone}?text=${textWA}`;

    /* =========================================
       AKTIVASI UI & ANIMASI
       ========================================= */
    loader.style.display = "none";
    content.style.display = "block";

    // Jalankan AOS (Animation On Scroll)
    AOS.init({
        duration: 1000,
        once: false, // Animasi berulang saat scroll naik/turun
        mirror: true
    });

    // Jalankan Logika Navigasi Aktif
    initNavigation();
}

/* =========================================
   NAVIGASI AKTIF (MENYALA SAAT SCROLL)
   ========================================= */
function initNavigation() {
    const sections = document.querySelectorAll("section");
    const navItems = document.querySelectorAll(".nav-item");

    content.addEventListener("scroll", () => {
        let current = "";
        sections.forEach((section) => {
            const sectionTop = section.offsetTop;
            if (content.scrollTop >= sectionTop - 150) {
                current = section.getAttribute("id");
            }
        });

        navItems.forEach((item) => {
            item.classList.remove("active");
            if (item.getAttribute("href").includes(current)) {
                item.classList.add("active");
            }
        });
    });
}

/* =========================================
   FORMAT TANGGAL INDONESIA
   ========================================= */
function formatDate(dateStr) {
    if (!dateStr) return "";
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}
