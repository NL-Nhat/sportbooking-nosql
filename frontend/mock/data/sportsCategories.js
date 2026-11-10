import { CATEGORY_IDS } from '../fixtures/ids.js';

export const initialSportsCategories = [
  {
    _id: CATEGORY_IDS.FOOTBALL,
    name: "Bóng đá",
    code: "FOOTBALL",
    description: "Sân cỏ nhân tạo 5 người, 7 người tiêu chuẩn chất lượng cao, hệ thống chiếu sáng LED hiện đại.",
    icon: "Trophy",
    status: "ACTIVE",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z"
  },
  {
    _id: CATEGORY_IDS.BADMINTON,
    name: "Cầu lông",
    code: "BADMINTON",
    description: "Sân thảm PVC thi đấu chống trơn trượt, trần cao thông thoáng, ánh sáng chuẩn chống chói.",
    icon: "Activity",
    status: "ACTIVE",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z"
  },
  {
    _id: CATEGORY_IDS.TENNIS,
    name: "Tennis",
    code: "TENNIS",
    description: "Mặt sân cứng Plexipave chuẩn ITF, độ nảy bóng đều, có khán đài và dàn đèn chuyên nghiệp.",
    icon: "Target",
    status: "ACTIVE",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z"
  },
  {
    _id: CATEGORY_IDS.PICKLEBALL,
    name: "Pickleball",
    code: "PICKLEBALL",
    description: "Bộ môn thể thao đang sốt toàn cầu, sân đạt chuẩn USAPA, thích hợp cho mọi lứa tuổi giao lưu.",
    icon: "Zap",
    status: "ACTIVE",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z"
  }
];

