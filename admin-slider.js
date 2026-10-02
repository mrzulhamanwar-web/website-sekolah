document.addEventListener('DOMContentLoaded', () => {
  const formSlider = document.getElementById('form-slider');
  const inputId = document.getElementById('id-slider');
  const inputJudul = document.getElementById('judul');
  const inputDeskripsi = document.getElementById('deskripsi');
  const inputGambar = document.getElementById('gambar');
  const btnSimpan = document.getElementById('btn-simpan-slider');
  const tabelBody = document.getElementById('tabel-slider-body');
  const pesan = document.getElementById('pesan-slider');

  if (!formSlider || !tabelBody) return;

  const noImgSvg =
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='60' viewBox='0 0 100 60'><rect width='100%' height='100%' fill='%23cccccc'/><text x='50%' y='50%' fill='%23333333' dominant-baseline='middle' text-anchor='middle' font-size='12'>No Image</text></svg>";

  // 1. FUNGSI MEMUAT DATA
  window.muatDataSlider = async function () {
    try {
      const response = await fetch('/api/slider-utama');
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

      const result = await response.json();
      const sliderList = Array.isArray(result) ? result : result.data || [];

      tabelBody.innerHTML = '';

      if (!Array.isArray(sliderList) || sliderList.length === 0) {
        tabelBody.innerHTML =
          '<tr><td colspan="4" style="text-align:center;">Belum ada data slider.</td></tr>';
        return;
      }

      sliderList.forEach((slider) => {
        const tr = document.createElement('tr');

        let imgSource = slider.gambar || '';
        if (imgSource) {
          if (
            !imgSource.startsWith('/uploads/') &&
            !imgSource.startsWith('http') &&
            !imgSource.startsWith('data:')
          ) {
            imgSource = `/uploads/${imgSource}`;
          }
        } else {
          imgSource = noImgSvg;
        }

        // Simpan data langsung ke atribut data-* elemen tombol
        tr.innerHTML = `
            <td>
              <img src="${imgSource}" alt="Slider" width="100" style="border-radius: 4px; object-fit: cover;" onerror="this.onerror=null; this.src='${noImgSvg}';">
            </td>
            <td><b>${slider.judul || '-'}</b></td>
            <td>${slider.deskripsi || '-'}</td>
            <td>
                <button type="button" class="btn-edit-slider" 
                  data-id="${slider.id}" 
                  data-judul="${encodeURIComponent(slider.judul || '')}" 
                  data-deskripsi="${encodeURIComponent(slider.deskripsi || '')}" 
                  style="background:#ffc107; color:black; padding:5px 10px; margin-right:5px; border:none; border-radius:3px; cursor:pointer;">Edit</button>
                <button type="button" class="btn-hapus-slider" 
                  data-id="${slider.id}" 
                  style="background:#dc3545; color:white; padding:5px 10px; border:none; border-radius:3px; cursor:pointer;">Hapus</button>
            </td>
        `;
        tabelBody.appendChild(tr);
      });
    } catch (err) {
      console.error('Gagal memuat data slider:', err);
    }
  };

  // 2. EVENT DELEGATION UNTUK TOMBOL EDIT DAN HAPUS PADA TABEL
  tabelBody.addEventListener('click', async (e) => {
    const target = e.target;

    // --- AKSI KLIK EDIT ---
    if (target.classList.contains('btn-edit-slider')) {
      e.preventDefault();
      const id = target.getAttribute('data-id');
      const judul = decodeURIComponent(target.getAttribute('data-judul'));
      const deskripsi = decodeURIComponent(
        target.getAttribute('data-deskripsi')
      );

      inputId.value = id;
      inputJudul.value = judul;
      inputDeskripsi.value = deskripsi;

      btnSimpan.textContent = 'Perbarui Slider';
      btnSimpan.style.background = '#ffc107';
      btnSimpan.style.color = 'black';

      const btnBatal = document.getElementById('btn-batal-slider');
      if (btnBatal) {
        btnBatal.style.setProperty('display', 'inline-block', 'important');
      }

      if (pesan) {
        pesan.style.color = '#007bff';
        pesan.textContent = `Mode Edit Aktif (ID: ${id}). Silakan sesuaikan data.`;
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // --- AKSI KLIK HAPUS ---
    if (target.classList.contains('btn-hapus-slider')) {
      e.preventDefault();
      const id = target.getAttribute('data-id');

      if (!confirm(`Yakin ingin menghapus slider dengan ID: ${id}?`)) return;

      try {
        const response = await fetch(`/api/slider-utama/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          if (pesan) {
            pesan.style.color = 'green';
            pesan.textContent = 'Slider berhasil dihapus!';
          }
          resetFormSlider();
          window.muatDataSlider();
        } else {
          const resErr = await response.json();
          if (pesan) {
            pesan.style.color = 'red';
            pesan.textContent = resErr.message || 'Gagal menghapus slider.';
          }
        }
      } catch (err) {
        console.error('Error saat hapus:', err);
        if (pesan) {
          pesan.style.color = 'red';
          pesan.textContent = 'Kesalahan jaringan / server.';
        }
      }
    }
  });

  // 3. FUNGSI SIMPAN (POST / PUT)
  formSlider.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = inputId.value ? inputId.value.trim() : '';
    const formData = new FormData();
    formData.append('judul', inputJudul.value);
    formData.append('deskripsi', inputDeskripsi.value);

    if (inputGambar.files[0]) {
      formData.append('gambar', inputGambar.files[0]);
    }

    const url = id ? `/api/slider-utama/${id}` : '/api/slider-utama';
    const method = id ? 'PUT' : 'POST';

    btnSimpan.disabled = true;

    try {
      const response = await fetch(url, {
        method: method,
        body: formData,
      });

      const hasil = await response.json();

      if (response.ok) {
        pesan.style.color = 'green';
        pesan.textContent = hasil.message || 'Data berhasil disimpan!';
        resetFormSlider();
        window.muatDataSlider();
      } else {
        pesan.style.color = 'red';
        pesan.textContent = hasil.message || 'Gagal menyimpan data.';
      }
    } catch (err) {
      console.error('Error saat simpan:', err);
      pesan.style.color = 'red';
      pesan.textContent = 'Terjadi kesalahan koneksi ke server.';
    } finally {
      btnSimpan.disabled = false;
    }
  });

  // 4. RESET FORM & BATAL
  function resetFormSlider() {
    formSlider.reset();
    inputId.value = '';
    btnSimpan.textContent = 'Simpan Slider';
    btnSimpan.style.background = '#28a745';
    btnSimpan.style.color = 'white';

    const btnBatal = document.getElementById('btn-batal-slider');
    if (btnBatal) {
      btnBatal.style.setProperty('display', 'none', 'important');
    }

    if (pesan) pesan.textContent = '';
  }

  document.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'btn-batal-slider') {
      resetFormSlider();
      if (pesan) {
        pesan.style.color = 'gray';
        pesan.textContent = 'Edit dibatalkan.';
      }
    }
  });

  // Load awal
  window.muatDataSlider();
});
