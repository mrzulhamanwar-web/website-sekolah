document.addEventListener('DOMContentLoaded', () => {
  const formfooter = document.getElementById('form-footer');
  const inputId = document.getElementById('id-footer');
  const inputNama = document.getElementById('sekolah_footer');
  const inputSlogan = document.getElementById('slogan_footer');
  const inputGambar = document.getElementById('logo_footer');
  const inputCopy = document.getElementById('copyright');
  const btnSimpan = document.getElementById('btn-simpan-footer');
  const btnBatal = document.getElementById('btn-batal-footer');
  const tabelBody = document.getElementById('tabel-footer-body');
  const pesan = document.getElementById('pesan-footer');

  if (!formfooter) return;

  // Placeholder SVG standar yang aman tanpa kueri luar
  const noImgSvg =
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'><rect width='100%' height='100%' fill='%23cccccc'/><text x='50%' y='50%' fill='%23333333' dominant-baseline='middle' text-anchor='middle' font-size='10'>No Img</text></svg>";

  // 1. Fungsi Memuat Data Footer
  async function muatFooter() {
    try {
      const response = await fetch('/api/footer');
      const dataList = await response.json();

      tabelBody.innerHTML = '';

      if (!dataList || dataList.length === 0) {
        tabelBody.innerHTML =
          '<tr><td colspan="5" style="text-align:center;">Belum ada data Footer.</td></tr>';
        return;
      }
      // Kita simpan datanya ke window agar bisa diakses langsung oleh fungsi edit lewat ID
      window.cacheDataFooter = dataList;

      dataList.forEach((item) => {
        const tr = document.createElement('tr');

        // Pengaman path gambar footer
        let sumberGambar = item.logo_footer || '';
        if (sumberGambar) {
          if (
            !sumberGambar.startsWith('http') &&
            !sumberGambar.startsWith('/uploads/')
          ) {
            sumberGambar = `/uploads/${sumberGambar}`;
          }
        } else {
          sumberGambar = noImgSvg;
        }

        tr.innerHTML = `
          <td>${item.sekolah_footer || '-'}</td>
          <td><img src="${sumberGambar}" width="60" style="border-radius: 4px; object-fit: cover;" onerror="this.onerror=null; this.src='${noImgSvg}';"></td>
          <td>${item.slogan_footer || '-'}</td>
          <td>${item.copyright || '-'}</td>
          <td>
            <!-- Cukup kirimkan item.id saja ke fungsi edit agar aman dari crash teks -->
            <button onclick="editFooter(${item.id})" style="background:#ffc107; color:black; padding:5px 10px; margin-bottom:5px; border:none; border-radius:3px; cursor:pointer;">Edit</button><br>
            <button onclick="hapusFooter(${item.id})" style="background:#dc3545; color:white; padding:5px 10px; border:none; border-radius:3px; cursor:pointer;">Hapus</button>
        </td>
        `;
        tabelBody.appendChild(tr);
      });
    } catch (err) {
      console.error('Gagal memuat Footer:', err);
    }
  }

  muatFooter();

  // 2. Fungsi Global Edit (Mengambil data langsung dari cache memori berdasarkan ID)
  window.editFooter = (id) => {
    // Cari data footer yang cocok dengan ID yang diklik
    const item = window.cacheDataFooter.find((d) => d.id === id);
    if (!item) return;

    // Masukkan data asli ke input form tanpa takut tanda petik rusak
    inputId.value = item.id;
    inputNama.value = item.sekolah_footer || '';
    inputSlogan.value = item.slogan_footer || '';
    inputCopy.value = item.copyright || '';
    inputGambar.value = ''; // Reset input berkas baru

    // TAMPILKAN PREVIEW GAMBAR LAMA
    let sumberGambar = item.logo_footer || '';
    if (
      sumberGambar &&
      !sumberGambar.startsWith('http') &&
      !sumberGambar.startsWith('/uploads/')
    ) {
      sumberGambar = `/uploads/${sumberGambar}`;
    }

    const elPreview = document.getElementById('preview-logo-footer');
    if (elPreview) {
      elPreview.src = sumberGambar || noImgSvg;
      elPreview.style.display = 'block'; // Tampilkan gambar pratinjau
    }

    btnSimpan.textContent = 'Perbarui Footer';
    btnSimpan.style.background = '#ffc107';
    btnSimpan.style.color = 'black';
    btnBatal.style.display = 'inline-block';

    pesan.style.color = '#007bff';
    pesan.textContent = `Mode Edit Aktif (ID: ${id}).`;

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 4. Fungsi Reset / Tombol Batal
  function resetForm() {
    formfooter.reset();
    inputId.value = '';
    inputNama.value = '';
    inputSlogan.value = '';
    inputCopy.value = '';
    // SEMBUNYIKAN PREVIEW KEMBALI SAAT RESET
    const elPreview = document.getElementById('preview-logo-footer');
    if (elPreview) {
      elPreview.src = '';
      elPreview.style.display = 'none';
    }
    btnSimpan.textContent = 'Simpan Footer';
    btnSimpan.style.background = '#28a745';
    btnSimpan.style.color = 'white';
    btnBatal.style.display = 'none';
    pesan.textContent = '';
  }

  btnBatal.addEventListener('click', () => {
    resetForm();
    pesan.style.color = 'gray';
    pesan.textContent = 'Edit Footer dibatalkan.';
  });

  // 5. Fungsi Global Hapus
  window.hapusFooter = async (id) => {
    if (!confirm('Yakin ingin menghapus Footer ini?')) return;

    try {
      const response = await fetch(`/api/footer/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        pesan.style.color = 'green';
        pesan.textContent = 'Footer berhasil dihapus!';
        resetForm();
        muatFooter();
      } else {
        pesan.style.color = 'red';
        pesan.textContent = 'Gagal menghapus Footer.';
      }
    } catch (err) {
      console.error('Error:', err);
      pesan.style.color = 'red';
      pesan.textContent = 'Terjadi kesalahan koneksi ke server.';
    }
  };
});
