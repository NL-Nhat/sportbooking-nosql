import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ownerFacilityService } from '../../services/ownerFacilityService.js';
import { useToast } from '../../contexts/ToastContext.jsx';
import { StatusBadge } from '../../components/ui/StatusBadge.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { resolveAssetUrl } from '../../utils/fileUploadHelper.js';
import { formatDate } from '../../utils/formatters.js';
import { ROUTES } from '../../constants/routes.js';
import {
  ArrowLeft,
  Edit,
  Plus,
  Building2,
  MapPin,
  Clock,
  Trophy,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Image as ImageIcon,
  Power,
  RotateCcw,
  Send
} from 'lucide-react';

const AMENITY_LABELS = {
  PARKING: 'Bãi giữ xe',
  CHANGING_ROOM: 'Phòng thay đồ',
  WIFI: 'Wifi miễn phí',
  CANTEEN: 'Quầy nước / Căng tin',
  SHOWER: 'Phòng tắm nước nóng',
  LOCKER: 'Tủ đồ cá nhân'
};

export function OwnerFacilityDetailPage() {
  const { id } = useParams();
  const { showToast } = useToast();
  const [facility, setFacility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchDetail = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setErrorMessage('');
    try {
      const data = await ownerFacilityService.getFacilityById(id);
      setFacility(data);
    } catch (err) {
      setErrorMessage(err?.message || 'Không thể tải thông tin chi tiết cơ sở thể thao.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const handleStatusChange = async (targetStatus) => {
    if (!facility) return;
    const facId = facility.id || facility._id;
    setUpdatingStatus(true);
    try {
      const updated = await ownerFacilityService.updateFacilityStatus(facId, targetStatus);
      setFacility(updated);
      if (targetStatus === 'INACTIVE') {
        showToast('Đã chuyển cơ sở sang trạng thái ngừng hoạt động (INACTIVE).', 'info');
      } else if (targetStatus === 'APPROVED') {
        showToast('Đã kích hoạt cơ sở hoạt động trở lại (APPROVED).', 'success');
      } else if (targetStatus === 'PENDING') {
        showToast('Đã gửi lại yêu cầu xét duyệt cơ sở cho Admin.', 'success');
      }
    } catch (err) {
      showToast(err?.message || 'Không thể đổi trạng thái cơ sở.', 'error');
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        Đang tải thông tin chi tiết cơ sở từ máy chủ...
      </div>
    );
  }

  if (errorMessage || !facility) {
    return (
      <div className="card" style={{ padding: '40px', textAlign: 'center', maxWidth: '600px', margin: '24px auto' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            backgroundColor: 'var(--sb-danger-bg)',
            color: 'var(--sb-danger)',
            marginBottom: '12px'
          }}
        >
          <AlertCircle size={26} />
        </div>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>
          Không thể xem chi tiết cơ sở thể thao
        </h2>
        <p style={{ color: 'var(--sb-text-secondary)', marginBottom: '20px' }}>
          {errorMessage || 'Cơ sở không tồn tại hoặc không thuộc quyền sở hữu của bạn.'}
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
          <Link to={ROUTES.OWNER_FACILITIES} className="btn btn-secondary btn-sm">
            <ArrowLeft size={15} /> Quay lại danh sách
          </Link>
          <button type="button" onClick={fetchDetail} className="btn btn-primary btn-sm">
            <RefreshCw size={15} /> Thử lại
          </button>
        </div>
      </div>
    );
  }

  const facilityId = facility.id || facility._id;
  const courts = Array.isArray(facility.courts) ? facility.courts : [];
  const images = Array.isArray(facility.images) ? facility.images : [];
  const amenities = Array.isArray(facility.amenities) ? facility.amenities : [];
  const addressParts = [
    facility.address?.detail,
    facility.address?.ward,
    facility.address?.district,
    facility.address?.province
  ].filter(Boolean);

  return (
    <div>
      {/* Back link */}
      <div style={{ marginBottom: '20px' }}>
        <Link
          to={ROUTES.OWNER_FACILITIES}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.875rem',
            color: 'var(--sb-text-secondary)',
            fontWeight: 600
          }}
        >
          <ArrowLeft size={16} /> Quay lại danh sách cơ sở của tôi
        </Link>
      </div>

      {/* Header card */}
      <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '16px',
            borderBottom: '1px solid var(--sb-border)',
            paddingBottom: '20px',
            marginBottom: '20px'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '8px' }}>
              <h1 style={{ fontSize: '1.6rem', margin: 0 }}>{facility.name}</h1>
              <StatusBadge status={facility.status} />
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: 'var(--sb-text-secondary)',
                fontSize: '0.9rem'
              }}
            >
              <MapPin size={16} color="var(--sb-primary-600)" />
              <span>{addressParts.length > 0 ? addressParts.join(', ') : 'Chưa cập nhật địa chỉ'}</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {facility.status === 'APPROVED' && (
              <>
                <Link to={`/facilities/${facilityId}`} className="btn btn-secondary btn-sm">
                  <ExternalLink size={15} /> Xem trang công khai
                </Link>
                <button
                  type="button"
                  onClick={() => handleStatusChange('INACTIVE')}
                  disabled={updatingStatus}
                  className="btn btn-secondary btn-sm"
                  style={{ color: 'var(--sb-danger)' }}
                >
                  <Power size={15} /> {updatingStatus ? 'Đang xử lý...' : 'Tạm ngừng hoạt động'}
                </button>
              </>
            )}
            {facility.status === 'INACTIVE' && (
              <button
                type="button"
                onClick={() => handleStatusChange('APPROVED')}
                disabled={updatingStatus}
                className="btn btn-secondary btn-sm"
                style={{ color: 'var(--sb-success)' }}
              >
                <RotateCcw size={15} /> {updatingStatus ? 'Đang xử lý...' : 'Mở hoạt động trở lại'}
              </button>
            )}
            {facility.status === 'REJECTED' && (
              <button
                type="button"
                onClick={() => handleStatusChange('PENDING')}
                disabled={updatingStatus}
                className="btn btn-secondary btn-sm"
                style={{ color: 'var(--sb-primary-700)' }}
              >
                <Send size={15} /> {updatingStatus ? 'Đang gửi...' : 'Gửi duyệt lại'}
              </button>
            )}
            <Link to={`/owner/facilities/${facilityId}/edit`} className="btn btn-primary btn-sm">
              <Edit size={15} /> Chỉnh sửa cơ sở
            </Link>
          </div>
        </div>

        {/* Trạng thái xét duyệt từ Admin */}
        {facility.status === 'PENDING' && (
          <div
            style={{
              padding: '14px 16px',
              borderRadius: '10px',
              backgroundColor: 'var(--sb-warning-bg)',
              color: 'var(--sb-warning)',
              fontSize: '0.875rem',
              marginBottom: '20px',
              fontWeight: 500
            }}
          >
            Cơ sở thể thao này đang ở trạng thái <strong>Chờ duyệt (PENDING)</strong>. Sau khi Admin xét duyệt chuyển sang{' '}
            <strong>APPROVED</strong>, cơ sở sẽ được hoạt động và hiển thị công khai cho khách đặt sân.
          </div>
        )}

        {/* Thông tin tổng quan 3 cột */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px'
          }}
        >
          <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: 'var(--sb-background)' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--sb-text-muted)', marginBottom: '4px' }}>
              Tổng số sân trực thuộc
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--sb-primary-700)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Trophy size={18} /> {facility.courtCount ?? courts.length} sân
            </div>
          </div>

          <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: 'var(--sb-background)' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--sb-text-muted)', marginBottom: '4px' }}>
              Khung giờ mở cửa chung (theo các sân)
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--sb-text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} color="var(--sb-primary-600)" />
              {facility.hoursSummary
                ? `${facility.hoursSummary.startTime} - ${facility.hoursSummary.endTime}`
                : 'Chưa cấu hình'}
            </div>
          </div>

          <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: 'var(--sb-background)' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--sb-text-muted)', marginBottom: '4px' }}>
              Tọa độ GPS & Ngày tạo
            </div>
            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--sb-text-primary)' }}>
              {facility.location?.coordinates?.length === 2
                ? `[${facility.location.coordinates[0]}, ${facility.location.coordinates[1]}]`
                : 'Chưa có tọa độ'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--sb-text-muted)', marginTop: '2px' }}>
              Tạo ngày: {facility.createdAt ? formatDate(facility.createdAt) : '—'}
            </div>
          </div>
        </div>
      </div>

      {/* 2 cột: Mô tả + Tiện ích & Hình ảnh */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
          marginBottom: '24px'
        }}
      >
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building2 size={18} color="var(--sb-primary-600)" /> Mô tả & Tiện ích cơ sở
          </h3>
          <p style={{ color: 'var(--sb-text-secondary)', lineHeight: 1.65, marginBottom: '20px' }}>
            {facility.description || 'Chưa có mô tả chi tiết cho cơ sở thể thao này.'}
          </p>

          <h4 style={{ fontSize: '0.95rem', marginBottom: '12px' }}>
            Tiện ích đã đăng ký ({amenities.length})
          </h4>
          {amenities.length === 0 ? (
            <div style={{ fontSize: '0.85rem', color: 'var(--sb-text-muted)' }}>
              Chưa đăng ký tiện ích nào.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
              {amenities.map((am, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.85rem',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--sb-background)'
                  }}
                >
                  <CheckCircle2 size={15} color="var(--sb-success)" />
                  <span>{AMENITY_LABELS[am] || am}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ImageIcon size={18} color="var(--sb-primary-600)" /> Hình ảnh cơ sở ({images.length})
          </h3>
          {images.length === 0 ? (
            <div
              style={{
                padding: '32px',
                textAlign: 'center',
                color: 'var(--sb-text-muted)',
                backgroundColor: 'var(--sb-background)',
                borderRadius: '10px',
                fontSize: '0.875rem'
              }}
            >
              Chưa có hình ảnh nào được tải lên cho cơ sở này.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
              {images.map((img, idx) => {
                const rawUrl = typeof img === 'object' ? img.url : img;
                return (
                  <div
                    key={idx}
                    style={{
                      borderRadius: '10px',
                      overflow: 'hidden',
                      border: '1px solid var(--sb-border)',
                      backgroundColor: 'var(--sb-background)'
                    }}
                  >
                    <img
                      src={resolveAssetUrl(img)}
                      alt={typeof img === 'object' ? img.alt || facility.name : facility.name}
                      style={{ width: '100%', height: '115px', objectFit: 'cover' }}
                    />
                    <div
                      style={{
                        padding: '4px 8px',
                        fontSize: '0.7rem',
                        color: 'var(--sb-text-muted)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                      title={rawUrl}
                    >
                      {rawUrl}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Danh sách các sân thuộc cơ sở */}
      <div className="card" style={{ padding: '24px' }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            marginBottom: '20px'
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.15rem', margin: '0 0 4px' }}>
              Danh sách sân thuộc cơ sở ({courts.length})
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--sb-text-secondary)', margin: 0 }}>
              Quản lý các sân thi đấu và khung giờ cho thuê hằng ngày tại cơ sở này
            </p>
          </div>

          <Link to={ROUTES.OWNER_COURT_NEW} className="btn btn-primary btn-sm">
            <Plus size={15} /> Thêm sân mới
          </Link>
        </div>

        {courts.length === 0 ? (
          <EmptyState
            icon={Trophy}
            title="Cơ sở này chưa có sân nào"
            description="Hãy thêm sân thi đấu đầu tiên cho cơ sở để cấu hình khung giờ và bảng giá."
            action={
              <Link to={ROUTES.OWNER_COURT_NEW} className="btn btn-primary btn-sm">
                <Plus size={15} /> Thêm sân ngay
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
                  <th>Khung giờ cho thuê (DAILY)</th>
                  <th>Thuộc tính & Sức chứa</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {courts.map((court) => {
                  const courtId = court.id || court._id;
                  const slots = Array.isArray(court.timeSlots) ? court.timeSlots : [];

                  return (
                    <tr key={courtId}>
                      <td style={{ width: '80px' }}>
                        <img
                          src={resolveAssetUrl(
                            court.images?.[0],
                            'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=150&q=80'
                          )}
                          alt={court.name}
                          style={{ width: '60px', height: '44px', borderRadius: '6px', objectFit: 'cover' }}
                        />
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--sb-text-primary)' }}>{court.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--sb-text-muted)' }}>
                          {court.description || 'Sân tiêu chuẩn'}
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-default">
                          {court.categoryName || court.categoryCode || 'Thể thao'}
                        </span>
                      </td>
                      <td>
                        {slots.length === 0 ? (
                          <span style={{ fontSize: '0.78rem', color: 'var(--sb-text-muted)' }}>Chưa cấu hình</span>
                        ) : (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '280px' }}>
                            {slots.slice(0, 4).map((slot, idx) => (
                              <span
                                key={idx}
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
                                <Clock size={11} /> {slot.startTime}-{slot.endTime}
                              </span>
                            ))}
                            {slots.length > 4 && (
                              <span style={{ fontSize: '0.72rem', color: 'var(--sb-text-secondary)', fontWeight: 600 }}>
                                +{slots.length - 4} khung giờ
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem' }}>
                          {court.attributes?.surfaceType || court.attributes?.surface || 'Tiêu chuẩn'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--sb-text-muted)' }}>
                          {court.attributes?.indoor ? 'Trong nhà' : 'Ngoài trời'} • {court.capacity || 4} người
                        </div>
                      </td>
                      <td>
                        <StatusBadge status={court.status} />
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <Link to={`/owner/courts/${courtId}`} className="btn btn-secondary btn-sm">
                            Xem
                          </Link>
                          <Link to={`/owner/courts/${courtId}/edit`} className="btn btn-primary btn-sm">
                            <Edit size={14} /> Sửa sân
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
    </div>
  );
}

export default OwnerFacilityDetailPage;
