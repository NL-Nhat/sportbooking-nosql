import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { courtMockService } from '../../../mock/services/courtMockService.js';
import { mockStorage } from '../../../mock/storage/mockStorage.js';
import { useToast } from '../../contexts/ToastContext.jsx';
import { Clock, Save, Plus, Trash2, Wand2, Info } from 'lucide-react';

/**
 * Cấu hình lịch hoạt động theo Database_Design.md v2.0:
 * collection `operating_hours` lưu MỘT mẫu DAILY cho mỗi sân (unique courtId)
 * gồm: repeatMode = 'DAILY', effectiveFrom, effectiveTo, timeSlots[{ startTime, endTime }].
 * Mẫu được áp dụng tự động cho mọi ngày trong khoảng hiệu lực, không tạo document theo ngày.
 */

const toMinutes = (t) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};
const toTime = (mins) => `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;

const validateSlots = (slots, effectiveFrom, effectiveTo) => {
  if (!effectiveFrom) return 'Vui lòng chọn ngày bắt đầu áp dụng (effectiveFrom).';
  if (effectiveTo && effectiveTo < effectiveFrom) return 'Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu.';
  if (slots.length === 0) return 'Mẫu lịch phải có ít nhất một khung giờ cho thuê.';
  const sorted = [...slots].sort((a, b) => a.startTime.localeCompare(b.startTime));
  for (let i = 0; i < sorted.length; i++) {
    const s = sorted[i];
    if (!s.startTime || !s.endTime) return 'Mỗi khung giờ phải có giờ bắt đầu và giờ kết thúc.';
    if (toMinutes(s.startTime) >= toMinutes(s.endTime)) {
      return `Khung ${s.startTime} - ${s.endTime}: giờ bắt đầu phải nhỏ hơn giờ kết thúc.`;
    }
    if (i > 0 && toMinutes(sorted[i - 1].endTime) > toMinutes(s.startTime)) {
      return `Khung ${sorted[i - 1].startTime}-${sorted[i - 1].endTime} chồng lấn với ${s.startTime}-${s.endTime}.`;
    }
  }
  return null;
};

export function OwnerOperatingHoursPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [courts, setCourts] = useState([]);
  const [selectedCourtId, setSelectedCourtId] = useState('');
  const [template, setTemplate] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [effectiveFrom, setEffectiveFrom] = useState('');
  const [effectiveTo, setEffectiveTo] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Bộ sinh khung giờ nhanh
  const [genOpen, setGenOpen] = useState('06:00');
  const [genClose, setGenClose] = useState('22:00');
  const [genDuration, setGenDuration] = useState(60);

  useEffect(() => {
    if (user) {
      courtMockService.getByOwner(user._id).then((courtList) => {
        setCourts(courtList);
        if (courtList.length > 0) setSelectedCourtId(courtList[0]._id);
        setLoading(false);
      });
    }
  }, [user]);

  useEffect(() => {
    if (!selectedCourtId) return;
    const doc = mockStorage.getCollection('operating_hours').find((h) => h.courtId === selectedCourtId) || null;
    setTemplate(doc);
    setTimeSlots(doc?.timeSlots ? [...doc.timeSlots].sort((a, b) => a.startTime.localeCompare(b.startTime)) : []);
    setEffectiveFrom(doc?.effectiveFrom || new Date().toISOString().slice(0, 10));
    setEffectiveTo(doc?.effectiveTo || '');
    setError('');
  }, [selectedCourtId]);

  const updateSlot = (idx, field, value) => {
    setTimeSlots((prev) => prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s)));
  };

  const addSlot = () => {
    const last = timeSlots[timeSlots.length - 1];
    const start = last ? last.endTime : '06:00';
    const end = toTime(Math.min(toMinutes(start) + 60, 24 * 60 - 1));
    setTimeSlots((prev) => [...prev, { startTime: start, endTime: end }]);
  };

  const removeSlot = (idx) => setTimeSlots((prev) => prev.filter((_, i) => i !== idx));

  const generateSlots = () => {
    const open = toMinutes(genOpen);
    const close = toMinutes(genClose);
    const dur = Number(genDuration);
    if (open >= close) {
      showToast('Giờ mở cửa phải nhỏ hơn giờ đóng cửa.', 'error');
      return;
    }
    const generated = [];
    for (let m = open; m + dur <= close; m += dur) {
      generated.push({ startTime: toTime(m), endTime: toTime(m + dur) });
    }
    setTimeSlots(generated);
    showToast(`Đã sinh ${generated.length} khung giờ ${dur} phút. Nhấn "Lưu mẫu lịch" để áp dụng.`, 'info');
  };

  const handleSave = () => {
    const msg = validateSlots(timeSlots, effectiveFrom, effectiveTo);
    if (msg) {
      setError(msg);
      showToast(msg, 'error');
      return;
    }
    setError('');
    setSaving(true);
    try {
      const now = new Date().toISOString();
      const sorted = [...timeSlots].sort((a, b) => a.startTime.localeCompare(b.startTime));
      const all = mockStorage.getCollection('operating_hours');
      const others = all.filter((h) => h.courtId !== selectedCourtId);
      const doc = {
        _id: template?._id || `6905${Date.now().toString(16).padStart(20, '0')}`.slice(0, 24),
        courtId: selectedCourtId,
        repeatMode: 'DAILY',
        effectiveFrom,
        effectiveTo: effectiveTo || null,
        timeSlots: sorted,
        createdAt: template?.createdAt || now,
        updatedAt: now
      };
      mockStorage.setCollection('operating_hours', [...others, doc]);
      setTemplate(doc);
      setTimeSlots(sorted);
      showToast('Đã lưu mẫu lịch hằng ngày. Các booking đã xác nhận không bị ảnh hưởng.', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const totalMinutes = timeSlots.reduce((sum, s) => {
    const d = s.startTime && s.endTime ? toMinutes(s.endTime) - toMinutes(s.startTime) : 0;
    return sum + (d > 0 ? d : 0);
  }, 0);

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.65rem', marginBottom: '6px' }}>Cấu hình lịch hoạt động</h1>
        <p style={{ color: 'var(--sb-text-secondary)' }}>
          Mỗi sân có một mẫu khung giờ cho thuê lặp lại hằng ngày (DAILY), áp dụng tự động cho các ngày trong khoảng hiệu lực.
        </p>
      </div>

      <div className="card" style={{ padding: '24px', marginBottom: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div>
          <label className="form-label">Chọn sân cần cấu hình</label>
          <select className="form-control" value={selectedCourtId} onChange={(e) => setSelectedCourtId(e.target.value)}>
            {courts.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="form-label">Áp dụng từ ngày (effectiveFrom) *</label>
          <input type="date" className="form-control" value={effectiveFrom} onChange={(e) => setEffectiveFrom(e.target.value)} />
        </div>
        <div>
          <label className="form-label">Đến ngày (effectiveTo)</label>
          <input type="date" className="form-control" value={effectiveTo} onChange={(e) => setEffectiveTo(e.target.value)} />
          <small style={{ color: 'var(--sb-text-muted)' }}>Để trống nếu chưa giới hạn.</small>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>Đang nạp dữ liệu...</div>
      ) : courts.length === 0 ? (
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>Bạn chưa có sân nào để cấu hình lịch.</div>
      ) : (
        <>
          <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Wand2 size={18} color="var(--sb-primary-600)" /> Sinh nhanh khung giờ
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'flex-end' }}>
              <div>
                <label className="form-label">Mở cửa</label>
                <input type="time" className="form-control" value={genOpen} onChange={(e) => setGenOpen(e.target.value)} />
              </div>
              <div>
                <label className="form-label">Đóng cửa</label>
                <input type="time" className="form-control" value={genClose} onChange={(e) => setGenClose(e.target.value)} />
              </div>
              <div>
                <label className="form-label">Thời lượng mỗi slot</label>
                <select className="form-control" value={genDuration} onChange={(e) => setGenDuration(Number(e.target.value))}>
                  <option value={30}>30 phút</option>
                  <option value={60}>60 phút</option>
                  <option value={90}>90 phút</option>
                  <option value={120}>120 phút</option>
                </select>
              </div>
              <button type="button" className="btn btn-secondary" onClick={generateSlots}>
                <Wand2 size={16} /> Sinh khung giờ
              </button>
            </div>
          </div>

          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={20} color="var(--sb-primary-600)" /> Khung giờ cho thuê hằng ngày ({timeSlots.length} slot • {Math.round(totalMinutes / 6) / 10} giờ)
              </h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="button" onClick={addSlot} className="btn btn-secondary btn-sm">
                  <Plus size={16} /> Thêm khung giờ
                </button>
                <button type="button" onClick={handleSave} className="btn btn-primary btn-sm" disabled={saving}>
                  <Save size={16} /> {saving ? 'Đang lưu...' : 'Lưu mẫu lịch'}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ padding: '10px 14px', marginBottom: '16px', borderRadius: '10px', background: 'var(--sb-danger-bg)', color: 'var(--sb-danger)', fontSize: '0.9rem' }}>
                {error}
              </div>
            )}

            {timeSlots.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--sb-text-secondary)' }}>
                Chưa có khung giờ nào. Dùng "Sinh nhanh khung giờ" hoặc "Thêm khung giờ".
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="sb-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Giờ bắt đầu</th>
                      <th>Giờ kết thúc</th>
                      <th>Thời lượng</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {timeSlots.map((s, idx) => {
                      const dur = s.startTime && s.endTime ? toMinutes(s.endTime) - toMinutes(s.startTime) : 0;
                      return (
                        <tr key={idx}>
                          <td style={{ fontWeight: 700 }}>{idx + 1}</td>
                          <td>
                            <input type="time" className="form-control" style={{ height: '36px', width: '130px' }}
                              value={s.startTime} onChange={(e) => updateSlot(idx, 'startTime', e.target.value)} />
                          </td>
                          <td>
                            <input type="time" className="form-control" style={{ height: '36px', width: '130px' }}
                              value={s.endTime} onChange={(e) => updateSlot(idx, 'endTime', e.target.value)} />
                          </td>
                          <td style={{ color: dur > 0 ? 'var(--sb-text-primary)' : 'var(--sb-danger)' }}>
                            {dur > 0 ? `${dur} phút` : 'Không hợp lệ'}
                          </td>
                          <td>
                            <button type="button" className="btn btn-secondary btn-sm" aria-label="Xóa khung giờ" onClick={() => removeSlot(idx)}>
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px', marginTop: '16px', fontSize: '0.85rem', color: 'var(--sb-text-secondary)' }}>
              <Info size={16} style={{ flexShrink: 0 }} />
              <span>
                Khi khách xem lịch trống, hệ thống áp mẫu DAILY cho ngày được chọn, sau đó trừ các khung bị chặn (blocked_slots)
                và các slot đang HOLD/BOOKED. Ngày lễ/giá đặc biệt cấu hình trong "Giá sân" bằng specificDates.
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default OwnerOperatingHoursPage;
