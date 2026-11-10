import React from 'react';
import { Outlet } from 'react-router-dom';
import { PublicHeader } from '../components/common/PublicHeader.jsx';
import { PublicFooter } from '../components/common/PublicFooter.jsx';
import { DemoAccountSwitcher } from '../components/common/DemoAccountSwitcher.jsx';

export function PublicLayout() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <PublicHeader />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <PublicFooter />
      <DemoAccountSwitcher />
    </div>
  );
}

