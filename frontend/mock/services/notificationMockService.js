import { MockRepository } from '../storage/mockRepository.js';

const notiRepo = new MockRepository('notifications');

export const notificationMockService = {
  getByUser: async (userId) => {
    return notiRepo.find((n) => n.userId === userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  getUnreadCount: async (userId) => {
    return notiRepo.find((n) => n.userId === userId && !n.isRead).length;
  },

  markAsRead: async (id) => {
    return notiRepo.update(id, { isRead: true });
  },

  markAllAsRead: async (userId) => {
    const list = notiRepo.find((n) => n.userId === userId && !n.isRead);
    list.forEach((n) => notiRepo.update(n._id, { isRead: true }));
    return true;
  }
};

