import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { courtMockService } from '../../../mock/services/courtMockService.js';
import { favoriteMockService } from '../../../mock/services/favoriteMockService.js';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useToast } from '../../contexts/ToastContext.jsx';
import { formatCurrency, formatDate, getDayName } from '../../utils/formatters.js';
import { resolveAssetUrl } from '../../utils/fileUploadHelper.js';
import { 
  MapPin, 
  Clock, 
  Star, 
  Heart, 
  Calendar, 
  CheckCircle, 
  AlertCircle, 
  ShieldCheck, 
  Users,
  Sun,
  Zap,
  ArrowRight,
  Info
} from 'lucide-react';

export function CourtDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [court, setCourt] = useState(null);
  const [selectedDate, setSelectedDate] = useState('2026-11-04');
  const [slots, setSlots] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [isFav, setIsFav] = useState(false);
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    courtMockService.getById(id).then((data) => {
      setCourt(data);
      setLoading(false);
    });

    if (user) {
      favoriteMockService.isFavorited(user._id, 'COURT', id).then(setIsFav);
    }
  }, [id, user]);

  useEffect(() => {
    if (court && selectedDate) {
      setSlotsLoading(true);
      setSelectedSlots([]);
      courtMockService.getAvailableSlots(court._id, selectedDate).then((slotData) => {
        setSlots(slotData);
        setSlotsLoading(false);
      });
    }
  }, [court, selectedDate]);

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      showToast('Vui lòng đăng nhập để lưu sân yêu thích.', 'warning');
      return;
    }
    const newState = await favoriteMockService.toggleFavorite(user._id, 'COURT', id);
    setIsFav(newState);
    showToast(newState ? 'Đã thêm sân vào yêu thích!' : 'Đã bỏ yêu thích sân.', 'info');
  };

  const handleSlotClick = (slot) => {
    if (selectedSlots.some((s) => s.id === slot.id)) {
      setSelectedSlots(selectedSlots.filter((s) => s.id !== slot.id));
    } else {
      setSelectedSlots([...selectedSlots, slot].sort((a, b) => a.start.localeCompare(b.start)));
    }
  };

  const totalAmount = selectedSlots.reduce((sum, s) => sum + s.price, 0);
  const depositAmount = Math.round(totalAmount * 0.2);

  const handleProceedCheckout = () => {
    if (selectedSlots.length === 0) {
      showToast('Vui lòng chọn ít nhất một khung giờ còn trống trước khi tiếp tục.', 'warning');
      return;
    }
    if (!isAuthenticated) {
      showToast('Vui lòng đăng nhập để tiến hành đặt sân.', 'info');
      navigate(`/login?redirect=/courts/${court._id}`);
      return;
    }

    // Lưu mảng slot được chọn vào sessionStorage để checkout nhận chính xác
    sessionStorage.setItem('sb_checkout_slots', JSON.stringify(selectedSlots));
    sessionStorage.setItem('sb_checkout_date', selectedDate);
    navigate(`/checkout/${court._id}?date=${selectedDate}`);
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '80px' }}>Đang tải thông tin sân thể thao...</div>;
  }

  if (!court) {
    return (
      <div className="container" style={{ padding: '60px 0', textAlign: 'center' }}>
        <h2>Không tìm thấy sân thể thao này</h2>
        <Link to="/search" className="btn btn-primary" style={{ marginTop: '16px' }}>
          Tìm sân khác
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px 0 64px' }}>
      <div className="container">
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--sb-text-muted)', marginBottom: '20px' }}>
          <Link to="/" style={{ color: 'var(--sb-text-secondary)' }}>Trang chủ</Link>
          <span>/</span>
          <Link to="/facilities" style={{ color: 'var(--sb-text-secondary)' }}>{court.facility?.name}</Link>
          <span>/</span>
          <span style={{ color: 'var(--sb-text-primary)', fontWeight: 600 }}>{court.name}</span>
        </div>

        {/* Gallery */}
        <div style={{
          height: '360px',
          borderRadius: 'var(--sb-radius-xl)',
          overflow: 'hidden',
          position: 'relative',
          marginBottom: '32px'
        }}>
          <img
            src={resolveAssetUrl(court.images?.[0], 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80')}
            alt={court.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{
            position: 'absolute',
            bottom: '20px',
            left: '20px',
            backgroundColor: 'rgba(23, 43, 37, 0.9)',
            color: '#FFFFFF',
            padding: '8px 16px',
            borderRadius: 'var(--sb-radius-md)',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backdropFilter: 'blur(4px)'
          }}>
            <Sun size={16} color="var(--sb-accent-400)" />
            <span>{court.attributes?.indoor ? 'Trong nhà có điều hòa' : 'Ngoài trời thoáng đãng'}</span>
          </div>
        </div>

        {/* Court Title & Main actions */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'start',
          justifyContent: 'space-between',
          gap: '20px',
          borderBottom: '1px solid var(--sb-border)',
          paddingBottom: '24px',
          marginBottom: '32px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="badge badge-success">Sẵn sàng đặt sân</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: 'var(--sb-warning)' }}>
                <Star size={16} fill="currentColor" />
                <span style={{ fontWeight: 700, color: 'var(--sb-text-primary)' }}>{court.rating}</span>
                <span style={{ color: 'var(--sb-text-muted)' }}>({court.reviewCount} đánh giá)</span>
              </div>
            </div>

            <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>{court.name}</h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--sb-text-secondary)', fontSize: '0.95rem' }}>
              <Building2Icon size={16} color="var(--sb-primary-600)" />
              <Link to={`/facilities/${court.facility?._id}`} style={{ fontWeight: 600, color: 'var(--sb-primary-700)' }}>
                {court.facility?.name}
              </Link>
              <span>•</span>
              <MapPin size={16} color="var(--sb-text-muted)" />
              {court.facility?.address?.detail || court.facility?.address?.fullAddress}, {court.facility?.address?.district}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleToggleFavorite}
              className={`btn ${isFav ? 'btn-danger' : 'btn-secondary'}`}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Heart size={18} fill={isFav ? 'currentColor' : 'none'} />
              {isFav ? 'Đã yêu thích' : 'Yêu thích'}
            </button>
          </div>
        </div>

        {/* 2-Columns grid: Slot Picker and Sticky Booking Box */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '32px',
          alignItems: 'start'
        }} className="court-content-grid">
          {/* CỘT TRÁI: CHỌN NGÀY VÀ KHUNG GIỜ */}
          <div>
            <div className="card" style={{ padding: '24px', marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '1.25rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={20} color="var(--sb-primary-600)" /> Chọn ngày & khung giờ (Đặt nhiều khung giờ)
                </h2>
                <span className="badge badge-info" style={{ fontSize: '0.8rem' }}>
                  Có thể chọn nhiều khung giờ
                </span>
              </div>

              {/* Date Input */}
              <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <div>
                  <label className="form-label">Chọn ngày thi đấu:</label>
                  <input
                    type="date"
                    className="form-control"
                    value={selectedDate}
                    min="2026-11-03"
                    max="2026-11-20"
                    onChange={(e) => setSelectedDate(e.target.value)}
                    style={{ width: '220px' }}
                  />
                </div>
                <div style={{ alignSelf: 'flex-end', fontSize: '0.85rem', color: 'var(--sb-text-muted)', paddingBottom: '8px' }}>
                  Ngày: {formatDate(selectedDate)} ({getDayName(selectedDate)})
                </div>
              </div>

              {/* Status explanation legend */}
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '16px',
                padding: '12px 16px',
                backgroundColor: 'var(--sb-background)',
                borderRadius: 'var(--sb-radius-md)',
                fontSize: '0.8rem',
                marginBottom: '24px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '14px', height: '14px', borderRadius: '4px', backgroundColor: '#FFFFFF', border: '2px solid var(--sb-primary-600)' }} />
                  <span>Trống (Bấm chọn)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '14px', height: '14px', borderRadius: '4px', backgroundColor: 'var(--sb-primary-600)' }} />
                  <span>Đang chọn ({selectedSlots.length})</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '14px', height: '14px', borderRadius: '4px', backgroundColor: '#E5EBE7', border: '1px solid #CCC' }} />
                  <span>Đã đặt</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '14px', height: '14px', borderRadius: '4px', backgroundColor: 'var(--sb-warning-bg)', border: '1px solid var(--sb-warning)' }} />
                  <span>Đang giữ chỗ (1h)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '14px', height: '14px', borderRadius: '4px', backgroundColor: 'var(--sb-danger-bg)', border: '1px solid var(--sb-danger)' }} />
                  <span>Bảo trì</span>
                </div>
              </div>

              {/* Slots Grid */}
              {slotsLoading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>Đang tra cứu lịch trống...</div>
              ) : slots.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--sb-text-muted)' }}>
                  Sân không mở cửa vào ngày này.
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                  gap: '12px'
                }}>
                  {slots.map((slot) => {
                    const isSelected = selectedSlots.some((s) => s.id === slot.id);
                    const isAvailable = slot.status === 'AVAILABLE';

                    let btnStyle = {
                      padding: '12px 8px',
                      borderRadius: 'var(--sb-radius-md)',
                      textAlign: 'center',
                      border: '1px solid var(--sb-border)',
                      backgroundColor: '#FFFFFF',
                      cursor: 'pointer',
                      transition: 'all var(--sb-transition)',
                      position: 'relative'
                    };

                    if (isSelected) {
                      btnStyle.backgroundColor = 'var(--sb-primary-600)';
                      btnStyle.borderColor = 'var(--sb-primary-600)';
                      btnStyle.color = '#FFFFFF';
                    } else if (slot.status === 'BOOKED') {
                      btnStyle.backgroundColor = 'var(--sb-border-subtle)';
                      btnStyle.color = 'var(--sb-text-muted)';
                      btnStyle.cursor = 'not-allowed';
                    } else if (slot.status === 'HOLD') {
                      btnStyle.backgroundColor = 'var(--sb-warning-bg)';
                      btnStyle.borderColor = 'var(--sb-warning)';
                      btnStyle.color = 'var(--sb-warning)';
                      btnStyle.cursor = 'not-allowed';
                    } else if (slot.status === 'BLOCKED') {
                      btnStyle.backgroundColor = 'var(--sb-danger-bg)';
                      btnStyle.borderColor = 'var(--sb-danger)';
                      btnStyle.color = 'var(--sb-danger)';
                      btnStyle.cursor = 'not-allowed';
                    } else {
                      btnStyle[':hover'] = { borderColor: 'var(--sb-primary-600)' };
                    }

                    return (
                      <button
                        key={slot.id}
                        type="button"
                        disabled={!isAvailable}
                        onClick={() => handleSlotClick(slot)}
                        style={btnStyle}
                        title={slot.reason || ''}
                      >
                        <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                          {slot.start} - {slot.end}
                        </div>
                        <div style={{ fontSize: '0.75rem', marginTop: '2px', opacity: isSelected ? 0.9 : 0.8 }}>
                          {isAvailable ? formatCurrency(slot.price) : slot.status === 'BOOKED' ? 'Đã đặt' : slot.status === 'HOLD' ? 'Giữ chỗ' : 'Bảo trì'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Thông tin mô tả & quy định */}
            <div className="card" style={{ padding: '24px', marginBottom: '32px' }}>
              <h3 style={{ marginBottom: '12px' }}>Đặc tính kỹ thuật sân</h3>
              <p style={{ lineHeight: 1.6, marginBottom: '20px' }}>{court.description}</p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <ShieldCheck size={20} color="var(--sb-primary-600)" />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--sb-text-muted)' }}>Mặt sân</div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{court.attributes?.surfaceType || 'Tiêu chuẩn'}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Users size={20} color="var(--sb-primary-600)" />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--sb-text-muted)' }}>Sức chứa tối đa</div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{court.capacity} người thi đấu</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Zap size={20} color="var(--sb-primary-600)" />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--sb-text-muted)' }}>Hệ thống chiếu sáng</div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Đèn LED chuyên dụng</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Đánh giá */}
            <div className="card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ margin: 0 }}>Đánh giá cho sân này ({court.reviews?.length || 0})</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
                  <Star size={16} fill="var(--sb-warning)" color="var(--sb-warning)" /> {court.rating} / 5.0
                </div>
              </div>

              {court.reviews?.length === 0 ? (
                <div style={{ color: 'var(--sb-text-muted)', fontSize: '0.875rem' }}>
                  Chưa có đánh giá nào cho sân này.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {court.reviews?.map((r) => (
                    <div key={r._id} style={{ borderBottom: '1px solid var(--sb-border-subtle)', paddingBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Khách hàng thể thao</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--sb-text-muted)' }}>{formatDate(r.createdAt)}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '2px', color: 'var(--sb-warning)', marginBottom: '6px' }}>
                        {[...Array(r.rating)].map((_, i) => (
                          <Star key={i} size={13} fill="currentColor" />
                        ))}
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--sb-text-secondary)', margin: 0 }}>{r.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* CỘT PHẢI: STICKY BOOKING SUMMARY PANEL */}
          <aside>
            <div className="card" style={{ padding: '24px', position: 'sticky', top: '96px', boxShadow: 'var(--sb-shadow-md)' }}>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '16px' }}>Tóm tắt đơn đặt sân</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--sb-text-muted)' }}>Sân thi đấu:</span>
                  <span style={{ fontWeight: 600 }}>{court.name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--sb-text-muted)' }}>Cơ sở:</span>
                  <span style={{ fontWeight: 600 }}>{court.facility?.name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--sb-text-muted)' }}>Ngày đặt:</span>
                  <span style={{ fontWeight: 600 }}>{formatDate(selectedDate)}</span>
                </div>
                <div>
                  <div style={{ color: 'var(--sb-text-muted)', marginBottom: '6px' }}>Khung giờ đã chọn ({selectedSlots.length}):</div>
                  {selectedSlots.length === 0 ? (
                    <span style={{ color: 'var(--sb-text-muted)', fontStyle: 'italic' }}>Chưa chọn khung giờ nào</span>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {selectedSlots.map((s) => (
                        <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', backgroundColor: 'var(--sb-primary-50)', borderRadius: '4px', fontSize: '0.8rem' }}>
                          <span style={{ fontWeight: 600, color: 'var(--sb-primary-700)' }}>{s.start} - {s.end}</span>
                          <span style={{ fontWeight: 600 }}>{formatCurrency(s.price)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div style={{
                borderTop: '1px solid var(--sb-border)',
                paddingTop: '16px',
                marginBottom: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontWeight: 600, color: 'var(--sb-text-primary)' }}>Tổng tiền booking:</span>
                  <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--sb-primary-700)' }}>
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
                {selectedSlots.length > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--sb-text-secondary)' }}>
                    <span>Số tiền cọc tối thiểu (20%):</span>
                    <span style={{ fontWeight: 700, color: 'var(--sb-accent-600)' }}>{formatCurrency(depositAmount)}</span>
                  </div>
                )}
              </div>

              <button
                type="button"
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginBottom: '16px' }}
                disabled={selectedSlots.length === 0}
                onClick={handleProceedCheckout}
              >
                Tiến hành đặt sân ({selectedSlots.length} slot) <ArrowRight size={18} />
              </button>

              <div style={{ backgroundColor: 'var(--sb-background)', padding: '12px', borderRadius: '8px', fontSize: '0.75rem', color: 'var(--sb-text-secondary)', lineHeight: 1.5 }}>
                <div style={{ fontWeight: 700, marginBottom: '4px', color: 'var(--sb-primary-700)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Info size={14} /> Chính sách theo quy định:
                </div>
                <div>• Được chọn thanh toán 100% hoặc <strong>đặt cọc 20%</strong>.</div>
                <div>• Hạn thanh toán: <strong>1 giờ</strong> sau khi đặt.</div>
                <div>• Hủy & hoàn tiền: trong <strong>24 giờ</strong> từ lúc tạo đơn. Sau 24h không hoàn tiền.</div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .court-content-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

function Building2Icon({ size = 16, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/>
      <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/>
      <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/>
      <path d="M10 6h4"/>
      <path d="M10 10h4"/>
      <path d="M10 14h4"/>
      <path d="M10 18h4"/>
    </svg>
  );
}

export default CourtDetailPage;
