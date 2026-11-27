import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { ownerBookingService } from '../../services/ownerBookingService.js';
import { ownerCourtService } from '../../services/ownerCourtService.js';
import { ownerFacilityService } from '../../services/ownerFacilityService.js';
import { formatCurrency, formatDate } from '../../utils/formatters.js';
import { StatusBadge } from '../../components/ui/StatusBadge.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { Search, Clock, Eye, AlertCircle, RefreshCw, CalendarCheck2 } from 'lucide-react';

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

export function OwnerBookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [courts, setCourts] = useState([]);
  const [selectedFacility, setSelectedFacility] = useState('');
  const [selectedCourt, setSelectedCourt] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!user) return;
    Promise.all([
      ownerFacilityService.getMyFacilities().catch(() => []),
      ownerCourtService.getMyCourts().catch(() => [])
    ]).then(([facList, courtList]) => {
      setFacilities(facList);
      setCourts(courtList);
    });
  }, [user]);

  const fetchBookings = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setErrorMessage('');
    try {
      const list = await ownerBookingService.getOwnerBookings({
        facilityId: selectedFacility,
        courtId: selectedCourt,
        bookingDate,
        paymentStatus: paymentFilter
      });
      setBookings(list);
    } catch (err) {
      setErrorMessage(err?.message || 'Không thể tải danh sách đơn đặt sân từ máy chủ.');
    } finally {
      setLoading(false);
    }
  }, [user, selectedFacility, selectedCourt, bookingDate, paymentFilter]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const availableCourts = selectedFacility
    ? courts.filter((c) => c.facilityId === selectedFacility)
    : courts;

  const filtered = bookings.filter((b) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    const matchCode = b.bookingCode?.toLowerCase().includes(q);
    const matchName = b.customer?.fullName?.toLowerCase().includes(q);
    const matchPhone = b.customer?.phone?.toLowerCase().includes(q);
    return Boolean(matchCode || matchName || matchPhone);
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
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center' }}>
          <div style={{ flex: '1 1 220px', position: 'relative' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Tìm mã đơn, tên hoặc SĐT khách..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingRight: '36px' }}
            />
            <Search
              size={16}
              style={{ position: 'absolute', right: '12px', top: '14px', color: 'var(--sb-text-muted)' }}
            />
          </div>

          <div style={{ flex: '0 0 210px' }}>
            <select
              className="form-control"
              value={selectedFacility}
              onChange={(e) => {
                setSelectedFacility(e.target.value);
                setSelectedCourt('');
              }}
            >
              <option value="">Tất cả cơ sở</option>
              {facilities.map((f) => {
                const fId = f.id || f._id;
                return (
                  <option key={fId} value={fId}>
                    {f.name}
                  </option>
                );
              })}
            </select>
          </div>

          <div style={{ flex: '0 0 210px' }}>
            <select
              className="form-control"
              value={selectedCourt}
              onChange={(e) => setSelectedCourt(e.target.value)}
            >
              <option value="">Tất cả các sân</option>
              {availableCourts.map((c) => {
                const cId = c.id || c._id;
                return (
                  <option key={cId} value={cId}>
                    {c.name}
                  </option>
                );
              })}
            </select>
          </div>

          <div style={{ flex: '0 0 180px' }}>
            <input
              type="date"
              className="form-control"
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              title="Lọc theo ngày đặt sân"
            />
          </div>

          <div style={{ flex: '0 0 210px' }}>
            <select
              className="form-control"
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
            >
              <option value="ALL">Tất cả thanh toán</option>
              <option value="UNPAID">Chưa thanh toán</option>
              <option value="DEPOSIT_PAID">Đã cọc 20%</option>
              <option value="PAID">Đã thanh toán 100%</option>
              <option value="REFUNDED">Đã hoàn tiền</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>Đang nạp danh sách đơn đặt sân từ máy chủ...</div>
      ) : errorMessage ? (
        <div className="card" style={{ padding: '32px', textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'var(--sb-danger-bg)',
              color: 'var(--sb-danger)',
              marginBottom: '12px'
            }}
          >
            <AlertCircle size={24} />
          </div>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Không thể tải danh sách đơn đặt sân</h3>
          <p style={{ color: 'var(--sb-text-secondary)', marginBottom: '16px' }}>{errorMessage}</p>
          <button type="button" onClick={fetchBookings} className="btn btn-primary btn-sm">
            <RefreshCw size={15} /> Thử lại
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={CalendarCheck2}
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
                  <th>Trạng thái đơn</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => {
                  const bookingId = b.id || b._id;
                  const slotBadges =
                    Array.isArray(b.timeSlotRanges) && b.timeSlotRanges.length > 0
                      ? b.timeSlotRanges
                      : Array.isArray(b.items) && b.items.length > 0
                        ? b.items.map(formatSlotRangeFromItem)
                        : ['—'];

                  return (
                    <tr key={bookingId}>
                      <td style={{ fontWeight: 800, fontFamily: 'monospace' }}>{b.bookingCode}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{b.customer?.fullName || 'Khách hàng'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--sb-text-muted)' }}>
                          {b.customer?.phone || '—'}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{b.court?.name || 'Sân thể thao'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--sb-text-muted)' }}>
                          {b.facility?.name || ''}
                        </div>
                      </td>
                      <td>{formatDate(b.bookingDate || b.items?.[0]?.bookingDate)}</td>
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
                          {formatCurrency(b.priceDetails?.originalAmount ?? 0)}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--sb-text-muted)' }}>
                          Đã thu: {formatCurrency(b.priceDetails?.paidAmount ?? 0)}
                        </div>
                      </td>
                      <td>
                        <StatusBadge status={b.paymentStatus} />
                      </td>
                      <td>
                        <StatusBadge status={b.status} />
                      </td>
                      <td>
                        <Link to={`/owner/bookings/${bookingId}`} className="btn btn-secondary btn-sm">
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
