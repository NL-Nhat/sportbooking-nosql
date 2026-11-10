import React, { useState, useEffect } from 'react';
import { reviewMockService } from '../../../mock/services/reviewMockService.js';
import { useToast } from '../../contexts/ToastContext';
import StatusBadge from '../../components/ui/StatusBadge';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import { MessageSquare, Search, Eye, EyeOff, Star, AlertCircle } from 'lucide-react';
import { formatDateTime } from '../../utils/formatters';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [ratingFilter, setRatingFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const { addToast } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await reviewMockService.getAllReviews();
      setReviews(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleStatus = async (review) => {
    const newStatus = review.status === 'VISIBLE' ? 'HIDDEN' : 'VISIBLE';
    try {
      await reviewMockService.toggleStatus(review._id, newStatus);
      addToast(`Đã chuyển trạng thái đánh giá thành ${newStatus}`, 'success');
      loadData();
    } catch (err) {
      addToast(err.message || 'Lỗi kiểm duyệt', 'error');
    }
  };

  const filtered = reviews.filter(r => {
    const q = searchTerm.toLowerCase();
    const matchSearch = 
      (r.content && r.content.toLowerCase().includes(q)) ||
      (r.customer?.fullName && r.customer.fullName.toLowerCase().includes(q)) ||
      (r.facility?.name && r.facility.name.toLowerCase().includes(q));

    const matchStatus = statusFilter === 'ALL' || r.status === statusFilter;
    const matchRating = ratingFilter === 'ALL' || r.rating === Number(ratingFilter);

    return matchSearch && matchStatus && matchRating;
  });

  const pageSize = 10;
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 6px 0' }}>Kiểm duyệt đánh giá</h1>
          <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: '14px' }}>
            Quản lý và kiểm duyệt nội dung phản hồi từ khách hàng ({reviews.length} đánh giá)
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
              placeholder="Tìm theo nội dung, khách hàng, cơ sở..." 
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
              style={{ paddingLeft: '38px' }}
            />
          </div>

          <div style={{ width: '160px' }}>
            <select 
              className="form-control" 
              value={statusFilter} 
              onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="VISIBLE">Hiển thị (VISIBLE)</option>
              <option value="HIDDEN">Đã ẩn (HIDDEN)</option>
            </select>
          </div>

          <div style={{ width: '160px' }}>
            <select 
              className="form-control" 
              value={ratingFilter} 
              onChange={e => { setRatingFilter(e.target.value); setPage(1); }}
            >
              <option value="ALL">Tất cả số sao</option>
              <option value="5">5 sao ⭐⭐⭐⭐⭐</option>
              <option value="4">4 sao ⭐⭐⭐⭐</option>
              <option value="3">3 sao ⭐⭐⭐</option>
              <option value="2">2 sao ⭐⭐</option>
              <option value="1">1 sao ⭐</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {paginated.length === 0 ? (
          <EmptyState 
            icon={MessageSquare}
            title="Không có đánh giá nào phù hợp"
            description="Hãy thử thay đổi điều kiện tìm kiếm."
          />
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Khách hàng</th>
                  <th>Cơ sở & Sân</th>
                  <th>Số sao</th>
                  <th style={{ width: '40%' }}>Nội dung đánh giá</th>
                  <th>Thời gian</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map(rev => (
                  <tr key={rev._id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '13px' }}>
                        {rev.customer?.fullName || 'Khách hàng'}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                        {rev.customer?.email || ''}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500, fontSize: '13px' }}>
                        {rev.facility?.name || 'Cơ sở'}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                        {rev.court?.name}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#f59e0b' }}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            size={14} 
                            fill={i < rev.rating ? '#f59e0b' : 'none'} 
                            color={i < rev.rating ? '#f59e0b' : '#d1d5db'}
                          />
                        ))}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '13px', lineHeight: 1.5, color: 'var(--color-text-main)' }}>
                        {rev.content}
                      </div>
                      {rev.ownerReply && (
                        <div style={{ marginTop: '6px', padding: '6px 10px', backgroundColor: 'var(--color-bg-secondary)', borderRadius: '6px', fontSize: '12px' }}>
                          <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>Chủ sân phản hồi: </span>
                          <span>{rev.ownerReply.content}</span>
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                        {formatDateTime(rev.createdAt)}
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={rev.status} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        className={`btn btn-sm ${rev.status === 'VISIBLE' ? 'btn-danger' : 'btn-success'}`}
                        onClick={() => handleToggleStatus(rev)}
                        title={rev.status === 'VISIBLE' ? 'Ẩn đánh giá' : 'Hiển thị đánh giá'}
                        style={{ padding: '6px 10px' }}
                      >
                        {rev.status === 'VISIBLE' ? (
                          <>
                            <EyeOff size={14} />
                            <span>Ẩn</span>
                          </>
                        ) : (
                          <>
                            <Eye size={14} />
                            <span>Hiện</span>
                          </>
                        )}
                      </button>
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
