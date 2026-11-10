import React from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { StatusBadge } from '../../components/ui/StatusBadge.jsx';
import { User, Building2, Phone, Mail, MapPin, ShieldCheck } from 'lucide-react';

export function OwnerProfilePage() {
  const { user } = useAuth();

  return (
    <div style={{ maxWidth: '720px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.65rem', marginBottom: '6px' }}>Hồ sơ Chủ sân (Owner Profile)</h1>
        <p style={{ color: 'var(--sb-text-secondary)' }}>
          Thông tin pháp nhân và tài khoản đối tác hợp tác cùng SportBooking
        </p>
      </div>

      <div className="card" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', borderBottom: '1px solid var(--sb-border)', paddingBottom: '24px', marginBottom: '24px' }}>
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'}
            alt="Avatar"
            style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <h2 style={{ fontSize: '1.4rem', margin: 0 }}>{user?.fullName}</h2>
              <StatusBadge status={user?.ownerStatus} />
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--sb-text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={16} color="var(--sb-success)" /> Đối tác Chủ sân đã thẩm định chính thức
            </div>
          </div>
        </div>

        <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Thông tin liên hệ & Pháp lý</h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', fontSize: '0.9rem' }}>
          <div>
            <span style={{ color: 'var(--sb-text-muted)' }}>Email đăng nhập:</span>
            <div style={{ fontWeight: 600, marginTop: '2px' }}>{user?.email}</div>
          </div>

          <div>
            <span style={{ color: 'var(--sb-text-muted)' }}>Số điện thoại hotline:</span>
            <div style={{ fontWeight: 600, marginTop: '2px' }}>{user?.phone || '0988 776 655'}</div>
          </div>

          <div>
            <span style={{ color: 'var(--sb-text-muted)' }}>Trụ sở kinh doanh:</span>
            <div style={{ fontWeight: 600, marginTop: '2px' }}>
              {user?.address?.detail}, {user?.address?.ward}, Quận {user?.address?.district}, TP. Đà Nẵng
            </div>
          </div>

          <div>
            <span style={{ color: 'var(--sb-text-muted)' }}>Tình trạng hoạt động:</span>
            <div style={{ marginTop: '4px' }}>
              <StatusBadge status={user?.status} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OwnerProfilePage;
