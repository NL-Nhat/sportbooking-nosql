import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useToast } from '../../contexts/ToastContext.jsx';
import { ROUTES } from '../../constants/routes.js';
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';

export function LoginPage() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const registeredEmail = location.state?.registeredEmail || '';
  const [email, setEmail] = useState(registeredEmail);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const redirectPath = new URLSearchParams(location.search).get('redirect') || null;

  const clearFieldError = (field) => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: '' }));
    }
    if (error) {
      setError('');
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    const trimmedEmail = email.trim().toLowerCase();
    const clientErrors = {};

    if (!trimmedEmail) {
      clientErrors.email = 'Email không được để trống.';
    } else if (!/^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(trimmedEmail)) {
      clientErrors.email = 'Địa chỉ email không đúng định dạng.';
    }

    if (!password) {
      clientErrors.password = 'Mật khẩu không được để trống.';
    }

    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      return;
    }

    setLoading(true);
    try {
      const user = await login(trimmedEmail, password);
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
      if (Array.isArray(err.details) && err.details.length > 0) {
        const backendFieldErrors = {};
        err.details.forEach((detail) => {
          if (detail.field) {
            backendFieldErrors[detail.field] = detail.message;
          }
        });
        setFieldErrors(backendFieldErrors);
      }
      const msg = err.message || 'Email hoặc mật khẩu không chính xác.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '6px' }}>Đăng nhập SportBooking</h2>
        <p style={{ fontSize: '0.875rem' }}>Quản lý đơn đặt sân và trải nghiệm dịch vụ</p>
      </div>

      {error && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px',
            backgroundColor: 'var(--sb-danger-bg)',
            color: 'var(--sb-danger)',
            borderRadius: 'var(--sb-radius-md)',
            fontSize: '0.85rem',
            marginBottom: '16px'
          }}
        >
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleLoginSubmit} noValidate>
        <div className="form-group">
          <label className="form-label">Email tài khoản <span className="required">*</span></label>
          <input
            type="email"
            className="form-control"
            placeholder="email@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              clearFieldError('email');
            }}
            required
          />
          {fieldErrors.email && (
            <div style={{ color: 'var(--sb-danger)', fontSize: '0.78rem', marginTop: '4px' }}>
              {fieldErrors.email}
            </div>
          )}
        </div>

        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="form-label" style={{ margin: 0 }}>Mật khẩu <span className="required">*</span></label>
            <Link to={ROUTES.FORGOT_PASSWORD} style={{ fontSize: '0.775rem', color: 'var(--sb-primary-600)' }}>
              Quên mật khẩu?
            </Link>
          </div>
          <div style={{ position: 'relative', marginTop: '6px' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              className="form-control"
              placeholder="Nhập mật khẩu của bạn"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                clearFieldError('password');
              }}
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
          {fieldErrors.password && (
            <div style={{ color: 'var(--sb-danger)', fontSize: '0.78rem', marginTop: '4px' }}>
              {fieldErrors.password}
            </div>
          )}
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
