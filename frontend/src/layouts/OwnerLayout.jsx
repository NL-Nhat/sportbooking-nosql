import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { DashboardSidebar } from '../components/common/DashboardSidebar.jsx';
import { DashboardHeader } from '../components/common/DashboardHeader.jsx';
import { DemoAccountSwitcher } from '../components/common/DemoAccountSwitcher.jsx';
import { ROUTES } from '../constants/routes.js';
import { Clock, AlertCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export function OwnerLayout() {
  const { user, isAuthenticated, isOwner, isOwnerPending, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return <div style={{ padding: '60px', textAlign: 'center' }}>Đang tải quyền Owner...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // Trường hợp tài khoản Owner PENDING (chưa được duyệt)
  if (isOwnerPending || (!isOwner && user?.ownerStatus === 'PENDING')) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--sb-background)', display: 'flex', flexDirection: 'column' }}>
        <DashboardHeader onToggleSidebar={() => {}} title="Hồ sơ chủ sân đang xét duyệt" />
        <div className="container" style={{ flex: 1, padding: '48px 16px', maxWidth: '700px' }}>
          <div className="card" style={{ textAlign: 'center', padding: '40px 24px' }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              backgroundColor: 'var(--sb-warning-bg)',
              color: 'var(--sb-warning)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              <Clock size={36} />
            </div>

            <h2 style={{ marginBottom: '12px', color: 'var(--sb-text-primary)' }}>
              Hồ sơ đăng ký Chủ sân đang chờ phê duyệt
            </h2>

            <p style={{ color: 'var(--sb-text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '24px' }}>
              Chào <strong>{user.fullName}</strong>, yêu cầu đăng ký làm đối tác chủ sân của bạn đã được gửi đến ban quản trị hệ thống SportBooking. 
              Chúng tôi đang tiến hành thẩm định giấy phép kinh doanh và giấy tờ tùy thân.
            </p>

            <div style={{
              backgroundColor: 'var(--sb-primary-50)',
              border: '1px solid var(--sb-border)',
              borderRadius: 'var(--sb-radius-md)',
              padding: '16px',
              textAlign: 'left',
              marginBottom: '28px',
              fontSize: '0.875rem'
            }}>
              <div style={{ fontWeight: 600, color: 'var(--sb-primary-900)', marginBottom: '8px' }}>
                📋 Tiến độ xử lý:
              </div>
              <ul style={{ paddingLeft: '20px', listStyleType: 'disc', color: 'var(--sb-text-secondary)' }}>
                <li>Trạng thái hồ sơ: <span style={{ color: 'var(--sb-warning)', fontWeight: 600 }}>CHỜ DUYỆT (PENDING)</span></li>
                <li>Thời gian dự kiến xử lý: trong vòng 24 - 48 giờ làm việc</li>
                <li>Mẹo demo: Bạn có thể chuyển sang tài khoản <strong>Admin</strong> bằng thanh Demo Switcher bên dưới để duyệt hồ sơ này ngay lập tức!</li>
              </ul>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <Link to={ROUTES.HOME} className="btn btn-secondary">
                <ArrowLeft size={16} /> Quay về Trang chủ
              </Link>
            </div>
          </div>
        </div>
        <DemoAccountSwitcher />
      </div>
    );
  }

  // Nếu không phải là Owner
  if (!isOwner) {
    return <Navigate to={ROUTES.OWNER_APPLICATION} replace />;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--sb-background)' }}>
      <DashboardSidebar
        role="OWNER"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <DashboardHeader
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          title="Cổng quản lý Chủ sân (Owner Portal)"
        />

        <main style={{ flex: 1, padding: '24px', overflowY: 'auto', paddingBottom: '90px' }}>
          <Outlet />
        </main>
      </div>

      <DemoAccountSwitcher />
    </div>
  );
}

