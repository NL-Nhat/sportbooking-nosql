import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { favoriteMockService } from '../../../mock/services/favoriteMockService.js';
import { useToast } from '../../contexts/ToastContext.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { Heart, MapPin, Trash2, ArrowRight } from 'lucide-react';

export function FavoritesPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFavorites = () => {
    if (user) {
      setLoading(true);
      favoriteMockService.getByUser(user._id).then((data) => {
        setFavorites(data);
        setLoading(false);
      });
    }
  };

  useEffect(() => {
    loadFavorites();
  }, [user]);

  const handleRemove = async (targetType, targetId) => {
    await favoriteMockService.toggleFavorite(user._id, targetType, targetId);
    showToast('Đã xóa khỏi danh sách yêu thích.', 'info');
    loadFavorites();
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.65rem', marginBottom: '6px' }}>Cơ sở & Sân yêu thích</h1>
        <p>Lưu nhanh các địa điểm thể thao bạn thường xuyên tập luyện</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>Đang tải danh sách yêu thích...</div>
      ) : favorites.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Chưa có mục yêu thích nào"
          description="Bấm vào nút trái tim ở bất kỳ cơ sở hoặc sân nào để lưu lại truy cập nhanh."
          action={
            <Link to="/facilities" className="btn btn-primary btn-sm">
              Khám phá cơ sở thể thao
            </Link>
          }
        />
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '20px'
        }}>
          {favorites.map((fav) => {
            const target = fav.target;
            if (!target) return null;
            const isCourt = fav.targetType === 'COURT';
            const detailUrl = isCourt ? `/courts/${target._id}` : `/facilities/${target._id}`;

            return (
              <div key={fav._id} className="card card-hover" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ height: '160px', position: 'relative' }}>
                  <img
                    src={target.images?.[0] || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=600&q=80'}
                    alt={target.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <span style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    backgroundColor: 'rgba(23, 43, 37, 0.9)',
                    color: '#FFF',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '0.725rem',
                    fontWeight: 600
                  }}>
                    {isCourt ? 'Sân thể thao' : 'Cơ sở'}
                  </span>
                  <button
                    onClick={() => handleRemove(fav.targetType, target._id)}
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      backgroundColor: 'rgba(255,255,255,0.9)',
                      color: 'var(--sb-danger)',
                      padding: '6px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title="Bỏ yêu thích"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                <div style={{ padding: '16px' }}>
                  <h3 style={{ fontSize: '1rem', margin: '0 0 6px' }}>
                    <Link to={detailUrl} style={{ color: 'var(--sb-text-primary)' }}>
                      {target.name}
                    </Link>
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--sb-text-muted)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={13} /> {target.address?.district || 'Đà Nẵng'}
                  </div>

                  <Link to={detailUrl} className="btn btn-outline-primary btn-sm" style={{ width: '100%' }}>
                    Xem chi tiết <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default FavoritesPage;
