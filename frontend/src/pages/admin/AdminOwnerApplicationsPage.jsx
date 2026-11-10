import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userMockService } from '../../../mock/services/userMockService.js';
import { formatDate } from '../../utils/formatters.js';
import { StatusBadge } from '../../components/ui/StatusBadge.jsx';
import { ShieldCheck, Eye, Search } from 'lucide-react';

export function AdminOwnerApplicationsPage() {
  const [apps, setApps] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const loadApps = () => {
    setLoading(true);
    userMockService.getOwnerApplications({ status: statusFilter }).then((data) => {
      setApps(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadApps();
  }, [statusFilter]);

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
          <h1 style={{ fontSize: '1.65rem', marginBottom: '6px' }}>Hồ sơ đăng ký Chủ sân (Owner Applications)</h1>
          <p style={{ color: 'var(--sb-text-secondary)' }}>
            Thẩm định giấy phép kinh doanh và phê duyệt quyền quản lý sân cho đối tác
          </p>
        </div>

        <div style={{ minWidth: '200px' }}>
          <select
            className="form-control"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="PENDING">Chờ duyệt (PENDING)</option>
            <option value="APPROVED">Đã duyệt (APPROVED)</option>
            <option value="REJECTED">Đã từ chối (REJECTED)</option>
          </select>
        </div>
      </div>

      <div className="card" style={{ padding: '24px' }}>
        <div className="table-wrapper">
          <table className="sb-table">
            <thead>
              <tr>
                <th>Tên doanh nghiệp / Hộ kinh doanh</th>
                <th>Người đại diện</th>
                <th>SĐT liên hệ</th>
                <th>Địa chỉ kinh doanh</th>
                <th>Ngày nộp</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {apps.map((a) => (
                <tr key={a._id}>
                  <td style={{ fontWeight: 700 }}>{a.businessName}</td>
                  <td>{a.user?.fullName}</td>
                  <td>{a.contactPhone}</td>
                  <td>{a.businessAddress?.detail}, {a.businessAddress?.district}</td>
                  <td>{formatDate(a.createdAt)}</td>
                  <td><StatusBadge status={a.status} /></td>
                  <td>
                    <Link to={`/admin/owner-applications/${a._id}`} className="btn btn-secondary btn-sm">
                      <Eye size={14} /> Thẩm định
                    </Link>
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

export default AdminOwnerApplicationsPage;
