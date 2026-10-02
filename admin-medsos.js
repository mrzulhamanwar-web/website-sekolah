document.addEventListener('DOMContentLoaded', () => {
  const formMedsos = document.getElementById('form-medsos');
  const inputId = document.getElementById('id-medsos');
  const inputNama = document.getElementById('nama_sosmed');
  const inputUrl = document.getElementById('url_sosmed');
  const inputKet = document.getElementById('ket_sosmed');
  const inputIkon = document.getElementById('ikon_sosmed');
  const btnSimpan = document.getElementById('btn-simpan-sosmed');
  const btnBatal = document.getElementById('btn-batal-sosmed');
  const tabelBody = document.getElementById('tabel-medsos-body');
  const pesan = document.getElementById('pesan-sosmed');

  if (!formMedsos) return;

  // 1. Fungsi Memuat Data Sosial Media
  async function muatSosialMedia() {
    try {
      const response = await fetch('/api/medsos');
      const menuList = await response.json();

      tabelBody.innerHTML = '';

      menuList.forEach((item) => {
        const tr = document.createElement('tr');

        // Ambil nilai dan ubah ke String secara aman agar tidak error jika null/undefined
        const nama = String(item.nama_sosmed || '').replace(/'/g, "\\'");
        const url = String(item.url_sosmed || '').replace(/'/g, "\\'");
        const ket = String(item.ket_sosmed || '').replace(/'/g, "\\'");
        const ikon = String(item.ikon_sosmed || '').replace(/'/g, "\\'");

        tr.innerHTML = `
        <td>${item.nama_sosmed || ''}</td>
        <td>${item.url_sosmed || ''}</td>
        <td>${item.ket_sosmed || ''}</td>
        <td>${item.ikon_sosmed || ''}</td>
        <td>
          <button onclick="editSosmed(${item.id}, '${nama}', '${url}', '${ket}', '${ikon}')" style="background:#ffc107; color:black; padding:5px 10px; margin-right:5px;">Edit</button>
          <button onclick="hapusMedsos(${item.id})" style="background:#dc3545; color:white; padding:5px 10px;">Hapus</button>
        </td>
      `;
        tabelBody.appendChild(tr);
      });
    } catch (err) {
      console.error('Gagal memuat Kontak:', err);
    }
  }

  // Pastikan fungsi dapat dipanggil dari luar (admin.html)
  window.muatSosialMedia = muatSosialMedia;

  // 2. Fungsi Simpan (Tambah POST atau Edit PUT)
  formMedsos.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = inputId.value ? inputId.value.trim() : '';
    const dataMedsos = {
      nama_sosmed: inputNama.value,
      url_sosmed: inputUrl.value,
      ket_sosmed: inputKet.value,
      ikon_sosmed: inputIkon.value,
    };

    const url = id ? `/api/medsos/${id}` : '/api/medsos';
    const method = id ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataMedsos),
      });

      const hasil = await response.json();

      if (response.ok) {
        pesan.style.color = 'green';
        pesan.textContent =
          hasil.message || 'Data Sosial Media berhasil disimpan!';
        resetForm();
        muatSosialMedia();
      } else {
        pesan.style.color = 'red';
        pesan.textContent = hasil.error || 'Gagal menyimpan data Sosial Media.';
      }
    } catch (err) {
      console.error('Error:', err);
      pesan.style.color = 'red';
      pesan.textContent = 'Terjadi kesalahan koneksi ke server.';
    }
  });

  // 3. Fungsi Global Edit
  window.editSosmed = (
    id,
    nama_sosmed,
    url_sosmed,
    ket_sosmed,
    ikon_sosmed
  ) => {
    inputId.value = String(id);
    inputNama.value = nama_sosmed;
    inputUrl.value = url_sosmed;
    inputKet.value = ket_sosmed;
    inputIkon.value = ikon_sosmed;

    btnSimpan.textContent = 'Perbarui Kontak';
    btnSimpan.style.background = '#ffc107';
    btnSimpan.style.color = 'black';
    btnBatal.style.display = 'inline-block';

    pesan.style.color = '#007bff';
    pesan.textContent = `Mode Edit Aktif (ID: ${id}). Silakan ubah data Sosmed.`;

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 4. Fungsi Reset / Tombol Batal
  function resetForm() {
    formMedsos.reset();
    inputId.value = '';
    btnSimpan.textContent = 'Simpan Kontak';
    btnSimpan.style.background = '#28a745';
    btnSimpan.style.color = 'white';
    btnBatal.style.display = 'none';
    pesan.textContent = '';
  }

  btnBatal.addEventListener('click', () => {
    resetForm();
    pesan.style.color = 'gray';
    pesan.textContent = 'Edit kontak dibatalkan.';
  });

  // 5. Fungsi Global Hapus
  window.hapusMedsos = async (id) => {
    if (!confirm('Yakin ingin menghapus kontak ini?')) return;

    try {
      const response = await fetch(`/api/medsos/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        pesan.style.color = 'green';
        pesan.textContent = 'Sosmed berhasil dihapus!';
        resetForm();
        muatSosialMedia();
      } else {
        pesan.style.color = 'red';
        pesan.textContent = 'Gagal menghapus Sosmed.';
      }
    } catch (err) {
      console.error('Error:', err);
      pesan.style.color = 'red';
      pesan.textContent = 'Terjadi kesalahan koneksi ke server.';
    }
  };
});
