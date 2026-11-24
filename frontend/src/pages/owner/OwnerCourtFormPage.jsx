import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ownerCourtService } from '../../services/ownerCourtService.js';
import { ownerFacilityService } from '../../services/ownerFacilityService.js';
import { courtMockService } from '../../../mock/services/courtMockService.js';
import { useToast } from '../../contexts/ToastContext.jsx';
import { ROUTES } from '../../constants/routes.js';
import { uploadFileToServer, resolveAssetUrl } from '../../utils/fileUploadHelper.js';
import { ArrowLeft, Save, Plus, Trash2, Clock, Upload } from 'lucide-react';

const toMinutes = (t) => {
  if (!t || !t.includes(':')) return 0;
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

const toTime = (mins) =>
  `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;

export function OwnerCourtFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [facilities, setFacilities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [facilityId, setFacilityId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [surfaceType, setSurfaceType] = useState('Cỏ nhân tạo');
  const [indoor, setIndoor] = useState(false);
  const [capacity, setCapacity] = useState(10);
  const [status, setStatus] = useState('AVAILABLE');

  // Upload ảnh sân vật lý vào thư mục frontend/public/uploads/
  const [images, setImages] = useState([]);

  // Danh sách khung giờ cho thuê của 1 ngày (áp dụng lặp lại hằng ngày DAILY cho các ngày sau)
  const [timeSlots, setTimeSlots] = useState([
    { startTime: '06:00', endTime: '07:00' },
    { startTime: '07:00', endTime: '08:00' },
    { startTime: '17:00', endTime: '18:00' },
    { startTime: '18:00', endTime: '19:00' },
    { startTime: '19:00', endTime: '20:00' }
  ]);
  const [newStartTime, setNewStartTime] = useState('08:00');
  const [newEndTime, setNewEndTime] = useState('09:00');

  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      ownerFacilityService.getMyFacilities().catch(() => []),
      ownerCourtService.getActiveCategories().catch(() => [])
    ])
      .then(async ([facList, catList]) => {
        if (!isMounted) return;

        setFacilities(facList);
        setCategories(catList);

        if (facList.length > 0) {
          setFacilityId((prev) => prev || facList[0].id || facList[0]._id);
        }
        if (catList.length > 0) {
          setCategoryId((prev) => prev || catList[0].id || catList[0]._id);
        }

        if (isEdit) {
          const foundCourt = await ownerCourtService.getCourtById(id).catch(() => null);

          if (isMounted && foundCourt) {
            setFacilityId(foundCourt.facilityId || '');
            setCategoryId(foundCourt.categoryId || '');
            setName(foundCourt.name || '');
            setDescription(foundCourt.description || '');
            setSurfaceType(
              foundCourt.attributes?.surfaceType ||
                foundCourt.attributes?.surface ||
                'Tiêu chuẩn'
            );
            setIndoor(Boolean(foundCourt.attributes?.indoor));
            setCapacity(foundCourt.capacity || 4);
            setStatus(foundCourt.status || 'AVAILABLE');
            if (Array.isArray(foundCourt.images) && foundCourt.images.length > 0) {
              setImages(
                foundCourt.images.map((img) => (typeof img === 'object' ? img.url : img))
              );
            }
            const loadedSlots = foundCourt.timeSlots || [];
            if (Array.isArray(loadedSlots) && loadedSlots.length > 0) {
              setTimeSlots(
                [...loadedSlots].sort((a, b) => a.startTime.localeCompare(b.startTime))
              );
            }
          }
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id, isEdit]);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      const uploaded = await Promise.all(files.map((f) => uploadFileToServer(f)));
      const newPaths = uploaded.map((u) => u.dbPath);
      setImages((prev) => [...prev, ...newPaths]);
      showToast(
        `Đã tải lên ${uploaded.length} ảnh (lưu tại: frontend/public${uploaded[0].dbPath})`,
        'success'
      );
    } catch (err) {
      showToast(err.message, 'error');
    }
    e.target.value = '';
  };

  const handleRemoveImage = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAddTimeSlot = () => {
    if (!newStartTime || !newEndTime) {
      showToast('Vui lòng chọn giờ bắt đầu và giờ kết thúc.', 'warning');
      return;
    }
    if (toMinutes(newStartTime) >= toMinutes(newEndTime)) {
      showToast(
        'Giờ bắt đầu phải nhỏ hơn giờ kết thúc (ví dụ 12:00 - 13:00 hoặc 14:00 - 16:00).',
        'warning'
      );
      return;
    }
    const overlap = timeSlots.some(
      (s) =>
        toMinutes(newStartTime) < toMinutes(s.endTime) &&
        toMinutes(newEndTime) > toMinutes(s.startTime)
    );
    if (overlap) {
      showToast(
        `Khung giờ ${newStartTime} - ${newEndTime} bị trùng hoặc chồng lấn với khung giờ đã có.`,
        'warning'
      );
      return;
    }
    const updated = [...timeSlots, { startTime: newStartTime, endTime: newEndTime }].sort(
      (a, b) => a.startTime.localeCompare(b.startTime)
    );
    setTimeSlots(updated);
    const nextStart = newEndTime;
    const nextEnd = toTime(Math.min(toMinutes(nextStart) + 60, 23 * 60 + 59));
    setNewStartTime(nextStart);
    setNewEndTime(nextEnd);
  };

  const handleUpdateSlot = (idx, field, val) => {
    setTimeSlots((prev) => prev.map((s, i) => (i === idx ? { ...s, [field]: val } : s)));
  };

  const handleRemoveSlot = (idx) => {
    setTimeSlots((prev) => prev.filter((_, i) => i !== idx));
  };

  const validateTimeSlotsList = () => {
    if (timeSlots.length === 0) {
      return 'Vui lòng thêm ít nhất một khung giờ cho thuê trong ngày.';
    }
    const sorted = [...timeSlots].sort((a, b) => a.startTime.localeCompare(b.startTime));
    for (let i = 0; i < sorted.length; i++) {
      const s = sorted[i];
      if (!s.startTime || !s.endTime || toMinutes(s.startTime) >= toMinutes(s.endTime)) {
        return `Khung giờ ${s.startTime} - ${s.endTime} không hợp lệ (giờ bắt đầu phải nhỏ hơn giờ kết thúc).`;
      }
      if (i > 0 && toMinutes(sorted[i - 1].endTime) > toMinutes(s.startTime)) {
        return `Khung giờ ${sorted[i - 1].startTime}-${sorted[i - 1].endTime} bị chồng lấn với ${s.startTime}-${s.endTime}.`;
      }
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!facilityId) {
      showToast('Vui lòng chọn cơ sở thể thao trực thuộc.', 'warning');
      return;
    }
    if (!categoryId) {
      showToast('Vui lòng chọn danh mục môn thể thao.', 'warning');
      return;
    }
    if (!name.trim()) {
      showToast('Vui lòng nhập tên sân thi đấu.', 'warning');
      return;
    }

    const slotError = validateTimeSlotsList();
    if (slotError) {
      showToast(slotError, 'warning');
      return;
    }

    const selectedCat = categories.find((c) => (c.id || c._id) === categoryId);

    setSubmitting(true);
    try {
      const payload = {
        facilityId,
        categoryId,
        name: name.trim(),
        description: description.trim(),
        attributes: {
          surfaceType: surfaceType.trim() || 'Tiêu chuẩn',
          surface: surfaceType.trim() || 'Tiêu chuẩn',
          indoor,
          lighting: true,
          courtType: selectedCat?.code === 'FOOTBALL' ? '5 vs 5' : 'Tiêu chuẩn'
        },
        capacity: Number(capacity),
        status,
        images: images.map((url) => ({
          url,
          alt: name.trim()
        })),
        timeSlots
      };

      if (isEdit) {
        await courtMockService.update(id, payload);
        showToast('Cập nhật thông tin sân và khung giờ cho thuê thành công!', 'success');
      } else {
        await ownerCourtService.createCourt(payload);
        showToast('Tạo sân mới và lưu các khung giờ cho thuê hằng ngày thành công!', 'success');
      }
      navigate(ROUTES.OWNER_COURTS);
    } catch (err) {
      showToast(err?.message || 'Không thể lưu thông tin sân thể thao.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '60px' }}>Đang nạp thông tin sân...</div>;
  }

  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '20px' }}>
        <Link
          to={ROUTES.OWNER_COURTS}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.85rem',
            color: 'var(--sb-text-secondary)',
            fontWeight: 600
          }}
        >
          <ArrowLeft size={16} /> Quay lại danh sách sân
        </Link>
      </div>

      <div className="card" style={{ padding: '32px' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>
          {isEdit
            ? 'Chỉnh sửa thông tin sân & Khung giờ cho thuê'
            : 'Thêm sân mới & Cấu hình khung giờ cho thuê'}
        </h1>
        <p style={{ color: 'var(--sb-text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>
          Khai báo thông số sân, tải ảnh sân và thiết lập các khung giờ cho thuê trong 1 ngày (các ngày tiếp theo sẽ tự động lấy tương tự các khung giờ đã thêm).
        </p>

        {facilities.length === 0 ? (
          <div
            style={{
              padding: '24px',
              borderRadius: '10px',
              backgroundColor: 'var(--sb-warning-bg)',
              color: 'var(--sb-warning)',
              textAlign: 'center'
            }}
          >
            <p style={{ marginBottom: '12px', fontWeight: 600 }}>
              Bạn chưa có cơ sở thể thao nào. Vui lòng tạo cơ sở thể thao trước khi thêm sân con.
            </p>
            <Link to={ROUTES.OWNER_FACILITY_NEW} className="btn btn-primary btn-sm">
              Tạo cơ sở thể thao mới
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">
                Cơ sở trực thuộc <span className="required">*</span>
              </label>
              <select
                className="form-control"
                value={facilityId}
                onChange={(e) => setFacilityId(e.target.value)}
                required
              >
                {facilities.map((f) => {
                  const fId = f.id || f._id;
                  return (
                    <option key={fId} value={fId}>
                      {f.name} ({f.address?.district})
                    </option>
                  );
                })}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">
                  Môn thể thao <span className="required">*</span>
                </label>
                <select
                  className="form-control"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
                >
                  {categories.length > 0 ? (
                    categories.map((cat) => {
                      const catId = cat.id || cat._id;
                      return (
                        <option key={catId} value={catId}>
                          {cat.name}
                        </option>
                      );
                    })
                  ) : (
                    <>
                      <option value="FOOTBALL">Bóng đá</option>
                      <option value="BADMINTON">Cầu lông</option>
                      <option value="TENNIS">Tennis</option>
                      <option value="PICKLEBALL">Pickleball</option>
                    </>
                  )}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Trạng thái sân</label>
                <select
                  className="form-control"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="AVAILABLE">Sẵn sàng</option>
                  <option value="MAINTENANCE">Bảo trì</option>
                  <option value="INACTIVE">Tạm ngưng</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Tên sân thi đấu <span className="required">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Ví dụ: Sân Bóng Đá Số 1 (Sân 5 người)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Mô tả đặc điểm sân</label>
              <textarea
                className="form-control"
                rows={2}
                placeholder="Loại cỏ nhân tạo, độ dày thảm PVC, trần cao..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Loại mặt sân</label>
                <input
                  type="text"
                  className="form-control"
                  value={surfaceType}
                  onChange={(e) => setSurfaceType(e.target.value)}
                  placeholder="Cỏ nhân tạo, Thảm PVC..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Sức chứa tối đa (người)</label>
                <input
                  type="number"
                  className="form-control"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  min={2}
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <input
                type="checkbox"
                id="indoorCheck"
                checked={indoor}
                onChange={(e) => setIndoor(e.target.checked)}
              />
              <label htmlFor="indoorCheck" style={{ cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}>
                Sân trong nhà (Có mái che / Điều hòa)
              </label>
            </div>

            {/* PHẦN THÊM KHUNG GIỜ CHO THUÊ (ÁP DỤNG LẶP LẠI HẰNG NGÀY) */}
            <div style={{
              padding: '20px',
              backgroundColor: 'var(--sb-background)',
              borderRadius: '12px',
              border: '1px solid var(--sb-border)',
              marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                <h3 style={{ fontSize: '1.05rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={18} color="var(--sb-primary-600)" /> Khung giờ cho thuê trong ngày ({timeSlots.length} khung giờ)
                </h3>
                <span className="badge badge-info" style={{ fontSize: '0.75rem' }}>
                  Lặp lại tự động cho các ngày sau (DAILY)
                </span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--sb-text-secondary)', marginBottom: '16px' }}>
                Chỉ cần thêm các khung giờ của 1 ngày (ví dụ: <strong>12:00 - 13:00</strong>, <strong>14:00 - 16:00</strong>), những ngày sau hệ thống sẽ tự động lấy tương tự các khung giờ đã thêm.
              </p>

              {/* Ô thêm nhanh khung giờ mới */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'flex-end', marginBottom: '16px', padding: '12px', backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid var(--sb-border)' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Giờ bắt đầu</label>
                  <input
                    type="time"
                    className="form-control"
                    style={{ height: '38px', width: '135px' }}
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Giờ kết thúc</label>
                  <input
                    type="time"
                    className="form-control"
                    style={{ height: '38px', width: '135px' }}
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                  />
                </div>
                <button type="button" onClick={handleAddTimeSlot} className="btn btn-primary btn-sm" style={{ height: '38px' }}>
                  <Plus size={16} /> Thêm khung giờ
                </button>
              </div>

              {/* Danh sách các khung giờ đã thêm */}
              {timeSlots.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '16px', color: 'var(--sb-text-muted)', fontSize: '0.85rem' }}>
                  Chưa có khung giờ cho thuê nào. Hãy chọn giờ bắt đầu - kết thúc rồi nhấn "Thêm khung giờ".
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '10px' }}>
                  {timeSlots.map((slot, idx) => {
                    const dur = toMinutes(slot.endTime) - toMinutes(slot.startTime);
                    return (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '8px',
                          padding: '8px 12px',
                          backgroundColor: '#FFFFFF',
                          borderRadius: '8px',
                          border: '1px solid var(--sb-border)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <input
                            type="time"
                            className="form-control"
                            style={{ height: '32px', width: '92px', padding: '2px 6px', fontSize: '0.82rem' }}
                            value={slot.startTime}
                            onChange={(e) => handleUpdateSlot(idx, 'startTime', e.target.value)}
                          />
                          <span>-</span>
                          <input
                            type="time"
                            className="form-control"
                            style={{ height: '32px', width: '92px', padding: '2px 6px', fontSize: '0.82rem' }}
                            value={slot.endTime}
                            onChange={(e) => handleUpdateSlot(idx, 'endTime', e.target.value)}
                          />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '0.72rem', color: dur > 0 ? 'var(--sb-text-muted)' : 'var(--sb-danger)', whiteSpace: 'nowrap' }}>
                            {dur > 0 ? `${dur}p` : 'Lỗi'}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSlot(idx)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '4px 6px' }}
                            title="Xóa khung giờ"
                          >
                            <Trash2 size={14} color="var(--sb-danger)" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* PHẦN UPLOAD FILE ẢNH SÂN */}
            <div className="form-group">
              <label className="form-label">Hình ảnh của sân (Upload file ảnh)</label>
              <div style={{
                border: '2px dashed var(--sb-border)',
                borderRadius: '10px',
                padding: '16px',
                backgroundColor: 'var(--sb-background)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: images.length > 0 ? '12px' : 0 }}>
                  <div style={{ fontSize: '0.825rem', color: 'var(--sb-text-secondary)' }}>
                    File ảnh được lưu vật lý vào thư mục <code>frontend/public/uploads/</code> và lưu đường dẫn <code>/uploads/...</code> vào DB.
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
                          alt={`Court ${idx}`}
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
              <Save size={16} /> {submitting ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi sân & khung giờ' : 'Tạo sân mới'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default OwnerCourtFormPage;
