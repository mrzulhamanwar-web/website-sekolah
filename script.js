// =================================
// KONFIGURASI & HELPER UTAMA
// =================================
const API_BASE_URL = '/api';
// Helper Function untuk Fetch Data API
async function muatDataAPI(endpoint) {
  try {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`);
    if (!response.ok) {
      throw new Error(`HTTP Error status: ${response.status}`);
    }
    const hasil = await response.json();
    return Array.isArray(hasil) ? hasil : hasil.data || [];
  } catch (error) {
    console.error(`Error memuat API /${endpoint}:`, error);
    return null;
  }
}

// Helper Terpusat untuk Normalisasi Path Gambar
function dapatkanUrlGambar(path, fallback = 'https://via.placeholder.com/150') {
  if (!path) return fallback;
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  if (path.startsWith('/uploads/')) return path;
  return `/uploads/${path}`;
}
console.log('FILE ADMIN JS BERJALAN');
// =================================
// PENGATURAN & IDENTITAS SEKOLAH
// =================================
async function muatPengaturanSekolah() {
  const elLogo = document.getElementById('logo-sekolah');
  const elNama = document.getElementById('nama-sekolah');
  const elSlogan = document.getElementById('slogan-sekolah');

  const dataArr = await muatDataAPI('pengaturan_sekolah');
  if (!dataArr || dataArr.length === 0) return;

  const data = dataArr[0] || dataArr;
  if (elLogo && data.logo) elLogo.src = data.logo;
  if (elNama && data.nama_sekolah) elNama.textContent = data.nama_sekolah;
  if (elSlogan && data.slogan) elSlogan.textContent = data.slogan;
}

async function muatIdentitasSekolah() {
  try {
    const response = await fetch('/api/identitas');
    const data = await response.json();
    const sekolah = Array.isArray(data) ? data[0] : data;

    if (sekolah) {
      const elNama = document.getElementById('nama-sekolah');
      const elSlogan = document.getElementById('slogan-sekolah');
      const elLogo = document.getElementById('logo-sekolah');

      if (elNama && sekolah.nama_sekolah)
        elNama.innerText = sekolah.nama_sekolah;
      if (elSlogan && sekolah.slogan) elSlogan.innerText = sekolah.slogan;
      if (elLogo && sekolah.logo) elLogo.src = sekolah.logo;
    }
  } catch (err) {
    console.error('Gagal memuat identitas sekolah:', err);
  }
}

// =================================
// NAVIGASI DENGAN PENGURUTAN (SORT)
// =================================
async function muatNavbar() {
  const wadahMenu = document.getElementById('wadah-menu');
  const wadahFooter = document.getElementById('wadah-menu-footer');

  const dataNavbar = await muatDataAPI('navbar');
  if (!dataNavbar || dataNavbar.length === 0) return;

  // Urutkan data berdasarkan urutan_nav (terkecil ke terbesar)
  const menuTersusun = dataNavbar.sort(
    (a, b) => Number(a.urutan_nav) - Number(b.urutan_nav)
  );

  if (wadahMenu) {
    wadahMenu.innerHTML = menuTersusun
      .map((item) => `<li><a href="${item.url_nav}">${item.nama_menu}</a></li>`)
      .join('');
  }

  if (wadahFooter) {
    wadahFooter.innerHTML = menuTersusun
      .map(
        (item) =>
          `<a href="${item.url_nav}" style="display: block; margin-bottom: 8px;">${item.nama_menu}</a>`
      )
      .join('');
  }
}

// Global Event Delegation untuk Smooth Scroll (Support Elemen Dinamis)
document.addEventListener('click', (event) => {
  const link = event.target.closest('.main-nav a, a[href^="#"]');
  if (!link) return;

  const tujuan = link.getAttribute('href');
  if (tujuan && tujuan.startsWith('#') && tujuan.length > 1) {
    const elemenTujuan = document.querySelector(tujuan);
    if (elemenTujuan) {
      event.preventDefault();
      elemenTujuan.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
});

// =================================
// SLIDER UTAMA
// =================================
function inisialisasiEventSliderUtama() {
  const semuaSlide = document.querySelectorAll('#wadah-slide-utama .slide');
  const semuaDot = document.querySelectorAll('#wadah-dot-utama .dot');
  if (semuaSlide.length === 0) return;

  let slideAktifSekarang = 0;
  let timerOtomatis = null;

  function jalankanPerpindahan(indexBaru) {
    if (semuaSlide[slideAktifSekarang])
      semuaSlide[slideAktifSekarang].classList.remove('active');
    if (semuaDot[slideAktifSekarang])
      semuaDot[slideAktifSekarang].classList.remove('active');

    slideAktifSekarang = (indexBaru + semuaSlide.length) % semuaSlide.length;

    if (semuaSlide[slideAktifSekarang])
      semuaSlide[slideAktifSekarang].classList.add('active');
    if (semuaDot[slideAktifSekarang])
      semuaDot[slideAktifSekarang].classList.add('active');
  }

  function fotoBerikutnya() {
    jalankanPerpindahan(slideAktifSekarang + 1);
  }

  function mulaiMundur() {
    if (timerOtomatis) clearInterval(timerOtomatis);
    timerOtomatis = setInterval(fotoBerikutnya, 5000);
  }

  function segarTimerOtomatis() {
    clearInterval(timerOtomatis);
    mulaiMundur();
  }

  semuaDot.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      jalankanPerpindahan(index);
      segarTimerOtomatis();
    });
  });

  semuaSlide.forEach((slide) => {
    slide.addEventListener('click', () => {
      fotoBerikutnya();
      segarTimerOtomatis();
    });
  });

  mulaiMundur();
}

async function muatSliderUtamaDariDatabase() {
  const wadahSlide = document.getElementById('wadah-slide-utama');
  const wadahDot = document.getElementById('wadah-dot-utama');
  if (!wadahSlide) return;

  const daftarSlide = await muatDataAPI('slider-utama');
  wadahSlide.innerHTML = '';
  if (wadahDot) wadahDot.innerHTML = '';

  if (!daftarSlide || daftarSlide.length === 0) return;

  daftarSlide.forEach((item, index) => {
    const statusAktif = index === 0 ? 'active' : '';
    const urlGambar = dapatkanUrlGambar(item.gambar);

    const slideHTML = `
      <div class="slide ${statusAktif}">
          <img src="${urlGambar}" alt="${item.judul || 'SMK Multi Karya'}">
          ${
            item.judul
              ? `
            <div class="slide-caption">
                <span class="badge">Informasi</span>
                <h3>${item.judul}</h3>
                <p>${item.deskripsi || ''}</p>
            </div>
          `
              : ''
          }
      </div>`;
    wadahSlide.innerHTML += slideHTML;

    if (wadahDot) {
      wadahDot.innerHTML += `<button class="dot ${statusAktif}"></button>`;
    }
  });

  inisialisasiEventSliderUtama();
}

// =================================
// PROGRAM KEAHLIAN
// =================================
async function muatKonsentrasiKeahlian() {
  const wadahKeahlian = document.getElementById('wadah-keahlian');
  if (!wadahKeahlian) return;

  const daftarKeahlian = await muatDataAPI('keahlian');
  if (!daftarKeahlian || daftarKeahlian.length === 0) {
    wadahKeahlian.innerHTML = '<p>Belum ada data konsentrasi keahlian.</p>';
    return;
  }

  wadahKeahlian.innerHTML = daftarKeahlian
    .map((item) => {
      const rawGambar = item.gambar || item.logo_keahlian || item.logo_jurusan;
      const urlGambar = dapatkanUrlGambar(
        rawGambar,
        'https://via.placeholder.com/150'
      );
      const kode = item.kode_keahlian || item.kode_jurusan || item.kode || '';
      const nama =
        item.nama_keahlian || item.nama_jurusan || item.nama || 'Tanpa Nama';

      return `
      <div class="item-jurusan">
          <img src="${urlGambar}" alt="${nama}" class="jurusan-img-logo" onerror="this.onerror=null; this.src='https://via.placeholder.com/150';">
          <h3>${kode}</h3>
          <p>${nama}</p>
      </div>`;
    })
    .join('');
}

// =================================
// LIGHTBOX GALERI
// =================================
function inisialisasiLightbox() {
  const lightbox = document.querySelector('#lightbox');
  const gambarLightbox = document.querySelector('#gambarLightbox');
  const tutupLightbox = document.querySelector('#tutupLightbox');
  const semuaFoto = document.querySelectorAll(
    '#wadah-galeri img, .foto-galeri img'
  );

  if (!lightbox || !gambarLightbox || semuaFoto.length === 0) return;

  semuaFoto.forEach((foto) => {
    foto.style.cursor = 'pointer';
    foto.onclick = (e) => {
      e.preventDefault();
      gambarLightbox.src = foto.src;
      lightbox.style.display = 'flex';
      setTimeout(() => lightbox.classList.add('aktif'), 10);
    };
  });

  const tutupModal = () => {
    lightbox.classList.remove('aktif');
    setTimeout(() => {
      lightbox.style.display = 'none';
      gambarLightbox.src = '';
    }, 300);
  };

  if (tutupLightbox) tutupLightbox.onclick = tutupModal;
  lightbox.onclick = (event) => {
    if (event.target === lightbox) tutupModal();
  };
}

// =================================
// INFORMASI, BERITA & PENGUMUMAN
// =================================
async function muatinformasiDariDatabase() {
  const wadahInformasi = document.getElementById('wadah-informasi');
  if (!wadahInformasi) return;

  const daftarInformasi = await muatDataAPI('informasi-depan');
  if (!daftarInformasi || daftarInformasi.length === 0) {
    wadahInformasi.innerHTML = '<p>Belum ada Informasi terbaru.</p>';
    return;
  }

  const svgFallback =
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100"><rect width="200" height="100" fill="%23ddd"/><text x="100" y="55" font-size="14" text-anchor="middle" fill="%23666">No Image</text></svg>';

  wadahInformasi.innerHTML = daftarInformasi
    .map((item) => {
      const sumberGambar = dapatkanUrlGambar(
        item.gambar_informasi,
        svgFallback
      );
      const judulInfo = item.judul_informasi || 'Informasi';
      const linkInfo = item.link_informasi || '#';

      return `
      <a href="${linkInfo}" class="banner-info" target="_blank">
          <img src="${sumberGambar}" alt="${judulInfo}" onerror="this.onerror=null; this.src='${svgFallback}';">
      </a>`;
    })
    .join('');
}

async function muatBeritaDariDatabase() {
  const wadahBerita = document.getElementById('wadah-berita');
  if (!wadahBerita) return;

  const daftarBerita = await muatDataAPI('berita-depan');
  if (!daftarBerita || daftarBerita.length === 0) {
    wadahBerita.innerHTML = '<p>Belum ada berita terbaru.</p>';
    return;
  }

  wadahBerita.innerHTML = daftarBerita
    .map((item) => {
      const gambarAktif = dapatkanUrlGambar(item.gambar_berita, 'berita1.jpg');
      const judulBerita = item.judul_berita || 'Tanpa Judul';
      const tanggalBerita = item.tanggal_berita
        ? item.tanggal_berita.split('T')[0]
        : '';

      return `
      <a href="#" class="kartu-berita">
          <img src="${gambarAktif}" alt="${judulBerita}" onerror="this.onerror=null; this.src='berita1.jpg';">
          <div class="isi-berita">
              <h4>${judulBerita}</h4>
              <span>${tanggalBerita}</span>
          </div>
      </a>`;
    })
    .join('');
}

async function muatPengumumanDariDatabase() {
  const wadahPengumuman = document.getElementById('wadah-pengumuman');
  if (!wadahPengumuman) return;

  const daftarPengumuman = await muatDataAPI('pengumuman-depan');
  if (!daftarPengumuman || daftarPengumuman.length === 0) {
    wadahPengumuman.innerHTML = '<p>Belum ada pengumuman terbaru.</p>';
    return;
  }

  wadahPengumuman.innerHTML = daftarPengumuman
    .map((item) => {
      const gambarAktif = dapatkanUrlGambar(
        item.gambar_pengumuman,
        'pengumuman1.jpg'
      );
      return `
      <a href="#" class="kartu-pengumuman">
          <img src="${gambarAktif}" alt="${item.judul_pengumuman || 'Pengumuman'}" onerror="this.onerror=null; this.src='pengumuman1.jpg';">
          <div class="isi-pengumuman">
              <h4>${item.judul_pengumuman || 'Tanpa Judul'}</h4>
              <p>${item.isi || ''}</p>
              <span>${item.tanggal || ''}</span>
          </div>
      </a>`;
    })
    .join('');
}

// =================================
// SLIDER KEGIATAN PER JURUSAN
// =================================
let indexJurusan = 0;
let intervalJurusan;

function tampilkanSlideJurusan(index) {
  const semuaSlideJurusan = document.querySelectorAll('.slide-jurusan-foto');
  const semuaTitikJurusan = document.querySelectorAll('.titik-jurusan');
  if (semuaSlideJurusan.length === 0) return;

  if (index >= semuaSlideJurusan.length) indexJurusan = 0;
  else if (index < 0) indexJurusan = semuaSlideJurusan.length - 1;
  else indexJurusan = index;

  semuaSlideJurusan.forEach((slide) => slide.classList.remove('active'));
  semuaTitikJurusan.forEach((titik) => titik.classList.remove('active'));

  if (semuaSlideJurusan[indexJurusan])
    semuaSlideJurusan[indexJurusan].classList.add('active');
  if (semuaTitikJurusan[indexJurusan])
    semuaTitikJurusan[indexJurusan].classList.add('active');
}

function slideJurusanBerikutnya() {
  indexJurusan++;
  tampilkanSlideJurusan(indexJurusan);
}

function slideJurusanSebelumnya() {
  indexJurusan--;
  tampilkanSlideJurusan(indexJurusan);
}

function mulaiAutoplayJurusan() {
  if (intervalJurusan) clearInterval(intervalJurusan);
  intervalJurusan = setInterval(slideJurusanBerikutnya, 4000);
}

function hentikanAutoplayJurusan() {
  clearInterval(intervalJurusan);
}

function inisialisasiEventSliderJurusan() {
  const tombolSebelumnya = document.querySelector('#tombolSebelumnya');
  const tombolSelanjutnya = document.querySelector('#tombolSelanjutnya');
  const areaSliderJurusan = document.querySelector('.jurusan-slider');

  if (tombolSebelumnya) tombolSebelumnya.onclick = slideJurusanSebelumnya;
  if (tombolSelanjutnya) tombolSelanjutnya.onclick = slideJurusanBerikutnya;

  if (areaSliderJurusan) {
    areaSliderJurusan.onmouseenter = hentikanAutoplayJurusan;
    areaSliderJurusan.onmouseleave = () => {
      hentikanAutoplayJurusan();
      mulaiAutoplayJurusan();
    };
  }
}

async function muatJurusanDariDatabase() {
  const wadahSlider = document.getElementById('wadah-slider-jurusan');
  const wadahIndikator = document.getElementById('indikatorJurusan');
  if (!wadahSlider) return;

  try {
    // 1. PERBAIKAN UTAMA: Mengarah langsung ke endpoint backend asli di server.js Anda
    const response = await fetch('/api/slider-jurusan');
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

    const result = await response.json();

    // Amankan data agar selalu bertipe array meskipun backend dibungkus objek status
    const daftarJurusan = Array.isArray(result) ? result : result.data || [];

    wadahSlider.innerHTML = '';
    if (wadahIndikator) wadahIndikator.innerHTML = '';

    if (daftarJurusan.length === 0) {
      wadahSlider.innerHTML =
        '<p style="text-align:center; width: 100%; color: gray; padding: 20px;">Belum ada data jurusan.</p>';
      return;
    }

    daftarJurusan.forEach((item, index) => {
      const statusAktif = index === 0 ? 'active' : '';

      // Menangani path gambar agar mengarah ke folder /uploads/ secara aman
      let urlGambar = item.gambar_jurusan || '';
      if (
        urlGambar &&
        !urlGambar.startsWith('http') &&
        !urlGambar.startsWith('/uploads/')
      ) {
        urlGambar = `/uploads/${urlGambar}`;
      } else if (!urlGambar) {
        urlGambar = 'https://via.placeholder.com/300';
      }

      // 2. PERBAIKAN PROPERTI: Mengganti item.singkatan menjadi item.singkatan_jurusan sesuai MySQL
      const slideHTML = `
        <div class="slide-jurusan-foto ${statusAktif}">
            <img src="${urlGambar}" alt="Kegiatan ${item.nama_jurusan || ''}" style="width:100%; object-fit:cover;">
            <div class="caption-jurusan">
                <span>${item.singkatan_jurusan || 'KEGIATAN JURUSAN'}</span>
                <h3>${item.nama_jurusan || ''}</h3>
            </div>
        </div>`;
      wadahSlider.innerHTML += slideHTML;

      if (wadahIndikator) {
        wadahIndikator.innerHTML += `<button class="titik-jurusan ${statusAktif}" onclick="indexJurusan = ${index}; tampilkanSlideJurusan(${index});"></button>`;
      }
    });

    // Jalankan sistem animasi geser otomatis dan pasang event navigasi klik tombol
    inisialisasiEventSliderJurusan();
    mulaiAutoplayJurusan();
  } catch (err) {
    console.error('Gagal memuat data slider jurusan ke website utama:', err);
    wadahSlider.innerHTML =
      '<p style="text-align:center; color: red;">Gagal memuat data dari server.</p>';
  }
}
// =================================
// GALERI KEGIATAN
// =================================
async function muatGaleriDariDatabase() {
  const wadahGaleri = document.getElementById('wadah-galeri');
  if (!wadahGaleri) return;

  const daftarGaleri = await muatDataAPI('galeri-depan');
  if (!daftarGaleri || daftarGaleri.length === 0) {
    wadahGaleri.innerHTML = '<p>Belum ada foto kegiatan.</p>';
    return;
  }

  const svgFallback =
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100"><rect width="200" height="100" fill="%23ddd"/><text x="100" y="55" font-size="14" text-anchor="middle" fill="%23666">No Image</text></svg>';

  wadahGaleri.innerHTML = daftarGaleri
    .map((item) => {
      const sumberGambar = dapatkanUrlGambar(item.gambar_galeri, svgFallback);
      const judulGaleri = item.judul_galeri || 'Foto Kegiatan';
      const kategoriGaleri = item.kategori_galeri || 'Umum';

      return `
      <div class="foto-galeri">
        <a href="${sumberGambar}" data-lightbox="galeri-sekolah" data-title="${judulGaleri} (${kategoriGaleri})">
          <img src="${sumberGambar}" alt="${judulGaleri}" loading="lazy" onerror="this.onerror=null; this.src='${svgFallback}';">
        </a>
      </div>`;
    })
    .join('');

  inisialisasiLightbox();
}

// =================================
// EKSTRAKURIKULER
// =================================
async function muatEkstrakurikuler() {
  const wadah = document.getElementById('wadah-eskul');
  if (!wadah) return;

  const daftarEkskul = await muatDataAPI('ekstrakurikuler');
  if (!daftarEkskul || daftarEkskul.length === 0) {
    wadah.innerHTML =
      '<p style="text-align:center;">Belum ada data ekstrakurikuler.</p>';
    return;
  }

  wadah.innerHTML = daftarEkskul
    .map((item) => {
      const rawGambar = item.gambar_ekskul || item.gambar;
      const urlGambar = dapatkanUrlGambar(
        rawGambar,
        'https://via.placeholder.com/300x200?text=No+Image'
      );
      const namaEkskul = item.nama_ekskul || 'Ekstrakurikuler';
      const pembimbing = item.pembimbing || '-';

      return `
      <div class="kartu-ekskul">
          <img src="${urlGambar}" alt="${namaEkskul}" onerror="this.onerror=null; this.src='https://via.placeholder.com/300x200?text=No+Image';">
          <h3>${namaEkskul}</h3>
          <p>Pembimbing: ${pembimbing}</p>
      </div>`;
    })
    .join('');
}

// =================================
// KONTAK, SOSIAL MEDIA & YOUTUBE
// =================================
async function muatKontakSekolah() {
  const elAlamat = document.getElementById('kontak-alamat');
  const elJam = document.getElementById('kontak-jam');
  const elTelepon = document.getElementById('kontak-telepon');
  const elIframe = document.getElementById('kontak-iframe');

  const dataArr = await muatDataAPI('kontak');
  if (!dataArr || dataArr.length === 0) return;

  const data = dataArr[0];

  // Perbaikan nama properti agar sesuai dengan respon database API /api/kontak
  if (elAlamat) {
    elAlamat.textContent = data.alamat_sekolah || data.alamat || '';
  }

  if (elJam) {
    elJam.innerHTML = data.jam_sekolah || '';
  }

  if (elTelepon) {
    elTelepon.textContent = data.telepon_sekolah || data.telepon || '';
  }

  if (elIframe) {
    elIframe.src = data.peta_iframe || data.peta_sekolah || '';
  }
}

async function muatSosialMedia() {
  const wadahSosmed = document.getElementById('wadah-sosmed');
  if (!wadahSosmed) return;

  const daftarSosmed = await muatDataAPI('medsos');
  if (!daftarSosmed || daftarSosmed.length === 0) {
    wadahSosmed.innerHTML = '<p>Belum ada data sosial media.</p>';
    return;
  }

  wadahSosmed.innerHTML = daftarSosmed
    .map(
      (item) => `
    <a href="${item.url_sosmed}" class="sosial-card" target="_blank" rel="noopener noreferrer">
        <div class="ikon-sosial">${item.ikon_sosmed || '★'}</div>
        <div>
            <h3>${item.nama_sosmed}</h3>
            <p>${item.ket_sosmed || ''}</p>
        </div>
    </a>`
    )
    .join('');
}

async function muatVideoYoutube() {
  const iframeYoutube = document.getElementById('iframe-youtube');
  if (!iframeYoutube) return;

  const dataYoutube = await muatDataAPI('video');
  if (dataYoutube && dataYoutube.length > 0) {
    const video = dataYoutube[0];
    if (video.url_embed) {
      iframeYoutube.src = video.url_embed;
      iframeYoutube.title = video.judul_video || 'Video Kegiatan Sekolah';
    }
  }
}

// =================================
// FOOTER
// =================================

async function muatFooter() {
  try {
    const response = await fetch('/api/footer');
    const data = await response.json();
    const bawah = Array.isArray(data) ? data[0] : data;

    if (bawah) {
      const elSekolah = document.getElementById('sekolah-footer');
      const elSlogan = document.getElementById('slogan-footer');
      const elLogo = document.getElementById('logo-footer');
      const elCopy = document.getElementById('copyright');

      if (elSekolah && bawah.sekolah_footer)
        elSekolah.innerText = bawah.sekolah_footer;
      if (elSlogan && bawah.slogan_footer)
        elSlogan.innerText = bawah.slogan_footer;
      if (elLogo && bawah.logo_footer) elLogo.src = bawah.logo_footer;
      if (elCopy && bawah.copyright) elCopy.innerText = bawah.copyright;
    }
  } catch (err) {
    console.error('Gagal memuat footer sekolah:', err);
  }
}

async function tampilkanUsers() {
  console.log('Function tampilkanUsers berjalan');
  const res = await fetch('/api/users');

  const users = await res.json();

  const daftarUsers = document.querySelector('#daftarUsers');
  console.log('Elemen daftarUsers:', daftarUsers);

  let tabel = `
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Username</th>
                    <th>Role</th>                    
                </tr>
            </thead>

            <tbody>
    `;

  users.forEach((user) => {
    tabel += `
            <tr>
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${user.role}</td>                
            </tr>
        `;
  });

  tabel += `
            </tbody>
        </table>
    `;

  daftarUsers.innerHTML = tabel;
}

// =================================
// INISIALISASI UTAMA (PARALEL FETCH)
// =================================
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Eksekusi semua pemanggilan API secara paralel menggunakan Promise.all
    await Promise.all([
      muatBeritaDariDatabase(),
      muatPengumumanDariDatabase(),
      muatGaleriDariDatabase(),
      muatJurusanDariDatabase(),
      muatSliderUtamaDariDatabase(),
      muatPengaturanSekolah(),
      muatKonsentrasiKeahlian(),
      muatKontakSekolah(),
      muatEkstrakurikuler(),
      muatSosialMedia(),
      muatVideoYoutube(),
      muatNavbar(),
      muatIdentitasSekolah(),
      muatinformasiDariDatabase(),
      muatFooter(),
      tampilkanUsers(),
    ]);

    console.log('Semua modul API berhasil dimuat secara paralel.');
  } catch (err) {
    console.error('Terjadi kesalahan saat memuat modul:', err);
  }
});
