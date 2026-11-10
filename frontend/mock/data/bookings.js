import { USER_IDS, FACILITY_IDS } from '../fixtures/ids.js';
import { initialCourts } from './courts.js';

export const initialBookings = [];

// Trạng thái theo Database_Design.md v2.0:
// status: PENDING_PAYMENT, CONFIRMED, COMPLETED, CANCELLED, EXPIRED
// paymentStatus: UNPAID, DEPOSIT_PAID, PAID, REFUND_PENDING, PARTIALLY_REFUNDED, REFUNDED, PAYMENT_FAILED
// paymentOption: DEPOSIT_20_PERCENT, FULL_PAYMENT

const sampleCustomers = [
  USER_IDS.CUSTOMER_1,
  USER_IDS.CUSTOMER_2,
  USER_IDS.CUSTOMER_3,
  USER_IDS.CUSTOMER_4
];

const bookingConfigs = [
  // 1. Customer 1 - Completed (quá khứ)
  { date: "2026-10-25", start: "18:00", end: "19:00", courtIdx: 0, cust: sampleCustomers[0], status: "COMPLETED", payStatus: "PAID", opt: "FULL_PAYMENT", amount: 380000, note: "Đặt trước áo pitch và 1 bình nước suối" },
  { date: "2026-10-28", start: "19:00", end: "20:00", courtIdx: 2, cust: sampleCustomers[0], status: "COMPLETED", payStatus: "PAID", opt: "FULL_PAYMENT", amount: 120000, note: "" },
  { date: "2026-11-01", start: "17:00", end: "18:00", courtIdx: 7, cust: sampleCustomers[0], status: "COMPLETED", payStatus: "PAID", opt: "DEPOSIT_20_PERCENT", amount: 120000, note: "Nhờ bật quạt gió sớm" },
  
  // 2. Customer 1 - Confirmed (sắp tới)
  { date: "2026-11-04", start: "18:00", end: "19:00", courtIdx: 0, cust: sampleCustomers[0], status: "CONFIRMED", payStatus: "PAID", opt: "FULL_PAYMENT", amount: 380000, note: "Giao hữu công ty FPT" },
  { date: "2026-11-05", start: "19:00", end: "20:00", courtIdx: 9, cust: sampleCustomers[0], status: "CONFIRMED", payStatus: "DEPOSIT_PAID", opt: "DEPOSIT_20_PERCENT", amount: 170000, note: "CLB Pickleball Hải Châu - Đã cọc 20%" },

  // 3. Customer 1 - PENDING_PAYMENT (trong hạn 1 giờ)
  { date: "2026-11-08", start: "20:00", end: "21:00", courtIdx: 1, cust: sampleCustomers[0], status: "PENDING_PAYMENT", payStatus: "UNPAID", opt: "DEPOSIT_20_PERCENT", amount: 380000, note: "Đặt sân 7 người đá tối nay" },

  // 4. Customer 1 - Cancelled (hủy trong 24h, hoàn tiền)
  { date: "2026-10-30", start: "16:00", end: "17:00", courtIdx: 6, cust: sampleCustomers[0], status: "CANCELLED", payStatus: "REFUNDED", opt: "FULL_PAYMENT", amount: 160000, note: "Hủy do thời tiết mưa bão" },

  // 5. Customer 2 bookings
  { date: "2026-10-20", start: "07:00", end: "08:00", courtIdx: 11, cust: sampleCustomers[1], status: "COMPLETED", payStatus: "PAID", opt: "FULL_PAYMENT", amount: 160000, note: "" },
  { date: "2026-10-24", start: "18:00", end: "19:00", courtIdx: 4, cust: sampleCustomers[1], status: "COMPLETED", payStatus: "PAID", opt: "FULL_PAYMENT", amount: 380000, note: "" },
  { date: "2026-11-04", start: "19:00", end: "20:00", courtIdx: 1, cust: sampleCustomers[1], status: "CONFIRMED", payStatus: "PAID", opt: "FULL_PAYMENT", amount: 380000, note: "Team anh Quân đá tập" },
  { date: "2026-11-06", start: "18:00", end: "19:00", courtIdx: 18, cust: sampleCustomers[1], status: "CONFIRMED", payStatus: "DEPOSIT_PAID", opt: "DEPOSIT_20_PERCENT", amount: 170000, note: "Đặt sân Mỹ Khê trải nghiệm" },
  { date: "2026-11-07", start: "17:00", end: "18:00", courtIdx: 14, cust: sampleCustomers[1], status: "EXPIRED", payStatus: "UNPAID", opt: "DEPOSIT_20_PERCENT", amount: 380000, note: "Hết hạn 1 giờ chưa thanh toán" },

  // 6. Customer 3 bookings
  { date: "2026-10-18", start: "19:00", end: "20:00", courtIdx: 8, cust: sampleCustomers[2], status: "COMPLETED", payStatus: "PAID", opt: "FULL_PAYMENT", amount: 120000, note: "" },
  { date: "2026-10-22", start: "20:00", end: "21:00", courtIdx: 10, cust: sampleCustomers[2], status: "COMPLETED", payStatus: "PAID", opt: "FULL_PAYMENT", amount: 170000, note: "" },
  { date: "2026-11-03", start: "18:00", end: "19:00", courtIdx: 3, cust: sampleCustomers[2], status: "COMPLETED", payStatus: "PAID", opt: "FULL_PAYMENT", amount: 120000, note: "" },
  { date: "2026-11-05", start: "17:00", end: "18:00", courtIdx: 8, cust: sampleCustomers[2], status: "CONFIRMED", payStatus: "DEPOSIT_PAID", opt: "DEPOSIT_20_PERCENT", amount: 120000, note: "" },
  { date: "2026-11-08", start: "08:00", end: "09:00", courtIdx: 13, cust: sampleCustomers[2], status: "CONFIRMED", payStatus: "PAID", opt: "FULL_PAYMENT", amount: 190000, note: "" },

  // 7. Customer 4 bookings
  { date: "2026-10-15", start: "18:00", end: "19:00", courtIdx: 16, cust: sampleCustomers[3], status: "COMPLETED", payStatus: "PAID", opt: "FULL_PAYMENT", amount: 380000, note: "" },
  { date: "2026-10-29", start: "19:00", end: "20:00", courtIdx: 17, cust: sampleCustomers[3], status: "COMPLETED", payStatus: "PAID", opt: "FULL_PAYMENT", amount: 120000, note: "" },
  { date: "2026-11-04", start: "20:00", end: "21:00", courtIdx: 16, cust: sampleCustomers[3], status: "CONFIRMED", payStatus: "PAID", opt: "FULL_PAYMENT", amount: 380000, note: "" },
  { date: "2026-11-07", start: "16:00", end: "17:00", courtIdx: 15, cust: sampleCustomers[3], status: "CONFIRMED", payStatus: "DEPOSIT_PAID", opt: "DEPOSIT_20_PERCENT", amount: 180000, note: "" },
  { date: "2026-11-09", start: "19:00", end: "20:00", courtIdx: 19, cust: sampleCustomers[3], status: "CONFIRMED", payStatus: "PAID", opt: "FULL_PAYMENT", amount: 170000, note: "" },

  // 8. Additional bookings (đủ 30 bookings chuẩn v2.0, bao gồm các booking COMPLETED cho reviews)
  { date: "2026-10-10", start: "17:00", end: "18:00", courtIdx: 0, cust: sampleCustomers[0], status: "COMPLETED", payStatus: "PAID", opt: "FULL_PAYMENT", amount: 380000, note: "" },
  { date: "2026-10-12", start: "18:00", end: "19:00", courtIdx: 5, cust: sampleCustomers[1], status: "COMPLETED", payStatus: "PAID", opt: "FULL_PAYMENT", amount: 380000, note: "" },
  { date: "2026-10-14", start: "19:00", end: "20:00", courtIdx: 11, cust: sampleCustomers[2], status: "COMPLETED", payStatus: "PAID", opt: "FULL_PAYMENT", amount: 220000, note: "" },
  { date: "2026-10-16", start: "20:00", end: "21:00", courtIdx: 6, cust: sampleCustomers[3], status: "COMPLETED", payStatus: "PAID", opt: "FULL_PAYMENT", amount: 220000, note: "" },
  { date: "2026-11-02", start: "06:00", end: "07:00", courtIdx: 2, cust: sampleCustomers[0], status: "COMPLETED", payStatus: "PAID", opt: "FULL_PAYMENT", amount: 90000, note: "" },
  { date: "2026-11-06", start: "20:00", end: "21:00", courtIdx: 4, cust: sampleCustomers[1], status: "CONFIRMED", payStatus: "DEPOSIT_PAID", opt: "DEPOSIT_20_PERCENT", amount: 380000, note: "Đã đặt cọc 20%" },
  { date: "2026-11-08", start: "17:00", end: "18:00", courtIdx: 9, cust: sampleCustomers[2], status: "PENDING_PAYMENT", payStatus: "UNPAID", opt: "DEPOSIT_20_PERCENT", amount: 170000, note: "Đang giữ chỗ 1 giờ" },
  { date: "2026-10-27", start: "18:00", end: "19:00", courtIdx: 12, cust: sampleCustomers[3], status: "CANCELLED", payStatus: "REFUNDED", opt: "DEPOSIT_20_PERCENT", amount: 240000, note: "Hủy trong vòng 24 giờ, đã hoàn cọc" }
];

