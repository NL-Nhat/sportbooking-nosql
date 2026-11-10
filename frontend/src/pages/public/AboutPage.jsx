import React from 'react';
import { Target, Users, Shield, Award } from 'lucide-react';

export function AboutPage() {
  return (
    <div style={{ padding: '40px 0 64px' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        <h1 style={{ fontSize: '2.25rem', marginBottom: '16px', textAlign: 'center' }}>Về SportBooking Đà Nẵng</h1>
        <p style={{ textAlign: 'center', fontSize: '1.1rem', color: 'var(--sb-text-secondary)', marginBottom: '48px', lineHeight: 1.6 }}>
          Nền tảng công nghệ kết nối các câu lạc bộ thể thao và người yêu thể thao tại Đà Nẵng, giúp việc đặt sân bóng đá, cầu lông, tennis & pickleball trở nên dễ dàng và minh bạch.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', marginBottom: '48px' }}>
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--sb-primary-50)', color: 'var(--sb-primary-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Target size={24} />
            </div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '8px' }}>Sứ mệnh</h3>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
              Thúc đẩy phong trào thể dục thể thao cộng đồng bằng việc số hóa 100% quy trình quản lý và đặt sân, tiết kiệm thời gian cho khách hàng và chủ sân.
            </p>
          </div>

          <div className="card" style={{ padding: '24px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--sb-primary-50)', color: 'var(--sb-primary-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Shield size={24} />
            </div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '8px' }}>Chất lượng & Minh bạch</h3>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
              Mọi cơ sở và sân bãi đều được ban quản trị kiểm duyệt hồ sơ pháp lý, ảnh chụp thực tế và quy tắc giá rõ ràng trước khi xuất hiện trên hệ thống.
            </p>
          </div>

          <div className="card" style={{ padding: '24px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--sb-primary-50)', color: 'var(--sb-primary-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Users size={24} />
            </div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '8px' }}>Cộng đồng gắn kết</h3>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
              Xây dựng môi trường giao lưu lành mạnh với hệ thống đánh giá thực tế và giải quyết khiếu nại nhanh chóng trong vòng 24 giờ.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutPage;
