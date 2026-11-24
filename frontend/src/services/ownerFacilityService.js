import { apiRequest } from './apiClient.js';

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
    return list.map((facility) => ({
      ...facility,
      id: facility.id || facility._id,
      _id: facility._id || facility.id
    }));
  }
};
