import { apiRequest } from './apiClient.js';

function normalizeCourt(court) {
  if (!court) return null;
  const resolvedId = court.id || court._id;
  return {
    ...court,
    id: resolvedId,
    _id: resolvedId,
    timeSlots: Array.isArray(court.timeSlots) ? court.timeSlots : [],
    priceRules: Array.isArray(court.priceRules)
      ? court.priceRules.map((rule) => ({
          ...rule,
          id: rule.id || rule._id,
          _id: rule._id || rule.id
        }))
      : []
  };
}

function normalizeCategory(category) {
  if (!category) return null;
  const resolvedId = category.id || category._id;
  return {
    ...category,
    id: resolvedId,
    _id: resolvedId
  };
}

export const ownerCourtService = {
  /**
   * Lấy danh sách danh mục môn thể thao đang hoạt động (ACTIVE)
   * GET /api/v1/categories
   */
  getActiveCategories: async () => {
    const response = await apiRequest('/categories', {
      method: 'GET'
    });
    const list = Array.isArray(response?.data) ? response.data : [];
    return list.map(normalizeCategory);
  },

  /**
   * Lấy danh sách toàn bộ sân thể thao thuộc các cơ sở của Chủ sân đang đăng nhập
   * GET /api/v1/owner/courts
   */
  getMyCourts: async ({ facilityId = '', categoryId = '', status = '', keyword = '' } = {}) => {
    const params = new URLSearchParams();
    if (facilityId && facilityId.trim()) {
      params.set('facilityId', facilityId.trim());
    }
    if (categoryId && categoryId.trim()) {
      params.set('categoryId', categoryId.trim());
    }
    if (status && status.trim()) {
      params.set('status', status.trim());
    }
    if (keyword && keyword.trim()) {
      params.set('keyword', keyword.trim());
    }
    const queryString = params.toString();
    const endpoint = queryString ? `/owner/courts?${queryString}` : '/owner/courts';

    const response = await apiRequest(endpoint, {
      method: 'GET'
    });
    const list = Array.isArray(response?.data) ? response.data : [];
    return list.map(normalizeCourt);
  },

  /**
   * Lấy danh sách sân thuộc một cơ sở cụ thể của Chủ sân
   * GET /api/v1/owner/facilities/{facilityId}/courts
   */
  getCourtsByFacility: async (facilityId, { categoryId = '', status = '', keyword = '' } = {}) => {
    const params = new URLSearchParams();
    if (categoryId && categoryId.trim()) {
      params.set('categoryId', categoryId.trim());
    }
    if (status && status.trim()) {
      params.set('status', status.trim());
    }
    if (keyword && keyword.trim()) {
      params.set('keyword', keyword.trim());
    }
    const queryString = params.toString();
    const base = `/owner/facilities/${encodeURIComponent(facilityId)}/courts`;
    const endpoint = queryString ? `${base}?${queryString}` : base;

    const response = await apiRequest(endpoint, {
      method: 'GET'
    });
    const list = Array.isArray(response?.data) ? response.data : [];
    return list.map(normalizeCourt);
  },

  /**
   * Xem chi tiết một sân thể thao thuộc quyền sở hữu của Chủ sân đang đăng nhập
   * GET /api/v1/owner/courts/{courtId}
   */
  getCourtById: async (courtId) => {
    const response = await apiRequest(`/owner/courts/${encodeURIComponent(courtId)}`, {
      method: 'GET'
    });
    return normalizeCourt(response?.data);
  },

  /**
   * Tạo sân thể thao mới kèm cấu hình khung giờ cho thuê hằng ngày (DAILY)
   * POST /api/v1/owner/facilities/{facilityId}/courts
   */
  createCourt: async ({
    facilityId,
    categoryId,
    name,
    description,
    attributes,
    capacity,
    status,
    images,
    timeSlots,
    effectiveFrom,
    effectiveTo
  }) => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const normalizedTimeSlots = Array.isArray(timeSlots)
      ? timeSlots.map((slot) => ({
          startTime: slot.startTime,
          endTime: slot.endTime
        }))
      : [];

    const payload = {
      facilityId,
      categoryId,
      name: name?.trim(),
      description: description?.trim() || '',
      attributes: attributes || {},
      capacity: Number(capacity) || 4,
      status: status || 'AVAILABLE',
      images: Array.isArray(images)
        ? images.map((img) => (typeof img === 'object' ? img : { url: img, alt: name?.trim() || 'Court image' }))
        : [],
      timeSlots: normalizedTimeSlots,
      effectiveFrom: effectiveFrom || todayStr,
      effectiveTo: effectiveTo || null,
      operatingHours: {
        repeatMode: 'DAILY',
        effectiveFrom: effectiveFrom || todayStr,
        effectiveTo: effectiveTo || null,
        timeSlots: normalizedTimeSlots
      }
    };

    const endpoint = facilityId
      ? `/owner/facilities/${encodeURIComponent(facilityId)}/courts`
      : '/owner/courts';

    const response = await apiRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return normalizeCourt(response?.data);
  },

  /**
   * Cập nhật thông tin sân thể thao kèm cấu hình khung giờ cho thuê hằng ngày (DAILY)
   * PATCH /api/v1/owner/courts/{courtId}
   */
  updateCourt: async (
    courtId,
    {
      facilityId,
      categoryId,
      name,
      description,
      attributes,
      capacity,
      status,
      images,
      timeSlots,
      effectiveFrom,
      effectiveTo
    }
  ) => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const normalizedTimeSlots = Array.isArray(timeSlots)
      ? timeSlots.map((slot) => ({
          startTime: slot.startTime,
          endTime: slot.endTime
        }))
      : undefined;

    const payload = {
      facilityId,
      categoryId,
      name: name?.trim(),
      description: description !== undefined ? description.trim() : undefined,
      attributes: attributes || undefined,
      capacity: capacity !== undefined ? Number(capacity) || 4 : undefined,
      status: status || undefined,
      images: Array.isArray(images)
        ? images.map((img) =>
            typeof img === 'object' ? img : { url: img, alt: name?.trim() || 'Court image' }
          )
        : undefined,
      timeSlots: normalizedTimeSlots,
      effectiveFrom: effectiveFrom || undefined,
      effectiveTo: effectiveTo !== undefined ? effectiveTo : undefined,
      operatingHours: normalizedTimeSlots
        ? {
            repeatMode: 'DAILY',
            effectiveFrom: effectiveFrom || todayStr,
            effectiveTo: effectiveTo || null,
            timeSlots: normalizedTimeSlots
          }
        : undefined
    };

    const response = await apiRequest(`/owner/courts/${encodeURIComponent(courtId)}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
    return normalizeCourt(response?.data);
  },

  /**
   * Đổi trạng thái sân thể thao (AVAILABLE / MAINTENANCE / INACTIVE)
   * PATCH /api/v1/owner/courts/{courtId}/status
   */
  updateCourtStatus: async (courtId, status) => {
    const response = await apiRequest(`/owner/courts/${encodeURIComponent(courtId)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    return normalizeCourt(response?.data);
  }
};
