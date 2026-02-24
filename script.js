const IMAGE_BASE = "https://xl4as.github.io/invit/images/";
const loader = document.getElementById("loader");
const content = document.getElementById("content");

const id = new URLSearchParams(location.search).get("id");

if(!id){
    loader.innerHTML = "ID Tidak Ditemukan";
} else {
    const DATA_URL = `https://raw.githubusercontent.com/XL4AS/invit/main/data/${id}_invitation.json`;
    
    fetch(DATA_URL, {cache: "no-store"})
        .then(r => r.json())
        .then(renderData)
        .catch(err => {
            loader.innerHTML = "Data Undangan Gagal Dimuat";
        });
}

function renderData(data) {
    // Header Info
    document.getElementById("title").textContent = data.title || "The Wedding Of";
    document.getElementById("couple-name-hero").textContent = `${data.groom.name} & ${data.bride.name}`;
    document.getElementById("hero-date").textContent = formatDate(data.akad.date);

    // Mempelai Section
    document.getElementById("groom-name").textContent = data.groom.name;
    document.getElementById("groom-parents").textContent = data.groom.parent;
    document.getElementById("bride-name").textContent = data.bride.name;
    document.getElementById("bride-parents").textContent = data.bride.parent;

    // Quote
    document.getElementById("quote").textContent = data.quote;

    // Acara
    document.getElementById("akad-date").textContent = formatDate(data.akad.date);
    document.getElementById("akad-time").textContent = data.akad.time;
    document.getElementById("resepsi-date").textContent = formatDate(data.resepsi.date);
    document.getElementById("resepsi-time").textContent = data.resepsi.time;

    // Lokasi
    document.getElementById("event-location").textContent = data.location;
    if(data.maps) {
        document.getElementById("map-frame-container").innerHTML = 
        `<iframe src="${data.maps}" loading="lazy"></iframe>`;
    }

    // Galeri
    const gallery = document.getElementById("gallery-grid");
    gallery.innerHTML = "";
    (data.gallery || []).forEach(name => {
        const img = document.createElement("img");
        img.src = IMAGE_BASE + name;
        img.setAttribute('data-aos', 'zoom-in');
        gallery.appendChild(img);
    });

    // WA Button
    document.getElementById("whatsapp-btn").href = `https://wa.me/${data.phone}?text=Saya akan hadir di pernikahan ${data.groom.name} %26 ${data.bride.name}`;

    // Tampilkan Konten
    loader.style.display = "none";
    content.style.display = "block";

    // Start Animasi
    AOS.init({ duration: 1200, once: false });

    // Efek Active Navigation saat Scroll
    const sections = document.querySelectorAll("section");
    const navItems = document.querySelectorAll(".nav-item");

    content.onscroll = () => {
        let current = "";
        sections.forEach((section) => {
            const sectionTop = section.offsetTop;
            if (content.scrollTop >= sectionTop - 100) {
                current = section.getAttribute("id");
            }
        });

        navItems.forEach((item) => {
            item.classList.remove("active");
            if (item.getAttribute("href").includes(current)) {
                item.classList.add("active");
            }
        });
    };
}

function formatDate(dateStr) {
    if(!dateStr) return "";
    return new Date(dateStr + "T00:00:00").toLocaleDateString("id-ID", {
        weekday: "long", day: "numeric", month: "long", year: "numeric"
    });
}
