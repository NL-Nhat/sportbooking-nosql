import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useToast } from '../../contexts/ToastContext.jsx';
import { ROUTES } from '../../constants/routes.js';
import { UserPlus, Eye, EyeOff, AlertCircle } from 'lucide-react';

export function RegisterPage() {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [terms, setTerms] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const clearFieldError = (field) => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: '' }));
    }
    if (generalError) {
      setGeneralError('');
    }
  };

  const validateClient = () => {
    const errors = {};
    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPhone = phone.trim().replace(/[\s.-]/g, '');

    if (!trimmedName) {
      errors.fullName = 'Họ và tên không được để trống.';
    } else if (trimmedName.length < 2 || trimmedName.length > 100) {
      errors.fullName = 'Họ và tên phải từ 2 đến 100 ký tự.';
    }

    if (!trimmedEmail) {
      errors.email = 'Email không được để trống.';
    } else if (!/^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(trimmedEmail)) {
      errors.email = 'Địa chỉ email không đúng định dạng.';
    }

    if (!trimmedPhone) {
      errors.phone = 'Số điện thoại không được để trống.';
    } else if (!/^(0|\+84)[0-9]{9,10}$/.test(trimmedPhone)) {
      errors.phone = 'Số điện thoại không đúng định dạng (VD: 0901234567).';
    }

    if (!password) {
      errors.password = 'Mật khẩu không được để trống.';
    } else if (password.length < 6) {
      errors.password = 'Mật khẩu phải có ít nhất 6 ký tự.';
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = 'Mật khẩu xác nhận không khớp.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setGeneralError('');

    if (!validateClient()) {
      showToast('Vui lòng kiểm tra lại thông tin đăng ký.', 'warning');
      return;
    }

    if (!terms) {
      showToast('Vui lòng đồng ý với điều khoản sử dụng.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const response = await register({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: phone.trim().replace(/[\s.-]/g, '')
      });

      showToast(
        response?.message || 'Đăng ký thành công. Vui lòng xác minh email.',
        'success'
      );

      navigate(ROUTES.LOGIN, {
        state: {
          registeredEmail: response?.data?.email || email.trim().toLowerCase()
        }
      });
    } catch (err) {
      if (Array.isArray(err.details) && err.details.length > 0) {
        const backendFieldErrors = {};
        err.details.forEach((detail) => {
          if (detail.field) {
            backendFieldErrors[detail.field] = detail.message;
          }
        });
        setFieldErrors((prev) => ({ ...prev, ...backendFieldErrors }));
      }
      const msg = err.message || 'Đăng ký tài khoản thất bại. Vui lòng thử lại.';
      setGeneralError(msg);
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '6px' }}>Tạo tài khoản mới</h2>
        <p style={{ fontSize: '0.875rem' }}>Trở thành thành viên của cộng đồng SportBooking</p>
      </div>

      {generalError && (
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
          <span>{generalError}</span>
        </div>
      )}

      <form onSubmit={handleRegister} noValidate>
        <div className="form-group">
          <label className="form-label">Họ và tên <span className="required">*</span></label>
          <input
            type="text"
            className="form-control"
            placeholder="Nguyễn Văn A"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              clearFieldError('fullName');
            }}
            required
          />
          {fieldErrors.fullName && (
            <div style={{ color: 'var(--sb-danger)', fontSize: '0.78rem', marginTop: '4px' }}>
              {fieldErrors.fullName}
            </div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Email <span className="required">*</span></label>
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
          <label className="form-label">Số điện thoại <span className="required">*</span></label>
          <input
            type="tel"
            className="form-control"
            placeholder="0901234567"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              clearFieldError('phone');
            }}
            required
          />
          {fieldErrors.phone && (
            <div style={{ color: 'var(--sb-danger)', fontSize: '0.78rem', marginTop: '4px' }}>
              {fieldErrors.phone}
            </div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Mật khẩu <span className="required">*</span></label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              className="form-control"
              placeholder="Ít nhất 6 ký tự"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                clearFieldError('password');
              }}
              required
              minLength={6}
              style={{ paddingRight: '40px' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', right: '12px', top: '12px', color: 'var(--sb-text-muted)' }}
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

        <div className="form-group">
          <label className="form-label">Xác nhận mật khẩu <span className="required">*</span></label>
          <input
            type={showPassword ? 'text' : 'password'}
            className="form-control"
            placeholder="Nhập lại mật khẩu"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              clearFieldError('confirmPassword');
            }}
            required
          />
          {fieldErrors.confirmPassword && (
            <div style={{ color: 'var(--sb-danger)', fontSize: '0.78rem', marginTop: '4px' }}>
              {fieldErrors.confirmPassword}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', fontSize: '0.85rem' }}>
          <input
            type="checkbox"
            id="termsCheckbox"
            checked={terms}
            onChange={(e) => setTerms(e.target.checked)}
          />
          <label htmlFor="termsCheckbox" style={{ cursor: 'pointer', color: 'var(--sb-text-secondary)' }}>
            Tôi đồng ý với <Link to={ROUTES.TERMS} target="_blank" style={{ color: 'var(--sb-primary-700)', fontWeight: 600 }}>Điều khoản sử dụng</Link>
          </label>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%', height: '44px' }}
          disabled={submitting}
        >
          <UserPlus size={18} /> {submitting ? 'Đang tạo tài khoản...' : 'Đăng ký tài khoản'}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.85rem', color: 'var(--sb-text-secondary)' }}>
        Đã có tài khoản?{' '}
        <Link to={ROUTES.LOGIN} style={{ color: 'var(--sb-primary-700)', fontWeight: 600 }}>
          Đăng nhập ngay
        </Link>
      </div>
    </div>
  );
}

export default RegisterPage;
