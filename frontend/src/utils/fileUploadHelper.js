const UPLOAD_STORAGE_KEY = 'sb_mock_uploaded_files_v2';

function loadUploadedFilesMap() {
  try {
    const raw = localStorage.getItem(UPLOAD_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveUploadedFilesMap(map) {
  try {
    localStorage.setItem(UPLOAD_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Nếu localStorage đầy, giữ các mục mới nhất
    try {
      const entries = Object.entries(map);
      const trimmed = Object.fromEntries(entries.slice(-15));
      localStorage.setItem(UPLOAD_STORAGE_KEY, JSON.stringify(trimmed));
    } catch {
      // ignore
    }
  }
}

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
 * Tạo tên file kèm kí tự định danh duy nhất tránh trùng và lưu đường dẫn vào thư mục /uploads/
 * Đồng thời lưu bản DataURL trong bộ nhớ trình duyệt để demo hiển thị ảnh ngay lập tức.
 */
export function uploadMockFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('Không có file nào được chọn.'));
      return;
    }

    const uniqueToken = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const cleanName = sanitizeFileName(file.name);
    const uniqueFileName = `${uniqueToken}_${cleanName}`;
    // Đường dẫn lưu vào DB: trỏ tới thư mục /uploads/ trong frontend
    const dbPath = `/uploads/${uniqueFileName}`;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      const map = loadUploadedFilesMap();
      map[dbPath] = dataUrl;
      map[uniqueFileName] = dataUrl;
      saveUploadedFilesMap(map);

      resolve({
        fileName: uniqueFileName,
        originalName: file.name,
        dbPath,
        previewUrl: dataUrl
      });
    };
    reader.onerror = () => {
      reject(new Error('Không thể đọc file ảnh.'));
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Trả về URL hiển thị cho thẻ <img> từ giá trị lưu trong DB
 * Hỗ trợ cả chuỗi URL/path ('/uploads/...' hoặc 'https://...') và object { url, alt } theo Database_Design.md
 */
export function resolveAssetUrl(input, fallback = 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=800&q=80') {
  if (!input) return fallback;
  const rawPath = typeof input === 'object' ? (input.url || input.fileUrl || '') : String(input);
  if (!rawPath) return fallback;

  if (rawPath.startsWith('data:') || rawPath.startsWith('blob:') || rawPath.startsWith('http://') || rawPath.startsWith('https://')) {
    return rawPath;
  }

  const map = loadUploadedFilesMap();
  if (map[rawPath]) {
    return map[rawPath];
  }

  return rawPath;
}

