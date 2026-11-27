import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ownerCourtService } from '../../services/ownerCourtService.js';
import { StatusBadge } from '../../components/ui/StatusBadge.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { useToast } from '../../contexts/ToastContext.jsx';
import { resolveAssetUrl } from '../../utils/fileUploadHelper.js';
import { formatCurrency, formatDate, getDayName } from '../../utils/formatters.js';
import { ROUTES } from '../../constants/routes.js';
import {
  ArrowLeft,
  Edit,
  Building2,
  Clock,
  Trophy,
  Users,
  DollarSign,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Image as ImageIcon,
  CalendarDays,
  Plus
} from 'lucide-react';

const toMinutes = (t) => {
  if (!t || !t.includes(':')) return 0;
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

export function OwnerCourtDetailPage() {
  const { id } = useParams();
  const { showToast } = useToast();
  const [court, setCourt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [statusUpdating, setStatusUpdating] = useState(false);

  const fetchCourtDetail = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setErrorMessage('');
    try {
      const data = await ownerCourtService.getCourtById(id);
      setCourt(data);
    } catch (err) {
      setErrorMessage(err?.message || 'Không thể tải thông tin chi tiết sân thể thao.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCourtDetail();
  }, [fetchCourtDetail]);

  const handleStatusChange = async (newStatus) => {
    if (!court || newStatus === court.status) return;
    setStatusUpdating(true);
    try {
      const updated = await ownerCourtService.updateCourtStatus(court.id || court._id, newStatus);
      setCourt(updated);
      const statusLabel =
        newStatus === 'AVAILABLE'
          ? 'Sẵn sàng'
          : newStatus === 'MAINTENANCE'
            ? 'Bảo trì'
            : 'Tạm ngưng';
      showToast(`Đã đổi trạng thái sân sang "${statusLabel}" thành công!`, 'success');
    } catch (err) {
      showToast(err?.message || 'Không thể đổi trạng thái sân thể thao.', 'error');
    } finally {
      setStatusUpdating(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        Đang tải thông tin chi tiết sân từ máy chủ...
      </div>
    );
  }

  if (errorMessage || !court) {
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
          Không thể xem chi tiết sân thể thao
        </h2>
        <p style={{ color: 'var(--sb-text-secondary)', marginBottom: '20px' }}>
          {errorMessage || 'Sân không tồn tại hoặc không thuộc cơ sở của bạn.'}
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
          <Link to={ROUTES.OWNER_COURTS} className="btn btn-secondary btn-sm">
            <ArrowLeft size={15} /> Quay lại danh sách sân
          </Link>
          <button type="button" onClick={fetchCourtDetail} className="btn btn-primary btn-sm">
            <RefreshCw size={15} /> Thử lại
          </button>
        </div>
      </div>
    );
  }

  const courtId = court.id || court._id;
  const images = Array.isArray(court.images) ? court.images : [];
  const timeSlots = Array.isArray(court.timeSlots) ? court.timeSlots : [];
  const priceRules = Array.isArray(court.priceRules) ? court.priceRules : [];
  const attributes = court.attributes || {};
  const surface = attributes.surfaceType || attributes.surface || 'Tiêu chuẩn';
  const courtType = attributes.courtType || attributes.size || 'Tiêu chuẩn';
  const isIndoor = Boolean(attributes.indoor);
  const hasLighting = attributes.lighting !== false;

  const totalOpenMinutes = timeSlots.reduce((sum, s) => {
    const dur = toMinutes(s.endTime) - toMinutes(s.startTime);
    return sum + (dur > 0 ? dur : 0);
  }, 0);

  return (
    <div>
      {/* Back link */}
      <div style={{ marginBottom: '20px' }}>
        <Link
          to={ROUTES.OWNER_COURTS}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.875rem',
            color: 'var(--sb-text-secondary)',
            fontWeight: 600
          }}
        >
          <ArrowLeft size={16} /> Quay lại danh sách sân bãi
        </Link>
      </div>

      {/* Header Card */}
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
              <h1 style={{ fontSize: '1.6rem', margin: 0 }}>{court.name}</h1>
              <StatusBadge status={court.status} />
              <span className="badge badge-default">
                {court.categoryName || 'Thể thao'}
              </span>
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
              <Building2 size={16} color="var(--sb-primary-600)" />
              <span>
                Cơ sở trực thuộc:{' '}
                <Link
                  to={`/owner/facilities/${court.facilityId}`}
                  style={{ fontWeight: 600, color: 'var(--sb-primary-700)' }}
                >
                  {court.facilityName || 'Cơ sở thể thao'}
                </Link>
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--sb-text-secondary)', fontWeight: 600 }}>
                Trạng thái sân:
              </span>
              <select
                className="form-control"
                style={{ height: '34px', width: '140px', padding: '4px 10px', fontSize: '0.84rem', fontWeight: 600 }}
                value={court.status || 'AVAILABLE'}
                disabled={statusUpdating}
                onChange={(e) => handleStatusChange(e.target.value)}
              >
                <option value="AVAILABLE">Sẵn sàng</option>
                <option value="MAINTENANCE">Bảo trì</option>
                <option value="INACTIVE">Tạm ngưng</option>
              </select>
            </div>
            {court.status === 'AVAILABLE' && court.facilityStatus === 'APPROVED' && (
              <Link to={`/courts/${courtId}`} className="btn btn-secondary btn-sm">
                <ExternalLink size={15} /> Xem trang đặt sân công khai
              </Link>
            )}
            <Link to={`/owner/courts/${courtId}/edit`} className="btn btn-primary btn-sm">
              <Edit size={15} /> Chỉnh sửa sân & khung giờ
            </Link>
          </div>
        </div>

        {/* 4 thẻ thông số nhanh */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
            gap: '16px'
          }}
        >
          <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: 'var(--sb-background)' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--sb-text-muted)', marginBottom: '4px' }}>
              Môn thể thao & Quy cách
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--sb-primary-700)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Trophy size={17} /> {court.categoryName || 'Thể thao'} ({courtType})
            </div>
          </div>

          <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: 'var(--sb-background)' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--sb-text-muted)', marginBottom: '4px' }}>
              Mặt sân & Không gian
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--sb-text-primary)' }}>
              {surface} • {isIndoor ? 'Trong nhà' : 'Ngoài trời'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--sb-text-muted)', marginTop: '2px' }}>
              {hasLighting ? 'Có hệ thống đèn chiếu sáng' : 'Không có đèn đêm'}
            </div>
          </div>

          <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: 'var(--sb-background)' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--sb-text-muted)', marginBottom: '4px' }}>
              Sức chứa tiêu chuẩn
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--sb-text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={17} color="var(--sb-primary-600)" /> {court.capacity || 4} người
            </div>
          </div>

          <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: 'var(--sb-background)' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--sb-text-muted)', marginBottom: '4px' }}>
              Số khung giờ cho thuê / ngày
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--sb-primary-700)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={17} /> {timeSlots.length} khung giờ ({Math.round(totalOpenMinutes / 6) / 10}h)
            </div>
          </div>
        </div>
      </div>

      {/* 2 cột: Mô tả + Khung giờ cho thuê hằng ngày & Hình ảnh sân */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
          marginBottom: '24px'
        }}
      >
        {/* Cột trái: Mô tả & Khung giờ cho thuê hằng ngày */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} color="var(--sb-primary-600)" /> Mô tả & Khung giờ cho thuê hằng ngày
          </h3>
          <p style={{ color: 'var(--sb-text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
            {court.description || 'Chưa có mô tả chi tiết cho sân thi đấu này.'}
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '8px',
              marginBottom: '12px'
            }}
          >
            <div style={{ fontSize: '0.92rem', fontWeight: 600 }}>
              Danh sách khung giờ cho thuê ({timeSlots.length} khung giờ)
            </div>
            {court.effectiveFrom && (
              <span style={{ fontSize: '0.78rem', color: 'var(--sb-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CalendarDays size={14} /> Áp dụng từ: <strong>{court.effectiveFrom}</strong>
                {court.effectiveTo ? ` đến ${court.effectiveTo}` : ' (Lặp lại hằng ngày)'}
              </span>
            )}
          </div>

          {timeSlots.length === 0 ? (
            <div
              style={{
                padding: '24px',
                textAlign: 'center',
                color: 'var(--sb-text-muted)',
                backgroundColor: 'var(--sb-background)',
                borderRadius: '10px',
                fontSize: '0.875rem'
              }}
            >
              Sân này chưa được cấu hình khung giờ cho thuê hằng ngày.
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(135px, 1fr))',
                gap: '10px'
              }}
            >
              {timeSlots.map((slot, idx) => {
                const dur = toMinutes(slot.endTime) - toMinutes(slot.startTime);
                return (
                  <div
                    key={idx}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--sb-primary-50)',
                      border: '1px solid var(--sb-primary-100)',
                      color: 'var(--sb-primary-800)',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                      {slot.startTime} - {slot.endTime}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--sb-text-secondary)', marginTop: '2px' }}>
                      Thời lượng: {dur > 0 ? `${dur} phút` : '—'}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Cột phải: Thư viện ảnh sân */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ImageIcon size={18} color="var(--sb-primary-600)" /> Hình ảnh sân thi đấu ({images.length})
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
              Chưa có hình ảnh nào được tải lên cho sân này.
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
                      alt={typeof img === 'object' ? img.alt || court.name : court.name}
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

      {/* Bảng Quy tắc giá hiện hành của sân */}
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
            <h3 style={{ fontSize: '1.15rem', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <DollarSign size={18} color="var(--sb-primary-600)" /> Quy tắc giá áp dụng cho sân ({priceRules.length})
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--sb-text-secondary)', margin: 0 }}>
              Bảng giá theo khung giờ, thứ trong tuần hoặc ngày lễ cụ thể của sân này
            </p>
          </div>

          <Link to={`${ROUTES.OWNER_PRICING_NEW}?courtId=${courtId}`} className="btn btn-primary btn-sm">
            <Plus size={15} /> Thêm quy tắc giá
          </Link>
        </div>

        {priceRules.length === 0 ? (
          <EmptyState
            icon={DollarSign}
            title="Chưa có quy tắc giá nào cho sân này"
            description="Hãy thêm quy tắc giá để hệ thống tính tiền tự động khi khách đặt sân."
            action={
              <Link to={`${ROUTES.OWNER_PRICING_NEW}?courtId=${courtId}`} className="btn btn-primary btn-sm">
                <Plus size={15} /> Thêm quy tắc giá ngay
              </Link>
            }
          />
        ) : (
          <div className="table-wrapper">
            <table className="sb-table">
              <thead>
                <tr>
                  <th>Tên quy tắc giá</th>
                  <th>Thứ áp dụng</th>
                  <th>Ngày cụ thể</th>
                  <th>Khung giờ</th>
                  <th>Đơn giá / slot</th>
                  <th>Độ ưu tiên</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {priceRules.map((rule) => {
                  const ruleId = rule.id || rule._id;
                  return (
                    <tr key={ruleId}>
                      <td style={{ fontWeight: 700 }}>{rule.name}</td>
                      <td>
                        {!rule.daysOfWeek || rule.daysOfWeek.length === 0
                          ? '—'
                          : rule.daysOfWeek.length === 7
                            ? 'Tất cả các ngày'
                            : rule.daysOfWeek.map(getDayName).join(', ')}
                      </td>
                      <td>
                        {rule.specificDates?.length > 0 ? (
                          <span style={{ color: 'var(--sb-warning)', fontWeight: 600 }}>
                            {rule.specificDates.join(', ')}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--sb-text-muted)' }}>Theo thứ</span>
                        )}
                      </td>
                      <td>
                        {rule.startTime} - {rule.endTime}
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--sb-primary-700)' }}>
                        {formatCurrency(rule.pricePerSlot)}
                      </td>
                      <td>Mức {rule.priority}</td>
                      <td>
                        <StatusBadge status={rule.status} />
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

export default OwnerCourtDetailPage;
