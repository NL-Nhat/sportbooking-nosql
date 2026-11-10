import { initialBookings } from './bookings.js';
import { initialCourts } from './courts.js';

export const initialReviews = [
  {
    _id: "690b00000000000000000001",
    bookingId: initialBookings[0]._id,
    customerId: initialBookings[0].customerId,
    facilityId: initialBookings[0].facilityId,
    courtId: initialBookings[0].courtId,
    rating: 5,
    content: "Sân bóng đá cỏ rất êm, đèn chiếu sáng ban đêm cực rõ không bị lóa. Nhân viên phục vụ nước uống và áo pitch rất chu đáo!",
    images: ["https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=600&q=80"],
    ownerReply: {
      content: "Cảm ơn anh Minh Anh và đội bóng đã ủng hộ Tuyên Sơn. Rất hân hạnh được phục vụ anh trong những trận đấu tiếp theo!",
      repliedAt: "2026-10-26T09:00:00.000Z"
    },
    status: "VISIBLE",
    createdAt: "2026-10-25T20:30:00.000Z",
    updatedAt: "2026-10-26T09:00:00.000Z"
  },
  {
    _id: "690b00000000000000000002",
    bookingId: initialBookings[1]._id,
    customerId: initialBookings[1].customerId,
    facilityId: initialBookings[1].facilityId,
    courtId: initialBookings[1].courtId,
    rating: 5,
    content: "Sân cầu lông VIP thảm chống trượt tuyệt vời, trần cao không bị vướng cầu. 10/10 điểm!",
    images: [],
    ownerReply: {
      content: "Tuyên Sơn cảm ơn bạn nhiều nhé! Chúc bạn luôn duy trì phong độ tập luyện thật tốt.",
      repliedAt: "2026-10-29T10:15:00.000Z"
    },
    status: "VISIBLE",
    createdAt: "2026-10-28T21:15:00.000Z",
    updatedAt: "2026-10-29T10:15:00.000Z"
  },
  {
    _id: "690b00000000000000000003",
    bookingId: initialBookings[2]._id,
    customerId: initialBookings[2].customerId,
    facilityId: initialBookings[2].facilityId,
    courtId: initialBookings[2].courtId,
    rating: 4,
    content: "Sân Sơn Trà thoáng mát, quạt gió mạnh. Giờ cao điểm bãi đỗ xe hơi chật một chút nhưng bảo vệ hỗ trợ rất nhiệt tình.",
    images: [],
    ownerReply: null,
    status: "VISIBLE",
    createdAt: "2026-11-01T19:30:00.000Z",
    updatedAt: "2026-11-01T19:30:00.000Z"
  },
  {
    _id: "690b00000000000000000004",
    bookingId: initialBookings[7]._id,
    customerId: initialBookings[7].customerId,
    facilityId: initialBookings[7].facilityId,
    courtId: initialBookings[7].courtId,
    rating: 5,
    content: "View sông Hàn đánh tennis buổi sáng gió mát rượi, mặt sân nảy rất chuẩn. Đặt lịch qua SportBooking siêu tiện lợi.",
    images: ["https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=600&q=80"],
    ownerReply: {
      content: "Dạ CLB Sông Hàn rất vui vì anh Quân hài lòng. Hẹn gặp anh ở các buổi tập tiếp theo ạ!",
      repliedAt: "2026-10-21T08:00:00.000Z"
    },
    status: "VISIBLE",
    createdAt: "2026-10-20T09:30:00.000Z",
    updatedAt: "2026-10-21T08:00:00.000Z"
  },
  {
    _id: "690b00000000000000000005",
    bookingId: initialBookings[8]._id,
    customerId: initialBookings[8].customerId,
    facilityId: initialBookings[8].facilityId,
    courtId: initialBookings[8].courtId,
    rating: 4,
    content: "Sân bóng Chi Lăng ở trung tâm dễ hẹn bạn bè, mặt cỏ tương đối ổn. Giá thuê hợp lý.",
    images: [],
    ownerReply: null,
    status: "VISIBLE",
    createdAt: "2026-10-24T20:10:00.000Z",
    updatedAt: "2026-10-24T20:10:00.000Z"
  },
  {
    _id: "690b00000000000000000006",
    bookingId: initialBookings[12]._id,
    customerId: initialBookings[12].customerId,
    facilityId: initialBookings[12].facilityId,
    courtId: initialBookings[12].courtId,
    rating: 5,
    content: "Sân cầu lông A1 đèn sáng rực, sàn êm không bị trượt khi nhảy đập cầu. Nhất định sẽ quay lại thường xuyên.",
    images: [],
    ownerReply: {
      content: "Cảm ơn chị Thảo! Chúc chị có những giờ phút thể thao vui vẻ.",
      repliedAt: "2026-10-19T08:30:00.000Z"
    },
    status: "VISIBLE",
    createdAt: "2026-10-18T21:00:00.000Z",
    updatedAt: "2026-10-19T08:30:00.000Z"
  },
  {
    _id: "690b00000000000000000007",
    bookingId: initialBookings[13]._id,
    customerId: initialBookings[13].customerId,
    facilityId: initialBookings[13].facilityId,
    courtId: initialBookings[13].courtId,
    rating: 5,
    content: "Lần đầu chơi thử pickleball trong nhà có máy lạnh thích mê! Vợt và bóng cho thuê còn mới tinh.",
    images: ["https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=600&q=80"],
    ownerReply: null,
    status: "VISIBLE",
    createdAt: "2026-10-22T22:00:00.000Z",
    updatedAt: "2026-10-22T22:00:00.000Z"
  },
  {
    _id: "690b00000000000000000008",
    bookingId: initialBookings[17]._id,
    customerId: initialBookings[17].customerId,
    facilityId: initialBookings[17].facilityId,
    courtId: initialBookings[17].courtId,
    rating: 4,
    content: "Sân bóng Thanh Khê F1 gần nhà, đặt qua app nhanh gọn không cần gọi điện thoại xác nhận rườm rà.",
    images: [],
    ownerReply: null,
    status: "VISIBLE",
    createdAt: "2026-10-15T20:30:00.000Z",
    updatedAt: "2026-10-15T20:30:00.000Z"
  },
  {
    _id: "690b00000000000000000009",
    bookingId: initialBookings[18]._id,
    customerId: initialBookings[18].customerId,
    facilityId: initialBookings[18].facilityId,
    courtId: initialBookings[18].courtId,
    rating: 3,
    content: "Sân đánh ổn nhưng nhà vệ sinh cần dọn dẹp thường xuyên hơn trong các khung giờ cao điểm buổi tối.",
    images: [],
    ownerReply: {
      content: "Thành thật xin lỗi anh Bảo về trải nghiệm này. Chúng tôi đã tăng cường nhân viên vệ sinh định kỳ mỗi 2 tiếng.",
      repliedAt: "2026-10-30T09:00:00.000Z"
    },
    status: "VISIBLE",
    createdAt: "2026-10-29T21:10:00.000Z",
    updatedAt: "2026-10-30T09:00:00.000Z"
  },
  {
    _id: "690b00000000000000000010",
    bookingId: initialBookings[22]._id,
    customerId: initialBookings[22].customerId,
    facilityId: initialBookings[22].facilityId,
    courtId: initialBookings[22].courtId,
    rating: 5,
    content: "Tuyên Sơn số 1 Đà Nẵng rồi, dịch vụ giải khát đầy đủ, đá bóng xong có nước mía và dừa tươi rất đã.",
    images: [],
    ownerReply: null,
    status: "VISIBLE",
    createdAt: "2026-10-10T19:30:00.000Z",
    updatedAt: "2026-10-10T19:30:00.000Z"
  },
  {
    _id: "690b00000000000000000011",
    bookingId: initialBookings[24]._id,
    customerId: initialBookings[24].customerId,
    facilityId: initialBookings[24].facilityId,
    courtId: initialBookings[24].courtId,
    rating: 5,
    content: "Sân tennis ven sông Hàn chất lượng tốt, ban quản lý hỗ trợ nhặt bóng và chuẩn bị nước tận tình.",
    images: [],
    ownerReply: null,
    status: "VISIBLE",
    createdAt: "2026-10-14T21:00:00.000Z",
    updatedAt: "2026-10-14T21:00:00.000Z"
  },
  {
    _id: "690b00000000000000000012",
    bookingId: initialBookings[25]._id,
    customerId: initialBookings[25].customerId,
    facilityId: initialBookings[25].facilityId,
    courtId: initialBookings[25].courtId,
    rating: 1,
    content: "Đánh giá spam có từ ngữ không phù hợp vi phạm tiêu chuẩn cộng đồng.",
    images: [],
    ownerReply: null,
    status: "HIDDEN", // Admin đã ẩn để kiểm duyệt
    createdAt: "2026-10-16T22:30:00.000Z",
    updatedAt: "2026-10-17T08:00:00.000Z"
  }
];

