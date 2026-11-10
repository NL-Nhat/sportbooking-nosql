import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { courtMockService } from '../../../mock/services/courtMockService.js';
import { formatCurrency } from '../../utils/formatters.js';
import { Trophy, Activity, Target, Zap, MapPin, Star, ArrowRight } from 'lucide-react';

export function CategoryCourtsPage() {
  const { code } = useParams();
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);

  const categoryMeta = {
    FOOTBALL: { id: '690100000000000000000001', name: 'Bóng đá', icon: Trophy, desc: 'Hệ thống sân cỏ nhân tạo 5 người và 7 người chất lượng tại Đà Nẵng.' },
    BADMINTON: { id: '690100000000000000000002', name: 'Cầu lông', icon: Activity, desc: 'Sân thảm PVC tiêu chuẩn thi đấu, chống lóa, trần cao thoáng đãng.' },
    TENNIS: { id: '690100000000000000000003', name: 'Tennis', icon: Target, desc: 'Sân cứng tiêu chuẩn ITF, view sông Hàn và gần biển không khí thoáng mát.' },
    PICKLEBALL: { id: '690100000000000000000004', name: 'Pickleball', icon: Zap, desc: 'Bộ môn thể thao hiện đại hot nhất hiện nay với các sân thi đấu USAPA chuẩn.' }
  };

  const meta = categoryMeta[code?.toUpperCase()] || categoryMeta.FOOTBALL;
  const Icon = meta.icon;

  useEffect(() => {
    setLoading(true);
    courtMockService.getAll({ categoryId: meta.id, publicOnly: true }).then((data) => {
      setCourts(data);
      setLoading(false);
    });
  }, [meta.id]);

  return (
    <div style={{ padding: '32px 0 64px' }}>
      <div className="container">
        {/* Category Header */}
        <div style={{
          backgroundColor: 'var(--sb-surface)',
          borderRadius: 'var(--sb-radius-xl)',
          padding: '36px',
          border: '1px solid var(--sb-border)',
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
          marginBottom: '36px'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            backgroundColor: 'var(--sb-primary-100)',
            color: 'var(--sb-primary-700)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Icon size={32} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.85rem', marginBottom: '8px' }}>Sân {meta.name} tại Đà Nẵng</h1>
            <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--sb-text-secondary)' }}>{meta.desc}</p>
          </div>
        </div>

        {/* List of courts in this category */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>Đang tải danh sách sân {meta.name}...</div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '24px'
          }}>
            {courts.map((court) => (
              <div key={court._id} className="card card-hover" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ height: '170px', position: 'relative' }}>
                  <img
                    src={court.images?.[0] || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=600&q=80'}
                    alt={court.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {court.attributes?.indoor && (
                    <div style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      backgroundColor: 'var(--sb-primary-600)',
                      color: '#FFF',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      fontWeight: 600
                    }}>
                      Trong nhà
                    </div>
                  )}
                </div>

                <div style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--sb-warning)', marginBottom: '4px' }}>
                    <Star size={14} fill="currentColor" />
                    <span style={{ fontWeight: 700, color: 'var(--sb-text-primary)' }}>{court.rating}</span>
                    <span style={{ color: 'var(--sb-text-muted)' }}>({court.reviewCount})</span>
                  </div>

                  <h3 style={{ fontSize: '1rem', margin: '0 0 6px' }}>
                    <Link to={`/courts/${court._id}`} style={{ color: 'var(--sb-text-primary)' }}>
                      {court.name}
                    </Link>
                  </h3>

                  <div style={{ fontSize: '0.8rem', color: 'var(--sb-text-muted)', marginBottom: '4px' }}>
                    {court.facility?.name}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--sb-text-muted)', marginBottom: '14px' }}>
                    <MapPin size={13} /> {court.facility?.address?.district}
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTop: '1px solid var(--sb-border)',
                    paddingTop: '12px'
                  }}>
                    <div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--sb-text-muted)' }}>Giá từ</span>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--sb-primary-700)' }}>
                        {formatCurrency(court.priceMin)}
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
        )}
      </div>
    </div>
  );
}

export default CategoryCourtsPage;
