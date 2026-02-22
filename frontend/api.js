// Auto-detect: if served from localhost:3000 (dev), point to localhost:8000
// In production on Render, set this to your backend URL
const API_BASE = window.location.hostname === 'localhost'
    ? 'http://localhost:8000'
    : 'https://taxexpert-api.onrender.com';  // ← UPDATE THIS after Render deploy

// ─── Token Management ───
function getToken() { return localStorage.getItem('taxexpert_token'); }
function setToken(token) { localStorage.setItem('taxexpert_token', token); }
function removeToken() { localStorage.removeItem('taxexpert_token'); }
function getUser() {
    const u = localStorage.getItem('taxexpert_user');
    return u ? JSON.parse(u) : null;
}
function setUser(user) { localStorage.setItem('taxexpert_user', JSON.stringify(user)); }
function removeUser() { localStorage.removeItem('taxexpert_user'); }
function isLoggedIn() { return !!getToken(); }

// ─── API Fetch Wrapper ───
async function api(path, options = {}) {
    const token = getToken();
    const headers = { ...(options.headers || {}) };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }
    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    if (res.status === 401) { logout(); throw new Error('Session expired'); }
    if (res.status === 204) return null;
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Request failed');
    return data;
}

// ─── Auth Functions ───
async function apiRegister(email, password, fullName, phone) {
    const data = await api('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, full_name: fullName, phone }),
    });
    setToken(data.access_token);
    setUser(data.user);
    return data;
}

async function apiLogin(email, password) {
    const data = await api('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
    setToken(data.access_token);
    setUser(data.user);
    return data;
}

function logout() {
    removeToken();
    removeUser();
    navigateTo('landing');
    updateNavbar();
}

// ─── Filing API ───
async function apiCreateFiling(data) {
    return api('/api/filings/', { method: 'POST', body: JSON.stringify(data) });
}
async function apiGetFilings() {
    return api('/api/filings/');
}
async function apiGetFiling(id) {
    return api(`/api/filings/${id}`);
}
async function apiUpdateFiling(id, data) {
    return api(`/api/filings/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}
async function apiCalculateTax(id) {
    return api(`/api/filings/${id}/calculate`, { method: 'POST' });
}
async function apiGetSuggestions(id) {
    return api(`/api/filings/${id}/suggestions`);
}

// ─── User API ───
async function apiGetProfile() {
    return api('/api/users/profile');
}
async function apiUpdateProfile(data) {
    return api('/api/users/profile', { method: 'PUT', body: JSON.stringify(data) });
}

// ─── Document API ───
async function apiGetDocuments() {
    return api('/api/documents/');
}
async function apiUploadDocument(file, docType) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('doc_type', docType);
    return api('/api/documents/', { method: 'POST', body: formData });
}
async function apiDeleteDocument(id) {
    return api(`/api/documents/${id}`, { method: 'DELETE' });
}

// ─── Toast Notifications ───
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const icons = { success: '✓', error: '✕', info: 'ℹ' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${icons[type] || 'ℹ'}</span><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(100%)'; setTimeout(() => toast.remove(), 300); }, 4000);
}

// ─── Formatting ───
function formatCurrency(n) {
    if (n === undefined || n === null) return '₹0';
    return '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });
}
function formatDate(d) {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
function statusBadge(status) {
    const map = { draft: 'info', in_progress: 'warning', calculated: 'primary', submitted: 'success', filed: 'success' };
    return `<span class="badge badge-${map[status] || 'info'}">${status.replace('_', ' ')}</span>`;
}
