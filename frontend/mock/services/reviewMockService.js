import { MockRepository } from '../storage/mockRepository.js';

const revRepo = new MockRepository('reviews');
const userRepo = new MockRepository('users');
const courtRepo = new MockRepository('courts');
const facRepo = new MockRepository('facilities');
const bookingRepo = new MockRepository('bookings');

export const reviewMockService = {
  getByCourt: async (courtId) => {
    const list = revRepo.find((r) => r.courtId === courtId && r.status === 'VISIBLE');
    return list.map((r) => ({
      ...r,
      customer: userRepo.findById(r.customerId)
    }));
  },

  getByFacility: async (facilityId) => {
    const list = revRepo.find((r) => r.facilityId === facilityId && r.status === 'VISIBLE');
    return list.map((r) => ({
      ...r,
      court: courtRepo.findById(r.courtId),
      customer: userRepo.findById(r.customerId)
    }));
  },

  getMyReviews: async (customerId) => {
    const list = revRepo.find((r) => r.customerId === customerId);
    return list.map((r) => ({
      ...r,
      court: courtRepo.findById(r.courtId),
      facility: facRepo.findById(r.facilityId)
    }));
  },

  getOwnerReviews: async (ownerId) => {
    const facilities = facRepo.find((f) => f.ownerId === ownerId);
    const facIds = new Set(facilities.map((f) => f._id));
    const list = revRepo.find((r) => facIds.has(r.facilityId));
    return list.map((r) => ({
      ...r,
      customer: userRepo.findById(r.customerId),
      court: courtRepo.findById(r.courtId),
      facility: facRepo.findById(r.facilityId)
    }));
  },

  getAllReviews: async (filter = {}) => {
    let list = revRepo.getAll();
    if (filter.status && filter.status !== 'ALL') {
      list = list.filter((r) => r.status === filter.status);
    }
    if (filter.rating) {
      list = list.filter((r) => r.rating === Number(filter.rating));
    }
    return list.map((r) => ({
      ...r,
      customer: userRepo.findById(r.customerId),
      court: courtRepo.findById(r.courtId),
      facility: facRepo.findById(r.facilityId)
    }));
  },

  createReview: async ({ bookingId, customerId, rating, content, images }) => {
    const booking = bookingRepo.findById(bookingId);
    if (!booking) throw new Error('Không tìm thấy đơn đặt sân.');
    if (booking.status !== 'COMPLETED') {
      throw new Error('Chỉ có thể đánh giá sau khi hoàn thành buổi tập.');
    }

    const existing = revRepo.findOne((r) => r.bookingId === bookingId);
    if (existing) throw new Error('Bạn đã gửi đánh giá cho đơn đặt sân này rồi.');

    return revRepo.create({
      bookingId,
      customerId,
      facilityId: booking.facilityId,
      courtId: booking.courtId,
      rating: Number(rating),
      content,
      images: images || [],
      ownerReply: null,
      status: 'VISIBLE'
    });
  },

  replyReview: async (reviewId, replyContent) => {
    return revRepo.update(reviewId, {
      ownerReply: {
        content: replyContent,
        repliedAt: new Date().toISOString()
      }
    });
  },

  toggleStatus: async (reviewId, newStatus) => {
    return revRepo.update(reviewId, { status: newStatus });
  }
};