bookingConfigs.forEach((cfg, idx) => {
  const idHex = String(idx + 1).padStart(8, '0');
  const code = `SB-${cfg.date.replace(/-/g, '')}-${String(idx + 1).padStart(6, '0')}`;
  const court = initialCourts[cfg.courtIdx] || initialCourts[0];
  const startAt = `${cfg.date}T${cfg.start}:00.000Z`;
  const endAt = `${cfg.date}T${cfg.end}:00.000Z`;

  const depositRequired = Math.round(cfg.amount * 0.2);
  let paidAmount = 0;
  if (cfg.payStatus === 'PAID') {
    paidAmount = cfg.amount;
  } else if (cfg.payStatus === 'DEPOSIT_PAID') {
    paidAmount = depositRequired;
  } else if (cfg.payStatus === 'REFUNDED') {
    paidAmount = 0;
  }
  const remainingAmount = cfg.amount - paidAmount;

  const createdAt = `${cfg.date}T10:00:00.000Z`;
  const createdDateObj = new Date(createdAt);
  const holdExpiresAt = cfg.payStatus === 'UNPAID' 
    ? new Date(createdDateObj.getTime() + 1 * 60 * 60 * 1000).toISOString() 
    : null;
  const cancellationDeadline = new Date(createdDateObj.getTime() + 24 * 60 * 60 * 1000).toISOString();

  initialBookings.push({
    _id: `6908000000000000${idHex}`,
    bookingCode: code,
    customerId: cfg.cust,
    facilityId: court.facilityId,
    courtId: court._id,
    items: [
      {
        bookingDate: cfg.date,
        startAt,
        endAt,
        durationMinutes: 60,
        unitPrice: cfg.amount,
        amount: cfg.amount
      }
    ],
    totalDurationMinutes: 60,
    priceDetails: {
      originalAmount: cfg.amount,
      depositRequired,
      paidAmount,
      remainingAmount,
      currency: 'VND',
      // backward compatibility properties
      basePrice: cfg.amount,
      discountAmount: 0,
      finalPrice: cfg.amount
    },
    paymentOption: cfg.opt,
    status: cfg.status,
    paymentStatus: cfg.payStatus,
    holdExpiresAt,
    cancellationDeadline,
    cancelledAt: cfg.status === 'CANCELLED' ? `${cfg.date}T14:30:00.000Z` : null,
    cancelReason: cfg.status === 'CANCELLED' ? 'Hủy do thời tiết mưa bão' : null,
    note: cfg.note,
    createdAt,
    updatedAt: `${cfg.date}T10:30:00.000Z`,
    
    // Legacy view helpers
    bookingDate: cfg.date,
    startAt,
    endAt,
    duration: 60
  });
});
