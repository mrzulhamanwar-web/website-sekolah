document.addEventListener('DOMContentLoaded', () => {
  const formGaleri = document.getElementById('form-galeri');
  const inputId = document.getElementById('id-galeri');
  const inputJudul = document.getElementById('judul_galeri');
  const inputKategori = document.getElementById('kategori_galeri');
  const inputGambar = document.getElementById('gambar_galeri');
  const btnSimpan = document.getElementById('btn-simpan-galeri');
  const btnBatal = document.getElementById('btn-batal-galeri');
  const tabelBody = document.getElementById('tabel-galeri-body');
  const pesan = document.getElementById('pesan-galeri');

  if (!formGaleri || !tabelBody) return;

  const noImgSvg =
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60'><rect width='60' height='60' fill='%23ddd'/><text x='30' y='35' font-size='10' text-anchor='middle' fill='%23666'>No Img</text></svg>";

  // 1. FUNGSI MEMUAT DATA GALERI (Ditempelkan ke window agar dipanggil switchSection)
  window.muatGaleri = async function () {
    try {
      const response = await fetch('/api/galeri');
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

      const dataList = await response.json();

      tabelBody.innerHTML = '';
      if (!dataList || dataList.length === 0) {
        tabelBody.innerHTML =
          '<tr><td colspan="4" style="text-align:center;">Belum ada data galeri.</td></tr>';
        return;
      }

      dataList.forEach((item) => {
        const tr = document.createElement('tr');

        // Pengaman path gambar galeri
        let sumberGambar = item.gambar_galeri || '';
        if (sumberGambar) {
          if (
            !sumberGambar.startsWith('http') &&
            !sumberGambar.startsWith('/uploads/') &&
            !sumberGambar.startsWith('data:')
          ) {
            sumberGambar = `/uploads/${sumberGambar}`;
          }
        } else {
          sumberGambar = noImgSvg;
        }

        tr.innerHTML = `
          <td><b>${item.judul_galeri || '-'}</b></td>
          <td>
            <img src="${sumberGambar}" width="60" style="border-radius: 4px; object-fit: cover;" onerror="this.onerror=null; this.src='${noImgSvg}';">
          </td>
          <td>${item.kategori_galeri || '-'}</td>
          <td>
              <button type="button" class="btn-edit-galeri" 
                data-id="${item.id}" 
                data-judul="${encodeURIComponent(item.judul_galeri || '')}" 
                data-kategori="${encodeURIComponent(item.kategori_galeri || '')}" 
                style="background:#ffc107; color:black; padding:5px 10px; margin-bottom:5px; border:none; border-radius:3px; cursor:pointer;">Edit</button><br>
              <button type="button" class="btn-hapus-galeri" 
                data-id="${item.id}" 
                style="background:#dc3545; color:white; padding:5px 10px; border:none; border-radius:3px; cursor:pointer;">Hapus</button>
          </td>
        `;
        tabelBody.appendChild(tr);
      });
    } catch (err) {
      console.error('Gagal memuat Galeri:', err);
    }
  };

  // Muat pertama kali
  window.muatGaleri();

  // 2. EVENT DELEGATION UNTUK TOMBOL EDIT DAN HAPUS
  tabelBody.addEventListener('click', async (e) => {
    const target = e.target;

    // Aksi Klik Edit
    if (target.classList.contains('btn-edit-galeri')) {
      e.preventDefault();
      const id = target.getAttribute('data-id');
      const judul = decodeURIComponent(target.getAttribute('data-judul'));
      const kategori = decodeURIComponent(target.getAttribute('data-kategori'));

      inputId.value = id;
      inputJudul.value = judul;
      inputKategori.value = kategori;
      if (inputGambar) inputGambar.value = '';

      btnSimpan.textContent = 'Perbarui Galeri';
      btnSimpan.style.background = '#ffc107';
      btnSimpan.style.color = 'black';
      if (btnBatal) btnBatal.style.display = 'inline-block';

      if (pesan) {
        pesan.style.color = '#007bff';
        pesan.textContent = `Mode Edit Aktif (ID: ${id}).`;
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Aksi Klik Hapus
    if (target.classList.contains('btn-hapus-galeri')) {
      e.preventDefault();
      const id = target.getAttribute('data-id');

      if (!confirm('Yakin ingin menghapus galeri ini?')) return;

      try {
        const response = await fetch(`/api/galeri/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          if (pesan) {
            pesan.style.color = 'green';
            pesan.textContent = 'Galeri berhasil dihapus!';
          }
          resetForm();
          window.muatGaleri();
        } else {
          if (pesan) {
            pesan.style.color = 'red';
            pesan.textContent = 'Gagal menghapus galeri.';
          }
        }
      } catch (err) {
        console.error('Error:', err);
        if (pesan) {
          pesan.style.color = 'red';
          pesan.textContent = 'Terjadi kesalahan koneksi ke server.';
        }
      }
    }
  });

  // 3. FUNGSI SIMPAN (POST / PUT)
  formGaleri.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = inputId.value;
    const formData = new FormData();
    formData.append('judul', inputJudul.value);
    formData.append('kategori', inputKategori.value);

    if (inputGambar.files[0]) {
      formData.append('gambar', inputGambar.files[0]);
    }

    const url = id ? `/api/galeri/${id}` : '/api/galeri';
    const method = id ? 'PUT' : 'POST';

    btnSimpan.disabled = true;
    const teksAwal = btnSimpan.textContent;
    btnSimpan.textContent = 'Menyimpan...';

    try {
      const response = await fetch(url, {
        method: method,
        body: formData,
      });

      const hasil = await response.json();

      if (response.ok) {
        pesan.style.color = 'green';
        pesan.textContent = hasil.message || 'Galeri berhasil disimpan!';
        resetForm();
        window.muatGaleri();
      } else {
        pesan.style.color = 'red';
        pesan.textContent = hasil.error || 'Gagal menyimpan Galeri.';
      }
    } catch (err) {
      console.error('Error:', err);
      pesan.style.color = 'red';
      pesan.textContent = 'Terjadi kesalahan koneksi ke server.';
    } finally {
      btnSimpan.disabled = false;
      btnSimpan.textContent = id ? 'Perbarui Galeri' : 'Simpan Galeri';
    }
  });

  // 4. RESET FORM & BATAL
  function resetForm() {
    formGaleri.reset();
    inputId.value = '';
    inputJudul.value = '';
    inputKategori.value = '';
    btnSimpan.textContent = 'Simpan Galeri';
    btnSimpan.style.background = '#28a745';
    btnSimpan.style.color = 'white';
    if (btnBatal) btnBatal.style.display = 'none';
    if (pesan) pesan.textContent = '';
  }

  if (btnBatal) {
    btnBatal.addEventListener('click', () => {
      resetForm();
      if (pesan) {
        pesan.style.color = 'gray';
        pesan.textContent = 'Edit galeri dibatalkan.';
      }
    });
  }
});