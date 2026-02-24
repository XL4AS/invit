const IMAGE_BASE = "https://xl4as.github.io/invit/images/";
const loader = document.getElementById("loader");
const content = document.getElementById("content");

// Mengambil ID dari URL (?id=nama)
const id = new URLSearchParams(window.location.search).get("id");

if (!id) {
    loader.innerHTML = "ID Undangan Tidak Ditemukan";
} else {
    const DATA_URL = `https://raw.githubusercontent.com/XL4AS/invit/main/data/${id}_invitation.json`;
    
    // Fetch data dengan cache no-store agar data selalu fresh
    fetch(DATA_URL, { cache: "no-store" })
        .then(response => {
            if (!response.ok) throw new Error("File tidak ditemukan");
            return response.json();
        })
        .then(data => {
            renderData(data);
        })
        .catch(err => {
            console.error(err);
            loader.innerHTML = `Undangan untuk <b>${id}</b> tidak ditemukan`;
        });
}

function renderData(data) {
    // 1. Mapping Data ke Elemen HTML (Gunakan ID yang sesuai dengan HTML Mewah)
    
    // Hero & Names
    const coupleName = `${data.groom.name} & ${data.bride.name}`;
    if(document.getElementById("couple-name-hero")) document.getElementById("couple-name-hero").textContent = coupleName;
    if(document.getElementById("couple-name")) document.getElementById("couple-name").textContent = coupleName;
    
    document.getElementById("groom-name").textContent = data.groom.name;
    document.getElementById("bride-name").textContent = data.bride.name;
    document.getElementById("groom-parents").textContent = data.groom.parent;
    document.getElementById("bride-parents").textContent = data.bride.parent;
    
    // Quote & Tanggal Hero
    document.getElementById("quote").textContent = data.quote;
    const tglResmi = formatDate(data.akad.date);
    if(document.getElementById("hero-date")) document.getElementById("hero-date").textContent = tglResmi;
    if(document.getElementById("wedding-date-hero")) document.getElementById("wedding-date-hero").textContent = tglResmi;
    
    // Jadwal Acara
    document.getElementById("akad-date").textContent = tglResmi;
    document.getElementById("akad-time").textContent = data.akad.time;
    document.getElementById("resepsi-date").textContent = formatDate(data.resepsi.date);
    document.getElementById("resepsi-time").textContent = data.resepsi.time;
    
    // Lokasi & Maps
    document.getElementById("event-location").textContent = data.location;
    if (data.maps && data.maps.includes("http")) {
        document.getElementById("map-frame-container").innerHTML = 
            `<iframe src="${data.maps}" frameborder="0" loading="lazy" allowfullscreen></iframe>`;
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

    // WhatsApp Button
    const waText = encodeURIComponent(`Halo ${data.groom.name} & ${data.bride.name}, saya ingin konfirmasi kehadiran.`);
    document.getElementById("whatsapp-btn").href = `https://wa.me/${data.phone}?text=${waText}`;

    // 2. Tampilkan Konten
    loader.style.display = "none";
    content.style.display = "block";
    
    // 3. Inisialisasi Ulang AOS 
    // Karena kita menggunakan display:none sebelumnya, AOS perlu dipicu ulang
    setTimeout(() => {
        AOS.init({
            duration: 1000,
            once: false,
            // baris ini penting untuk desain snap-container
            mirror: true 
        });
    }, 200);
}

function formatDate(dateStr) {
    if(!dateStr) return "";
    try {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        // Menambahkan jam 00 agar tidak terjadi pergeseran tanggal akibat timezone
        return new Date(dateStr + "T00:00:00").toLocaleDateString('id-ID', options);
    } catch (e) {
        return dateStr;
    }
}
