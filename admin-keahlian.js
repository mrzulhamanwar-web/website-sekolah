document.addEventListener('DOMContentLoaded', () => {
  const formKeahlian = document.getElementById('form-keahlian');
  const inputId = document.getElementById('id-keahlian');
  const inputKode = document.getElementById('kode_keahlian');
  const inputNama = document.getElementById('nama_keahlian');
  const inputRingkasan = document.getElementById('ringkasan');
  const inputLinkDetail = document.getElementById('link_detail');
  const inputUrutan = document.getElementById('urutan');
  const inputLogo = document.getElementById('logo_keahlian');
  const btnSimpan = document.getElementById('btn-simpan-keahlian');
  const btnBatal = document.getElementById('btn-batal-keahlian');
  const tabelBody = document.getElementById('tabel-keahlian-body');
  const pesan = document.getElementById('pesan-keahlian');

  if (!formKeahlian) return;

  // Placeholder SVG standar tanpa request internet / eksternal
  const noImgSvg =
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'><rect width='100%' height='100%' fill='%23cccccc'/><text x='50%' y='50%' fill='%23333333' dominant-baseline='middle' text-anchor='middle' font-size='10'>No Img</text></svg>";

  // 1. Fungsi Memuat Data Keahlian
  async function muatKeahlian() {
    try {
      const response = await fetch('/api/keahlian');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      const dataList = Array.isArray(result) ? result : result.data || [];

      tabelBody.innerHTML = '';

      if (!Array.isArray(dataList) || dataList.length === 0) {
        tabelBody.innerHTML =
          '<tr><td colspan="5" style="text-align:center;">Belum ada data kompetensi keahlian.</td></tr>';
        return;
      }

      dataList.forEach((item) => {
        const tr = document.createElement('tr');

        let sumberGambar = item.logo_keahlian || '';

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

        // Encode string agar aman dari karakter petik, new line, atau karakter khusus lainnya
        const safeKode = encodeURIComponent(item.kode_keahlian || '');
        const safeNama = encodeURIComponent(item.nama_keahlian || '');
        const safeRingkasan = encodeURIComponent(item.ringkasan || '');
        const safeLink = encodeURIComponent(item.link_detail || '#');

        tr.innerHTML = `
          <td>${item.urutan || 0}</td>
          <td><img src="${sumberGambar}" width="60" style="border-radius: 4px; object-fit: cover;" onerror="this.onerror=null; this.src='${noImgSvg}';"></td>
          <td><b>[${item.kode_keahlian || '-'}]</b><br>${item.nama_keahlian || '-'}</td>
          <td>${item.ringkasan || '-'}</td>
          <td>
              <button onclick="tangkapEditKeahlian(${item.id}, '${safeKode}', '${safeNama}', '${safeRingkasan}', '${safeLink}', ${item.urutan || 0})" style="background:#ffc107; color:black; padding:5px 10px; margin-bottom:5px; border:none; border-radius:3px; cursor:pointer;">Edit</button><br>
              <button onclick="hapusKeahlian(${item.id})" style="background:#dc3545; color:white; padding:5px 10px; border:none; border-radius:3px; cursor:pointer;">Hapus</button>
          </td>
        `;
        tabelBody.appendChild(tr);
      });
    } catch (err) {
      console.error('Gagal memuat kompetensi keahlian:', err);
    }
  }

  // Fungsi jembatan untuk melepaskan encoding data edit
  window.tangkapEditKeahlian = (
    id,
    kodeEnc,
    namaEnc,
    ringkasanEnc,
    linkEnc,
    urutan
  ) => {
    const kodeDec = decodeURIComponent(kodeEnc);
    const namaDec = decodeURIComponent(namaEnc);
    const ringkasanDec = decodeURIComponent(ringkasanEnc);
    const linkDec = decodeURIComponent(linkEnc);

    window.editKeahlian(id, kodeDec, namaDec, ringkasanDec, linkDec, urutan);
  };

  muatKeahlian();

  // 2. Fungsi Simpan (Tambah POST atau Edit PUT)
  formKeahlian.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = inputId.value;
    const formData = new FormData();
    formData.append('kode_keahlian', inputKode.value);
    formData.append('nama_keahlian', inputNama.value);
    formData.append('ringkasan', inputRingkasan.value);
    formData.append('link_detail', inputLinkDetail.value);
    formData.append('urutan', inputUrutan.value);

    if (inputLogo.files[0]) {
      formData.append('logo_keahlian', inputLogo.files[0]);
    }

    const url = id ? `/api/keahlian/${id}` : '/api/keahlian';
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
        pesan.textContent =
          hasil.message || 'Kompetensi keahlian berhasil disimpan!';
        resetForm();
        muatKeahlian();
      } else {
        pesan.style.color = 'red';
        pesan.textContent =
          hasil.error || 'Gagal menyimpan kompetensi keahlian.';
      }
    } catch (err) {
      console.error('Error:', err);
      pesan.style.color = 'red';
      pesan.textContent = 'Terjadi kesalahan koneksi ke server.';
    } finally {
      btnSimpan.disabled = false;
      btnSimpan.textContent = id ? 'Perbarui Keahlian' : 'Simpan Keahlian';
    }
  });

  // 3. Fungsi Global Edit
  window.editKeahlian = (
    id,
    kode_keahlian,
    nama_keahlian,
    ringkasan,
    link_detail,
    urutan
  ) => {
    inputId.value = id;
    inputKode.value = kode_keahlian;
    inputNama.value = nama_keahlian;
    inputRingkasan.value = ringkasan;
    inputLinkDetail.value = link_detail;
    inputUrutan.value = urutan;
    inputLogo.value = ''; // Reset input file

    btnSimpan.textContent = 'Perbarui Keahlian';
    btnSimpan.style.background = '#ffc107';
    btnSimpan.style.color = 'black';
    btnBatal.style.display = 'inline-block';

    pesan.style.color = '#007bff';
    pesan.textContent = `Mode Edit Aktif (ID: ${id}).`;

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 4. Fungsi Reset / Tombol Batal
  function resetForm() {
    formKeahlian.reset();
    inputId.value = '';
    inputUrutan.value = '0';
    inputLinkDetail.value = '#';
    btnSimpan.textContent = 'Simpan Keahlian';
    btnSimpan.style.background = '#28a745';
    btnSimpan.style.color = 'white';
    btnBatal.style.display = 'none';
    pesan.textContent = '';
  }

  btnBatal.addEventListener('click', () => {
    resetForm();
    pesan.style.color = 'gray';
    pesan.textContent = 'Edit kompetensi keahlian dibatalkan.';
  });

  // 5. Fungsi Global Hapus
  window.hapusKeahlian = async (id) => {
    if (!confirm('Yakin ingin menghapus kompetensi keahlian ini?')) return;

    try {
      const response = await fetch(`/api/keahlian/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        pesan.style.color = 'green';
        pesan.textContent = 'Kompetensi keahlian berhasil dihapus!';
        resetForm();
        muatKeahlian();
      } else {
        pesan.style.color = 'red';
        pesan.textContent = 'Gagal menghapus kompetensi keahlian.';
      }
    } catch (err) {
      console.error('Error:', err);
      pesan.style.color = 'red';
      pesan.textContent = 'Terjadi kesalahan koneksi ke server.';
    }
  };
});
