import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { bookingMockService } from '../../../mock/services/bookingMockService.js';
import { reviewMockService } from '../../../mock/services/reviewMockService.js';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useToast } from '../../contexts/ToastContext.jsx';
import { uploadMockFile, resolveAssetUrl } from '../../utils/fileUploadHelper.js';
import { ROUTES } from '../../constants/routes.js';
import { Star, Send, ArrowLeft, Upload } from 'lucide-react';

export function CreateReviewPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [booking, setBooking] = useState(null);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookingMockService.getById(bookingId).then((b) => {
      setBooking(b);
      setLoading(false);
    });
  }, [bookingId]);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    try {
      const uploaded = await Promise.all(files.map((f) => uploadMockFile(f)));
      setImages((prev) => [...prev, ...uploaded.map((u) => u.dbPath)]);
      showToast(`Đã tải lên ${uploaded.length} ảnh đánh giá.`, 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
    e.target.value = '';
  };

  const handleRemoveImage = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      showToast('Vui lòng chia sẻ cảm nhận về buổi tập.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      await reviewMockService.createReview({
        bookingId,
        customerId: user._id,
        rating,
        content,
        images
      });
      showToast('Đánh giá của bạn đã được đăng thành công!', 'success');
      navigate(ROUTES.REVIEWS);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '80px' }}>Đang nạp đơn đặt sân...</div>;
  }

  if (!booking) {
    return <div style={{ textAlign: 'center', padding: '80px' }}>Không tìm thấy đơn đặt sân.</div>;
  }

  return (
    <div style={{ maxWidth: '640px' }}>
      <div style={{ marginBottom: '20px' }}>
        <Link to={ROUTES.BOOKINGS} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--sb-text-secondary)', fontWeight: 600 }}>
          <ArrowLeft size={16} /> Quay lại
        </Link>
      </div>

      <div className="card" style={{ padding: '32px' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Đánh giá chất lượng sân</h1>
        <p style={{ color: 'var(--sb-text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>
          Đơn đặt: <strong>{booking.bookingCode}</strong> • Sân: <strong>{booking.court?.name}</strong> ({booking.facility?.name})
        </p>

        <form onSubmit={handleSubmit}>
          {/* Rating Stars Picker */}
          <div style={{ marginBottom: '24px', textAlign: 'center' }}>
            <label className="form-label" style={{ marginBottom: '10px' }}>Mức độ hài lòng của bạn</label>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = (hoverRating || rating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    style={{ padding: '6px', cursor: 'pointer', color: isFilled ? 'var(--sb-warning)' : 'var(--sb-border)' }}
                    aria-label={`${star} sao`}
                  >
                    <Star size={36} fill={isFilled ? 'currentColor' : 'none'} strokeWidth={1.5} />
                  </button>
                );
              })}
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--sb-warning)', marginTop: '8px' }}>
              {rating === 5 && 'Tuyệt vời, rất hài lòng!'}
              {rating === 4 && 'Hài lòng, dịch vụ tốt'}
              {rating === 3 && 'Bình thường, tạm ổn'}
              {rating === 2 && 'Chưa hài lòng, cần cải thiện'}
              {rating === 1 && 'Rất tệ, dịch vụ kém'}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Nội dung nhận xét <span className="required">*</span></label>
            <textarea
              className="form-control"
              rows={4}
              placeholder="Chia sẻ về chất lượng mặt sân, hệ thống chiếu sáng, thái độ phục vụ..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Ảnh chụp thực tế tại sân (Upload file ảnh)</label>
            <div style={{ border: '2px dashed var(--sb-border)', borderRadius: '10px', padding: '14px', backgroundColor: 'var(--sb-background)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--sb-text-secondary)' }}>
                  Chọn file ảnh để lưu vào <code>/uploads/</code> kèm mã định danh tránh trùng.
                </span>
                <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', margin: 0 }}>
                  <Upload size={14} /> Tải ảnh lên
                  <input type="file" accept="image/*" multiple onChange={handleFileUpload} style={{ display: 'none' }} />
                </label>
              </div>

              {images.length > 0 && (
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '12px' }}>
                  {images.map((imgPath, idx) => (
                    <div key={idx} style={{ position: 'relative', width: '110px', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--sb-border)', backgroundColor: '#fff' }}>
                      <img src={resolveAssetUrl(imgPath)} alt="Review" style={{ width: '100%', height: '75px', objectFit: 'cover' }} />
                      <div style={{ fontSize: '0.65rem', padding: '2px 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={imgPath}>
                        {imgPath}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(220,38,38,0.85)', color: '#fff', border: 'none', borderRadius: '4px', padding: '1px 5px', fontSize: '0.65rem', cursor: 'pointer' }}
                      >
                        X
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '44px', marginTop: '12px' }} disabled={submitting}>
            <Send size={16} /> {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateReviewPage;
