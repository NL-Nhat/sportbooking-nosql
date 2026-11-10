import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { bookingMockService } from '../../../mock/services/bookingMockService.js';
import { formatCurrency, formatDate, formatBookingTimeSlots } from '../../utils/formatters.js';
import { StatusBadge } from '../../components/ui/StatusBadge.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { Search, Calendar, Clock, ArrowRight, Star, AlertCircle } from 'lucide-react';

export function BookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setLoading(true);
      bookingMockService.getMyBookings(user._id).then((list) => {
        setBookings(list);
        setLoading(false);
      });
    }
  }, [user]);

  const tabs = [
    { key: 'ALL', label: 'Tất cả' },
    { key: 'CONFIRMED', label: 'Đã xác nhận' },
    { key: 'PENDING_PAYMENT', label: 'Chờ thanh toán' },
    { key: 'COMPLETED', label: 'Đã hoàn thành' },
    { key: 'CANCELLED', label: 'Đã hủy' },
    { key: 'EXPIRED', label: 'Hết hạn giữ chỗ' }
  ];

  const filtered = bookings.filter((b) => {
    const matchTab = activeTab === 'ALL' || b.status === activeTab;
    const matchSearch = search.trim() === '' || b.bookingCode.toLowerCase().includes(search.toLowerCase()) || (b.court?.name && b.court.name.toLowerCase().includes(search.toLowerCase()));
    return matchTab && matchSearch;
  });

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.65rem', marginBottom: '6px' }}>Lịch sử đặt sân của tôi</h1>
        <p>Theo dõi tiến độ, kiểm tra hóa đơn và đánh giá chất lượng buổi tập</p>
      </div>

      {/* Controls: Search and Tabs */}
      <div className="card" style={{ padding: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`btn btn-sm ${activeTab === t.key ? 'btn-primary' : 'btn-secondary'}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div style={{ position: 'relative', minWidth: '220px' }}>
            <input
              type="text"
              className="form-control"
              style={{ height: '36px', fontSize: '0.825rem', paddingRight: '32px' }}
              placeholder="Tìm mã BK... hoặc tên sân"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search size={15} style={{ position: 'absolute', right: '10px', top: '11px', color: 'var(--sb-text-muted)' }} />
          </div>
        </div>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>Đang tải danh sách đặt sân...</div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Không tìm thấy đơn đặt sân nào"
          description="Bạn chưa có đơn đặt sân nào ở trạng thái này."
          action={
            <Link to="/search" className="btn btn-primary btn-sm">
              Tìm và đặt sân ngay
            </Link>
          }
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filtered.map((b) => (
            <div key={b._id} className="card card-hover" style={{ padding: '20px' }}>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid var(--sb-border)',
                paddingBottom: '14px',
                marginBottom: '16px',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.95rem', fontFamily: 'monospace', color: 'var(--sb-primary-900)' }}>
                    {b.bookingCode}
                  </span>
                  <StatusBadge status={b.status} />
                  <StatusBadge status={b.paymentStatus} />
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--sb-text-muted)' }}>
                  Ngày tạo đơn: {formatDate(b.createdAt)}
                </div>
              </div>

              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '20px'
              }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', margin: '0 0 6px' }}>
                    <Link to={`/account/bookings/${b._id}`} style={{ color: 'var(--sb-text-primary)' }}>
                      {b.court?.name}
                    </Link>
                  </h3>
                  <div style={{ fontSize: '0.875rem', color: 'var(--sb-text-secondary)', marginBottom: '8px' }}>
                    Cơ sở: <strong>{b.facility?.name}</strong> ({b.facility?.address?.district})
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '16px', fontSize: '0.825rem', color: 'var(--sb-text-muted)' }}>
                    <span><Calendar size={14} style={{ display: 'inline', verticalAlign: 'text-top' }} /> {formatDate(b.items?.[0]?.bookingDate || b.bookingDate)}</span>
                    <span>
                      <Clock size={14} style={{ display: 'inline', verticalAlign: 'text-top' }} />{' '}
                      Khung giờ: <strong style={{ color: 'var(--sb-primary-700)' }}>{formatBookingTimeSlots(b)}</strong> ({b.totalDurationMinutes || b.duration} phút)
                    </span>
                  </div>
                </div>

                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--sb-primary-700)' }}>
                    {formatCurrency(b.priceDetails?.originalAmount ?? b.priceDetails?.finalPrice)}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--sb-text-secondary)' }}>
                    Đã trả: <strong>{formatCurrency(b.priceDetails?.paidAmount ?? 0)}</strong> • Còn lại: <strong>{formatCurrency(b.priceDetails?.remainingAmount ?? 0)}</strong>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    {b.status === 'COMPLETED' && (
                      <Link to={`/account/reviews/new/${b._id}`} className="btn btn-outline-primary btn-sm">
                        <Star size={14} /> Viết đánh giá
                      </Link>
                    )}
                    <Link to={`/account/bookings/${b._id}`} className="btn btn-primary btn-sm">
                      Chi tiết đơn
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BookingsPage;
