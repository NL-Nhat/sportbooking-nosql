import { apiRequest } from './apiClient.js';

function normalizeFacility(facility) {
  if (!facility) return null;
  const resolvedId = facility.id || facility._id;
  const normalizedCourts = Array.isArray(facility.courts)
    ? facility.courts.map((court) => {
        const courtId = court.id || court._id;
        return {
          ...court,
          id: courtId,
          _id: courtId
        };
      })
    : [];

  return {
    ...facility,
    id: resolvedId,
    _id: resolvedId,
    courts: normalizedCourts
  };
}

export const ownerFacilityService = {
  /**
   * Lấy danh sách cơ sở thể thao thuộc quyền sở hữu của Chủ sân đang đăng nhập
   * GET /api/v1/owner/facilities
   */
  getMyFacilities: async ({ keyword = '', status = '' } = {}) => {
    const params = new URLSearchParams();
    if (keyword && keyword.trim()) {
      params.set('keyword', keyword.trim());
    }
    if (status && status.trim()) {
      params.set('status', status.trim());
    }
    const queryString = params.toString();
    const endpoint = queryString ? `/owner/facilities?${queryString}` : '/owner/facilities';

    const response = await apiRequest(endpoint, {
      method: 'GET'
    });
    const list = Array.isArray(response?.data) ? response.data : [];
    return list.map(normalizeFacility);
  },

  /**
   * Xem chi tiết một cơ sở thể thao thuộc quyền sở hữu của Chủ sân đang đăng nhập
   * GET /api/v1/owner/facilities/{id}
   */
  getFacilityById: async (id) => {
    const response = await apiRequest(`/owner/facilities/${encodeURIComponent(id)}`, {
      method: 'GET'
    });
    return normalizeFacility(response?.data);
  },

  /**
   * Tạo cơ sở thể thao mới thuộc quyền sở hữu của Chủ sân đang đăng nhập
   * POST /api/v1/owner/facilities
   */
  createFacility: async ({ name, description, address, location, images, amenities }) => {
    const response = await apiRequest('/owner/facilities', {
      method: 'POST',
      body: JSON.stringify({
        name: name?.trim(),
        description: description?.trim() || '',
        address,
        location,
        images: Array.isArray(images)
          ? images.map((img) => (typeof img === 'object' ? img : { url: img, alt: name?.trim() || 'Facility image' }))
          : [],
        amenities: Array.isArray(amenities) ? amenities : []
      })
    });
    return normalizeFacility(response?.data);
  },

  /**
   * Cập nhật thông tin cơ sở thể thao thuộc quyền sở hữu của Chủ sân đang đăng nhập
   * PATCH /api/v1/owner/facilities/{id}
   */
  updateFacility: async (id, { name, description, address, location, images, amenities }) => {
    const response = await apiRequest(`/owner/facilities/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify({
        name: name?.trim(),
        description: description?.trim() || '',
        address,
        location,
        images: Array.isArray(images)
          ? images.map((img) => (typeof img === 'object' ? img : { url: img, alt: name?.trim() || 'Facility image' }))
          : [],
        amenities: Array.isArray(amenities) ? amenities : []
      })
    });
    return normalizeFacility(response?.data);
  },

  /**
   * Đổi trạng thái hoạt động của cơ sở thể thao (APPROVED / INACTIVE / PENDING)
   * PATCH /api/v1/owner/facilities/{id}/status
   */
  updateFacilityStatus: async (id, status) => {
    const response = await apiRequest(`/owner/facilities/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    return normalizeFacility(response?.data);
  },

  /**
   * Tạm ngừng hoạt động cơ sở thể thao (chuyển sang INACTIVE)
   * PATCH /api/v1/owner/facilities/{id}/deactivate
   */
  deactivateFacility: async (id) => {
    const response = await apiRequest(`/owner/facilities/${encodeURIComponent(id)}/deactivate`, {
      method: 'PATCH'
    });
    return normalizeFacility(response?.data);
  },

  /**
   * Gửi lại yêu cầu xét duyệt cơ sở thể thao (chuyển sang PENDING)
   * POST /api/v1/owner/facilities/{id}/submit-review
   */
  submitReviewFacility: async (id) => {
    const response = await apiRequest(`/owner/facilities/${encodeURIComponent(id)}/submit-review`, {
      method: 'POST'
    });
    return normalizeFacility(response?.data);
  }
};
