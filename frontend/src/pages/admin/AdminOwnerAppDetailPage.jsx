import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { userMockService } from '../../../mock/services/userMockService.js';
import { formatDateTime } from '../../utils/formatters.js';
import { resolveAssetUrl } from '../../utils/fileUploadHelper.js';
import { StatusBadge } from '../../components/ui/StatusBadge.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useToast } from '../../contexts/ToastContext.jsx';
import { ROUTES } from '../../constants/routes.js';
import { ArrowLeft, CheckCircle2, XCircle, FileText, Building2, Phone, MapPin } from 'lucide-react';

export function AdminOwnerAppDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: adminUser } = useAuth();
  const { showToast } = useToast();

  const [app, setApp] = useState(null);
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadData = () => {
    setLoading(true);
    userMockService.getOwnerApplicationById(id).then((data) => {
      setApp(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleApprove = async () => {
    setSubmitting(true);
    try {
      await userMockService.reviewOwnerApplication(id, adminUser._id, true);
      showToast('Đã phê duyệt hồ sơ và cấp quyền OWNER thành công!', 'success');
      loadData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) {
      showToast('Vui lòng nhập lý do từ chối hồ sơ.', 'warning');
      return;
    }
    setSubmitting(true);
    try {
      await userMockService.reviewOwnerApplication(id, adminUser._id, false, rejectReason);
      showToast('Đã từ chối hồ sơ đăng ký.', 'info');
      setRejectModal(false);
      loadData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '60px' }}>Đang nạp hồ sơ...</div>;
  }

  if (!app) {
    return <div style={{ textAlign: 'center', padding: '60px' }}>Không tìm thấy hồ sơ.</div>;
  }

  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '20px' }}>
        <Link to={ROUTES.ADMIN_OWNER_APPLICATIONS} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--sb-text-secondary)', fontWeight: 600 }}>
          <ArrowLeft size={16} /> Quay lại danh sách hồ sơ
        </Link>
      </div>

      <div className="card" style={{ padding: '32px', marginBottom: '24px' }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--sb-border)',
          paddingBottom: '20px',
          marginBottom: '24px',
          gap: '16px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <h1 style={{ fontSize: '1.5rem', margin: 0 }}>{app.businessName}</h1>
              <StatusBadge status={app.status} />
            </div>
            <div style={{ fontSize: '0.825rem', color: 'var(--sb-text-muted)' }}>
              Nộp lúc: {formatDateTime(app.createdAt)}
            </div>
          </div>

          {app.status === 'PENDING' && (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleApprove} className="btn btn-primary" disabled={submitting}>
                <CheckCircle2 size={16} /> Phê duyệt hồ sơ
              </button>
              <button onClick={() => setRejectModal(true)} className="btn btn-danger" disabled={submitting}>
                <XCircle size={16} /> Từ chối
              </button>
            </div>
          )}
        </div>

        {/* Thông tin chi tiết */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', marginBottom: '32px' }}>
          <div>
            <h3 style={{ fontSize: '1rem', marginBottom: '12px' }}>Người đại diện pháp luật</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
              <div>Họ tên: <strong>{app.user?.fullName}</strong></div>
              <div>Email: <strong>{app.user?.email}</strong></div>
              <div>SĐT liên hệ: <strong>{app.contactPhone}</strong></div>
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '1rem', marginBottom: '12px' }}>Địa chỉ đăng ký kinh doanh</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
              <div>Chi tiết: <strong>{app.businessAddress?.detail}</strong></div>
              <div>Phường/Xã: <strong>{app.businessAddress?.ward}</strong></div>
              <div>Quận/Huyện: <strong>{app.businessAddress?.district}, {app.businessAddress?.province}</strong></div>
            </div>
          </div>
        </div>

        {/* Preview giấy tờ (Hỗ trợ cả Array<Object> chuẩn Database_Design.md v2.0 và Object cũ) */}
        <div style={{ borderTop: '1px solid var(--sb-border)', paddingTop: '24px' }}>
          <h3 style={{ fontSize: '1.05rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} color="var(--sb-primary-600)" /> Giấy tờ đính kèm thẩm định
          </h3>

          {Array.isArray(app.documents) ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              {app.documents.map((doc, idx) => (
                <div key={idx}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--sb-text-secondary)', marginBottom: '6px' }}>
                    {doc.documentType === 'BUSINESS_LICENSE' ? 'Giấy phép kinh doanh' : doc.documentType === 'ID_CARD_FRONT' ? 'Mặt trước CCCD / CMND' : doc.documentType || `Tài liệu #${idx + 1}`}
                  </div>
                  <img
                    src={resolveAssetUrl(doc.fileUrl, 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80')}
                    alt={doc.fileName || 'Document'}
                    style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--sb-border)' }}
                  />
                  {doc.fileName && (
                    <div style={{ fontSize: '0.72rem', color: 'var(--sb-text-muted)', marginTop: '4px', wordBreak: 'break-all' }}>
                      File: <code>{doc.fileName}</code>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--sb-text-secondary)', marginBottom: '8px' }}>
                  Giấy phép kinh doanh
                </div>
                <img
                  src={resolveAssetUrl(app.documents?.businessLicense, 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80')}
                  alt="Giấy phép kinh doanh"
                  style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--sb-border)' }}
                />
              </div>

              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--sb-text-secondary)', marginBottom: '8px' }}>
                  Mặt trước CCCD / CMND
                </div>
                <img
                  src={resolveAssetUrl(app.documents?.idCardFront, 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=400&q=80')}
                  alt="CCCD Mặt trước"
                  style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--sb-border)' }}
                />
              </div>
            </div>
          )}
        </div>

        {app.rejectionReason && (
          <div style={{
            marginTop: '24px',
            padding: '16px',
            backgroundColor: 'var(--sb-danger-bg)',
            color: 'var(--sb-danger)',
            borderRadius: '8px',
            fontSize: '0.875rem'
          }}>
            <strong>Lý do từ chối:</strong> {app.rejectionReason}
          </div>
        )}
      </div>

      {/* Modal Từ chối */}
      <Modal
        isOpen={rejectModal}
        onClose={() => setRejectModal(false)}
        title="Từ chối hồ sơ đăng ký Chủ sân"
      >
        <form onSubmit={handleReject}>
          <div className="form-group">
            <label className="form-label">Nhập lý do từ chối để gửi thông báo cho khách hàng <span className="required">*</span></label>
            <textarea
              className="form-control"
              rows={4}
              placeholder="Ví dụ: Giấy phép kinh doanh hết hạn, địa chỉ không trùng khớp..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button type="button" onClick={() => setRejectModal(false)} className="btn btn-secondary">
              Đóng
            </button>
            <button type="submit" className="btn btn-danger" disabled={submitting}>
              Xác nhận từ chối
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default AdminOwnerAppDetailPage;
