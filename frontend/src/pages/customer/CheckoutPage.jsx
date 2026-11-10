import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { courtMockService } from '../../../mock/services/courtMockService.js';
import { bookingMockService } from '../../../mock/services/bookingMockService.js';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useToast } from '../../contexts/ToastContext.jsx';
import { formatCurrency, formatDate } from '../../utils/formatters.js';
import { resolveAssetUrl } from '../../utils/fileUploadHelper.js';
import { ROUTES } from '../../constants/routes.js';
import { 
  MapPin, 
  ArrowRight, 
  ShieldCheck, 
  Clock
} from 'lucide-react';

export function CheckoutPage() {
  const { courtId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const dateParam = searchParams.get('date') || '2026-11-04';

  const [court, setCourt] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  // Thông tin cá nhân người đặt sân
  const [fullName, setFullName] = useState(user?.fullName || 'Nguyễn Minh Anh');
  const [phone, setPhone] = useState(user?.phone || '0905123456');
  const [email, setEmail] = useState(user?.email || 'customer@sportbooking.demo');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    courtMockService.getById(courtId).then((data) => {
      setCourt(data);
      setLoading(false);
    });

    try {
      const saved = sessionStorage.getItem('sb_checkout_slots');
      if (saved) {
        setSlots(JSON.parse(saved));
      } else {
        const start = searchParams.get('start') || '18:00';
        const end = searchParams.get('end') || '19:00';
        const price = Number(searchParams.get('price')) || 250000;
        setSlots([
          {
            id: `${dateParam}_${start}`,
            start,
            end,
            startIso: `${dateParam}T${start}:00.000Z`,
            endIso: `${dateParam}T${end}:00.000Z`,
            price
          }
        ]);
      }
    } catch {
      setSlots([]);
    }
  }, [courtId, dateParam, searchParams]);

  const totalAmount = slots.reduce((sum, s) => sum + (s.price || 0), 0);
  const depositRequired = Math.round(totalAmount * 0.20);

  const handleProceedToPayment = async () => {
    if (!isAuthenticated) {
      showToast('Vui lòng đăng nhập để hoàn tất đặt sân.', 'warning');
      navigate(ROUTES.LOGIN);
      return;
    }

    if (!fullName.trim() || !phone.trim()) {
      showToast('Vui lòng nhập đầy đủ họ tên và số điện thoại người nhận sân.', 'warning');
      return;
    }

    if (slots.length === 0) {
      showToast('Không tìm thấy khung giờ nào được chọn.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      // Chuẩn hóa items theo Database_Design.md v2.0
      const items = slots.map((s) => {
        const [sh, sm] = (s.start || '18:00').split(':').map(Number);
        const [eh, em] = (s.end || '19:00').split(':').map(Number);
        const durationMinutes = Math.max(30, (eh * 60 + em) - (sh * 60 + sm));
        return {
          bookingDate: dateParam,
          startAt: s.startIso || `${dateParam}T${s.start}:00.000Z`,
          endAt: s.endIso || `${dateParam}T${s.end}:00.000Z`,
          durationMinutes,
          unitPrice: s.price,
          amount: s.price
        };
      });

      // Khi bấm "Đến thanh toán", tạo booking và giữ chỗ (booking_slots.status = 'HOLD')
      const result = await bookingMockService.createBooking({
        customerId: user._id,
        courtId,
        items,
        paymentOption: 'DEPOSIT_20_PERCENT',
        note
      });

      sessionStorage.removeItem('sb_checkout_slots');
      sessionStorage.removeItem('sb_checkout_date');

      showToast('Đã giữ chỗ sân (HOLD)! Vui lòng chọn mức thanh toán ở bước tiếp theo.', 'success');
      navigate(`/payment/${result.booking._id}`);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '80px' }}>Đang tải thông tin đặt sân...</div>;
  }

  if (!court) {
    return <div style={{ textAlign: 'center', padding: '80px' }}>Không tìm thấy sân.</div>;
  }

  return (
    <div style={{ padding: '36px 0 64px' }}>
      <div className="container" style={{ maxWidth: '1000px' }}>
        <h1 style={{ fontSize: '1.85rem', marginBottom: '8px' }}>Nhập thông tin người đặt sân</h1>
        <p style={{ color: 'var(--sb-text-secondary)', marginBottom: '32px' }}>
          Điền thông tin liên hệ và bấm <strong>Đến thanh toán</strong> để hệ thống tiến hành <strong>Giữ chỗ sân (HOLD)</strong>
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '32px',
          alignItems: 'start'
        }}>
          {/* Cột trái: Thông tin cá nhân người đặt sân */}
          <div>
            <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '16px' }}>Thông tin cá nhân người nhận sân</h3>

              <div className="form-group">
                <label className="form-label">Họ và tên người nhận sân <span className="required">*</span></label>
                <input
                  type="text"
                  className="form-control"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Số điện thoại liên hệ <span className="required">*</span></label>
                <input
                  type="tel"
                  className="form-control"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email nhận mã booking & vé</label>
                <input
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Ghi chú cho ban quản lý cơ sở</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Ví dụ: Cần mượn thêm áo pitch, chuẩn bị bình nước đá..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            </div>

            {/* Chính sách cam kết rõ ràng */}
            <div className="card" style={{ padding: '20px', backgroundColor: 'var(--sb-background)' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'start' }}>
                <ShieldCheck size={24} color="var(--sb-primary-600)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '0.825rem', color: 'var(--sb-text-secondary)', lineHeight: 1.5 }}>
                  <div style={{ fontWeight: 700, color: 'var(--sb-text-primary)', marginBottom: '4px' }}>
                    Quy định giữ chỗ & Thanh toán:
                  </div>
                  <div>• Khi bấm <strong>Đến thanh toán</strong>, hệ thống chuyển các khung giờ đã chọn sang trạng thái <strong>Giữ chỗ (HOLD)</strong> trong <strong>1 giờ</strong>.</div>
                  <div>• Tại màn hình thanh toán kế tiếp, bạn sẽ chọn <strong>Thanh toán 100%</strong> hoặc <strong>Đặt cọc 20%</strong>.</div>
                  <div>• <strong>Thời hạn hủy đơn:</strong> Được phép hủy và hoàn tiền trong vòng <strong>24 giờ</strong> kể từ lúc tạo đơn.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Cột phải: Tóm tắt đơn hàng & nút Đến thanh toán */}
          <div>
            <div className="card" style={{ padding: '24px', position: 'sticky', top: '96px', boxShadow: 'var(--sb-shadow-md)' }}>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '16px' }}>Chi tiết đặt sân ({slots.length} khung giờ)</h3>

              <div style={{ display: 'flex', gap: '12px', paddingBottom: '16px', borderBottom: '1px solid var(--sb-border)', marginBottom: '16px' }}>
                <img
                  src={resolveAssetUrl(court.images?.[0], 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=150&q=80')}
                  alt={court.name}
                  style={{ width: '64px', height: '64px', borderRadius: 'var(--sb-radius-md)', objectFit: 'cover' }}
                />
                <div>
                  <h4 style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: 700 }}>{court.name}</h4>
                  <div style={{ fontSize: '0.8rem', color: 'var(--sb-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={13} /> {court.facility?.name}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--sb-text-secondary)', marginTop: '2px' }}>
                    Ngày thi đấu: <strong>{formatDate(dateParam)}</strong>
                  </div>
                </div>
              </div>

              {/* Danh sách khung giờ */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--sb-text-secondary)', marginBottom: '8px' }}>
                  Các khung giờ đã chọn:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {slots.map((s, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: 'var(--sb-background)', borderRadius: '6px', fontSize: '0.85rem' }}>
                      <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={14} color="var(--sb-primary-600)" /> {s.start} - {s.end}
                      </span>
                      <span style={{ fontWeight: 700, color: 'var(--sb-primary-700)' }}>{formatCurrency(s.price)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bảng tính chi phí */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--sb-border)', paddingTop: '16px', marginBottom: '20px', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Tổng tiền sân (100%):</span>
                  <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--sb-primary-700)' }}>
                    {formatCurrency(totalAmount)}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--sb-text-secondary)', fontSize: '0.825rem' }}>
                  <span>Mức đặt cọc tối thiểu (20%):</span>
                  <span style={{ fontWeight: 700, color: 'var(--sb-accent-600)' }}>{formatCurrency(depositRequired)}</span>
                </div>
              </div>

              {/* Nút Đến thanh toán */}
              <button
                type="button"
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                disabled={submitting || slots.length === 0}
                onClick={handleProceedToPayment}
              >
                {submitting ? 'Đang giữ chỗ sân...' : 'Đến thanh toán'} <ArrowRight size={18} />
              </button>

              <div style={{ fontSize: '0.75rem', color: 'var(--sb-text-muted)', textAlign: 'center' }}>
                Khi bấm "Đến thanh toán", trạng thái khung giờ sẽ chuyển sang <strong>Giữ chỗ (HOLD)</strong> và bạn sẽ chọn Thanh toán 100% hoặc Đặt cọc 20%.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;
