import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ownerCourtService } from '../../services/ownerCourtService.js';
import { ownerFacilityService } from '../../services/ownerFacilityService.js';
import { StatusBadge } from '../../components/ui/StatusBadge.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { resolveAssetUrl } from '../../utils/fileUploadHelper.js';
import { ROUTES } from '../../constants/routes.js';
import { Plus, Trophy, Edit, Eye, Search, Clock, AlertCircle, RefreshCw } from 'lucide-react';

export function OwnerCourtsPage() {
  const [courts, setCourts] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [selectedFac, setSelectedFac] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchOwnerCourtsData = useCallback(async (facId = '', currentStatus = '') => {
    setLoading(true);
    setErrorMessage('');
    try {
      const [courtList, facList] = await Promise.all([
        ownerCourtService.getMyCourts({
          facilityId: facId,
          status: currentStatus
        }),
        ownerFacilityService.getMyFacilities()
      ]);
      setCourts(courtList);
      setFacilities(facList);
    } catch (err) {
      setErrorMessage(err?.message || 'Không thể tải danh sách sân thể thao từ máy chủ.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOwnerCourtsData(selectedFac, statusFilter);
  }, [fetchOwnerCourtsData, selectedFac, statusFilter]);

  const filtered = courts.filter((c) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    const matchName = c.name?.toLowerCase().includes(q);
    const matchFacName = c.facilityName?.toLowerCase().includes(q);
    const matchCategoryName = c.categoryName?.toLowerCase().includes(q);
    return Boolean(matchName || matchFacName || matchCategoryName);
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
          <h1 style={{ fontSize: '1.65rem', marginBottom: '6px' }}>Quản lý sân bãi</h1>
          <p style={{ color: 'var(--sb-text-secondary)' }}>
            Danh sách sân thể thao và các khung giờ cho thuê hằng ngày thuộc cơ sở của bạn
          </p>
        </div>

        <Link to={ROUTES.OWNER_COURT_NEW} className="btn btn-primary">
          <Plus size={16} /> Thêm sân mới
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
          <div style={{ flex: '1 1 240px', position: 'relative' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Tìm theo tên sân, môn hoặc cơ sở..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingRight: '36px' }}
            />
            <Search size={16} style={{ position: 'absolute', right: '12px', top: '14px', color: 'var(--sb-text-muted)' }} />
          </div>

          <div style={{ flex: '0 0 240px' }}>
            <select
              className="form-control"
              value={selectedFac}
              onChange={(e) => setSelectedFac(e.target.value)}
            >
              <option value="">Tất cả các cơ sở</option>
              {facilities.map((f) => {
                const fId = f.id || f._id;
                return (
                  <option key={fId} value={fId}>{f.name}</option>
                );
              })}
            </select>
          </div>

          <div style={{ flex: '0 0 220px' }}>
            <select
              className="form-control"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="AVAILABLE">Sẵn sàng (AVAILABLE)</option>
              <option value="MAINTENANCE">Đang bảo trì (MAINTENANCE)</option>
              <option value="INACTIVE">Ngừng hoạt động (INACTIVE)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Courts Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>Đang nạp danh sách sân từ máy chủ...</div>
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
          <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Không thể tải danh sách sân</h3>
          <p style={{ color: 'var(--sb-text-secondary)', marginBottom: '16px' }}>{errorMessage}</p>
          <button
            type="button"
            onClick={() => fetchOwnerCourtsData(selectedFac, statusFilter)}
            className="btn btn-primary btn-sm"
          >
            <RefreshCw size={15} /> Thử lại
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="Chưa có sân nào"
          description="Hãy tạo sân đầu tiên để bắt đầu đón khách."
          action={
            <Link to={ROUTES.OWNER_COURT_NEW} className="btn btn-primary btn-sm">
              Thêm sân mới
            </Link>
          }
        />
      ) : (
        <div className="table-wrapper">
          <table className="sb-table">
            <thead>
              <tr>
                <th>Ảnh</th>
                <th>Tên sân</th>
                <th>Môn thể thao</th>
                <th>Cơ sở trực thuộc</th>
                <th>Khung giờ cho thuê (Hằng ngày)</th>
                <th>Mặt sân & Sức chứa</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((court) => {
                const courtId = court.id || court._id;
                const slots = court.timeSlots || [];
                const previewSlots = slots.slice(0, 4);
                const moreCount = Math.max(0, slots.length - previewSlots.length);
                const facilityName =
                  court.facilityName ||
                  facilities.find((f) => (f.id || f._id) === court.facilityId)?.name ||
                  'Cơ sở';

                return (
                  <tr key={courtId}>
                    <td style={{ width: '80px' }}>
                      <img
                        src={resolveAssetUrl(court.images?.[0], 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=150&q=80')}
                        alt={court.name}
                        style={{ width: '60px', height: '45px', borderRadius: '6px', objectFit: 'cover' }}
                      />
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--sb-text-primary)' }}>{court.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--sb-text-muted)' }}>
                        {court.attributes?.courtType || court.attributes?.size || 'Tiêu chuẩn'}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-default">
                        {court.categoryName || court.categoryCode || 'Thể thao'}
                      </span>
                    </td>
                    <td>{facilityName}</td>
                    <td>
                      {slots.length === 0 ? (
                        <span style={{ fontSize: '0.78rem', color: 'var(--sb-text-muted)' }}>Chưa cấu hình</span>
                      ) : (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '300px' }}>
                          {previewSlots.map((s, i) => (
                            <span
                              key={i}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                                padding: '2px 6px',
                                backgroundColor: 'var(--sb-primary-50)',
                                color: 'var(--sb-primary-700)',
                                borderRadius: '4px',
                                fontSize: '0.72rem',
                                fontWeight: 600
                              }}
                            >
                              <Clock size={11} /> {s.startTime}-{s.endTime}
                            </span>
                          ))}
                          {moreCount > 0 && (
                            <span style={{ fontSize: '0.72rem', color: 'var(--sb-text-secondary)', fontWeight: 600, alignSelf: 'center' }}>
                              +{moreCount} khung giờ
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td>
                      <div>{court.attributes?.surfaceType || court.attributes?.surface || 'Tiêu chuẩn'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--sb-text-muted)' }}>
                        {court.attributes?.indoor ? 'Trong nhà' : 'Ngoài trời'} • {court.capacity || 4} người
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={court.status} />
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Link to={`/courts/${courtId}`} className="btn btn-secondary btn-sm" title="Xem public">
                          <Eye size={14} />
                        </Link>
                        <Link to={`/owner/courts/${courtId}/edit`} className="btn btn-primary btn-sm" title="Chỉnh sửa sân & khung giờ">
                          <Edit size={14} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default OwnerCourtsPage;
