import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { courtMockService } from '../../../mock/services/courtMockService.js';
import { facilityMockService } from '../../../mock/services/facilityMockService.js';
import { formatCurrency } from '../../utils/formatters.js';
import { resolveAssetUrl } from '../../utils/fileUploadHelper.js';
import { ROUTES } from '../../constants/routes.js';
import { 
  Search, 
  MapPin, 
  Calendar, 
  Clock, 
  Trophy, 
  Activity, 
  Target, 
  Zap, 
  Star, 
  ArrowRight, 
  CheckCircle, 
  ShieldCheck, 
  Users 
} from 'lucide-react';

export function HomePage() {
  const navigate = useNavigate();
  const [featuredCourts, setFeaturedCourts] = useState([]);
  const [featuredFacilities, setFeaturedFacilities] = useState([]);

  // Search form state
  const [selectedSport, setSelectedSport] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedDate, setSelectedDate] = useState('2026-11-04');
  const [selectedTime, setSelectedTime] = useState('18:00');

  useEffect(() => {
    courtMockService.getAll({ publicOnly: true }).then((res) => {
      setFeaturedCourts(res.slice(0, 4));
    });
    facilityMockService.getAll({ onlyApproved: true }).then((res) => {
      setFeaturedFacilities(res.slice(0, 3));
    });
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (selectedSport) params.set('category', selectedSport);
    if (selectedDistrict) params.set('district', selectedDistrict);
    if (selectedDate) params.set('date', selectedDate);
    if (selectedTime) params.set('time', selectedTime);
    navigate(`/search?${params.toString()}`);
  };

  const sports = [
    { code: 'FOOTBALL', name: 'Bóng đá', count: '6 sân', icon: Trophy, bg: '#E5F4EE', color: '#216B59' },
    { code: 'BADMINTON', name: 'Cầu lông', count: '6 sân', icon: Activity, bg: '#EAF3FC', color: '#3478B8' },
    { code: 'TENNIS', name: 'Tennis', count: '5 sân', icon: Target, bg: '#FFF5DF', color: '#C78319' },
    { code: 'PICKLEBALL', name: 'Pickleball', count: '4 sân', icon: Zap, bg: '#FFF3D9', color: '#D98E20' }
  ];

  const districts = ['Hải Châu', 'Sơn Trà', 'Ngũ Hành Sơn', 'Thanh Khê', 'Cẩm Lệ', 'Liên Chiểu'];

  return (
    <div>
      {/* 1. HERO SECTION */}
      <section style={{
        position: 'relative',
        minHeight: '520px',
        backgroundImage: `linear-gradient(rgba(18, 59, 50, 0.72), rgba(18, 59, 50, 0.85)), url('https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1920&q=80')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        padding: '60px 0 80px'
      }}>
        <div className="container">
          <div style={{ maxWidth: '640px', marginBottom: '32px' }}>
            <span style={{
              display: 'inline-block',
              padding: '6px 14px',
              backgroundColor: 'rgba(242, 169, 59, 0.2)',
              color: 'var(--sb-accent-500)',
              borderRadius: 'var(--sb-radius-full)',
              fontSize: '0.8rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '16px'
            }}>
              ⚽ Hệ thống đặt sân trực tuyến số 1 Đà Nẵng
            </span>
            <h1 style={{ color: '#FFFFFF', fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '16px' }}>
              Tìm sân tập & giao lưu thể thao dễ dàng
            </h1>
            <p style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '1.05rem', lineHeight: 1.6 }}>
              Xem lịch trống thời gian thực, giữ slot trong 30 giây với mức giá ưu đãi từ các sân cỏ, thảm cầu lông, tennis & pickleball tiêu chuẩn.
            </p>
          </div>

          {/* Quick Search Floating Panel */}
          <div className="card" style={{
            backgroundColor: '#FFFFFF',
            padding: '24px',
            boxShadow: 'var(--sb-shadow-lg)',
            borderRadius: 'var(--sb-radius-xl)'
          }}>
            <form onSubmit={handleSearchSubmit} style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr)) 140px',
              gap: '16px',
              alignItems: 'end'
            }}>
              <div>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Trophy size={15} color="var(--sb-primary-600)" /> Môn thể thao
                </label>
                <select
                  className="form-control"
                  value={selectedSport}
                  onChange={(e) => setSelectedSport(e.target.value)}
                >
                  <option value="">Tất cả các môn</option>
                  <option value="690100000000000000000001">Bóng đá</option>
                  <option value="690100000000000000000002">Cầu lông</option>
                  <option value="690100000000000000000003">Tennis</option>
                  <option value="690100000000000000000004">Pickleball</option>
                </select>
              </div>

              <div>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={15} color="var(--sb-primary-600)" /> Khu vực quận
                </label>
                <select
                  className="form-control"
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                >
                  <option value="">Toàn thành phố</option>
                  {districts.map((d) => (
                    <option key={d} value={d}>Quận {d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={15} color="var(--sb-primary-600)" /> Ngày đặt
                </label>
                <input
                  type="date"
                  className="form-control"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>

              <div>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={15} color="var(--sb-primary-600)" /> Giờ bắt đầu
                </label>
                <select
                  className="form-control"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                >
                  <option value="06:00">06:00 Sáng</option>
                  <option value="07:00">07:00 Sáng</option>
                  <option value="16:00">16:00 Chiều</option>
                  <option value="17:00">17:00 Chiều</option>
                  <option value="18:00">18:00 Tối</option>
                  <option value="19:00">19:00 Tối</option>
                  <option value="20:00">20:00 Tối</option>
                </select>
              </div>

              <div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '44px' }}>
                  <Search size={18} /> Tìm sân
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* 2. SPORTS CATEGORIES */}
      <section style={{ padding: '60px 0 30px' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ marginBottom: '8px' }}>Các bộ môn thể thao sôi động</h2>
            <p>Chọn bộ môn bạn quan tâm để khám phá danh sách sân tập đạt chuẩn</p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px'
          }}>
            {sports.map((s) => {
              const Icon = s.icon;
              return (
                <Link
                  key={s.code}
                  to={`/sports/${s.code}`}
                  className="card card-hover"
                  style={{
                    padding: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    textDecoration: 'none'
                  }}
                >
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '16px',
                    backgroundColor: s.bg,
                    color: s.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Icon size={28} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', margin: '0 0 4px', color: 'var(--sb-text-primary)' }}>{s.name}</h3>
                    <div style={{ fontSize: '0.825rem', color: 'var(--sb-text-muted)' }}>{s.count} đang hoạt động</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. FEATURED COURTS */}
      <section style={{ padding: '40px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
            <div>
              <h2 style={{ marginBottom: '6px' }}>Sân nổi bật được yêu thích</h2>
              <p>Mặt sân cao cấp, đèn chiếu sáng ban đêm chất lượng và được đánh giá cao</p>
            </div>
            <Link to={ROUTES.SEARCH} className="btn btn-outline-primary btn-sm">
              Xem tất cả sân <ArrowRight size={16} />
            </Link>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px'
          }}>
            {featuredCourts.map((court) => (
              <div key={court._id} className="card card-hover" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ position: 'relative', width: '100%', height: '180px', overflow: 'hidden' }}>
                  <img
                    src={resolveAssetUrl(court.images?.[0], 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=600&q=80')}
                    alt={court.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    backgroundColor: 'rgba(23, 43, 37, 0.85)',
                    color: '#FFF',
                    padding: '4px 10px',
                    borderRadius: 'var(--sb-radius-full)',
                    fontSize: '0.75rem',
                    fontWeight: 600
                  }}>
                    {court.category?.name || 'Sân thể thao'}
                  </div>
                </div>

                <div style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--sb-warning)', marginBottom: '8px' }}>
                    <Star size={15} fill="currentColor" />
                    <span style={{ fontWeight: 700, color: 'var(--sb-text-primary)' }}>{court.rating}</span>
                    <span style={{ color: 'var(--sb-text-muted)' }}>({court.reviewCount} đánh giá)</span>
                  </div>

                  <h3 style={{ fontSize: '1.05rem', margin: '0 0 6px', color: 'var(--sb-text-primary)' }}>
                    <Link to={`/courts/${court._id}`}>{court.name}</Link>
                  </h3>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--sb-text-muted)', marginBottom: '14px' }}>
                    <MapPin size={14} /> {court.facility?.address?.district || 'Đà Nẵng'}
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTop: '1px solid var(--sb-border)',
                    paddingTop: '14px',
                    marginTop: '8px'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.725rem', color: 'var(--sb-text-muted)' }}>Giá từ</div>
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--sb-primary-700)' }}>
                        {formatCurrency(court.priceMin)} <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--sb-text-muted)' }}>/ slot</span>
                      </div>
                    </div>
                    <Link to={`/courts/${court._id}`} className="btn btn-primary btn-sm">
                      Đặt sân
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. TOP FACILITIES */}
      <section style={{ padding: '40px 0', backgroundColor: 'var(--sb-surface)' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
            <div>
              <h2 style={{ marginBottom: '6px' }}>Cơ sở thể thao uy tín</h2>
              <p>Tổ hợp thể thao đa năng có bãi đỗ xe, căng tin và phòng thay đồ tiện nghi</p>
            </div>
            <Link to={ROUTES.FACILITIES} className="btn btn-outline-primary btn-sm">
              Xem tất cả cơ sở <ArrowRight size={16} />
            </Link>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px'
          }}>
            {featuredFacilities.map((fac) => (
              <div key={fac._id} className="card card-hover" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                  <img
                    src={resolveAssetUrl(fac.images?.[0], 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=300&q=80')}
                    alt={fac.name}
                    style={{ width: '100px', height: '100px', borderRadius: '12px', objectFit: 'cover' }}
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--sb-warning)', marginBottom: '4px' }}>
                      <Star size={14} fill="currentColor" />
                      <span style={{ fontWeight: 700 }}>{fac.rating}</span>
                      <span style={{ color: 'var(--sb-text-muted)' }}>({fac.reviewCount})</span>
                    </div>
                    <h3 style={{ fontSize: '1rem', margin: '0 0 6px' }}>
                      <Link to={`/facilities/${fac._id}`} style={{ color: 'var(--sb-text-primary)' }}>{fac.name}</Link>
                    </h3>
                    <div style={{ fontSize: '0.8rem', color: 'var(--sb-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={13} /> {fac.address?.detail}, {fac.address?.district}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                  {fac.amenities?.slice(0, 3).map((a, i) => (
                    <span key={i} style={{ fontSize: '0.75rem', backgroundColor: 'var(--sb-background)', padding: '3px 8px', borderRadius: '4px', color: 'var(--sb-text-secondary)' }}>
                      {a}
                    </span>
                  ))}
                  {fac.amenities?.length > 3 && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--sb-text-muted)', alignSelf: 'center' }}>
                      +{fac.amenities.length - 3} tiện ích
                    </span>
                  )}
                </div>

                <Link to={`/facilities/${fac._id}`} className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
                  Xem danh sách sân ({fac.courtCount} sân)
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS (3 Bước) */}
      <section style={{ padding: '60px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ marginBottom: '8px' }}>Đặt sân trong 3 bước đơn giản</h2>
            <p>Trải nghiệm đặt sân thông minh, không cần gọi điện hỏi giờ trống</p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '32px'
          }}>
            <div style={{ textAlign: 'center', padding: '16px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'var(--sb-primary-100)',
                color: 'var(--sb-primary-700)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 800,
                margin: '0 auto 16px'
              }}>
                1
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '8px' }}>Tìm kiếm sân phù hợp</h3>
              <p style={{ fontSize: '0.9rem' }}>
                Lọc theo môn thể thao, quận gần bạn, loại sân trong nhà/ngoài trời và khung giờ trống.
              </p>
            </div>

            <div style={{ textAlign: 'center', padding: '16px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'var(--sb-primary-100)',
                color: 'var(--sb-primary-700)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 800,
                margin: '0 auto 16px'
              }}>
                2
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '8px' }}>Chọn slot & Xác nhận</h3>
              <p style={{ fontSize: '0.9rem' }}>
                Chọn khung giờ chính xác, áp dụng mã giảm giá và giữ chỗ ngay tức thì mà không lo trùng lịch.
              </p>
            </div>

            <div style={{ textAlign: 'center', padding: '16px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'var(--sb-primary-100)',
                color: 'var(--sb-primary-700)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 800,
                margin: '0 auto 16px'
              }}>
                3
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '8px' }}>Ra sân thi đấu</h3>
              <p style={{ fontSize: '0.9rem' }}>
                Nhận mã booking điện tử, đến sân check-in nhanh và tận hưởng trận đấu cùng đồng đội.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. OWNER CTA BANNER */}
      <section style={{ padding: '0 0 60px' }}>
        <div className="container">
          <div style={{
            background: 'linear-gradient(135deg, var(--sb-primary-800) 0%, var(--sb-primary-900) 100%)',
            borderRadius: 'var(--sb-radius-xl)',
            padding: '48px 36px',
            color: '#FFFFFF',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '32px'
          }}>
            <div style={{ maxWidth: '580px' }}>
              <span style={{ color: 'var(--sb-accent-500)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Dành cho chủ cơ sở sân bãi
              </span>
              <h2 style={{ color: '#FFFFFF', fontSize: '1.85rem', margin: '8px 0 16px' }}>
                Bạn sở hữu sân bóng, cầu lông, tennis hoặc pickleball?
              </h2>
              <p style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                Gia nhập mạng lưới SportBooking ngay hôm nay để lấp đầy các khung giờ trống, quản lý lịch đặt tự động và tăng trưởng doanh thu vượt trội.
              </p>
            </div>
            <div>
              <Link to={ROUTES.OWNER_APPLICATION} className="btn btn-accent btn-lg">
                Đăng ký làm Chủ sân <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
