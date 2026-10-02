document.addEventListener('DOMContentLoaded', () => {
  const formVideo = document.getElementById('form-video');
  const inputId = document.getElementById('id-video');
  const inputJudul = document.getElementById('judul_video');
  const inputUrl = document.getElementById('url_embed');
  const btnSimpan = document.getElementById('btn-simpan-video');
  const btnBatal = document.getElementById('btn-batal-video');
  const tabelBody = document.getElementById('tabel-video-body');
  const pesan = document.getElementById('pesan-video');

  if (!formVideo) return;

  // 1. Fungsi Memuat Data Video
  async function muatVideoYoutube() {
    try {
      const response = await fetch('/api/video');
      const menuList = await response.json();

      tabelBody.innerHTML = '';

      menuList.forEach((item) => {
        const tr = document.createElement('tr');

        // Ambil nilai dan ubah ke String secara aman agar tidak error jika null/undefined
        const judul = String(item.judul_video || '').replace(/'/g, "\\'");
        const url = String(item.url_embed || '').replace(/'/g, "\\'");

        tr.innerHTML = `
        <td>${item.judul_video || ''}</td>
        <td>${item.url_embed || ''}</td>
        
        <td>
          <button onclick="editVideo(${item.id}, '${judul}', '${url}')" style="background:#ffc107; color:black; padding:5px 10px; margin-right:5px;">Edit</button>
          <button onclick="hapusVideo(${item.id})" style="background:#dc3545; color:white; padding:5px 10px;">Hapus</button>
        </td>
      `;
        tabelBody.appendChild(tr);
      });
    } catch (err) {
      console.error('Gagal memuat Video:', err);
    }
  }

  // Pastikan fungsi dapat dipanggil dari luar (admin.html)
  window.muatVideoYoutube = muatVideoYoutube;

  // 2. Fungsi Simpan (Tambah POST atau Edit PUT)
  formVideo.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = inputId.value ? inputId.value.trim() : '';
    const dataVideo = {
      judul_video: inputJudul.value,
      url_embed: inputUrl.value,
    };

    const url = id ? `/api/video/${id}` : '/api/video';
    const method = id ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataVideo),
      });

      const hasil = await response.json();

      if (response.ok) {
        pesan.style.color = 'green';
        pesan.textContent = hasil.message || 'Data Video berhasil disimpan!';
        resetForm();
        muatVideoYoutube();
      } else {
        pesan.style.color = 'red';
        pesan.textContent = hasil.error || 'Gagal menyimpan Video.';
      }
    } catch (err) {
      console.error('Error:', err);
      pesan.style.color = 'red';
      pesan.textContent = 'Terjadi kesalahan koneksi ke server.';
    }
  });

  // 3. Fungsi Global Edit
  window.editVideo = (id, judul_video, url_embed) => {
    inputId.value = String(id);
    inputJudul.value = judul_video;
    inputUrl.value = url_embed;

    btnSimpan.textContent = 'Perbarui Video';
    btnSimpan.style.background = '#ffc107';
    btnSimpan.style.color = 'black';
    btnBatal.style.display = 'inline-block';

    pesan.style.color = '#007bff';
    pesan.textContent = `Mode Edit Aktif (ID: ${id}). Silakan ubah data Video.`;

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 4. Fungsi Reset / Tombol Batal
  function resetForm() {
    formVideo.reset();
    inputId.value = '';
    btnSimpan.textContent = 'Simpan Video';
    btnSimpan.style.background = '#28a745';
    btnSimpan.style.color = 'white';
    btnBatal.style.display = 'none';
    pesan.textContent = '';
  }

  btnBatal.addEventListener('click', () => {
    resetForm();
    pesan.style.color = 'gray';
    pesan.textContent = 'Edit Video dibatalkan.';
  });

  // 5. Fungsi Global Hapus
  window.hapusVideo = async (id) => {
    if (!confirm('Yakin ingin menghapus video ini?')) return;

    try {
      const response = await fetch(`/api/video/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        pesan.style.color = 'green';
        pesan.textContent = 'Video berhasil dihapus!';
        resetForm();
        muatVideoYoutube();
      } else {
        pesan.style.color = 'red';
        pesan.textContent = 'Gagal menghapus Video.';
      }
    } catch (err) {
      console.error('Error:', err);
      pesan.style.color = 'red';
      pesan.textContent = 'Terjadi kesalahan koneksi ke server.';
    }
  };
});
