import { initialBookings } from './bookings.js';

export const initialPayments = [];

initialBookings.forEach((b, idx) => {
  const idHex = String(idx + 1).padStart(8, '0');
  const txCode = `TXN26${String(idx + 1).padStart(6, '0')}`;
  
  let method = 'ONLINE';
  if (idx % 3 === 0) method = 'BANK_TRANSFER';
  if (idx % 5 === 0) method = 'CASH';

  let pStatus = 'PAID';
  let paidAt = b.createdAt;
  let refundedAt = null;

  if (b.paymentStatus === 'UNPAID') {
    pStatus = 'PENDING';
    paidAt = null;
  } else if (b.paymentStatus === 'REFUNDED') {
    pStatus = 'REFUNDED';
    paidAt = b.createdAt;
    refundedAt = `${b.bookingDate}T12:00:00.000Z`;
  }

  const paymentType = b.paymentOption === 'DEPOSIT_20_PERCENT' ? 'DEPOSIT' : 'FULL';
  const payAmount = b.paymentOption === 'DEPOSIT_20_PERCENT' ? b.priceDetails.depositRequired : b.priceDetails.originalAmount;

  initialPayments.push({
    _id: `690a000000000000${idHex}`,
    bookingId: b._id,
    customerId: b.customerId,
    paymentType,
    amount: payAmount,
    currency: 'VND',
    method,
    provider: method === 'ONLINE' ? 'VNPAY' : method === 'BANK_TRANSFER' ? 'VIETQR' : null,
    transactionCode: txCode,
    providerEventId: `evt_${idHex}`,
    status: pStatus,
    paidAt,
    refundedAt,
    failureReason: null,
    createdAt: b.createdAt,
    updatedAt: b.updatedAt
  });
});
