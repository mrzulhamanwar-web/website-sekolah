document.addEventListener('DOMContentLoaded', () => {
  const formPengaturan = document.getElementById('form-pengaturan');
  const inputNama = document.getElementById('nama_sekolah');
  const inputSlogan = document.getElementById('slogan');
  const inputLogo = document.getElementById('logo');
  const previewLogo = document.getElementById('preview-logo');
  const pesan = document.getElementById('pesan-identitas');

  if (!formPengaturan) {
    console.warn("Elemen 'form-pengaturan' tidak ditemukan.");
    return;
  }
  // Placeholder SVG standar tanpa request internet
  const noLogoSvg =
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100%' height='100%' fill='%23cccccc'/><text x='50%' y='50%' fill='%23333333' dominant-baseline='middle' text-anchor='middle' font-size='12'>No Logo</text></svg>";

  // 1. Ambil data identitas saat halaman dimuat
  async function muatIdentitas() {
    try {
      const response = await fetch('/api/identitas');
      const data = await response.json();

      if (data.length > 0) {
        const sekolah = data[0];
        if (inputNama) inputNama.value = sekolah.nama_sekolah || '';
        if (inputSlogan) inputSlogan.value = sekolah.slogan || '';
        if (previewLogo) {
          // Penanganan jika gambar logo rusak/404
          previewLogo.onerror = function () {
            this.onerror = null;
            this.src = noLogoSvg;
          };

          if (sekolah.logo) {
            let logoPath = sekolah.logo;
            if (
              !logoPath.startsWith('http') &&
              !logoPath.startsWith('/uploads/')
            ) {
              logoPath = `/uploads/${logoPath}`;
            }
            previewLogo.src = logoPath;
          } else {
            previewLogo.src = noLogoSvg;
          }
        }
      }
    } catch (err) {
      console.error('Gagal memuat identitas:', err);
    }
  }

  muatIdentitas();

  // 2. Simpan perubahan menggunakan FormData
  formPengaturan.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData();
    if (inputNama) formData.append('nama_sekolah', inputNama.value);
    if (inputSlogan) formData.append('slogan', inputSlogan.value);

    if (inputLogo && inputLogo.files[0]) {
      formData.append('logo', inputLogo.files[0]);
    }

    try {
      const response = await fetch('/api/identitas', {
        method: 'PUT',
        body: formData,
      });

      const hasil = await response.json();

      if (response.ok) {
        if (pesan) {
          pesan.style.color = 'green';
          pesan.textContent =
            hasil.message || 'Pengaturan berhasil diperbarui!';
        }
        muatIdentitas(); // Muat ulang data terbaru & preview logo
        if (inputLogo) inputLogo.value = ''; // Reset input file
      } else {
        if (pesan) {
          pesan.style.color = 'red';
          pesan.textContent = hasil.error || 'Gagal menyimpan pengaturan.';
        }
      }
    } catch (err) {
      console.error('Error:', err);
      if (pesan) {
        pesan.style.color = 'red';
        pesan.textContent = 'Terjadi kesalahan koneksi ke server.';
      }
    }
  });
});
