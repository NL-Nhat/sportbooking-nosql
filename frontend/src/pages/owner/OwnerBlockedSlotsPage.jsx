import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { courtMockService } from '../../../mock/services/courtMockService.js';
import { mockStorage } from '../../../mock/storage/mockStorage.js';
import { formatDateTime } from '../../utils/formatters.js';
import { Modal } from '../../components/ui/Modal.jsx';
import { useToast } from '../../contexts/ToastContext.jsx';
import { Plus, Trash2, CalendarDays, AlertTriangle } from 'lucide-react';

export function OwnerBlockedSlotsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [courts, setCourts] = useState([]);
  const [blockedSlots, setBlockedSlots] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  // Form
  const [courtId, setCourtId] = useState('');
  const [startAt, setStartAt] = useState('2026-11-06T08:00');
  const [endAt, setEndAt] = useState('2026-11-06T12:00');
  const [reason, setReason] = useState('Bảo trì mặt sân định kỳ');

  const loadData = () => {
    if (user) {
      courtMockService.getByOwner(user._id).then((courtList) => {
        setCourts(courtList);
        if (courtList.length > 0 && !courtId) setCourtId(courtList[0]._id);

        const courtIds = new Set(courtList.map(c => c._id));
        const allBlocked = mockStorage.getCollection('blocked_slots');
        setBlockedSlots(allBlocked.filter(b => courtIds.has(b.courtId)));
      });
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleCreateBlocked = (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      showToast('Vui lòng nhập lý do khóa sân.', 'warning');
      return;
    }

    try {
      const allBlocked = mockStorage.getCollection('blocked_slots');
      const newBlocked = {
        _id: `6907000000000000${Date.now().toString(16).slice(-8)}`,
        courtId,
        startAt: `${startAt}:00.000Z`,
        endAt: `${endAt}:00.000Z`,
        reason,
        createdBy: user._id,
        createdAt: new Date().toISOString()
      };
      allBlocked.unshift(newBlocked);
      mockStorage.setCollection('blocked_slots', allBlocked);
      showToast('Đã tạo lịch khóa sân/bảo trì thành công!', 'success');
      setModalOpen(false);
      loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleRemoveBlocked = (id) => {
    const allBlocked = mockStorage.getCollection('blocked_slots');
    const filtered = allBlocked.filter(b => b._id !== id);
    mockStorage.setCollection('blocked_slots', filtered);
    showToast('Đã gỡ bỏ lịch chặn sân.', 'info');
    loadData();
  };

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
          <h1 style={{ fontSize: '1.65rem', marginBottom: '6px' }}>Lịch chặn sân / Bảo trì</h1>
          <p style={{ color: 'var(--sb-text-secondary)' }}>
            Khóa khung giờ thi đấu khi sân bận tổ chức giải nội bộ hoặc bảo dưỡng kỹ thuật
          </p>
        </div>

        <button onClick={() => setModalOpen(true)} className="btn btn-primary">
          <Plus size={16} /> Tạo lịch chặn mới
        </button>
      </div>

      <div className="card" style={{ padding: '24px' }}>
        <div className="table-wrapper">
          <table className="sb-table">
            <thead>
              <tr>
                <th>Sân thi đấu</th>
                <th>Thời gian bắt đầu</th>
                <th>Thời gian kết thúc</th>
                <th>Lý do chặn sân</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {blockedSlots.map((b) => {
                const court = courts.find(c => c._id === b.courtId);
                return (
                  <tr key={b._id}>
                    <td style={{ fontWeight: 700 }}>{court?.name || 'Sân thể thao'}</td>
                    <td>{formatDateTime(b.startAt)}</td>
                    <td>{formatDateTime(b.endAt)}</td>
                    <td style={{ color: 'var(--sb-danger)', fontWeight: 600 }}>{b.reason}</td>
                    <td>
                      <button
                        onClick={() => handleRemoveBlocked(b._id)}
                        className="btn btn-secondary btn-sm"
                        style={{ color: 'var(--sb-danger)' }}
                      >
                        <Trash2 size={14} /> Gỡ chặn
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal tạo lịch chặn */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Tạo lịch chặn sân / Bảo trì"
      >
        <form onSubmit={handleCreateBlocked}>
          <div className="form-group">
            <label className="form-label">Chọn sân <span className="required">*</span></label>
            <select
              className="form-control"
              value={courtId}
              onChange={(e) => setCourtId(e.target.value)}
              required
            >
              {courts.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Thời gian bắt đầu <span className="required">*</span></label>
              <input
                type="datetime-local"
                className="form-control"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Thời gian kết thúc <span className="required">*</span></label>
              <input
                type="datetime-local"
                className="form-control"
                value={endAt}
                onChange={(e) => setEndAt(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Lý do khóa sân <span className="required">*</span></label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="Ví dụ: Thay bóng đèn LED, giải nội bộ doanh nghiệp..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">
              Đóng
            </button>
            <button type="submit" className="btn btn-primary">
              Xác nhận khóa sân
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default OwnerBlockedSlotsPage;
