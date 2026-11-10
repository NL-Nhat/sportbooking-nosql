import { MockRepository } from '../storage/mockRepository.js';

const payRepo = new MockRepository('payments');
const bookingRepo = new MockRepository('bookings');
const slotRepo = new MockRepository('booking_slots');
const notiRepo = new MockRepository('notifications');

export const paymentMockService = {
  getByBookingId: async (bookingId) => {
    return payRepo.findOne((p) => p.bookingId === bookingId);
  },

  getAll: async (filter = {}) => {
    let list = payRepo.getAll();
    if (filter.status && filter.status !== 'ALL') {
      list = list.filter((p) => p.status === filter.status);
    }
    if (filter.method && filter.method !== 'ALL') {
      list = list.filter((p) => p.method === filter.method);
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      list = list.filter((p) => p.transactionCode.toLowerCase().includes(q));
    }
    return list.map((p) => ({
      ...p,
      booking: bookingRepo.findById(p.bookingId)
    }));
  },

  simulatePayment: async (paymentId, optionOrMethod, isSuccess = true) => {
    const payment = payRepo.findById(paymentId);
    if (!payment) throw new Error('Không tìm thấy giao dịch thanh toán.');

    const booking = bookingRepo.findById(payment.bookingId);
    const chosenOption = (optionOrMethod === 'DEPOSIT_20_PERCENT' || optionOrMethod === 'FULL_PAYMENT')
      ? optionOrMethod
      : (booking?.paymentOption || (payment.paymentType === 'DEPOSIT' ? 'DEPOSIT_20_PERCENT' : 'FULL_PAYMENT'));
    const isDeposit = chosenOption === 'DEPOSIT_20_PERCENT';
    const paymentType = isDeposit ? 'DEPOSIT' : 'FULL';
    const totalAmount = booking?.priceDetails?.originalAmount ?? booking?.priceDetails?.finalPrice ?? payment.amount;
    const depositRequired = booking?.priceDetails?.depositRequired ?? Math.round(totalAmount * 0.20);
    const targetAmount = isDeposit ? depositRequired : totalAmount;

    if (isSuccess) {
      const now = new Date().toISOString();
      const updatedPayment = payRepo.update(paymentId, {
        status: 'PAID',
        paymentType,
        amount: targetAmount,
        method: (optionOrMethod === 'ONLINE' || optionOrMethod === 'BANK_TRANSFER' || optionOrMethod === 'CASH') ? optionOrMethod : (payment.method || 'ONLINE'),
        paidAt: now
      });

      if (booking) {
        const newPaymentStatus = isDeposit ? 'DEPOSIT_PAID' : 'PAID';
        const paidAmount = targetAmount;
        const remainingAmount = isDeposit ? Math.max(0, totalAmount - paidAmount) : 0;

        bookingRepo.update(booking._id, {
          paymentOption: chosenOption,
          paymentStatus: newPaymentStatus,
          status: 'CONFIRMED',
          holdExpiresAt: null, // Xóa hạn giữ chỗ vì đã thanh toán hợp lệ
          priceDetails: {
            ...booking.priceDetails,
            paidAmount,
            remainingAmount
          }
        });

        // Chuyển toàn bộ slot từ HOLD sang BOOKED
        const slots = slotRepo.find((s) => s.bookingId === booking._id);
        slots.forEach((s) => {
          slotRepo.update(s._id, {
            status: 'BOOKED',
            expiresAt: null
          });
        });
      }

      notiRepo.create({
        userId: payment.customerId,
        title: isDeposit ? 'Đặt cọc 20% thành công!' : 'Thanh toán 100% thành công!',
        message: `Giao dịch ${payment.transactionCode} (${isDeposit ? 'Đặt cọc 20%' : 'Thanh toán 100%'}) số tiền ${targetAmount.toLocaleString('vi-VN')}đ đã thành công. Sân của bạn đã được xác nhận chính thức.`,
        type: 'PAYMENT',
        referenceId: payment.bookingId,
        isRead: false
      });

      return updatedPayment;
    } else {
      const updatedPayment = payRepo.update(paymentId, {
        status: 'FAILED',
        failureReason: 'Giao dịch bị từ chối bởi cổng thanh toán mô phỏng'
      });

      notiRepo.create({
        userId: payment.customerId,
        title: 'Thanh toán không thành công!',
        message: `Giao dịch ${payment.transactionCode} không thành công. Bạn có 1 giờ kể từ lúc đặt sân để hoàn tất thanh toán trước khi khung giờ bị hủy.`,
        type: 'PAYMENT',
        referenceId: payment.bookingId,
        isRead: false
      });

      return updatedPayment;
    }
  },

  // Thanh toán phần 80% còn lại cho đơn đã đặt cọc
  payRemaining: async (bookingId, method = 'ONLINE') => {
    const booking = bookingRepo.findById(bookingId);
    if (!booking) throw new Error('Không tìm thấy đơn đặt sân.');
    if (booking.paymentStatus !== 'DEPOSIT_PAID') {
      throw new Error('Đơn đặt sân này không trong trạng thái chờ thanh toán phần còn lại.');
    }

    const remainingAmount = booking.priceDetails?.remainingAmount || 0;
    if (remainingAmount <= 0) throw new Error('Đơn đặt sân này đã thanh toán đủ.');

    const payCount = payRepo.getAll().length + 1;
    const now = new Date().toISOString();

    const remainingPayment = payRepo.create({
      bookingId: booking._id,
      customerId: booking.customerId,
      paymentType: 'REMAINING',
      amount: remainingAmount,
      currency: 'VND',
      method,
      provider: method === 'ONLINE' ? 'VNPAY' : method === 'BANK_TRANSFER' ? 'VIETQR' : null,
      transactionCode: `TXN26${String(payCount).padStart(6, '0')}`,
      providerEventId: `evt_${Date.now()}`,
      status: 'PAID',
      paidAt: now,
      refundedAt: null
    });

    bookingRepo.update(booking._id, {
      paymentStatus: 'PAID',
      priceDetails: {
        ...booking.priceDetails,
        paidAmount: booking.priceDetails.originalAmount,
        remainingAmount: 0
      }
    });

    notiRepo.create({
      userId: booking.customerId,
      title: 'Hoàn tất thanh toán 100%!',
      message: `Đơn đặt sân ${booking.bookingCode} đã thanh toán đủ 100% (số tiền còn lại ${remainingAmount.toLocaleString('vi-VN')}đ).`,
      type: 'PAYMENT',
      referenceId: booking._id,
      isRead: false
    });

    return remainingPayment;
  }
};
