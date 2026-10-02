document.addEventListener('DOMContentLoaded', () => {
  const formNavigasi = document.getElementById('form-navigasi');
  const inputId = document.getElementById('id-menu');
  const inputNama = document.getElementById('nama_menu');
  const inputLink = document.getElementById('url_nav');
  const inputUrutan = document.getElementById('urutan_nav');
  const btnSimpan = document.getElementById('btn-simpan');
  const btnBatal = document.getElementById('btn-batal-navigasi');
  const tabelBody = document.getElementById('tabel-menu-body');
  const pesan = document.getElementById('pesan-navigasi');

  if (!formNavigasi) return;

  // 1. Fungsi Memuat Data Menu Navigasi
  async function muatMenu() {
    try {
      const response = await fetch('/api/navbar');
      const menuList = await response.json();

      // Urutkan array secara pasti dari terkecil ke terbesar
      menuList.sort((a, b) => Number(a.urutan_nav) - Number(b.urutan_nav));

      tabelBody.innerHTML = '';

      menuList.forEach((menu) => {
        const tr = document.createElement('tr');

        tr.innerHTML = `
                    <td>${menu.urutan_nav}</td>
                    <td>${menu.nama_menu}</td>
                    <td>${menu.url_nav}</td>
                    <td>
                        <button onclick="editMenu(${menu.id}, '${menu.nama_menu.replace(/'/g, "\\'")}', '${menu.url_nav.replace(/'/g, "\\'")}', ${menu.urutan_nav})" style="background:#ffc107; color:black; padding:5px 10px; margin-right:5px;">Edit</button>
                        <button onclick="hapusMenu(${menu.id})" style="background:#dc3545; color:white; padding:5px 10px;">Hapus</button>
                    </td>
                `;
        tabelBody.appendChild(tr);
      });
    } catch (err) {
      console.error('Gagal memuat menu:', err);
    }
  }

  muatMenu();

  // 2. Fungsi Simpan (Tambah POST atau Edit PUT)
  formNavigasi.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Menggunakan .trim() untuk memastikan jika id kosong, dibaca benar-benar kosong
    const id = inputId.value ? inputId.value.trim() : '';
    const dataMenu = {
      nama_menu: inputNama.value,
      url_nav: inputLink.value,
      urutan_nav: Number(inputUrutan.value),
    };

    const url = id ? `/api/navbar/${id}` : '/api/navbar';
    const method = id ? 'PUT' : 'POST';

    // Pengecekan di Console F12
    console.log(`Mengirim Method: ${method} | URL: ${url} | ID: "${id}"`);

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataMenu),
      });

      const hasil = await response.json();

      if (response.ok) {
        pesan.style.color = 'green';
        pesan.textContent = hasil.message || 'Menu berhasil disimpan!';
        resetForm();
        muatMenu();
      } else {
        pesan.style.color = 'red';
        pesan.textContent = hasil.error || 'Gagal menyimpan menu.';
      }
    } catch (err) {
      console.error('Error:', err);
      pesan.style.color = 'red';
      pesan.textContent = 'Terjadi kesalahan koneksi ke server.';
    }
  });

  // 3. Fungsi Global Edit
  window.editMenu = (id, nama_menu, url_nav, urutan_nav) => {
    inputId.value = String(id);
    inputNama.value = nama_menu;
    inputLink.value = url_nav;
    inputUrutan.value = urutan_nav;

    // Ubah tampilan tombol saat mode edit aktif
    btnSimpan.textContent = 'Perbarui Menu';
    btnSimpan.style.background = '#ffc107';
    btnSimpan.style.color = 'black';
    btnBatal.style.display = 'inline-block';

    pesan.style.color = '#007bff';
    pesan.textContent = `Mode Edit Aktif (ID: ${id}). Silakan ubah data menu.`;

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 4. Fungsi Reset / Tombol Batal
  function resetForm() {
    formNavigasi.reset();
    inputId.value = '';
    btnSimpan.textContent = 'Simpan Menu';
    btnSimpan.style.background = '#28a745';
    btnSimpan.style.color = 'white';
    btnBatal.style.display = 'none';
    pesan.textContent = '';
  }

  btnBatal.addEventListener('click', () => {
    resetForm();
    pesan.style.color = 'gray';
    pesan.textContent = 'Edit menu dibatalkan.';
  });

  // 5. Fungsi Global Hapus
  window.hapusMenu = async (id) => {
    if (!confirm('Yakin ingin menghapus menu navigasi ini?')) return;

    try {
      const response = await fetch(`/api/navbar/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        pesan.style.color = 'green';
        pesan.textContent = 'Menu berhasil dihapus!';
        resetForm();
        muatMenu();
      } else {
        pesan.style.color = 'red';
        pesan.textContent = 'Gagal menghapus menu.';
      }
    } catch (err) {
      console.error('Error:', err);
      pesan.style.color = 'red';
      pesan.textContent = 'Terjadi kesalahan koneksi ke server.';
    }
  };
});
