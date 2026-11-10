import React, { useState } from 'react';
import { useToast } from '../../contexts/ToastContext.jsx';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';

export function ContactPage() {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      showToast('Vui lòng điền đầy đủ các thông tin bắt buộc.', 'warning');
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      showToast('Cảm ơn bạn! Thông điệp liên hệ đã được gửi thành công.', 'success');
      setFormData({ name: '', email: '', phone: '', message: '' });
    }, 600);
  };

  return (
    <div style={{ padding: '40px 0 64px' }}>
      <div className="container" style={{ maxWidth: '1000px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '12px', textAlign: 'center' }}>Liên hệ & Hỗ trợ</h1>
        <p style={{ textAlign: 'center', color: 'var(--sb-text-secondary)', marginBottom: '40px' }}>
          Bạn cần hỗ trợ đặt sân hoặc muốn hợp tác đưa cơ sở thể thao lên hệ thống? Đội ngũ SportBooking luôn sẵn sàng đồng hành.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '36px'
        }}>
          {/* Thông tin liên hệ */}
          <div className="card" style={{ padding: '32px' }}>
            <h3 style={{ marginBottom: '20px' }}>Thông tin văn phòng</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontSize: '0.95rem' }}>
              <div style={{ display: 'flex', gap: '14px' }}>
                <MapPin size={20} color="var(--sb-primary-600)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Địa chỉ trụ sở:</strong>
                  <div style={{ color: 'var(--sb-text-secondary)', marginTop: '4px' }}>
                    Quận Hải Châu, TP. Đà Nẵng, Việt Nam
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '14px' }}>
                <Phone size={20} color="var(--sb-primary-600)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Tổng đài hỗ trợ:</strong>
                  <div style={{ color: 'var(--sb-text-secondary)', marginTop: '4px' }}>
                    1900 8888 (08:00 - 22:00 tất cả các ngày)
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '14px' }}>
                <Mail size={20} color="var(--sb-primary-600)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Email:</strong>
                  <div style={{ color: 'var(--sb-text-secondary)', marginTop: '4px' }}>
                    support@sportbooking.demo
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '14px' }}>
                <Clock size={20} color="var(--sb-primary-600)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Thời gian phục vụ:</strong>
                  <div style={{ color: 'var(--sb-text-secondary)', marginTop: '4px' }}>
                    Thứ Hai - Chủ Nhật: 06:00 - 22:30
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form liên hệ demo */}
          <div className="card" style={{ padding: '32px' }}>
            <h3 style={{ marginBottom: '16px' }}>Gửi tin nhắn trực tiếp</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Họ và tên <span className="required">*</span></label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nguyễn Văn A"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email của bạn <span className="required">*</span></label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Số điện thoại</label>
                <input
                  type="tel"
                  className="form-control"
                  placeholder="0905 123 456"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nội dung cần hỗ trợ <span className="required">*</span></label>
                <textarea
                  className="form-control"
                  rows={4}
                  placeholder="Mô tả yêu cầu cần giải đáp..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }} disabled={submitting}>
                <Send size={16} /> {submitting ? 'Đang gửi tin nhắn...' : 'Gửi thông điệp'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactPage;
