import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ownerBookingService } from '../../services/ownerBookingService.js';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/formatters.js';
import { StatusBadge } from '../../components/ui/StatusBadge.jsx';
import { useToast } from '../../contexts/ToastContext.jsx';
import { ROUTES } from '../../constants/routes.js';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  User,
  Clock,
  CreditCard,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

const formatSlotRangeFromItem = (item) => {
  if (!item?.startAt || !item?.endAt) return '—';
  const fmt = (iso) => {
    const d = new Date(iso);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
    }
    return String(iso).substring(11, 16);
  };
  return `${fmt(item.startAt)} - ${fmt(item.endAt)}`;
};

export function OwnerBookingDetailPage() {
  const { id } = useParams();
  const { showToast } = useToast();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchBookingDetail = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setErrorMessage('');
    try {
      const data = await ownerBookingService.getOwnerBookingDetail(id);
      setBooking(data);
    } catch (err) {
      setErrorMessage(err?.message || 'Không thể tải thông tin chi tiết đơn đặt sân.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBookingDetail();
  }, [fetchBookingDetail]);

  const handleCollectRemaining = async () => {
    if (!booking) return;
    const remaining = Number(booking.priceDetails?.remainingAmount ?? 0);
    const confirmed = window.confirm(
      `Xác nhận đã thu đủ số tiền còn lại ${formatCurrency(remaining)} tại sân cho đơn ${booking.bookingCode}?`
    );
    if (!confirmed) return;

    setProcessing(true);
    try {
      const updated = await ownerBookingService.collectRemainingPayment(booking.id || booking._id, 'CASH');
      setBooking(updated);
      showToast('Đã xác nhận thu đủ phần tiền 80% còn lại tại sân thành công!', 'success');
    } catch (err) {
      showToast(err?.message || 'Không thể xác nhận thu tiền còn lại.', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleCompleteBooking = async () => {
    if (!booking) return;
    const confirmed = window.confirm(
      `Xác nhận đánh dấu đơn đặt sân ${booking.bookingCode} đã hoàn thành buổi tập?`
    );
    if (!confirmed) return;

    setProcessing(true);
    try {
      const updated = await ownerBookingService.completeBooking(booking.id || booking._id);
      setBooking(updated);
      showToast('Đã đánh dấu hoàn thành đơn đặt sân thành công!', 'success');
    } catch (err) {
      showToast(err?.message || 'Không thể đánh dấu hoàn thành đơn đặt sân.', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!booking) return;
    const reasonInput = window.prompt(
      `Nhập lý do hủy đơn đặt sân ${booking.bookingCode} (các khung giờ sẽ được giải phóng sang trạng thái trống):`,
      'Sân cần bảo trì đột xuất'
    );
    if (reasonInput === null) return;

    setProcessing(true);
    try {
      const updated = await ownerBookingService.cancelBookingByOwner(
        booking.id || booking._id,
        reasonInput.trim() || 'Chủ sân hủy đơn đặt sân'
      );
      setBooking(updated);
      showToast('Đã hủy đơn đặt sân và giải phóng khung giờ thành công!', 'info');
    } catch (err) {
      showToast(err?.message || 'Không thể hủy đơn đặt sân.', 'error');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '60px' }}>Đang nạp chi tiết đơn đặt sân từ máy chủ...</div>;
  }

  if (errorMessage || !booking) {
    return (
      <div className="card" style={{ padding: '40px', textAlign: 'center', maxWidth: '580px', margin: '24px auto' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            backgroundColor: 'var(--sb-danger-bg)',
            color: 'var(--sb-danger)',
            marginBottom: '12px'
          }}
        >
          <AlertCircle size={26} />
        </div>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Không tìm thấy đơn đặt sân</h2>
        <p style={{ color: 'var(--sb-text-secondary)', marginBottom: '20px' }}>
          {errorMessage || 'Đơn đặt sân không tồn tại hoặc không thuộc cơ sở của bạn.'}
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
          <Link to={ROUTES.OWNER_BOOKINGS} className="btn btn-secondary btn-sm">
            <ArrowLeft size={15} /> Quay lại danh sách đơn
          </Link>
          <button type="button" onClick={fetchBookingDetail} className="btn btn-primary btn-sm">
            <RefreshCw size={15} /> Thử lại
          </button>
        </div>
      </div>
    );
  }

  const items = Array.isArray(booking.items) ? booking.items : [];

  return (
    <div style={{ maxWidth: '840px' }}>
      <div style={{ marginBottom: '20px' }}>
        <Link
          to={ROUTES.OWNER_BOOKINGS}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.85rem',
            color: 'var(--sb-text-secondary)',
            fontWeight: 600
          }}
        >
          <ArrowLeft size={16} /> Quay lại danh sách đơn đặt sân
        </Link>
      </div>

      <div className="card" style={{ padding: '32px', marginBottom: '24px' }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--sb-border)',
            paddingBottom: '20px',
            marginBottom: '24px',
            gap: '16px'
          }}
        >
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

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {booking.status !== 'CANCELLED' &&
              booking.status !== 'EXPIRED' &&
              booking.paymentStatus !== 'PAID' &&
              Number(booking.priceDetails?.remainingAmount ?? 0) > 0 && (
                <button
                  type="button"
                  onClick={handleCollectRemaining}
                  className="btn btn-primary btn-sm"
                  disabled={processing}
                >
                  <CreditCard size={16} /> Thu {formatCurrency(booking.priceDetails?.remainingAmount ?? 0)} còn lại tại sân
                </button>
              )}

            {booking.status === 'CONFIRMED' && (
              <button
                type="button"
                onClick={handleCompleteBooking}
                className="btn btn-primary btn-sm"
                disabled={processing}
              >
                <CheckCircle size={16} /> Đánh dấu hoàn thành buổi tập
              </button>
            )}

            {(booking.status === 'PENDING_PAYMENT' ||
              booking.status === 'PENDING' ||
              booking.status === 'CONFIRMED') && (
              <button
                type="button"
                onClick={handleCancelBooking}
                className="btn btn-danger btn-sm"
                disabled={processing}
              >
                <XCircle size={16} /> Hủy đơn đặt sân
              </button>
            )}
          </div>
        </div>

        {/* 2 columns customer & court */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '24px' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User size={18} color="var(--sb-primary-600)" /> Thông tin khách hàng
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
              <div>
                Họ tên: <strong>{booking.customer?.fullName || 'Khách hàng'}</strong>
              </div>
              <div>
                Số điện thoại: <strong>{booking.customer?.phone || 'Chưa cung cấp'}</strong>
              </div>
              <div>
                Email: <strong>{booking.customer?.email || '—'}</strong>
              </div>
              {booking.note && (
                <div
                  style={{
                    marginTop: '8px',
                    padding: '10px',
                    backgroundColor: 'var(--sb-background)',
                    borderRadius: '6px',
                    fontSize: '0.85rem'
                  }}
                >
                  Ghi chú khách gửi: <em>{booking.note}</em>
                </div>
              )}
              {booking.cancelReason && (
                <div
                  style={{
                    marginTop: '8px',
                    padding: '10px',
                    backgroundColor: 'var(--sb-danger-bg)',
                    color: 'var(--sb-danger)',
                    borderRadius: '6px',
                    fontSize: '0.85rem'
                  }}
                >
                  Lý do hủy đơn: <strong>{booking.cancelReason}</strong>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '1.05rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={18} color="var(--sb-primary-600)" /> Chi tiết sân & Thanh toán
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
              <div>
                Sân: <strong>{booking.court?.name || 'Sân thể thao'}</strong>
              </div>
              <div>
                Cơ sở: <strong>{booking.facility?.name || 'Cơ sở thể thao'}</strong>
              </div>
              <div>
                Hình thức thanh toán:{' '}
                <strong>
                  {booking.paymentOption === 'DEPOSIT_20_PERCENT' ? 'Cọc 20% giữ sân' : 'Thanh toán 100%'}
                </strong>
              </div>
              <div>
                Tổng tiền đơn đặt: <strong>{formatCurrency(booking.priceDetails?.originalAmount ?? 0)}</strong>
              </div>
              <div>
                Tiền cọc tối thiểu (20%): <strong>{formatCurrency(booking.priceDetails?.depositRequired ?? 0)}</strong>
              </div>
              <div>
                Đã thu:{' '}
                <strong style={{ color: 'var(--sb-success)' }}>
                  {formatCurrency(booking.priceDetails?.paidAmount ?? 0)}
                </strong>
              </div>
              <div>
                Còn phải thu tại sân:{' '}
                <strong style={{ color: 'var(--sb-warning)' }}>
                  {formatCurrency(booking.priceDetails?.remainingAmount ?? 0)}
                </strong>
              </div>
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
            Danh sách khung giờ đã đặt ({items.length} ca • {booking.totalDurationMinutes || 0} phút)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {items.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 14px',
                  backgroundColor: 'var(--sb-background)',
                  borderRadius: '8px',
                  fontSize: '0.875rem'
                }}
              >
                <div>
                  <strong>Ca #{idx + 1}:</strong> Ngày {formatDate(item.bookingDate)} •{' '}
                  {formatSlotRangeFromItem(item)} ({item.durationMinutes} phút)
                </div>
                <div style={{ fontWeight: 700, color: 'var(--sb-primary-700)' }}>
                  {formatCurrency(item.amount ?? item.unitPrice ?? 0)}
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
