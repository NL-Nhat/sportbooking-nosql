import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userMockService } from '../../../mock/services/userMockService.js';
import { formatDate } from '../../utils/formatters.js';
import { StatusBadge } from '../../components/ui/StatusBadge.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { useToast } from '../../contexts/ToastContext.jsx';
import { Search, ShieldAlert, ShieldCheck, UserX, UserCheck } from 'lucide-react';

export function AdminUsersPage() {
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [banModal, setBanModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadUsers = () => {
    setLoading(true);
    userMockService.getAll({ search, role: roleFilter, status: statusFilter }).then((data) => {
      setUsers(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadUsers();
  }, [search, roleFilter, statusFilter]);

  const handleToggleStatus = async (userObj) => {
    const newStatus = userObj.status === 'BANNED' ? 'ACTIVE' : 'BANNED';
    await userMockService.toggleStatus(userObj._id, newStatus);
    showToast(`Đã chuyển trạng thái tài khoản ${userObj.fullName} thành ${newStatus}!`, 'success');
    setBanModal(false);
    setSelectedUser(null);
    loadUsers();
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.65rem', marginBottom: '6px' }}>Quản lý người dùng</h1>
        <p style={{ color: 'var(--sb-text-secondary)' }}>
          Danh sách toàn bộ tài khoản khách hàng, đối tác chủ sân và quản trị viên
        </p>
      </div>

      {/* Filter bar */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
          <div style={{ flex: '1 1 220px', position: 'relative' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Tìm theo tên, email, SĐT..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingRight: '36px' }}
            />
            <Search size={16} style={{ position: 'absolute', right: '12px', top: '14px', color: 'var(--sb-text-muted)' }} />
          </div>

          <div style={{ flex: '0 0 180px' }}>
            <select
              className="form-control"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">Tất cả vai trò</option>
              <option value="CUSTOMER">Khách hàng (CUSTOMER)</option>
              <option value="OWNER">Chủ sân (OWNER)</option>
              <option value="ADMIN">Quản trị viên (ADMIN)</option>
            </select>
          </div>

          <div style={{ flex: '0 0 180px' }}>
            <select
              className="form-control"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="ACTIVE">ACTIVE (Đang hoạt động)</option>
              <option value="INACTIVE">INACTIVE (Chưa kích hoạt)</option>
              <option value="BANNED">BANNED (Bị khóa)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users table */}
      <div className="card" style={{ padding: '24px' }}>
        <div className="table-wrapper">
          <table className="sb-table">
            <thead>
              <tr>
                <th>Người dùng</th>
                <th>Email</th>
                <th>Số điện thoại</th>
                <th>Vai trò</th>
                <th>Trạng thái Owner</th>
                <th>Trạng thái TK</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img
                        src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80'}
                        alt={u.fullName}
                        style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div style={{ fontWeight: 700 }}>{u.fullName}</div>
                    </div>
                  </td>
                  <td>{u.email}</td>
                  <td>{u.phone || 'Chưa cập nhật'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {u.roles?.map((r, i) => (
                        <span key={i} className="badge badge-default" style={{ fontSize: '0.7rem' }}>{r}</span>
                      ))}
                    </div>
                  </td>
                  <td><StatusBadge status={u.ownerStatus} /></td>
                  <td><StatusBadge status={u.status} /></td>
                  <td>
                    <button
                      onClick={() => { setSelectedUser(u); setBanModal(true); }}
                      className={`btn btn-sm ${u.status === 'BANNED' ? 'btn-secondary' : 'btn-danger'}`}
                      style={{ fontSize: '0.75rem' }}
                    >
                      {u.status === 'BANNED' ? <UserCheck size={14} /> : <UserX size={14} />}
                      {u.status === 'BANNED' ? 'Mở khóa' : 'Khóa TK'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal xác nhận khóa / mở khóa */}
      <Modal
        isOpen={banModal}
        onClose={() => setBanModal(false)}
        title="Xác nhận thay đổi trạng thái tài khoản"
      >
        <p style={{ lineHeight: 1.6, marginBottom: '20px' }}>
          Bạn có chắc chắn muốn {selectedUser?.status === 'BANNED' ? 'MỞ KHÓA' : 'KHÓA'} tài khoản của người dùng{' '}
          <strong>{selectedUser?.fullName}</strong> ({selectedUser?.email})?
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button onClick={() => setBanModal(false)} className="btn btn-secondary">
            Hủy bỏ
          </button>
          <button
            onClick={() => handleToggleStatus(selectedUser)}
            className={`btn ${selectedUser?.status === 'BANNED' ? 'btn-primary' : 'btn-danger'}`}
          >
            Xác nhận thực hiện
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default AdminUsersPage;
