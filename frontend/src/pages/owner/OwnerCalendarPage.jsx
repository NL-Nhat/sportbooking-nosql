import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { courtMockService } from '../../../mock/services/courtMockService.js';
import { formatDate } from '../../utils/formatters.js';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock } from 'lucide-react';

export function OwnerCalendarPage() {
  const { user } = useAuth();
  const [courts, setCourts] = useState([]);
  const [selectedDate, setSelectedDate] = useState('2026-11-04');
  const [calendarData, setCalendarData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      courtMockService.getByOwner(user._id).then(async (courtList) => {
        setCourts(courtList);
        const data = [];
        for (const c of courtList) {
          const slots = await courtMockService.getAvailableSlots(c._id, selectedDate);
          data.push({ court: c, slots });
        }
        setCalendarData(data);
        setLoading(false);
      });
    }
  }, [user, selectedDate]);

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
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px',
        gap: '16px'
      }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', marginBottom: '6px' }}>Lịch đặt sân trực quan (Calendar Lanes)</h1>
          <p style={{ color: 'var(--sb-text-secondary)' }}>
            Theo dõi khung giờ trống, slot đã đặt và slot đang bảo trì của tất cả các sân
          </p>
        </div>

        {/* Date Navigator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button onClick={() => changeDateByDays(-1)} className="btn btn-secondary btn-sm" aria-label="Ngày trước">
            <ChevronLeft size={16} />
          </button>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', minWidth: '130px', textAlign: 'center' }}>
            {formatDate(selectedDate)}
          </div>
          <button onClick={() => changeDateByDays(1)} className="btn btn-secondary btn-sm" aria-label="Ngày sau">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
        padding: '12px 16px',
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--sb-radius-md)',
        border: '1px solid var(--sb-border)',
        fontSize: '0.8rem',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: 'var(--sb-primary-100)', border: '1px solid var(--sb-primary-600)' }} />
          <span>Còn trống (Sẵn sàng nhận khách)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#3478B8' }} />
          <span>Đã đặt (BOOKED)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: 'var(--sb-warning)' }} />
          <span>Đang giữ chỗ (HOLD)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: 'var(--sb-danger)' }} />
          <span>Bảo trì / Khóa sân (BLOCKED)</span>
        </div>
      </div>

      {/* Calendar Lanes Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>Đang nạp lịch sân...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {calendarData.map(({ court, slots }) => (
            <div key={court._id} className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ fontSize: '1.05rem', margin: 0 }}>{court.name}</h3>
                <span className="badge badge-default">{court.attributes?.surfaceType || 'Tiêu chuẩn'}</span>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
                gap: '8px'
              }}>
                {slots.map((s) => {
                  let bg = 'var(--sb-primary-50)';
                  let color = 'var(--sb-primary-900)';
                  let border = '1px solid var(--sb-primary-100)';
                  let text = 'Trống';

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

                  return (
                    <div
                      key={s.id}
                      style={{
                        padding: '8px 6px',
                        backgroundColor: bg,
                        color,
                        border,
                        borderRadius: '6px',
                        textAlign: 'center',
                        fontSize: '0.75rem'
                      }}
                      title={s.reason || ''}
                    >
                      <div style={{ fontWeight: 700 }}>{s.start} - {s.end}</div>
                      <div style={{ fontSize: '0.7rem', marginTop: '2px', fontWeight: 600 }}>{text}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default OwnerCalendarPage;
