const IMAGE_BASE = "https://xl4as.github.io/invit/images/";

const SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbyQE4D1I7djJSg-CL2BFJvK5R_ppxI0s9gQ1hZXjRgL21I8gXGwjgHgjgDhXTfiE7GH/exec";

const loader = document.getElementById("loader");
const content = document.getElementById("content");
const audio = document.getElementById("weddingAudio");
const cover = document.getElementById("cover");

const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("id");
const to = urlParams.get("to") || "Tamu Undangan";
const isAdmin = urlParams.get("admin") === "123";

// Menampilkan nama tamu
const guestNameElement = document.getElementById("guest-name");

if (guestNameElement) {
    guestNameElement.textContent = to;
}


/* =========================================================
   BUKA UNDANGAN
========================================================= */

function openInvitation() {

    // Memutar musik setelah user melakukan klik
    if (audio) {
        audio.play().catch(() => {
            console.log("Audio play diblokir browser.");
        });
    }

    if (cover) {
        cover.style.opacity = "0";
        cover.style.transform = "translateY(-100%)";
    }

    document.body.classList.remove("no-scroll");
    document.documentElement.style.overflow = "auto";

    const musicControl = document.getElementById("music-control");

    if (musicControl) {
        musicControl.style.display = "flex";
    }

    if (content) {
        content.style.display = "block";
    }

    setTimeout(() => {

        if (cover) {
            cover.style.display = "none";
        }

        if (typeof AOS !== "undefined") {
            AOS.refresh();
        }

    }, 1000);
}


/* =========================================================
   LOAD DATA UNDANGAN
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const btnOpen = document.getElementById("btnOpen");

    if (btnOpen) {
        btnOpen.addEventListener("click", openInvitation);
    }


    /* -----------------------------------------------------
       CEK ID UNDANGAN
    ----------------------------------------------------- */

    if (!id) {

        if (loader) {
            loader.innerHTML = "<h3>ID Undangan Tidak Valid</h3>";
        }

    } else {

        const DATA_URL =
            `https://raw.githubusercontent.com/XL4AS/invit/main/data/${id}_invitation.json`;

        fetch(DATA_URL, {
            cache: "no-store"
        })

        .then(response => {

            if (!response.ok) {
                throw new Error("Data undangan tidak ditemukan.");
            }

            return response.json();

        })

        .then(data => {

            renderData(data);

            if (data.akad && data.akad.date) {
                setupCountdown(data.akad.date);
            }

            loadWishes();

        })

        .catch(error => {

            console.error("Gagal memuat data:", error);

            if (loader) {
                loader.innerHTML =
                    "<h3>Data undangan tidak dapat dimuat.</h3>";
            }

        });
    }


    /* =====================================================
       FORM UCAPAN & DOA
    ===================================================== */

    const wishForm = document.getElementById("wish-form");

    if (wishForm) {

        wishForm.addEventListener("submit", function (e) {

            e.preventDefault();

            const btn = document.getElementById("btn-kirim");

            const nameElement =
                document.getElementById("wish-name");

            const messageElement =
                document.getElementById("wish-message");

            if (!nameElement || !messageElement || !btn) {
                return;
            }

            const name = nameElement.value.trim();
            const message = messageElement.value.trim();

            if (!name || !message) {
                alert("Nama dan ucapan harus diisi.");
                return;
            }

            btn.disabled = true;
            btn.innerText = "Mengirim...";

            const formData = new FormData();

            formData.append("nama", name);
            formData.append("ucapan", message);

            fetch(SCRIPT_URL, {
                method: "POST",
                body: formData
            })

            .then(() => {

                btn.disabled = false;
                btn.innerText = "Kirim Ucapan";

                wishForm.reset();

                loadWishes();

            })

            .catch(error => {

                console.error(error);

                alert("Gagal mengirim ucapan.");

                btn.disabled = false;
                btn.innerText = "Kirim Ucapan";

            });

        });
    }


    /* =====================================================
       MODAL KONFIRMASI KEHADIRAN
    ===================================================== */

    setupKonfirmasiKehadiran();

});


