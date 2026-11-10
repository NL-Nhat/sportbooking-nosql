import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { complaintMockService } from '../../../mock/services/complaintMockService.js';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import StatusBadge from '../../components/ui/StatusBadge';
import { ArrowLeft, User, Calendar, MapPin, CheckCircle, XCircle, Clock } from 'lucide-react';
import { formatDateTime } from '../../utils/formatters';
import { resolveAssetUrl } from '../../utils/fileUploadHelper.js';

export default function AdminComplaintDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [resolutionStatus, setResolutionStatus] = useState('RESOLVED');

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await complaintMockService.getById(id);
      if (!data) {
        addToast('Không tìm thấy khiếu nại', 'error');
        navigate('/admin/complaints');
        return;
      }
      setComplaint(data);
      if (data.response?.content) {
        setReplyContent(data.response.content);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleResolve = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) {
      addToast('Vui lòng nhập nội dung phản hồi xử lý', 'error');
      return;
    }

    try {
      await complaintMockService.respond(
        complaint._id,
        currentUser?._id || 'admin',
        replyContent,
        resolutionStatus
      );
      addToast(`Đã cập nhật khiếu nại thành "${resolutionStatus}"`, 'success');
      loadData();
    } catch (err) {
      addToast(err.message || 'Lỗi khi xử lý khiếu nại', 'error');
    }
  };

  if (loading || !complaint) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Đang tải thông tin khiếu nại...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            className="btn btn-outline" 
            onClick={() => navigate('/admin/complaints')}
            style={{ padding: '8px 12px' }}
          >
            <ArrowLeft size={16} />
            <span>Quay lại</span>
          </button>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 4px 0' }}>
              Xử lý khiếu nại: {complaint.subject}
            </h1>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <StatusBadge status={complaint.status} />
              <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                Gửi lúc: {formatDateTime(complaint.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-3" style={{ gap: '20px' }}>
        {/* Left Column (2 spans) */}
        <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Complaint Details */}
          <div className="card">
            <h2 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 16px 0', borderBottom: '1px solid var(--color-border)', paddingBottom: '10px' }}>
              Nội dung khiếu nại
            </h2>
            <div style={{ fontSize: '15px', lineHeight: 1.6, color: 'var(--color-text-main)', whiteSpace: 'pre-wrap' }}>
              {complaint.content}
            </div>

            {complaint.images && complaint.images.length > 0 && (
              <div style={{ marginTop: '20px' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'var(--color-text-secondary)' }}>
                  Hình ảnh / Bằng chứng đính kèm:
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {complaint.images.map((img, idx) => (
                    <img 
                      key={idx} 
                      src={resolveAssetUrl(img)} 
                      alt="Proof" 
                      style={{ width: '120px', height: '120px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--color-border)' }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Admin Response Form */}
          <div className="card">
            <h2 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 16px 0', borderBottom: '1px solid var(--color-border)', paddingBottom: '10px' }}>
              Phản hồi & Kết luận xử lý
            </h2>

            {complaint.response ? (
              <div style={{ backgroundColor: 'var(--color-bg-secondary)', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                    Phản hồi bởi: {complaint.responder?.fullName || 'Quản trị viên'}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                    {formatDateTime(complaint.response.respondedAt)}
                  </span>
                </div>
                <div style={{ fontSize: '14px', lineHeight: 1.6 }}>{complaint.response.content}</div>
              </div>
            ) : null}

            <form onSubmit={handleResolve}>
              <div style={{ marginBottom: '16px' }}>
                <label className="form-label">Quyết định trạng thái xử lý</label>
                <select 
                  className="form-control"
                  value={resolutionStatus}
                  onChange={e => setResolutionStatus(e.target.value)}
                >
                  <option value="IN_PROGRESS">Đang tiếp tục xác minh (IN_PROGRESS)</option>
                  <option value="RESOLVED">Chấp thuận & Giải quyết xong (RESOLVED)</option>
                  <option value="REJECTED">Từ chối / Bác bỏ khiếu nại (REJECTED)</option>
                  <option value="CLOSED">Đóng khiếu nại (CLOSED)</option>
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label className="form-label">Nội dung phản hồi cho người dùng *</label>
                <textarea 
                  className="form-control"
                  rows={4}
                  placeholder="Nhập chi tiết hướng xử lý (hoàn tiền, cảnh cáo cơ sở, lý do bác bỏ...)..."
                  value={replyContent}
                  onChange={e => setReplyContent(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="submit" className="btn btn-primary">
                  Cập nhật kết quả giải quyết
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: User & Related Entities */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card">
            <h2 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 16px 0', borderBottom: '1px solid var(--color-border)', paddingBottom: '10px' }}>
              Người gửi khiếu nại
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
              <div><strong>Họ và tên:</strong> {complaint.user?.fullName}</div>
              <div><strong>Số điện thoại:</strong> {complaint.user?.phoneNumber || 'N/A'}</div>
              <div><strong>Email:</strong> {complaint.user?.email || 'N/A'}</div>
              <div><strong>ID tài khoản:</strong> <code>{complaint.userId}</code></div>
            </div>
          </div>

          {(complaint.facility || complaint.booking) && (
            <div className="card">
              <h2 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 16px 0', borderBottom: '1px solid var(--color-border)', paddingBottom: '10px' }}>
                Thông tin liên quan
              </h2>
              {complaint.facility && (
                <div style={{ marginBottom: '12px', fontSize: '14px' }}>
                  <div style={{ color: 'var(--color-text-secondary)', fontSize: '12px' }}>Cơ sở liên quan</div>
                  <Link to={`/admin/facilities`} style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                    {complaint.facility.name}
                  </Link>
                </div>
              )}
              {complaint.booking && (
                <div style={{ fontSize: '14px' }}>
                  <div style={{ color: 'var(--color-text-secondary)', fontSize: '12px' }}>Đơn đặt sân liên quan</div>
                  <Link to={`/admin/bookings/${complaint.booking._id}`} style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                    #{complaint.booking.bookingCode} ({complaint.booking.bookingDate})
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
