import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingMockService } from '../../../mock/services/bookingMockService.js';
import { paymentMockService } from '../../../mock/services/paymentMockService.js';
import { formatCurrency, formatDate } from '../../utils/formatters.js';
import { useToast } from '../../contexts/ToastContext.jsx';
import { 
  CheckCircle2, 
  XCircle,
  Clock,
  DollarSign,
  ShieldCheck
} from 'lucide-react';

export function PaymentPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [booking, setBooking] = useState(null);
  const [payment, setPayment] = useState(null);
  // Chỉ chọn Thanh toán 100% (FULL_PAYMENT) hay Đặt cọc 20% (DEPOSIT_20_PERCENT)
  const [paymentOption, setPaymentOption] = useState('DEPOSIT_20_PERCENT');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    bookingMockService.getById(bookingId).then((b) => {
      setBooking(b);
      if (b) {
        if (b.paymentOption) {
          setPaymentOption(b.paymentOption);
        }
        paymentMockService.getByBookingId(bookingId).then(setPayment);
      }
      setLoading(false);
    });
  }, [bookingId]);

  const handleSimulatePayment = async (isSuccess) => {
    if (!payment) return;
    setSubmitting(true);
    try {
      await paymentMockService.simulatePayment(payment._id, paymentOption, isSuccess);
      if (isSuccess) {
        showToast(
          paymentOption === 'DEPOSIT_20_PERCENT' 
            ? 'Xác nhận đặt cọc 20% thành công!' 
            : 'Xác nhận thanh toán 100% thành công!', 
          'success'
        );
        navigate(`/payment-result/${bookingId}?status=success`);
      } else {
        showToast('Giao dịch thanh toán thất bại.', 'error');
        navigate(`/payment-result/${bookingId}?status=failed`);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '80px' }}>Đang nạp thông tin thanh toán...</div>;
  }

  if (!booking) {
    return <div style={{ textAlign: 'center', padding: '80px' }}>Không tìm thấy đơn đặt sân.</div>;
  }

  const totalAmount = booking.priceDetails?.originalAmount ?? booking.priceDetails?.finalPrice ?? 0;
  const depositRequired = booking.priceDetails?.depositRequired ?? Math.round(totalAmount * 0.20);
  const isDeposit = paymentOption === 'DEPOSIT_20_PERCENT';
  const payAmount = isDeposit ? depositRequired : totalAmount;

  return (
    <div style={{ padding: '40px 0 64px' }}>
      <div className="container" style={{ maxWidth: '720px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <span className="badge badge-warning" style={{ fontSize: '0.82rem', padding: '6px 12px' }}>
              Trạng thái chỗ: Đang giữ chỗ (HOLD)
            </span>
          </div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '8px' }}>Thanh toán đặt sân</h1>
          <p style={{ color: 'var(--sb-text-secondary)', marginBottom: '8px' }}>
            Mã đơn: <strong style={{ fontFamily: 'monospace', color: 'var(--sb-primary-700)' }}>{booking.bookingCode}</strong> • Sân: <strong>{booking.court?.name}</strong>
          </p>

          {/* Hiển thị khung giờ đang được giữ chỗ */}
          {booking.items && booking.items.length > 0 && (
            <div style={{ fontSize: '0.85rem', color: 'var(--sb-text-secondary)', marginBottom: '12px' }}>
              Ngày {formatDate(booking.items[0].bookingDate)} • Khung giờ:{' '}
              <strong>
                {booking.items.map((item) => `${item.startAt?.substring(11, 16)} - ${item.endAt?.substring(11, 16)}`).join(', ')}
              </strong>
            </div>
          )}

          <div style={{
            display: 'inline-flex',
            alignItems: 'baseline',
            gap: '8px',
            padding: '12px 24px',
            backgroundColor: 'var(--sb-primary-50)',
            borderRadius: 'var(--sb-radius-lg)',
            border: '1px solid var(--sb-primary-200)',
            marginTop: '4px'
          }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--sb-text-secondary)' }}>
              {isDeposit ? 'Số tiền đặt cọc 20% cần thanh toán:' : 'Số tiền thanh toán 100%:'}
            </span>
            <strong style={{ color: 'var(--sb-primary-700)', fontSize: '1.5rem', fontWeight: 800 }}>
              {formatCurrency(payAmount)}
            </strong>
            {isDeposit && (
              <span style={{ fontSize: '0.8rem', color: 'var(--sb-text-muted)' }}>
                (Tổng tiền sân: {formatCurrency(totalAmount)})
              </span>
            )}
          </div>
        </div>

        {/* Cảnh báo 1 giờ giữ chỗ */}
        <div style={{
          padding: '14px 18px',
          backgroundColor: '#FFFBEB',
          borderRadius: 'var(--sb-radius-md)',
          border: '1px solid #F59E0B',
          color: '#B45309',
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '24px'
        }}>
          <Clock size={20} style={{ flexShrink: 0 }} />
          <div>
            <strong>Đang giữ chỗ sân (HOLD):</strong> Khung giờ của bạn đang được giữ tạm thời trong 1 giờ (trước{' '}
            <strong>{booking.holdExpiresAt ? new Date(booking.holdExpiresAt).toLocaleTimeString('vi-VN') : '1 giờ'}</strong>). Vui lòng chọn mức thanh toán bên dưới để xác nhận đặt sân.
          </div>
        </div>

        {/* Chỉ hiện lựa chọn Thanh toán 100% hay Đặt cọc 20% (Đã xóa chọn phương thức thanh toán) */}
        <div className="card" style={{ padding: '24px', marginBottom: '28px' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <DollarSign size={20} color="var(--sb-primary-600)" /> Chọn mức thanh toán
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Lựa chọn 1: Đặt cọc 20% */}
            <label style={{
              display: 'flex',
              alignItems: 'start',
              gap: '12px',
              padding: '16px',
              borderRadius: 'var(--sb-radius-md)',
              border: `2px solid ${paymentOption === 'DEPOSIT_20_PERCENT' ? 'var(--sb-primary-600)' : 'var(--sb-border)'}`,
              backgroundColor: paymentOption === 'DEPOSIT_20_PERCENT' ? 'var(--sb-primary-50)' : '#FFFFFF',
              cursor: 'pointer'
            }}>
              <input
                type="radio"
                name="paymentOption"
                value="DEPOSIT_20_PERCENT"
                checked={paymentOption === 'DEPOSIT_20_PERCENT'}
                onChange={() => setPaymentOption('DEPOSIT_20_PERCENT')}
                style={{ marginTop: '4px' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.98rem', color: 'var(--sb-text-primary)' }}>
                    Đặt cọc 20%
                  </span>
                  <span style={{ fontWeight: 800, color: 'var(--sb-primary-700)', fontSize: '1.1rem' }}>
                    {formatCurrency(depositRequired)}
                  </span>
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--sb-text-secondary)', lineHeight: 1.4 }}>
                  Thanh toán trước 20% để xác nhận giữ sân chính thức. Phần còn lại <strong>{formatCurrency(totalAmount - depositRequired)}</strong> thanh toán sau hoặc tại sân.
                </p>
              </div>
            </label>

            {/* Lựa chọn 2: Thanh toán 100% */}
            <label style={{
              display: 'flex',
              alignItems: 'start',
              gap: '12px',
              padding: '16px',
              borderRadius: 'var(--sb-radius-md)',
              border: `2px solid ${paymentOption === 'FULL_PAYMENT' ? 'var(--sb-primary-600)' : 'var(--sb-border)'}`,
              backgroundColor: paymentOption === 'FULL_PAYMENT' ? 'var(--sb-primary-50)' : '#FFFFFF',
              cursor: 'pointer'
            }}>
              <input
                type="radio"
                name="paymentOption"
                value="FULL_PAYMENT"
                checked={paymentOption === 'FULL_PAYMENT'}
                onChange={() => setPaymentOption('FULL_PAYMENT')}
                style={{ marginTop: '4px' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.98rem', color: 'var(--sb-text-primary)' }}>
                    Thanh toán 100%
                  </span>
                  <span style={{ fontWeight: 800, color: 'var(--sb-primary-700)', fontSize: '1.1rem' }}>
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--sb-text-secondary)', lineHeight: 1.4 }}>
                  Thanh toán toàn bộ 100% chi phí đặt sân ngay bây giờ ({formatCurrency(totalAmount)}).
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Nút xác nhận thanh toán */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          <button
            type="button"
            className="btn btn-success btn-lg"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            disabled={submitting}
            onClick={() => handleSimulatePayment(true)}
          >
            <CheckCircle2 size={20} />
            {submitting ? 'Đang xử lý...' : `Xác nhận thanh toán (${formatCurrency(payAmount)})`}
          </button>

          <button
            type="button"
            className="btn btn-danger btn-lg"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            disabled={submitting}
            onClick={() => handleSimulatePayment(false)}
          >
            <XCircle size={20} />
            Hủy / Giả lập thất bại
          </button>
        </div>

        <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--sb-text-muted)', lineHeight: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <ShieldCheck size={16} color="var(--sb-primary-600)" />
          <span>Sau khi thanh toán, quý khách được quyền hủy đơn và hoàn tiền trong vòng <strong>24 giờ</strong> kể từ lúc tạo đơn.</span>
        </div>
      </div>
    </div>
  );
}

export default PaymentPage;
