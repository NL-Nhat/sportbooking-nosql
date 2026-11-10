import { initialBookings } from './bookings.js';
import { initialCourts } from './courts.js';

export const initialBookingSlots = [];

initialBookings.forEach((b, idx) => {
  // Những booking không bị CANCELLED sẽ chiếm slot BOOKED
  if (b.status !== 'CANCELLED') {
    const idHex = String(idx + 1).padStart(8, '0');
    initialBookingSlots.push({
      _id: `6909000000000000${idHex}`,
      courtId: b.courtId,
      bookingId: b._id,
      slotDate: b.bookingDate,
      startAt: b.startAt,
      endAt: b.endAt,
      status: b.status === 'PENDING_PAYMENT' ? 'HOLD' : (['CANCELLED', 'EXPIRED'].includes(b.status) ? 'RELEASED' : 'BOOKED'),
      expiresAt: b.status === 'PENDING_PAYMENT' ? (b.holdExpiresAt || null) : null,
      createdAt: b.createdAt
    });
  }
});

// Thêm 2 slot HOLD tạm thời đang trong quá trình checkout của khách vãng lai
initialBookingSlots.push({
  _id: "690900000000000000000098",
  courtId: initialCourts[0]._id,
  bookingId: null,
  slotDate: "2026-11-04",
  startAt: "2026-11-04T16:00:00.000Z",
  endAt: "2026-11-04T17:00:00.000Z",
  status: "HOLD",
  expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
  createdAt: new Date().toISOString()
});

initialBookingSlots.push({
  _id: "690900000000000000000099",
  courtId: initialCourts[2]._id,
  bookingId: null,
  slotDate: "2026-11-04",
  startAt: "2026-11-04T17:00:00.000Z",
  endAt: "2026-11-04T18:00:00.000Z",
  status: "HOLD",
  expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
  createdAt: new Date().toISOString()
});

