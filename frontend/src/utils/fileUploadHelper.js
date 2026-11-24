import { isAccessTokenExpired, refreshAccessToken, ApiClientError } from '../services/apiClient.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api/v1';

export function sanitizeFileName(name = 'image.jpg') {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_+/g, '_')
    .toLowerCase();
}

/**
 * Tải file ảnh vật lý lên Backend (POST /api/v1/uploads/image).
 * Backend lưu file trực tiếp vào thư mục frontend/public/uploads/<timestamp>_<randomId>_<fileName>
 * và trả về đường dẫn "/uploads/<tên_file>" để lưu vào MongoDB.
 */
export async function uploadFileToServer(file) {
  if (!file) {
    throw new Error('Không có file nào được chọn.');
  }

  let token = localStorage.getItem('sb_access_token');
  if (token && isAccessTokenExpired(token)) {
    try {
      token = await refreshAccessToken();
    } catch {
      token = null;
    }
  }

  const formData = new FormData();
  formData.append('file', file);

  let response;
  try {
    response = await fetch(`${API_BASE_URL}/uploads/image`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: formData
    });
  } catch {
    throw new ApiClientError(
      'Không thể kết nối tới máy chủ Backend (http://localhost:8081) để tải ảnh lên.',
      { status: 0, errorCode: 'NETWORK_ERROR' }
    );
  }

  const payload = await response.json().catch(() => null);
  if (!response.ok || (payload && payload.success === false)) {
    throw new ApiClientError(payload?.message || 'Tải file ảnh lên thất bại.', {
      status: response.status,
      errorCode: payload?.error?.code || 'UPLOAD_ERROR'
    });
  }

  const data = payload?.data || {};
  return {
    fileName: data.fileName,
    originalName: data.originalName || file.name,
    dbPath: data.dbPath || data.url,
    previewUrl: data.url || data.dbPath
  };
}

// Giữ alias uploadMockFile trỏ sang uploadFileToServer để các trang chưa chuyển tên hàm vẫn lưu file vật lý thật vào frontend/public/uploads/
export const uploadMockFile = uploadFileToServer;

/**
 * Trả về URL hiển thị cho thẻ <img> từ giá trị lưu trong DB.
 * Hỗ trợ cả chuỗi URL/path ('/uploads/...' phục vụ trực tiếp từ thư mục frontend/public/uploads/ hoặc 'https://...')
 * và object { url, alt } theo Database_Design.md.
 */
export function resolveAssetUrl(
  input,
  fallback = 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=800&q=80'
) {
  if (!input) return fallback;
  const rawPath = typeof input === 'object' ? (input.url || input.fileUrl || '') : String(input);
  if (!rawPath) return fallback;
  return rawPath;
}
