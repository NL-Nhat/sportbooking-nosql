import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { facilityMockService } from '../../../mock/services/facilityMockService.js';
import { MapPin, Star, Building2, Search } from 'lucide-react';

export function FacilityListPage() {
  const [facilities, setFacilities] = useState([]);
  const [search, setSearch] = useState('');
  const [district, setDistrict] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    facilityMockService.getAll({ onlyApproved: true }).then((data) => {
      setFacilities(data);
      setLoading(false);
    });
  }, []);

  const filtered = facilities.filter((f) => {
    const matchSearch = search.trim() === '' || f.name.toLowerCase().includes(search.toLowerCase());
    const matchDistrict = district === '' || f.address?.district === district;
    return matchSearch && matchDistrict;
  });

  const districts = ['Hải Châu', 'Sơn Trà', 'Ngũ Hành Sơn', 'Thanh Khê', 'Cẩm Lệ', 'Liên Chiểu'];

  return (
    <div style={{ padding: '32px 0' }}>
      <div className="container">
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '8px' }}>Cơ sở thể thao tại Đà Nẵng</h1>
          <p>Các trung tâm phức hợp, câu lạc bộ thể thao uy tín có nhiều sân bãi hiện đại</p>
        </div>

        {/* Filter bar */}
        <div className="card" style={{ padding: '16px 20px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
            <div style={{ flex: '1 1 240px', position: 'relative' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Tìm tên cơ sở thể thao..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingRight: '36px' }}
              />
              <Search size={16} style={{ position: 'absolute', right: '12px', top: '14px', color: 'var(--sb-text-muted)' }} />
            </div>

            <div style={{ flex: '0 0 200px' }}>
              <select
                className="form-control"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
              >
                <option value="">Tất cả các quận</option>
                {districts.map((d) => (
                  <option key={d} value={d}>Quận {d}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Facility Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>Đang tải danh sách cơ sở...</div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: '24px'
          }}>
            {filtered.map((fac) => (
              <div key={fac._id} className="card card-hover" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ height: '200px', width: '100%', position: 'relative' }}>
                  <img
                    src={fac.images?.[0] || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80'}
                    alt={fac.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: '12px',
                    left: '12px',
                    backgroundColor: 'rgba(23, 43, 37, 0.9)',
                    color: '#FFF',
                    padding: '4px 10px',
                    borderRadius: 'var(--sb-radius-full)',
                    fontSize: '0.75rem',
                    fontWeight: 600
                  }}>
                    {fac.courtCount} Sân đang hoạt động
                  </div>
                </div>

                <div style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--sb-warning)', marginBottom: '6px' }}>
                    <Star size={14} fill="currentColor" />
                    <span style={{ fontWeight: 700, color: 'var(--sb-text-primary)' }}>{fac.rating}</span>
                    <span style={{ color: 'var(--sb-text-muted)' }}>({fac.reviewCount} đánh giá)</span>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', margin: '0 0 8px' }}>
                    <Link to={`/facilities/${fac._id}`} style={{ color: 'var(--sb-text-primary)' }}>
                      {fac.name}
                    </Link>
                  </h3>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--sb-text-muted)', marginBottom: '14px' }}>
                    <MapPin size={14} /> {fac.address?.detail}, {fac.address?.district}
                  </div>

                  <p style={{
                    fontSize: '0.85rem',
                    color: 'var(--sb-text-secondary)',
                    marginBottom: '16px',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {fac.description}
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
                    {fac.amenities?.slice(0, 3).map((a, i) => (
                      <span key={i} style={{ fontSize: '0.725rem', backgroundColor: 'var(--sb-background)', padding: '3px 8px', borderRadius: '4px', color: 'var(--sb-text-secondary)' }}>
                        {a}
                      </span>
                    ))}
                    {fac.amenities?.length > 3 && (
                      <span style={{ fontSize: '0.725rem', color: 'var(--sb-text-muted)', alignSelf: 'center' }}>
                        +{fac.amenities.length - 3} tiện ích khác
                      </span>
                    )}
                  </div>

                  <Link to={`/facilities/${fac._id}`} className="btn btn-primary" style={{ width: '100%' }}>
                    Xem chi tiết & Chọn sân
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default FacilityListPage;