/* =========================================================
   RENDER DATA UNDANGAN
========================================================= */

function renderData(data) {

    const coverCoupleName =
        document.getElementById("cover-couple-name");

    const coupleName =
        document.getElementById("couple-name");

    if (coverCoupleName) {
        coverCoupleName.textContent = data.title || "";
    }

    if (coupleName) {
        coupleName.textContent = data.title || "";
    }

    document.title = data.title || "Undangan Pernikahan";


    /* -----------------------------------------------------
       DATA MEMPELAI
    ----------------------------------------------------- */

    const groomName =
        document.getElementById("groom-name");

    const brideName =
        document.getElementById("bride-name");

    const groomParents =
        document.getElementById("groom-parents");

    const brideParents =
        document.getElementById("bride-parents");

    if (groomName) {
        groomName.textContent =
            data.groom?.name || "";
    }

    if (brideName) {
        brideName.textContent =
            data.bride?.name || "";
    }

    if (groomParents) {
        groomParents.textContent =
            data.groom?.parent || "";
    }

    if (brideParents) {
        brideParents.textContent =
            data.bride?.parent || "";
    }


    /* -----------------------------------------------------
       NAMA PENUTUP
    ----------------------------------------------------- */

    const closingNames =
        document.getElementById("closing-names");

    if (closingNames) {
        closingNames.textContent =
            data.title || "";
    }


    /* -----------------------------------------------------
       QUOTE
    ----------------------------------------------------- */

    const quote =
        document.getElementById("quote");

    if (quote) {
        quote.textContent =
            data.quote || "";
    }


    /* -----------------------------------------------------
       AKAD
    ----------------------------------------------------- */

    const weddingDateHero =
        document.getElementById("wedding-date-hero");

    const akadDate =
        document.getElementById("akad-date");

    const akadTime =
        document.getElementById("akad-time");

    if (weddingDateHero && data.akad?.date) {
        weddingDateHero.textContent =
            formatDate(data.akad.date);
    }

    if (akadDate && data.akad?.date) {
        akadDate.textContent =
            formatDate(data.akad.date);
    }

    if (akadTime) {
        akadTime.textContent =
            data.akad?.time || "";
    }


    /* -----------------------------------------------------
       RESEPSI
    ----------------------------------------------------- */

    const resepsiDate =
        document.getElementById("resepsi-date");

    const resepsiTime =
        document.getElementById("resepsi-time");

    if (resepsiDate && data.resepsi?.date) {
        resepsiDate.textContent =
            formatDate(data.resepsi.date);
    }

    if (resepsiTime) {
        resepsiTime.textContent =
            data.resepsi?.time || "";
    }


    /* -----------------------------------------------------
       LOKASI
    ----------------------------------------------------- */

    const eventLocation =
        document.getElementById("event-location");

    if (eventLocation) {
        eventLocation.textContent =
            data.location || "";
    }


    /* -----------------------------------------------------
       GOOGLE MAPS
    ----------------------------------------------------- */

    const mapContainer =
        document.getElementById("map-frame-container");

    if (mapContainer) {

        if (data.maps) {

            mapContainer.innerHTML = `
                <iframe
                    src="${data.maps}"
                    loading="lazy"
                    allowfullscreen>
                </iframe>
            `;

        } else {

            mapContainer.innerHTML = "";

        }
    }


    /* -----------------------------------------------------
       GALLERY
    ----------------------------------------------------- */

    const gallery =
        document.getElementById("gallery-grid");

    if (gallery) {

        gallery.innerHTML = "";

        if (Array.isArray(data.gallery)) {

            data.gallery.forEach((imgName, index) => {

                const img =
                    document.createElement("img");

                img.src =
                    IMAGE_BASE + imgName;

                img.alt =
                    "Foto " + (index + 1);

                img.setAttribute(
                    "data-aos",
                    "zoom-in"
                );

                img.setAttribute(
                    "data-aos-delay",
                    (index * 100).toString()
                );

                gallery.appendChild(img);

            });

        }
    }


    /* -----------------------------------------------------
       LOADER
    ----------------------------------------------------- */

    if (loader) {
        loader.style.opacity = "0";
    }

    setTimeout(() => {

        if (loader) {
            loader.style.display = "none";
        }

    }, 500);


    /* -----------------------------------------------------
       AOS
    ----------------------------------------------------- */

    if (typeof AOS !== "undefined") {

        AOS.init({
            duration: 1000,
            once: true,
            offset: 50
        });

    }
}


