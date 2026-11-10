import React from 'react';
import { Outlet, NavLink, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { PublicHeader } from '../components/common/PublicHeader.jsx';
import { PublicFooter } from '../components/common/PublicFooter.jsx';
import { DemoAccountSwitcher } from '../components/common/DemoAccountSwitcher.jsx';
import { ROUTES } from '../constants/routes.js';
import { 
  User, 
  Calendar, 
  Heart, 
  Bell, 
  Star, 
  MessageSquareWarning, 
  Building2, 
  LayoutDashboard,
  ShieldCheck,
  Laptop
} from 'lucide-react';

export function CustomerLayout() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: '60px', textAlign: 'center' }}>Đang tải thông tin tài khoản...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  const navItems = [
    { label: 'Tổng quan tài khoản', path: ROUTES.ACCOUNT, icon: LayoutDashboard },
    { label: 'Hồ sơ cá nhân', path: ROUTES.PROFILE, icon: User },
    { label: 'Phiên đăng nhập', path: ROUTES.SESSIONS, icon: Laptop },
    { label: 'Lịch sử đặt sân', path: ROUTES.BOOKINGS, icon: Calendar },
    { label: 'Cơ sở & Sân yêu thích', path: ROUTES.FAVORITES, icon: Heart },
    { label: 'Thông báo', path: ROUTES.NOTIFICATIONS, icon: Bell },
    { label: 'Đánh giá của tôi', path: ROUTES.REVIEWS, icon: Star },
    { label: 'Khiếu nại & Hỗ trợ', path: ROUTES.COMPLAINTS, icon: MessageSquareWarning },
    { label: 'Đăng ký làm Chủ sân', path: ROUTES.OWNER_APPLICATION, icon: Building2 }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <PublicHeader />

      <div className="container" style={{ flex: 1, padding: '32px 16px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '260px 1fr',
          gap: '32px',
          alignItems: 'start'
        }} className="customer-layout-grid">
          {/* Customer Left Sidebar */}
          <aside className="card" style={{ padding: '20px 12px', position: 'sticky', top: '96px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 8px 16px', borderBottom: '1px solid var(--sb-border)', marginBottom: '12px' }}>
              <img
                src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                alt={user.fullName}
                style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--sb-text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {user.fullName}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--sb-text-muted)' }}>
                  Khách hàng thân thiết
                </div>
              </div>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === ROUTES.ACCOUNT}
                    style={({ isActive }) => ({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 14px',
                      borderRadius: 'var(--sb-radius-md)',
                      fontSize: '0.875rem',
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? 'var(--sb-primary-700)' : 'var(--sb-text-secondary)',
                      backgroundColor: isActive ? 'var(--sb-primary-50)' : 'transparent',
                      transition: 'all var(--sb-transition)'
                    })}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </aside>

          {/* Customer Main View */}
          <main>
            <Outlet />
          </main>
        </div>
      </div>

      <PublicFooter />
      <DemoAccountSwitcher />

      <style>{`
        @media (max-width: 900px) {
          .customer-layout-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

