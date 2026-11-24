import { apiRequest } from './apiClient.js';

function normalizeFacility(facility) {
  if (!facility) return null;
  const resolvedId = facility.id || facility._id;
  return {
    ...facility,
    id: resolvedId,
    _id: resolvedId
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
  }
};
