import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext.jsx';
import { ROUTES } from '../../constants/routes.js';
import { KeyRound, ArrowLeft } from 'lucide-react';

export function ForgotPasswordPage() {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      showToast('Vui lòng nhập email đăng ký.', 'warning');
      return;
    }
    setSent(true);
    showToast(`Đã gửi đường dẫn đặt lại mật khẩu demo tới ${email}!`, 'success');
  };

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'var(--sb-primary-50)',
          color: 'var(--sb-primary-700)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px'
        }}>
          <KeyRound size={28} />
        </div>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '6px' }}>Quên mật khẩu?</h2>
        <p style={{ fontSize: '0.85rem' }}>
          Nhập địa chỉ email liên kết với tài khoản của bạn để nhận liên kết khôi phục.
        </p>
      </div>

      {sent ? (
        <div style={{
          padding: '16px',
          backgroundColor: 'var(--sb-success-bg)',
          color: 'var(--sb-success)',
          borderRadius: 'var(--sb-radius-md)',
          fontSize: '0.9rem',
          textAlign: 'center',
          marginBottom: '20px'
        }}>
          Đường dẫn khôi phục mật khẩu demo đã được gửi. Bạn có thể sử dụng mật khẩu mặc định <strong>Demo@123</strong> để đăng nhập.
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email tài khoản</label>
            <input
              type="email"
              className="form-control"
              placeholder="customer@sportbooking.demo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '44px', marginTop: '8px' }}>
            Gửi liên kết khôi phục
          </button>
        </form>
      )}

      <div style={{ textAlign: 'center', marginTop: '24px' }}>
        <Link to={ROUTES.LOGIN} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--sb-text-secondary)', fontWeight: 600 }}>
          <ArrowLeft size={16} /> Quay lại trang đăng nhập
        </Link>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
