const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function api(path, options = {}) {
  const token = localStorage.getItem("dayflow_token");
  const headers = { ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }), ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  let data = null;
  try { data = await response.json(); } catch (_) {}

  if (!response.ok) {
    const message = data?.detail || data?.message || `Request failed (${response.status})`;
    throw new Error(message);
  }
  return data;
}
