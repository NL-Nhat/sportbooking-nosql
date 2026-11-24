import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ownerFacilityService } from '../../services/ownerFacilityService.js';
import { StatusBadge } from '../../components/ui/StatusBadge.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { resolveAssetUrl } from '../../utils/fileUploadHelper.js';
import { ROUTES } from '../../constants/routes.js';
import { Plus, Building2, MapPin, Edit, Eye, Search, AlertCircle, RefreshCw } from 'lucide-react';

export function OwnerFacilitiesPage() {
  const [facilities, setFacilities] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchOwnerFacilities = useCallback(async (currentStatus = '') => {
    setLoading(true);
    setErrorMessage('');
    try {
      const data = await ownerFacilityService.getMyFacilities({
        status: currentStatus
      });
      setFacilities(data);
    } catch (err) {
      setErrorMessage(err?.message || 'Không thể tải danh sách cơ sở thể thao từ máy chủ.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOwnerFacilities(statusFilter);
  }, [fetchOwnerFacilities, statusFilter]);

  const filtered = facilities.filter((f) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    const nameMatch = f.name?.toLowerCase().includes(q);
    const detailMatch = f.address?.detail?.toLowerCase().includes(q);
    const districtMatch = f.address?.district?.toLowerCase().includes(q);
    const wardMatch = f.address?.ward?.toLowerCase().includes(q);
    return Boolean(nameMatch || detailMatch || districtMatch || wardMatch);
  });

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
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: '380px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Tìm theo tên hoặc địa chỉ cơ sở..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingRight: '36px' }}
            />
            <Search size={16} style={{ position: 'absolute', right: '12px', top: '14px', color: 'var(--sb-text-muted)' }} />
          </div>

          <div style={{ flex: '0 0 220px' }}>
            <select
              className="form-control"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="APPROVED">Đã duyệt (APPROVED)</option>
              <option value="PENDING">Chờ duyệt (PENDING)</option>
              <option value="REJECTED">Bị từ chối (REJECTED)</option>
              <option value="SUSPENDED">Tạm đình chỉ (SUSPENDED)</option>
              <option value="INACTIVE">Ngừng hoạt động (INACTIVE)</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>Đang nạp danh sách cơ sở từ máy chủ...</div>
      ) : errorMessage ? (
        <div className="card" style={{ padding: '32px', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: 'var(--sb-danger-bg)',
            color: 'var(--sb-danger)',
            marginBottom: '12px'
          }}>
            <AlertCircle size={24} />
          </div>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Không thể tải danh sách cơ sở</h3>
          <p style={{ color: 'var(--sb-text-secondary)', marginBottom: '16px' }}>{errorMessage}</p>
          <button
            type="button"
            onClick={() => fetchOwnerFacilities(statusFilter)}
            className="btn btn-primary btn-sm"
          >
            <RefreshCw size={15} /> Thử lại
          </button>
        </div>
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
          {filtered.map((fac) => {
            const facId = fac.id || fac._id;
            const addressParts = [
              fac.address?.detail,
              fac.address?.ward,
              fac.address?.district,
              fac.address?.province
            ].filter(Boolean);

            return (
              <div key={facId} className="card card-hover" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ height: '180px', position: 'relative' }}>
                  <img
                    src={resolveAssetUrl(
                      fac.images?.[0],
                      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80'
                    )}
                    alt={fac.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                    <StatusBadge status={fac.status} />
                  </div>
                </div>

                <div style={{ padding: '20px' }}>
                  <h3 style={{ fontSize: '1.15rem', margin: '0 0 6px' }}>{fac.name}</h3>

                  <div style={{
                    fontSize: '0.85rem',
                    color: 'var(--sb-text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '12px'
                  }}>
                    <MapPin size={15} /> {addressParts.length > 0 ? addressParts.join(', ') : 'Chưa cập nhật địa chỉ'}
                  </div>

                  <div style={{ fontSize: '0.85rem', color: 'var(--sb-text-secondary)', marginBottom: '16px' }}>
                    Quy mô: <strong>{fac.courtCount ?? 0} sân</strong> • Giờ mở:{' '}
                    <strong>
                      {fac.hoursSummary
                        ? `${fac.hoursSummary.startTime} - ${fac.hoursSummary.endTime}`
                        : 'Chưa cấu hình'}
                    </strong>
                  </div>

                  <div style={{
                    display: 'flex',
                    gap: '10px',
                    borderTop: '1px solid var(--sb-border)',
                    paddingTop: '16px'
                  }}>
                    <Link to={`/owner/facilities/${facId}`} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
                      <Eye size={14} /> Xem chi tiết
                    </Link>
                    <Link to={`/owner/facilities/${facId}/edit`} className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                      <Edit size={14} /> Chỉnh sửa
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default OwnerFacilitiesPage;
