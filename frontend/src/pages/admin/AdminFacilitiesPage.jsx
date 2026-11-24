import React, { useState, useEffect } from 'react';
import { facilityMockService } from '../../../mock/services/facilityMockService.js';
import { formatDate } from '../../utils/formatters.js';
import { resolveAssetUrl } from '../../utils/fileUploadHelper.js';
import { StatusBadge } from '../../components/ui/StatusBadge.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { useToast } from '../../contexts/ToastContext.jsx';
import {
  Building2,
  MapPin,
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  User,
  Clock
} from 'lucide-react';

export function AdminFacilitiesPage() {
  const { showToast } = useToast();
  const [facilities, setFacilities] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal xem chi tiết & thẩm định cơ sở
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const loadFacilities = () => {
    setLoading(true);
    facilityMockService.getAll({ status: statusFilter }).then((data) => {
      setFacilities(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadFacilities();
  }, [statusFilter]);

  const filtered = facilities.filter((f) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    const matchName = f.name?.toLowerCase().includes(q);
    const matchOwner = f.owner?.fullName?.toLowerCase().includes(q);
    const matchAddress =
      f.address?.detail?.toLowerCase().includes(q) ||
      f.address?.district?.toLowerCase().includes(q);
    return Boolean(matchName || matchOwner || matchAddress);
  });

  const pendingCount = facilities.filter((f) => f.status === 'PENDING').length;

  const handleApproveDemo = async (facility) => {
    await facilityMockService.reviewStatus(facility._id, 'APPROVED');
    showToast(
      `[Giao diện Demo] Đã phê duyệt cơ sở "${facility.name}" chuyển sang hoạt động (APPROVED).`,
      'success'
    );
    setSelectedFacility(null);
    loadFacilities();
  };

  const handleOpenRejectModal = (facility) => {
    setSelectedFacility(facility);
    setRejectReason('');
    setRejectModalOpen(true);
  };

  const handleConfirmRejectDemo = async (e) => {
    e.preventDefault();
    if (!selectedFacility) return;
    if (!rejectReason.trim()) {
      showToast('Vui lòng nhập lý do từ chối cơ sở thể thao.', 'warning');
      return;
    }
    await facilityMockService.reviewStatus(selectedFacility._id, 'REJECTED');
    showToast(
      `[Giao diện Demo] Đã từ chối cơ sở "${selectedFacility.name}".`,
      'info'
    );
    setRejectModalOpen(false);
    setSelectedFacility(null);
    loadFacilities();
  };

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px',
        gap: '16px'
      }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', marginBottom: '6px' }}>
            Xét duyệt Cơ sở thể thao (Facility Approval)
          </h1>
          <p style={{ color: 'var(--sb-text-secondary)' }}>
            Kiểm tra thông tin địa điểm, hình ảnh và phê duyệt các cơ sở thể thao mới do Chủ sân tạo trước khi cho phép hoạt động công khai
          </p>
        </div>

        {pendingCount > 0 && (
          <div className="badge badge-warning" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
            <Clock size={15} /> Có {pendingCount} cơ sở mới đang chờ Admin duyệt
          </div>
        )}
      </div>

      {/* Bộ lọc & Tìm kiếm */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: '400px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Tìm theo tên cơ sở, chủ sân hoặc địa chỉ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingRight: '36px' }}
            />
            <Search size={16} style={{ position: 'absolute', right: '12px', top: '14px', color: 'var(--sb-text-muted)' }} />
          </div>

          <div style={{ flex: '0 0 240px' }}>
            <select
              className="form-control"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="PENDING">Chờ duyệt (PENDING)</option>
              <option value="APPROVED">Đã duyệt hoạt động (APPROVED)</option>
              <option value="REJECTED">Đã từ chối (REJECTED)</option>
              <option value="SUSPENDED">Tạm đình chỉ (SUSPENDED)</option>
              <option value="INACTIVE">Ngừng hoạt động (INACTIVE)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Danh sách cơ sở */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>Đang nạp danh sách cơ sở...</div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="Không có cơ sở thể thao nào khớp bộ lọc"
          description="Hiện chưa có cơ sở thể thao nào trong trạng thái này."
        />
      ) : (
        <div className="card" style={{ padding: '24px' }}>
          <div className="table-wrapper">
            <table className="sb-table">
              <thead>
                <tr>
                  <th>Hình ảnh</th>
                  <th>Tên cơ sở thể thao</th>
                  <th>Chủ sân sở hữu</th>
                  <th>Địa chỉ</th>
                  <th>Tiện ích</th>
                  <th>Ngày tạo</th>
                  <th>Trạng thái</th>
                  <th>Thao tác duyệt</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((fac) => (
                  <tr key={fac._id}>
                    <td style={{ width: '84px' }}>
                      <img
                        src={resolveAssetUrl(
                          fac.images?.[0],
                          'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=200&q=80'
                        )}
                        alt={fac.name}
                        style={{ width: '68px', height: '48px', borderRadius: '6px', objectFit: 'cover' }}
                      />
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--sb-text-primary)' }}>{fac.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--sb-text-muted)' }}>
                        Quy mô: {fac.courtCount ?? 0} sân
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{fac.owner?.fullName || 'Chủ sân đối tác'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--sb-text-muted)' }}>
                        {fac.owner?.phone || fac.owner?.email || ''}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem' }}>{fac.address?.detail}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--sb-text-muted)' }}>
                        {[fac.address?.ward, fac.address?.district, fac.address?.province].filter(Boolean).join(', ')}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '200px' }}>
                        {(fac.amenities || []).slice(0, 3).map((am, idx) => (
                          <span key={idx} className="badge badge-default" style={{ fontSize: '0.7rem' }}>
                            {am}
                          </span>
                        ))}
                        {(fac.amenities || []).length > 3 && (
                          <span style={{ fontSize: '0.72rem', color: 'var(--sb-text-muted)' }}>
                            +{fac.amenities.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>{formatDate(fac.createdAt)}</td>
                    <td>
                      <StatusBadge status={fac.status} />
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedFacility(fac)}
                          className="btn btn-secondary btn-sm"
                        >
                          <Eye size={14} /> Xem
                        </button>
                        {fac.status === 'PENDING' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleApproveDemo(fac)}
                              className="btn btn-primary btn-sm"
                            >
                              <CheckCircle2 size={14} /> Duyệt
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenRejectModal(fac)}
                              className="btn btn-danger btn-sm"
                            >
                              <XCircle size={14} /> Từ chối
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Chi tiết Cơ sở & Duyệt */}
      <Modal
        isOpen={Boolean(selectedFacility) && !rejectModalOpen}
        onClose={() => setSelectedFacility(null)}
        title="Chi tiết Cơ sở thể thao cần thẩm định"
      >
        {selectedFacility && (
          <div>
            <div style={{ height: '190px', borderRadius: '10px', overflow: 'hidden', marginBottom: '16px', position: 'relative' }}>
              <img
                src={resolveAssetUrl(
                  selectedFacility.images?.[0],
                  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80'
                )}
                alt={selectedFacility.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                <StatusBadge status={selectedFacility.status} />
              </div>
            </div>

            <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>{selectedFacility.name}</h3>
            <p style={{ color: 'var(--sb-text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>
              {selectedFacility.description || 'Chưa có mô tả chi tiết.'}
            </p>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              padding: '14px',
              backgroundColor: 'var(--sb-background)',
              borderRadius: '10px',
              fontSize: '0.875rem',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={16} color="var(--sb-primary-600)" />
                <span>
                  Chủ sân: <strong>{selectedFacility.owner?.fullName || 'Chủ sân đối tác'}</strong>
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={16} color="var(--sb-primary-600)" />
                <span>
                  Địa chỉ:{' '}
                  <strong>
                    {[
                      selectedFacility.address?.detail,
                      selectedFacility.address?.ward,
                      selectedFacility.address?.district,
                      selectedFacility.address?.province
                    ]
                      .filter(Boolean)
                      .join(', ')}
                  </strong>
                </span>
              </div>
              {selectedFacility.location?.coordinates && (
                <div style={{ fontSize: '0.8rem', color: 'var(--sb-text-muted)' }}>
                  Tọa độ GPS (Lng, Lat): [{selectedFacility.location.coordinates[0]}, {selectedFacility.location.coordinates[1]}]
                </div>
              )}
            </div>

            {Array.isArray(selectedFacility.amenities) && selectedFacility.amenities.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '0.825rem', fontWeight: 600, marginBottom: '8px' }}>Tiện ích đăng ký:</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {selectedFacility.amenities.map((am, i) => (
                    <span key={i} className="badge badge-info">
                      {am}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid var(--sb-border)', paddingTop: '16px' }}>
              <button type="button" onClick={() => setSelectedFacility(null)} className="btn btn-secondary">
                Đóng
              </button>
              {selectedFacility.status === 'PENDING' && (
                <>
                  <button
                    type="button"
                    onClick={() => handleOpenRejectModal(selectedFacility)}
                    className="btn btn-danger"
                  >
                    <XCircle size={16} /> Từ chối
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApproveDemo(selectedFacility)}
                    className="btn btn-primary"
                  >
                    <CheckCircle2 size={16} /> Phê duyệt cho hoạt động
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Từ chối Cơ sở */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title={`Từ chối cơ sở: ${selectedFacility?.name || ''}`}
      >
        <form onSubmit={handleConfirmRejectDemo}>
          <div className="form-group">
            <label className="form-label">
              Lý do từ chối cơ sở thể thao <span className="required">*</span>
            </label>
            <textarea
              className="form-control"
              rows={4}
              placeholder="Ví dụ: Địa chỉ cơ sở chưa rõ ràng, hình ảnh sân chưa đúng thực tế..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              required
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
            <button type="button" onClick={() => setRejectModalOpen(false)} className="btn btn-secondary">
              Hủy
            </button>
            <button type="submit" className="btn btn-danger">
              Xác nhận từ chối
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default AdminFacilitiesPage;