/* =========================================================
   MODAL KONFIRMASI KEHADIRAN
========================================================= */

function setupKonfirmasiKehadiran() {

    const btnKonfirmasi =
        document.getElementById("btn-konfirmasi");

    const modal =
        document.getElementById("modalKonfirmasi");

    const closeModal =
        document.getElementById("closeModal");

    const btnKirim =
        document.getElementById("btnKirimKehadiran");

    const namaInput =
        document.getElementById("namaKehadiran");

    const jamInput =
        document.getElementById("jamKehadiran");

    const status =
        document.getElementById("statusKonfirmasi");


    // Jika elemen belum ada di HTML
    if (
        !btnKonfirmasi ||
        !modal ||
        !closeModal ||
        !btnKirim ||
        !namaInput ||
        !jamInput
    ) {
        return;
    }


    /* -----------------------------------------------------
       BUKA MODAL
    ----------------------------------------------------- */

    btnKonfirmasi.addEventListener("click", function () {

        modal.classList.add("show");

        document.body.style.overflow = "hidden";

        setTimeout(() => {
            namaInput.focus();
        }, 200);

    });


    /* -----------------------------------------------------
       TUTUP MODAL
    ----------------------------------------------------- */

    function tutupModal() {

        modal.classList.remove("show");

        document.body.style.overflow = "";

    }


    closeModal.addEventListener(
        "click",
        tutupModal
    );


    /* -----------------------------------------------------
       KLIK AREA LUAR MODAL
    ----------------------------------------------------- */

    modal.addEventListener("click", function (e) {

        if (e.target === modal) {
            tutupModal();
        }

    });


    /* -----------------------------------------------------
       TEKAN ESCAPE
    ----------------------------------------------------- */

    document.addEventListener("keydown", function (e) {

        if (
            e.key === "Escape" &&
            modal.classList.contains("show")
        ) {
            tutupModal();
        }

    });


    /* -----------------------------------------------------
       KIRIM KONFIRMASI
    ----------------------------------------------------- */

    btnKirim.addEventListener("click", function () {

        const nama =
            namaInput.value.trim();

        const jam =
            jamInput.value;


        /* Validasi */

        if (!nama) {

            status.textContent =
                "Silakan masukkan nama Anda.";

            status.style.color =
                "#d9534f";

            namaInput.focus();

            return;
        }


        if (!jam) {

            status.textContent =
                "Silakan pilih jam kehadiran.";

            status.style.color =
                "#d9534f";

            jamInput.focus();

            return;
        }


        /* Tombol loading */

        btnKirim.disabled = true;

        btnKirim.innerHTML =
            '<i class="fas fa-spinner fa-spin"></i> Mengirim...';

        status.textContent =
            "Mengirim konfirmasi...";

        status.style.color =
            "#777";


        /* -------------------------------------------------
           DATA YANG DIKIRIM KE GOOGLE SHEETS
        ------------------------------------------------- */

        const data = {

            nama: nama,

            jam: jam

        };


        /* -------------------------------------------------
           KIRIM KE GOOGLE APPS SCRIPT
        ------------------------------------------------- */

        fetch(SCRIPT_URL, {

            method: "POST",

            mode: "no-cors",

            headers: {
                "Content-Type":
                    "text/plain;charset=utf-8"
            },

            body: JSON.stringify(data)

        })

        .then(() => {

            /*
             * no-cors membuat browser tidak dapat
             * membaca response dari Apps Script.
             *
             * Jika fetch tidak menghasilkan error,
             * data dianggap berhasil dikirim.
             */

            status.textContent =
                "Konfirmasi kehadiran berhasil dikirim.";

            status.style.color =
                "#4b7d4b";


            btnKirim.innerHTML =
                '<i class="fas fa-check"></i> Berhasil';


            namaInput.value = "";
            jamInput.value = "";


            setTimeout(() => {

                tutupModal();

                btnKirim.disabled = false;

                btnKirim.innerHTML =
                    '<i class="fas fa-paper-plane"></i> Kirim Konfirmasi';

                status.textContent = "";

            }, 1500);

        })

        .catch(error => {

            console.error(
                "Gagal mengirim konfirmasi:",
                error
            );

            status.textContent =
                "Gagal mengirim konfirmasi. Silakan coba lagi.";

            status.style.color =
                "#d9534f";


            btnKirim.disabled = false;

            btnKirim.innerHTML =
                '<i class="fas fa-paper-plane"></i> Kirim Konfirmasi';

        });

    });

}


