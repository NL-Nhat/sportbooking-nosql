import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { courtMockService } from '../../../mock/services/courtMockService.js';
import { mockStorage } from '../../../mock/storage/mockStorage.js';
import { useToast } from '../../contexts/ToastContext.jsx';
import { ROUTES } from '../../constants/routes.js';
import { ArrowLeft, Save } from 'lucide-react';

export function OwnerPriceRuleFormPage() {
  const [searchParams] = useSearchParams();
  const preCourtId = searchParams.get('courtId') || '';
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [courts, setCourts] = useState([]);
  const [courtId, setCourtId] = useState(preCourtId);
  const [name, setName] = useState('Khung giờ vàng cuối tuần');
  const [daysOfWeek, setDaysOfWeek] = useState([6, 7]);
  const [specificDatesInput, setSpecificDatesInput] = useState('');
  const [validFrom, setValidFrom] = useState('2026-01-01');
  const [validTo, setValidTo] = useState('2026-12-31');
  const [startTime, setStartTime] = useState('17:00');
  const [endTime, setEndTime] = useState('22:00');
  const [pricePerSlot, setPricePerSlot] = useState(250000);
  const [priority, setPriority] = useState(2);
  const [status, setStatus] = useState('ACTIVE');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    courtMockService.getByOwner(user._id).then((list) => {
      setCourts(list);
      if (list.length > 0 && !courtId) {
        setCourtId(list[0]._id);
      }
    });
  }, [user, courtId]);

  const toggleDay = (day) => {
    if (daysOfWeek.includes(day)) {
      setDaysOfWeek(daysOfWeek.filter((d) => d !== day));
    } else {
      setDaysOfWeek([...daysOfWeek, day].sort());
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const specificDates = specificDatesInput
      .split(',')
      .map((s) => s.trim())
      .filter((s) => /^\d{4}-\d{2}-\d{2}$/.test(s));

    if (!name.trim() || (daysOfWeek.length === 0 && specificDates.length === 0)) {
      showToast('Vui lòng chọn ít nhất 1 thứ trong tuần hoặc nhập ngày cụ thể (yyyy-MM-dd).', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const allRules = mockStorage.getCollection('price_rules');
      const newRule = {
        _id: `6906000000000000${Date.now().toString(16).slice(-8)}`,
        courtId,
        name,
        daysOfWeek,
        specificDates,
        startTime,
        endTime,
        pricePerSlot: Number(pricePerSlot),
        validFrom,
        validTo,
        priority: Number(priority),
        status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      allRules.unshift(newRule);
      mockStorage.setCollection('price_rules', allRules);
      showToast('Tạo quy tắc giá mới thành công!', 'success');
      navigate(ROUTES.OWNER_PRICING);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const dayLabels = [
    { num: 1, label: 'Thứ 2' },
    { num: 2, label: 'Thứ 3' },
    { num: 3, label: 'Thứ 4' },
    { num: 4, label: 'Thứ 5' },
    { num: 5, label: 'Thứ 6' },
    { num: 6, label: 'Thứ 7' },
    { num: 7, label: 'Chủ Nhật' }
  ];

  return (
    <div style={{ maxWidth: '640px' }}>
      <div style={{ marginBottom: '20px' }}>
        <Link to={ROUTES.OWNER_PRICING} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--sb-text-secondary)', fontWeight: 600 }}>
          <ArrowLeft size={16} /> Quay lại danh sách giá
        </Link>
      </div>

      <div className="card" style={{ padding: '32px' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Tạo quy tắc giá sân</h1>
        <p style={{ color: 'var(--sb-text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>
          Khi khách đặt sân trùng khung giờ này, giá sẽ tự động được áp dụng theo quy tắc có priority cao hơn.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Sân áp dụng <span className="required">*</span></label>
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

          <div className="form-group">
            <label className="form-label">Tên quy tắc giá <span className="required">*</span></label>
            <input
              type="text"
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Chọn ngày trong tuần */}
          <div className="form-group">
            <label className="form-label">Các ngày áp dụng trong tuần <span className="required">*</span></label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {dayLabels.map((d) => {
                const active = daysOfWeek.includes(d.num);
                return (
                  <button
                    key={d.num}
                    type="button"
                    onClick={() => toggleDay(d.num)}
                    className={`btn btn-sm ${active ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chọn ngày cụ thể (specificDates) theo DB v2.0 */}
          <div className="form-group">
            <label className="form-label">Ngày áp dụng đặc biệt (specificDates - ưu tiên cao hơn thứ)</label>
            <input
              type="text"
              className="form-control"
              placeholder="Ví dụ: 2026-04-30, 2026-05-01, 2026-09-02 (để trống nếu chỉ áp dụng theo thứ)"
              value={specificDatesInput}
              onChange={(e) => setSpecificDatesInput(e.target.value)}
            />
            <small style={{ color: 'var(--sb-text-muted)', fontSize: '0.78rem' }}>
              Định dạng yyyy-MM-dd, phân tách bằng dấu phẩy. Quy tắc có specificDates trùng ngày khách đặt sẽ được ưu tiên áp dụng trước quy tắc theo thứ.
            </small>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Hiệu lực từ ngày (validFrom)</label>
              <input
                type="date"
                className="form-control"
                value={validFrom}
                onChange={(e) => setValidFrom(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Hiệu lực đến ngày (validTo)</label>
              <input
                type="date"
                className="form-control"
                value={validTo}
                onChange={(e) => setValidTo(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Giờ bắt đầu</label>
              <input
                type="time"
                className="form-control"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Giờ kết thúc</label>
              <input
                type="time"
                className="form-control"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Giá tiền / slot (VNĐ) <span className="required">*</span></label>
              <input
                type="number"
                className="form-control"
                value={pricePerSlot}
                onChange={(e) => setPricePerSlot(e.target.value)}
                step={10000}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Mức ưu tiên (Priority)</label>
              <select
                className="form-control"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value={1}>Mức 1 (Giờ tiêu chuẩn)</option>
                <option value={2}>Mức 2 (Ưu tiên giờ cao điểm)</option>
                <option value={3}>Mức 3 (Ưu tiên ngày lễ Tết)</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '12px' }} disabled={submitting}>
            <Save size={16} /> {submitting ? 'Đang lưu...' : 'Lưu quy tắc giá'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default OwnerPriceRuleFormPage;
