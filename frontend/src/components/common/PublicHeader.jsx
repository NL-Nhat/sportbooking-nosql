import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useToast } from '../../contexts/ToastContext.jsx';
import { notificationMockService } from '../../../mock/services/notificationMockService.js';
import { Logo } from './Logo.jsx';
import { ROUTES } from '../../constants/routes.js';
import { Bell, User, Heart, Calendar, LogOut, Menu, X, Shield, LayoutDashboard } from 'lucide-react';

export function PublicHeader() {
  const { user, isAuthenticated, isOwner, isAdmin, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);

  useEffect(() => {
    if (user) {
      notificationMockService.getUnreadCount(user._id).then(setUnreadCount);
    }
  }, [user]);

  const navLinks = [
    { label: 'Trang chủ', path: ROUTES.HOME },
    { label: 'Tìm sân', path: ROUTES.SEARCH },
    { label: 'Cơ sở thể thao', path: ROUTES.FACILITIES },
    { label: 'Giới thiệu', path: ROUTES.ABOUT },
    { label: 'Liên hệ', path: ROUTES.CONTACT }
  ];

  const handleLogout = async () => {
    setUserDropdown(false);
    setMenuOpen(false);
    await logout();
    showToast('Đăng xuất thành công', 'success');
    navigate(ROUTES.LOGIN);
  };

  return (
    <header style={{
      height: '72px',
      backgroundColor: '#FFFFFF',
      borderBottom: '1px solid var(--sb-border)',
      position: 'sticky',
      top: 0,
      zIndex: 900
    }}>
      <div className="container" style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Logo */}
        <Logo />

        {/* Desktop Nav */}
        <nav style={{ display: 'none', alignItems: 'center', gap: '28px' }} className="desktop-nav">
          {navLinks.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  fontSize: '0.925rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? 'var(--sb-primary-700)' : 'var(--sb-text-secondary)',
                  borderBottom: isActive ? '2px solid var(--sb-primary-700)' : '2px solid transparent',
                  padding: '6px 0',
                  transition: 'color var(--sb-transition)'
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right side controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {isAuthenticated ? (
            <>
              {/* Nút thông báo */}
              <Link
                to={ROUTES.NOTIFICATIONS}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--sb-text-secondary)',
                  position: 'relative',
                  backgroundColor: 'var(--sb-background)'
                }}
                aria-label="Thông báo"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    backgroundColor: 'var(--sb-danger)',
                    color: '#FFF',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>

              {/* Nút Yêu thích */}
              <Link
                to={ROUTES.FAVORITES}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--sb-text-secondary)',
                  backgroundColor: 'var(--sb-background)'
                }}
                aria-label="Yêu thích"
              >
                <Heart size={20} />
              </Link>

              {/* Avatar Dropdown */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setUserDropdown(!userDropdown)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '4px 8px',
                    borderRadius: 'var(--sb-radius-full)',
                    backgroundColor: 'var(--sb-background)'
                  }}
                  aria-expanded={userDropdown}
                  aria-label="Tài khoản cá nhân"
                >
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                    alt={user.fullName}
                    style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--sb-text-primary)' }} className="username-text">
                    {user.fullName.split(' ').slice(-1)[0]}
                  </span>
                </button>

                {userDropdown && (
                  <div style={{
                    position: 'absolute',
                    right: 0,
                    top: '46px',
                    width: '230px',
                    backgroundColor: '#FFFFFF',
                    borderRadius: 'var(--sb-radius-md)',
                    boxShadow: 'var(--sb-shadow-lg)',
                    border: '1px solid var(--sb-border)',
                    padding: '8px',
                    zIndex: 1000
                  }}>
                    <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--sb-border-subtle)', marginBottom: '6px' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--sb-text-primary)' }}>{user.fullName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--sb-text-muted)' }}>{user.email}</div>
                    </div>

                    <Link
                      to={ROUTES.ACCOUNT}
                      onClick={() => setUserDropdown(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', fontSize: '0.85rem', color: 'var(--sb-text-primary)', borderRadius: '6px' }}
                    >
                      <User size={16} /> Tài khoản của tôi
                    </Link>

                    <Link
                      to={ROUTES.BOOKINGS}
                      onClick={() => setUserDropdown(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', fontSize: '0.85rem', color: 'var(--sb-text-primary)', borderRadius: '6px' }}
                    >
                      <Calendar size={16} /> Lịch sử đặt sân
                    </Link>

                    {isOwner && (
                      <Link
                        to={ROUTES.OWNER_DASHBOARD}
                        onClick={() => setUserDropdown(false)}
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', fontSize: '0.85rem', color: 'var(--sb-primary-700)', fontWeight: 600, borderRadius: '6px' }}
                      >
                        <LayoutDashboard size={16} /> Cổng Chủ Sân (Owner)
                      </Link>
                    )}

                    {isAdmin && (
                      <Link
                        to={ROUTES.ADMIN_DASHBOARD}
                        onClick={() => setUserDropdown(false)}
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', fontSize: '0.85rem', color: 'var(--sb-danger)', fontWeight: 600, borderRadius: '6px' }}
                      >
                        <Shield size={16} /> Quản trị Admin
                      </Link>
                    )}

                    <div style={{ borderTop: '1px solid var(--sb-border-subtle)', marginTop: '6px', paddingTop: '6px' }}>
                      <button
                        onClick={handleLogout}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px 12px',
                          fontSize: '0.85rem',
                          color: 'var(--sb-danger)',
                          width: '100%',
                          textAlign: 'left',
                          borderRadius: '6px'
                        }}
                      >
                        <LogOut size={16} /> Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Link to={ROUTES.LOGIN} className="btn btn-secondary btn-sm">
                Đăng nhập
              </Link>
              <Link to={ROUTES.REGISTER} className="btn btn-primary btn-sm">
                Đăng ký
              </Link>
            </div>
          )}

          {/* Mobile hamburger toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ padding: '8px', color: 'var(--sb-text-primary)', display: 'block' }}
            className="mobile-menu-toggle"
            aria-label="Mở menu"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div style={{
          position: 'fixed',
          top: '72px',
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#FFFFFF',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          borderTop: '1px solid var(--sb-border)',
          zIndex: 999
        }}>
          {navLinks.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMenuOpen(false)}
              style={{
                fontSize: '1.1rem',
                fontWeight: 600,
                color: location.pathname === item.path ? 'var(--sb-primary-700)' : 'var(--sb-text-primary)',
                padding: '8px 0'
              }}
            >
              {item.label}
            </Link>
          ))}
          {isAuthenticated && (
            <div style={{ marginTop: 'auto', borderTop: '1px solid var(--sb-border)', paddingTop: '16px' }}>
              <button onClick={handleLogout} className="btn btn-danger" style={{ width: '100%' }}>
                <LogOut size={18} /> Đăng xuất
              </button>
            </div>
          )}
        </div>
      )}

      <style>{`
        @media (min-width: 900px) {
          .desktop-nav { display: flex !important; }
          .mobile-menu-toggle { display: none !important; }
        }
        @media (max-width: 600px) {
          .username-text { display: none; }
        }
      `}</style>
    </header>
  );
}