/* =========================================================
   LOAD UCAPAN
========================================================= */

function loadWishes() {

    const display =
        document.getElementById("wish-display");

    if (!display) {
        return;
    }


    fetch(SCRIPT_URL)

    .then(response => {

        if (!response.ok) {
            throw new Error(
                "Gagal mengambil data ucapan."
            );
        }

        return response.json();

    })

    .then(data => {

        if (!Array.isArray(data)) {

            display.innerHTML =
                '<p style="text-align:center; font-size:0.8rem; color:#888;">Belum ada ucapan.</p>';

            return;
        }


        if (data.length === 0) {

            display.innerHTML =
                '<p style="text-align:center; font-size:0.8rem; color:#888;">Belum ada ucapan.</p>';

            return;
        }


        display.innerHTML = "";


        /*
         * Data terbaru ditampilkan paling atas
         */

        const reversedData =
            [...data].reverse();


        reversedData.forEach(
            (item, index) => {

                /*
                 * Nomor baris spreadsheet
                 *
                 * Data array dimulai dari baris data pertama.
                 * Karena baris 1 biasanya header,
                 * index data terakhir = data.length.
                 */

                const actualRowIndex =
                    data.length - index;


                const div =
                    document.createElement("div");

                div.className =
                    "wish-item";


                /* -------------------------------------------------
                   TOMBOL HAPUS UNTUK ADMIN
                ------------------------------------------------- */

                const deleteBtn =
                    isAdmin
                        ? `
                        <button
                            onclick="deleteWish(${actualRowIndex})"
                            style="
                                position:absolute;
                                top:10px;
                                right:10px;
                                background:#fff0f0;
                                border:1px solid #ffcccc;
                                color:#ff4d4d;
                                cursor:pointer;
                                font-size:0.6rem;
                                padding:2px 5px;
                                border-radius:4px;
                            ">
                            <i class="fas fa-trash"></i>
                            Hapus
                        </button>
                        `
                        : "";


                div.innerHTML = `
                    <strong>${escapeHtml(item.nama || "")}</strong>
                    <p>${escapeHtml(item.ucapan || "")}</p>
                    ${deleteBtn}
                `;


                display.appendChild(div);

            }
        );

    })

    .catch(error => {

        console.error(
            "Gagal memuat ucapan:",
            error
        );

        display.innerHTML =
            '<p style="text-align:center; font-size:0.8rem; color:red;">Gagal memuat ucapan.</p>';

    });
}


/* =========================================================
   HAPUS UCAPAN
========================================================= */

