import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { complaintMockService } from '../../../mock/services/complaintMockService.js';
import { facilityMockService } from '../../../mock/services/facilityMockService.js';
import { formatDate } from '../../utils/formatters.js';
import { StatusBadge } from '../../components/ui/StatusBadge.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { useToast } from '../../contexts/ToastContext.jsx';
import { MessageSquareWarning, MessageSquare, Send } from 'lucide-react';

export function OwnerComplaintsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [complaints, setComplaints] = useState([]);
  const [selectedComp, setSelectedComp] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    if (user) {
      setLoading(true);
      facilityMockService.getByOwner(user._id).then(async (facList) => {
        const facIds = new Set(facList.map(f => f._id));
        const allComp = await complaintMockService.getAll();
        setComplaints(allComp.filter(c => c.facilityId && facIds.has(c.facilityId)));
        setLoading(false);
      });
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleRespond = async (e) => {
    e.preventDefault();
    if (!responseText.trim()) return;

    try {
      await complaintMockService.respond(selectedComp._id, user._id, responseText.trim(), 'RESOLVED');
      showToast('Đã gửi phản hồi giải quyết khiếu nại thành công!', 'success');
      setSelectedComp(null);
      setResponseText('');
      loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.65rem', marginBottom: '6px' }}>Khiếu nại cơ sở</h1>
        <p style={{ color: 'var(--sb-text-secondary)' }}>
          Tiếp nhận và giải quyết các phản ánh về chất lượng dịch vụ, cơ sở vật chất từ khách hàng
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>Đang nạp khiếu nại...</div>
      ) : complaints.length === 0 ? (
        <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--sb-text-muted)' }}>
          Tuyệt vời! Cơ sở của bạn hiện không có khiếu nại nào chưa xử lý.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {complaints.map((c) => (
            <div key={c._id} className="card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <StatusBadge status={c.status} />
                <span style={{ fontSize: '0.8rem', color: 'var(--sb-text-muted)' }}>{formatDate(c.createdAt)}</span>
              </div>

              <h3 style={{ fontSize: '1.15rem', margin: '0 0 6px' }}>{c.subject}</h3>
              <div style={{ fontSize: '0.825rem', color: 'var(--sb-text-muted)', marginBottom: '12px' }}>
                Người gửi: <strong>{c.user?.fullName}</strong> • Cơ sở: <strong>{c.facility?.name}</strong>
              </div>

              <p style={{ fontSize: '0.9rem', color: 'var(--sb-text-primary)', lineHeight: 1.6, marginBottom: '16px' }}>
                {c.content}
              </p>

              {c.response ? (
                <div style={{
                  padding: '14px 18px',
                  backgroundColor: 'var(--sb-success-bg)',
                  borderRadius: 'var(--sb-radius-md)',
                  fontSize: '0.85rem'
                }}>
                  <div style={{ fontWeight: 700, color: 'var(--sb-success)', marginBottom: '4px' }}>
                    Phản hồi đã gửi ({formatDate(c.response.respondedAt)}):
                  </div>
                  <div style={{ color: 'var(--sb-text-primary)' }}>{c.response.content}</div>
                </div>
              ) : (
                <button
                  onClick={() => { setSelectedComp(c); setResponseText(''); }}
                  className="btn btn-primary btn-sm"
                >
                  <MessageSquare size={14} /> Gửi phản hồi giải quyết
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal Phản hồi khiếu nại */}
      <Modal
        isOpen={Boolean(selectedComp)}
        onClose={() => setSelectedComp(null)}
        title="Phản hồi xử lý khiếu nại"
      >
        <form onSubmit={handleRespond}>
          <div style={{ fontSize: '0.9rem', marginBottom: '14px' }}>
            Khiếu nại: <strong>{selectedComp?.subject}</strong>
          </div>

          <div className="form-group">
            <label className="form-label">Nội dung giải quyết gửi đến khách hàng <span className="required">*</span></label>
            <textarea
              className="form-control"
              rows={4}
              placeholder="Giải thích nguyên nhân và phương án khắc phục cho khách..."
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button type="button" onClick={() => setSelectedComp(null)} className="btn btn-secondary">
              Hủy
            </button>
            <button type="submit" className="btn btn-primary">
              <Send size={15} /> Xác nhận giải quyết
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default OwnerComplaintsPage;
