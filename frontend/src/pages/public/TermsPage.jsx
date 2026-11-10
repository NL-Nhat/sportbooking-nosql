import React from 'react';

export function TermsPage() {
  return (
    <div style={{ padding: '40px 0 64px' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '24px' }}>Điều khoản sử dụng dịch vụ</h1>
        
        <div className="card" style={{ padding: '32px', lineHeight: 1.7, fontSize: '0.95rem' }}>
          <h3 style={{ marginBottom: '8px' }}>1. Chấp thuận điều khoản</h3>
          <p style={{ marginBottom: '20px' }}>
            Bằng việc đăng ký tài khoản hoặc sử dụng hệ thống SportBooking để đặt sân thể thao, quý khách đồng ý tuân thủ các điều khoản và điều kiện được nêu tại văn bản này.
          </p>

          <h3 style={{ marginBottom: '8px' }}>2. Quy định đặt sân và thanh toán</h3>
          <p style={{ marginBottom: '20px' }}>
            Khách hàng có trách nhiệm kiểm tra kỹ thời gian, môn thể thao và cơ sở trước khi xác nhận. Sau khi đặt sân thành công, slot thi đấu sẽ được bảo lưu theo thông tin trên mã đặt chỗ điện tử.
          </p>

          <h3 style={{ marginBottom: '8px' }}>3. Chính sách hủy và hoàn tiền</h3>
          <p style={{ marginBottom: '20px' }}>
            Khách hàng được phép hủy đơn trước thời điểm bắt đầu tối thiểu 06 tiếng và nhận lại 100% số tiền đã thanh toán. Trường hợp hủy muộn hoặc không đến sân (NO_SHOW), chủ sân có quyền từ chối hoàn cọc theo chính sách nội bộ.
          </p>

          <h3 style={{ marginBottom: '8px' }}>4. Trách nhiệm của Chủ cơ sở</h3>
          <p style={{ margin: 0 }}>
            Chủ cơ sở cam kết đảm bảo mặt sân đúng tiêu chuẩn an toàn, hệ thống chiếu sáng hoạt động tốt và bảo lưu đúng sân cho khách hàng theo mã đặt sân hợp lệ.
          </p>
        </div>
      </div>
    </div>
  );
}

export default TermsPage;
