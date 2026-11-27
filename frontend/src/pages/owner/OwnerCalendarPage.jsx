import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { ownerBookingService } from '../../services/ownerBookingService.js';
import { ownerFacilityService } from '../../services/ownerFacilityService.js';
import { formatDate, formatCurrency } from '../../utils/formatters.js';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { ROUTES } from '../../constants/routes.js';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  User,
  Phone
} from 'lucide-react';

export function OwnerCalendarPage() {
  const { user } = useAuth();
  const [facilities, setFacilities] = useState([]);
  const [selectedFacility, setSelectedFacility] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [calendarLanes, setCalendarLanes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!user) return;
    ownerFacilityService
      .getMyFacilities()
      .catch(() => [])
      .then((facList) => {
        setFacilities(facList);
      });
  }, [user]);

  const fetchCalendarData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setErrorMessage('');
    try {
      const data = await ownerBookingService.getOwnerCalendar({
        facilityId: selectedFacility,
        date: selectedDate
      });
      setCalendarLanes(data.courts || []);
    } catch (err) {
      setErrorMessage(err?.message || 'Không thể tải dữ liệu lịch biểu đặt sân từ máy chủ.');
    } finally {
      setLoading(false);
    }
  }, [user, selectedFacility, selectedDate]);

  useEffect(() => {
    fetchCalendarData();
  }, [fetchCalendarData]);

  const changeDateByDays = (days) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    const yyyy = current.getFullYear();
    const mm = String(current.getMonth() + 1).padStart(2, '0');
    const dd = String(current.getDate()).padStart(2, '0');
    setSelectedDate(`${yyyy}-${mm}-${dd}`);
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
          <h1 style={{ fontSize: '1.65rem', marginBottom: '6px' }}>Lịch biểu đặt sân trực quan</h1>
          <p style={{ color: 'var(--sb-text-secondary)' }}>
            Theo dõi khung giờ trống, ca đã đặt và ca đang bảo trì của tất cả các sân theo ngày
          </p>
        </div>

        {/* Bộ lọc cơ sở & Điều hướng ngày */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px' }}>
          <select
            className="form-control"
            style={{ width: '220px', height: '38px' }}
            value={selectedFacility}
            onChange={(e) => setSelectedFacility(e.target.value)}
          >
            <option value="">Tất cả cơ sở của tôi</option>
            {facilities.map((f) => {
              const fId = f.id || f._id;
              return (
                <option key={fId} value={fId}>
                  {f.name}
                </option>
              );
            })}
          </select>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={() => changeDateByDays(-1)}
              className="btn btn-secondary btn-sm"
              aria-label="Ngày trước"
            >
              <ChevronLeft size={16} />
            </button>
            <input
              type="date"
              className="form-control"
              style={{ height: '38px', width: '150px', fontWeight: 700 }}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
            <button
              type="button"
              onClick={() => changeDateByDays(1)}
              className="btn btn-secondary btn-sm"
              aria-label="Ngày sau"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '18px',
          padding: '12px 16px',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--sb-radius-md)',
          border: '1px solid var(--sb-border)',
          fontSize: '0.82rem',
          marginBottom: '20px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '3px',
              backgroundColor: 'var(--sb-primary-100)',
              border: '1px solid var(--sb-primary-600)'
            }}
          />
          <span>Còn trống (Sẵn sàng nhận khách)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#3478B8' }} />
          <span>Đã đặt</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: 'var(--sb-warning)' }} />
          <span>Đang giữ chỗ</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: 'var(--sb-danger)' }} />
          <span>Bảo trì / Khóa sân</span>
        </div>
      </div>

      {/* Calendar Lanes Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          Đang tải lịch biểu đặt sân ngày {formatDate(selectedDate)} từ máy chủ...
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
          <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Không thể tải lịch biểu đặt sân</h3>
          <p style={{ color: 'var(--sb-text-secondary)', marginBottom: '16px' }}>{errorMessage}</p>
          <button type="button" onClick={fetchCalendarData} className="btn btn-primary btn-sm">
            <RefreshCw size={15} /> Thử lại
          </button>
        </div>
      ) : calendarLanes.length === 0 ? (
        <EmptyState
          icon={CalendarIcon}
          title="Chưa có sân thể thao nào để hiển thị lịch biểu"
          description="Hãy tạo sân thể thao và cấu hình khung giờ cho thuê để xem lịch biểu trực quan theo ngày."
          action={
            <Link to={ROUTES.OWNER_COURT_NEW} className="btn btn-primary btn-sm">
              Thêm sân mới
            </Link>
          }
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {calendarLanes.map((lane) => {
            const courtId = lane.courtId || lane._id;
            const slots = Array.isArray(lane.slots) ? lane.slots : [];

            return (
              <div key={courtId} className="card" style={{ padding: '20px' }}>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '14px'
                  }}
                >
                  <div>
                    <h3 style={{ fontSize: '1.08rem', margin: 0 }}>{lane.courtName}</h3>
                    <div style={{ fontSize: '0.78rem', color: 'var(--sb-text-muted)' }}>
                      {lane.facilityName ? `${lane.facilityName} • ` : ''}
                      {lane.categoryName || 'Thể thao'}
                    </div>
                  </div>
                  <span className="badge badge-default">
                    {lane.attributes?.surfaceType || lane.attributes?.surface || 'Tiêu chuẩn'}
                  </span>
                </div>

                {slots.length === 0 ? (
                  <div
                    style={{
                      padding: '18px',
                      textAlign: 'center',
                      borderRadius: '8px',
                      backgroundColor: 'var(--sb-background)',
                      color: 'var(--sb-text-muted)',
                      fontSize: '0.84rem'
                    }}
                  >
                    Sân này chưa có khung giờ cho thuê hiệu lực cho ngày {formatDate(selectedDate)}.
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                      gap: '10px'
                    }}
                  >
                    {slots.map((s) => {
                      let bg = 'var(--sb-primary-50)';
                      let color = 'var(--sb-primary-900)';
                      let border = '1px solid var(--sb-primary-100)';
                      let text = 'Còn trống';

                      if (s.status === 'BOOKED') {
                        bg = '#EAF3FC';
                        color = '#3478B8';
                        border = '1px solid #3478B8';
                        text = 'ĐÃ ĐẶT';
                      } else if (s.status === 'HOLD') {
                        bg = 'var(--sb-warning-bg)';
                        color = 'var(--sb-warning)';
                        border = '1px solid var(--sb-warning)';
                        text = 'GIỮ CHỖ';
                      } else if (s.status === 'BLOCKED') {
                        bg = 'var(--sb-danger-bg)';
                        color = 'var(--sb-danger)';
                        border = '1px solid var(--sb-danger)';
                        text = 'BẢO TRÌ';
                      }

                      const slotContent = (
                        <div
                          style={{
                            padding: '10px 8px',
                            backgroundColor: bg,
                            color,
                            border,
                            borderRadius: '8px',
                            textAlign: 'center',
                            fontSize: '0.78rem',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            gap: '4px'
                          }}
                          title={s.reason || ''}
                        >
                          <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                            {s.startTime} - {s.endTime}
                          </div>

                          <div style={{ fontSize: '0.72rem', fontWeight: 700 }}>{text}</div>

                          {s.status === 'AVAILABLE' && s.price && (
                            <div style={{ fontSize: '0.72rem', color: 'var(--sb-primary-700)', fontWeight: 600 }}>
                              {formatCurrency(s.price)}
                            </div>
                          )}

                          {(s.status === 'BOOKED' || s.status === 'HOLD') && (
                            <div
                              style={{
                                marginTop: '2px',
                                paddingTop: '4px',
                                borderTop: '1px dashed rgba(0,0,0,0.12)',
                                fontSize: '0.7rem',
                                textAlign: 'left'
                              }}
                            >
                              {s.bookingCode && (
                                <div style={{ fontWeight: 700, fontFamily: 'monospace' }}>{s.bookingCode}</div>
                              )}
                              {s.customerName && (
                                <div
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '3px',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                  }}
                                >
                                  <User size={11} /> {s.customerName}
                                </div>
                              )}
                              {s.customerPhone && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                  <Phone size={11} /> {s.customerPhone}
                                </div>
                              )}
                            </div>
                          )}

                          {s.status === 'BLOCKED' && s.reason && (
                            <div
                              style={{
                                fontSize: '0.68rem',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}
                            >
                              {s.reason}
                            </div>
                          )}
                        </div>
                      );

                      return s.bookingId ? (
                        <Link
                          key={s.id}
                          to={`/owner/bookings/${s.bookingId}`}
                          style={{ textDecoration: 'none' }}
                        >
                          {slotContent}
                        </Link>
                      ) : (
                        <div key={s.id}>{slotContent}</div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default OwnerCalendarPage;
