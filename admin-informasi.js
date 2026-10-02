document.addEventListener('DOMContentLoaded', () => {
  const formInformasi = document.getElementById('form-informasi');
  const inputId = document.getElementById('id-informasi');
  const inputJudul = document.getElementById('judul_informasi');
  const inputLink = document.getElementById('link_informasi');
  const inputGambar = document.getElementById('gambar_informasi');
  const btnSimpan = document.getElementById('btn-simpan-informasi');
  const btnBatal = document.getElementById('btn-batal-informasi');
  const tabelBody = document.getElementById('tabel-informasi-body');
  const pesan = document.getElementById('pesan-informasi');

  if (!formInformasi) return;

  // Placeholder SVG standar yang aman tanpa kueri luar
  const noImgSvg =
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'><rect width='100%' height='100%' fill='%23cccccc'/><text x='50%' y='50%' fill='%23333333' dominant-baseline='middle' text-anchor='middle' font-size='10'>No Img</text></svg>";

  // 1. Fungsi Memuat Data Informasi
  async function muatInformasi() {
    try {
      const response = await fetch('/api/informasi');
      const dataList = await response.json();

      tabelBody.innerHTML = '';
      if (!dataList || dataList.length === 0) {
        tabelBody.innerHTML =
          '<tr><td colspan="4" style="text-align:center;">Belum ada data informasi.</td></tr>';
        return;
      }

      dataList.forEach((item) => {
        const tr = document.createElement('tr');

        // Pengaman path gambar informasi
        let sumberGambar = item.gambar_informasi || '';
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

        // Pengaman string untuk tombol edit agar tidak error jika null
        const judulAman = (item.judul_informasi || '').replace(/'/g, "\\'");
        const linkAman = (item.link_informasi || '').replace(/'/g, "\\'");

        tr.innerHTML = `
          <td><b>${item.judul_informasi || '-'}</b></td>
          <td><img src="${sumberGambar}" width="60" style="border-radius: 4px; object-fit: cover;" onerror="this.onerror=null; this.src='${noImgSvg}';"></td>
          <td><a href="${item.link_informasi || '#'}" target="_blank">${item.link_informasi || '-'}</a></td>
          <td>
              <button onclick="editInformasi(${item.id}, '${judulAman}', '${linkAman}')" style="background:#ffc107; color:black; padding:5px 10px; margin-bottom:5px; border:none; border-radius:3px; cursor:pointer;">Edit</button><br>
              <button onclick="hapusInformasi(${item.id})" style="background:#dc3545; color:white; padding:5px 10px; border:none; border-radius:3px; cursor:pointer;">Hapus</button>
          </td>
        `;
        tabelBody.appendChild(tr);
      });
    } catch (err) {
      console.error('Gagal memuat Informasi:', err);
    }
  }

  muatInformasi();

  // 2. Fungsi Simpan (Tambah POST atau Edit PUT)
  formInformasi.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = inputId.value;
    const formData = new FormData();
    formData.append('judul', inputJudul.value);
    formData.append('link', inputLink.value);

    if (inputGambar.files[0]) {
      formData.append('gambar', inputGambar.files[0]);
    }

    const url = id ? `/api/informasi/${id}` : '/api/informasi';
    const method = id ? 'PUT' : 'POST';

    // Indikator status proses
    btnSimpan.disabled = true;
    const teksAwalBtn = btnSimpan.textContent;
    btnSimpan.textContent = 'Menyimpan...';

    try {
      const response = await fetch(url, {
        method: method,
        body: formData,
      });

      const hasil = await response.json();

      if (response.ok) {
        pesan.style.color = 'green';
        pesan.textContent = hasil.message || 'Informasi berhasil disimpan!';
        resetForm();
        muatInformasi();
      } else {
        pesan.style.color = 'red';
        pesan.textContent = hasil.error || 'Gagal menyimpan Informasi.';
      }
    } catch (err) {
      console.error('Error:', err);
      pesan.style.color = 'red';
      pesan.textContent = 'Terjadi kesalahan koneksi ke server.';
    } finally {
      btnSimpan.disabled = false;
      btnSimpan.textContent = id ? 'Perbarui Informasi' : 'Simpan Informasi';
    }
  });

  // 3. Fungsi Global Edit
  window.editInformasi = (id, judul_Informasi, link_informasi) => {
    inputId.value = id;
    inputJudul.value = judul_Informasi;
    inputLink.value = link_informasi;
    inputGambar.value = ''; // Reset input file

    btnSimpan.textContent = 'Perbarui Informasi';
    btnSimpan.style.background = '#ffc107';
    btnSimpan.style.color = 'black';
    btnBatal.style.display = 'inline-block';

    pesan.style.color = '#007bff';
    pesan.textContent = `Mode Edit Aktif (ID: ${id}).`;

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 4. Fungsi Reset / Tombol Batal
  function resetForm() {
    formInformasi.reset();
    inputId.value = '';
    inputJudul.value = '';
    inputLink.value = '';
    btnSimpan.textContent = 'Simpan Informasi';
    btnSimpan.style.background = '#28a745';
    btnSimpan.style.color = 'white';
    btnBatal.style.display = 'none';
    pesan.textContent = '';
  }

  btnBatal.addEventListener('click', () => {
    resetForm();
    pesan.style.color = 'gray';
    pesan.textContent = 'Edit informasi dibatalkan.';
  });

  // 5. Fungsi Global Hapus
  window.hapusInformasi = async (id) => {
    if (!confirm('Yakin ingin menghapus informasi ini?')) return;

    try {
      const response = await fetch(`/api/informasi/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        pesan.style.color = 'green';
        pesan.textContent = 'Informasi berhasil dihapus!';
        resetForm();
        muatInformasi();
      } else {
        pesan.style.color = 'red';
        pesan.textContent = 'Gagal menghapus informasi.';
      }
    } catch (err) {
      console.error('Error:', err);
      pesan.style.color = 'red';
      pesan.textContent = 'Terjadi kesalahan koneksi ke server.';
    }
  };
});
