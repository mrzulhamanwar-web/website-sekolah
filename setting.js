// Tambahkan fungsi logout ini di file setting.js
async function keluarAdmin() {
  if (confirm('Apakah Anda yakin ingin keluar?')) {
    try {
      const response = await fetch('/api/logout', { method: 'POST' });
      const result = await response.json();

      if (response.ok && result.status === 'success') {
        window.location.href = 'login.html';
      } else {
        alert('Gagal logout. Silakan coba lagi.');
      }
    } catch (err) {
      console.error('Error saat logout:', err);
      window.location.href = 'login.html';
    }
  }
}
async function tampilkanUsers() {
  console.log('Function tampilkanUsers berjalan');

  const res = await fetch('/api/users');

  const users = await res.json();

  console.log('Data users:', users);

  const daftarUsers = document.querySelector('#daftarUsers');

  console.log('Elemen daftarUsers:', daftarUsers);

  let tabel = `
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Username</th>
          <th>Role</th>
          <th>Dibuat</th>
        </tr>
      </thead>

      <tbody>
  `;

  users.forEach((user) => {
    const badgeRole =
      user.role === 'admin'
        ? `<span class="badge-role badge-admin">Admin</span>`
        : `<span class="badge-role badge-operator">Operator</span>`;

    tabel += `
    <tr>
      <td>${user.id}</td>
      <td>${user.username}</td>
      <td>${badgeRole}</td>
        <td>
        <button
          class="btn-edit-user"
          onclick="editUser(${user.id})"
        >
          Edit
        </button>
      </td>
    </tr>
  `;
  });

  tabel += `
      </tbody>
    </table>
  `;

  daftarUsers.innerHTML = tabel;
}
tampilkanUsers();

async function hapusUser(id) {
  const yakin = confirm('Apakah Anda yakin ingin menghapus user ini?');

  if (!yakin) {
    return;
  }

  try {
    const response = await fetch(`/api/users/${id}`, {
      method: 'DELETE',
    });

    const result = await response.json();

    if (response.ok) {
      tampilkanNotifikasi(result.message || 'User berhasil dihapus!');

      tutupEditUser();

      tampilkanUsers();
    } else {
      tampilkanNotifikasi(result.message || 'Gagal menghapus user', 'error');
    }
  } catch (err) {
    console.error('Error hapus user:', err);

    tampilkanNotifikasi('Terjadi kesalahan pada server', 'error');
  }
}
const formTambahUser = document.getElementById('form-tambah-user');

if (formTambahUser) {
  formTambahUser.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username-user').value;
    const password = document.getElementById('password-user').value;
    const role = document.getElementById('role-user').value;

    const passwordConfirm = document.getElementById(
      'password-user-confirm'
    ).value;

    if (password !== passwordConfirm) {
      alert('Konfirmasi password tidak sama');
      return;
    }

    try {
      const response = await fetch('/api/users', {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          username,
          password,
          role,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        tampilkanNotifikasi(result.message || 'Akun berhasil dibuat!');

        tampilkanUsers();

        document.getElementById('form-tambah-user').reset();
      } else {
        tampilkanNotifikasi(result.message || 'Gagal membuat akun', 'error');
      }
    } catch (err) {
      console.error('Error tambah user:', err);

      alert('Terjadi kesalahan pada server');
    }
  });
}
async function editUser(id) {
  try {
    // Ambil semua data user dari server
    const response = await fetch('/api/users');

    if (!response.ok) {
      alert('Gagal mengambil data user');
      return;
    }

    const users = await response.json();

    // Cari user berdasarkan ID
    const user = users.find((item) => Number(item.id) === Number(id));

    if (!user) {
      alert('User tidak ditemukan');
      return;
    }

    // Masukkan data user ke dalam modal
    document.getElementById('edit-user-id').value = user.id;

    document.getElementById('edit-username').value = user.username;

    document.getElementById('edit-role').value = user.role;

    // Kosongkan password
    document.getElementById('edit-password').value = '';

    document.getElementById('edit-password-confirm').value = '';

    // Tampilkan modal
    const modal = document.getElementById('modal-edit-user');

    modal.style.display = 'flex';
  } catch (err) {
    console.error('Error membuka edit user:', err);

    alert('Terjadi kesalahan pada server');
  }
}
function tutupEditUser() {
  const modal = document.getElementById('modal-edit-user');

  modal.style.display = 'none';
}
async function simpanEditUser() {
  // Ambil data dari modal
  const id = document.getElementById('edit-user-id').value;

  const username = document.getElementById('edit-username').value.trim();

  const role = document.getElementById('edit-role').value;

  const password = document.getElementById('edit-password').value;

  const passwordConfirm = document.getElementById(
    'edit-password-confirm'
  ).value;

  // Username wajib diisi
  if (!username) {
    alert('Username wajib diisi');
    return;
  }
  if (password && password.length < 6) {
    alert('Password baru minimal 6 karakter');
    return;
  }
  // Kalau password diisi,
  // konfirmasi password harus sama
  if (password !== passwordConfirm) {
    alert('Konfirmasi password tidak sama');
    return;
  }

  try {
    const response = await fetch(`/api/users/${id}`, {
      method: 'PUT',

      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({
        username: username,
        role: role,
        password: password,
      }),
    });

    const result = await response.json();

    if (response.ok) {
      tampilkanNotifikasi(result.message || 'User berhasil diperbarui!');

      // Tutup modal
      tutupEditUser();

      // Tampilkan data terbaru
      tampilkanUsers();
    } else {
      tampilkanNotifikasi(result.message || 'Gagal memperbarui user', 'error');
    }
  } catch (err) {
    console.error('Error simpan edit user:', err);

    tampilkanNotifikasi('Terjadi kesalahan pada server', 'error');
  }
}
function hapusUserDariEdit() {
  // Ambil ID user yang sedang dibuka di modal
  const id = document.getElementById('edit-user-id').value;

  // Pastikan ada ID
  if (!id) {
    alert('User tidak ditemukan');
    return;
  }

  // Panggil fungsi hapus yang sudah kita buat sebelumnya
  hapusUser(id);
}
function tampilkanNotifikasi(pesan, tipe = 'berhasil') {
  const notifikasi = document.getElementById('notifikasi-admin');

  const icon = document.getElementById('notifikasi-icon');

  const teks = document.getElementById('notifikasi-pesan');

  // Isi pesan
  teks.textContent = pesan;

  // Bersihkan class lama
  notifikasi.classList.remove('berhasil', 'error', 'tampil');

  // Tentukan jenis notifikasi
  if (tipe === 'error') {
    icon.textContent = '✕';

    notifikasi.classList.add('error');
  } else {
    icon.textContent = '✓';

    notifikasi.classList.add('berhasil');
  }

  // Tampilkan notifikasi
  setTimeout(() => {
    notifikasi.classList.add('tampil');
  }, 10);

  // Sembunyikan setelah 3 detik
  setTimeout(() => {
    notifikasi.classList.remove('tampil');
  }, 3000);
}
