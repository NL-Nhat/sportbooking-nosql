import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { bookingMockService } from '../../../mock/services/bookingMockService.js';
import { notificationMockService } from '../../../mock/services/notificationMockService.js';
import { formatCurrency, formatDate } from '../../utils/formatters.js';
import { StatusBadge } from '../../components/ui/StatusBadge.jsx';
import { ROUTES } from '../../constants/routes.js';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  ArrowRight, 
  Bell, 
  Building2, 
  Heart,
  ChevronRight
} from 'lucide-react';

export function AccountOverviewPage() {
  const { user } = useAuth();
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [recentNotifs, setRecentNotifs] = useState([]);

  useEffect(() => {
    if (user) {
      bookingMockService.getMyBookings(user._id).then((list) => {
        setUpcomingBookings(list.slice(0, 3));
      });
      notificationMockService.getByUser(user._id).then((notifs) => {
        setRecentNotifs(notifs.slice(0, 4));
      });
    }
  }, [user]);

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.65rem', marginBottom: '6px' }}>Xin chào, {user?.fullName}!</h1>
        <p>Quản lý hoạt động thể thao và đơn đặt sân của bạn</p>
      </div>

      {/* Quick stats grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '28px'
      }}>
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ color: 'var(--sb-text-muted)', fontSize: '0.8rem', marginBottom: '4px' }}>Đơn sắp tới</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--sb-primary-700)' }}>
            {upcomingBookings.length}
          </div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ color: 'var(--sb-text-muted)', fontSize: '0.8rem', marginBottom: '4px' }}>Trạng thái tài khoản</div>
          <div style={{ marginTop: '4px' }}>
            <StatusBadge status={user?.status} />
          </div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ color: 'var(--sb-text-muted)', fontSize: '0.8rem', marginBottom: '4px' }}>Vai trò Chủ sân (Owner)</div>
          <div style={{ marginTop: '4px' }}>
            <StatusBadge status={user?.ownerStatus} />
          </div>
        </div>
      </div>

      {/* Upcoming bookings section */}
      <div className="card" style={{ padding: '24px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={20} color="var(--sb-primary-600)" /> Lịch thi đấu gần đây
          </h3>
          <Link to={ROUTES.BOOKINGS} style={{ fontSize: '0.85rem', color: 'var(--sb-primary-700)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            Xem tất cả ({upcomingBookings.length}) <ChevronRight size={16} />
          </Link>
        </div>

        {upcomingBookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--sb-text-muted)' }}>
            Bạn chưa có đơn đặt sân nào. Hãy tìm sân và lên lịch thi đấu cùng bạn bè ngay hôm nay!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {upcomingBookings.map((b) => (
              <div key={b._id} style={{
                padding: '16px',
                borderRadius: 'var(--sb-radius-md)',
                backgroundColor: 'var(--sb-background)',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', fontFamily: 'monospace' }}>{b.bookingCode}</span>
                    <StatusBadge status={b.status} />
                    <StatusBadge status={b.paymentStatus} />
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--sb-text-primary)' }}>
                    {b.court?.name} • {b.facility?.name}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--sb-text-muted)', display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                    <span><Calendar size={13} style={{ display: 'inline', verticalAlign: 'text-top' }} /> {formatDate(b.items?.[0]?.bookingDate || b.bookingDate)}</span>
                    <span><Clock size={13} style={{ display: 'inline', verticalAlign: 'text-top' }} /> {b.items?.length ? `${b.items.length} slot (${b.totalDurationMinutes || b.duration} phút)` : `${b.startAt?.substring(11, 16)} - ${b.endAt?.substring(11, 16)}`}</span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, color: 'var(--sb-primary-700)', fontSize: '1rem', marginBottom: '6px' }}>
                    {formatCurrency(b.priceDetails?.originalAmount ?? b.priceDetails?.finalPrice)}
                  </div>
                  <Link to={`/account/bookings/${b._id}`} className="btn btn-secondary btn-sm">
                    Xem chi tiết
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Thông báo gần đây */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={20} color="var(--sb-primary-600)" /> Thông báo mới nhất
          </h3>
          <Link to={ROUTES.NOTIFICATIONS} style={{ fontSize: '0.85rem', color: 'var(--sb-primary-700)', fontWeight: 600 }}>
            Xem tất cả
          </Link>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {recentNotifs.map((n) => (
            <div key={n._id} style={{
              padding: '12px',
              borderBottom: '1px solid var(--sb-border-subtle)',
              display: 'flex',
              alignItems: 'start',
              gap: '12px'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: n.isRead ? 'transparent' : 'var(--sb-primary-600)',
                marginTop: '6px'
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--sb-text-primary)' }}>{n.title}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--sb-text-secondary)', marginTop: '2px' }}>{n.message}</div>
              </div>
              <div style={{ fontSize: '0.725rem', color: 'var(--sb-text-muted)' }}>
                {formatDate(n.createdAt)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AccountOverviewPage;
