import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { bookingMockService } from '../../../mock/services/bookingMockService.js';
import { facilityMockService } from '../../../mock/services/facilityMockService.js';
import { courtMockService } from '../../../mock/services/courtMockService.js';
import { formatCurrency, formatDate } from '../../utils/formatters.js';
import { StatusBadge } from '../../components/ui/StatusBadge.jsx';
import { ROUTES } from '../../constants/routes.js';
import { 
  DollarSign, 
  CalendarCheck2, 
  Building2, 
  Trophy, 
  TrendingUp, 
  Plus, 
  ArrowRight,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';

export function OwnerDashboardPage() {
  const { user } = useAuth();
  const [facilities, setFacilities] = useState([]);
  const [courts, setCourts] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      Promise.all([
        facilityMockService.getByOwner(user._id),
        courtMockService.getByOwner(user._id),
        bookingMockService.getOwnerBookings(user._id)
      ]).then(([facList, courtList, bookingList]) => {
        setFacilities(facList);
        setCourts(courtList);
        setBookings(bookingList);
        setLoading(false);
      });
    }
  }, [user]);

  // Tính toán KPI từ mock data thực tế
  const totalRevenue = bookings
    .filter((b) => b.paymentStatus === 'PAID')
    .reduce((sum, b) => sum + (b.priceDetails?.finalPrice || 0), 0);

  const pendingBookings = bookings.filter((b) => b.status === 'PENDING_PAYMENT');
  const completedBookings = bookings.filter((b) => b.status === 'COMPLETED');

  // Doanh thu theo tháng mô phỏng biểu đồ cột
  const monthlyRevenue = [
    { month: 'T8', amount: 12500000 },
    { month: 'T9', amount: 16800000 },
    { month: 'T10', amount: 24200000 },
    { month: 'T11 (Hiện tại)', amount: totalRevenue }
  ];

  const maxAmount = Math.max(...monthlyRevenue.map(m => m.amount), 30000000);

  return (
    <div>
      {/* Top Header */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '28px',
        gap: '16px'
      }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '6px' }}>Tổng quan cơ sở của bạn</h1>
          <p style={{ color: 'var(--sb-text-secondary)' }}>
            Theo dõi doanh thu, tiếp nhận đơn đặt sân mới và quản lý hoạt động thời gian thực
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to={ROUTES.OWNER_COURT_NEW} className="btn btn-primary btn-sm">
            <Plus size={16} /> Thêm sân mới
          </Link>
          <Link to={ROUTES.OWNER_FACILITY_NEW} className="btn btn-secondary btn-sm">
            <Plus size={16} /> Tạo cơ sở mới
          </Link>
        </div>
      </div>

      {/* KPI Cards (Tối đa 4 cards/hàng) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.825rem', color: 'var(--sb-text-muted)', fontWeight: 600 }}>Tổng doanh thu thực nhận</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'var(--sb-primary-50)', color: 'var(--sb-primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--sb-primary-900)' }}>
            {formatCurrency(totalRevenue)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--sb-success)', marginTop: '4px', fontWeight: 600 }}>
            ↑ 18.5% so với tháng trước
          </div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.825rem', color: 'var(--sb-text-muted)', fontWeight: 600 }}>Tổng đơn đặt sân</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'var(--sb-info-bg)', color: 'var(--sb-info)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CalendarCheck2 size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--sb-primary-900)' }}>
            {bookings.length} đơn
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--sb-text-muted)', marginTop: '4px' }}>
            {pendingBookings.length} đơn đang chờ duyệt
          </div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.825rem', color: 'var(--sb-text-muted)', fontWeight: 600 }}>Cơ sở thể thao</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'var(--sb-warning-bg)', color: 'var(--sb-warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--sb-primary-900)' }}>
            {facilities.length} cơ sở
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--sb-success)', marginTop: '4px' }}>
            Đã duyệt & đang nhận khách
          </div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.825rem', color: 'var(--sb-text-muted)', fontWeight: 600 }}>Số lượng sân</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'var(--sb-primary-100)', color: 'var(--sb-primary-700)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Trophy size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--sb-primary-900)' }}>
            {courts.length} sân
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--sb-text-muted)', marginTop: '4px' }}>
            Bóng đá, cầu lông, tennis, pickleball
          </div>
        </div>
      </div>

      {/* Middle Section: Doanh thu Biểu đồ và Lối tắt */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '24px',
        marginBottom: '32px'
      }} className="owner-dash-middle">
        {/* Doanh thu theo tháng */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.15rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={18} color="var(--sb-primary-600)" /> Biểu đồ doanh thu 4 tháng gần nhất
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--sb-text-muted)' }}>Đơn vị: VNĐ</span>
          </div>

          <div style={{
            height: '200px',
            display: 'flex',
            alignItems: 'flex-end',
            gap: '24px',
            paddingTop: '20px',
            borderBottom: '1px solid var(--sb-border)',
            paddingBottom: '10px'
          }}>
            {monthlyRevenue.map((item, idx) => {
              const heightPct = Math.round((item.amount / maxAmount) * 100);
              return (
                <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', height: '100%', justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--sb-primary-800)' }}>
                    {formatCurrency(item.amount)}
                  </span>
                  <div style={{
                    width: '100%',
                    maxWidth: '48px',
                    height: `${heightPct}%`,
                    backgroundColor: idx === 3 ? 'var(--sb-primary-600)' : 'var(--sb-primary-100)',
                    borderRadius: '6px 6px 0 0',
                    transition: 'height 400ms ease'
                  }} />
                  <span style={{ fontSize: '0.8rem', color: 'var(--sb-text-secondary)', fontWeight: 600 }}>
                    {item.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Phím tắt quản lý */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '16px' }}>Thao tác nhanh</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link to={ROUTES.OWNER_CALENDAR} className="btn btn-secondary" style={{ justifyContent: 'space-between' }}>
              <span>Lịch biểu đặt sân trực quan</span> <ArrowRight size={16} />
            </Link>
            <Link to={ROUTES.OWNER_OPERATING_HOURS} className="btn btn-secondary" style={{ justifyContent: 'space-between' }}>
              <span>Cấu hình khung giờ hoạt động hằng ngày</span> <ArrowRight size={16} />
            </Link>
            <Link to={ROUTES.OWNER_PRICING} className="btn btn-secondary" style={{ justifyContent: 'space-between' }}>
              <span>Quản lý quy tắc giá giờ vàng</span> <ArrowRight size={16} />
            </Link>
            <Link to={ROUTES.OWNER_BLOCKED_SLOTS} className="btn btn-secondary" style={{ justifyContent: 'space-between' }}>
              <span>Khóa sân / Đặt lịch bảo trì</span> <ArrowRight size={16} />
            </Link>
            <Link to="/owner/calendar" className="btn btn-secondary" style={{ justifyContent: 'space-between' }}>
              <span>Xem lịch đặt sân</span> <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      {/* Đơn đặt sân gần đây */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Đơn đặt sân mới nhất tại cơ sở</h3>
          <Link to={ROUTES.OWNER_BOOKINGS} style={{ fontSize: '0.85rem', color: 'var(--sb-primary-700)', fontWeight: 600 }}>
            Xem toàn bộ ({bookings.length})
          </Link>
        </div>

        <div className="table-wrapper">
          <table className="sb-table">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Sân thi đấu</th>
                <th>Ngày & Khung giờ</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {bookings.slice(0, 5).map((b) => (
                <tr key={b._id}>
                  <td style={{ fontWeight: 700, fontFamily: 'monospace' }}>{b.bookingCode}</td>
                  <td>{b.customer?.fullName || 'Khách vãng lai'}</td>
                  <td>{b.court?.name}</td>
                  <td>
                    <div>{formatDate(b.bookingDate)}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--sb-text-muted)' }}>
                      {b.startAt?.substring(11, 16)} - {b.endAt?.substring(11, 16)}
                    </div>
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--sb-primary-700)' }}>
                    {formatCurrency(b.priceDetails?.finalPrice)}
                  </td>
                  <td>
                    <StatusBadge status={b.status} />
                  </td>
                  <td>
                    <Link to={`/owner/bookings/${b._id}`} className="btn btn-secondary btn-sm">
                      Chi tiết
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        @media (max-width: 960px) {
          .owner-dash-middle {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

export default OwnerDashboardPage;
