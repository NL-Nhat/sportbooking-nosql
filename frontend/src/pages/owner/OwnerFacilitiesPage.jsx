import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { facilityMockService } from '../../../mock/services/facilityMockService.js';
import { StatusBadge } from '../../components/ui/StatusBadge.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { resolveAssetUrl } from '../../utils/fileUploadHelper.js';
import { ROUTES } from '../../constants/routes.js';
import { Plus, Building2, MapPin, Edit, Eye, Search } from 'lucide-react';

export function OwnerFacilitiesPage() {
  const { user } = useAuth();
  const [facilities, setFacilities] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      facilityMockService.getByOwner(user._id).then((data) => {
        setFacilities(data);
        setLoading(false);
      });
    }
  }, [user]);

  const filtered = facilities.filter(f => search.trim() === '' || f.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px',
        gap: '16px'
      }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', marginBottom: '6px' }}>Cơ sở thể thao của tôi</h1>
          <p style={{ color: 'var(--sb-text-secondary)' }}>
            Quản lý thông tin địa điểm, tiện ích và các sân thuộc từng cơ sở
          </p>
        </div>

        <Link to={ROUTES.OWNER_FACILITY_NEW} className="btn btn-primary">
          <Plus size={16} /> Tạo cơ sở mới
        </Link>
      </div>

      <div className="card" style={{ padding: '16px 20px', marginBottom: '24px' }}>
        <div style={{ position: 'relative', maxWidth: '360px' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Tìm theo tên cơ sở..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingRight: '36px' }}
          />
          <Search size={16} style={{ position: 'absolute', right: '12px', top: '14px', color: 'var(--sb-text-muted)' }} />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>Đang nạp danh sách cơ sở...</div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="Chưa có cơ sở nào"
          description="Hãy thêm cơ sở đầu tiên để bắt đầu tạo sân và đón khách."
          action={
            <Link to={ROUTES.OWNER_FACILITY_NEW} className="btn btn-primary btn-sm">
              Tạo cơ sở ngay
            </Link>
          }
        />
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '24px'
        }}>
          {filtered.map((fac) => (
            <div key={fac._id} className="card card-hover" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ height: '180px', position: 'relative' }}>
                <img
                  src={resolveAssetUrl(fac.images?.[0], 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80')}
                  alt={fac.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                  <StatusBadge status={fac.status} />
                </div>
              </div>

              <div style={{ padding: '20px' }}>
                <h3 style={{ fontSize: '1.15rem', margin: '0 0 6px' }}>{fac.name}</h3>

                <div style={{ fontSize: '0.85rem', color: 'var(--sb-text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                  <MapPin size={15} /> {fac.address?.detail}, {fac.address?.district}
                </div>

                <div style={{ fontSize: '0.85rem', color: 'var(--sb-text-secondary)', marginBottom: '16px' }}>
                  Quy mô: <strong>{fac.courtCount} sân</strong> • Giờ mở: <strong>{fac.hoursSummary ? `${fac.hoursSummary.startTime} - ${fac.hoursSummary.endTime}` : 'Chưa cấu hình'}</strong>
                </div>

                <div style={{
                  display: 'flex',
                  gap: '10px',
                  borderTop: '1px solid var(--sb-border)',
                  paddingTop: '16px'
                }}>
                  <Link to={`/facilities/${fac._id}`} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
                    <Eye size={14} /> Xem trang public
                  </Link>
                  <Link to={`/owner/facilities/${fac._id}/edit`} className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                    <Edit size={14} /> Chỉnh sửa
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default OwnerFacilitiesPage;
