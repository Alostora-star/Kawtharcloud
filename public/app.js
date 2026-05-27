// ===== SHARED UTILITIES =====
const API = '/api';

function getToken() { return localStorage.getItem('token'); }
function getUser()  { return JSON.parse(localStorage.getItem('user') || 'null'); }

function setAuth(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

function clearAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

async function apiFetch(path, options = {}) {
  const res = await fetch(API + path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
      ...(options.headers || {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'حدث خطأ');
  return data;
}

function showToast(msg, type = 'success') {
  let t = document.getElementById('toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.style.background = type === 'error' ? '#3d1616' : '';
  t.style.borderColor = type === 'error' ? '#c0392b' : '';
  t.style.color      = type === 'error' ? '#e88'    : '';
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

function openModal(id)  { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

function formatDate(d) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('ar-SY', { year:'numeric', month:'short', day:'numeric' });
}

function initNav() {
  const user = getUser();
  if (!user) { window.location.href = '/'; return; }
  const nameEl = document.getElementById('userName');
  const roleEl = document.getElementById('userRole');
  const avEl   = document.getElementById('userAvatar');
  if (nameEl) nameEl.textContent = user.name;
  if (roleEl) roleEl.textContent = { admin:'مشرف عام', teacher:'أستاذ', parent:'ولي أمر' }[user.role] || user.role;
  if (avEl)   avEl.textContent   = user.name.charAt(0);
  document.getElementById('logoutBtn')?.addEventListener('click', () => {
    clearAuth(); window.location.href = '/';
  });
}

// Redirect if not logged in or wrong role
function requireRole(...roles) {
  const user = getUser();
  if (!user || !roles.includes(user.role)) {
    clearAuth(); window.location.href = '/';
  }
}
