import { USER_IDS, FACILITY_IDS } from '../fixtures/ids.js';
import { initialBookings } from './bookings.js';

// Status theo Database_Design.md v2.0: OPEN, IN_PROGRESS, RESOLVED, REJECTED, CLOSED
export const initialComplaints = [
  {
    _id: "691100000000000000000001",
    userId: USER_IDS.CUSTOMER_1,
    bookingId: initialBookings[6]._id,
    facilityId: FACILITY_IDS.FAC_2,
    subject: "Hỗ trợ hủy đơn và xử lý hoàn tiền do mưa bão",
    content: "Tôi có lịch đặt sân tennis Chi Lăng vào ngày 30/10 nhưng do thời tiết mưa lớn bão ngập không thể chơi. Tôi đã gọi ban quản lý nhưng chưa thấy tiền về tài khoản ngân hàng.",
    images: ["https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?auto=format&fit=crop&w=600&q=80"],
    response: {
      respondedBy: USER_IDS.ADMIN_1,
      content: "Bộ phận CSKH đã kiểm tra và hoàn tất lệnh chuyển tiền hoàn trả 160.000đ vào tài khoản nguồn của anh. Xin chân thành cảm ơn anh đã phản hồi.",
      respondedAt: "2026-10-31T09:30:00.000Z"
    },
    status: "RESOLVED",
    createdAt: "2026-10-30T17:00:00.000Z",
    updatedAt: "2026-10-31T09:30:00.000Z"
  },
  {
    _id: "691100000000000000000002",
    userId: USER_IDS.CUSTOMER_2,
    bookingId: null,
    facilityId: FACILITY_IDS.FAC_6,
    subject: "Thắc mắc về thái độ phục vụ của nhân viên giữ xe",
    content: "Tối qua ngày 02/11 khi tôi đến sân Thanh Khê Sport Zone thì nhân viên giữ xe thu phí 10.000đ trong khi trên ứng dụng ghi tiện ích gửi xe miễn phí.",
    images: [],
    response: {
      respondedBy: USER_IDS.OWNER_APPROVED,
      content: "Chủ sân Thanh Khê đã tiếp nhận khiếu nại. Chúng tôi đã nhắc nhở nghiêm khắc nhân viên ca trực tối 02/11 và cam kết miễn phí 100% bãi đỗ xe cho khách đặt qua SportBooking.",
      respondedAt: "2026-11-03T10:00:00.000Z"
    },
    status: "IN_PROGRESS",
    createdAt: "2026-11-02T22:30:00.000Z",
    updatedAt: "2026-11-03T10:00:00.000Z"
  },
  {
    _id: "691100000000000000000003",
    userId: USER_IDS.CUSTOMER_3,
    bookingId: initialBookings[2]._id,
    facilityId: FACILITY_IDS.FAC_3,
    subject: "Hệ thống chiếu sáng sân cầu lông bị chập chờn 15 phút",
    content: "Trong hiệp thi đấu từ 17:30 đến 17:45 dàn đèn góc sân A1 bị nhấp nháy làm gián đoạn trận đấu giao lưu.",
    images: [],
    response: {
      respondedBy: USER_IDS.OWNER_APPROVED,
      content: "Thành thật xin lỗi quý khách, sự cố điện áp lưới khu vực đã được khắc phục kịp thời. Chúng tôi xin ghi nhận và nâng cấp nguồn dự phòng.",
      respondedAt: "2026-11-02T08:15:00.000Z"
    },
    status: "RESOLVED",
    createdAt: "2026-11-01T20:00:00.000Z",
    updatedAt: "2026-11-02T08:15:00.000Z"
  },
  {
    _id: "691100000000000000000004",
    userId: USER_IDS.CUSTOMER_4,
    bookingId: null,
    facilityId: FACILITY_IDS.FAC_1,
    subject: "Đề nghị kiểm tra sân cỏ nhân tạo có nhiều vật nhọn",
    content: "Khu vực mép biên sân số 1 có vài mẩu đinh vít sắt rơi vãi nguy hiểm cho vận động viên thi đấu.",
    images: ["https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80"],
    response: null,
    status: "OPEN",
    createdAt: "2026-11-03T16:00:00.000Z",
    updatedAt: "2026-11-03T16:00:00.000Z"
  },
  {
    _id: "691100000000000000000005",
    userId: USER_IDS.CUSTOMER_1,
    bookingId: null,
    facilityId: null,
    subject: "Góp ý cải tiến chức năng lọc theo giờ trên ứng dụng",
    content: "Hiện tại tìm sân rất tốt nhưng nếu có thêm bộ lọc theo sân có mái che hay ngoài trời thì sẽ tuyệt vời hơn nhiều.",
    images: [],
    response: {
      respondedBy: USER_IDS.ADMIN_1,
      content: "Cảm ơn đóng góp rất quý báu của anh Minh Anh, đội ngũ kỹ thuật SportBooking đã cập nhật tính năng lọc Sân trong nhà/Ngoài trời vào phiên bản mới!",
      respondedAt: "2026-11-02T11:00:00.000Z"
    },
    status: "CLOSED",
    createdAt: "2026-10-28T14:00:00.000Z",
    updatedAt: "2026-11-02T11:00:00.000Z"
  },
  {
    _id: "691100000000000000000006",
    userId: USER_IDS.USER_BANNED,
    bookingId: null,
    facilityId: FACILITY_IDS.FAC_2,
    subject: "Yêu cầu mở khóa tài khoản",
    content: "Tài khoản của tôi bị khóa không rõ nguyên nhân, yêu cầu admin giải quyết ngay.",
    images: [],
    response: {
      respondedBy: USER_IDS.ADMIN_1,
      content: "Tài khoản của bạn đã vi phạm điều khoản dịch vụ nhiều lần (đặt sân cố tình không đến và bình luận ngôn từ xúc phạm), quyết định khóa vĩnh viễn được giữ nguyên.",
      respondedAt: "2026-02-06T09:00:00.000Z"
    },
    status: "REJECTED",
    createdAt: "2026-02-05T15:00:00.000Z",
    updatedAt: "2026-02-06T09:00:00.000Z"
  }
];
