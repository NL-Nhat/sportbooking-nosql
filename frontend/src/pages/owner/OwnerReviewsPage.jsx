import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { reviewMockService } from '../../../mock/services/reviewMockService.js';
import { formatDate } from '../../utils/formatters.js';
import { useToast } from '../../contexts/ToastContext.jsx';
import { Star, MessageSquare, Send } from 'lucide-react';

export function OwnerReviewsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [reviews, setReviews] = useState([]);
  const [ratingFilter, setRatingFilter] = useState('ALL');
  const [replyText, setReplyText] = useState({});
  const [loading, setLoading] = useState(true);

  const loadReviews = () => {
    if (user) {
      setLoading(true);
      reviewMockService.getOwnerReviews(user._id).then((data) => {
        setReviews(data);
        setLoading(false);
      });
    }
  };

  useEffect(() => {
    loadReviews();
  }, [user]);

  const handleSendReply = async (reviewId) => {
    const content = replyText[reviewId];
    if (!content || !content.trim()) return;

    try {
      await reviewMockService.replyReview(reviewId, content.trim());
      showToast('Đã gửi phản hồi đánh giá của khách hàng!', 'success');
      setReplyText({ ...replyText, [reviewId]: '' });
      loadReviews();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const filtered = reviews.filter((r) => {
    if (ratingFilter === 'ALL') return true;
    return r.rating === Number(ratingFilter);
  });

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
          <h1 style={{ fontSize: '1.65rem', marginBottom: '6px' }}>Đánh giá & Phản hồi từ khách</h1>
          <p style={{ color: 'var(--sb-text-secondary)' }}>
            Lắng nghe ý kiến người chơi và gửi phản hồi chăm sóc khách hàng
          </p>
        </div>

        <div style={{ minWidth: '180px' }}>
          <select
            className="form-control"
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
          >
            <option value="ALL">Tất cả số sao</option>
            <option value="5">5 sao</option>
            <option value="4">4 sao</option>
            <option value="3">3 sao</option>
            <option value="2">2 sao</option>
            <option value="1">1 sao</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>Đang nạp đánh giá...</div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--sb-text-muted)' }}>
          Không có đánh giá nào ở mức lọc này.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {filtered.map((rev) => (
            <div key={rev._id} className="card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '1.05rem', margin: '0 0 4px' }}>
                    {rev.customer?.fullName || 'Khách thể thao'}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--sb-text-muted)' }}>
                    Đã đặt sân: <strong>{rev.court?.name}</strong> ({rev.facility?.name}) • Ngày: {formatDate(rev.createdAt)}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '2px', color: 'var(--sb-warning)' }}>
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
              </div>

              <p style={{ fontSize: '0.925rem', color: 'var(--sb-text-primary)', lineHeight: 1.6, marginBottom: '16px' }}>
                {rev.content}
              </p>

              {/* Owner Reply Box */}
              {rev.ownerReply ? (
                <div style={{
                  padding: '14px 18px',
                  backgroundColor: 'var(--sb-primary-50)',
                  borderRadius: 'var(--sb-radius-md)',
                  borderLeft: '4px solid var(--sb-primary-600)',
                  fontSize: '0.85rem'
                }}>
                  <div style={{ fontWeight: 700, color: 'var(--sb-primary-900)', marginBottom: '4px' }}>
                    Phản hồi của bạn ({formatDate(rev.ownerReply.repliedAt)}):
                  </div>
                  <div style={{ color: 'var(--sb-text-secondary)', lineHeight: 1.5 }}>
                    {rev.ownerReply.content}
                  </div>
                </div>
              ) : (
                <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Nhập câu trả lời phản hồi khách hàng..."
                    value={replyText[rev._id] || ''}
                    onChange={(e) => setReplyText({ ...replyText, [rev._id]: e.target.value })}
                  />
                  <button
                    onClick={() => handleSendReply(rev._id)}
                    className="btn btn-primary btn-sm"
                    style={{ flexShrink: 0 }}
                  >
                    <Send size={15} /> Gửi phản hồi
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default OwnerReviewsPage;
