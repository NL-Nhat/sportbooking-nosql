import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useToast } from '../../contexts/ToastContext.jsx';
import { authSessionMockService } from '../../../mock/services/authSessionMockService.js';
import { Laptop, Smartphone, ShieldCheck, LogOut, Trash2, Clock, Globe } from 'lucide-react';
import { formatDateTime } from '../../utils/formatters.js';

export function CustomerSessionsPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadSessions = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await authSessionMockService.getMySessions(user._id);
      setSessions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, [user]);

  const handleRevokeSession = async (sessionId, deviceName) => {
    try {
      await authSessionMockService.revokeSession(sessionId);
      addToast(`Đã thu hồi phiên đăng nhập trên thiết bị ${deviceName}`, 'success');
      loadSessions();
    } catch (err) {
      addToast(err.message || 'Lỗi khi thu hồi phiên', 'error');
    }
  };

  const handleRevokeAll = async () => {
    try {
      await authSessionMockService.revokeAllSessions(user._id);
      addToast('Đã đăng xuất khỏi tất cả các thiết bị khác', 'success');
      loadSessions();
    } catch (err) {
      addToast(err.message || 'Lỗi khi đăng xuất các thiết bị', 'error');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 6px 0', color: 'var(--sb-text-primary)' }}>
            Phiên đăng nhập & Bảo mật (Auth Sessions)
          </h1>
          <p style={{ margin: 0, color: 'var(--sb-text-secondary)', fontSize: '0.875rem' }}>
            Theo dõi danh sách các thiết bị đang đăng nhập tài khoản của bạn theo tiêu chuẩn Refresh Token Rotation (Collection: <code>auth_sessions</code>).
          </p>
        </div>
        {sessions.length > 1 && (
          <button 
            className="btn btn-outline"
            onClick={handleRevokeAll}
            style={{ color: 'var(--sb-danger)', borderColor: 'var(--sb-danger)' }}
          >
            <LogOut size={16} />
            <span>Đăng xuất tất cả thiết bị khác</span>
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {sessions.map((sess, idx) => {
          const isMobile = sess.deviceName.toLowerCase().includes('iphone') || sess.deviceName.toLowerCase().includes('android');
          const isCurrent = idx === 0; // Giả lập phiên hiện tại là phiên đầu tiên
          
          return (
            <div 
              key={sess._id} 
              className="card" 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                padding: '20px',
                borderLeft: isCurrent ? '4px solid var(--sb-primary-600)' : '1px solid var(--sb-border)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: isCurrent ? 'var(--sb-primary-50)' : 'var(--sb-background)',
                  color: isCurrent ? 'var(--sb-primary-700)' : 'var(--sb-text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {isMobile ? <Smartphone size={24} /> : <Laptop size={24} />}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--sb-text-primary)' }}>
                      {sess.deviceName}
                    </span>
                    {isCurrent && (
                      <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>
                        Thiết bị này (Phiên hiện tại)
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: 'var(--sb-text-muted)', marginTop: '4px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Globe size={13} /> IP: {sess.ipAddress}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={13} /> Hoạt động gần nhất: {formatDateTime(sess.lastUsedAt)}
                    </span>
                  </div>
                </div>
              </div>

              {!isCurrent && (
                <button 
                  className="btn btn-sm btn-outline"
                  onClick={() => handleRevokeSession(sess.sessionId, sess.deviceName)}
                  style={{ color: 'var(--sb-danger)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                >
                  <Trash2 size={14} />
                  <span>Thu hồi phiên</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CustomerSessionsPage;

