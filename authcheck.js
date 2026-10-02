document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('/api/me', {
      credentials: 'include',
    });

    console.log('Status /api/me:', res.status);

    if (!res.ok) {
      console.log('User belum login');
      window.location.href = 'login.html';
      return;
    }

    const user = await res.json();

    console.log('Data user dari /api/me:', user);

    // ==============================
    // TAMPILKAN DATA USER DI SIDEBAR
    // ==============================

    const namaUser = document.getElementById('nama-user-login');

    const roleUser = document.getElementById('role-user-login');

    if (namaUser) {
      namaUser.textContent = user.username;
    }

    if (roleUser) {
      roleUser.textContent = user.role;
    }

    // ==============================
    // SIMPAN DATA USER
    // ==============================

    localStorage.setItem('userRole', user.role);

    localStorage.setItem('username', user.username);

    // Simpan user ke variabel global
    window.currentUser = user;
    // Sembunyikan menu/elemen khusus admin jika user adalah operator
    const elemenKhususAdmin = document.querySelectorAll('[data-role="admin"]');

    elemenKhususAdmin.forEach((elemen) => {
      if (user.role !== 'admin') {
        elemen.style.display = 'none';
      }
    });
  } catch (error) {
    console.error('Error authcheck:', error);

    window.location.href = 'login.html';
  }
});
