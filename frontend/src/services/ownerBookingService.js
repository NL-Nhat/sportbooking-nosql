import { apiRequest } from './apiClient.js';

function normalizeOwnerBooking(booking) {
  if (!booking) return null;
  const resolvedId = booking.id || booking._id;
  return {
    ...booking,
    id: resolvedId,
    _id: resolvedId,
    items: Array.isArray(booking.items) ? booking.items : [],
    timeSlotRanges: Array.isArray(booking.timeSlotRanges) ? booking.timeSlotRanges : [],
    payments: Array.isArray(booking.payments) ? booking.payments : []
  };
}

export const ownerBookingService = {
  /**
   * Lấy danh sách đơn đặt sân tại các cơ sở của Chủ sân
   * GET /api/v1/owner/bookings
   */
  getOwnerBookings: async ({
    facilityId = '',
    courtId = '',
    bookingDate = '',
    status = '',
    paymentStatus = '',
    keyword = ''
  } = {}) => {
    const params = new URLSearchParams();
    if (facilityId && facilityId.trim()) {
      params.set('facilityId', facilityId.trim());
    }
    if (courtId && courtId.trim()) {
      params.set('courtId', courtId.trim());
    }
    if (bookingDate && bookingDate.trim()) {
      params.set('bookingDate', bookingDate.trim());
    }
    if (status && status.trim() && status !== 'ALL') {
      params.set('status', status.trim());
    }
    if (paymentStatus && paymentStatus.trim() && paymentStatus !== 'ALL') {
      params.set('paymentStatus', paymentStatus.trim());
    }
    if (keyword && keyword.trim()) {
      params.set('keyword', keyword.trim());
    }
    const queryString = params.toString();
    const endpoint = queryString ? `/owner/bookings?${queryString}` : '/owner/bookings';

    const response = await apiRequest(endpoint, {
      method: 'GET'
    });
    const list = Array.isArray(response?.data) ? response.data : [];
    return list.map(normalizeOwnerBooking);
  },

  /**
   * Xem chi tiết một đơn đặt sân tại cơ sở của Chủ sân
   * GET /api/v1/owner/bookings/{id}
   */
  getOwnerBookingDetail: async (bookingId) => {
    const response = await apiRequest(`/owner/bookings/${encodeURIComponent(bookingId)}`, {
      method: 'GET'
    });
    return normalizeOwnerBooking(response?.data);
  },

  /**
   * Xác nhận đã thu phần tiền 80% còn lại tại sân
   * POST /api/v1/owner/bookings/{id}/collect-remaining
   */
  collectRemainingPayment: async (bookingId, method = 'CASH') => {
    const response = await apiRequest(
      `/owner/bookings/${encodeURIComponent(bookingId)}/collect-remaining`,
      {
        method: 'POST',
        body: JSON.stringify({ method })
      }
    );
    return normalizeOwnerBooking(response?.data);
  }
};
