import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { DashboardSidebar } from '../components/common/DashboardSidebar.jsx';
import { DashboardHeader } from '../components/common/DashboardHeader.jsx';
import { DemoAccountSwitcher } from '../components/common/DemoAccountSwitcher.jsx';
import { ROUTES } from '../constants/routes.js';

export function AdminLayout() {
  const { user, isAuthenticated, isAdmin, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return <div style={{ padding: '60px', textAlign: 'center' }}>Đang xác thực quyền Admin...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (!isAdmin) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--sb-background)' }}>
      <DashboardSidebar
        role="ADMIN"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <DashboardHeader
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          title="Bảng điều khiển Quản trị viên (Admin)"
        />

        <main style={{ flex: 1, padding: '24px', overflowY: 'auto', paddingBottom: '90px' }}>
          <Outlet />
        </main>
      </div>

      <DemoAccountSwitcher />
    </div>
  );
}

