import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useToast } from '../../contexts/ToastContext.jsx';
import { ROUTES } from '../../constants/routes.js';
import { UserPlus, Eye, EyeOff } from 'lucide-react';

export function RegisterPage() {
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

  const handleRegister = (e) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      showToast('Vui lòng điền đầy đủ các thông tin bắt buộc.', 'warning');
      return;
    }
    if (password !== confirmPassword) {
      showToast('Mật khẩu xác nhận không khớp.', 'danger');
      return;
    }
    if (!terms) {
      showToast('Vui lòng đồng ý với điều khoản sử dụng.', 'warning');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      showToast('Đăng ký tài khoản thành công! Vui lòng đăng nhập.', 'success');
      navigate(ROUTES.LOGIN);
    }, 600);
  };

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '6px' }}>Tạo tài khoản mới</h2>
        <p style={{ fontSize: '0.875rem' }}>Trở thành thành viên của cộng đồng SportBooking</p>
      </div>

      <form onSubmit={handleRegister}>
        <div className="form-group">
          <label className="form-label">Họ và tên <span className="required">*</span></label>
          <input
            type="text"
            className="form-control"
            placeholder="Nguyễn Văn A"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Email <span className="required">*</span></label>
          <input
            type="email"
            className="form-control"
            placeholder="email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Số điện thoại</label>
          <input
            type="tel"
            className="form-control"
            placeholder="0905 123 456"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Mật khẩu <span className="required">*</span></label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
        </div>

        <div className="form-group">
          <label className="form-label">Xác nhận mật khẩu <span className="required">*</span></label>
          <input
            type="password"
            className="form-control"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
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
