import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { bookingMockService } from '../../../mock/services/bookingMockService.js';
import { formatCurrency, formatDate } from '../../utils/formatters.js';
import { CheckCircle2, XCircle, ArrowRight, RotateCcw, Calendar } from 'lucide-react';
import { ROUTES } from '../../constants/routes.js';

export function PaymentResultPage() {
  const { bookingId } = useParams();
  const [searchParams] = useSearchParams();
  const isSuccess = searchParams.get('status') !== 'failed';

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookingMockService.getById(bookingId).then((b) => {
      setBooking(b);
      setLoading(false);
    });
  }, [bookingId]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '80px' }}>Đang xác minh kết quả thanh toán...</div>;
  }

  return (
    <div style={{ padding: '60px 0 80px' }}>
      <div className="container" style={{ maxWidth: '600px' }}>
        <div className="card" style={{ padding: '40px 32px', textAlign: 'center' }}>
          {isSuccess ? (
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              backgroundColor: 'var(--sb-success-bg)',
              color: 'var(--sb-success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              <CheckCircle2 size={44} />
            </div>
          ) : (
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              backgroundColor: 'var(--sb-danger-bg)',
              color: 'var(--sb-danger)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              <XCircle size={44} />
            </div>
          )}

          <h1 style={{ fontSize: '1.65rem', marginBottom: '8px' }}>
            {isSuccess ? 'Thanh toán & Đặt sân thành công!' : 'Thanh toán không thành công'}
          </h1>

          <p style={{ color: 'var(--sb-text-secondary)', fontSize: '0.95rem', marginBottom: '28px', lineHeight: 1.6 }}>
            {isSuccess
              ? `Cảm ơn bạn! Đơn đặt sân đã được xác nhận. Vui lòng lưu lại mã booking điện tử bên dưới để check-in tại quầy cơ sở.`
              : `Giao dịch thanh toán chưa thể hoàn tất. Đơn đặt sân của bạn vẫn được giữ trong trạng thái chờ thanh toán.`}
          </p>

          {booking && (
            <div style={{
              backgroundColor: 'var(--sb-background)',
              borderRadius: 'var(--sb-radius-md)',
              padding: '20px',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              fontSize: '0.9rem',
              marginBottom: '32px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--sb-text-muted)' }}>Mã đơn đặt sân:</span>
                <strong style={{ fontFamily: 'monospace', fontSize: '1.05rem', color: 'var(--sb-primary-800)' }}>
                  {booking.bookingCode}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--sb-text-muted)' }}>Sân thi đấu:</span>
                <strong>{booking.court?.name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--sb-text-muted)' }}>Cơ sở:</span>
                <strong>{booking.facility?.name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--sb-text-muted)' }}>Ngày thi đấu:</span>
                <strong>{formatDate(booking.bookingDate)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--sb-text-muted)' }}>Khung giờ:</span>
                <strong>{booking.startAt?.substring(11, 16)} - {booking.endAt?.substring(11, 16)}</strong>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                borderTop: '1px solid var(--sb-border)',
                paddingTop: '10px',
                marginTop: '4px',
                fontWeight: 700
              }}>
                <span>Tổng số tiền:</span>
                <span style={{ color: 'var(--sb-primary-700)', fontSize: '1.1rem' }}>
                  {formatCurrency(booking.priceDetails?.finalPrice)}
                </span>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            {isSuccess ? (
              <>
                <Link to={`/account/bookings/${bookingId}`} className="btn btn-primary">
                  Xem chi tiết đơn <ArrowRight size={16} />
                </Link>
                <Link to={ROUTES.HOME} className="btn btn-secondary">
                  Về trang chủ
                </Link>
              </>
            ) : (
              <>
                <Link to={`/payment/${bookingId}`} className="btn btn-primary">
                  <RotateCcw size={16} /> Thử thanh toán lại
                </Link>
                <Link to={ROUTES.ACCOUNT} className="btn btn-secondary">
                  Về tài khoản của tôi
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentResultPage;
