import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ownerFacilityService } from '../../services/ownerFacilityService.js';
import { useToast } from '../../contexts/ToastContext.jsx';
import { uploadFileToServer, resolveAssetUrl } from '../../utils/fileUploadHelper.js';
import { ROUTES } from '../../constants/routes.js';
import { ArrowLeft, Save, Upload } from 'lucide-react';

const AVAILABLE_AMENITIES = [
  { code: 'PARKING', label: 'Bãi giữ xe' },
  { code: 'CHANGING_ROOM', label: 'Phòng thay đồ' },
  { code: 'WIFI', label: 'Wifi miễn phí' },
  { code: 'CANTEEN', label: 'Quầy nước / Căng tin' },
  { code: 'SHOWER', label: 'Phòng tắm nước nóng' },
  { code: 'LOCKER', label: 'Tủ đồ cá nhân' }
];

export function OwnerFacilityFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [province, setProvince] = useState('Đà Nẵng');
  const [district, setDistrict] = useState('Hải Châu');
  const [ward, setWard] = useState('Hòa Cường Nam');
  const [detail, setDetail] = useState('');
  const [lat, setLat] = useState('16.0352');
  const [lng, setLng] = useState('108.2241');
  const [amenities, setAmenities] = useState(['PARKING', 'CHANGING_ROOM', 'WIFI']);
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (isEdit) {
      ownerFacilityService
        .getFacilityById(id)
        .then((fac) => {
          if (fac) {
            setName(fac.name || '');
            setDescription(fac.description || '');
            setProvince(fac.address?.province || 'Đà Nẵng');
            setDistrict(fac.address?.district || 'Hải Châu');
            setWard(fac.address?.ward || '');
            setDetail(fac.address?.detail || '');
            setLat(String(fac.location?.coordinates?.[1] ?? '16.0352'));
            setLng(String(fac.location?.coordinates?.[0] ?? '108.2241'));
            if (Array.isArray(fac.amenities) && fac.amenities.length > 0) {
              setAmenities(fac.amenities);
            }
            if (Array.isArray(fac.images) && fac.images.length > 0) {
              setImages(fac.images.map((img) => (typeof img === 'object' ? img.url : img)));
            }
          }
        })
        .catch((err) => {
          showToast(err?.message || 'Không thể tải thông tin cơ sở.', 'error');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id, isEdit, showToast]);

  const handleToggleAmenity = (code) => {
    setAmenities((prev) =>
      prev.includes(code) ? prev.filter((item) => item !== code) : [...prev, code]
    );
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      const uploaded = await Promise.all(files.map((f) => uploadFileToServer(f)));
      const newPaths = uploaded.map((u) => u.dbPath);
      setImages((prev) => [...prev, ...newPaths]);
      showToast(`Đã tải lên ${uploaded.length} ảnh (lưu tại: frontend/public${uploaded[0].dbPath})`, 'success');
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
    if (!name.trim() || !ward.trim() || !detail.trim()) {
      showToast('Vui lòng điền đầy đủ tên cơ sở, phường/xã và địa chỉ chi tiết.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const parsedLng = parseFloat(lng);
      const parsedLat = parseFloat(lat);

      const payload = {
        name: name.trim(),
        description: description.trim(),
        address: {
          province: province.trim() || 'Đà Nẵng',
          district: district.trim(),
          ward: ward.trim(),
          detail: detail.trim()
        },
        location: {
          type: 'Point',
          coordinates: [
            Number.isFinite(parsedLng) ? parsedLng : 108.2241,
            Number.isFinite(parsedLat) ? parsedLat : 16.0352
          ]
        },
        images: images.map((url) => ({
          url,
          alt: name.trim()
        })),
        amenities
      };

      if (isEdit) {
        await ownerFacilityService.updateFacility(id, payload);
        showToast('Cập nhật thông tin cơ sở thể thao thành công!', 'success');
        navigate(`/owner/facilities/${id}`);
      } else {
        await ownerFacilityService.createFacility(payload);
        showToast('Tạo cơ sở thể thao mới thành công! Cơ sở đang chờ Admin xét duyệt trước khi hoạt động.', 'success');
        navigate(ROUTES.OWNER_FACILITIES);
      }
    } catch (err) {
      showToast(err?.message || 'Không thể lưu cơ sở thể thao.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '60px' }}>Đang nạp thông tin cơ sở...</div>;
  }

  return (
    <div style={{ maxWidth: '760px' }}>
      <div style={{ marginBottom: '20px' }}>
        <Link
          to={ROUTES.OWNER_FACILITIES}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.85rem',
            color: 'var(--sb-text-secondary)',
            fontWeight: 600
          }}
        >
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
            <label className="form-label">
              Tên cơ sở thể thao <span className="required">*</span>
            </label>
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">
                Tỉnh / Thành phố <span className="required">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Quận / Huyện <span className="required">*</span>
              </label>
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
                <option value="Hòa Vang">Hòa Vang</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Phường / Xã <span className="required">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Ví dụ: Hòa Xuân"
                value={ward}
                onChange={(e) => setWard(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              Địa chỉ chi tiết <span className="required">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="Số nhà, tên đường..."
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Kinh độ</label>
              <input
                type="number"
                step="any"
                className="form-control"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                placeholder="108.2241"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Vĩ độ</label>
              <input
                type="number"
                step="any"
                className="form-control"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                placeholder="16.0352"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Tiện ích tại cơ sở</label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
              gap: '10px',
              padding: '12px',
              backgroundColor: 'var(--sb-background)',
              borderRadius: '10px',
              border: '1px solid var(--sb-border)'
            }}>
              {AVAILABLE_AMENITIES.map((item) => (
                <label
                  key={item.code}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={amenities.includes(item.code)}
                    onChange={() => handleToggleAmenity(item.code)}
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Hình ảnh cơ sở thể thao (Upload file ảnh)</label>
            <div style={{
              border: '2px dashed var(--sb-border)',
              borderRadius: '10px',
              padding: '16px',
              backgroundColor: 'var(--sb-background)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                marginBottom: images.length > 0 ? '12px' : 0
              }}>
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
                    <div
                      key={idx}
                      style={{
                        position: 'relative',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        border: '1px solid var(--sb-border)',
                        backgroundColor: '#FFFFFF'
                      }}
                    >
                      <img
                        src={resolveAssetUrl(imgPath)}
                        alt={`Facility ${idx}`}
                        style={{ width: '100%', height: '95px', objectFit: 'cover' }}
                      />
                      <div
                        style={{
                          padding: '4px 6px',
                          fontSize: '0.7rem',
                          color: 'var(--sb-text-muted)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                        title={imgPath}
                      >
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

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '12px' }}
            disabled={submitting}
          >
            <Save size={16} /> {submitting ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi cơ sở' : 'Tạo cơ sở mới'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default OwnerFacilityFormPage;
