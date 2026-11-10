import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { notificationMockService } from '../../../mock/services/notificationMockService.js';
import { formatDateTime } from '../../utils/formatters.js';
import { useToast } from '../../contexts/ToastContext.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { Bell, CheckCheck, Tag, CreditCard, Calendar, Info } from 'lucide-react';

export function NotificationsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = () => {
    if (user) {
      setLoading(true);
      notificationMockService.getByUser(user._id).then((data) => {
        setNotifications(data);
        setLoading(false);
      });
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [user]);

  const handleMarkAsRead = async (id) => {
    await notificationMockService.markAsRead(id);
    loadNotifications();
  };

  const handleMarkAllRead = async () => {
    await notificationMockService.markAllAsRead(user._id);
    showToast('Đã đánh dấu tất cả thông báo là đã đọc.', 'success');
    loadNotifications();
  };

  const getIcon = (type) => {
    if (type === 'BOOKING') return <Calendar size={18} color="var(--sb-primary-600)" />;
    if (type === 'PAYMENT') return <CreditCard size={18} color="var(--sb-success)" />;
    if (type === 'REFUND') return <Tag size={18} color="var(--sb-warning)" />;
    if (type === 'COMPLAINT' || type === 'OWNER') return <Info size={18} color="var(--sb-primary-700)" />;
    return <Info size={18} color="var(--sb-info)" />;
  };

  return (
    <div>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px',
        gap: '12px'
      }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', marginBottom: '6px' }}>Hộp thông báo</h1>
          <p>Cập nhật đơn đặt sân, thanh toán, hoàn tiền, khiếu nại và thông báo tài khoản</p>
        </div>

        {notifications.some(n => !n.isRead) && (
          <button onClick={handleMarkAllRead} className="btn btn-secondary btn-sm" style={{ gap: '6px' }}>
            <CheckCheck size={16} /> Đánh dấu đã đọc tất cả
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>Đang tải thông báo...</div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="Không có thông báo nào"
          description="Bạn đã đọc hết các thông báo mới nhất từ SportBooking."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => !n.isRead && handleMarkAsRead(n._id)}
              className="card card-hover"
              style={{
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'start',
                gap: '16px',
                backgroundColor: n.isRead ? '#FFFFFF' : 'var(--sb-primary-50)',
                borderColor: n.isRead ? 'var(--sb-border)' : 'var(--sb-primary-600)',
                cursor: n.isRead ? 'default' : 'pointer'
              }}
            >
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--sb-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {getIcon(n.type)}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--sb-text-primary)' }}>
                    {n.title}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--sb-text-muted)' }}>
                    {formatDateTime(n.createdAt)}
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--sb-text-secondary)', lineHeight: 1.5 }}>
                  {n.message}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default NotificationsPage;
