import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useToast } from '../../contexts/ToastContext.jsx';
import { userMockService } from '../../../mock/services/userMockService.js';
import { uploadMockFile, resolveAssetUrl } from '../../utils/fileUploadHelper.js';
import { Save, User, Lock, Upload } from 'lucide-react';

export function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [district, setDistrict] = useState(user?.address?.district || 'Hải Châu');
  const [ward, setWard] = useState(user?.address?.ward || '');
  const [detail, setDetail] = useState(user?.address?.detail || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');

  // Password section
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  const [saving, setSaving] = useState(false);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const uploaded = await uploadMockFile(file);
      setAvatar(uploaded.dbPath);
      showToast(`Đã tải ảnh đại diện: ${uploaded.fileName}`, 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
    e.target.value = '';
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await userMockService.updateProfile(user._id, {
        fullName,
        phone,
        avatar,
        address: {
          province: 'Đà Nẵng',
          district,
          ward,
          detail
        }
      });
      await refreshUser();
      showToast('Cập nhật hồ sơ thành công!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (!oldPass || !newPass) {
      showToast('Vui lòng điền mật khẩu hiện tại và mật khẩu mới.', 'warning');
      return;
    }
    if (newPass !== confirmPass) {
      showToast('Mật khẩu xác nhận không khớp.', 'danger');
      return;
    }
    showToast('Đổi mật khẩu demo thành công! (Mật khẩu demo luôn chấp nhận Demo@123)', 'success');
    setOldPass('');
    setNewPass('');
    setConfirmPass('');
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.65rem', marginBottom: '6px' }}>Hồ sơ cá nhân</h1>
        <p>Quản lý thông tin tài khoản và thông tin liên hệ của bạn</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px' }}>
        {/* Form thông tin cá nhân */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={18} color="var(--sb-primary-600)" /> Thông tin liên hệ
          </h3>

          <form onSubmit={handleUpdateProfile}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <img
                src={resolveAssetUrl(avatar, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80')}
                alt="Avatar"
                style={{ width: '68px', height: '68px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--sb-primary-200)' }}
              />
              <div style={{ flex: 1 }}>
                <label className="form-label" style={{ fontSize: '0.78rem', marginBottom: '6px' }}>Ảnh đại diện (Upload file)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', margin: 0 }}>
                    <Upload size={14} /> Chọn ảnh đại diện
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                  {avatar && (
                    <span style={{ fontSize: '0.72rem', color: 'var(--sb-text-muted)', wordBreak: 'break-all' }}>
                      {avatar}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Họ và tên</label>
              <input
                type="text"
                className="form-control"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email (Không thể thay đổi)</label>
              <input
                type="email"
                className="form-control"
                value={user?.email || ''}
                disabled
                style={{ backgroundColor: 'var(--sb-background)' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Số điện thoại</label>
              <input
                type="tel"
                className="form-control"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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
                  placeholder="Ví dụ: Hòa Cường Bắc"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Địa chỉ chi tiết</label>
              <input
                type="text"
                className="form-control"
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                placeholder="Số nhà, tên đường..."
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }} disabled={saving}>
              <Save size={16} /> {saving ? 'Đang lưu...' : 'Lưu thay đổi hồ sơ'}
            </button>
          </form>
        </div>

        {/* Đổi mật khẩu */}
        <div className="card" style={{ padding: '24px', height: 'fit-content' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lock size={18} color="var(--sb-primary-600)" /> Đổi mật khẩu
          </h3>

          <form onSubmit={handleChangePassword}>
            <div className="form-group">
              <label className="form-label">Mật khẩu hiện tại</label>
              <input
                type="password"
                className="form-control"
                value={oldPass}
                onChange={(e) => setOldPass(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Mật khẩu mới</label>
              <input
                type="password"
                className="form-control"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Xác nhận mật khẩu mới</label>
              <input
                type="password"
                className="form-control"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <button type="submit" className="btn btn-secondary" style={{ width: '100%', marginTop: '8px' }}>
              Cập nhật mật khẩu
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
