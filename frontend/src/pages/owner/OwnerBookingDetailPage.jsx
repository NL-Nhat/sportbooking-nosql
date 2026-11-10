import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { bookingMockService } from '../../../mock/services/bookingMockService.js';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/formatters.js';
import { StatusBadge } from '../../components/ui/StatusBadge.jsx';
import { useToast } from '../../contexts/ToastContext.jsx';
import { ROUTES } from '../../constants/routes.js';
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  User, 
  Phone, 
  Mail, 
  Clock, 
  CreditCard 
} from 'lucide-react';

export function OwnerBookingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    bookingMockService.getById(id).then((b) => {
      setBooking(b);
      setLoading(false);
    });
  }, [id]);

  const handleUpdateStatus = async (newStatus) => {
    setProcessing(true);
    try {
      if (newStatus === 'CANCELLED') {
        await bookingMockService.cancelBooking(id, 'Chủ sân từ chối tiếp nhận đơn');
        showToast('Đã từ chối đơn đặt và giải phóng khung giờ sân.', 'info');
      } else {
        await bookingMockService.updateStatus(id, newStatus);
        showToast(`Cập nhật trạng thái đơn thành ${newStatus}!`, 'success');
      }
      const refreshed = await bookingMockService.getById(id);
      setBooking(refreshed);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '60px' }}>Đang nạp chi tiết đơn...</div>;
  }

  if (!booking) {
    return <div style={{ textAlign: 'center', padding: '60px' }}>Không tìm thấy đơn đặt sân.</div>;
  }

  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '20px' }}>
        <Link to={ROUTES.OWNER_BOOKINGS} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--sb-text-secondary)', fontWeight: 600 }}>
          <ArrowLeft size={16} /> Quay lại danh sách đơn đặt sân
        </Link>
      </div>

      <div className="card" style={{ padding: '32px', marginBottom: '24px' }}>
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
              <h1 style={{ fontSize: '1.6rem', margin: 0, fontFamily: 'monospace' }}>{booking.bookingCode}</h1>
              <StatusBadge status={booking.status} />
              <StatusBadge status={booking.paymentStatus} />
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--sb-text-muted)' }}>
              Tạo lúc: {formatDateTime(booking.createdAt)}
            </div>
          </div>

          {/* Action buttons for owner */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {(booking.status === 'PENDING_PAYMENT' || booking.status === 'PENDING') && (
              <>
                <button
                  onClick={() => handleUpdateStatus('CONFIRMED')}
                  className="btn btn-primary btn-sm"
                  disabled={processing}
                >
                  <CheckCircle size={16} /> Xác nhận đặt sân
                </button>
                <button
                  onClick={() => handleUpdateStatus('CANCELLED')}
                  className="btn btn-danger btn-sm"
                  disabled={processing}
                >
                  <XCircle size={16} /> Từ chối / Hủy đơn
                </button>
              </>
            )}

            {booking.status === 'CONFIRMED' && (
              <>
                <button
                  onClick={() => handleUpdateStatus('COMPLETED')}
                  className="btn btn-primary btn-sm"
                  disabled={processing}
                >
                  <CheckCircle size={16} /> Đánh dấu hoàn thành buổi tập
                </button>
                <button
                  onClick={() => handleUpdateStatus('CANCELLED')}
                  className="btn btn-danger btn-sm"
                  disabled={processing}
                >
                  <XCircle size={16} /> Hủy đơn
                </button>
              </>
            )}
          </div>
        </div>

        {/* 2 columns customer & court */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User size={18} color="var(--sb-primary-600)" /> Thông tin khách hàng
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
              <div>Họ tên: <strong>{booking.customer?.fullName}</strong></div>
              <div>Số điện thoại: <strong>{booking.customer?.phone || 'Chưa cung cấp'}</strong></div>
              <div>Email: <strong>{booking.customer?.email}</strong></div>
              {booking.note && (
                <div style={{ marginTop: '8px', padding: '10px', backgroundColor: 'var(--sb-background)', borderRadius: '6px', fontSize: '0.85rem' }}>
                  Ghi chú khách gửi: <em>{booking.note}</em>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '1.05rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={18} color="var(--sb-primary-600)" /> Chi tiết sân & Thanh toán (v2.0)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
              <div>Sân: <strong>{booking.court?.name}</strong></div>
              <div>Cơ sở: <strong>{booking.facility?.name}</strong></div>
              <div>Hình thức thanh toán: <strong>{booking.paymentOption === 'DEPOSIT_20_PERCENT' ? 'Cọc 20% giữ sân' : 'Thanh toán 100%'}</strong></div>
              <div>Tổng tiền gốc: <strong>{formatCurrency(booking.priceDetails?.originalAmount ?? booking.priceDetails?.finalPrice)}</strong></div>
              <div>Tiền cọc tối thiểu (20%): <strong>{formatCurrency(booking.priceDetails?.depositRequired ?? 0)}</strong></div>
              <div>Đã thu: <strong style={{ color: 'var(--sb-success)' }}>{formatCurrency(booking.priceDetails?.paidAmount ?? 0)}</strong></div>
              <div>Còn phải thu tại sân: <strong style={{ color: 'var(--sb-warning)' }}>{formatCurrency(booking.priceDetails?.remainingAmount ?? 0)}</strong></div>
              {booking.holdExpiresAt && (
                <div style={{ fontSize: '0.8rem', color: 'var(--sb-text-muted)' }}>
                  Hạn giữ chỗ (1 giờ): {formatDateTime(booking.holdExpiresAt)}
                </div>
              )}
              {booking.cancellationDeadline && (
                <div style={{ fontSize: '0.8rem', color: 'var(--sb-text-muted)' }}>
                  Hạn hủy hoàn tiền (24 giờ): {formatDateTime(booking.cancellationDeadline)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Danh sách các khung giờ (items) trong booking */}
        <div style={{ borderTop: '1px solid var(--sb-border)', paddingTop: '20px' }}>
          <h3 style={{ fontSize: '1.02rem', marginBottom: '12px' }}>
            Danh sách khung giờ đã đặt ({booking.items?.length || 1} slot • {booking.totalDurationMinutes || booking.duration || 60} phút)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(booking.items && booking.items.length > 0 ? booking.items : [{
              bookingDate: booking.bookingDate,
              startAt: booking.startAt,
              endAt: booking.endAt,
              durationMinutes: booking.duration || 60,
              amount: booking.priceDetails?.originalAmount ?? booking.priceDetails?.finalPrice
            }]).map((item, idx) => (
              <div key={idx} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 14px',
                backgroundColor: 'var(--sb-background)',
                borderRadius: '8px',
                fontSize: '0.875rem'
              }}>
                <div>
                  <strong>Slot #{idx + 1}:</strong> Ngày {formatDate(item.bookingDate)} • {item.startAt?.substring(11, 16)} - {item.endAt?.substring(11, 16)} ({item.durationMinutes} phút)
                </div>
                <div style={{ fontWeight: 700, color: 'var(--sb-primary-700)' }}>
                  {formatCurrency(item.amount || item.unitPrice)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default OwnerBookingDetailPage;
