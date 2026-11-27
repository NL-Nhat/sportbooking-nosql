import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { ownerCourtService } from '../../services/ownerCourtService.js';
import { ownerBlockedSlotService } from '../../services/ownerBlockedSlotService.js';
import { formatDateTime } from '../../utils/formatters.js';
import { Modal } from '../../components/ui/Modal.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { useToast } from '../../contexts/ToastContext.jsx';
import { Plus, Trash2, CalendarDays, AlertCircle, RefreshCw } from 'lucide-react';

export function OwnerBlockedSlotsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [courts, setCourts] = useState([]);
  const [selectedCourtFilter, setSelectedCourtFilter] = useState('');
  const [selectedDateFilter, setSelectedDateFilter] = useState('');
  const [blockedSlots, setBlockedSlots] = useState([]);
  const [loadingCourts, setLoadingCourts] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deletingSlotId, setDeletingSlotId] = useState('');

  // Form
  const [courtId, setCourtId] = useState('');
  const [startAt, setStartAt] = useState('2026-11-06T08:00');
  const [endAt, setEndAt] = useState('2026-11-06T12:00');
  const [reason, setReason] = useState('Bảo trì mặt sân định kỳ');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoadingCourts(true);
    ownerCourtService
      .getMyCourts()
      .catch(() => [])
      .then((courtList) => {
        setCourts(courtList);
        if (courtList.length > 0) {
          setCourtId((prev) => prev || courtList[0].id || courtList[0]._id);
        }
      })
      .finally(() => {
        setLoadingCourts(false);
      });
  }, [user]);

  const fetchBlockedSlots = useCallback(async (filterCourtId = '', filterDate = '') => {
    setLoadingSlots(true);
    setErrorMessage('');
    try {
      const list = await ownerBlockedSlotService.getBlockedSlots({
        courtId: filterCourtId,
        date: filterDate
      });
      setBlockedSlots(list);
    } catch (err) {
      setErrorMessage(err?.message || 'Không thể tải danh sách lịch chặn sân từ máy chủ.');
    } finally {
      setLoadingSlots(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchBlockedSlots(selectedCourtFilter, selectedDateFilter);
    }
  }, [user, selectedCourtFilter, selectedDateFilter, fetchBlockedSlots]);

  const handleCreateBlocked = async (e) => {
    e.preventDefault();
    if (!courtId) {
      showToast('Vui lòng chọn sân thể thao cần khóa.', 'warning');
      return;
    }
    if (!startAt || !endAt) {
      showToast('Vui lòng chọn thời gian bắt đầu và kết thúc.', 'warning');
      return;
    }
    if (new Date(startAt) >= new Date(endAt)) {
      showToast('Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc.', 'warning');
      return;
    }
    if (!reason.trim()) {
      showToast('Vui lòng nhập lý do khóa sân.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      await ownerBlockedSlotService.createBlockedSlot({
        courtId,
        startAt,
        endAt,
        reason: reason.trim()
      });
      showToast('Đã tạo lịch khóa sân/bảo trì thành công!', 'success');
      setModalOpen(false);
      await fetchBlockedSlots(selectedCourtFilter, selectedDateFilter);
    } catch (err) {
      showToast(err?.message || 'Không thể tạo lịch chặn sân.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveBlocked = async (slot) => {
    const slotId = slot.id || slot._id;
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn gỡ bỏ lịch chặn sân "${slot.reason}" không?`
    );
    if (!confirmed) return;

    setDeletingSlotId(slotId);
    try {
      await ownerBlockedSlotService.deleteBlockedSlot(slotId);
      setBlockedSlots((prev) => prev.filter((item) => (item.id || item._id) !== slotId));
      showToast('Đã gỡ bỏ lịch chặn sân thành công!', 'info');
    } catch (err) {
      showToast(err?.message || 'Không thể gỡ bỏ lịch chặn sân.', 'error');
    } finally {
      setDeletingSlotId('');
    }
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
          gap: '16px'
        }}
      >
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

      {/* Bộ lọc theo sân và theo ngày */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 260px', maxWidth: '380px' }}>
            <label className="form-label">Lọc theo sân:</label>
            <select
              className="form-control"
              value={selectedCourtFilter}
              onChange={(e) => setSelectedCourtFilter(e.target.value)}
            >
              <option value="">Tất cả các sân của tôi</option>
              {courts.map((c) => {
                const cId = c.id || c._id;
                return (
                  <option key={cId} value={cId}>
                    {c.name} {c.facilityName ? `(${c.facilityName})` : ''}
                  </option>
                );
              })}
            </select>
          </div>

          <div style={{ flex: '0 0 210px' }}>
            <label className="form-label">Lọc theo ngày:</label>
            <input
              type="date"
              className="form-control"
              value={selectedDateFilter}
              onChange={(e) => setSelectedDateFilter(e.target.value)}
            />
          </div>

          {(selectedCourtFilter || selectedDateFilter) && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ height: '42px' }}
              onClick={() => {
                setSelectedCourtFilter('');
                setSelectedDateFilter('');
              }}
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
      </div>

      {loadingCourts || loadingSlots ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          Đang tải danh sách lịch chặn sân từ máy chủ...
        </div>
      ) : errorMessage ? (
        <div className="card" style={{ padding: '32px', textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'var(--sb-danger-bg)',
              color: 'var(--sb-danger)',
              marginBottom: '12px'
            }}
          >
            <AlertCircle size={24} />
          </div>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Không thể tải lịch chặn sân</h3>
          <p style={{ color: 'var(--sb-text-secondary)', marginBottom: '16px' }}>{errorMessage}</p>
          <button
            type="button"
            onClick={() => fetchBlockedSlots(selectedCourtFilter, selectedDateFilter)}
            className="btn btn-primary btn-sm"
          >
            <RefreshCw size={15} /> Thử lại
          </button>
        </div>
      ) : blockedSlots.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="Chưa có lịch chặn sân nào"
          description="Các sân của bạn hiện đều mở bình thường. Bạn có thể tạo lịch chặn khi sân cần bảo trì hoặc tổ chức sự kiện riêng."
          action={
            <button type="button" onClick={() => setModalOpen(true)} className="btn btn-primary btn-sm">
              <Plus size={15} /> Tạo lịch chặn mới
            </button>
          }
        />
      ) : (
        <div className="card" style={{ padding: '24px' }}>
          <div className="table-wrapper">
            <table className="sb-table">
              <thead>
                <tr>
                  <th>Sân thi đấu</th>
                  <th>Cơ sở</th>
                  <th>Thời gian bắt đầu</th>
                  <th>Thời gian kết thúc</th>
                  <th>Lý do chặn sân</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {blockedSlots.map((b) => {
                  const slotId = b.id || b._id;
                  const court = courts.find((c) => (c.id || c._id) === b.courtId);
                  const courtName = b.courtName || court?.name || 'Sân thể thao';
                  const facilityName = b.facilityName || court?.facilityName || '—';

                  return (
                    <tr key={slotId}>
                      <td style={{ fontWeight: 700 }}>{courtName}</td>
                      <td style={{ color: 'var(--sb-text-secondary)' }}>{facilityName}</td>
                      <td>{formatDateTime(b.startAt)}</td>
                      <td>{formatDateTime(b.endAt)}</td>
                      <td style={{ color: 'var(--sb-danger)', fontWeight: 600 }}>{b.reason}</td>
                      <td>
                        <button
                          type="button"
                          onClick={() => handleRemoveBlocked(b)}
                          className="btn btn-secondary btn-sm"
                          style={{ color: 'var(--sb-danger)' }}
                          disabled={deletingSlotId === slotId}
                        >
                          <Trash2 size={14} /> {deletingSlotId === slotId ? 'Đang gỡ...' : 'Gỡ chặn'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal tạo lịch chặn */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Tạo lịch chặn sân / Bảo trì"
      >
        <form onSubmit={handleCreateBlocked}>
          <div className="form-group">
            <label className="form-label">
              Chọn sân <span className="required">*</span>
            </label>
            <select
              className="form-control"
              value={courtId}
              onChange={(e) => setCourtId(e.target.value)}
              required
            >
              {courts.map((c) => {
                const cId = c.id || c._id;
                return (
                  <option key={cId} value={cId}>
                    {c.name} {c.facilityName ? `(${c.facilityName})` : ''}
                  </option>
                );
              })}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">
                Thời gian bắt đầu <span className="required">*</span>
              </label>
              <input
                type="datetime-local"
                className="form-control"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Thời gian kết thúc <span className="required">*</span>
              </label>
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
            <label className="form-label">
              Lý do khóa sân <span className="required">*</span>
            </label>
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
            <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary" disabled={submitting}>
              Đóng
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Đang lưu...' : 'Xác nhận khóa sân'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default OwnerBlockedSlotsPage;
