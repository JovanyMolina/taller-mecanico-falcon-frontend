const API_URL = process.env.NEXT_PUBLIC_API_URL;

function obtenerToken() {
  if (typeof window === 'undefined') return null; 
  return localStorage.getItem('taller_motos_token');
}

async function apiFetch(path, options = {}) {
  const token = obtenerToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || 'Ocurrió un error inesperado');
  }

  return data;
}

const api = {
  get: (path) => apiFetch(path, { method: 'GET' }),
  post: (path, body) => apiFetch(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => apiFetch(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: (path, body) => apiFetch(path, { method: 'PATCH', body: JSON.stringify(body) }),
};

export default api;
