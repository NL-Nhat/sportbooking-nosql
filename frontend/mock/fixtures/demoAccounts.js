import { USER_IDS } from './ids.js';

export const DEMO_ACCOUNTS = [
  {
    roleKey: 'CUSTOMER',
    label: 'Khách hàng (Customer)',
    email: 'customer@sportbooking.demo',
    password: 'Demo@123',
    userId: USER_IDS.CUSTOMER_1,
    description: 'Tài khoản khách hàng đặt sân, xem lịch sử, thanh toán & đánh giá'
  },
  {
    roleKey: 'OWNER_APPROVED',
    label: 'Chủ sân đã duyệt (Owner Approved)',
    email: 'owner@sportbooking.demo',
    password: 'Demo@123',
    userId: USER_IDS.OWNER_APPROVED,
    description: 'Chủ cơ sở thể thao Tuyên Sơn & Sơn Trà, quản lý cơ sở, giá, lịch, duyệt đặt sân'
  },
  {
    roleKey: 'OWNER_PENDING',
    label: 'Chủ sân chờ duyệt (Owner Pending)',
    email: 'pending@sportbooking.demo',
    password: 'Demo@123',
    userId: USER_IDS.OWNER_PENDING,
    description: 'Tài khoản đã gửi hồ sơ đăng ký làm chủ sân, đang chờ Admin phê duyệt'
  },
  {
    roleKey: 'ADMIN',
    label: 'Quản trị viên (Admin)',
    email: 'admin@sportbooking.demo',
    password: 'Demo@123',
    userId: USER_IDS.ADMIN_1,
    description: 'Quản trị toàn hệ thống: duyệt hồ sơ, cơ sở, quản lý người dùng, khiếu nại & thống kê'
  }
];

