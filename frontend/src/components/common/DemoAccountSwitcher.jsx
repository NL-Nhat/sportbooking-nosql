import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useToast } from '../../contexts/ToastContext.jsx';
import { resetMockDatabase } from '../../../mock/reset.js';
import { RefreshCw, UserCheck, Shield, Clock, User, ChevronUp, ChevronDown } from 'lucide-react';
import { ROUTES } from '../../constants/routes.js';

export function DemoAccountSwitcher() {
  const { user, switchAccount } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleSwitch = async (roleKey, targetRoute, label) => {
    try {
      await switchAccount(roleKey);
      showToast(`Đã chuyển sang vai trò: ${label}`, 'success');
      if (targetRoute) {
        navigate(targetRoute);
      }
    } catch (e) {
      showToast(`Lỗi chuyển tài khoản: ${e.message}`, 'error');
    }
  };

  const handleReset = () => {
    if (window.confirm('Bạn có chắc chắn muốn đặt lại toàn bộ 16 Collections dữ liệu mẫu (v2.0) về trạng thái ban đầu?')) {
      resetMockDatabase();
      showToast('Đã khôi phục toàn bộ Database mẫu!', 'success');
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  };

  return (
    <aside 
      style={{
        position: 'fixed',
        bottom: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1100,
        backgroundColor: '#172B25',
        color: '#FFFFFF',
        borderRadius: 'var(--sb-radius-full)',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.28)',
        padding: '6px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontSize: '0.825rem',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        maxWidth: '96vw',
        overflowX: 'auto',
        backdropFilter: 'blur(10px)'
      }}
      aria-label="Thanh chuyển đổi vai trò Demo"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: 'var(--sb-accent-500)', whiteSpace: 'nowrap' }}>
        <span>Demo Switcher:</span>
        <span style={{ color: '#FFFFFF', fontWeight: 400, opacity: 0.9 }}>
          [{user?.roles?.[0] || 'GUEST'}{user?.ownerStatus === 'PENDING' ? ' (PENDING)' : ''}]
        </span>
      </div>

      {!collapsed && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => handleSwitch('CUSTOMER', ROUTES.ACCOUNT, 'Khách hàng')}
            style={{
              padding: '5px 10px',
              borderRadius: '20px',
              backgroundColor: user?.email === 'customer@sportbooking.demo' ? 'var(--sb-primary-600)' : 'rgba(255,255,255,0.1)',
              color: '#FFF',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.75rem',
              fontWeight: 600
            }}
            title="Đăng nhập tài khoản Khách hàng"
          >
            <User size={13} /> Khách hàng
          </button>

          <button
            onClick={() => handleSwitch('OWNER_APPROVED', ROUTES.OWNER_DASHBOARD, 'Chủ sân đã duyệt')}
            style={{
              padding: '5px 10px',
              borderRadius: '20px',
              backgroundColor: user?.email === 'owner@sportbooking.demo' ? 'var(--sb-primary-600)' : 'rgba(255,255,255,0.1)',
              color: '#FFF',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.75rem',
              fontWeight: 600
            }}
            title="Đăng nhập tài khoản Chủ sân đã duyệt"
          >
            <UserCheck size={13} /> Chủ sân
          </button>

          <button
            onClick={() => handleSwitch('OWNER_PENDING', ROUTES.OWNER_DASHBOARD, 'Chủ sân chờ duyệt')}
            style={{
              padding: '5px 10px',
              borderRadius: '20px',
              backgroundColor: user?.email === 'pending@sportbooking.demo' ? 'var(--sb-warning)' : 'rgba(255,255,255,0.1)',
              color: '#FFF',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.75rem',
              fontWeight: 600
            }}
            title="Đăng nhập tài khoản Chủ sân đang chờ phê duyệt"
          >
            <Clock size={13} /> Owner Chờ Duyệt
          </button>

          <button
            onClick={() => handleSwitch('ADMIN', ROUTES.ADMIN_DASHBOARD, 'Quản trị viên')}
            style={{
              padding: '5px 10px',
              borderRadius: '20px',
              backgroundColor: user?.email === 'admin@sportbooking.demo' ? 'var(--sb-danger)' : 'rgba(255,255,255,0.1)',
              color: '#FFF',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.75rem',
              fontWeight: 600
            }}
            title="Đăng nhập tài khoản Admin"
          >
            <Shield size={13} /> Admin
          </button>

          <button
            onClick={handleReset}
            style={{
              padding: '5px 8px',
              borderRadius: '20px',
              backgroundColor: 'rgba(255,255,255,0.15)',
              color: '#FFF',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.75rem'
            }}
            title="Khôi phục lại dữ liệu gốc 16 Collections (v2.0)"
          >
            <RefreshCw size={13} /> Reset DB
          </button>
        </div>
      )}

      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{ color: '#aaa', padding: '2px', display: 'flex', alignItems: 'center' }}
        title={collapsed ? "Mở rộng" : "Thu gọn"}
      >
        {collapsed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
    </aside>
  );
}

