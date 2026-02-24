const IMAGE_BASE = "https://xl4as.github.io/invit/images/";
const loader = document.getElementById("loader");
const content = document.getElementById("content");

// Ambil ID dari URL (?id=anang_indri)
const id = new URLSearchParams(location.search).get("id");

if(!id){
    loader.innerHTML = "<div style='text-align:center; padding:20px;'><h3>ID Undangan Tidak Valid</h3><p>Silakan gunakan link yang benar.</p></div>";
} else {
    const DATA_URL = `https://raw.githubusercontent.com/XL4AS/invit/main/data/${id}_invitation.json`;
    
    fetch(DATA_URL, {cache: "no-store"})
        .then(r => {
            if (!r.ok) throw new Error("Data tidak ditemukan");
            return r.json();
        })
        .then(renderData)
        .catch(err => {
            loader.innerHTML = `<div style='text-align:center;'><h3>Maaf</h3><p>Data undangan <b>${id}</b> tidak tersedia.</p></div>`;
        });
}

function renderData(data) {
    // Judul & Nama di Hero
    document.getElementById("couple-name").textContent = `${data.groom.name} & ${data.bride.name}`;
    document.title = data.title || "Undangan Pernikahan";
    
    // Nama Mempelai & Orang Tua
    document.getElementById("groom-name").textContent = data.groom.name;
    document.getElementById("bride-name").textContent = data.bride.name;
    document.getElementById("groom-parents").textContent = data.groom.parent;
    document.getElementById("bride-parents").textContent = data.bride.parent;
    
    // Quote & Tanggal Hero
    document.getElementById("quote").textContent = data.quote;
    document.getElementById("wedding-date-hero").textContent = formatDate(data.akad.date);
    
    // Jadwal Acara
    document.getElementById("akad-date").textContent = formatDate(data.akad.date);
    document.getElementById("akad-time").textContent = data.akad.time;
    document.getElementById("resepsi-date").textContent = formatDate(data.resepsi.date);
    document.getElementById("resepsi-time").textContent = data.resepsi.time;
    
    // Lokasi
    document.getElementById("event-location").textContent = data.location;

    // Google Maps Iframe
    if(data.maps && data.maps.includes("http")) {
        // Tips: Pastikan link di JSON adalah link 'Embed' dari Google Maps agar muncul petanya
        document.getElementById("map-frame-container").innerHTML = 
        `<iframe src="${data.maps}" loading="lazy" allowfullscreen></iframe>`;
    }

    // Galeri Foto
    const gallery = document.getElementById("gallery-grid");
    gallery.innerHTML = "";
    if (data.gallery && data.gallery.length > 0) {
        data.gallery.forEach((imgName, index) => {
            const img = document.createElement("img");
            img.src = IMAGE_BASE + imgName;
            img.setAttribute('data-aos', 'zoom-in');
            img.setAttribute('data-aos-delay', index * 100);
            gallery.appendChild(img);
        });
    }

    // Link WhatsApp
    const waText = encodeURIComponent(`Halo, saya ingin konfirmasi kehadiran di pernikahan ${data.groom.name} & ${data.bride.name}. Terima kasih.`);
    document.getElementById("whatsapp-btn").href = `https://wa.me/${data.phone}?text=${waText}`;

    // Tampilkan Konten
    loader.style.display = "none";
    content.style.display = "block";
    
    // Jalankan Animasi Scroll
    AOS.init({
        duration: 1000,
        once: true,
        offset: 100
    });

    // Logika Navigasi Aktif saat Scroll
    window.addEventListener('scroll', () => {
        let current = "";
        const sections = document.querySelectorAll("section");
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (pageYOffset >= sectionTop - 150) {
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
}

function formatDate(dateStr) {
    if(!dateStr) return "";
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('id-ID', options);
}
