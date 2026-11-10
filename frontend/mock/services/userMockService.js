import { MockRepository } from '../storage/mockRepository.js';
import { DEMO_ACCOUNTS } from '../fixtures/demoAccounts.js';

const userRepo = new MockRepository('users');
const appRepo = new MockRepository('owner_applications');

export const userMockService = {
  getDemoAccounts: () => DEMO_ACCOUNTS,

  login: async (email, password) => {
    // Tìm trong danh sách demo accounts trước
    const demo = DEMO_ACCOUNTS.find((a) => a.email.toLowerCase() === email.toLowerCase());
    if (demo) {
      if (password !== demo.password && password !== 'Demo@123' && password !== '123456') {
        throw new Error('Mật khẩu không chính xác.');
      }
      const user = userRepo.findById(demo.userId);
      if (!user) throw new Error('Không tìm thấy tài khoản người dùng.');
      if (user.status === 'BANNED') throw new Error('Tài khoản của bạn đã bị khóa do vi phạm chính sách.');
      if (user.status === 'INACTIVE') throw new Error('Tài khoản chưa được kích hoạt.');
      return user;
    }

    // Tìm trong users tổng
    const user = userRepo.findOne((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) throw new Error('Email không tồn tại trong hệ thống.');
    if (user.status === 'BANNED') throw new Error('Tài khoản của bạn đã bị khóa do vi phạm chính sách.');
    return user;
  },

  getById: async (id) => {
    return userRepo.findById(id);
  },

  getAll: async (filter = {}) => {
    let list = userRepo.getAll();
    if (filter.role) {
      list = list.filter((u) => u.roles.includes(filter.role));
    }
    if (filter.status) {
      list = list.filter((u) => u.status === filter.status);
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      list = list.filter((u) => u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.phone && u.phone.includes(q)));
    }
    return list;
  },

  updateProfile: async (id, data) => {
    return userRepo.update(id, data);
  },

  toggleStatus: async (id, newStatus) => {
    return userRepo.update(id, { status: newStatus });
  },

  // Owner Applications
  getOwnerApplications: async (filter = {}) => {
    let list = appRepo.getAll();
    if (filter.status) {
      list = list.filter((a) => a.status === filter.status);
    }
    // Gắn thông tin user
    return list.map((app) => ({
      ...app,
      user: userRepo.findById(app.userId)
    }));
  },

  getOwnerApplicationById: async (id) => {
    const app = appRepo.findById(id);
    if (!app) return null;
    return {
      ...app,
      user: userRepo.findById(app.userId)
    };
  },

  submitOwnerApplication: async (payload) => {
    const existing = appRepo.findOne((a) => a.userId === payload.userId && a.status === 'PENDING');
    if (existing) throw new Error('Bạn đã có đơn đăng ký chủ sân đang chờ xét duyệt.');

    const newApp = appRepo.create({
      userId: payload.userId,
      businessName: payload.businessName,
      businessAddress: payload.businessAddress,
      contactPhone: payload.contactPhone,
      documents: payload.documents || {},
      status: 'PENDING',
      reviewedBy: null,
      reviewedAt: null,
      rejectionReason: null
    });

    userRepo.update(payload.userId, { ownerStatus: 'PENDING' });
    return newApp;
  },

  reviewOwnerApplication: async (appId, adminId, approved, rejectionReason = '') => {
    const app = appRepo.findById(appId);
    if (!app) throw new Error('Không tìm thấy hồ sơ đăng ký.');

    const newStatus = approved ? 'APPROVED' : 'REJECTED';
    const updatedApp = appRepo.update(appId, {
      status: newStatus,
      reviewedBy: adminId,
      reviewedAt: new Date().toISOString(),
      rejectionReason: approved ? null : rejectionReason
    });

    const user = userRepo.findById(app.userId);
    if (user) {
      const newRoles = [...user.roles];
      if (approved && !newRoles.includes('OWNER')) {
        newRoles.push('OWNER');
      }
      userRepo.update(user._id, {
        ownerStatus: newStatus,
        roles: newRoles
      });
    }

    return updatedApp;
  }
};

