import { MockRepository } from '../storage/mockRepository.js';

const favRepo = new MockRepository('favorites');
const facRepo = new MockRepository('facilities');
const courtRepo = new MockRepository('courts');

export const favoriteMockService = {
  getByUser: async (userId) => {
    const list = favRepo.find((f) => f.userId === userId);
    return list.map((fav) => {
      let target = null;
      if (fav.targetType === 'FACILITY') {
        target = facRepo.findById(fav.targetId);
      } else if (fav.targetType === 'COURT') {
        target = courtRepo.findById(fav.targetId);
      }
      return {
        ...fav,
        target
      };
    });
  },

  isFavorited: async (userId, targetType, targetId) => {
    return Boolean(favRepo.findOne((f) => f.userId === userId && f.targetType === targetType && f.targetId === targetId));
  },

  toggleFavorite: async (userId, targetType, targetId) => {
    const existing = favRepo.findOne((f) => f.userId === userId && f.targetType === targetType && f.targetId === targetId);
    if (existing) {
      favRepo.delete(existing._id);
      return false; // Bỏ yêu thích
    } else {
      favRepo.create({
        userId,
        targetType,
        targetId
      });
      return true; // Đã yêu thích
    }
  }
};

