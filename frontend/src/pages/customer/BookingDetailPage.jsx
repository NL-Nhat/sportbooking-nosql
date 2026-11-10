import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { bookingMockService } from '../../../mock/services/bookingMockService.js';
import { paymentMockService } from '../../../mock/services/paymentMockService.js';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/formatters.js';
import { StatusBadge } from '../../components/ui/StatusBadge.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { useToast } from '../../contexts/ToastContext.jsx';
import { ROUTES } from '../../constants/routes.js';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  CreditCard, 
  AlertTriangle, 
  Star, 
  ArrowLeft,
  MessageSquareWarning,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Info
} from 'lucide-react';

export function BookingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelModal, setCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [submittingCancel, setSubmittingCancel] = useState(false);
  const [submittingRemaining, setSubmittingRemaining] = useState(false);

  const loadBooking = () => {
    setLoading(true);
    bookingMockService.getById(id).then((data) => {
      setBooking(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadBooking();
  }, [id]);

  const handleCancelBooking = async () => {
    if (!cancelReason.trim()) {
      showToast('Vui lòng nhập lý do hủy đặt sân.', 'warning');
      return;
    }
    setSubmittingCancel(true);
    try {
      await bookingMockService.cancelBooking(id, cancelReason);
      setCancelModal(false);
      showToast('Đã hủy đơn đặt sân thành công trong thời hạn 24 giờ. Tiền đã được chuyển hoàn.', 'info');
      loadBooking();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmittingCancel(false);
    }
  };

  const handlePayRemaining = async () => {
    setSubmittingRemaining(true);
    try {
      await paymentMockService.payRemaining(booking._id, 'ONLINE');
      showToast('Thanh toán phần 80% còn lại thành công!', 'success');
      loadBooking();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmittingRemaining(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '80px' }}>Đang tải chi tiết đơn đặt sân...</div>;
  }

  if (!booking) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <h2>Không tìm thấy đơn đặt sân này</h2>
        <Link to={ROUTES.BOOKINGS} className="btn btn-primary" style={{ marginTop: '16px' }}>
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  const now = new Date();
  const cancellationDeadline = booking.cancellationDeadline 
    ? new Date(booking.cancellationDeadline) 
    : new Date(new Date(booking.createdAt).getTime() + 24 * 60 * 60 * 1000);
  const isWithin24h = now <= cancellationDeadline;
  const isCancellableState = booking.status === 'CONFIRMED' || booking.status === 'PENDING_PAYMENT';
  const canCancel = isCancellableState && isWithin24h;

  const items = booking.items || [
    {
      bookingDate: booking.bookingDate,
      startAt: `${booking.bookingDate}T${booking.startAt || '08:00'}:00.000Z`,
      endAt: `${booking.bookingDate}T${booking.endAt || '09:00'}:00.000Z`,
      durationMinutes: booking.duration || 60,
      unitPrice: booking.priceDetails?.originalAmount || booking.priceDetails?.finalPrice || 0,
      amount: booking.priceDetails?.originalAmount || booking.priceDetails?.finalPrice || 0
    }
  ];

  return (
    <div>
      {/* Top back button */}
      <div style={{ marginBottom: '20px' }}>
        <Link to={ROUTES.BOOKINGS} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', color: 'var(--sb-text-secondary)', fontWeight: 600 }}>
          <ArrowLeft size={16} /> Quay lại danh sách đơn đặt sân
        </Link>
      </div>

      {/* Main details card */}
      <div className="card" style={{ padding: '32px', marginBottom: '28px' }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--sb-border)',
          paddingBottom: '20px',
          marginBottom: '24px',
          gap: '16px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <h1 style={{ fontSize: '1.6rem', margin: 0, fontFamily: 'monospace' }}>
                {booking.bookingCode}
              </h1>
              <StatusBadge status={booking.status} />
              <StatusBadge status={booking.paymentStatus} />
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--sb-text-muted)' }}>
              Ngày tạo đơn: {formatDateTime(booking.createdAt)}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {booking.paymentStatus === 'UNPAID' && booking.status !== 'CANCELLED' && booking.status !== 'EXPIRED' && (
              <Link to={`/payment/${booking._id}`} className="btn btn-primary">
                <CreditCard size={16} /> Thanh toán ngay (Hạn 1h)
              </Link>
            )}

            {booking.paymentStatus === 'DEPOSIT_PAID' && booking.status === 'CONFIRMED' && (
              <button 
                onClick={handlePayRemaining} 
                className="btn btn-primary"
                disabled={submittingRemaining}
              >
                <CreditCard size={16} /> {submittingRemaining ? 'Đang xử lý...' : `Thanh toán còn lại 80% (${formatCurrency(booking.priceDetails?.remainingAmount)})`}
              </button>
            )}

            {booking.status === 'COMPLETED' && (
              <Link to={`/account/reviews/new/${booking._id}`} className="btn btn-outline-primary">
                <Star size={16} /> Đánh giá buổi tập
              </Link>
            )}

            {canCancel && (
              <button onClick={() => setCancelModal(true)} className="btn btn-danger">
                Hủy đặt sân (Hoàn tiền 24h)
              </button>
            )}

            <Link to={`/account/complaints/new?bookingId=${booking._id}`} className="btn btn-secondary">
              <MessageSquareWarning size={16} /> Phản ánh / Khiếu nại
            </Link>
          </div>
        </div>

        {/* Thông báo thời hạn hủy 24h theo Database_Design.md v2.0 */}
        {isCancellableState && (
          <div style={{
            padding: '12px 16px',
            borderRadius: 'var(--sb-radius-md)',
            backgroundColor: isWithin24h ? 'var(--sb-primary-50)' : 'var(--sb-danger-bg)',
            color: isWithin24h ? 'var(--sb-primary-800)' : 'var(--sb-danger)',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '24px'
          }}>
            <ShieldCheck size={18} style={{ flexShrink: 0 }} />
            <div>
              {isWithin24h ? (
                <span>
                  Đơn đang trong thời hạn cho phép hủy hoàn tiền (Hạn chót: <strong>{formatDateTime(cancellationDeadline)}</strong>). Sau thời hạn này hệ thống sẽ từ chối hủy.
                </span>
              ) : (
                <span>
                  Đã quá thời hạn 24 giờ kể từ thời điểm tạo đơn (Hạn chót là {formatDateTime(cancellationDeadline)}). Đơn không thể hủy và không được hoàn tiền theo chính sách.
                </span>
              )}
            </div>
          </div>
        )}

        {/* 2 columns info */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
          {/* Thông tin sân bãi & khung giờ */}
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Thông tin sân thi đấu</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
              <div>
                <span style={{ color: 'var(--sb-text-muted)' }}>Sân:</span>{' '}
                <strong>{booking.court?.name}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--sb-text-muted)' }}>Cơ sở:</span>{' '}
                <strong>{booking.facility?.name}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--sb-text-muted)' }}>Địa chỉ:</span>{' '}
                <span>{booking.facility?.address?.detail || booking.facility?.address?.fullAddress}, {booking.facility?.address?.district}</span>
              </div>
              
              {/* Danh sách các slot thuê trong booking */}
              <div style={{ marginTop: '8px' }}>
                <span style={{ color: 'var(--sb-text-muted)', display: 'block', marginBottom: '6px' }}>Danh sách khung giờ thuê ({items.length}):</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {items.map((item, idx) => (
                    <div key={idx} style={{ padding: '8px 12px', backgroundColor: 'var(--sb-background)', borderRadius: '6px', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between' }}>
                      <span>
                        📅 {formatDate(item.bookingDate)} • {item.startAt ? item.startAt.substring(11, 16) : ''} - {item.endAt ? item.endAt.substring(11, 16) : ''} ({item.durationMinutes} phút)
                      </span>
                      <strong style={{ color: 'var(--sb-primary-700)' }}>{formatCurrency(item.amount)}</strong>
                    </div>
                  ))}
                </div>
              </div>

              {booking.note && (
                <div style={{ marginTop: '8px' }}>
                  <span style={{ color: 'var(--sb-text-muted)' }}>Ghi chú:</span>{' '}
                  <span style={{ fontStyle: 'italic' }}>{booking.note}</span>
                </div>
              )}
            </div>
          </div>

          {/* Chi tiết thanh toán snapshot theo Database_Design.md v2.0 */}
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Chi tiết chi phí & Thanh toán</h3>
            <div style={{
              backgroundColor: 'var(--sb-background)',
              borderRadius: 'var(--sb-radius-md)',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              fontSize: '0.9rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--sb-text-secondary)' }}>Tổng giá trị booking:</span>
                <span style={{ fontWeight: 600 }}>{formatCurrency(booking.priceDetails?.originalAmount || booking.priceDetails?.finalPrice)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--sb-text-secondary)' }}>Hình thức thanh toán:</span>
                <span className="badge badge-info">
                  {booking.paymentOption === 'DEPOSIT_20_PERCENT' ? 'Đặt cọc 20%' : 'Thanh toán 100%'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--sb-primary-700)' }}>
                <span>Số tiền cọc tối thiểu (20%):</span>
                <span>{formatCurrency(booking.priceDetails?.depositRequired)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--sb-success)', fontWeight: 600 }}>
                <span>Đã thanh toán thực tế:</span>
                <span>{formatCurrency(booking.priceDetails?.paidAmount || 0)}</span>
              </div>

              {booking.priceDetails?.remainingAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--sb-danger)', fontWeight: 600 }}>
                  <span>Số tiền còn lại (trả tại sân hoặc online):</span>
                  <span>{formatCurrency(booking.priceDetails?.remainingAmount)}</span>
                </div>
              )}

              {booking.payment && (
                <div style={{ fontSize: '0.8rem', color: 'var(--sb-text-muted)', borderTop: '1px solid var(--sb-border)', paddingTop: '10px', marginTop: '6px' }}>
                  <div>Phương thức: <strong>{booking.payment.method}</strong> ({booking.payment.provider || 'Nội bộ'})</div>
                  <div>Mã giao dịch: <strong style={{ fontFamily: 'monospace' }}>{booking.payment.transactionCode}</strong></div>
                  {booking.payment.paidAt && <div>Thời gian trả: {formatDateTime(booking.payment.paidAt)}</div>}
                  {booking.payment.refundedAt && <div style={{ color: 'var(--sb-info)' }}>Thời gian hoàn trả: {formatDateTime(booking.payment.refundedAt)}</div>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Hủy đặt sân */}
      <Modal
        isOpen={cancelModal}
        onClose={() => setCancelModal(false)}
        title="Xác nhận hủy đơn đặt sân (Chính sách 24h)"
      >
        <div style={{ fontSize: '0.925rem', lineHeight: 1.6, marginBottom: '16px' }}>
          Bạn có chắc chắn muốn hủy đơn đặt sân <strong>{booking.bookingCode}</strong>?
          Vì đơn của bạn vẫn đang trong hạn 24 giờ kể từ lúc tạo, toàn bộ số tiền đã thanh toán ({formatCurrency(booking.priceDetails?.paidAmount || 0)}) sẽ được tạo lệnh hoàn trả về tài khoản của bạn.
        </div>

        <div className="form-group">
          <label className="form-label">Lý do hủy đơn <span className="required">*</span></label>
          <textarea
            className="form-control"
            rows={3}
            placeholder="Ví dụ: Bận đột xuất, thời tiết xấu..."
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
          <button onClick={() => setCancelModal(false)} className="btn btn-secondary">
            Đóng
          </button>
          <button onClick={handleCancelBooking} className="btn btn-danger" disabled={submittingCancel}>
            {submittingCancel ? 'Đang xử lý...' : 'Xác nhận hủy sân & Nhận hoàn tiền'}
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default BookingDetailPage;
