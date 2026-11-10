import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { facilityMockService } from '../../../mock/services/facilityMockService.js';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useToast } from '../../contexts/ToastContext.jsx';
import { uploadMockFile, resolveAssetUrl } from '../../utils/fileUploadHelper.js';
import { ROUTES } from '../../constants/routes.js';
import { ArrowLeft, Save, Upload } from 'lucide-react';

export function OwnerFacilityFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [district, setDistrict] = useState('Hải Châu');
  const [ward, setWard] = useState('Hòa Cường Nam');
  const [detail, setDetail] = useState('');
  const [lat, setLat] = useState('16.0352');
  const [lng, setLng] = useState('108.2241');
  const [images, setImages] = useState([
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1000&q=80'
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (isEdit) {
      facilityMockService.getById(id).then((fac) => {
        if (fac) {
          setName(fac.name);
          setDescription(fac.description);
          setDistrict(fac.address?.district || 'Hải Châu');
          setWard(fac.address?.ward || '');
          setDetail(fac.address?.detail || '');
          setLat(String(fac.location?.coordinates?.[1] ?? '16.0352'));
          setLng(String(fac.location?.coordinates?.[0] ?? '108.2241'));
          if (Array.isArray(fac.images) && fac.images.length > 0) {
            setImages(fac.images.map((img) => (typeof img === 'object' ? img.url : img)));
          }
        }
        setLoading(false);
      });
    }
  }, [id, isEdit]);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      const uploaded = await Promise.all(files.map((f) => uploadMockFile(f)));
      const newPaths = uploaded.map((u) => u.dbPath);
      setImages((prev) => [...newPaths, ...prev.filter((p) => !p.includes('unsplash.com'))]);
      showToast(`Đã tải lên ${uploaded.length} ảnh (lưu tại: ${uploaded[0].dbPath})`, 'success');
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
    if (!name.trim() || !detail.trim()) {
      showToast('Vui lòng điền đầy đủ tên và địa chỉ cơ sở.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name,
        description,
        address: {
          province: 'Đà Nẵng',
          district,
          ward,
          detail
        },
        location: {
          type: 'Point',
          coordinates: [parseFloat(lng) || 108.2241, parseFloat(lat) || 16.0352]
        },
        images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1000&q=80'],
        amenities: ['Bãi giữ xe', 'Wifi miễn phí', 'Nước uống', 'Phòng thay đồ']
      };

      if (isEdit) {
        await facilityMockService.update(id, payload);
        showToast('Cập nhật cơ sở thành công!', 'success');
      } else {
        await facilityMockService.create({
          ...payload,
          ownerId: user._id
        });
        showToast('Tạo cơ sở mới thành công! Đang chờ Admin duyệt hiển thị.', 'success');
      }
      navigate(ROUTES.OWNER_FACILITIES);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '60px' }}>Đang nạp thông tin cơ sở...</div>;
  }

  return (
    <div style={{ maxWidth: '720px' }}>
      <div style={{ marginBottom: '20px' }}>
        <Link to={ROUTES.OWNER_FACILITIES} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--sb-text-secondary)', fontWeight: 600 }}>
          <ArrowLeft size={16} /> Quay lại danh sách cơ sở
        </Link>
      </div>

      <div className="card" style={{ padding: '32px' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>
          {isEdit ? 'Chỉnh sửa cơ sở thể thao' : 'Tạo mới cơ sở thể thao'}
        </h1>
        <p style={{ color: 'var(--sb-text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>
          Cung cấp thông tin chuẩn xác để khách hàng dễ dàng tìm kiếm và di chuyển đến sân.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Tên cơ sở thể thao <span className="required">*</span></label>
            <input
              type="text"
              className="form-control"
              placeholder="Ví dụ: Trung Tâm Thể Thao Tuyên Sơn"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Mô tả tổng quan</label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="Giới thiệu quy mô, trang thiết bị..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Quận / Huyện</label>
              <select
                className="form-control"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
              >
                <option value="Hải Châu">Hải Châu</option>
                <option value="Sơn Trà">Sơn Trà</option>
                <option value="Ngũ Hành Sơn">Ngũ Hành Sơn</option>
                <option value="Thanh Khê">Thanh Khê</option>
                <option value="Cẩm Lệ">Cẩm Lệ</option>
                <option value="Liên Chiểu">Liên Chiểu</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Phường / Xã</label>
              <input
                type="text"
                className="form-control"
                value={ward}
                onChange={(e) => setWard(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Địa chỉ chi tiết <span className="required">*</span></label>
            <input
              type="text"
              className="form-control"
              placeholder="Số nhà, tên đường..."
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Hình ảnh cơ sở thể thao (Upload file ảnh)</label>
            <div style={{
              border: '2px dashed var(--sb-border)',
              borderRadius: '10px',
              padding: '16px',
              backgroundColor: 'var(--sb-background)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
                <div style={{ fontSize: '0.825rem', color: 'var(--sb-text-secondary)' }}>
                  Tải ảnh cơ sở lên thư mục <code>/uploads/</code> (tự động gắn mã định danh duy nhất vào tên file).
                </div>
                <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', margin: 0 }}>
                  <Upload size={15} /> Chọn file ảnh tải lên
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>

              {images.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
                  {images.map((imgPath, idx) => (
                    <div key={idx} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--sb-border)', backgroundColor: '#FFFFFF' }}>
                      <img
                        src={resolveAssetUrl(imgPath)}
                        alt={`Facility ${idx}`}
                        style={{ width: '100%', height: '95px', objectFit: 'cover' }}
                      />
                      <div style={{ padding: '4px 6px', fontSize: '0.7rem', color: 'var(--sb-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={imgPath}>
                        {imgPath}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          background: 'rgba(220,38,38,0.85)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '2px 6px',
                          cursor: 'pointer',
                          fontSize: '0.7rem'
                        }}
                      >
                        Xóa
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '12px' }} disabled={submitting}>
            <Save size={16} /> {submitting ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi cơ sở' : 'Tạo cơ sở mới'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default OwnerFacilityFormPage;
