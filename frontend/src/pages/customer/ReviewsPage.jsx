import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { reviewMockService } from '../../../mock/services/reviewMockService.js';
import { formatDate } from '../../utils/formatters.js';
import { resolveAssetUrl } from '../../utils/fileUploadHelper.js';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { Star, MessageSquare } from 'lucide-react';

export function ReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      reviewMockService.getMyReviews(user._id).then((data) => {
        setReviews(data);
        setLoading(false);
      });
    }
  }, [user]);

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.65rem', marginBottom: '6px' }}>Đánh giá của tôi</h1>
        <p>Lịch sử nhận xét và phản hồi từ các chủ cơ sở thể thao</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>Đang tải đánh giá...</div>
      ) : reviews.length === 0 ? (
        <EmptyState
          icon={Star}
          title="Bạn chưa có đánh giá nào"
          description="Sau khi hoàn thành buổi tập tại các sân, bạn có thể gửi đánh giá trải nghiệm tại trang Chi tiết đơn đặt sân."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {reviews.map((rev) => (
            <div key={rev._id} className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div>
                  <h3 style={{ fontSize: '1.05rem', margin: '0 0 4px' }}>
                    {rev.court?.name}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--sb-text-muted)' }}>
                    Cơ sở: {rev.facility?.name} • Ngày đánh giá: {formatDate(rev.createdAt)}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '3px', color: 'var(--sb-warning)' }}>
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
              </div>

              <p style={{ fontSize: '0.9rem', color: 'var(--sb-text-primary)', lineHeight: 1.5, marginBottom: '14px' }}>
                {rev.content}
              </p>

              {rev.images && rev.images.length > 0 && (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
                  {rev.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={resolveAssetUrl(img)}
                      alt="Review"
                      style={{ width: '80px', height: '65px', borderRadius: '6px', objectFit: 'cover', border: '1px solid var(--sb-border)' }}
                    />
                  ))}
                </div>
              )}

              {rev.ownerReply && (
                <div style={{
                  padding: '12px 16px',
                  backgroundColor: 'var(--sb-primary-50)',
                  borderRadius: 'var(--sb-radius-md)',
                  fontSize: '0.85rem'
                }}>
                  <div style={{ fontWeight: 600, color: 'var(--sb-primary-900)', marginBottom: '4px' }}>
                    Phản hồi từ Chủ sân:
                  </div>
                  <div style={{ color: 'var(--sb-text-secondary)' }}>
                    {rev.ownerReply.content}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ReviewsPage;
