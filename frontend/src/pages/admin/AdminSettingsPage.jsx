import React, { useState } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { Settings, Save, Shield, Bell, HelpCircle } from 'lucide-react';

export default function AdminSettingsPage() {
  const { addToast } = useToast();
  const [config, setConfig] = useState({
    platformFeeRate: 5,
    holdDurationMinutes: 10,
    supportEmail: 'support@sportbooking.vn',
    supportHotline: '1900 6868',
    maintenanceMode: false,
    autoApproveFacility: false,
    allowGuestBrowsing: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    addToast('Đã lưu cấu hình hệ thống thành công!', 'success');
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 6px 0' }}>Cài đặt hệ thống</h1>
        <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: '14px' }}>
          Cấu hình tham số vận hành, phí sàn, thời gian giữ chỗ và thông tin hỗ trợ
        </p>
      </div>

      <div style={{ maxWidth: '800px' }}>
        <form onSubmit={handleSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 16px 0', borderBottom: '1px solid var(--color-border)', paddingBottom: '10px' }}>
              Quy tắc giao dịch & Giữ chỗ
            </h2>
            <div className="grid grid-2" style={{ gap: '16px' }}>
              <div>
                <label className="form-label">Phí hoa hồng nền tảng (%)</label>
                <input 
                  type="number" 
                  className="form-control"
                  value={config.platformFeeRate}
                  onChange={e => setConfig({ ...config, platformFeeRate: Number(e.target.value) })}
                  min="0"
                  max="100"
                />
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Áp dụng khấu trừ trên doanh thu của chủ sân</span>
              </div>

              <div>
                <label className="form-label">Thời gian giữ chỗ tạm thời (phút)</label>
                <input 
                  type="number" 
                  className="form-control"
                  value={config.holdDurationMinutes}
                  onChange={e => setConfig({ ...config, holdDurationMinutes: Number(e.target.value) })}
                  min="5"
                  max="60"
                />
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Thời gian slot HOLD trước khi tự động giải phóng</span>
              </div>
            </div>
          </div>

          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 16px 0', borderBottom: '1px solid var(--color-border)', paddingBottom: '10px' }}>
              Thông tin liên hệ & Hỗ trợ
            </h2>
            <div className="grid grid-2" style={{ gap: '16px' }}>
              <div>
                <label className="form-label">Email hỗ trợ khách hàng</label>
                <input 
                  type="email" 
                  className="form-control"
                  value={config.supportEmail}
                  onChange={e => setConfig({ ...config, supportEmail: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">Hotline chăm sóc khách hàng</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={config.supportHotline}
                  onChange={e => setConfig({ ...config, supportHotline: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 16px 0', borderBottom: '1px solid var(--color-border)', paddingBottom: '10px' }}>
              Bật / Tắt tính năng
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px' }}>
                <input 
                  type="checkbox" 
                  checked={config.autoApproveFacility}
                  onChange={e => setConfig({ ...config, autoApproveFacility: e.target.checked })}
                />
                <span>Tự động duyệt cơ sở mới đăng ký (không cần qua kiểm duyệt thủ công)</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px' }}>
                <input 
                  type="checkbox" 
                  checked={config.allowGuestBrowsing}
                  onChange={e => setConfig({ ...config, allowGuestBrowsing: e.target.checked })}
                />
                <span>Cho phép khách chưa đăng nhập xem danh sách sân và bảng giá</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px', color: config.maintenanceMode ? '#ef4444' : 'inherit' }}>
                <input 
                  type="checkbox" 
                  checked={config.maintenanceMode}
                  onChange={e => setConfig({ ...config, maintenanceMode: e.target.checked })}
                />
                <span style={{ fontWeight: config.maintenanceMode ? 600 : 400 }}>Bật chế độ bảo trì hệ thống (chỉ admin có thể truy cập)</span>
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
            <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px' }}>
              <Save size={16} />
              <span>Lưu cài đặt</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

