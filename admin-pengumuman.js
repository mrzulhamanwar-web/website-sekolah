document.addEventListener('DOMContentLoaded', () => {
  const formPengumuman = document.getElementById('form-pengumuman');
  const inputId = document.getElementById('id-pengumuman');
  const inputJudul = document.getElementById('judul_pengumuman');
  const inputTanggal = document.getElementById('tanggal');
  const inputIsi = document.getElementById('isi');
  const inputGambar = document.getElementById('gambar_pengumuman');
  const btnSimpan = document.getElementById('btn-simpan-pengumuman');
  const btnBatal = document.getElementById('btn-batal-pengumuman');
  const tabelBody = document.getElementById('tabel-pengumuman-body');
  const pesan = document.getElementById('pesan-pengumuman');

  if (!formPengumuman) return;

  // Placeholder SVG standar tanpa bergantung pada koneksi internet/eksternal
  const noImgSvg =
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'><rect width='100%' height='100%' fill='%23cccccc'/><text x='50%' y='50%' fill='%23333333' dominant-baseline='middle' text-anchor='middle' font-size='10'>No Img</text></svg>";

  // Fungsi pembantu untuk mengubah format tanggal database (YYYY-MM-DD)
  // menjadi format Indonesia yang mudah dibaca
  function formatTanggalIndonesia(tanggalStr) {
    if (!tanggalStr) return '-';
    const date = new Date(tanggalStr);
    if (isNaN(date.getTime())) return tanggalStr;

    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  // 1. Fungsi Memuat Data Pengumuman
  async function muatPengumuman() {
    try {
      const response = await fetch('/api/pengumuman');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      const dataList = Array.isArray(result) ? result : result.data || [];

      tabelBody.innerHTML = '';

      if (!Array.isArray(dataList) || dataList.length === 0) {
        tabelBody.innerHTML =
          '<tr><td colspan="5" style="text-align:center;">Belum ada data pengumuman.</td></tr>';
        return;
      }

      dataList.forEach((item) => {
        const tr = document.createElement('tr');

        // Pengaman path gambar
        let sumberGambar = item.gambar_pengumuman || '';
        if (sumberGambar) {
          if (
            !sumberGambar.startsWith('/uploads/') &&
            !sumberGambar.startsWith('http')
          ) {
            sumberGambar = `/uploads/${sumberGambar}`;
          }
        } else {
          sumberGambar = noImgSvg;
        }

        // Format tanggal untuk ditampilkan di tabel
        const tanggalTampil = formatTanggalIndonesia(item.tanggal);

        // Encode string agar aman dari karakter petik, line break, atau HTML khusus
        const safeJudul = encodeURIComponent(item.judul_pengumuman || '');
        const safeTanggal = encodeURIComponent(item.tanggal || '');
        const safeIsi = encodeURIComponent(item.isi || '');

        tr.innerHTML = `
          <td><b>${item.judul_pengumuman || '-'}</b></td>
          <td>${tanggalTampil}</td>
          <td>${item.isi || '-'}</td>
          <td><img src="${sumberGambar}" width="60" style="border-radius: 4px; object-fit: cover;" onerror="this.onerror=null; this.src='${noImgSvg}';"></td>
          <td>
              <button onclick="tangkapEditPengumuman(${item.id}, '${safeJudul}', '${safeTanggal}', '${safeIsi}')" style="background:#ffc107; color:black; padding:5px 10px; margin-bottom:5px; border:none; border-radius:3px; cursor:pointer;">Edit</button><br>
              <button onclick="hapusPengumuman(${item.id})" style="background:#dc3545; color:white; padding:5px 10px; border:none; border-radius:3px; cursor:pointer;">Hapus</button>
          </td>
        `;
        tabelBody.appendChild(tr);
      });
    } catch (err) {
      console.error('Gagal memuat pengumuman:', err);
    }
  }

  // Fungsi jembatan untuk melepaskan encoding data edit secara aman
  window.tangkapEditPengumuman = (id, judulEnc, tanggalEnc, isiEnc) => {
    const judulDec = decodeURIComponent(judulEnc);
    const tanggalDec = decodeURIComponent(tanggalEnc);
    const isiDec = decodeURIComponent(isiEnc);

    window.editPengumuman(id, judulDec, tanggalDec, isiDec);
  };

  muatPengumuman();

  // 2. Fungsi Simpan (Tambah POST atau Edit PUT)
  formPengumuman.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = inputId.value ? inputId.value.trim() : '';
    const formData = new FormData();
    formData.append('judul', inputJudul.value);
    formData.append('tanggal', inputTanggal.value);
    formData.append('isi', inputIsi.value);

    if (inputGambar.files[0]) {
      formData.append('gambar', inputGambar.files[0]);
    }

    const url = id ? `/api/pengumuman/${id}` : '/api/pengumuman';
    const method = id ? 'PUT' : 'POST';

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
        pesan.textContent = hasil.message || 'Pengumuman berhasil disimpan!';
        resetForm();
        muatPengumuman();
      } else {
        pesan.style.color = 'red';
        pesan.textContent = hasil.error || 'Gagal menyimpan Pengumuman.';
      }
    } catch (err) {
      console.error('Error:', err);
      pesan.style.color = 'red';
      pesan.textContent = 'Terjadi kesalahan koneksi ke server.';
    } finally {
      btnSimpan.disabled = false;
      btnSimpan.textContent = id ? 'Perbarui Pengumuman' : 'Simpan Pengumuman';
    }
  });

  // 3. Fungsi Global Edit
  window.editPengumuman = (id, judul_pengumuman, tanggal, isi) => {
    inputId.value = String(id);
    inputJudul.value = judul_pengumuman;
    inputTanggal.value = tanggal ? tanggal.split('T')[0] : '';
    inputIsi.value = isi;
    inputGambar.value = ''; // Reset input file

    btnSimpan.textContent = 'Perbarui Pengumuman';
    btnSimpan.style.background = '#ffc107';
    btnSimpan.style.color = 'black';
    btnBatal.style.display = 'inline-block';

    pesan.style.color = '#007bff';
    pesan.textContent = `Mode Edit Aktif (ID: ${id}).`;

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 4. Fungsi Reset / Tombol Batal
  function resetForm() {
    formPengumuman.reset();
    inputId.value = '';
    inputJudul.value = '';
    inputTanggal.value = '';
    inputIsi.value = '';
    btnSimpan.textContent = 'Simpan Pengumuman';
    btnSimpan.style.background = '#28a745';
    btnSimpan.style.color = 'white';
    btnBatal.style.display = 'none';
    pesan.textContent = '';
  }

  btnBatal.addEventListener('click', () => {
    resetForm();
    pesan.style.color = 'gray';
    pesan.textContent = 'Edit pengumuman dibatalkan.';
  });

  // 5. Fungsi Global Hapus
  window.hapusPengumuman = async (id) => {
    if (!confirm('Yakin ingin menghapus pengumuman ini?')) return;

    try {
      const response = await fetch(`/api/pengumuman/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        pesan.style.color = 'green';
        pesan.textContent = 'Pengumuman berhasil dihapus!';
        resetForm();
        muatPengumuman();
      } else {
        pesan.style.color = 'red';
        pesan.textContent = 'Gagal menghapus pengumuman.';
      }
    } catch (err) {
      console.error('Error:', err);
      pesan.style.color = 'red';
      pesan.textContent = 'Terjadi kesalahan koneksi ke server.';
    }
  };
});
