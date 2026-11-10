import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { complaintMockService } from '../../../mock/services/complaintMockService.js';
import StatusBadge from '../../components/ui/StatusBadge';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import { AlertCircle, Search, Filter, Eye } from 'lucide-react';
import { formatDateTime } from '../../utils/formatters';

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await complaintMockService.getAll();
      setComplaints(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = complaints.filter(c => {
    const q = searchTerm.toLowerCase();
    const matchSearch = 
      c.subject.toLowerCase().includes(q) ||
      (c.user?.fullName && c.user.fullName.toLowerCase().includes(q)) ||
      (c.facility?.name && c.facility.name.toLowerCase().includes(q));

    const matchStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const pageSize = 10;
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 6px 0' }}>Quản lý khiếu nại & phản ánh</h1>
          <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: '14px' }}>
            Tiếp nhận và giải quyết các khiếu nại từ người dùng và chủ sân ({complaints.length} khiếu nại)
          </p>
        </div>
      </div>

      {/* Filter Card */}
      <div className="card" style={{ padding: '16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: '1 1 240px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input 
              type="text" 
              className="form-control"
              placeholder="Tìm theo tiêu đề, người gửi, cơ sở..." 
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
              style={{ paddingLeft: '38px' }}
            />
          </div>

          <div style={{ width: '180px' }}>
            <select 
              className="form-control" 
              value={statusFilter} 
              onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="OPEN">Mới gửi (OPEN)</option>
              <option value="IN_PROGRESS">Đang xử lý (IN_PROGRESS)</option>
              <option value="RESOLVED">Đã giải quyết (RESOLVED)</option>
              <option value="REJECTED">Bác bỏ (REJECTED)</option>
              <option value="CLOSED">Đã đóng (CLOSED)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {paginated.length === 0 ? (
          <EmptyState 
            icon={AlertCircle}
            title="Không tìm thấy khiếu nại nào"
            description="Hãy thử thay đổi điều kiện tìm kiếm."
          />
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Tiêu đề khiếu nại</th>
                  <th>Người khiếu nại</th>
                  <th>Liên quan cơ sở / Đơn</th>
                  <th>Thời gian gửi</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map(comp => (
                  <tr key={comp._id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>
                        {comp.subject}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {comp.content}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500, fontSize: '13px' }}>
                        {comp.user?.fullName || 'Người dùng'}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                        {comp.user?.phoneNumber || comp.user?.email || ''}
                      </div>
                    </td>
                    <td>
                      {comp.facility && (
                        <div style={{ fontSize: '13px', fontWeight: 500 }}>
                          {comp.facility.name}
                        </div>
                      )}
                      {comp.booking && (
                        <div style={{ fontSize: '12px', color: 'var(--color-primary)' }}>
                          Đơn #{comp.booking.bookingCode}
                        </div>
                      )}
                      {!comp.facility && !comp.booking && (
                        <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Khiếu nại chung</span>
                      )}
                    </td>
                    <td>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                        {formatDateTime(comp.createdAt)}
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={comp.status} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link 
                        to={`/admin/complaints/${comp._id}`}
                        className="btn btn-sm btn-primary"
                        style={{ padding: '6px 12px' }}
                      >
                        <Eye size={14} />
                        <span>Xử lý</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination 
          currentPage={page}
          totalItems={filtered.length}
          pageSize={pageSize}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
