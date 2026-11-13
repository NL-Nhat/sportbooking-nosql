import { apiRequest, refreshAccessToken } from './apiClient.js';

export const authService = {
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
  },

  login: async ({ email, password }) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: email?.trim().toLowerCase(),
        password
      })
    });
  },

  refresh: async () => {
    return refreshAccessToken();
  },

  logout: async () => {
    return apiRequest('/auth/logout', {
      method: 'POST'
    });
  }
};
