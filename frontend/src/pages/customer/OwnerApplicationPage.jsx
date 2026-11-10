import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { userMockService } from '../../../mock/services/userMockService.js';
import { useToast } from '../../contexts/ToastContext.jsx';
import { uploadMockFile, resolveAssetUrl } from '../../utils/fileUploadHelper.js';
import { ROUTES } from '../../constants/routes.js';
import { 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  Upload
} from 'lucide-react';

export function OwnerApplicationPage() {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();

  const [existingApp, setExistingApp] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form inputs
  const [businessName, setBusinessName] = useState('');
  const [contactPhone, setContactPhone] = useState(user?.phone || '');
  const [district, setDistrict] = useState('Hải Châu');
  const [ward, setWard] = useState('');
  const [detail, setDetail] = useState('');

  // Giấy tờ pháp lý tải lên (lưu vào thư mục /uploads/ kèm mã định danh tránh trùng)
  const [licenseDoc, setLicenseDoc] = useState({
    fileUrl: '/uploads/1731080000001_a1b2c3_giay_phep_kinh_doanh.jpg',
    fileName: '1731080000001_a1b2c3_giay_phep_kinh_doanh.jpg',
    documentType: 'BUSINESS_LICENSE',
    uploadedAt: new Date().toISOString(),
    previewFallback: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80'
  });
  const [idCardDoc, setIdCardDoc] = useState({
    fileUrl: '/uploads/1731080000002_d4e5f6_cccd_mat_truoc.jpg',
    fileName: '1731080000002_d4e5f6_cccd_mat_truoc.jpg',
    documentType: 'ID_CARD_FRONT',
    uploadedAt: new Date().toISOString(),
    previewFallback: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80'
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      userMockService.getOwnerApplications().then((apps) => {
        const found = apps.find((a) => a.userId === user._id);
        setExistingApp(found);
        setLoading(false);
      });
    }
  }, [user]);

  const handleUploadDoc = async (e, docType) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const uploaded = await uploadMockFile(file);
      const docObj = {
        fileUrl: uploaded.dbPath,
        fileName: uploaded.fileName,
        documentType: docType,
        uploadedAt: new Date().toISOString()
      };
      if (docType === 'BUSINESS_LICENSE') {
        setLicenseDoc(docObj);
      } else {
        setIdCardDoc(docObj);
      }
      showToast(`Đã tải lên file: ${uploaded.fileName}`, 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
    e.target.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!businessName.trim() || !contactPhone.trim() || !detail.trim()) {
      showToast('Vui lòng điền đầy đủ các thông tin bắt buộc.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      // Lưu documents chuẩn Array<Object> theo Database_Design.md Section 4
      const documentsArray = [
        {
          fileUrl: licenseDoc.fileUrl,
          fileName: licenseDoc.fileName,
          documentType: 'BUSINESS_LICENSE',
          uploadedAt: licenseDoc.uploadedAt || new Date().toISOString()
        },
        {
          fileUrl: idCardDoc.fileUrl,
          fileName: idCardDoc.fileName,
          documentType: 'ID_CARD_FRONT',
          uploadedAt: idCardDoc.uploadedAt || new Date().toISOString()
        }
      ];

      const app = await userMockService.submitOwnerApplication({
        userId: user._id,
        businessName,
        businessAddress: {
          province: 'Đà Nẵng',
          district,
          ward,
          detail
        },
        contactPhone,
        documents: documentsArray
      });
      setExistingApp(app);
      await refreshUser();
      showToast('Đã gửi hồ sơ đăng ký Chủ sân! Đang chờ Admin phê duyệt.', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '60px' }}>Đang tra cứu hồ sơ...</div>;
  }

  // 1. Nếu đã APPROVED
  if (user?.ownerStatus === 'APPROVED' || existingApp?.status === 'APPROVED') {
    return (
      <div className="card" style={{ padding: '40px 32px', textAlign: 'center' }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: 'var(--sb-success-bg)',
          color: 'var(--sb-success)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px'
        }}>
          <CheckCircle2 size={36} />
        </div>
        <h2 style={{ marginBottom: '8px' }}>Chúc mừng! Bạn đã là Chủ sân chính thức</h2>
        <p style={{ color: 'var(--sb-text-secondary)', maxWidth: '500px', margin: '0 auto 24px' }}>
          Hồ sơ của bạn đã được Admin phê duyệt. Bạn có toàn quyền quản lý cơ sở, tạo sân, cấu hình giá và theo dõi doanh thu tại Cổng Chủ Sân.
        </p>
        <Link to={ROUTES.OWNER_DASHBOARD} className="btn btn-primary btn-lg">
          Vào Cổng Quản Lý Chủ Sân (Owner Portal) <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  // 2. Nếu đang PENDING
  if (existingApp?.status === 'PENDING' || user?.ownerStatus === 'PENDING') {
    return (
      <div className="card" style={{ padding: '40px 32px', textAlign: 'center' }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: 'var(--sb-warning-bg)',
          color: 'var(--sb-warning)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px'
        }}>
          <Clock size={36} />
        </div>
        <h2 style={{ marginBottom: '8px' }}>Hồ sơ Chủ sân của bạn đang chờ phê duyệt</h2>
        <p style={{ color: 'var(--sb-text-secondary)', maxWidth: '520px', margin: '0 auto 20px', lineHeight: 1.6 }}>
          Hồ sơ đăng ký kinh doanh <strong>{existingApp?.businessName}</strong> đang được ban quản trị SportBooking thẩm định giấy tờ.
        </p>
        <div style={{
          padding: '16px',
          backgroundColor: 'var(--sb-primary-50)',
          borderRadius: 'var(--sb-radius-md)',
          maxWidth: '500px',
          margin: '0 auto 24px',
          fontSize: '0.85rem',
          textAlign: 'left'
        }}>
          <div>Doanh nghiệp: <strong>{existingApp?.businessName}</strong></div>
          <div>SĐT liên hệ: <strong>{existingApp?.contactPhone}</strong></div>
          <div>Địa chỉ: <strong>{existingApp?.businessAddress?.detail}, {existingApp?.businessAddress?.district}</strong></div>
        </div>
        <div style={{ fontSize: '0.825rem', color: 'var(--sb-text-muted)' }}>
          💡 Mẹo demo: Chuyển sang tài khoản <strong>Admin</strong> bằng thanh Switcher bên dưới để duyệt hồ sơ này ngay lập tức!
        </div>
      </div>
    );
  }

  // 3. Nếu bị REJECTED
  const isRejected = existingApp?.status === 'REJECTED' || user?.ownerStatus === 'REJECTED';

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.65rem', marginBottom: '6px' }}>Đăng ký trở thành Chủ sân (Owner)</h1>
        <p>Hợp tác đưa cơ sở thể thao lên hệ thống SportBooking để kết nối hàng ngàn người chơi</p>
      </div>

      {isRejected && (
        <div style={{
          padding: '16px',
          backgroundColor: 'var(--sb-danger-bg)',
          color: 'var(--sb-danger)',
          borderRadius: 'var(--sb-radius-md)',
          marginBottom: '24px',
          fontSize: '0.9rem'
        }}>
          <div style={{ fontWeight: 700, marginBottom: '4px' }}>Hồ sơ trước đây bị từ chối:</div>
          <div>{existingApp?.rejectionReason || 'Vui lòng kiểm tra lại giấy phép kinh doanh và nộp lại hồ sơ.'}</div>
        </div>
      )}

      <div className="card" style={{ padding: '32px' }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Tên cơ sở / Hộ kinh doanh / Công ty <span className="required">*</span></label>
            <input
              type="text"
              className="form-control"
              placeholder="Ví dụ: Công ty TNHH Thể Thao Tuyên Sơn Đà Nẵng"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Số điện thoại liên hệ đại diện <span className="required">*</span></label>
            <input
              type="tel"
              className="form-control"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              required
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
                placeholder="Ví dụ: Hòa Cường Nam"
                value={ward}
                onChange={(e) => setWard(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Địa chỉ trụ sở / Cơ sở chính <span className="required">*</span></label>
            <input
              type="text"
              className="form-control"
              placeholder="Số nhà, tên đường..."
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              required
            />
          </div>

          {/* Upload giấy tờ pháp lý bằng file */}
          <div style={{
            borderTop: '1px solid var(--sb-border)',
            paddingTop: '20px',
            marginTop: '24px',
            marginBottom: '24px'
          }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '14px' }}>Giấy tờ thẩm định pháp lý (Upload file ảnh)</h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              <div style={{ padding: '14px', borderRadius: '10px', border: '1px solid var(--sb-border)', backgroundColor: 'var(--sb-background)' }}>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '8px' }}>1. Giấy phép đăng ký kinh doanh</div>
                <img
                  src={resolveAssetUrl(licenseDoc.fileUrl, licenseDoc.previewFallback)}
                  alt="Giấy phép kinh doanh"
                  style={{ width: '100%', height: '130px', objectFit: 'cover', borderRadius: '6px', marginBottom: '8px', border: '1px solid var(--sb-border)' }}
                />
                <div style={{ fontSize: '0.72rem', color: 'var(--sb-text-muted)', marginBottom: '8px', wordBreak: 'break-all' }}>
                  Lưu DB: <code>{licenseDoc.fileUrl}</code>
                </div>
                <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', width: '100%' }}>
                  <Upload size={14} /> Chọn file ảnh Giấy phép KD
                  <input type="file" accept="image/*" onChange={(e) => handleUploadDoc(e, 'BUSINESS_LICENSE')} style={{ display: 'none' }} />
                </label>
              </div>

              <div style={{ padding: '14px', borderRadius: '10px', border: '1px solid var(--sb-border)', backgroundColor: 'var(--sb-background)' }}>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '8px' }}>2. Mặt trước CCCD / CMND chủ sở hữu</div>
                <img
                  src={resolveAssetUrl(idCardDoc.fileUrl, idCardDoc.previewFallback)}
                  alt="CCCD Mặt trước"
                  style={{ width: '100%', height: '130px', objectFit: 'cover', borderRadius: '6px', marginBottom: '8px', border: '1px solid var(--sb-border)' }}
                />
                <div style={{ fontSize: '0.72rem', color: 'var(--sb-text-muted)', marginBottom: '8px', wordBreak: 'break-all' }}>
                  Lưu DB: <code>{idCardDoc.fileUrl}</code>
                </div>
                <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', width: '100%' }}>
                  <Upload size={14} /> Chọn file ảnh CCCD / CMND
                  <input type="file" accept="image/*" onChange={(e) => handleUploadDoc(e, 'ID_CARD_FRONT')} style={{ display: 'none' }} />
                </label>
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={submitting}>
            {submitting ? 'Đang gửi hồ sơ...' : 'Nộp hồ sơ đăng ký Chủ sân'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default OwnerApplicationPage;
