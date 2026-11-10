import React from 'react';

export function PrivacyPage() {
  return (
    <div style={{ padding: '40px 0 64px' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '24px' }}>Chính sách bảo mật thông tin</h1>
        
        <div className="card" style={{ padding: '32px', lineHeight: 1.7, fontSize: '0.95rem' }}>
          <h3 style={{ marginBottom: '8px' }}>1. Thu thập thông tin</h3>
          <p style={{ marginBottom: '20px' }}>
            SportBooking chỉ thu thập các thông tin tối thiểu cần thiết phục vụ việc liên lạc xác nhận đặt sân: Họ tên, số điện thoại và email. Chúng tôi không thu thập thông tin thẻ ngân hàng hoặc dữ liệu cá nhân nhạy cảm trong hệ thống demo.
          </p>

          <h3 style={{ marginBottom: '8px' }}>2. Sử dụng thông tin</h3>
          <p style={{ marginBottom: '20px' }}>
            Thông tin liên hệ của bạn chỉ được chia sẻ với cơ sở thể thao nơi bạn đặt sân để nhân viên lễ tân hỗ trợ check-in khi bạn đến sân.
          </p>

          <h3 style={{ marginBottom: '8px' }}>3. Bảo mật thanh toán</h3>
          <p style={{ margin: 0 }}>
            Mọi giao dịch thanh toán trực tuyến mô phỏng đều tuân thủ các quy tắc mã hóa chuẩn, không lưu trữ dữ liệu tài khoản ngân hàng thực tế của người dùng.
          </p>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPage;
