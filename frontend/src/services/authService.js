import { apiRequest } from './apiClient.js';

export const authService = {
  /**
   * Đăng ký tài khoản mới qua Backend thật: POST /api/v1/auth/register
   * @param {{ fullName: string, email: string, password: string, phone: string }} payload
   */
  register: async ({ fullName, email, password, phone }) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        fullName: fullName?.trim(),
        email: email?.trim().toLowerCase(),
        password,
        phone: phone?.trim()
      })
    });
  }
};

