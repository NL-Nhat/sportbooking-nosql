import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { bookingMockService } from '../../../mock/services/bookingMockService.js';
import { courtMockService } from '../../../mock/services/courtMockService.js';
import { formatCurrency, formatDate, formatBookingTimeSlots } from '../../utils/formatters.js';
import { StatusBadge } from '../../components/ui/StatusBadge.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { Search, Clock, Eye } from 'lucide-react';

export function OwnerBookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [courts, setCourts] = useState([]);
  const [selectedCourt, setSelectedCourt] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      Promise.all([
        bookingMockService.getOwnerBookings(user._id),
        courtMockService.getByOwner(user._id)
      ]).then(([bList, cList]) => {
        setBookings(bList);
        setCourts(cList);
        setLoading(false);
      });
    }
  }, [user]);

  const filtered = bookings.filter((b) => {
    const matchCourt = selectedCourt === '' || b.courtId === selectedCourt;
    const matchPayment = paymentFilter === 'ALL' || b.paymentStatus === paymentFilter;
    const matchSearch =
      search.trim() === '' ||
      b.bookingCode.toLowerCase().includes(search.toLowerCase()) ||
      (b.customer?.fullName && b.customer.fullName.toLowerCase().includes(search.toLowerCase()));
    return matchCourt && matchPayment && matchSearch;
  });

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.65rem', marginBottom: '6px' }}>Quản lý đơn đặt sân</h1>
        <p style={{ color: 'var(--sb-text-secondary)' }}>
          Theo dõi lịch đặt sân theo khung giờ cụ thể và tình trạng thanh toán của khách hàng
        </p>
      </div>

      {/* Filter bar */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
          <div style={{ flex: '1 1 200px', position: 'relative' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Tìm mã đơn hoặc tên khách..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingRight: '36px' }}
            />
            <Search size={16} style={{ position: 'absolute', right: '12px', top: '14px', color: 'var(--sb-text-muted)' }} />
          </div>

          <div style={{ flex: '0 0 220px' }}>
            <select
              className="form-control"
              value={selectedCourt}
              onChange={(e) => setSelectedCourt(e.target.value)}
            >
              <option value="">Tất cả các sân</option>
              {courts.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div style={{ flex: '0 0 220px' }}>
            <select
              className="form-control"
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
            >
              <option value="ALL">Tất cả thanh toán</option>
              <option value="UNPAID">Chưa thanh toán (UNPAID)</option>
              <option value="DEPOSIT_PAID">Đã cọc 20% (DEPOSIT_PAID)</option>
              <option value="PAID">Đã thanh toán 100% (PAID)</option>
              <option value="REFUNDED">Đã hoàn tiền (REFUNDED)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bookings Table (Đã xóa cột Trạng thái và hiển thị rõ từng khung giờ đặt sân) */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>Đang nạp danh sách đơn đặt...</div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Không tìm thấy đơn đặt sân"
          description="Chưa có khách đặt sân theo tiêu chí tìm kiếm này."
        />
      ) : (
        <div className="card" style={{ padding: '24px' }}>
          <div className="table-wrapper">
            <table className="sb-table">
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Khách đặt sân</th>
                  <th>Sân thi đấu</th>
                  <th>Ngày thi đấu</th>
                  <th>Khung giờ đặt sân</th>
                  <th>Tổng tiền</th>
                  <th>Thanh toán</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => {
                  const slotBadges = Array.isArray(b.items) && b.items.length > 0
                    ? b.items.map((it) => `${String(it.startAt).substring(11, 16)} - ${String(it.endAt).substring(11, 16)}`)
                    : [formatBookingTimeSlots(b)];

                  return (
                    <tr key={b._id}>
                      <td style={{ fontWeight: 800, fontFamily: 'monospace' }}>{b.bookingCode}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{b.customer?.fullName || 'Khách vãng lai'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--sb-text-muted)' }}>{b.customer?.phone}</div>
                      </td>
                      <td>{b.court?.name}</td>
                      <td>{formatDate(b.items?.[0]?.bookingDate || b.bookingDate)}</td>
                      <td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {slotBadges.map((slotStr, idx) => (
                            <span
                              key={idx}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '3px 8px',
                                backgroundColor: 'var(--sb-primary-50)',
                                color: 'var(--sb-primary-700)',
                                borderRadius: '6px',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                border: '1px solid var(--sb-primary-200)'
                              }}
                            >
                              <Clock size={12} /> {slotStr}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--sb-primary-700)' }}>
                          {formatCurrency(b.priceDetails?.originalAmount ?? b.priceDetails?.finalPrice)}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--sb-text-muted)' }}>
                          Đã thu: {formatCurrency(b.priceDetails?.paidAmount ?? 0)}
                        </div>
                      </td>
                      <td><StatusBadge status={b.paymentStatus} /></td>
                      <td>
                        <Link to={`/owner/bookings/${b._id}`} className="btn btn-secondary btn-sm">
                          <Eye size={14} /> Chi tiết
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default OwnerBookingsPage;
