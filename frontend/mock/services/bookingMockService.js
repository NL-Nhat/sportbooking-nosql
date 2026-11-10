import { MockRepository } from '../storage/mockRepository.js';

const bookingRepo = new MockRepository('bookings');
const slotRepo = new MockRepository('booking_slots');
const payRepo = new MockRepository('payments');
const courtRepo = new MockRepository('courts');
const facRepo = new MockRepository('facilities');
const userRepo = new MockRepository('users');
const notiRepo = new MockRepository('notifications');

export const bookingMockService = {
  // Tự động kiểm tra và giải phóng các booking quá 1 giờ chưa thanh toán
  checkAndExpirePendingBookings: () => {
    const now = new Date();
    const pendingBookings = bookingRepo.find((b) => b.status === 'PENDING_PAYMENT' && b.paymentStatus === 'UNPAID');
    
    pendingBookings.forEach((b) => {
      if (b.holdExpiresAt && new Date(b.holdExpiresAt) < now) {
        // Hết hạn 1 giờ
        bookingRepo.update(b._id, { status: 'EXPIRED' });
        // Giải phóng các slot
        const slots = slotRepo.find((s) => s.bookingId === b._id);
        slots.forEach((s) => slotRepo.delete(s._id));
      }
    });
  },

  createBooking: async ({ customerId, courtId, items, paymentOption = 'DEPOSIT_20_PERCENT', note = '' }) => {
    bookingMockService.checkAndExpirePendingBookings();

    const court = courtRepo.findById(courtId);
    if (!court) throw new Error('Không tìm thấy sân thể thao.');

    // Chuẩn hóa items (nếu truyền dạng cũ đơn lẻ)
    let bookingItems = [];
    if (Array.isArray(items) && items.length > 0) {
      bookingItems = items;
    } else {
      throw new Error('Vui lòng chọn ít nhất một khung giờ thuê sân.');
    }

    // 1. Kiểm tra tính sẵn sàng của tất cả slot trong items
    for (const item of bookingItems) {
      const existingSlot = slotRepo.findOne((s) => 
        s.courtId === courtId &&
        s.slotDate === item.bookingDate &&
        s.startAt === item.startAt &&
        (s.status === 'BOOKED' || (s.status === 'HOLD' && s.expiresAt && new Date(s.expiresAt) > new Date()))
      );

      if (existingSlot) {
        throw new Error(`Khung giờ ${item.startAt ? item.startAt.substring(11, 16) : ''} ngày ${item.bookingDate} vừa có người khác đặt. Vui lòng chọn khung giờ khác.`);
      }
    }

    // 2. Tính toán tiền bạc theo Database_Design.md v2.0
    const totalAmount = bookingItems.reduce((sum, item) => sum + (item.amount || item.unitPrice || 0), 0);
    const depositRequired = Math.round(totalAmount * 0.20); // 20% đặt cọc
    const totalDurationMinutes = bookingItems.reduce((sum, item) => sum + (item.durationMinutes || 60), 0);

    const now = new Date();
    const holdExpiresAt = new Date(now.getTime() + 60 * 60 * 1000).toISOString(); // 1 giờ giữ chỗ
    const cancellationDeadline = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(); // 24 giờ kể từ lúc tạo

    // 3. Sinh mã booking: SB-YYYYMMDD-XXXXXX
    const dateStr = bookingItems[0]?.bookingDate || now.toISOString().split('T')[0];
    const count = bookingRepo.getAll().length + 1;
    const bookingCode = `SB-${dateStr.replace(/-/g, '')}-${String(count).padStart(6, '0')}`;

    // 4. Tạo Booking
    const newBooking = bookingRepo.create({
      bookingCode,
      customerId,
      facilityId: court.facilityId,
      courtId,
      items: bookingItems,
      totalDurationMinutes,
      priceDetails: {
        originalAmount: totalAmount,
        depositRequired,
        paidAmount: 0,
        remainingAmount: totalAmount,
        currency: 'VND',
        // Backward compatibility
        basePrice: totalAmount,
        discountAmount: 0,
        finalPrice: totalAmount
      },
      paymentOption, // 'DEPOSIT_20_PERCENT' hoặc 'FULL_PAYMENT'
      status: 'PENDING_PAYMENT',
      paymentStatus: 'UNPAID',
      holdExpiresAt,
      cancellationDeadline,
      cancelledAt: null,
      cancelReason: null,
      note: note || '',
      // Legacy view helpers
      bookingDate: dateStr,
      startAt: bookingItems[0]?.startAt?.substring(11, 16) || '08:00',
      endAt: bookingItems[bookingItems.length - 1]?.endAt?.substring(11, 16) || '09:00',
      duration: totalDurationMinutes
    });

    // 5. Tạo Booking Slots (chiếm chỗ với trạng thái HOLD, hết hạn sau 1 giờ)
    bookingItems.forEach((item) => {
      slotRepo.create({
        courtId,
        bookingId: newBooking._id,
        slotDate: item.bookingDate,
        startAt: item.startAt,
        endAt: item.endAt,
        status: 'HOLD',
        expiresAt: holdExpiresAt
      });
    });

    // 6. Tạo Payment record tương ứng
    const payAmount = paymentOption === 'DEPOSIT_20_PERCENT' ? depositRequired : totalAmount;
    const payCount = payRepo.getAll().length + 1;
    const newPayment = payRepo.create({
      bookingId: newBooking._id,
      customerId,
      paymentType: paymentOption === 'DEPOSIT_20_PERCENT' ? 'DEPOSIT' : 'FULL',
      amount: payAmount,
      currency: 'VND',
      method: 'ONLINE',
      provider: 'VNPAY',
      transactionCode: `TXN26${String(payCount).padStart(6, '0')}`,
      providerEventId: `evt_${Date.now()}`,
      status: 'PENDING',
      paidAt: null,
      refundedAt: null,
      failureReason: null
    });

    // 7. Tạo thông báo cho khách và chủ sân
    notiRepo.create({
      userId: customerId,
      title: 'Giữ chỗ sân thành công!',
      message: `Đơn ${bookingCode} tại ${court.name} đã được tạo. Tổng tiền: ${totalAmount.toLocaleString('vi-VN')}đ. Số tiền cần thanh toán (${paymentOption === 'DEPOSIT_20_PERCENT' ? 'Cọc 20%' : '100%'}): ${payAmount.toLocaleString('vi-VN')}đ. Hạn thanh toán: 1 giờ (trước ${new Date(holdExpiresAt).toLocaleTimeString('vi-VN')}). Hạn hủy hoàn tiền: trong 24 giờ.`,
      type: 'BOOKING',
      referenceId: newBooking._id,
      isRead: false
    });

    return { booking: newBooking, payment: newPayment };
  },

  getById: async (id) => {
    bookingMockService.checkAndExpirePendingBookings();

    const booking = bookingRepo.findById(id);
    if (!booking) return null;

    const court = courtRepo.findById(booking.courtId);
    const facility = facRepo.findById(booking.facilityId);
    const customer = userRepo.findById(booking.customerId);
    const payment = payRepo.findOne((p) => p.bookingId === booking._id);

    return {
      ...booking,
      court,
      facility,
      customer,
      payment
    };
  },

  getMyBookings: async (customerId, filter = {}) => {
    bookingMockService.checkAndExpirePendingBookings();

    let list = bookingRepo.find((b) => b.customerId === customerId);

    if (filter.status && filter.status !== 'ALL') {
      list = list.filter((b) => b.status === filter.status);
    }

    if (filter.search) {
      const q = filter.search.toLowerCase();
      list = list.filter((b) => b.bookingCode.toLowerCase().includes(q));
    }

    return list.map((b) => ({
      ...b,
      court: courtRepo.findById(b.courtId),
      facility: facRepo.findById(b.facilityId),
      payment: payRepo.findOne((p) => p.bookingId === b._id)
    }));
  },

  getOwnerBookings: async (ownerId, filter = {}) => {
    bookingMockService.checkAndExpirePendingBookings();

    const facilities = facRepo.find((f) => f.ownerId === ownerId);
    const facIds = new Set(facilities.map((f) => f._id));
    let list = bookingRepo.find((b) => facIds.has(b.facilityId));

    if (filter.status && filter.status !== 'ALL') {
      list = list.filter((b) => b.status === filter.status);
    }
    if (filter.facilityId) {
      list = list.filter((b) => b.facilityId === filter.facilityId);
    }
    if (filter.date) {
      list = list.filter((b) => b.bookingDate === filter.date);
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      list = list.filter((b) => b.bookingCode.toLowerCase().includes(q));
    }

    return list.map((b) => ({
      ...b,
      customer: userRepo.findById(b.customerId),
      court: courtRepo.findById(b.courtId),
      facility: facRepo.findById(b.facilityId),
      payment: payRepo.findOne((p) => p.bookingId === b._id)
    }));
  },

  getAllBookings: async (filter = {}) => {
    bookingMockService.checkAndExpirePendingBookings();

    let list = bookingRepo.getAll();
    if (filter.status && filter.status !== 'ALL') {
      list = list.filter((b) => b.status === filter.status);
    }
    if (filter.paymentStatus) {
      list = list.filter((b) => b.paymentStatus === filter.paymentStatus);
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      list = list.filter((b) => b.bookingCode.toLowerCase().includes(q));
    }

    return list.map((b) => ({
      ...b,
      customer: userRepo.findById(b.customerId),
      court: courtRepo.findById(b.courtId),
      facility: facRepo.findById(b.facilityId),
      payment: payRepo.findOne((p) => p.bookingId === b._id)
    }));
  },

  updateStatus: async (id, status) => {
    const updated = bookingRepo.update(id, { status });
    // Nếu bị CANCELLED hoặc EXPIRED, giải phóng slot
    if (status === 'CANCELLED' || status === 'EXPIRED') {
      const slots = slotRepo.find((s) => s.bookingId === id);
      slots.forEach((s) => slotRepo.delete(s._id));
    }
    return updated;
  },

  cancelBooking: async (id, reason = '') => {
    const booking = bookingRepo.findById(id);
    if (!booking) throw new Error('Không tìm thấy đơn đặt sân.');

    const now = new Date();
    const cancellationDeadline = booking.cancellationDeadline 
      ? new Date(booking.cancellationDeadline) 
      : new Date(new Date(booking.createdAt).getTime() + 24 * 60 * 60 * 1000);

    // QUY TẮC BẮT BUỘC (Database_Design.md v2.0 & Section 5.3):
    // "Sau 24 giờ kể từ lúc đặt, không cho hủy và không hoàn tiền (422 CANCELLATION_WINDOW_EXPIRED)."
    if (now > cancellationDeadline) {
      throw new Error('Chính sách SportBooking: Đã quá thời hạn 24 giờ kể từ thời điểm đặt sân. Hệ thống không cho phép hủy đơn và không hoàn lại tiền.');
    }

    const payment = payRepo.findOne((p) => p.bookingId === id);
    const paidAmount = booking.priceDetails?.paidAmount || (payment?.status === 'PAID' ? payment.amount : 0);

    // 1. Cập nhật trạng thái booking
    const updatedBooking = bookingRepo.update(id, {
      status: 'CANCELLED',
      paymentStatus: paidAmount > 0 ? 'REFUNDED' : 'UNPAID',
      cancelledAt: now.toISOString(),
      cancelReason: reason,
      note: booking.note ? `${booking.note} | Lý do hủy: ${reason}` : `Lý do hủy: ${reason}`
    });

    // 2. Giải phóng slot sân
    const slots = slotRepo.find((s) => s.bookingId === id);
    slots.forEach((s) => slotRepo.delete(s._id));

    // 3. Hoàn lại số tiền thực tế đã thu (nếu có)
    if (payment && paidAmount > 0) {
      payRepo.update(payment._id, {
        status: 'REFUNDED',
        refundedAt: now.toISOString()
      });
    }

    // 4. Báo cho khách hàng
    notiRepo.create({
      userId: booking.customerId,
      title: 'Đơn đặt sân đã được hủy thành công',
      message: `Đơn ${booking.bookingCode} đã được hủy trong thời hạn 24 giờ hợp lệ. ${paidAmount > 0 ? `Số tiền ${paidAmount.toLocaleString('vi-VN')}đ đã được chuyển lệnh hoàn trả.` : ''} Slot sân đã được giải phóng.`,
      type: 'REFUND',
      referenceId: booking._id,
      isRead: false
    });

    return updatedBooking;
  }
};
