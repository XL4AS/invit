const IMAGE_BASE = "https://xl4as.github.io/invit/images/";
const loader = document.getElementById("loader");
const content = document.getElementById("content");

const id = new URLSearchParams(location.search).get("id");

if(!id){
    loader.innerHTML = "ID undangan tidak ditemukan";
} else {
    const DATA_URL = `https://raw.githubusercontent.com/XL4AS/invit/main/data/${id}_invitation.json`;
    
    fetch(DATA_URL, {cache: "no-store"})
        .then(r => r.json())
        .then(renderData)
        .catch(err => {
            loader.innerHTML = `Data <b>${id}</b> tidak ditemukan`;
        });
}

function renderData(data) {
    // Hero & Names
    document.getElementById("couple-name").textContent = `${data.groom.name} & ${data.bride.name}`;
    document.getElementById("groom-name").textContent = data.groom.name;
    document.getElementById("bride-name").textContent = data.bride.name;
    document.getElementById("groom-parents").textContent = data.groom.parent;
    document.getElementById("bride-parents").textContent = data.bride.parent;
    
    // Quote & Date
    document.getElementById("quote").textContent = data.quote;
    document.getElementById("wedding-date-hero").textContent = formatDate(data.akad.date);
    
    // Schedule
    document.getElementById("akad-date").textContent = formatDate(data.akad.date);
    document.getElementById("akad-time").textContent = data.akad.time;
    document.getElementById("resepsi-date").textContent = formatDate(data.resepsi.date);
    document.getElementById("resepsi-time").textContent = data.resepsi.time;
    
    document.getElementById("event-location").textContent = data.location;

    // Maps
    if(data.maps && data.maps.includes("http")) {
        document.getElementById("map-frame-container").innerHTML = 
        `<iframe src="${data.maps}" loading="lazy"></iframe>`;
    }

    // Gallery
    const gallery = document.getElementById("gallery-grid");
    gallery.innerHTML = "";
    (data.gallery || []).forEach(name => {
        const img = document.createElement("img");
        img.src = IMAGE_BASE + name;
        img.setAttribute('data-aos', 'zoom-in'); // Tambah animasi tiap foto
        gallery.appendChild(img);
    });

    // WA Button
    document.getElementById("whatsapp-btn").href = `https://wa.me/${data.phone}?text=Halo, saya ingin konfirmasi kehadiran di pernikahan ${data.groom.name} & ${data.bride.name}`;

    // Show Content & Start Animation
    loader.style.display = "none";
    content.style.display = "block";
    
    // Inisialisasi AOS (Animation on Scroll)
    AOS.init({
        duration: 1000,
        once: true
    });
}

function formatDate(dateStr) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('id-ID', options);
}
