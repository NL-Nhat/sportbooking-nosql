import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { facilityMockService } from '../../../mock/services/facilityMockService.js';
import { courtMockService } from '../../../mock/services/courtMockService.js';
import { favoriteMockService } from '../../../mock/services/favoriteMockService.js';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useToast } from '../../contexts/ToastContext.jsx';
import { formatCurrency, formatDate } from '../../utils/formatters.js';
import { resolveAssetUrl } from '../../utils/fileUploadHelper.js';
import { 
  MapPin, 
  Clock, 
  Star, 
  Heart, 
  CheckCircle, 
  Share2, 
  Trophy, 
  ArrowLeft,
  MessageSquare
} from 'lucide-react';

export function FacilityDetailPage() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [facility, setFacility] = useState(null);
  const [courts, setCourts] = useState([]);
  const [isFav, setIsFav] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    facilityMockService.getById(id).then((fac) => {
      setFacility(fac);
      if (fac) {
        courtMockService.getAll({ facilityId: fac._id }).then(setCourts);
      }
      setLoading(false);
    });

    if (user) {
      favoriteMockService.isFavorited(user._id, 'FACILITY', id).then(setIsFav);
    }
  }, [id, user]);

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      showToast('Vui lòng đăng nhập để lưu cơ sở yêu thích.', 'warning');
      return;
    }
    const newState = await favoriteMockService.toggleFavorite(user._id, 'FACILITY', id);
    setIsFav(newState);
    showToast(newState ? 'Đã thêm vào cơ sở yêu thích!' : 'Đã bỏ yêu thích cơ sở.', 'info');
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '80px' }}>Đang tải thông tin cơ sở...</div>;
  }

  if (!facility) {
    return (
      <div className="container" style={{ padding: '60px 0', textAlign: 'center' }}>
        <h2>Không tìm thấy cơ sở thể thao</h2>
        <Link to="/facilities" className="btn btn-primary" style={{ marginTop: '16px' }}>
          Quay lại danh sách
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
          <Link to="/facilities" style={{ color: 'var(--sb-text-secondary)' }}>Cơ sở</Link>
          <span>/</span>
          <span style={{ color: 'var(--sb-text-primary)', fontWeight: 600 }}>{facility.name}</span>
        </div>

        {/* Gallery */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '16px',
          height: '380px',
          borderRadius: 'var(--sb-radius-xl)',
          overflow: 'hidden',
          marginBottom: '32px'
        }} className="facility-gallery">
          <img
            src={resolveAssetUrl(facility.images?.[0], 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1000&q=80')}
            alt={facility.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: '16px' }}>
            <img
              src={resolveAssetUrl(facility.images?.[1], 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=600&q=80')}
              alt={facility.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <img
              src={resolveAssetUrl(facility.images?.[2], 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=600&q=80')}
              alt={facility.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        </div>

        {/* Header Title & Actions */}
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
              <span className="badge badge-success">Đã kiểm duyệt & Đạt chuẩn</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: 'var(--sb-warning)' }}>
                <Star size={16} fill="currentColor" />
                <span style={{ fontWeight: 700, color: 'var(--sb-text-primary)' }}>{facility.rating}</span>
                <span style={{ color: 'var(--sb-text-muted)' }}>({facility.reviewCount} đánh giá)</span>
              </div>
            </div>

            <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>{facility.name}</h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--sb-text-secondary)', fontSize: '0.95rem' }}>
              <MapPin size={18} color="var(--sb-primary-600)" />
              {facility.address?.detail}, {facility.address?.ward}, Quận {facility.address?.district}, TP. {facility.address?.province}
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

        {/* 2-Columns info & courts */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '32px',
          alignItems: 'start'
        }} className="facility-content-grid">
          {/* Cột trái: Danh sách sân & Giới thiệu */}
          <div>
            {/* Giới thiệu */}
            <div className="card" style={{ padding: '24px', marginBottom: '32px' }}>
              <h3 style={{ marginBottom: '12px' }}>Giới thiệu cơ sở</h3>
              <p style={{ lineHeight: 1.7, marginBottom: '20px' }}>{facility.description}</p>

              <h4 style={{ fontSize: '0.95rem', marginBottom: '12px' }}>Tiện ích sẵn có</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                {facility.amenities?.map((amenity, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', color: 'var(--sb-text-primary)' }}>
                    <CheckCircle size={16} color="var(--sb-success)" />
                    {amenity}
                  </div>
                ))}
              </div>
            </div>

            {/* Danh sách sân thuộc cơ sở */}
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '1.4rem', marginBottom: '16px' }}>
                Các sân thể thao tại cơ sở ({courts.length})
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {courts.map((court) => (
                  <div key={court._id} className="card card-hover" style={{
                    padding: '16px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: '20px'
                  }}>
                    <img
                      src={resolveAssetUrl(court.images?.[0], 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=300&q=80')}
                      alt={court.name}
                      style={{ width: '120px', height: '90px', borderRadius: '10px', objectFit: 'cover' }}
                    />
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span className="badge badge-default">{court.category?.name}</span>
                        {court.attributes?.indoor && <span className="badge badge-info">Trong nhà</span>}
                      </div>
                      <h3 style={{ fontSize: '1.05rem', margin: '0 0 6px' }}>{court.name}</h3>
                      <div style={{ fontSize: '0.8rem', color: 'var(--sb-text-muted)' }}>
                        Mặt sân: {court.attributes?.surfaceType || 'Tiêu chuẩn'} • Sức chứa: {court.capacity} người
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--sb-text-muted)' }}>Giá tham khảo</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--sb-primary-700)', marginBottom: '8px' }}>
                        {formatCurrency(court.priceMin)} <span style={{ fontSize: '0.75rem', fontWeight: 400 }}>/ slot</span>
                      </div>
                      <Link to={`/courts/${court._id}`} className="btn btn-primary btn-sm">
                        Xem lịch & Đặt sân
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Đánh giá từ khách hàng */}
            <div className="card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MessageSquare size={20} color="var(--sb-primary-600)" /> Đánh giá thực tế ({facility.reviews?.length || 0})
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '1.1rem' }}>
                  <Star size={18} fill="var(--sb-warning)" color="var(--sb-warning)" /> {facility.rating} / 5.0
                </div>
              </div>

              {facility.reviews?.length === 0 ? (
                <div style={{ color: 'var(--sb-text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '20px' }}>
                  Chưa có đánh giá nào cho cơ sở này.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {facility.reviews?.map((rev) => (
                    <div key={rev._id} style={{ borderBottom: '1px solid var(--sb-border-subtle)', paddingBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{rev.customer?.fullName || 'Khách thể thao'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--sb-text-muted)' }}>{formatDate(rev.createdAt)}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '2px', color: 'var(--sb-warning)', marginBottom: '8px' }}>
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} size={14} fill="currentColor" />
                        ))}
                      </div>
                      <p style={{ fontSize: '0.875rem', color: 'var(--sb-text-secondary)', lineHeight: 1.5, margin: 0 }}>
                        {rev.content}
                      </p>

                      {rev.ownerReply && (
                        <div style={{
                          marginTop: '12px',
                          padding: '12px',
                          backgroundColor: 'var(--sb-primary-50)',
                          borderRadius: '8px',
                          fontSize: '0.825rem'
                        }}>
                          <div style={{ fontWeight: 600, color: 'var(--sb-primary-900)', marginBottom: '4px' }}>
                            Phản hồi từ Chủ sân:
                          </div>
                          <div style={{ color: 'var(--sb-text-secondary)' }}>{rev.ownerReply.content}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Cột phải: Thông tin liên hệ & Giờ hoạt động */}
          <aside>
            <div className="card" style={{ padding: '24px', position: 'sticky', top: '96px' }}>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '16px' }}>Thông tin hoạt động</h3>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <Clock size={20} color="var(--sb-primary-600)" />
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--sb-text-muted)' }}>Khung giờ cho thuê (theo lịch các sân)</div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                    {facility.hoursSummary
                      ? `${facility.hoursSummary.startTime} - ${facility.hoursSummary.endTime} hằng ngày`
                      : 'Chưa cấu hình lịch hoạt động'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <MapPin size={20} color="var(--sb-primary-600)" />
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--sb-text-muted)' }}>Tọa độ vị trí (Bản đồ)</div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                    {facility.location?.coordinates?.[1]}, {facility.location?.coordinates?.[0]}
                  </div>
                </div>
              </div>

              {/* Minh họa Map Demo */}
              <div style={{
                height: '160px',
                borderRadius: 'var(--sb-radius-md)',
                backgroundColor: '#E5EBE7',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--sb-text-secondary)',
                fontSize: '0.85rem',
                border: '1px solid var(--sb-border)',
                marginBottom: '20px'
              }}>
                <MapPin size={32} color="var(--sb-danger)" style={{ marginBottom: '8px' }} />
                <span>Bản đồ vị trí GPS Đà Nẵng</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--sb-text-muted)' }}>{facility.address?.district}</span>
              </div>

              <a
                href={`https://maps.google.com/?q=${facility.location?.coordinates?.[1]},${facility.location?.coordinates?.[0]}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary btn-sm"
                style={{ width: '100%' }}
              >
                Chỉ đường trên Google Maps
              </a>
            </div>
          </aside>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .facility-gallery {
            grid-template-columns: 1fr !important;
            height: auto !important;
          }
          .facility-content-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

export default FacilityDetailPage;
