const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api/v1';

export class ApiClientError extends Error {
  constructor(message, { status, errorCode, details, requestId } = {}) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status || 500;
    this.errorCode = errorCode || 'UNKNOWN_ERROR';
    this.details = Array.isArray(details) ? details : [];
    this.requestId = requestId || null;
  }
}

export async function apiRequest(endpoint, options = {}) {
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const token = localStorage.getItem('sb_access_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  let response;
  try {
    response = await fetch(url, {
      credentials: 'include',
      ...options,
      headers
    });
  } catch {
    throw new ApiClientError(
      'Không thể kết nối tới máy chủ Backend (http://localhost:8081). Vui lòng kiểm tra Backend đã khởi động chưa.',
      { status: 0, errorCode: 'NETWORK_ERROR' }
    );
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok || (payload && payload.success === false)) {
    const errorCode = payload?.error?.code || `HTTP_${response.status}`;
    const details = payload?.error?.details || [];
    const firstFieldMsg = details.length > 0 ? details[0].message : null;
    const message = firstFieldMsg || payload?.message || `Yêu cầu thất bại (${response.status})`;

    throw new ApiClientError(message, {
      status: response.status,
      errorCode,
      details,
      requestId: payload?.requestId
    });
  }

  return payload;
}
