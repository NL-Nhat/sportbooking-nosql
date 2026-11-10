export const STATUS_MAP = {
  // Chung
  ACTIVE: { label: 'Đang hoạt động', variant: 'success' },
  INACTIVE: { label: 'Ngừng hoạt động', variant: 'danger' },
  BANNED: { label: 'Bị khóa tài khoản', variant: 'danger' },

  // Xét duyệt Owner / Facility
  NOT_REGISTERED: { label: 'Chưa đăng ký', variant: 'default' },
  PENDING: { label: 'Chờ duyệt', variant: 'warning' },
  APPROVED: { label: 'Đã duyệt', variant: 'success' },
  REJECTED: { label: 'Bị từ chối', variant: 'danger' },
  SUSPENDED: { label: 'Tạm đình chỉ', variant: 'warning' },

  // Sân
  AVAILABLE: { label: 'Sẵn sàng', variant: 'success' },
  MAINTENANCE: { label: 'Đang bảo trì', variant: 'warning' },

  // Slot
  HOLD: { label: 'Đang giữ chỗ (1h)', variant: 'warning' },
  BOOKED: { label: 'Đã chiếm chỗ', variant: 'info' },
  RELEASED: { label: 'Đã giải phóng', variant: 'default' },
  BLOCKED: { label: 'Tạm khóa', variant: 'danger' },

  // Booking theo Database_Design.md v2.0
  PENDING_PAYMENT: { label: 'Chờ thanh toán', variant: 'warning' },
  CONFIRMED: { label: 'Đã xác nhận', variant: 'success' },
  CANCELLED: { label: 'Đã hủy', variant: 'danger' },
  COMPLETED: { label: 'Hoàn thành', variant: 'info' },
  EXPIRED: { label: 'Hết hạn giữ chỗ', variant: 'danger' },
  NO_SHOW: { label: 'Không đến', variant: 'danger' },

  // Payment theo Database_Design.md v2.0
  UNPAID: { label: 'Chưa thanh toán', variant: 'warning' },
  DEPOSIT_PAID: { label: 'Đã cọc 20%', variant: 'info' },
  PAID: { label: 'Đã thanh toán đủ', variant: 'success' },
  REFUND_PENDING: { label: 'Đang chờ hoàn tiền', variant: 'warning' },
  PARTIALLY_REFUNDED: { label: 'Hoàn tiền một phần', variant: 'info' },
  REFUNDED: { label: 'Đã hoàn tiền', variant: 'info' },
  PAYMENT_FAILED: { label: 'Thanh toán thất bại', variant: 'danger' },
  FAILED: { label: 'Thất bại', variant: 'danger' },

  // Review
  VISIBLE: { label: 'Hiển thị', variant: 'success' },
  HIDDEN: { label: 'Đã ẩn', variant: 'warning' },
  PENDING_REVIEW: { label: 'Chờ kiểm duyệt', variant: 'warning' },

  // Complaint theo Database_Design.md v2.0
  OPEN: { label: 'Mới gửi', variant: 'warning' },
  IN_PROGRESS: { label: 'Đang xử lý', variant: 'warning' },
  PROCESSING: { label: 'Đang xử lý', variant: 'warning' },
  RESOLVED: { label: 'Đã giải quyết', variant: 'success' },
  CLOSED: { label: 'Đã đóng', variant: 'default' }
};
