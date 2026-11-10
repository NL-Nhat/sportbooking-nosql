import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { bookingMockService } from '../../../mock/services/bookingMockService.js';
import { facilityMockService } from '../../../mock/services/facilityMockService.js';
import { formatCurrency, formatDate } from '../../utils/formatters.js';
import { StatusBadge } from '../../components/ui/StatusBadge.jsx';
import { DollarSign, TrendingUp, CreditCard, ArrowDownRight, ArrowUpRight } from 'lucide-react';

export function OwnerRevenuePage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [selectedFac, setSelectedFac] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      Promise.all([
        bookingMockService.getOwnerBookings(user._id),
        facilityMockService.getByOwner(user._id)
      ]).then(([bList, fList]) => {
        setBookings(bList);
        setFacilities(fList);
        setLoading(false);
      });
    }
  }, [user]);

  const filtered = bookings.filter(b => selectedFac === '' || b.facilityId === selectedFac);

  const paidBookings = filtered.filter(b => b.paymentStatus === 'PAID' || b.paymentStatus === 'DEPOSIT_PAID');
  const refundedBookings = filtered.filter(b => b.paymentStatus === 'REFUNDED' || b.paymentStatus === 'PARTIALLY_REFUNDED');

  const totalPaid = paidBookings.reduce((sum, b) => sum + (b.priceDetails?.paidAmount ?? b.priceDetails?.finalPrice ?? 0), 0);
  const totalRefunded = refundedBookings.reduce((sum, b) => sum + (b.priceDetails?.paidAmount ?? b.priceDetails?.depositRequired ?? 0), 0);
  const avgOrder = paidBookings.length > 0 ? Math.round(totalPaid / paidBookings.length) : 0;

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
          <h1 style={{ fontSize: '1.65rem', marginBottom: '6px' }}>Báo cáo doanh thu & Dòng tiền</h1>
          <p style={{ color: 'var(--sb-text-secondary)' }}>
            Thống kê tài chính từ các đơn đặt sân trực tuyến và thanh toán tại quầy
          </p>
        </div>

        <div style={{ minWidth: '220px' }}>
          <select
            className="form-control"
            value={selectedFac}
            onChange={(e) => setSelectedFac(e.target.value)}
          >
            <option value="">Tất cả các cơ sở</option>
            {facilities.map((f) => (
              <option key={f._id} value={f._id}>{f.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 4 Financial KPI cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px',
        marginBottom: '28px'
      }}>
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ color: 'var(--sb-text-muted)', fontSize: '0.8rem', marginBottom: '8px' }}>
            Doanh thu thực nhận
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--sb-primary-900)' }}>
            {formatCurrency(totalPaid)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--sb-success)', marginTop: '4px', fontWeight: 600 }}>
            {paidBookings.length} giao dịch thành công
          </div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ color: 'var(--sb-text-muted)', fontSize: '0.8rem', marginBottom: '8px' }}>
            Giá trị trung bình / đơn
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--sb-primary-900)' }}>
            {formatCurrency(avgOrder)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--sb-text-muted)', marginTop: '4px' }}>
            Theo slot 60 - 90 phút
          </div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ color: 'var(--sb-text-muted)', fontSize: '0.8rem', marginBottom: '8px' }}>
            Doanh số hoàn tiền (Hủy sân)
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--sb-danger)' }}>
            {formatCurrency(totalRefunded)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--sb-text-muted)', marginTop: '4px' }}>
            {refundedBookings.length} đơn hủy hoàn cọc
          </div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ color: 'var(--sb-text-muted)', fontSize: '0.8rem', marginBottom: '8px' }}>
            Phương thức thanh toán chủ yếu
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--sb-info)', marginTop: '4px' }}>
            ONLINE (65%)
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--sb-text-muted)', marginTop: '6px' }}>
            Tiền mặt & Chuyển khoản (35%)
          </div>
        </div>
      </div>

      {/* Transaction Breakdown Table */}
      <div className="card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.15rem', marginBottom: '16px' }}>Bảng kê giao dịch chi tiết</h3>

        <div className="table-wrapper">
          <table className="sb-table">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Sân & Cơ sở</th>
                <th>Ngày thi đấu</th>
                <th>Doanh thu</th>
                <th>Phương thức</th>
                <th>Trạng thái tiền</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b._id}>
                  <td style={{ fontWeight: 800, fontFamily: 'monospace' }}>{b.bookingCode}</td>
                  <td>{b.customer?.fullName || 'Khách vãng lai'}</td>
                  <td>
                    <div>{b.court?.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--sb-text-muted)' }}>{b.facility?.name}</div>
                  </td>
                  <td>{formatDate(b.items?.[0]?.bookingDate || b.bookingDate)}</td>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--sb-primary-700)' }}>
                      Đã thu: {formatCurrency(b.priceDetails?.paidAmount ?? b.priceDetails?.finalPrice)}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--sb-text-muted)' }}>
                      Tổng đơn: {formatCurrency(b.priceDetails?.originalAmount ?? b.priceDetails?.finalPrice)}
                    </div>
                  </td>
                  <td>{b.payment?.method || 'ONLINE'}</td>
                  <td>
                    <StatusBadge status={b.paymentStatus} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default OwnerRevenuePage;
