import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { complaintMockService } from '../../../mock/services/complaintMockService.js';
import { formatDate } from '../../utils/formatters.js';
import { StatusBadge } from '../../components/ui/StatusBadge.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { MessageSquareWarning, Plus, ArrowRight } from 'lucide-react';
import { ROUTES } from '../../constants/routes.js';

export function ComplaintsPage() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      complaintMockService.getByUser(user._id).then((data) => {
        setComplaints(data);
        setLoading(false);
      });
    }
  }, [user]);

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
          <h1 style={{ fontSize: '1.65rem', marginBottom: '6px' }}>Khiếu nại & Phản ánh của tôi</h1>
          <p>Ban quản trị SportBooking cam kết giải quyết khiếu nại trong vòng 24 - 48 giờ</p>
        </div>

        <Link to={ROUTES.CREATE_COMPLAINT} className="btn btn-primary btn-sm">
          <Plus size={16} /> Tạo khiếu nại mới
        </Link>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>Đang tải danh sách khiếu nại...</div>
      ) : complaints.length === 0 ? (
        <EmptyState
          icon={MessageSquareWarning}
          title="Không có khiếu nại nào"
          description="Nếu có bất kỳ thắc mắc hoặc vấn đề về dịch vụ sân bãi, bạn có thể tạo yêu cầu khiếu nại tại đây."
          action={
            <Link to={ROUTES.CREATE_COMPLAINT} className="btn btn-primary btn-sm">
              Tạo phản ánh mới
            </Link>
          }
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {complaints.map((c) => (
            <div key={c._id} className="card card-hover" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <StatusBadge status={c.status} />
                <span style={{ fontSize: '0.75rem', color: 'var(--sb-text-muted)' }}>{formatDate(c.createdAt)}</span>
              </div>

              <h3 style={{ fontSize: '1.1rem', margin: '0 0 6px' }}>
                <Link to={`/account/complaints/${c._id}`} style={{ color: 'var(--sb-text-primary)' }}>
                  {c.subject}
                </Link>
              </h3>

              <p style={{
                fontSize: '0.875rem',
                color: 'var(--sb-text-secondary)',
                lineHeight: 1.5,
                marginBottom: '14px',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {c.content}
              </p>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderTop: '1px solid var(--sb-border)',
                paddingTop: '12px'
              }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--sb-text-muted)' }}>
                  {c.facility ? `Cơ sở: ${c.facility.name}` : 'Khiếu nại dịch vụ chung'}
                  {c.booking && ` • Mã đơn: ${c.booking.bookingCode}`}
                </div>

                <Link to={`/account/complaints/${c._id}`} className="btn btn-secondary btn-sm">
                  Xem chi tiết & Phản hồi <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ComplaintsPage;
