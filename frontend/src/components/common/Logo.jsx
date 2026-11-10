import React from 'react';
import { Link } from 'react-router-dom';

export function Logo({ collapsed = false }) {
  return (
    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
      <div style={{
        width: '38px',
        height: '38px',
        borderRadius: '10px',
        background: 'linear-gradient(135deg, var(--sb-primary-700) 0%, var(--sb-primary-900) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff',
        boxShadow: '0 2px 8px rgba(33, 107, 89, 0.25)',
        flexShrink: 0
      }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          {/* Sân bóng / thể thao cách điệu */}
          <rect x="2" y="3" width="20" height="18" rx="3" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <circle cx="12" cy="12" r="3" stroke="var(--sb-accent-500)" strokeWidth="2.5" />
        </svg>
      </div>

      {!collapsed && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: 'var(--sb-primary-900)',
            lineHeight: 1.1
          }}>
            Sport<span style={{ color: 'var(--sb-primary-600)' }}>Booking</span>
          </span>
          <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--sb-accent-600)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Đà Nẵng Sports
          </span>
        </div>
      )}
    </Link>
  );
}

