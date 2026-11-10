import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes.js';
import { Compass, ArrowLeft } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div style={{
      minHeight: '70vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 16px',
      textAlign: 'center'
    }}>
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        backgroundColor: 'var(--sb-primary-50)',
        color: 'var(--sb-primary-600)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '20px'
      }}>
        <Compass size={44} />
      </div>

      <h1 style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--sb-primary-900)', margin: '0 0 8px' }}>
        404
      </h1>
      <h2 style={{ fontSize: '1.4rem', margin: '0 0 12px' }}>Không tìm thấy trang yêu cầu</h2>
      <p style={{ color: 'var(--sb-text-secondary)', maxWidth: '440px', marginBottom: '24px' }}>
        Đường dẫn bạn truy cập có thể đã thay đổi hoặc không tồn tại trên hệ thống SportBooking.
      </p>

      <div style={{ display: 'flex', gap: '12px' }}>
        <Link to={ROUTES.HOME} className="btn btn-primary">
          <ArrowLeft size={16} /> Về trang chủ
        </Link>
        <Link to={ROUTES.SEARCH} className="btn btn-secondary">
          Tìm sân thể thao
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;
