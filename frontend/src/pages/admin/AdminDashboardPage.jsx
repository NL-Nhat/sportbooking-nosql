import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { mockStorage } from '../../../mock/storage/mockStorage.js';
import { formatDate } from '../../utils/formatters.js';
import { StatusBadge } from '../../components/ui/StatusBadge.jsx';
import { ROUTES } from '../../constants/routes.js';
import { 
  Users, 
  ShieldCheck, 
  AlertTriangle, 
  MessageSquareWarning,
  Star,
  Layers,
  ArrowRight,
  Clock,
  UserCheck,
  UserX,
  FileText
} from 'lucide-react';

export function AdminDashboardPage() {
  const [users, setUsers] = useState([]);
  const [ownerApps, setOwnerApps] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    setUsers(mockStorage.getCollection('users') || []);
    setOwnerApps(mockStorage.getCollection('owner_applications') || []);
    setReviews(mockStorage.getCollection('reviews') || []);
    setComplaints(mockStorage.getCollection('complaints') || []);
    setCategories(mockStorage.getCollection('sports_categories') || []);
  }, []);

  const pendingApps = ownerApps.filter(a => a.status === 'PENDING');
  const openComplaints = complaints.filter(c => c.status === 'OPEN' || c.status === 'IN_PROGRESS' || c.status === 'PENDING');
  const hiddenReviews = reviews.filter(r => r.status === 'HIDDEN');
  
  const customerCount = users.filter(u => u.roles?.includes('CUSTOMER') && !u.roles?.includes('OWNER') && !u.roles?.includes('ADMIN')).length;
  const ownerCount = users.filter(u => u.roles?.includes('OWNER')).length;
  const bannedCount = users.filter(u => u.status === 'BANNED').length;

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '6px' }}>Bảng điều khiển Quản trị viên (Admin)</h1>
        <p style={{ color: 'var(--sb-text-secondary)' }}>
          Quản trị tài khoản, thẩm định hồ sơ đối tác Chủ sân, kiểm duyệt đánh giá và giải quyết khiếu nại (Theo tài liệu Hướng dẫn Backend v2.0)
        </p>
      </div>

      {/* 4 KPIs theo đúng phạm vi quyền Admin v2.0 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        {/* Metric 1: Tổng người dùng */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--sb-text-muted)', fontWeight: 600 }}>Tổng người dùng</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'var(--sb-primary-50)', color: 'var(--sb-primary-700)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--sb-primary-900)' }}>
            {users.length} tài khoản
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--sb-text-secondary)', marginTop: '4px' }}>
            {customerCount} Khách hàng • {ownerCount} Chủ sân
          </div>
        </div>

        {/* Metric 2: Hồ sơ Owner chờ duyệt */}
        <div className="card" style={{ padding: '20px', borderLeft: pendingApps.length > 0 ? '4px solid var(--sb-warning)' : '1px solid var(--sb-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--sb-text-muted)', fontWeight: 600 }}>Hồ sơ Chủ sân chờ duyệt</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'var(--sb-warning-bg)', color: 'var(--sb-warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--sb-primary-900)' }}>
            {pendingApps.length} hồ sơ
          </div>
          <div style={{ fontSize: '0.75rem', color: pendingApps.length > 0 ? 'var(--sb-warning)' : 'var(--sb-success)', marginTop: '4px' }}>
            {pendingApps.length > 0 ? 'Cần thẩm định pháp lý ngay' : 'Đã xử lý tất cả hồ sơ'}
          </div>
        </div>

        {/* Metric 3: Khiếu nại cần xử lý */}
        <div className="card" style={{ padding: '20px', borderLeft: openComplaints.length > 0 ? '4px solid var(--sb-danger)' : '1px solid var(--sb-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--sb-text-muted)', fontWeight: 600 }}>Khiếu nại đang chờ xử lý</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'var(--sb-danger-bg)', color: 'var(--sb-danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MessageSquareWarning size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--sb-primary-900)' }}>
            {openComplaints.length} phản ánh
          </div>
          <div style={{ fontSize: '0.75rem', color: openComplaints.length > 0 ? 'var(--sb-danger)' : 'var(--sb-success)', marginTop: '4px' }}>
            {openComplaints.length > 0 ? 'Chờ Admin phân công & phản hồi' : 'Không có khiếu nại tồn đọng'}
          </div>
        </div>

        {/* Metric 4: Đánh giá & Danh mục */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--sb-text-muted)', fontWeight: 600 }}>Kiểm duyệt đánh giá</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'var(--sb-info-bg)', color: 'var(--sb-info)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Star size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--sb-primary-900)' }}>
            {reviews.length} đánh giá
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--sb-text-secondary)', marginTop: '4px' }}>
            {hiddenReviews.length} đánh giá đã ẩn vi phạm
          </div>
        </div>
      </div>

      {/* 2 Hàng đợi xử lý chính */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '24px',
        marginBottom: '32px'
      }}>
        {/* Queue 1: Hồ sơ Chủ sân chờ duyệt */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} color="var(--sb-warning)" /> Hồ sơ Chủ sân chờ thẩm định ({pendingApps.length})
            </h3>
            <Link to={ROUTES.ADMIN_OWNER_APPLICATIONS} style={{ fontSize: '0.8rem', color: 'var(--sb-primary-700)', fontWeight: 600 }}>
              Xem tất cả
            </Link>
          </div>

          {pendingApps.length === 0 ? (
            <div style={{ fontSize: '0.85rem', color: 'var(--sb-text-muted)', padding: '20px 0', textAlign: 'center' }}>
              Không có hồ sơ nào đang chờ thẩm định.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {pendingApps.map((a) => (
                <div key={a._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', padding: '10px 12px', backgroundColor: 'var(--sb-background)', borderRadius: '8px' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{a.businessName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--sb-text-muted)' }}>
                      SĐT: {a.contactPhone} • Khu vực: {a.businessAddress?.district}
                    </div>
                  </div>
                  <Link to={`/admin/owner-applications/${a._id}`} className="btn btn-primary btn-sm">
                    Thẩm định hồ sơ
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Queue 2: Khiếu nại từ khách hàng & chủ sân */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquareWarning size={18} color="var(--sb-danger)" /> Khiếu nại cần xử lý ({openComplaints.length})
            </h3>
            <Link to={ROUTES.ADMIN_COMPLAINTS} style={{ fontSize: '0.8rem', color: 'var(--sb-primary-700)', fontWeight: 600 }}>
              Xem tất cả
            </Link>
          </div>

          {openComplaints.length === 0 ? (
            <div style={{ fontSize: '0.85rem', color: 'var(--sb-text-muted)', padding: '20px 0', textAlign: 'center' }}>
              Tất cả khiếu nại đã được giải quyết xong.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {openComplaints.slice(0, 4).map((c) => (
                <div key={c._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', padding: '10px 12px', backgroundColor: 'var(--sb-background)', borderRadius: '8px' }}>
                  <div style={{ maxWidth: '70%' }}>
                    <div style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {c.subject}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--sb-text-muted)' }}>
                      Trạng thái: <StatusBadge status={c.status} />
                    </div>
                  </div>
                  <Link to={`/admin/complaints/${c._id}`} className="btn btn-secondary btn-sm">
                    Xử lý
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Thông tin tài khoản & Bộ môn thể thao */}
      <div className="card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Tình trạng tài khoản hệ thống</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: 'var(--sb-background)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--sb-text-muted)' }}>Khách hàng (Customer)</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--sb-primary-700)', marginTop: '4px' }}>
              {customerCount}
            </div>
          </div>
          <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: 'var(--sb-background)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--sb-text-muted)' }}>Đối tác Chủ sân (Owner)</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--sb-primary-700)', marginTop: '4px' }}>
              {ownerCount}
            </div>
          </div>
          <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: 'var(--sb-background)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--sb-text-muted)' }}>Tài khoản bị khóa (BANNED)</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--sb-danger)', marginTop: '4px' }}>
              {bannedCount}
            </div>
          </div>
          <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: 'var(--sb-background)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--sb-text-muted)' }}>Môn thể thao hỗ trợ</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--sb-text-primary)', marginTop: '4px' }}>
              {categories.length} bộ môn
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardPage;
