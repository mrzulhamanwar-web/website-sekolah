document.addEventListener('DOMContentLoaded', () => {
  const formKontak = document.getElementById('form-kontak');
  const inputId = document.getElementById('id-kontak');
  const inputAlamat = document.getElementById('alamat_sekolah');
  const inputJam = document.getElementById('jam_sekolah');
  const inputTelepon = document.getElementById('telepon_sekolah');
  const inputPeta = document.getElementById('peta_sekolah');
  const btnSimpan = document.getElementById('btn-simpan-kontak');
  const btnBatal = document.getElementById('btn-batal-kontak');
  const tabelBody = document.getElementById('tabel-kontak-body');
  const pesan = document.getElementById('pesan-kontak');

  if (!formKontak) return;

  // 1. Fungsi Memuat Data Kontak Sekolah
  async function muatKontakSekolah() {
    try {
      const response = await fetch('/api/kontak');
      const menuList = await response.json();

      tabelBody.innerHTML = '';

      menuList.forEach((item) => {
        const tr = document.createElement('tr');

        // Ambil nilai dan ubah ke String secara aman agar tidak error jika null/undefined
        const alamat = String(item.alamat_sekolah || '').replace(/'/g, "\\'");
        const jam = String(item.jam_sekolah || '').replace(/'/g, "\\'");
        const telepon = String(item.telepon_sekolah || '').replace(/'/g, "\\'");
        const peta = String(
          item.peta_iframe || item.peta_sekolah || ''
        ).replace(/'/g, "\\'");

        tr.innerHTML = `
        <td>${item.alamat_sekolah || ''}</td>
        <td>${item.jam_sekolah || ''}</td>
        <td>${item.telepon_sekolah || ''}</td>
        <td>${item.peta_iframe || item.peta_sekolah || ''}</td>
        <td>
          <button onclick="editKontak(${item.id}, '${alamat}', '${jam}', '${telepon}', '${peta}')" style="background:#ffc107; color:black; padding:5px 10px; margin-right:5px;">Edit</button>
          <button onclick="hapusKontak(${item.id})" style="background:#dc3545; color:white; padding:5px 10px;">Hapus</button>
        </td>
      `;
        tabelBody.appendChild(tr);
      });
    } catch (err) {
      console.error('Gagal memuat Kontak:', err);
    }
  }

  // Pastikan fungsi dapat dipanggil dari luar (admin.html)
  window.muatKontakSekolah = muatKontakSekolah;

  // 2. Fungsi Simpan (Tambah POST atau Edit PUT)
  formKontak.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = inputId.value ? inputId.value.trim() : '';
    const dataKontak = {
      alamat_sekolah: inputAlamat.value,
      jam_sekolah: inputJam.value,
      telepon_sekolah: inputTelepon.value,
      peta_sekolah: inputPeta.value,
    };

    const url = id ? `/api/kontak/${id}` : '/api/kontak';
    const method = id ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataKontak),
      });

      const hasil = await response.json();

      if (response.ok) {
        pesan.style.color = 'green';
        pesan.textContent = hasil.message || 'Data kontak berhasil disimpan!';
        resetForm();
        muatKontakSekolah();
      } else {
        pesan.style.color = 'red';
        pesan.textContent = hasil.error || 'Gagal menyimpan data kontak.';
      }
    } catch (err) {
      console.error('Error:', err);
      pesan.style.color = 'red';
      pesan.textContent = 'Terjadi kesalahan koneksi ke server.';
    }
  });

  // 3. Fungsi Global Edit
  window.editKontak = (
    id,
    alamat_sekolah,
    jam_sekolah,
    telepon_sekolah,
    peta_sekolah
  ) => {
    inputId.value = String(id);
    inputAlamat.value = alamat_sekolah;
    inputJam.value = jam_sekolah;
    inputTelepon.value = telepon_sekolah;
    inputPeta.value = peta_sekolah;

    btnSimpan.textContent = 'Perbarui Kontak';
    btnSimpan.style.background = '#ffc107';
    btnSimpan.style.color = 'black';
    btnBatal.style.display = 'inline-block';

    pesan.style.color = '#007bff';
    pesan.textContent = `Mode Edit Aktif (ID: ${id}). Silakan ubah data kontak.`;

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 4. Fungsi Reset / Tombol Batal
  function resetForm() {
    formKontak.reset();
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
  window.hapusKontak = async (id) => {
    if (!confirm('Yakin ingin menghapus kontak ini?')) return;

    try {
      const response = await fetch(`/api/kontak/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        pesan.style.color = 'green';
        pesan.textContent = 'Kontak berhasil dihapus!';
        resetForm();
        muatKontakSekolah();
      } else {
        pesan.style.color = 'red';
        pesan.textContent = 'Gagal menghapus kontak.';
      }
    } catch (err) {
      console.error('Error:', err);
      pesan.style.color = 'red';
      pesan.textContent = 'Terjadi kesalahan koneksi ke server.';
    }
  };
});