function deleteWish(rowId) {

    if (!isAdmin) {
        return;
    }


    if (!confirm("Hapus ucapan ini?")) {
        return;
    }


    fetch(`${SCRIPT_URL}?del=${rowId}`)

    .then(response => response.text())

    .then(() => {

        loadWishes();

    })

    .catch(error => {

        console.error(
            "Gagal menghapus ucapan:",
            error
        );

        alert("Gagal menghapus ucapan.");

    });
}


/* =========================================================
   COUNTDOWN
========================================================= */

function setupCountdown(dateStr) {

    const timerElement =
        document.getElementById("timer");

    if (!timerElement || !dateStr) {
        return;
    }


    const target =
        new Date(dateStr).getTime();


    function updateCountdown() {

        const now =
            new Date().getTime();

        const diff =
            target - now;


        if (diff <= 0) {

            timerElement.innerHTML = `
                <div class="count-item">
                    <span>0</span><br>
                    <small>Hari</small>
                </div>

                <div class="count-item">
                    <span>0</span><br>
                    <small>Jam</small>
                </div>

                <div class="count-item">
                    <span>0</span><br>
                    <small>Menit</small>
                </div>

                <div class="count-item">
                    <span>0</span><br>
                    <small>Detik</small>
                </div>
            `;

            return;
        }


        const d =
            Math.floor(
                diff / (1000 * 60 * 60 * 24)
            );

        const h =
            Math.floor(
                (diff %
                    (1000 * 60 * 60 * 24)) /
                (1000 * 60 * 60)
            );

        const m =
            Math.floor(
                (diff %
                    (1000 * 60 * 60)) /
                (1000 * 60)
            );

        const s =
            Math.floor(
                (diff %
                    (1000 * 60)) /
                1000
            );


        timerElement.innerHTML = `

            <div class="count-item">
                <span>${d}</span><br>
                <small>Hari</small>
            </div>

            <div class="count-item">
                <span>${h}</span><br>
                <small>Jam</small>
            </div>

            <div class="count-item">
                <span>${m}</span><br>
                <small>Menit</small>
            </div>

            <div class="count-item">
                <span>${s}</span><br>
                <small>Detik</small>
            </div>

        `;
    }


    updateCountdown();

    setInterval(
        updateCountdown,
        1000
    );
}


/* =========================================================
   MUSIK
========================================================= */

function toggleMusic() {

    const icon =
        document.getElementById("music-icon");

    if (!audio) {
        return;
    }


    if (audio.paused) {

        audio.play()
            .then(() => {

                if (icon) {
                    icon.classList.add("fa-spin");
                }

            })
            .catch(error => {

                console.error(
                    "Gagal memutar musik:",
                    error
                );

            });

    } else {

        audio.pause();

        if (icon) {
            icon.classList.remove("fa-spin");
        }

    }
}


/* =========================================================
   FORMAT TANGGAL
========================================================= */

function formatDate(dateStr) {

    if (!dateStr) {
        return "";
    }


    const date =
        new Date(dateStr);


    if (isNaN(date.getTime())) {
        return dateStr;
    }


    return date.toLocaleDateString(
        "id-ID",
        {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        }
    );
}


/* =========================================================
   ESCAPE HTML
   Mencegah isi ucapan memasukkan HTML/script
========================================================= */

function escapeHtml(value) {

    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");
}


/* =========================================================
   NAVIGASI BOTTOM
========================================================= */

window.addEventListener("scroll", () => {

    let current = "";


    document
        .querySelectorAll("section")
        .forEach(section => {

            if (
                window.pageYOffset >=
                section.offsetTop - 250
            ) {

                current =
                    section.getAttribute("id");

            }

        });


    document
        .querySelectorAll(".nav-item")
        .forEach(item => {

            item.classList.remove("active");


            const href =
                item.getAttribute("href");


            if (
                href &&
                href.includes(current)
            ) {

                item.classList.add("active");

            }

        });

});
