const IMAGE_BASE = "https://xl4as.github.io/invit/images/";
const loader = document.getElementById("loader");
const content = document.getElementById("content");
const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("id");

if (!id) {
    loader.innerHTML = "ID Undangan Tidak Ditemukan";
} else {
    // Fetch data dengan cache: "no-store" agar data selalu terbaru
    fetch(`https://raw.githubusercontent.com/XL4AS/invit/main/data/${id}_invitation.json`, { cache: "no-store" })
        .then(response => {
            if (!response.ok) throw new Error("Data tidak ditemukan");
            return response.json();
        })
        .then(data => {
            renderInvitation(data);
        })
        .catch(error => {
            console.error(error);
            loader.innerHTML = "Undangan Tidak Ditemukan";
        });
}

function renderInvitation(data) {
    // Header & Hero
    document.getElementById("title").textContent = data.title || "The Wedding Of";
    document.getElementById("couple-name-hero").textContent = `${data.groom.name} & ${data.bride.name}`;
    document.getElementById("hero-date").textContent = formatDate(data.akad.date);

    // Mempelai
    document.getElementById("groom-name").textContent = data.groom.name;
    document.getElementById("groom-parents").textContent = data.groom.parent;
    document.getElementById("bride-name").textContent = data.bride.name;
    document.getElementById("bride-parents").textContent = data.bride.parent;

    // Quote & Waktu
    document.getElementById("quote").textContent = data.quote;
    document.getElementById("akad-date").textContent = formatDate(data.akad.date);
    document.getElementById("akad-time").textContent = data.akad.time;
    document.getElementById("resepsi-date").textContent = formatDate(data.resepsi.date);
    document.getElementById("resepsi-time").textContent = data.resepsi.time;

    // Lokasi & Maps
    document.getElementById("event-location").textContent = data.location;
    if (data.maps) {
        document.getElementById("map-frame-container").innerHTML = 
            `<iframe src="${data.maps}" frameborder="0" loading="lazy"></iframe>`;
    }

    // Gallery
    const galleryGrid = document.getElementById("gallery-grid");
    galleryGrid.innerHTML = "";
    if (data.gallery && Array.isArray(data.gallery)) {
        data.gallery.forEach(name => {
            const img = document.createElement("img");
            img.src = IMAGE_BASE + name;
            img.setAttribute('data-aos', 'zoom-in');
            galleryGrid.appendChild(img);
        });
    }

    // WA Button
    document.getElementById("whatsapp-btn").href = 
        `https://wa.me/${data.phone}?text=Halo ${data.groom.name} %26 ${data.bride.name}, saya konfirmasi akan hadir.`;

    // Sembunyikan Loader & Tampilkan Konten
    loader.style.display = "none";
    content.style.display = "block";

    // Jalankan Animasi AOS
    setTimeout(() => {
        AOS.init({ duration: 1000, once: false });
    }, 100);

    // Aktifkan Fitur Scroll Monitoring
    initScrollSpy();
}

function formatDate(dateStr) {
    if (!dateStr) return "";
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateStr + "T00:00:00").toLocaleDateString('id-ID', options);
}

function initScrollSpy() {
    content.addEventListener("scroll", () => {
        const sections = document.querySelectorAll("section");
        const navItems = document.querySelectorAll(".nav-item");
        let current = "";

        sections.forEach(s => {
            if (content.scrollTop >= s.offsetTop - 150) {
                current = s.getAttribute("id");
            }
        });

        navItems.forEach(item => {
            item.classList.remove("active");
            if (item.getAttribute("href") === `#${current}`) {
                item.classList.add("active");
            }
        });
    });
}
