const IMAGE_BASE = "https://xl4as.github.io/invit/images/";
const loader = document.getElementById("loader");
const content = document.getElementById("content");

const id = new URLSearchParams(location.search).get("id");

if(!id){
    loader.innerHTML = "<div style='text-align:center;'><h3>Link Tidak Valid</h3></div>";
} else {
    const DATA_URL = `https://raw.githubusercontent.com/XL4AS/invit/main/data/${id}_invitation.json`;
    
    fetch(DATA_URL, {cache: "no-store"})
        .then(r => r.json())
        .then(data => {
            renderData(data);
            startCountdown(data.akad.date);
        })
        .catch(() => {
            loader.innerHTML = "<h3>Data Undangan Tidak Ditemukan</h3>";
        });
}

function renderData(data) {
    document.getElementById("couple-name").textContent = `${data.groom.name} & ${data.bride.name}`;
    document.title = data.title;
    
    document.getElementById("groom-name").textContent = data.groom.name;
    document.getElementById("bride-name").textContent = data.bride.name;
    document.getElementById("groom-parents").textContent = data.groom.parent;
    document.getElementById("bride-parents").textContent = data.bride.parent;
    
    document.getElementById("quote").innerHTML = `<i>"${data.quote}"</i>`;
    document.getElementById("wedding-date-hero").textContent = formatDate(data.akad.date);
    
    document.getElementById("akad-date").textContent = formatDate(data.akad.date);
    document.getElementById("akad-time").textContent = data.akad.time;
    document.getElementById("resepsi-date").textContent = formatDate(data.resepsi.date);
    document.getElementById("resepsi-time").textContent = data.resepsi.time;
    
    document.getElementById("event-location").textContent = data.location;

    if(data.maps) {
        document.getElementById("map-frame-container").innerHTML = 
        `<iframe src="${data.maps}" width="100%" height="300" style="border:0; border-radius:20px;" allowfullscreen="" loading="lazy"></iframe>`;
    }

    const gallery = document.getElementById("gallery-grid");
    gallery.innerHTML = "";
    data.gallery.forEach((imgName, index) => {
        const img = document.createElement("img");
        img.src = IMAGE_BASE + imgName;
        img.setAttribute('data-aos', 'fade-up');
        gallery.appendChild(img);
    });

    const waText = encodeURIComponent(`Halo ${data.groom.name} & ${data.bride.name}, saya akan hadir di acara pernikahan kalian. Terima kasih!`);
    document.getElementById("whatsapp-btn").href = `https://wa.me/${data.phone}?text=${waText}`;

    // Fade out loader
    setTimeout(() => {
        loader.style.opacity = "0";
        setTimeout(() => {
            loader.style.display = "none";
            content.style.display = "block";
            AOS.init();
        }, 800);
    }, 1500);
}

function startCountdown(date) {
    const target = new Date(date).getTime();
    
    // Tambahkan elemen countdown ke HTML secara dinamis jika diperlukan
    const eventSection = document.getElementById("event");
    const countDiv = document.createElement("div");
    countDiv.className = "countdown-container";
    countDiv.id = "timer";
    eventSection.prepend(countDiv);

    setInterval(() => {
        const now = new Date().getTime();
        const diff = target - now;

        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);

        countDiv.innerHTML = `
            <div class="count-item"><span>${d}</span><small>Hari</small></div>
            <div class="count-item"><span>${h}</span><small>Jam</small></div>
            <div class="count-item"><span>${m}</span><small>Menit</small></div>
            <div class="count-item"><span>${s}</span><small>Detik</small></div>
        `;
    }, 1000);
}

function formatDate(dateStr) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('id-ID', options);
}
