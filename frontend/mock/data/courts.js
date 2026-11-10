import { CATEGORY_IDS, FACILITY_IDS } from '../fixtures/ids.js';
import { SPORT_IMAGES } from '../fixtures/images.js';

export const initialCourts = [
  // Sân cơ sở 1: Tuyên Sơn (Football & Badminton)
  {
    _id: "690400000000000000000001",
    facilityId: FACILITY_IDS.FAC_1,
    categoryId: CATEGORY_IDS.FOOTBALL,
    name: "Sân Bóng Đá Số 1 (Sân 5 người)",
    description: "Mặt cỏ nhân tạo Monofilament 50mm mới nâng cấp, chống trượt tốt ngay cả khi trời mưa.",
    attributes: { surfaceType: "Cỏ nhân tạo", indoor: false, lighting: true, courtType: "5 vs 5" },
    images: [SPORT_IMAGES.FOOTBALL[0]],
    capacity: 10,
    status: "AVAILABLE",
    createdAt: "2026-01-12T08:00:00.000Z",
    updatedAt: "2026-01-12T08:00:00.000Z"
  },
  {
    _id: "690400000000000000000002",
    facilityId: FACILITY_IDS.FAC_1,
    categoryId: CATEGORY_IDS.FOOTBALL,
    name: "Sân Bóng Đá Số 2 (Sân 7 người)",
    description: "Sân rộng rãi đạt chuẩn thi đấu giao hữu các giải phong trào công ty, ngân hàng.",
    attributes: { surfaceType: "Cỏ nhân tạo", indoor: false, lighting: true, courtType: "7 vs 7" },
    images: [SPORT_IMAGES.FOOTBALL[1]],
    capacity: 14,
    status: "AVAILABLE",
    createdAt: "2026-01-12T08:00:00.000Z",
    updatedAt: "2026-01-12T08:00:00.000Z"
  },
  {
    _id: "690400000000000000000003",
    facilityId: FACILITY_IDS.FAC_1,
    categoryId: CATEGORY_IDS.BADMINTON,
    name: "Sân Cầu Lông VIP 01",
    description: "Thảm PVC cao cấp độ dày 4.5mm chống sốc, hệ thống đèn gián tiếp không chói mắt.",
    attributes: { surfaceType: "Thảm PVC thi đấu", indoor: true, lighting: true, courtType: "Tiêu chuẩn" },
    images: [SPORT_IMAGES.BADMINTON[0]],
    capacity: 4,
    status: "AVAILABLE",
    createdAt: "2026-01-12T08:00:00.000Z",
    updatedAt: "2026-01-12T08:00:00.000Z"
  },
  {
    _id: "690400000000000000000004",
    facilityId: FACILITY_IDS.FAC_1,
    categoryId: CATEGORY_IDS.BADMINTON,
    name: "Sân Cầu Lông VIP 02",
    description: "Thảm chuẩn quốc tế, phù hợp cả đánh đơn và đánh đôi.",
    attributes: { surfaceType: "Thảm PVC thi đấu", indoor: true, lighting: true, courtType: "Tiêu chuẩn" },
    images: [SPORT_IMAGES.BADMINTON[1]],
    capacity: 4,
    status: "AVAILABLE",
    createdAt: "2026-01-12T08:00:00.000Z",
    updatedAt: "2026-01-12T08:00:00.000Z"
  },

  // Sân cơ sở 2: Chi Lăng (Football & Tennis)
  {
    _id: "690400000000000000000005",
    facilityId: FACILITY_IDS.FAC_2,
    categoryId: CATEGORY_IDS.FOOTBALL,
    name: "Sân Bóng Chi Lăng 5A",
    description: "Sân mini trung tâm thành phố, dàn đèn LED 400W siêu sáng ban đêm.",
    attributes: { surfaceType: "Cỏ nhân tạo", indoor: false, lighting: true, courtType: "5 vs 5" },
    images: [SPORT_IMAGES.FOOTBALL[2]],
    capacity: 10,
    status: "AVAILABLE",
    createdAt: "2026-01-14T09:00:00.000Z",
    updatedAt: "2026-01-14T09:00:00.000Z"
  },
  {
    _id: "690400000000000000000006",
    facilityId: FACILITY_IDS.FAC_2,
    categoryId: CATEGORY_IDS.FOOTBALL,
    name: "Sân Bóng Chi Lăng 5B",
    description: "Sân mini liền kề, lưới chắn bóng cao an toàn.",
    attributes: { surfaceType: "Cỏ nhân tạo", indoor: false, lighting: true, courtType: "5 vs 5" },
    images: [SPORT_IMAGES.FOOTBALL[0]],
    capacity: 10,
    status: "MAINTENANCE", // Bảo trì cỏ
    createdAt: "2026-01-14T09:00:00.000Z",
    updatedAt: "2026-02-20T10:00:00.000Z"
  },
  {
    _id: "690400000000000000000007",
    facilityId: FACILITY_IDS.FAC_2,
    categoryId: CATEGORY_IDS.TENNIS,
    name: "Sân Tennis Trung Tâm 01",
    description: "Sân cứng Plexipave cao cấp độ nảy trung bình nhanh.",
    attributes: { surfaceType: "Sân cứng Hard-court", indoor: false, lighting: true, courtType: "Đơn/Đôi" },
    images: [SPORT_IMAGES.TENNIS[0]],
    capacity: 4,
    status: "AVAILABLE",
    createdAt: "2026-01-14T09:00:00.000Z",
    updatedAt: "2026-01-14T09:00:00.000Z"
  },

  // Sân cơ sở 3: Sơn Trà (Badminton & Pickleball)
  {
    _id: "690400000000000000000008",
    facilityId: FACILITY_IDS.FAC_3,
    categoryId: CATEGORY_IDS.BADMINTON,
    name: "Sân Cầu Lông Sơn Trà A1",
    description: "Sân cầu lông thoáng mát, trần nhà cao 10m chuẩn thi đấu.",
    attributes: { surfaceType: "Thảm PVC", indoor: true, lighting: true, courtType: "Tiêu chuẩn" },
    images: [SPORT_IMAGES.BADMINTON[2]],
    capacity: 4,
    status: "AVAILABLE",
    createdAt: "2026-01-15T10:00:00.000Z",
    updatedAt: "2026-01-15T10:00:00.000Z"
  },
  {
    _id: "690400000000000000000009",
    facilityId: FACILITY_IDS.FAC_3,
    categoryId: CATEGORY_IDS.BADMINTON,
    name: "Sân Cầu Lông Sơn Trà A2",
    description: "Sân liền kề A1, có quạt thông gió làm mát liên tục.",
    attributes: { surfaceType: "Thảm PVC", indoor: true, lighting: true, courtType: "Tiêu chuẩn" },
    images: [SPORT_IMAGES.BADMINTON[0]],
    capacity: 4,
    status: "AVAILABLE",
    createdAt: "2026-01-15T10:00:00.000Z",
    updatedAt: "2026-01-15T10:00:00.000Z"
  },
  {
    _id: "690400000000000000000010",
    facilityId: FACILITY_IDS.FAC_3,
    categoryId: CATEGORY_IDS.PICKLEBALL,
    name: "Sân Pickleball Sơn Trà P1",
    description: "Sân Pickleball trong nhà có điều hòa, sơn chống lóa mắt thương hiệu DecoTurf.",
    attributes: { surfaceType: "Sơn chuyên dụng Acrylic", indoor: true, lighting: true, courtType: "USAPA Standard" },
    images: [SPORT_IMAGES.PICKLEBALL[0]],
    capacity: 4,
    status: "AVAILABLE",
    createdAt: "2026-01-15T10:00:00.000Z",
    updatedAt: "2026-01-15T10:00:00.000Z"
  },
  {
    _id: "690400000000000000000011",
    facilityId: FACILITY_IDS.FAC_3,
    categoryId: CATEGORY_IDS.PICKLEBALL,
    name: "Sân Pickleball Sơn Trà P2",
    description: "Sân đôi có lưới tự căng chuẩn chỉnh, khu vực nghỉ ngơi máy lạnh.",
    attributes: { surfaceType: "Sơn chuyên dụng Acrylic", indoor: true, lighting: true, courtType: "USAPA Standard" },
    images: [SPORT_IMAGES.PICKLEBALL[1]],
    capacity: 4,
    status: "AVAILABLE",
    createdAt: "2026-01-15T10:00:00.000Z",
    updatedAt: "2026-01-15T10:00:00.000Z"
  },

  // Sân cơ sở 4: Sông Hàn (Tennis & Pickleball)
  {
    _id: "690400000000000000000012",
    facilityId: FACILITY_IDS.FAC_4,
    categoryId: CATEGORY_IDS.TENNIS,
    name: "Sân Tennis Riverside T1",
    description: "Sân ngoài trời view sông Hàn tuyệt đẹp, hướng gió ổn định.",
    attributes: { surfaceType: "Hard-court Plexipave", indoor: false, lighting: true, courtType: "Tiêu chuẩn ITF" },
    images: [SPORT_IMAGES.TENNIS[1]],
    capacity: 4,
    status: "AVAILABLE",
    createdAt: "2026-01-16T11:00:00.000Z",
    updatedAt: "2026-01-16T11:00:00.000Z"
  },
  {
    _id: "690400000000000000000013",
    facilityId: FACILITY_IDS.FAC_4,
    categoryId: CATEGORY_IDS.TENNIS,
    name: "Sân Tennis Riverside T2",
    description: "Sân có khán đài mini 50 chỗ ngồi, dàn đèn cao áp 1000 Lux.",
    attributes: { surfaceType: "Hard-court Plexipave", indoor: false, lighting: true, courtType: "Tiêu chuẩn ITF" },
    images: [SPORT_IMAGES.TENNIS[2]],
    capacity: 4,
    status: "AVAILABLE",
    createdAt: "2026-01-16T11:00:00.000Z",
    updatedAt: "2026-01-16T11:00:00.000Z"
  },
  {
    _id: "690400000000000000000014",
    facilityId: FACILITY_IDS.FAC_4,
    categoryId: CATEGORY_IDS.PICKLEBALL,
    name: "Sân Pickleball Riverside Pro",
    description: "Sân pickleball ngoài trời sát biển thoáng đãng, mặt sân êm chân.",
    attributes: { surfaceType: "Cushion Acrylic", indoor: false, lighting: true, courtType: "USAPA Standard" },
    images: [SPORT_IMAGES.PICKLEBALL[0]],
    capacity: 4,
    status: "AVAILABLE",
    createdAt: "2026-01-16T11:00:00.000Z",
    updatedAt: "2026-01-16T11:00:00.000Z"
  },

  // Sân cơ sở 5: Hòa Xuân (Football & Tennis)
  {
    _id: "690400000000000000000015",
    facilityId: FACILITY_IDS.FAC_5,
    categoryId: CATEGORY_IDS.FOOTBALL,
    name: "Sân Bóng Hòa Xuân 7A",
    description: "Sân cỏ nhân tạo 7 người cỡ lớn, có thể chia thành 3 sân 5 người linh hoạt.",
    attributes: { surfaceType: "Cỏ nhân tạo kim cương", indoor: false, lighting: true, courtType: "7 vs 7" },
    images: [SPORT_IMAGES.FOOTBALL[2]],
    capacity: 14,
    status: "AVAILABLE",
    createdAt: "2026-01-20T08:30:00.000Z",
    updatedAt: "2026-01-20T08:30:00.000Z"
  },
  {
    _id: "690400000000000000000016",
    facilityId: FACILITY_IDS.FAC_5,
    categoryId: CATEGORY_IDS.TENNIS,
    name: "Sân Tennis Hòa Xuân K1",
    description: "Sân tennis yên tĩnh, không gian xanh mát tại khu đô thị sinh thái.",
    attributes: { surfaceType: "Hard-court", indoor: false, lighting: true, courtType: "Đơn/Đôi" },
    images: [SPORT_IMAGES.TENNIS[0]],
    capacity: 4,
    status: "AVAILABLE",
    createdAt: "2026-01-20T08:30:00.000Z",
    updatedAt: "2026-01-20T08:30:00.000Z"
  },

  // Sân cơ sở 6: Thanh Khê (Football & Badminton)
  {
    _id: "690400000000000000000017",
    facilityId: FACILITY_IDS.FAC_6,
    categoryId: CATEGORY_IDS.FOOTBALL,
    name: "Sân Bóng Đá Thanh Khê F1",
    description: "Sân 5 người trung tâm quận Thanh Khê, phục vụ nhiệt tình.",
    attributes: { surfaceType: "Cỏ nhân tạo", indoor: false, lighting: true, courtType: "5 vs 5" },
    images: [SPORT_IMAGES.FOOTBALL[0]],
    capacity: 10,
    status: "AVAILABLE",
    createdAt: "2026-01-25T14:00:00.000Z",
    updatedAt: "2026-01-25T14:00:00.000Z"
  },
  {
    _id: "690400000000000000000018",
    facilityId: FACILITY_IDS.FAC_6,
    categoryId: CATEGORY_IDS.BADMINTON,
    name: "Sân Cầu Lông Thanh Khê B1",
    description: "Sân cầu lông phong trào giá bình dân cho học sinh sinh viên.",
    attributes: { surfaceType: "Thảm PVC", indoor: true, lighting: true, courtType: "Tiêu chuẩn" },
    images: [SPORT_IMAGES.BADMINTON[1]],
    capacity: 4,
    status: "AVAILABLE",
    createdAt: "2026-01-25T14:00:00.000Z",
    updatedAt: "2026-01-25T14:00:00.000Z"
  },

  // Sân cơ sở 8: Mỹ Khê (Pickleball & Tennis)
  {
    _id: "690400000000000000000019",
    facilityId: FACILITY_IDS.FAC_8,
    categoryId: CATEGORY_IDS.PICKLEBALL,
    name: "Sân Pickleball Mỹ Khê Beach 01",
    description: "Sân pickleball ngoài trời ngay gần bãi tắm Mỹ Khê, dịch vụ đồ uống tận sân.",
    attributes: { surfaceType: "Acrylic thi đấu", indoor: false, lighting: true, courtType: "USAPA Standard" },
    images: [SPORT_IMAGES.PICKLEBALL[1]],
    capacity: 4,
    status: "AVAILABLE",
    createdAt: "2026-02-01T08:00:00.000Z",
    updatedAt: "2026-02-01T08:00:00.000Z"
  },
  {
    _id: "690400000000000000000020",
    facilityId: FACILITY_IDS.FAC_8,
    categoryId: CATEGORY_IDS.PICKLEBALL,
    name: "Sân Pickleball Mỹ Khê Beach 02",
    description: "Sân pickleball view biển, mặt sân êm ái bảo vệ khớp gối.",
    attributes: { surfaceType: "Acrylic thi đấu", indoor: false, lighting: true, courtType: "USAPA Standard" },
    images: [SPORT_IMAGES.PICKLEBALL[0]],
    capacity: 4,
    status: "AVAILABLE",
    createdAt: "2026-02-01T08:00:00.000Z",
    updatedAt: "2026-02-01T08:00:00.000Z"
  },
  {
    _id: "690400000000000000000021",
    facilityId: FACILITY_IDS.FAC_8,
    categoryId: CATEGORY_IDS.TENNIS,
    name: "Sân Tennis Mỹ Khê Grand",
    description: "Sân tennis tiêu chuẩn quốc tế có mái che vòm bạt cách nhiệt thoáng mát.",
    attributes: { surfaceType: "Hard-court có mái che", indoor: true, lighting: true, courtType: "ITF Pro" },
    images: [SPORT_IMAGES.TENNIS[1]],
    capacity: 4,
    status: "AVAILABLE",
    createdAt: "2026-02-01T08:00:00.000Z",
    updatedAt: "2026-02-01T08:00:00.000Z"
  }
];

