import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService.js';
import { isAccessTokenExpired, refreshAccessToken } from '../services/apiClient.js';

const AuthContext = createContext(null);

function normalizeUser(user) {
  if (!user) return null;
  const resolvedId = user.id || user._id;
  return {
    ...user,
    id: resolvedId,
    _id: resolvedId,
    roles: Array.isArray(user.roles) ? user.roles : ['CUSTOMER'],
    ownerStatus: user.ownerStatus || 'NOT_REGISTERED'
  };
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const initUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('sb_access_token');
      const savedUserRaw = localStorage.getItem('sb_user');

      if (!savedUserRaw) {
        setCurrentUser(null);
        return;
      }

      // Nếu accessToken đã hết hạn, tự động dùng refreshToken trong HttpOnly Cookie để cấp lại
      if (!token || isAccessTokenExpired(token)) {
        await refreshAccessToken();
      }

      const parsedUser = JSON.parse(savedUserRaw);
      setCurrentUser(normalizeUser(parsedUser));
    } catch {
      localStorage.removeItem('sb_access_token');
      localStorage.removeItem('sb_user');
      localStorage.removeItem('sb_active_user_id');
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initUser();

    const handleSessionExpired = () => {
      setCurrentUser(null);
    };
    window.addEventListener('sb:session-expired', handleSessionExpired);
    return () => window.removeEventListener('sb:session-expired', handleSessionExpired);
  }, [initUser]);

  const register = async ({ fullName, email, password, phone }) => {
    return authService.register({ fullName, email, password, phone });
  };

  const login = async (email, password) => {
    const response = await authService.login({ email, password });
    const data = response?.data;
    if (!data?.accessToken || !data?.user) {
      throw new Error('Phản hồi đăng nhập từ máy chủ không hợp lệ.');
    }

    const normalizedUser = normalizeUser(data.user);
    localStorage.setItem('sb_access_token', data.accessToken);
    localStorage.setItem('sb_user', JSON.stringify(normalizedUser));
    localStorage.setItem('sb_active_user_id', normalizedUser.id);
    setCurrentUser(normalizedUser);
    return normalizedUser;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('sb_access_token');
    localStorage.removeItem('sb_user');
    localStorage.removeItem('sb_active_user_id');
  };

  const refreshUser = async () => {
    return currentUser;
  };

  const value = {
    user: currentUser,
    currentUser,
    loading,
    register,
    login,
    logout,
    refreshUser,
    isAuthenticated: Boolean(currentUser),
    isAdmin: currentUser?.roles?.includes('ADMIN') || false,
    isOwner: currentUser?.roles?.includes('OWNER') || false,
    isOwnerPending: currentUser?.ownerStatus === 'PENDING',
    isCustomer: currentUser?.roles?.includes('CUSTOMER') || false
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
