document.addEventListener('DOMContentLoaded', () => {
  const formBerita = document.getElementById('form-berita');
  const inputId = document.getElementById('id-berita');
  const inputJudul = document.getElementById('judul_berita');
  const inputTanggal = document.getElementById('tanggal_berita');
  const inputGambar = document.getElementById('gambar_berita');
  const btnSimpan = document.getElementById('btn-simpan-berita');
  const btnBatal = document.getElementById('btn-batal-berita');
  const tabelBody = document.getElementById('tabel-berita-body');
  const pesan = document.getElementById('pesan-berita');

  if (!formBerita) return;

  // Fungsi pembantu untuk mengubah format tanggal database (YYYY-MM-DD)
  // menjadi format Indonesia yang mudah dibaca (Contoh: 23 September 2026)
  function formatTanggalIndonesia(tanggalStr) {
    if (!tanggalStr) return '';
    const date = new Date(tanggalStr);
    // Cek apakah tanggal valid
    if (isNaN(date.getTime())) return tanggalStr;

    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  // 1. Fungsi Memuat Data Berita
  async function muatBerita() {
    try {
      const response = await fetch('/api/berita');
      const dataList = await response.json();

      tabelBody.innerHTML = '';

      dataList.forEach((item) => {
        const tr = document.createElement('tr');

        // Format tanggal untuk ditampilkan di tabel
        const tanggalTampil = formatTanggalIndonesia(item.tanggal_berita);

        // Ambil tanggal bersih YYYY-MM-DD untuk form edit (aman dari null/undefined)
        let tanggalMentah = '';
        if (item.tanggal_berita) {
          tanggalMentah = item.tanggal_berita.split('T')[0];
        }

        // Pengaman teks judul (mencegah error replace jika judul null)
        const judulAman = (item.judul_berita || '').replace(/'/g, "\\'");

        // Pengaman path gambar berita
        let sumberGambar = item.gambar_berita || '';
        if (
          sumberGambar &&
          !sumberGambar.startsWith('http') &&
          !sumberGambar.startsWith('/uploads/')
        ) {
          sumberGambar = `/uploads/${sumberGambar}`;
        }

        tr.innerHTML = `
          <td><b>${item.judul_berita || '-'}</b></td>
          <td>${tanggalTampil}</td>
          <td><img src="${sumberGambar}" width="60" style="border-radius: 4px; object-fit: cover;" onerror="this.onerror=null; this.src='data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'60\' height=\'60\' viewBox=\'0 0 60 60\'><rect width=\'100%\' height=\'100%\' fill=\'%23cccccc\'/><text x=\'50%\' y=\'50%\' fill=\'%23333333\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-size=\'10\'>No Img</text></svg>';"></td>
          <td>
              <button onclick="editBerita(${item.id}, '${judulAman}', '${tanggalMentah}')" style="background:#ffc107; color:black; padding:5px 10px; margin-bottom:5px; border:none; border-radius:3px; cursor:pointer;">Edit</button><br>
              <button onclick="hapusBerita(${item.id})" style="background:#dc3545; color:white; padding:5px 10px; border:none; border-radius:3px; cursor:pointer;">Hapus</button>
          </td>
        `;
        tabelBody.appendChild(tr);
      });
    } catch (err) {
      console.error('Gagal memuat berita:', err);
    }
  }

  muatBerita();

  // 2. Fungsi Simpan (Tambah POST atau Edit PUT)
  formBerita.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = inputId.value;
    const formData = new FormData();
    formData.append('judul', inputJudul.value);
    formData.append('tanggal', inputTanggal.value);

    if (inputGambar.files[0]) {
      formData.append('gambar', inputGambar.files[0]);
    }

    const url = id ? `/api/berita/${id}` : '/api/berita';
    const method = id ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        body: formData,
      });

      const hasil = await response.json();

      if (response.ok) {
        pesan.style.color = 'green';
        pesan.textContent = hasil.message || 'Berita berhasil disimpan!';
        resetForm();
        muatBerita();
      } else {
        pesan.style.color = 'red';
        pesan.textContent = hasil.error || 'Gagal menyimpan Berita.';
      }
    } catch (err) {
      console.error('Error:', err);
      pesan.style.color = 'red';
      pesan.textContent = 'Terjadi kesalahan koneksi ke server.';
    }
  });

  // 3. Fungsi Global Edit
  window.editBerita = (id, judul_berita, tanggal_berita) => {
    inputId.value = id;
    inputJudul.value = judul_berita;
    inputTanggal.value = tanggal_berita ? tanggal_berita.split('T')[0] : '';
    inputGambar.value = ''; // Reset input file

    btnSimpan.textContent = 'Perbarui Berita';
    btnSimpan.style.background = '#ffc107';
    btnSimpan.style.color = 'black';
    btnBatal.style.display = 'inline-block';

    pesan.style.color = '#007bff';
    pesan.textContent = `Mode Edit Aktif (ID: ${id}).`;

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 4. Fungsi Reset / Tombol Batal
  function resetForm() {
    formBerita.reset();
    inputId.value = '';
    inputJudul.value = '';
    inputTanggal.value = '';
    btnSimpan.textContent = 'Simpan Berita';
    btnSimpan.style.background = '#28a745';
    btnSimpan.style.color = 'white';
    btnBatal.style.display = 'none';
    pesan.textContent = '';
  }

  btnBatal.addEventListener('click', () => {
    resetForm();
    pesan.style.color = 'gray';
    pesan.textContent = 'Edit berita dibatalkan.';
  });

  // 5. Fungsi Global Hapus
  window.hapusBerita = async (id) => {
    if (!confirm('Yakin ingin menghapus berita ini?')) return;

    try {
      const response = await fetch(`/api/berita/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        pesan.style.color = 'green';
        pesan.textContent = 'Berita berhasil dihapus!';
        resetForm();
        muatBerita();
      } else {
        pesan.style.color = 'red';
        pesan.textContent = 'Gagal menghapus berita.';
      }
    } catch (err) {
      console.error('Error:', err);
      pesan.style.color = 'red';
      pesan.textContent = 'Terjadi kesalahan koneksi ke server.';
    }
  };
});
