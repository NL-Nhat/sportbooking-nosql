import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { complaintMockService } from '../../../mock/services/complaintMockService.js';
import { facilityMockService } from '../../../mock/services/facilityMockService.js';
import { bookingMockService } from '../../../mock/services/bookingMockService.js';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useToast } from '../../contexts/ToastContext.jsx';
import { uploadMockFile, resolveAssetUrl } from '../../utils/fileUploadHelper.js';
import { ROUTES } from '../../constants/routes.js';
import { ArrowLeft, Send, Upload } from 'lucide-react';

export function CreateComplaintPage() {
  const [searchParams] = useSearchParams();
  const preBookingId = searchParams.get('bookingId') || '';
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [facilities, setFacilities] = useState([]);
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [facilityId, setFacilityId] = useState('');
  const [bookingId] = useState(preBookingId);
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    facilityMockService.getAll().then(setFacilities);
    if (preBookingId) {
      bookingMockService.getById(preBookingId).then((b) => {
        if (b) {
          setFacilityId(b.facilityId);
          setSubject(`Phản ánh liên quan đến đơn đặt sân ${b.bookingCode}`);
        }
      });
    }
  }, [preBookingId]);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    try {
      const uploaded = await Promise.all(files.map((f) => uploadMockFile(f)));
      setImages((prev) => [...prev, ...uploaded.map((u) => u.dbPath)]);
      showToast(`Đã tải lên ${uploaded.length} ảnh minh chứng.`, 'success');
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
    if (!subject.trim() || !content.trim()) {
      showToast('Vui lòng nhập tiêu đề và nội dung khiếu nại.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      await complaintMockService.create({
        userId: user._id,
        bookingId: bookingId || null,
        facilityId: facilityId || null,
        subject,
        content,
        images
      });
      showToast('Gửi khiếu nại thành công! Ban quản trị sẽ sớm phản hồi.', 'success');
      navigate(ROUTES.COMPLAINTS);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '640px' }}>
      <div style={{ marginBottom: '20px' }}>
        <Link to={ROUTES.COMPLAINTS} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--sb-text-secondary)', fontWeight: 600 }}>
          <ArrowLeft size={16} /> Quay lại danh sách khiếu nại
        </Link>
      </div>

      <div className="card" style={{ padding: '32px' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Tạo yêu cầu khiếu nại / phản ánh</h1>
        <p style={{ color: 'var(--sb-text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>
          Hãy mô tả rõ vấn đề bạn gặp phải để chúng tôi phối hợp cùng chủ sân xử lý thỏa đáng nhất.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Tiêu đề khiếu nại <span className="required">*</span></label>
            <input
              type="text"
              className="form-control"
              placeholder="Ví dụ: Vấn đề hoàn tiền, cơ sở vật chất bị hỏng..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Cơ sở thể thao liên quan (Tùy chọn)</label>
            <select
              className="form-control"
              value={facilityId}
              onChange={(e) => setFacilityId(e.target.value)}
            >
              <option value="">-- Khiếu nại dịch vụ hệ thống chung --</option>
              {facilities.map((f) => (
                <option key={f._id} value={f._id}>{f.name} ({f.address?.district})</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Nội dung chi tiết <span className="required">*</span></label>
            <textarea
              className="form-control"
              rows={5}
              placeholder="Trình bày thời gian diễn ra sự việc, diễn biến và đề xuất của bạn..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Ảnh minh chứng đính kèm (Upload file ảnh)</label>
            <div style={{ border: '2px dashed var(--sb-border)', borderRadius: '10px', padding: '14px', backgroundColor: 'var(--sb-background)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--sb-text-secondary)' }}>
                  File ảnh được lưu vào thư mục <code>/uploads/</code> kèm kí tự định danh tránh trùng.
                </span>
                <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', margin: 0 }}>
                  <Upload size={14} /> Chọn file ảnh
                  <input type="file" accept="image/*" multiple onChange={handleFileUpload} style={{ display: 'none' }} />
                </label>
              </div>

              {images.length > 0 && (
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '12px' }}>
                  {images.map((imgPath, idx) => (
                    <div key={idx} style={{ position: 'relative', width: '110px', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--sb-border)', backgroundColor: '#fff' }}>
                      <img src={resolveAssetUrl(imgPath)} alt="Proof" style={{ width: '100%', height: '75px', objectFit: 'cover' }} />
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
            <Send size={16} /> {submitting ? 'Đang gửi phản ánh...' : 'Gửi yêu cầu khiếu nại'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateComplaintPage;
