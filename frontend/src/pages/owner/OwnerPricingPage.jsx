import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { courtMockService } from '../../../mock/services/courtMockService.js';
import { mockStorage } from '../../../mock/storage/mockStorage.js';
import { formatCurrency, getDayName } from '../../utils/formatters.js';
import { StatusBadge } from '../../components/ui/StatusBadge.jsx';
import { ROUTES } from '../../constants/routes.js';
import { Plus, DollarSign, Edit, Trash2 } from 'lucide-react';

export function OwnerPricingPage() {
  const { user } = useAuth();
  const [courts, setCourts] = useState([]);
  const [selectedCourtId, setSelectedCourtId] = useState('');
  const [priceRules, setPriceRules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      courtMockService.getByOwner(user._id).then((courtList) => {
        setCourts(courtList);
        if (courtList.length > 0) {
          setSelectedCourtId(courtList[0]._id);
        }
        setLoading(false);
      });
    }
  }, [user]);

  useEffect(() => {
    if (selectedCourtId) {
      const allRules = mockStorage.getCollection('price_rules');
      const filtered = allRules.filter((r) => r.courtId === selectedCourtId);
      setPriceRules(filtered);
    }
  }, [selectedCourtId]);

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
          <h1 style={{ fontSize: '1.65rem', marginBottom: '6px' }}>Quy tắc tính giá sân</h1>
          <p style={{ color: 'var(--sb-text-secondary)' }}>
            Cấu hình giá giờ thường, giờ cao điểm và cuối tuần linh hoạt theo từng sân
          </p>
        </div>

        <Link to={`${ROUTES.OWNER_PRICING_NEW}?courtId=${selectedCourtId}`} className="btn btn-primary">
          <Plus size={16} /> Thêm quy tắc giá mới
        </Link>
      </div>

      <div className="card" style={{ padding: '20px', marginBottom: '24px' }}>
        <div style={{ maxWidth: '360px' }}>
          <label className="form-label">Chọn sân:</label>
          <select
            className="form-control"
            value={selectedCourtId}
            onChange={(e) => setSelectedCourtId(e.target.value)}
          >
            {courts.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>Đang nạp quy tắc giá...</div>
      ) : (
        <div className="card" style={{ padding: '24px' }}>
          <div className="table-wrapper">
            <table className="sb-table">
              <thead>
                <tr>
                  <th>Tên quy tắc</th>
                  <th>Thứ trong tuần</th>
                  <th>Ngày đặc biệt (specificDates)</th>
                  <th>Khung giờ</th>
                  <th>Đơn giá / slot</th>
                  <th>Độ ưu tiên</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {priceRules.map((r) => (
                  <tr key={r._id}>
                    <td style={{ fontWeight: 700 }}>{r.name}</td>
                    <td>
                      <div style={{ fontSize: '0.85rem' }}>
                        {!r.daysOfWeek || r.daysOfWeek.length === 0
                          ? '—'
                          : r.daysOfWeek.length === 7
                            ? 'Tất cả các ngày'
                            : r.daysOfWeek.map(getDayName).join(', ')}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.82rem', color: r.specificDates?.length ? 'var(--sb-warning)' : 'var(--sb-text-muted)', fontWeight: r.specificDates?.length ? 600 : 400 }}>
                        {r.specificDates?.length > 0 ? r.specificDates.join(', ') : 'Không (theo thứ)'}
                      </div>
                    </td>
                    <td>
                      {r.startTime} - {r.endTime}
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--sb-primary-700)', fontSize: '0.95rem' }}>
                      {formatCurrency(r.pricePerSlot)}
                    </td>
                    <td>Mức {r.priority}</td>
                    <td>
                      <StatusBadge status={r.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default OwnerPricingPage;
