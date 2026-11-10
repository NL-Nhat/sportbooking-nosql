import { MockRepository } from '../storage/mockRepository.js';

const courtRepo = new MockRepository('courts');
const facRepo = new MockRepository('facilities');
const catRepo = new MockRepository('sports_categories');
const opRepo = new MockRepository('operating_hours');
const priceRepo = new MockRepository('price_rules');
const blockRepo = new MockRepository('blocked_slots');
const slotRepo = new MockRepository('booking_slots');
const reviewRepo = new MockRepository('reviews');

export const courtMockService = {
  getAll: async (filter = {}) => {
    let courts = courtRepo.getAll();
    const facilities = facRepo.getAll();
    const categories = catRepo.getAll();
    const priceRules = priceRepo.getAll();

    // Lọc theo facility approved nếu là public search
    if (filter.publicOnly) {
      const approvedFacIds = new Set(facilities.filter(f => f.status === 'APPROVED').map(f => f._id));
      courts = courts.filter(c => c.status === 'AVAILABLE' && approvedFacIds.has(c.facilityId));
    }

    if (filter.categoryId) {
      courts = courts.filter((c) => c.categoryId === filter.categoryId);
    }

    if (filter.facilityId) {
      courts = courts.filter((c) => c.facilityId === filter.facilityId);
    }

    if (filter.indoor !== undefined && filter.indoor !== null && filter.indoor !== '') {
      const isIndoor = filter.indoor === true || filter.indoor === 'true';
      courts = courts.filter((c) => c.attributes?.indoor === isIndoor);
    }

    if (filter.search) {
      const q = filter.search.toLowerCase();
      courts = courts.filter((c) => {
        const fac = facilities.find(f => f._id === c.facilityId);
        return c.name.toLowerCase().includes(q) || (fac && fac.name.toLowerCase().includes(q));
      });
    }

    return courts.map((court) => {
      const fac = facilities.find((f) => f._id === court.facilityId);
      const cat = categories.find((k) => k._id === court.categoryId);
      const rules = priceRules.filter((r) => r.courtId === court._id && r.status === 'ACTIVE');
      const minPrice = rules.length > 0 ? Math.min(...rules.map((r) => r.pricePerSlot)) : 100000;
      const reviews = reviewRepo.find((r) => r.courtId === court._id && r.status === 'VISIBLE');
      const avgRating = reviews.length > 0
        ? +(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
        : 5.0;

      return {
        ...court,
        facility: fac,
        category: cat,
        priceMin: minPrice,
        rating: avgRating,
        reviewCount: reviews.length
      };
    });
  },

  getById: async (id) => {
    const court = courtRepo.findById(id);
    if (!court) return null;

    const facility = facRepo.findById(court.facilityId);
    const category = catRepo.findById(court.categoryId);
    const opHours = opRepo.find((op) => op.courtId === court._id);
    const priceRules = priceRepo.find((pr) => pr.courtId === court._id && pr.status === 'ACTIVE');
    const reviews = reviewRepo.find((r) => r.courtId === court._id && r.status === 'VISIBLE');

    const avgRating = reviews.length > 0
      ? +(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : 5.0;

    return {
      ...court,
      facility,
      category,
      operatingHours: opHours,
      priceRules,
      reviews,
      rating: avgRating,
      reviewCount: reviews.length
    };
  },

  getByFacility: async (facilityId) => {
    return courtRepo.find((c) => c.facilityId === facilityId);
  },

  getByOwner: async (ownerId) => {
    const facilities = facRepo.find((f) => f.ownerId === ownerId);
    const facIds = new Set(facilities.map((f) => f._id));
    const courts = courtRepo.find((c) => facIds.has(c.facilityId));
    return courts.map((c) => {
      const op = opRepo.findOne((o) => o.courtId === c._id);
      return {
        ...c,
        operatingHours: op ? [op] : [],
        timeSlots: op?.timeSlots || []
      };
    });
  },

  create: async (data) => {
    const { timeSlots, effectiveFrom, effectiveTo, ...courtPayload } = data;
    const newCourt = courtRepo.create(courtPayload);
    // Tự sinh hoặc lưu operating_hours mẫu DAILY (đúng schema DB v2.0: một document/court)
    const now = new Date().toISOString();
    let slotsToSave = Array.isArray(timeSlots) && timeSlots.length > 0 ? timeSlots : null;
    if (!slotsToSave) {
      slotsToSave = [];
      for (let h = 6; h < 22; h++) {
        slotsToSave.push({
          startTime: `${String(h).padStart(2, '0')}:00`,
          endTime: `${String(h + 1).padStart(2, '0')}:00`
        });
      }
    }
    const sortedSlots = [...slotsToSave].sort((a, b) => a.startTime.localeCompare(b.startTime));
    opRepo.create({
      courtId: newCourt._id,
      repeatMode: "DAILY",
      effectiveFrom: effectiveFrom || now.slice(0, 10),
      effectiveTo: effectiveTo || null,
      timeSlots: sortedSlots,
      createdAt: now,
      updatedAt: now
    });

    // Tự sinh 2 khung giá cơ bản (chuẩn DB v2.0 có specificDates)
    priceRepo.create({
      courtId: newCourt._id,
      name: "Giờ chuẩn ngày thường",
      daysOfWeek: [1, 2, 3, 4, 5],
      specificDates: [],
      startTime: "06:00",
      endTime: "17:00",
      pricePerSlot: 120000,
      validFrom: "2026-01-01",
      validTo: "2026-12-31",
      priority: 1,
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    priceRepo.create({
      courtId: newCourt._id,
      name: "Giờ cao điểm & cuối tuần",
      daysOfWeek: [1, 2, 3, 4, 5, 6, 7],
      specificDates: [],
      startTime: "17:00",
      endTime: "22:00",
      pricePerSlot: 180000,
      validFrom: "2026-01-01",
      validTo: "2026-12-31",
      priority: 2,
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return newCourt;
  },

  update: async (id, data) => {
    const { timeSlots, effectiveFrom, effectiveTo, ...courtPayload } = data;
    const updatedCourt = courtRepo.update(id, courtPayload);

    if (Array.isArray(timeSlots)) {
      const now = new Date().toISOString();
      const sortedSlots = [...timeSlots].sort((a, b) => a.startTime.localeCompare(b.startTime));
      const existingOp = opRepo.findOne((o) => o.courtId === id);
      if (existingOp) {
        opRepo.update(existingOp._id, {
          repeatMode: "DAILY",
          effectiveFrom: effectiveFrom || existingOp.effectiveFrom || now.slice(0, 10),
          effectiveTo: effectiveTo !== undefined ? effectiveTo : existingOp.effectiveTo,
          timeSlots: sortedSlots,
          updatedAt: now
        });
      } else {
        opRepo.create({
          courtId: id,
          repeatMode: "DAILY",
          effectiveFrom: effectiveFrom || now.slice(0, 10),
          effectiveTo: effectiveTo || null,
          timeSlots: sortedSlots,
          createdAt: now,
          updatedAt: now
        });
      }
    }

    return updatedCourt;
  },

  // Tính toán các slot trong ngày cho sân (AVAILABLE, BOOKED, HOLD, BLOCKED)
  getAvailableSlots: async (courtId, dateStr) => {
    const court = courtRepo.findById(courtId);
    if (!court) return [];

    const dateObj = new Date(dateStr);
    // JavaScript getDay(): 0 is Sunday, 1 is Monday ...
    // Database convention: 1 is Monday, ..., 7 is Sunday
    const jsDay = dateObj.getDay();
    const dayOfWeek = jsDay === 0 ? 7 : jsDay;

    // Mẫu DAILY của sân (DB v2.0: unique courtId, áp dụng từ effectiveFrom đến effectiveTo)
    const op = opRepo.findOne((o) =>
      o.courtId === courtId &&
      (!o.effectiveFrom || o.effectiveFrom <= dateStr) &&
      (!o.effectiveTo || o.effectiveTo >= dateStr)
    );
    if (!op || !Array.isArray(op.timeSlots) || op.timeSlots.length === 0) return [];

    // Mỗi phần tử timeSlots là một khung giờ cho thuê
    const timeRanges = [...op.timeSlots].sort((a, b) => a.startTime.localeCompare(b.startTime));

    // Price rules hiệu lực: trong validFrom..validTo; specificDates ưu tiên hơn daysOfWeek, sau đó theo priority
    const rules = priceRepo.find((r) => {
      if (r.courtId !== courtId || r.status !== 'ACTIVE') return false;
      if (r.validFrom && r.validFrom.slice(0, 10) > dateStr) return false;
      if (r.validTo && r.validTo.slice(0, 10) < dateStr) return false;
      const matchSpecific = Array.isArray(r.specificDates) && r.specificDates.includes(dateStr);
      const matchDay = Array.isArray(r.daysOfWeek) && r.daysOfWeek.includes(dayOfWeek);
      return matchSpecific || matchDay;
    }).sort((a, b) => {
      const aSpecific = (Array.isArray(a.specificDates) && a.specificDates.includes(dateStr)) ? 1000 : 0;
      const bSpecific = (Array.isArray(b.specificDates) && b.specificDates.includes(dateStr)) ? 1000 : 0;
      return (bSpecific + (b.priority || 0)) - (aSpecific + (a.priority || 0));
    });

    // Lấy các blocked slots
    const blocked = blockRepo.find((b) => b.courtId === courtId);

    // Lấy các booking slots đã đặt hoặc đang hold
    const occupied = slotRepo.find((s) => s.courtId === courtId && s.slotDate === dateStr);

    const slots = [];

    for (const range of timeRanges) {
      const [openH, openM] = range.startTime.split(':').map(Number);
      const [closeH, closeM] = range.endTime.split(':').map(Number);
      const openMinutes = openH * 60 + openM;
      const closeMinutes = closeH * 60 + closeM;
      const slotDuration = closeMinutes - openMinutes;
      if (slotDuration <= 0) continue;

      for (let m = openMinutes; m + slotDuration <= closeMinutes; m += slotDuration) {
        const hStart = Math.floor(m / 60);
        const mStart = m % 60;
        const hEnd = Math.floor((m + slotDuration) / 60);
        const mEnd = (m + slotDuration) % 60;

        const timeStartStr = `${String(hStart).padStart(2, '0')}:${String(mStart).padStart(2, '0')}`;
        const timeEndStr = `${String(hEnd).padStart(2, '0')}:${String(mEnd).padStart(2, '0')}`;

        const slotStartIso = `${dateStr}T${timeStartStr}:00.000Z`;
        const slotEndIso = `${dateStr}T${timeEndStr}:00.000Z`;

        // Xác định giá
        let price = 100000;
        for (const rule of rules) {
          if (timeStartStr >= rule.startTime && timeStartStr < rule.endTime) {
            price = rule.pricePerSlot;
            break;
          }
        }

        // Kiểm tra trạng thái
        let status = 'AVAILABLE';
        let reason = '';

        // 1. Kiểm tra Blocked
        const isBlocked = blocked.some((b) => {
          return (slotStartIso < b.endAt && slotEndIso > b.startAt);
        });
        if (isBlocked) {
          status = 'BLOCKED';
          reason = 'Sân tạm khóa/bảo trì';
        }

        // 2. Kiểm tra Occupied
        if (status === 'AVAILABLE') {
          const occ = occupied.find((s) => s.startAt === slotStartIso || (s.startAt < slotEndIso && s.endAt > slotStartIso));
          if (occ) {
            if (occ.status === 'BOOKED') {
              status = 'BOOKED';
              reason = 'Đã có khách đặt';
            } else if (occ.status === 'HOLD') {
              // Kiểm tra expiresAt (1 giờ giữ chỗ)
              if (occ.expiresAt && new Date(occ.expiresAt) > new Date()) {
                status = 'HOLD';
                reason = 'Đang có người giữ chỗ';
              }
            }
          }
        }

        slots.push({
          id: `${dateStr}_${timeStartStr}`,
          start: timeStartStr,
          end: timeEndStr,
          startIso: slotStartIso,
          endIso: slotEndIso,
          price,
          status,
          reason
        });
      }
    }

    return slots;
  }
};

