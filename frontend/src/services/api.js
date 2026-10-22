// Servicio centralizado para comunicarse con el backend
// Sin VITE_API_URL usa ruta relativa: nginx (producción) o el proxy de Vite
// (desarrollo) se encargan de reenviar /api al backend. Así el mismo build
// funciona detrás de cualquier dominio, subdominio o puerto.
const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';

const EXPIRED_TOKEN_ERRORS = [
  'Token expirado, inicie sesión nuevamente',
  'Token inválido',
  'Token de autenticación requerido',
  'No autenticado',
];

function handleAuthError(errorMessage) {
  if (EXPIRED_TOKEN_ERRORS.some((msg) => errorMessage.includes(msg))) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
}

function filenameFromContentDisposition(header) {
  if (!header) return null;

  // RFC 5987: filename*=UTF-8''nombre%20codificado
  const encoded = header.match(/filename\*\s*=\s*UTF-8''([^;]+)/i);
  if (encoded) {
    try {
      return decodeURIComponent(encoded[1].trim().replace(/^"|"$/g, ''));
    } catch (_error) {
      // Si el encoding es inválido, se intenta con filename normal.
    }
  }

  const plain = header.match(/filename\s*=\s*"?([^";]+)"?/i);
  return plain ? plain[1].trim() : null;
}

// Helper para hacer requests con token JWT
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');

  const config = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  // Si el body es FormData (para archivos), no poner Content-Type
  if (options.body instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  const response = await fetch(`${API_BASE}${endpoint}`, config);

  if (response.status === 401) {
    const data = await response.json().catch(() => ({}));
    const errorMessage = data.error || 'No autorizado';
    handleAuthError(errorMessage);
    throw new Error(errorMessage);
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Error en la solicitud');
  }

  return data;
}

// Helper para descargar binarios (archivos) con el mismo token JWT.
// No usa el token en la URL para no exponerlo en logs, historial ni Referer.
async function requestBlob(endpoint) {
  const token = localStorage.getItem('token');

  let response;
  try {
    response = await fetch(`${API_BASE}${endpoint}`, {
      credentials: 'include',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
  } catch (_error) {
    throw new Error('No se pudo conectar con el servidor');
  }

  if (!response.ok) {
    let errorMessage = response.status === 404
      ? 'Archivo no encontrado'
      : 'No se pudo descargar el archivo';

    try {
      const data = await response.json();
      if (data?.error) errorMessage = data.error;
    } catch (_error) {
      // La respuesta de error no era JSON; se mantiene el mensaje genérico.
    }

    if (response.status === 401) handleAuthError(errorMessage);
    throw new Error(errorMessage);
  }

  return response;
}

// ═══ AUTH ═══
export const authAPI = {
  login: (correo, contrasena) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ correo, contrasena }),
    }),

  register: (userData) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  me: () => request('/auth/me'),

  resetPassword: (usuario_id, nueva_contrasena) =>
    request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ usuario_id, nueva_contrasena }),
    }),

  changePassword: (contrasena_actual, nueva_contrasena) =>
    request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ contrasena_actual, nueva_contrasena }),
    }),

  updateProfile: (data) =>
    request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// ═══ OBRAS ═══
export const obrasAPI = {
  list: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/obras${query ? `?${query}` : ''}`);
  },

  getById: (id) => request(`/obras/${id}`),

  create: (obraData) =>
    request('/obras', {
      method: 'POST',
      body: JSON.stringify(obraData),
    }),

  update: (id, obraData) =>
    request(`/obras/${id}`, {
      method: 'PUT',
      body: JSON.stringify(obraData),
    }),

  delete: (id) =>
    request(`/obras/${id}`, { method: 'DELETE' }),
};

// ═══ ARCHIVOS ═══
export const archivosAPI = {
  list: (obraId) => request(`/archivos/${obraId}`),

  upload: (obraId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return request(`/archivos/${obraId}`, {
      method: 'POST',
      body: formData,
    });
  },

  download: async (fileId, fallbackName = 'archivo') => {
    const response = await requestBlob(`/archivos/download/${fileId}`);
    const blob = await response.blob();
    const filename =
      filenameFromContentDisposition(response.headers.get('Content-Disposition')) ||
      fallbackName;

    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = filename;
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    link.remove();

    // Se libera después del click para no cortar la descarga en algunos navegadores.
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);

    return { filename, size: blob.size };
  },

  delete: (fileId) =>
    request(`/archivos/${fileId}`, { method: 'DELETE' }),
};

// ═══ DASHBOARD ═══
export const dashboardAPI = {
  stats: () => request('/dashboard/stats'),
  activity: (limit = 10) => request(`/dashboard/activity?limit=${limit}`),
  enConstruccion: () => request('/dashboard/en-construccion'),
  chartData: () => request('/dashboard/chart-data'),
};

// ═══ USUARIOS ═══
export const usuariosAPI = {
  create: (userData) =>
    request('/usuarios', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  list: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/usuarios${query ? `?${query}` : ''}`);
  },

  getById: (id) => request(`/usuarios/${id}`),

  changeRole: (id, rol) =>
    request(`/usuarios/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ rol }),
    }),

  toggleActive: (id) =>
    request(`/usuarios/${id}/toggle-active`, { method: 'PATCH' }),
};

// ═══ REPORTES ═══
export const reportesAPI = {
  downloadCSV: (params = {}) => {
    const token = localStorage.getItem('token');
    const query = new URLSearchParams(params).toString();
    const url = `${API_BASE}/reportes/obras-csv${query ? `?${query}` : ''}`;
    // Descargar como blob
    return fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => {
      if (!res.ok) throw new Error('Error al descargar');
      return res.blob();
    }).then(blob => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `obras_hidricas_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(a.href);
    });
  },
};

// ═══ AUDITORÍA ═══
export const auditoriaAPI = {
  list: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/auditoria${query ? `?${query}` : ''}`);
  },
};

// ═══ NOTIFICACIONES ═══
export const notificacionesAPI = {
  get: () => request('/notificaciones'),
};

export default { authAPI, obrasAPI, archivosAPI, dashboardAPI, usuariosAPI, reportesAPI, auditoriaAPI, notificacionesAPI };
