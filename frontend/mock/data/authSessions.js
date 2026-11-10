import { USER_IDS } from '../fixtures/ids.js';

export const initialAuthSessions = [
  {
    _id: '672a1b2c3d4e5f6071829001',
    userId: USER_IDS.CUSTOMER_1,
    sessionId: 'sess_cust1_chrome_win',
    familyId: 'fam_cust1_01',
    refreshTokenHash: 'hash_rf_cust1_01',
    previousTokenHash: null,
    deviceName: 'Chrome 120 (Windows 11)',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
    ipAddress: '113.161.42.10',
    expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    lastUsedAt: new Date().toISOString(),
    revokedAt: null,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: '672a1b2c3d4e5f6071829002',
    userId: USER_IDS.CUSTOMER_1,
    sessionId: 'sess_cust1_safari_iphone',
    familyId: 'fam_cust1_02',
    refreshTokenHash: 'hash_rf_cust1_02',
    previousTokenHash: null,
    deviceName: 'Safari 17 (iPhone 15)',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
    ipAddress: '14.162.18.55',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    lastUsedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    revokedAt: null,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: '672a1b2c3d4e5f6071829003',
    userId: USER_IDS.OWNER_APPROVED,
    sessionId: 'sess_owner1_mac_chrome',
    familyId: 'fam_owner1_01',
    refreshTokenHash: 'hash_rf_owner1_01',
    previousTokenHash: null,
    deviceName: 'Chrome 120 (macOS Sonoma)',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    ipAddress: '42.113.20.15',
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    lastUsedAt: new Date().toISOString(),
    revokedAt: null,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: '672a1b2c3d4e5f6071829004',
    userId: USER_IDS.ADMIN,
    sessionId: 'sess_admin_chrome_sec',
    familyId: 'fam_admin_01',
    refreshTokenHash: 'hash_rf_admin_01',
    previousTokenHash: null,
    deviceName: 'Chrome 120 (Secure Admin Workstation)',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    ipAddress: '127.0.0.1',
    expiresAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    lastUsedAt: new Date().toISOString(),
    revokedAt: null,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

