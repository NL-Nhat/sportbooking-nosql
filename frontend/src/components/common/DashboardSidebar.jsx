import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useToast } from '../../contexts/ToastContext.jsx';
import { Logo } from './Logo.jsx';
import { ROUTES } from '../../constants/routes.js';
import {
  LayoutDashboard,
  Building2,
  Trophy,
  Clock,
  DollarSign,
  CalendarDays,
  CalendarCheck2,
  Star,
  MessageSquareWarning,
  TrendingUp,
  User,
  Users,
  ShieldCheck,
  Layers,
  ArrowLeft,
  LogOut,
  Settings,
  X
} from 'lucide-react';

export function DashboardSidebar({ role = 'OWNER', isOpen, onClose }) {
  const { logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (onClose) onClose();
    await logout();
    showToast('Đăng xuất thành công', 'success');
    navigate(ROUTES.LOGIN);
  };
  const ownerMenuItems = [
    { label: 'Tổng quan', path: ROUTES.OWNER_DASHBOARD, icon: LayoutDashboard },
    { label: 'Cơ sở của tôi', path: ROUTES.OWNER_FACILITIES, icon: Building2 },
    { label: 'Quản lý sân', path: ROUTES.OWNER_COURTS, icon: Trophy },
    { label: 'Lịch hoạt động', path: ROUTES.OWNER_OPERATING_HOURS, icon: Clock },
    { label: 'Quy tắc giá', path: ROUTES.OWNER_PRICING, icon: DollarSign },
    { label: 'Lịch chặn sân', path: ROUTES.OWNER_BLOCKED_SLOTS, icon: CalendarDays },
    { label: 'Đơn đặt sân', path: ROUTES.OWNER_BOOKINGS, icon: CalendarCheck2 },
    { label: 'Lịch biểu trực quan', path: ROUTES.OWNER_CALENDAR, icon: CalendarDays },
    { label: 'Đánh giá từ khách', path: ROUTES.OWNER_REVIEWS, icon: Star },
    { label: 'Khiếu nại cơ sở', path: ROUTES.OWNER_COMPLAINTS, icon: MessageSquareWarning },
    { label: 'Doanh thu & Báo cáo', path: ROUTES.OWNER_REVENUE, icon: TrendingUp },
    { label: 'Hồ sơ chủ sân', path: ROUTES.OWNER_PROFILE, icon: User }
  ];

  // Quyền Admin theo SportBooking_Backend_Functions_API_Security_Guidelines.md v2.0
  const adminMenuItems = [
    { label: 'Tổng quan hệ thống', path: ROUTES.ADMIN_DASHBOARD, icon: LayoutDashboard },
    { label: 'Quản lý người dùng', path: ROUTES.ADMIN_USERS, icon: Users },
    { label: 'Duyệt hồ sơ Chủ sân', path: ROUTES.ADMIN_OWNER_APPLICATIONS, icon: ShieldCheck },
    { label: 'Danh mục thể thao', path: ROUTES.ADMIN_CATEGORIES, icon: Layers },
    { label: 'Kiểm duyệt đánh giá', path: ROUTES.ADMIN_REVIEWS, icon: Star },
    { label: 'Xử lý khiếu nại', path: ROUTES.ADMIN_COMPLAINTS, icon: MessageSquareWarning },
    { label: 'Cài đặt hệ thống', path: ROUTES.ADMIN_SETTINGS, icon: Settings }
  ];

  const items = role === 'ADMIN' ? adminMenuItems : ownerMenuItems;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            zIndex: 40,
            backdropFilter: 'blur(2px)'
          }}
          className="dashboard-backdrop"
        />
      )}

      <aside
        style={{
          width: '260px',
          backgroundColor: '#FFFFFF',
          borderRight: '1px solid var(--sb-border)',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          zIndex: 50,
          transition: 'transform 0.3s ease'
        }}
        className={`dashboard-sidebar ${isOpen ? 'open' : ''}`}
      >
        {/* Header / Brand */}
        <div style={{
          padding: '20px 20px 16px',
          borderBottom: '1px solid var(--sb-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Logo to={role === 'ADMIN' ? ROUTES.ADMIN_DASHBOARD : ROUTES.OWNER_DASHBOARD} />
          <button
            onClick={onClose}
            className="btn-icon mobile-only"
            aria-label="Đóng menu"
            style={{ display: 'none' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Role Badge */}
        <div style={{ padding: '12px 20px', backgroundColor: 'var(--sb-background)' }}>
          <div style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: role === 'ADMIN' ? 'var(--sb-danger)' : 'var(--sb-primary-700)'
          }}>
            {role === 'ADMIN' ? '🛡️ Quản trị viên (Admin)' : '🏢 Kênh Đối Tác (Owner)'}
          </div>
        </div>

        {/* Navigation Links */}
        <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === ROUTES.OWNER_DASHBOARD || item.path === ROUTES.ADMIN_DASHBOARD}
                onClick={onClose}
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

        {/* Back to Public Home & Logout */}
        <div style={{ padding: '16px 12px', borderTop: '1px solid var(--sb-border)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <Link
            to={ROUTES.HOME}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              borderRadius: 'var(--sb-radius-md)',
              fontSize: '0.875rem',
              color: 'var(--sb-text-secondary)',
              transition: 'background-color var(--sb-transition)'
            }}
          >
            <ArrowLeft size={16} />
            <span>Về trang chủ</span>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              borderRadius: 'var(--sb-radius-md)',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--sb-danger)',
              width: '100%',
              textAlign: 'left',
              transition: 'background-color var(--sb-transition)'
            }}
          >
            <LogOut size={16} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      <style>{`
        @media (max-width: 1024px) {
          .dashboard-sidebar {
            position: fixed !important;
            top: 0;
            bottom: 0;
            left: 0;
            transform: translateX(-100%);
          }
          .dashboard-sidebar.open {
            transform: translateX(0);
          }
          .mobile-only {
            display: flex !important;
          }
        }
      `}</style>
    </>
  );
}

export default DashboardSidebar;
