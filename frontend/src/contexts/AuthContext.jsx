import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { userMockService } from '../../mock/services/userMockService.js';
import { DEMO_ACCOUNTS } from '../../mock/fixtures/demoAccounts.js';
import { USER_IDS } from '../../mock/fixtures/ids.js';
import { authService } from '../services/authService.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const initUser = useCallback(async () => {
    try {
      const savedId = localStorage.getItem('sb_active_user_id') || USER_IDS.CUSTOMER_1;
      const user = await userMockService.getById(savedId);
      setCurrentUser(user);
    } catch (e) {
      console.error('Failed to init auth user:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initUser();
  }, [initUser]);

  /**
   * Đăng ký tài khoản mới kết nối trực tiếp tới Backend thật: POST /api/v1/auth/register
   */
  const register = async ({ fullName, email, password, phone }) => {
    const response = await authService.register({ fullName, email, password, phone });
    return response;
  };

  const login = async (email, password) => {
    const user = await userMockService.login(email, password);
    setCurrentUser(user);
    localStorage.setItem('sb_active_user_id', user._id);
    return user;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('sb_active_user_id');
    localStorage.removeItem('sb_access_token');
  };

  const switchAccount = async (roleKey) => {
    const account = DEMO_ACCOUNTS.find((a) => a.roleKey === roleKey);
    if (account) {
      const user = await userMockService.getById(account.userId);
      setCurrentUser(user);
      localStorage.setItem('sb_active_user_id', user._id);
      return user;
    }
  };

  const refreshUser = async () => {
    if (currentUser) {
      const updated = await userMockService.getById(currentUser._id);
      setCurrentUser(updated);
    }
  };

  const value = {
    user: currentUser,
    currentUser,
    loading,
    register,
    login,
    logout,
    switchAccount,
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
