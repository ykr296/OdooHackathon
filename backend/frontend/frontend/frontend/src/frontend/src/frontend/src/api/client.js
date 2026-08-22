onst API_URL = 'http://localhost:8000';
function getToken() {
  return localStorage.getItem('dayflow_token');
}
export async function api(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.detail || 'Something went wrong');
  }
  return data;
}
export function saveAuth(token, user) {
  localStorage.setItem('dayflow_token', token);
  localStorage.setItem('dayflow_user', JSON.stringify(user));
}
export function clearAuth() {
  localStorage.removeItem('dayflow_token');
  localStorage.removeItem('dayflow_user');
}
export function getSavedUser() {
  const raw = localStorage.getItem('dayflow_user');
  return raw ? JSON.parse(raw) : null;
}
