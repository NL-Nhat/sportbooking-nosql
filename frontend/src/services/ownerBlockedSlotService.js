import { apiRequest } from './apiClient.js';

function normalizeBlockedSlot(slot) {
  if (!slot) return null;
  const resolvedId = slot.id || slot._id;
  return {
    ...slot,
    id: resolvedId,
    _id: resolvedId
  };
}

export const ownerBlockedSlotService = {
  /**
   * Lấy danh sách lịch chặn sân / bảo trì thuộc các sân của Chủ sân
   * GET /api/v1/owner/blocked-slots?courtId=...&date=...
   */
  getBlockedSlots: async ({ courtId = '', date = '' } = {}) => {
    const params = new URLSearchParams();
    if (courtId && courtId.trim()) {
      params.set('courtId', courtId.trim());
    }
    if (date && date.trim()) {
      params.set('date', date.trim());
    }
    const queryString = params.toString();
    const endpoint = queryString ? `/owner/blocked-slots?${queryString}` : '/owner/blocked-slots';

    const response = await apiRequest(endpoint, {
      method: 'GET'
    });
    const list = Array.isArray(response?.data) ? response.data : [];
    return list.map(normalizeBlockedSlot);
  },

  /**
   * Tạo lịch chặn sân / khóa giờ bảo trì mới
   * POST /api/v1/owner/courts/{courtId}/blocked-slots (hoặc POST /api/v1/owner/blocked-slots)
   */
  createBlockedSlot: async ({ courtId, startAt, endAt, reason }) => {
    const toIsoString = (val) => {
      if (!val) return '';
      // Nếu là chuỗi datetime-local (yyyy-MM-ddTHH:mm), chuyển qua Date local rồi sang ISO UTC
      const parsed = new Date(val);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed.toISOString();
      }
      return val;
    };

    const payload = {
      courtId,
      startAt: toIsoString(startAt),
      endAt: toIsoString(endAt),
      reason: reason?.trim()
    };

    const endpoint = courtId
      ? `/owner/courts/${encodeURIComponent(courtId)}/blocked-slots`
      : '/owner/blocked-slots';

    const response = await apiRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return normalizeBlockedSlot(response?.data);
  }
};
