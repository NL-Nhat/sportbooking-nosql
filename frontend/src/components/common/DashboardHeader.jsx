import React from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { Menu, Bell, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes.js';

export function DashboardHeader({ onToggleSidebar, title, breadcrumbs = [] }) {
  const { user } = useAuth();

  return (
    <header style={{
      height: '64px',
      backgroundColor: '#FFFFFF',
      borderBottom: '1px solid var(--sb-border)',
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 890
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={onToggleSidebar}
          style={{ padding: '6px', color: 'var(--sb-text-primary)' }}
          className="dashboard-menu-btn"
          aria-label="Mở menu điều hướng"
        >
          <Menu size={22} />
        </button>

        <div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--sb-text-primary)' }}>
            {title}
          </h2>
          {breadcrumbs.length > 0 && (
            <div style={{ fontSize: '0.75rem', color: 'var(--sb-text-muted)', display: 'flex', gap: '4px' }}>
              {breadcrumbs.map((b, idx) => (
                <span key={idx}>
                  {idx > 0 && ' / '}
                  {b.path ? <Link to={b.path} style={{ color: 'var(--sb-text-secondary)' }}>{b.label}</Link> : b.label}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <Link
          to={ROUTES.NOTIFICATIONS}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'var(--sb-background)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--sb-text-secondary)'
          }}
          aria-label="Thông báo"
        >
          <Bell size={18} />
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
            alt={user?.fullName || 'User'}
            style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
          />
          <div style={{ display: 'flex', flexDirection: 'column' }} className="dashboard-user-name">
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--sb-text-primary)' }}>
              {user?.fullName}
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--sb-text-muted)' }}>
              {user?.roles?.join(', ')}
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 1025px) {
          .dashboard-menu-btn { display: none !important; }
        }
        @media (max-width: 600px) {
          .dashboard-user-name { display: none !important; }
        }
      `}</style>
    </header>
  );
}

