const API_BASE_URL = '/api';
document.addEventListener('DOMContentLoaded', () => {
  // 1. Panggil fungsi untuk memuat logo otomatis dari database
  muatLogoSekolah();

  // 2. Logika Form Login
  const formLogin = document.getElementById('form-login');
  if (formLogin) {
    formLogin.addEventListener('submit', async (e) => {
      e.preventDefault();

      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      const pesanError = document.getElementById('pesan-error');

      try {
        const response = await fetch(`${API_BASE_URL}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
          credentials: 'include', // <-- TAMBAHKAN INI AGAR COOKIE SESSION TERSIMPAN
        });

        console.log('STATUS:', response.status);
        console.log('STATUS TEXT:', response.statusText);

        const text = await response.text();

        console.log('RESPON SERVER:', text);

        const result = JSON.parse(text);

        console.log('HASIL LOGIN:', result);

        if (response.ok && result.status === 'success') {
          if (result.role) {
            localStorage.setItem('userRole', result.role);
          }
          if (result.username) {
            localStorage.setItem('username', result.username);
          }

          console.log('Mengarahkan ke admin.html...');

          // Arahkan langsung ke nama file-nya
          window.location.href = 'admin.html';
          return;
        }
      } catch (err) {
        console.error('Error saat login:', err);
        pesanError.innerText = 'Terjadi kesalahan koneksi ke server';
        pesanError.style.display = 'block';
      }
    });
  }
});

// Deklarasi Fungsi muatLogoSekolah (Pastikan namanya persis)
async function muatLogoSekolah() {
  const imgLogo = document.getElementById('logo-sekolah');
  if (!imgLogo) return;

  try {
    const response = await fetch(`${API_BASE_URL}/identitas`);
    const result = await response.json();

    // Jika response berupa array (seperti JSON Anda), ambil elemen pertama [0]
    const data = Array.isArray(result) ? result[0] : result.data || result;

    if (data && data.logo) {
      let pathLogo = data.logo;

      // Pastikan path tidak berganda (jika DB sudah ada /uploads/, pakai langsung)
      if (
        !pathLogo.startsWith('uploads/') &&
        !pathLogo.startsWith('/uploads/')
      ) {
        pathLogo = `uploads/${pathLogo}`;
      }

      // Hapus slash di paling depan jika ada agar path relatif konsisten
      if (pathLogo.startsWith('/')) {
        pathLogo = pathLogo.substring(1);
      }

      // Pasang ke tag <img> dengan bypass cache (?t=timestamp)
      imgLogo.src = `${pathLogo}?t=${Date.now()}`;
      console.log('Logo terpasang:', imgLogo.src);
    }
  } catch (err) {
    console.error('Gagal mengambil logo identitas:', err);
  }
}
