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

let refreshPromise = null;

/**
 * Kiểm tra JWT Access Token đã hết hạn (hoặc sắp hết hạn trong 10 giây tới) chưa
 */
export function isAccessTokenExpired(token) {
  if (!token) return true;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));
    if (!payload.exp) return false;
    const nowSeconds = Math.floor(Date.now() / 1000);
    return nowSeconds >= payload.exp - 10;
  } catch {
    return true;
  }
}

/**
 * Gọi POST /api/v1/auth/refresh (gửi kèm HttpOnly Cookie refreshToken) để lấy Access Token mới.
 * Dùng biến khóa refreshPromise để tránh gọi trùng lặp khi nhiều request cùng hết hạn một lúc.
 */
export async function refreshAccessToken() {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const payload = await response.json().catch(() => null);
      const newAccessToken = payload?.data?.accessToken;

      if (!response.ok || !newAccessToken) {
        throw new Error(payload?.message || 'Refresh token đã hết hạn');
      }

      localStorage.setItem('sb_access_token', newAccessToken);
      return newAccessToken;
    } catch (err) {
      localStorage.removeItem('sb_access_token');
      localStorage.removeItem('sb_user');
      localStorage.removeItem('sb_active_user_id');
      window.dispatchEvent(new CustomEvent('sb:session-expired'));
      throw err;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function apiRequest(endpoint, options = {}, isRetry = false) {
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${normalizedEndpoint}`;
  const isAuthPublicEndpoint =
    normalizedEndpoint.startsWith('/auth/login') ||
    normalizedEndpoint.startsWith('/auth/register') ||
    normalizedEndpoint.startsWith('/auth/refresh') ||
    normalizedEndpoint.startsWith('/auth/logout');

  let token = localStorage.getItem('sb_access_token');

  // 1. Tự động làm mới trước khi gửi request nếu phát hiện accessToken đã hết hạn
  if (token && !isAuthPublicEndpoint && isAccessTokenExpired(token)) {
    try {
      token = await refreshAccessToken();
    } catch {
      token = null;
    }
  }

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

  // 2. Nếu máy chủ trả về 401 Unauthorized, tự động gọi refresh token và thử lại request 1 lần
  if (response.status === 401 && !isAuthPublicEndpoint && !isRetry) {
    try {
      const newToken = await refreshAccessToken();
      if (newToken) {
        return apiRequest(endpoint, options, true);
      }
    } catch {
      // Nếu refresh token cũng hết hạn thì trả về lỗi 401 bên dưới
    }
  }

  const payload = await response.json().catch(() => null);

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
