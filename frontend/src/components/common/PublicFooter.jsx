import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo.jsx';
import { ROUTES } from '../../constants/routes.js';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

export function PublicFooter() {
  return (
    <footer style={{
      backgroundColor: '#123B32',
      color: '#FFFFFF',
      paddingTop: '64px',
      paddingBottom: '80px', // Chừa chỗ cho DemoAccountSwitcher floating
      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      marginTop: '64px'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '40px',
          marginBottom: '48px'
        }}>
          {/* Cột 1: Thông tin thương hiệu */}
          <div>
            <div style={{ marginBottom: '16px' }}>
              <Logo />
            </div>
            <p style={{ color: 'rgba(255, 255, 255, 0.75)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '20px' }}>
              Nền tảng đặt sân thể thao trực tuyến hàng đầu Đà Nẵng. Kết nối nhanh chóng giữa người đam mê thể thao và các chủ cơ sở uy tín.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.8)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={16} color="var(--sb-accent-500)" /> Quận Hải Châu, TP. Đà Nẵng
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={16} color="var(--sb-accent-500)" /> 1900 8888 (Demo)
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={16} color="var(--sb-accent-500)" /> support@sportbooking.demo
              </div>
            </div>
          </div>

          {/* Cột 2: Bộ môn thể thao */}
          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '1rem', fontWeight: 600, marginBottom: '16px' }}>Môn thể thao</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.875rem' }}>
              <Link to="/sports/FOOTBALL" style={{ color: 'rgba(255, 255, 255, 0.75)' }}>Sân Bóng đá</Link>
              <Link to="/sports/BADMINTON" style={{ color: 'rgba(255, 255, 255, 0.75)' }}>Sân Cầu lông</Link>
              <Link to="/sports/TENNIS" style={{ color: 'rgba(255, 255, 255, 0.75)' }}>Sân Tennis</Link>
              <Link to="/sports/PICKLEBALL" style={{ color: 'rgba(255, 255, 255, 0.75)' }}>Sân Pickleball</Link>
            </div>
          </div>

          {/* Cột 3: Liên kết nhanh */}
          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '1rem', fontWeight: 600, marginBottom: '16px' }}>Liên kết nhanh</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.875rem' }}>
              <Link to={ROUTES.SEARCH} style={{ color: 'rgba(255, 255, 255, 0.75)' }}>Tìm sân nhanh</Link>
              <Link to={ROUTES.FACILITIES} style={{ color: 'rgba(255, 255, 255, 0.75)' }}>Cơ sở thể thao</Link>
              <Link to={ROUTES.CONTACT} style={{ color: 'rgba(255, 255, 255, 0.75)' }}>Liên hệ hỗ trợ</Link>
              <Link to={ROUTES.OWNER_APPLICATION} style={{ color: 'var(--sb-accent-500)', fontWeight: 600 }}>Dành cho Chủ sân</Link>
            </div>
          </div>

          {/* Cột 4: Hỗ trợ & Chính sách */}
          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '1rem', fontWeight: 600, marginBottom: '16px' }}>Hỗ trợ khách hàng</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.875rem' }}>
              <Link to={ROUTES.ABOUT} style={{ color: 'rgba(255, 255, 255, 0.75)' }}>Về chúng tôi</Link>
              <Link to={ROUTES.FAQ} style={{ color: 'rgba(255, 255, 255, 0.75)' }}>Câu hỏi thường gặp</Link>
              <Link to={ROUTES.TERMS} style={{ color: 'rgba(255, 255, 255, 0.75)' }}>Điều khoản sử dụng</Link>
              <Link to={ROUTES.PRIVACY} style={{ color: 'rgba(255, 255, 255, 0.75)' }}>Chính sách bảo mật</Link>
            </div>
          </div>
        </div>

        <div style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          paddingTop: '24px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          fontSize: '0.8rem',
          color: 'rgba(255, 255, 255, 0.6)'
        }}>
          <div>
            © 2026 SportBooking Platform. Học phần Cơ sở dữ liệu phi quan hệ (MongoDB).
          </div>
          <div>
            Đồ án demo Frontend UI/UX theo đặc tả 17 Collections chuẩn.
          </div>
        </div>
      </div>
    </footer>
  );
}

