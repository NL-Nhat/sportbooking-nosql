import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { ownerCourtService } from '../../services/ownerCourtService.js';
import { ownerPriceRuleService } from '../../services/ownerPriceRuleService.js';
import { formatCurrency, getDayName } from '../../utils/formatters.js';
import { StatusBadge } from '../../components/ui/StatusBadge.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { ROUTES } from '../../constants/routes.js';
import { Plus, DollarSign, AlertCircle, RefreshCw } from 'lucide-react';

export function OwnerPricingPage() {
  const { user } = useAuth();
  const [courts, setCourts] = useState([]);
  const [selectedCourtId, setSelectedCourtId] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priceRules, setPriceRules] = useState([]);
  const [loadingCourts, setLoadingCourts] = useState(true);
  const [loadingRules, setLoadingRules] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!user) return;
    setLoadingCourts(true);
    ownerCourtService
      .getMyCourts()
      .catch(() => [])
      .then((courtList) => {
        setCourts(courtList);
        if (courtList.length > 0) {
          setSelectedCourtId(courtList[0].id || courtList[0]._id);
        }
      })
      .finally(() => {
        setLoadingCourts(false);
      });
  }, [user]);

  const fetchPriceRules = useCallback(async (courtId, status) => {
    if (!courtId) {
      setPriceRules([]);
      return;
    }
    setLoadingRules(true);
    setErrorMessage('');
    try {
      const list = await ownerPriceRuleService.getPriceRules({
        courtId,
        status
      });
      setPriceRules(list);
    } catch (err) {
      setErrorMessage(err?.message || 'Không thể tải danh sách quy tắc giá từ máy chủ.');
    } finally {
      setLoadingRules(false);
    }
  }, []);

  useEffect(() => {
    if (selectedCourtId) {
      fetchPriceRules(selectedCourtId, statusFilter);
    }
  }, [selectedCourtId, statusFilter, fetchPriceRules]);

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
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 280px', maxWidth: '400px' }}>
            <label className="form-label">Chọn sân:</label>
            <select
              className="form-control"
              value={selectedCourtId}
              onChange={(e) => setSelectedCourtId(e.target.value)}
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

          <div style={{ flex: '0 0 220px' }}>
            <label className="form-label">Trạng thái quy tắc:</label>
            <select
              className="form-control"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="ACTIVE">Đang áp dụng</option>
              <option value="INACTIVE">Tạm ngưng</option>
            </select>
          </div>
        </div>
      </div>

      {loadingCourts || loadingRules ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>Đang nạp quy tắc giá từ máy chủ...</div>
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
          <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Không thể tải danh sách quy tắc giá</h3>
          <p style={{ color: 'var(--sb-text-secondary)', marginBottom: '16px' }}>{errorMessage}</p>
          <button
            type="button"
            onClick={() => fetchPriceRules(selectedCourtId, statusFilter)}
            className="btn btn-primary btn-sm"
          >
            <RefreshCw size={15} /> Thử lại
          </button>
        </div>
      ) : courts.length === 0 ? (
        <EmptyState
          icon={DollarSign}
          title="Chưa có sân thể thao nào"
          description="Vui lòng tạo sân thể thao trước khi cấu hình quy tắc giá."
          action={
            <Link to={ROUTES.OWNER_COURT_NEW} className="btn btn-primary btn-sm">
              Thêm sân mới
            </Link>
          }
        />
      ) : priceRules.length === 0 ? (
        <EmptyState
          icon={DollarSign}
          title="Chưa có quy tắc giá nào cho sân này"
          description="Hãy thêm quy tắc giá giờ thường, giờ cao điểm hoặc ngày lễ để hệ thống tự động tính tiền khi khách đặt sân."
          action={
            <Link to={`${ROUTES.OWNER_PRICING_NEW}?courtId=${selectedCourtId}`} className="btn btn-primary btn-sm">
              <Plus size={15} /> Thêm quy tắc giá mới
            </Link>
          }
        />
      ) : (
        <div className="card" style={{ padding: '24px' }}>
          <div className="table-wrapper">
            <table className="sb-table">
              <thead>
                <tr>
                  <th>Tên quy tắc</th>
                  <th>Thứ trong tuần</th>
                  <th>Ngày đặc biệt</th>
                  <th>Khung giờ</th>
                  <th>Hiệu lực</th>
                  <th>Đơn giá / slot</th>
                  <th>Độ ưu tiên</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {priceRules.map((r) => {
                  const ruleId = r.id || r._id;
                  return (
                    <tr key={ruleId}>
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
                        <div
                          style={{
                            fontSize: '0.82rem',
                            color: r.specificDates?.length ? 'var(--sb-warning)' : 'var(--sb-text-muted)',
                            fontWeight: r.specificDates?.length ? 600 : 400
                          }}
                        >
                          {r.specificDates?.length > 0 ? r.specificDates.join(', ') : 'Không (theo thứ)'}
                        </div>
                      </td>
                      <td>
                        {r.startTime} - {r.endTime}
                      </td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--sb-text-secondary)' }}>
                        {r.validFrom || '—'} {r.validTo ? `→ ${r.validTo}` : '(Không giới hạn)'}
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--sb-primary-700)', fontSize: '0.95rem' }}>
                        {formatCurrency(r.pricePerSlot)}
                      </td>
                      <td>Mức {r.priority}</td>
                      <td>
                        <StatusBadge status={r.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default OwnerPricingPage;
