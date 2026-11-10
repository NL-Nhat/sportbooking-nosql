import { USER_IDS } from '../fixtures/ids.js';
import { initialBookings } from './bookings.js';

export const initialNotifications = [
  // Notifications for Customer 1
  {
    _id: "691000000000000000000001",
    userId: USER_IDS.CUSTOMER_1,
    title: "Đặt sân thành công!",
    message: "Đơn đặt sân BK2600004 tại Sân Bóng Đá Số 1 Tuyên Sơn ngày 04/11/2026 đã được xác nhận.",
    type: "BOOKING",
    referenceId: initialBookings[3]._id,
    isRead: false,
    createdAt: "2026-11-03T18:05:00.000Z"
  },
  {
    _id: "691000000000000000000002",
    userId: USER_IDS.CUSTOMER_1,
    title: "Thanh toán thành công",
    message: "Giao dịch thanh toán 330.000đ cho đơn đặt sân BK2600004 đã hoàn tất qua Cổng trực tuyến.",
    type: "PAYMENT",
    referenceId: initialBookings[3]._id,
    isRead: false,
    createdAt: "2026-11-03T18:06:00.000Z"
  },
  {
    _id: "691000000000000000000003",
    userId: USER_IDS.CUSTOMER_1,
    title: "Hoàn tiền đã được xử lý",
    message: "Khoản tiền cọc của đơn hủy trong vòng 24 giờ đã được hoàn về phương thức thanh toán ban đầu.",
    type: "REFUND",
    referenceId: "690e00000000000000000003",
    isRead: true,
    createdAt: "2026-11-02T10:00:00.000Z"
  },
  {
    _id: "691000000000000000000004",
    userId: USER_IDS.CUSTOMER_1,
    title: "Hoàn tiền đơn đặt sân",
    message: "Đơn đặt sân BK2600007 đã được hoàn 160.000đ do thời tiết bão.",
    type: "PAYMENT",
    referenceId: initialBookings[6]._id,
    isRead: true,
    createdAt: "2026-10-30T16:30:00.000Z"
  },
  {
    _id: "691000000000000000000005",
    userId: USER_IDS.CUSTOMER_1,
    title: "Chủ sân đã phản hồi đánh giá",
    message: "Chủ sân Tuyên Sơn đã phản hồi đánh giá 5 sao của bạn cho sân bóng đá số 1.",
    type: "SYSTEM",
    referenceId: "690b00000000000000000001",
    isRead: true,
    createdAt: "2026-10-26T09:00:00.000Z"
  },

  // Notifications for Owner Approved
  {
    _id: "691000000000000000000006",
    userId: USER_IDS.OWNER_APPROVED,
    title: "Đơn đặt sân mới đang chờ duyệt!",
    message: "Khách hàng Nguyễn Minh Anh vừa gửi yêu cầu đặt Sân Bóng Đá Số 2 (Sân 7) tối ngày 06/11/2026.",
    type: "BOOKING",
    referenceId: initialBookings[5]._id,
    isRead: false,
    createdAt: "2026-11-03T19:00:00.000Z"
  },
  {
    _id: "691000000000000000000007",
    userId: USER_IDS.OWNER_APPROVED,
    title: "Khách hàng gửi đánh giá mới",
    message: "Khách hàng Trần Hoàng Quân vừa đánh giá 4 sao cho Sân Bóng Chi Lăng.",
    type: "SYSTEM",
    referenceId: "690b00000000000000000005",
    isRead: false,
    createdAt: "2026-10-24T20:15:00.000Z"
  },
  {
    _id: "691000000000000000000008",
    userId: USER_IDS.OWNER_APPROVED,
    title: "Cơ sở đã được duyệt hoạt động",
    message: "Hồ sơ cơ sở Trung Tâm Thể Thao Tuyên Sơn đã được Admin phê duyệt chính thức.",
    type: "SYSTEM",
    referenceId: "690200000000000000000001",
    isRead: true,
    createdAt: "2026-01-12T16:00:00.000Z"
  },

  // Notifications for Admin
  {
    _id: "691000000000000000000009",
    userId: USER_IDS.ADMIN_1,
    title: "Hồ sơ đăng ký chủ sân mới",
    message: "Hoàng Minh Trí vừa nộp hồ sơ xin làm chủ cơ sở CLB Hòa Khánh đang chờ xét duyệt.",
    type: "SYSTEM",
    referenceId: "690300000000000000000003",
    isRead: false,
    createdAt: "2026-02-18T09:00:00.000Z"
  },
  {
    _id: "691000000000000000000010",
    userId: USER_IDS.ADMIN_1,
    title: "Khiếu nại khách hàng mới",
    message: "Khiếu nại về chất lượng thiết bị chiếu sáng tại cơ sở Chi Lăng cần được xử lý.",
    type: "SYSTEM",
    referenceId: "691100000000000000000001",
    isRead: false,
    createdAt: "2026-11-02T14:00:00.000Z"
  },

  // Customer 2 notifications
  {
    _id: "691000000000000000000011",
    userId: USER_IDS.CUSTOMER_2,
    title: "Đặt sân được xác nhận",
    message: "Đơn đặt sân BK2600010 của bạn đã được chủ sân xác nhận thành công.",
    type: "BOOKING",
    referenceId: initialBookings[9]._id,
    isRead: true,
    createdAt: "2026-11-02T11:00:00.000Z"
  },
  {
    _id: "691000000000000000000012",
    userId: USER_IDS.CUSTOMER_2,
    title: "Nhắc nhở lịch đá bóng",
    message: "Bạn có lịch tập bóng đá tại Sân Chi Lăng vào 19:00 ngày mai.",
    type: "SYSTEM",
    referenceId: initialBookings[9]._id,
    isRead: false,
    createdAt: "2026-11-03T10:00:00.000Z"
  },

  // Owner Pending notification
  {
    _id: "691000000000000000000013",
    userId: USER_IDS.OWNER_PENDING,
    title: "Hồ sơ của bạn đang được thẩm định",
    message: "Hồ sơ đăng ký chủ sân SportBooking của bạn đã được tiếp nhận và ban quản trị sẽ phản hồi trong vòng 24-48 giờ làm việc.",
    type: "SYSTEM",
    referenceId: "690300000000000000000003",
    isRead: false,
    createdAt: "2026-02-18T09:05:00.000Z"
  }
];

// Tạo thêm các notification hệ thống đa dạng để đạt hơn 25 records
for (let i = 14; i <= 28; i++) {
  const idHex = String(i).padStart(8, '0');
  initialNotifications.push({
    _id: `6910000000000000${idHex}`,
    userId: USER_IDS.CUSTOMER_1,
    title: `Bản tin thể thao SportBooking tuần ${i}`,
    message: `Cập nhật các giải đấu phong trào tại Đà Nẵng và ưu đãi đặt sân bóng đá, tennis cuối tuần.`,
    type: "SYSTEM",
    referenceId: null,
    isRead: true,
    createdAt: `2026-10-${(i % 25) + 1}T08:00:00.000Z`
  });
}

