import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Logo } from '../components/common/Logo.jsx';
import { DemoAccountSwitcher } from '../components/common/DemoAccountSwitcher.jsx';

export function AuthLayout() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--sb-background)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '24px 16px',
      paddingBottom: '80px'
    }}>
      <div style={{ marginBottom: '24px' }}>
        <Logo />
      </div>

      <div style={{
        width: '100%',
        maxWidth: '440px',
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--sb-radius-xl)',
        padding: '32px 28px',
        boxShadow: 'var(--sb-shadow-md)',
        border: '1px solid var(--sb-border)'
      }}>
        <Outlet />
      </div>

      <DemoAccountSwitcher />
    </div>
  );
}

