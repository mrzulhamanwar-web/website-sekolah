document.addEventListener('DOMContentLoaded', () => {
  const formEkskul = document.getElementById('form-ekskul');
  const inputId = document.getElementById('id-ekskul');
  const inputNama = document.getElementById('nama_ekskul');
  const inputPembimbing = document.getElementById('pembimbing');
  const inputGambar = document.getElementById('gambar_ekskul');
  const btnSimpan = document.getElementById('btn-simpan-ekskul');
  const btnBatal = document.getElementById('btn-batal-ekskul');
  const tabelBody = document.getElementById('tabel-ekskul-body');
  const pesan = document.getElementById('pesan-ekskul');

  if (!formEkskul) return;

  // 1. Fungsi Memuat Data Keahlian
  async function muatEkstrakurikuler() {
    try {
      const response = await fetch('/api/ekstrakurikuler');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Respon dari backend:', result); // Cek ini di Console Browser (F12)

      tabelBody.innerHTML = '';

      // PERBAIKAN: Cek apakah result langsung array, atau ada di dalam properti .data
      const dataList = Array.isArray(result) ? result : result.data || [];

      // Jika dataList bukan array atau kosong
      if (!Array.isArray(dataList) || dataList.length === 0) {
        tabelBody.innerHTML = `<tr><td colspan="4" style="text-align:center;">Belum ada data ekstrakurikuler.</td></tr>`;
        return;
      }

      dataList.forEach((item) => {
        const tr = document.createElement('tr');

        // Ubah menjadi seperti ini:
        let sumberGambar =
          item.gambar_ekskul || item.logo_ekstrakurikuler || item.gambar || '';

        if (sumberGambar) {
          // Jika tidak ada awalan '/uploads/' dan tidak ada awalan 'http', tambahkan '/uploads/'
          if (
            !sumberGambar.startsWith('/uploads/') &&
            !sumberGambar.startsWith('http')
          ) {
            sumberGambar = `/uploads/${sumberGambar}`;
          }
        } else {
          sumberGambar =
            "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'><rect width='100%' height='100%' fill='%23cccccc'/><text x='50%' y='50%' fill='%23333333' dominant-baseline='middle' text-anchor='middle' font-size='10'>No Img</text></svg>";
        }

        // Gunakan data-attributes untuk menyimpan variabel secara aman
        tr.innerHTML = `
    <td><img src="${sumberGambar}" width="60" style="border-radius: 4px; object-fit: cover;" onerror="this.onerror=null;this.src='data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'60\' height=\'60\' viewBox=\'0 0 60 60\'><rect width=\'100%\' height=\'100%\' fill=\'%23cccccc\'/><text x=\'50%\' y=\'50%\' fill=\'%23333333\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-size=\'10\'>No Img</text></svg>';"></td>
    <td>${item.nama_ekskul || '-'}</td>
    <td>${item.pembimbing || '-'}</td>
    <td>
      <button class="btn-edit" 
              data-id="${item.id}" 
              data-nama="${encodeURIComponent(item.nama_ekskul || '')}" 
              data-pembimbing="${encodeURIComponent(item.pembimbing || '')}" 
              style="background:#ffc107; color:black; padding:5px 10px; margin-bottom:5px; border:none; border-radius:3px; cursor:pointer;">
        Edit
      </button><br>
      <button onclick="hapusEkskul(${item.id})" style="background:#dc3545; color:white; padding:5px 10px; border:none; border-radius:3px; cursor:pointer;">Hapus</button>
    </td>
  `;
        tabelBody.appendChild(tr);
      });

      // Event listener otomatis untuk seluruh tombol Edit yang aman dari SyntaxError
      tabelBody.querySelectorAll('.btn-edit').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const id = e.target.getAttribute('data-id');
          const nama = decodeURIComponent(e.target.getAttribute('data-nama'));
          const pembimbing = decodeURIComponent(
            e.target.getAttribute('data-pembimbing')
          );

          // Panggil fungsi editEkskul secara langsung & aman
          window.editEkskul(id, nama, pembimbing);
        });
      });
    } catch (err) {
      console.error('Gagal memuat Ekstrakurikuler:', err);
    }
  }

  muatEkstrakurikuler();

  // 2. Fungsi Simpan (Tambah POST atau Edit PUT)
  formEkskul.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = inputId.value;
    const formData = new FormData();
    formData.append('nama_ekskul', inputNama.value);
    formData.append('pembimbing', inputPembimbing.value);

    if (inputGambar.files[0]) {
      formData.append('gambar_ekskul', inputGambar.files[0]);
    }

    const url = id ? `/api/ekstrakurikuler/${id}` : '/api/ekstrakurikuler';
    const method = id ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        body: formData,
      });

      const hasil = await response.json();

      if (response.ok) {
        pesan.style.color = 'green';
        pesan.textContent =
          hasil.message || 'Ekstrakurikuler berhasil disimpan!';
        resetForm();
        muatEkstrakurikuler();
      } else {
        pesan.style.color = 'red';
        pesan.textContent = hasil.error || 'Gagal menyimpan Ekstrakurikuler.';
      }
    } catch (err) {
      console.error('Error:', err);
      pesan.style.color = 'red';
      pesan.textContent = 'Terjadi kesalahan koneksi ke server.';
    }
  });

  // 3. Fungsi Global Edit
  window.editEkskul = (id, nama_ekskul, pembimbing) => {
    inputId.value = id;
    inputNama.value = nama_ekskul;
    inputPembimbing.value = pembimbing;
    inputGambar.value = ''; // Reset input file

    btnSimpan.textContent = 'Perbarui Ekstrakurikuler';
    btnSimpan.style.background = '#ffc107';
    btnSimpan.style.color = 'black';
    btnBatal.style.display = 'inline-block';

    pesan.style.color = '#007bff';
    pesan.textContent = `Mode Edit Aktif (ID: ${id}).`;

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 4. Fungsi Reset / Tombol Batal
  function resetForm() {
    formEkskul.reset();
    inputId.value = '';
    inputPembimbing.value = '';
    btnSimpan.textContent = 'Simpan Ekstrakurikuler';
    btnSimpan.style.background = '#28a745';
    btnSimpan.style.color = 'white';
    btnBatal.style.display = 'none';
    pesan.textContent = '';
  }

  btnBatal.addEventListener('click', () => {
    resetForm();
    pesan.style.color = 'gray';
    pesan.textContent = 'Edit Ekstrakurikuler dibatalkan.';
  });

  // 5. Fungsi Global Hapus
  window.hapusEkskul = async (id) => {
    if (!confirm('Yakin ingin menghapus Ekskul ini?')) return;

    try {
      const response = await fetch(`/api/ekstrakurikuler/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        pesan.style.color = 'green';
        pesan.textContent = 'Ekskul berhasil dihapus!';
        resetForm();
        muatEkstrakurikuler();
      } else {
        pesan.style.color = 'red';
        pesan.textContent = 'Gagal menghapus Ekskul.';
      }
    } catch (err) {
      console.error('Error:', err);
      pesan.style.color = 'red';
      pesan.textContent = 'Terjadi kesalahan koneksi ke server.';
    }
  };
});
