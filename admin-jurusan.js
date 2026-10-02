document.addEventListener('DOMContentLoaded', () => {
  const formSlider = document.getElementById('form-jurusan');
  const inputId = document.getElementById('id-jurusan');
  const inputJudul = document.getElementById('nama_jurusan');
  const inputSingkatan = document.getElementById('singkatan_jurusan');
  const inputDeskripsi = document.getElementById('deskripsi_jurusan');
  const inputGambar = document.getElementById('gambar_jurusan');
  const btnSimpan = document.getElementById('btn-simpan-jurusan');
  const tabelBody = document.getElementById('tabel-jurusan-body');
  const pesan = document.getElementById('pesan-jurusan');

  if (!formSlider) return;

  // 1. Perbaikan: Mengubah string SVG ke format URL Hex yang aman dari eror 'http'
  const fallbackSVG =
    "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100%25' height='100%25' fill='%23e0e0e0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='12' fill='%23666'%3ENo Image%3C/text%3E%3C/svg%3E";

  // Memori sementara untuk menampung data dari database
  window.cacheJurusan = [];

  // Fungsi Memuat Data Slider Jurusan
  async function muatSliderJurusan() {
    try {
      const response = await fetch('/api/slider-jurusan');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      const sliderList = Array.isArray(result) ? result : result.data || [];

      // Simpan ke memori global agar fungsi edit bisa langsung membacanya
      window.cacheJurusan = sliderList;

      tabelBody.innerHTML = '';

      if (sliderList.length === 0) {
        tabelBody.innerHTML =
          '<tr><td colspan="5" style="text-align:center;">Belum ada data jurusan.</td></tr>';
        return;
      }

      sliderList.forEach((slider) => {
        const tr = document.createElement('tr');

        let imgSource = fallbackSVG;
        if (slider.gambar_jurusan) {
          if (
            slider.gambar_jurusan.startsWith('http') ||
            slider.gambar_jurusan.startsWith('/uploads/')
          ) {
            imgSource = slider.gambar_jurusan;
          } else {
            imgSource = `/uploads/${slider.gambar_jurusan}`;
          }
        }

        tr.innerHTML = `
            <td>
              <img src="${imgSource}" class="img-slider" alt="Slider" width="100" style="border-radius:4px; object-fit:cover;">
            </td>
            <td>${slider.nama_jurusan || '-'}</td>
            <td>${slider.singkatan_jurusan || '-'}</td>
            <td>${slider.deskripsi_jurusan || '-'}</td>
            <td>
                <!-- 2. Perbaikan: Mengirim ID saja untuk menghindari eror karakter petik pecah -->
                <button onclick="tangkapEdit(${slider.id})" style="background:#ffc107; color:black; padding:5px 10px; margin-right:5px; border:none; cursor:pointer; font-weight:bold; border-radius:4px;">Edit</button>
                <button onclick="hapusSlider(${slider.id})" style="background:#dc3545; color:white; padding:5px 10px; border:none; cursor:pointer; font-weight:bold; border-radius:4px;">Hapus</button>
            </td>
        `;

        const imgEl = tr.querySelector('.img-slider');
        if (imgEl) {
          imgEl.addEventListener('error', function () {
            this.onerror = null;
            this.src = fallbackSVG;
          });
        }

        tabelBody.appendChild(tr);
      });
    } catch (err) {
      console.error('Gagal memuat slider:', err);
    }
  }

  // Jembatan pencarian data edit berdasarkan ID dari memori cache
  window.tangkapEdit = (id) => {
    const item = window.cacheJurusan.find((d) => d.id === id);
    if (!item) return;
    window.editSlider(
      item.id,
      item.nama_jurusan || '',
      item.singkatan_jurusan || '',
      item.deskripsi_jurusan || ''
    );
  };

  muatSliderJurusan();

  // Fungsi Simpan (POST / PUT)
  formSlider.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = inputId.value;
    const formData = new FormData();
    formData.append('nama', inputJudul.value);
    formData.append('singkatan', inputSingkatan.value);
    formData.append('deskripsi', inputDeskripsi.value);

    if (inputGambar.files[0]) {
      formData.append('gambar', inputGambar.files[0]);
    }

    const url = id ? `/api/slider-jurusan/${id}` : '/api/slider-jurusan';
    const method = id ? 'PUT' : 'POST';

    btnSimpan.disabled = true;
    btnSimpan.textContent = 'Menyimpan...';

    try {
      const response = await fetch(url, {
        method: method,
        body: formData,
      });

      const hasil = await response.json();

      if (response.ok) {
        pesan.style.color = 'green';
        pesan.textContent = hasil.message || 'Data berhasil disimpan!';
        resetForm();
        muatSliderJurusan();
      } else {
        pesan.style.color = 'red';
        pesan.textContent = hasil.error || 'Gagal menyimpan data.';
      }
    } catch (err) {
      console.error('Error:', err);
      pesan.style.color = 'red';
      pesan.textContent = 'Terjadi kesalahan koneksi ke server.';
    } finally {
      btnSimpan.disabled = false;
      btnSimpan.textContent = id ? 'Perbarui Jurusan' : 'Simpan Jurusan';
    }
  });

  // Fungsi Global Edit Form
  window.editSlider = (id, judul, singkatan, deskripsi) => {
    inputId.value = id;
    inputJudul.value = judul;
    inputSingkatan.value = singkatan;
    inputDeskripsi.value = deskripsi;

    btnSimpan.textContent = 'Perbarui Jurusan';
    btnSimpan.style.background = '#ffc107';
    btnSimpan.style.color = 'black';

    const btnBatal = document.getElementById('btn-batal-jurusan');
    if (btnBatal) {
      btnBatal.style.setProperty('display', 'inline-block', 'important');
    }

    pesan.style.color = '#007bff';
    pesan.textContent = `Mode Edit Aktif (ID: ${id}). Silakan ubah data jurusan.`;

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Fungsi Tombol Batal
  function resetForm() {
    formSlider.reset();
    inputId.value = '';
    btnSimpan.textContent = 'Simpan Jurusan';
    btnSimpan.style.background = '#28a745';
    btnSimpan.style.color = 'white';

    const btnBatal = document.getElementById('btn-batal-jurusan');
    if (btnBatal) {
      btnBatal.style.setProperty('display', 'none', 'important');
    }

    pesan.textContent = '';
  }

  document.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'btn-batal-jurusan') {
      resetForm();
      pesan.style.color = 'gray';
      pesan.textContent = 'Edit dibatalkan.';
    }
  });

  // Fungsi Global Hapus
  window.hapusSlider = async (id) => {
    if (!confirm('Yakin ingin menghapus data jurusan ini?')) return;

    try {
      const response = await fetch(`/api/slider-jurusan/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        pesan.style.color = 'green';
        pesan.textContent = 'Data jurusan berhasil dihapus!';
        resetForm();
        muatSliderJurusan();
      } else {
        pesan.style.color = 'red';
        pesan.textContent = 'Gagal menghapus data.';
      }
    } catch (err) {
      console.error('Error:', err);
      pesan.style.color = 'red';
      pesan.textContent = 'Terjadi kesalahan koneksi ke server.';
    }
  };
});
