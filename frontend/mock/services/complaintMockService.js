import { MockRepository } from '../storage/mockRepository.js';

const compRepo = new MockRepository('complaints');
const userRepo = new MockRepository('users');
const facRepo = new MockRepository('facilities');
const bookingRepo = new MockRepository('bookings');
const notiRepo = new MockRepository('notifications');

export const complaintMockService = {
  getByUser: async (userId) => {
    const list = compRepo.find((c) => c.userId === userId);
    return list.map((c) => ({
      ...c,
      facility: c.facilityId ? facRepo.findById(c.facilityId) : null,
      booking: c.bookingId ? bookingRepo.findById(c.bookingId) : null
    }));
  },

  getAll: async (filter = {}) => {
    let list = compRepo.getAll();
    if (filter.status && filter.status !== 'ALL') {
      list = list.filter((c) => c.status === filter.status);
    }
    return list.map((c) => ({
      ...c,
      user: userRepo.findById(c.userId),
      facility: c.facilityId ? facRepo.findById(c.facilityId) : null,
      booking: c.bookingId ? bookingRepo.findById(c.bookingId) : null
    }));
  },

  getById: async (id) => {
    const c = compRepo.findById(id);
    if (!c) return null;
    return {
      ...c,
      user: userRepo.findById(c.userId),
      facility: c.facilityId ? facRepo.findById(c.facilityId) : null,
      booking: c.bookingId ? bookingRepo.findById(c.bookingId) : null,
      responder: c.response?.respondedBy ? userRepo.findById(c.response.respondedBy) : null
    };
  },

  create: async ({ userId, bookingId, facilityId, subject, content, images }) => {
    return compRepo.create({
      userId,
      bookingId: bookingId || null,
      facilityId: facilityId || null,
      subject,
      content,
      images: images || [],
      response: null,
      status: 'OPEN'
    });
  },

  respond: async (complaintId, responderId, content, newStatus = 'RESOLVED') => {
    const comp = compRepo.findById(complaintId);
    if (!comp) throw new Error('Không tìm thấy khiếu nại.');

    const updated = compRepo.update(complaintId, {
      status: newStatus,
      response: {
        respondedBy: responderId,
        content,
        respondedAt: new Date().toISOString()
      }
    });

    notiRepo.create({
      userId: comp.userId,
      title: 'Khiếu nại của bạn đã có phản hồi',
      message: `Khiếu nại về "${comp.subject}" đã được ban quản lý xử lý và phản hồi.`,
      type: 'SYSTEM',
      referenceId: complaintId,
      isRead: false
    });

    return updated;
  }
};

