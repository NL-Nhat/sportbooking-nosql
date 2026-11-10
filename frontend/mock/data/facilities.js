import { FACILITY_IDS, USER_IDS } from '../fixtures/ids.js';
import { SPORT_IMAGES } from '../fixtures/images.js';

export const initialFacilities = [
  {
    _id: FACILITY_IDS.FAC_1,
    ownerId: USER_IDS.OWNER_APPROVED,
    name: "Trung Tâm Thể Thao Tuyên Sơn",
    description: "Khu phức hợp thể thao hàng đầu Đà Nẵng với hệ thống sân bóng đá cỏ nhân tạo và sân cầu lông trong nhà hiện đại bậc nhất.",
    address: {
      province: "Đà Nẵng",
      district: "Hải Châu",
      ward: "Hòa Cường Nam",
      detail: "Số 02 Đường 2 Tháng 9"
    },
    location: {
      type: "Point",
      coordinates: [108.2241, 16.0352]
    },
    images: [
      SPORT_IMAGES.FACILITY[0],
      SPORT_IMAGES.FOOTBALL[0],
      SPORT_IMAGES.BADMINTON[0]
    ],
    amenities: ["Bãi đỗ ô tô & xe máy", "Phòng tắm & thay đồ", "Căng tin giải khát", "Wifi miễn phí", "Đèn chiếu sáng ban đêm"],
    status: "APPROVED",
    createdAt: "2026-01-12T08:00:00.000Z",
    updatedAt: "2026-02-10T10:00:00.000Z"
  },
  {
    _id: FACILITY_IDS.FAC_2,
    ownerId: USER_IDS.OWNER_APPROVED,
    name: "Sân Vận Động Chi Lăng Club",
    description: "Cơ sở thể thao trung tâm thành phố, thuận tiện đi lại, chuyên sân bóng đá 5-7 người và sân tennis chất lượng quốc tế.",
    address: {
      province: "Đà Nẵng",
      district: "Hải Châu",
      ward: "Hải Châu 1",
      detail: "38 Chi Lăng"
    },
    location: {
      type: "Point",
      coordinates: [108.2167, 16.0683]
    },
    images: [
      SPORT_IMAGES.FACILITY[1],
      SPORT_IMAGES.FOOTBALL[1],
      SPORT_IMAGES.TENNIS[0]
    ],
    amenities: ["Bãi giữ xe", "Nước uống miễn phí", "Cho thuê vợt & bóng", "Phòng thay đồ"],
    status: "APPROVED",
    createdAt: "2026-01-14T09:00:00.000Z",
    updatedAt: "2026-02-12T14:30:00.000Z"
  },
  {
    _id: FACILITY_IDS.FAC_3,
    ownerId: USER_IDS.OWNER_APPROVED,
    name: "CLB Cầu Lông & Pickleball Sơn Trà",
    description: "Địa điểm lý tưởng cho các vận động viên phong trào, trang bị thảm tiêu chuẩn chống trơn trượt cùng hệ thống quạt thông gió công suất lớn.",
    address: {
      province: "Đà Nẵng",
      district: "Sơn Trà",
      ward: "An Hải Tây",
      detail: "120 Trần Hưng Đạo"
    },
    location: {
      type: "Point",
      coordinates: [108.2325, 16.0620]
    },
    images: [
      SPORT_IMAGES.FACILITY[2],
      SPORT_IMAGES.BADMINTON[1],
      SPORT_IMAGES.PICKLEBALL[0]
    ],
    amenities: ["Máy lạnh & quạt gió", "Tủ đồ cá nhân", "Căng tin nước uống", "Bán dụng cụ thể thao"],
    status: "APPROVED",
    createdAt: "2026-01-15T10:00:00.000Z",
    updatedAt: "2026-02-15T09:15:00.000Z"
  },
  {
    _id: FACILITY_IDS.FAC_4,
    ownerId: USER_IDS.OWNER_APPROVED_2,
    name: "Tennis & Pickleball Club Sông Hàn",
    description: "Tổ hợp sân Tennis và Pickleball chuẩn ven sông Hàn thơ mộng, không khí trong lành, mặt sân nảy chuẩn xác.",
    address: {
      province: "Đà Nẵng",
      district: "Ngũ Hành Sơn",
      ward: "Mỹ An",
      detail: "99 Võ Nguyên Giáp"
    },
    location: {
      type: "Point",
      coordinates: [108.2435, 16.0489]
    },
    images: [
      SPORT_IMAGES.TENNIS[1],
      SPORT_IMAGES.PICKLEBALL[1],
      SPORT_IMAGES.FACILITY[0]
    ],
    amenities: ["Bãi đỗ xe rộng rãi", "Khán đài có mái che", "Huấn luyện viên chuyên nghiệp", "Khu cà phê ngắm biển"],
    status: "APPROVED",
    createdAt: "2026-01-16T11:00:00.000Z",
    updatedAt: "2026-02-18T16:00:00.000Z"
  },
  {
    _id: FACILITY_IDS.FAC_5,
    ownerId: USER_IDS.OWNER_APPROVED_2,
    name: "Phức Hợp Thể Thao Hòa Xuân Arena",
    description: "Cơ sở hiện đại tại khu đô thị sinh thái Hòa Xuân với 4 sân bóng đá cỏ nhân tạo sợi kim cương và 2 sân tennis.",
    address: {
      province: "Đà Nẵng",
      district: "Cẩm Lệ",
      ward: "Hòa Xuân",
      detail: "Đường Văn Tiến Dũng"
    },
    location: {
      type: "Point",
      coordinates: [108.2140, 16.0125]
    },
    images: [
      SPORT_IMAGES.FOOTBALL[2],
      SPORT_IMAGES.TENNIS[2],
      SPORT_IMAGES.FACILITY[1]
    ],
    amenities: ["Bãi đỗ ô tô miễn phí", "Đèn chiếu sáng chuyên nghiệp", "Khu vực tắm nóng lạnh"],
    status: "APPROVED",
    createdAt: "2026-01-20T08:30:00.000Z",
    updatedAt: "2026-02-01T10:00:00.000Z"
  },
  {
    _id: FACILITY_IDS.FAC_6,
    ownerId: USER_IDS.OWNER_APPROVED,
    name: "Sân Thể Thao Thanh Khê Sport Zone",
    description: "Sân bóng đá và cầu lông phục vụ đông đảo thanh thiếu niên và sinh viên khu vực quận Thanh Khê.",
    address: {
      province: "Đà Nẵng",
      district: "Thanh Khê",
      ward: "Chính Gián",
      detail: "182 Hà Huy Tập"
    },
    location: {
      type: "Point",
      coordinates: [108.1920, 16.0595]
    },
    images: [
      SPORT_IMAGES.FOOTBALL[0],
      SPORT_IMAGES.BADMINTON[2]
    ],
    amenities: ["Bãi giữ xe", "Nước suối", "Tủ y tế sơ cứu"],
    status: "APPROVED",
    createdAt: "2026-01-25T14:00:00.000Z",
    updatedAt: "2026-01-25T14:00:00.000Z"
  },
  {
    _id: FACILITY_IDS.FAC_7,
    ownerId: USER_IDS.OWNER_PENDING,
    name: "Sân Cầu Lông & Pickleball Bách Khoa",
    description: "Cơ sở mới hoàn thiện đang đăng ký kiểm định và xin cấp phép hoạt động phục vụ khu vực Tây Bắc Đà Nẵng.",
    address: {
      province: "Đà Nẵng",
      district: "Liên Chiểu",
      ward: "Hòa Khánh Bắc",
      detail: "54 Nguyễn Lương Bằng"
    },
    location: {
      type: "Point",
      coordinates: [108.1520, 16.0750]
    },
    images: [
      SPORT_IMAGES.BADMINTON[0],
      SPORT_IMAGES.PICKLEBALL[0]
    ],
    amenities: ["Bãi giữ xe sinh viên", "Wifi", "Bình nước tự động"],
    status: "PENDING",
    createdAt: "2026-02-18T10:00:00.000Z",
    updatedAt: "2026-02-18T10:00:00.000Z"
  },
  {
    _id: FACILITY_IDS.FAC_8,
    ownerId: USER_IDS.OWNER_APPROVED_2,
    name: "Tổ Hợp Pickleball & Tennis Mỹ Khê",
    description: "Điểm hẹn pickleball sôi động sát biển Mỹ Khê, hệ thống sân mới 100% đạt chuẩn thi đấu liên đoàn.",
    address: {
      province: "Đà Nẵng",
      district: "Ngũ Hành Sơn",
      ward: "Khuê Mỹ",
      detail: "08 Hồ Xuân Hương"
    },
    location: {
      type: "Point",
      coordinates: [108.2460, 16.0420]
    },
    images: [
      SPORT_IMAGES.PICKLEBALL[1],
      SPORT_IMAGES.TENNIS[0]
    ],
    amenities: ["Bãi đỗ xe", "Ghế nghỉ điều hòa", "Khu cà phê giải khát", "Dụng cụ test miễn phí"],
    status: "APPROVED",
    createdAt: "2026-02-01T08:00:00.000Z",
    updatedAt: "2026-02-20T17:00:00.000Z"
  }
];

