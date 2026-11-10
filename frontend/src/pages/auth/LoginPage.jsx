import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useToast } from '../../contexts/ToastContext.jsx';
import { ROUTES } from '../../constants/routes.js';
import { Eye, EyeOff, LogIn, UserCheck, Shield, Clock, User } from 'lucide-react';

export function LoginPage() {
  const { login, switchAccount } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('customer@sportbooking.demo');
  const [password, setPassword] = useState('Demo@123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const redirectPath = new URLSearchParams(location.search).get('redirect') || null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      showToast(`Đăng nhập thành công! Chào ${user.fullName}`, 'success');

      if (redirectPath) {
        navigate(redirectPath);
      } else if (user.roles?.includes('ADMIN')) {
        navigate(ROUTES.ADMIN_DASHBOARD);
      } else if (user.roles?.includes('OWNER')) {
        navigate(ROUTES.OWNER_DASHBOARD);
      } else {
        navigate(ROUTES.ACCOUNT);
      }
    } catch (err) {
      setError(err.message || 'Email hoặc mật khẩu không đúng.');
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (roleKey, targetRoute, label) => {
    try {
      const user = await switchAccount(roleKey);
      showToast(`Đăng nhập nhanh vai trò ${label}`, 'success');
      navigate(targetRoute);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '6px' }}>Đăng nhập SportBooking</h2>
        <p style={{ fontSize: '0.875rem' }}>Quản lý đơn đặt sân và trải nghiệm dịch vụ</p>
      </div>

      {error && (
        <div style={{
          padding: '12px',
          backgroundColor: 'var(--sb-danger-bg)',
          color: 'var(--sb-danger)',
          borderRadius: 'var(--sb-radius-md)',
          fontSize: '0.85rem',
          marginBottom: '16px'
        }}>
          {error}
        </div>
      )}

      {/* Demo Fast Logins Box */}
      <div style={{
        padding: '14px',
        backgroundColor: 'var(--sb-primary-50)',
        borderRadius: 'var(--sb-radius-md)',
        border: '1px dashed var(--sb-primary-600)',
        marginBottom: '20px'
      }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--sb-primary-900)', textTransform: 'uppercase', marginBottom: '8px' }}>
          ⚡ Đăng nhập nhanh 1-Click (Demo)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <button
            type="button"
            onClick={() => handleQuickDemo('CUSTOMER', ROUTES.ACCOUNT, 'Khách hàng')}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.75rem', justifyContent: 'flex-start' }}
          >
            <User size={13} color="var(--sb-primary-600)" /> Khách hàng
          </button>
          <button
            type="button"
            onClick={() => handleQuickDemo('OWNER_APPROVED', ROUTES.OWNER_DASHBOARD, 'Chủ sân')}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.75rem', justifyContent: 'flex-start' }}
          >
            <UserCheck size={13} color="var(--sb-success)" /> Chủ sân (Duyệt)
          </button>
          <button
            type="button"
            onClick={() => handleQuickDemo('OWNER_PENDING', ROUTES.OWNER_DASHBOARD, 'Chủ sân chờ duyệt')}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.75rem', justifyContent: 'flex-start' }}
          >
            <Clock size={13} color="var(--sb-warning)" /> Chủ sân (Chờ)
          </button>
          <button
            type="button"
            onClick={() => handleQuickDemo('ADMIN', ROUTES.ADMIN_DASHBOARD, 'Quản trị viên')}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.75rem', justifyContent: 'flex-start' }}
          >
            <Shield size={13} color="var(--sb-danger)" /> Admin
          </button>
        </div>
      </div>

      <form onSubmit={handleLoginSubmit}>
        <div className="form-group">
          <label className="form-label">Email tài khoản</label>
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="form-label" style={{ margin: 0 }}>Mật khẩu</label>
            <Link to={ROUTES.FORGOT_PASSWORD} style={{ fontSize: '0.775rem', color: 'var(--sb-primary-600)' }}>
              Quên mật khẩu?
            </Link>
          </div>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ paddingRight: '40px' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '12px',
                color: 'var(--sb-text-muted)'
              }}
              aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%', height: '44px', marginTop: '8px' }}
          disabled={loading}
        >
          <LogIn size={18} /> {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.85rem', color: 'var(--sb-text-secondary)' }}>
        Chưa có tài khoản?{' '}
        <Link to={ROUTES.REGISTER} style={{ color: 'var(--sb-primary-700)', fontWeight: 600 }}>
          Đăng ký ngay
        </Link>
      </div>
    </div>
  );
}

export default LoginPage;
