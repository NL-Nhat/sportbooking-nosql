import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

export function FaqPage() {
  const [openIdx, setOpenIdx] = useState(0);

  const faqs = [
    {
      q: 'Làm thế nào để đặt sân trên SportBooking?',
      a: 'Bạn chỉ cần chọn môn thể thao, ngày giờ mong muốn tại trang Tìm sân hoặc trực tiếp tại cơ sở, sau đó chọn slot còn trống và bấm Xác nhận đặt sân. Bạn có thể thanh toán trực tuyến hoặc thanh toán tại quầy cơ sở.'
    },
    {
      q: 'Tôi có thể hủy lịch đặt sân và được hoàn tiền không?',
      a: 'Có. Theo chính sách của SportBooking, bạn có thể hủy đơn đặt sân trước giờ bắt đầu tối thiểu 6 tiếng tại trang "Chi tiết đơn đặt sân" trong tài khoản của bạn để được hoàn trả 100% số tiền đã thanh toán.'
    },
    {
      q: 'Tôi là chủ sân, làm sao để đưa cơ sở của mình lên website?',
      a: 'Bạn chỉ cần đăng ký tài khoản khách hàng, sau đó truy cập mục "Đăng ký làm Chủ sân", điền thông tin cơ sở và đính kèm giấy phép kinh doanh. Ban quản trị sẽ thẩm định và kích hoạt tài khoản Chủ sân cho bạn trong vòng 24 giờ.'
    },
    {
      q: 'Hệ thống có bảo đảm không bị trùng sân khi nhiều người cùng đặt không?',
      a: 'Có. Khi bạn chọn một khung giờ và tiến hành đặt sân, hệ thống sẽ kích hoạt trạng thái giữ chỗ (HOLD) trong 15 phút. Không ai khác có thể chọn trùng slot đó trong thời gian này.'
    },
    {
      q: 'Các hình thức thanh toán được hỗ trợ là gì?',
      a: 'SportBooking hỗ trợ thanh toán trực tuyến (Thẻ ATM nội địa, QR Code ngân hàng, Ví điện tử) và thanh toán tiền mặt trực tiếp khi bạn đến nhận sân tại cơ sở.'
    }
  ];

  return (
    <div style={{ padding: '40px 0 64px' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '12px', textAlign: 'center' }}>Câu hỏi thường gặp (FAQ)</h1>
        <p style={{ textAlign: 'center', color: 'var(--sb-text-secondary)', marginBottom: '40px' }}>
          Giải đáp các thắc mắc phổ biến về quy trình đặt sân, hủy lịch và quản lý cơ sở thể thao.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div key={idx} className="card" style={{ padding: '0', overflow: 'hidden' }}>
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  style={{
                    width: '100%',
                    padding: '20px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    textAlign: 'left',
                    fontWeight: 600,
                    fontSize: '1rem',
                    color: isOpen ? 'var(--sb-primary-700)' : 'var(--sb-text-primary)',
                    backgroundColor: isOpen ? 'var(--sb-primary-50)' : 'transparent'
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <HelpCircle size={18} color="var(--sb-primary-600)" />
                    {faq.q}
                  </span>
                  {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                {isOpen && (
                  <div style={{ padding: '16px 24px 20px', fontSize: '0.925rem', color: 'var(--sb-text-secondary)', lineHeight: 1.6, borderTop: '1px solid var(--sb-border)' }}>
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default FaqPage;
