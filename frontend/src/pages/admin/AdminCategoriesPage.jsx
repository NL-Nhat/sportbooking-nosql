import React, { useState, useEffect } from 'react';
import { mockRepository } from '../../../mock/storage/mockRepository.js';
import { useToast } from '../../contexts/ToastContext';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import { Layers, Plus, Edit2, CheckCircle2, XCircle, Search } from 'lucide-react';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    iconUrl: '',
    isActive: true
  });
  const { addToast } = useToast();

  const loadData = () => {
    setLoading(true);
    const data = mockRepository.getAll('sportsCategories') || [];
    setCategories(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormData({
      code: '',
      name: '',
      description: '',
      iconUrl: '',
      isActive: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setFormData({
      code: cat.code || '',
      name: cat.name || '',
      description: cat.description || '',
      iconUrl: cat.iconUrl || '',
      isActive: cat.isActive !== false
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) {
      addToast('Vui lòng điền mã và tên môn thể thao', 'error');
      return;
    }

    if (editingCategory) {
      mockRepository.update('sportsCategories', editingCategory.id, {
        ...formData,
        code: formData.code.toUpperCase().trim()
      });
      addToast(`Đã cập nhật danh mục ${formData.name}`, 'success');
    } else {
      mockRepository.create('sportsCategories', {
        ...formData,
        code: formData.code.toUpperCase().trim()
      });
      addToast(`Đã thêm danh mục mới ${formData.name}`, 'success');
    }

    setIsModalOpen(false);
    loadData();
  };

  const handleToggleActive = (cat) => {
    const updated = !cat.isActive;
    mockRepository.update('sportsCategories', cat.id, { isActive: updated });
    addToast(`Đã ${updated ? 'kích hoạt' : 'ẩn'} danh mục ${cat.name}`, 'success');
    loadData();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 6px 0' }}>Danh mục môn thể thao</h1>
          <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: '14px' }}>
            Quản lý các môn thể thao được hỗ trợ đặt sân trên nền tảng
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={18} />
          <span>Thêm danh mục mới</span>
        </button>
      </div>

      <div className="grid grid-2" style={{ gap: '20px' }}>
        {categories.map(cat => (
          <div key={cat.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ 
                    width: '48px', 
                    height: '48px', 
                    borderRadius: '10px', 
                    backgroundColor: 'rgba(33, 107, 89, 0.1)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: '24px'
                  }}>
                    {cat.iconUrl ? <img src={cat.iconUrl} alt={cat.name} style={{ width: '32px', height: '32px', objectFit: 'contain' }} /> : '⚽'}
                  </div>
                  <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 600 }}>{cat.name}</h3>
                    <span className="badge badge-info">{cat.code}</span>
                  </div>
                </div>

                <span className={`badge ${cat.isActive ? 'badge-success' : 'badge-danger'}`}>
                  {cat.isActive ? 'Đang hoạt động' : 'Tạm ẩn'}
                </span>
              </div>

              <p style={{ margin: 0, fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                {cat.description || 'Chưa có mô tả cho môn thể thao này.'}
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px', paddingTop: '12px', borderTop: '1px solid var(--color-border)' }}>
              <button 
                className={`btn btn-sm ${cat.isActive ? 'btn-outline' : 'btn-success'}`}
                onClick={() => handleToggleActive(cat)}
              >
                {cat.isActive ? 'Tạm ẩn' : 'Kích hoạt'}
              </button>
              <button 
                className="btn btn-sm btn-primary"
                onClick={() => handleOpenEdit(cat)}
              >
                <Edit2 size={14} />
                <span>Chỉnh sửa</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Category Modal */}
      {isModalOpen && (
        <Modal 
          isOpen={true} 
          onClose={() => setIsModalOpen(false)}
          title={editingCategory ? 'Chỉnh sửa môn thể thao' : 'Thêm môn thể thao mới'}
        >
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label className="form-label">Mã code *</label>
                <input 
                  type="text" 
                  className="form-control"
                  placeholder="VD: BASKETBALL"
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value })}
                  disabled={!!editingCategory}
                  required
                />
              </div>
              <div>
                <label className="form-label">Tên môn thể thao *</label>
                <input 
                  type="text" 
                  className="form-control"
                  placeholder="VD: Bóng rổ"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label className="form-label">Icon URL (SVG / PNG)</label>
              <input 
                type="text" 
                className="form-control"
                placeholder="https://example.com/icon.svg"
                value={formData.iconUrl}
                onChange={e => setFormData({ ...formData, iconUrl: e.target.value })}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label className="form-label">Mô tả tóm tắt</label>
              <textarea 
                className="form-control"
                rows={3}
                placeholder="Mô tả về đặc thù môn thể thao, kích thước sân..."
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
              <input 
                type="checkbox" 
                id="isActiveCheck"
                checked={formData.isActive}
                onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
              />
              <label htmlFor="isActiveCheck" style={{ margin: 0, fontSize: '14px', cursor: 'pointer' }}>
                Kích hoạt hiển thị cho người dùng đặt sân
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>
                Hủy
              </button>
              <button type="submit" className="btn btn-primary">
                {editingCategory ? 'Lưu thay đổi' : 'Tạo mới'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

