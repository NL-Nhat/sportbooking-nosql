import { apiRequest } from './apiClient.js';

function normalizeCourt(court) {
  if (!court) return null;
  const resolvedId = court.id || court._id;
  return {
    ...court,
    id: resolvedId,
    _id: resolvedId,
    timeSlots: Array.isArray(court.timeSlots) ? court.timeSlots : []
  };
}

export const ownerCourtService = {
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
  }
};
