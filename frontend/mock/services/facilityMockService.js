import { MockRepository } from '../storage/mockRepository.js';

const facRepo = new MockRepository('facilities');
const courtRepo = new MockRepository('courts');
const userRepo = new MockRepository('users');
const reviewRepo = new MockRepository('reviews');
const opRepo = new MockRepository('operating_hours');

// View-model (không ghi vào DB): suy ra khung giờ hoạt động chung của cơ sở
// từ mẫu DAILY trong operating_hours của các sân (DB v2.0 không có facilities.openingHours).
const buildHoursSummary = (courts) => {
  const courtIds = new Set(courts.map((c) => c._id));
  const slots = opRepo.find((o) => courtIds.has(o.courtId)).flatMap((o) => o.timeSlots || []);
  if (slots.length === 0) return null;
  const start = slots.reduce((min, s) => (s.startTime < min ? s.startTime : min), slots[0].startTime);
  const end = slots.reduce((max, s) => (s.endTime > max ? s.endTime : max), slots[0].endTime);
  return { startTime: start, endTime: end };
};

export const facilityMockService = {
  getAll: async (filter = {}) => {
    let list = facRepo.getAll();

    if (filter.status) {
      list = list.filter((f) => f.status === filter.status);
    } else if (filter.onlyApproved) {
      list = list.filter((f) => f.status === 'APPROVED');
    }

    if (filter.district) {
      list = list.filter((f) => f.address?.district === filter.district);
    }

    if (filter.search) {
      const q = filter.search.toLowerCase();
      list = list.filter((f) => 
        f.name.toLowerCase().includes(q) || 
        f.address.detail.toLowerCase().includes(q) ||
        f.address.district.toLowerCase().includes(q)
      );
    }

    // Gắn thêm số lượng sân & rating trung bình từ review
    return list.map((fac) => {
      const courts = courtRepo.find((c) => c.facilityId === fac._id);
      const reviews = reviewRepo.find((r) => r.facilityId === fac._id && r.status === 'VISIBLE');
      const avgRating = reviews.length > 0 
        ? +(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : 5.0;

      return {
        ...fac,
        courtCount: courts.length,
        hoursSummary: buildHoursSummary(courts),
        rating: avgRating,
        reviewCount: reviews.length,
        owner: userRepo.findById(fac.ownerId)
      };
    });
  },

  getById: async (id) => {
    const fac = facRepo.findById(id);
    if (!fac) return null;

    const courts = courtRepo.find((c) => c.facilityId === fac._id);
    const reviews = reviewRepo.find((r) => r.facilityId === fac._id && r.status === 'VISIBLE');
    const avgRating = reviews.length > 0 
      ? +(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 5.0;

    return {
      ...fac,
      courts,
      hoursSummary: buildHoursSummary(courts),
      reviews,
      rating: avgRating,
      reviewCount: reviews.length,
      owner: userRepo.findById(fac.ownerId)
    };
  },

  getByOwner: async (ownerId) => {
    const list = facRepo.find((f) => f.ownerId === ownerId);
    return list.map((fac) => {
      const courts = courtRepo.find((c) => c.facilityId === fac._id);
      return {
        ...fac,
        courtCount: courts.length,
        hoursSummary: buildHoursSummary(courts)
      };
    });
  },

  create: async (data) => {
    return facRepo.create({
      ...data,
      status: 'PENDING' // Cơ sở mới tạo phải chờ Admin duyệt theo flow C
    });
  },

  update: async (id, data) => {
    return facRepo.update(id, data);
  },

  reviewStatus: async (id, newStatus) => {
    return facRepo.update(id, { status: newStatus });
  }
};

