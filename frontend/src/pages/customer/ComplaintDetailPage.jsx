import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { complaintMockService } from '../../../mock/services/complaintMockService.js';
import { formatDate, formatDateTime } from '../../utils/formatters.js';
import { StatusBadge } from '../../components/ui/StatusBadge.jsx';
import { ROUTES } from '../../constants/routes.js';
import { ArrowLeft, MessageSquare, CheckCircle2, Clock } from 'lucide-react';

export function ComplaintDetailPage() {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    complaintMockService.getById(id).then((c) => {
      setComplaint(c);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '80px' }}>Đang nạp chi tiết khiếu nại...</div>;
  }

  if (!complaint) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <h2>Không tìm thấy khiếu nại này</h2>
        <Link to={ROUTES.COMPLAINTS} className="btn btn-primary" style={{ marginTop: '16px' }}>
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '720px' }}>
      <div style={{ marginBottom: '20px' }}>
        <Link to={ROUTES.COMPLAINTS} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--sb-text-secondary)', fontWeight: 600 }}>
          <ArrowLeft size={16} /> Quay lại danh sách khiếu nại
        </Link>
      </div>

      <div className="card" style={{ padding: '32px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <StatusBadge status={complaint.status} />
          <span style={{ fontSize: '0.8rem', color: 'var(--sb-text-muted)' }}>
            Gửi lúc: {formatDateTime(complaint.createdAt)}
          </span>
        </div>

        <h1 style={{ fontSize: '1.45rem', marginBottom: '12px' }}>{complaint.subject}</h1>

        <div style={{ fontSize: '0.85rem', color: 'var(--sb-text-muted)', marginBottom: '20px' }}>
          {complaint.facility && <span>Cơ sở: <strong>{complaint.facility.name}</strong> • </span>}
          {complaint.booking && <span>Mã đơn đặt: <strong>{complaint.booking.bookingCode}</strong></span>}
        </div>

        <div style={{
          backgroundColor: 'var(--sb-background)',
          borderRadius: 'var(--sb-radius-md)',
          padding: '18px',
          fontSize: '0.925rem',
          lineHeight: 1.6,
          marginBottom: '28px'
        }}>
          {complaint.content}
        </div>

        {complaint.images?.length > 0 && (
          <div style={{ marginBottom: '28px' }}>
            <h4 style={{ fontSize: '0.9rem', marginBottom: '10px' }}>Hình ảnh đính kèm:</h4>
            <div style={{ display: 'flex', gap: '10px' }}>
              {complaint.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt="Minh chứng"
                  style={{ width: '120px', height: '90px', borderRadius: '8px', objectFit: 'cover' }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Phản hồi từ Ban Quản Trị / Chủ sân */}
        <div style={{
          borderTop: '1px solid var(--sb-border)',
          paddingTop: '24px'
        }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageSquare size={18} color="var(--sb-primary-600)" /> Phản hồi từ Bộ phận CSKH / Chủ sân
          </h3>

          {complaint.response ? (
            <div style={{
              backgroundColor: 'var(--sb-primary-50)',
              borderRadius: 'var(--sb-radius-md)',
              padding: '18px',
              borderLeft: '4px solid var(--sb-primary-600)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--sb-primary-900)' }}>
                  {complaint.responder?.fullName || 'Ban Quản Trị SportBooking'}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--sb-text-muted)' }}>
                  {formatDateTime(complaint.response.respondedAt)}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--sb-text-primary)', lineHeight: 1.6 }}>
                {complaint.response.content}
              </p>
            </div>
          ) : (
            <div style={{
              padding: '20px',
              textAlign: 'center',
              backgroundColor: 'var(--sb-background)',
              borderRadius: 'var(--sb-radius-md)',
              color: 'var(--sb-text-muted)',
              fontSize: '0.875rem'
            }}>
              <Clock size={20} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '6px' }} />
              Khiếu nại đang được chuyển đến ban điều hành và chủ cơ sở để xử lý. Vui lòng kiểm tra lại sau.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ComplaintDetailPage;
