import { MockRepository } from '../storage/mockRepository.js';

const sessionRepo = new MockRepository('auth_sessions');

export const authSessionMockService = {
  getMySessions: async (userId) => {
    return sessionRepo.find((s) => s.userId === userId && !s.revokedAt);
  },

  revokeSession: async (sessionId) => {
    const session = sessionRepo.findOne((s) => s.sessionId === sessionId);
    if (!session) throw new Error('Không tìm thấy phiên đăng nhập.');
    return sessionRepo.update(session._id, {
      revokedAt: new Date().toISOString()
    });
  },

  revokeAllSessions: async (userId) => {
    const sessions = sessionRepo.find((s) => s.userId === userId && !s.revokedAt);
    const now = new Date().toISOString();
    sessions.forEach((s) => {
      sessionRepo.update(s._id, { revokedAt: now });
    });
    return true;
  }
};

