import { initialCourts } from './courts.js';
import { CATEGORY_IDS } from '../fixtures/ids.js';

export const initialPriceRules = [];

let ruleIdCounter = 1;

initialCourts.forEach((court) => {
  let baseNormal = 100000;
  let basePeak = 150000;

  if (court.categoryId === CATEGORY_IDS.FOOTBALL) {
    baseNormal = 250000;
    basePeak = 380000;
  } else if (court.categoryId === CATEGORY_IDS.BADMINTON) {
    baseNormal = 80000;
    basePeak = 120000;
  } else if (court.categoryId === CATEGORY_IDS.TENNIS) {
    baseNormal = 160000;
    basePeak = 240000;
  } else if (court.categoryId === CATEGORY_IDS.PICKLEBALL) {
    baseNormal = 110000;
    basePeak = 170000;
  }

  // Quy tắc 1: Giờ thường Ngày trong tuần (Thứ 2 đến Thứ 6, 06:00 - 17:00)
  const idHex1 = String(ruleIdCounter++).padStart(8, '0');
  initialPriceRules.push({
    _id: `6906000000000000${idHex1}`,
    courtId: court._id,
    name: "Giờ tiêu chuẩn ngày trong tuần",
    specificDates: [],
    daysOfWeek: [1, 2, 3, 4, 5],
    startTime: "06:00",
    endTime: "17:00",
    pricePerSlot: baseNormal,
    validFrom: "2026-01-01",
    validTo: "2026-12-31",
    priority: 1,
    status: "ACTIVE",
    createdAt: "2026-01-10T00:00:00.000Z",
    updatedAt: "2026-01-10T00:00:00.000Z"
  });

  // Quy tắc 2: Giờ cao điểm Ngày trong tuần (Thứ 2 đến Thứ 6, 17:00 - 22:00)
  const idHex2 = String(ruleIdCounter++).padStart(8, '0');
  initialPriceRules.push({
    _id: `6906000000000000${idHex2}`,
    courtId: court._id,
    name: "Giờ cao điểm tối trong tuần",
    specificDates: [],
    daysOfWeek: [1, 2, 3, 4, 5],
    startTime: "17:00",
    endTime: "22:00",
    pricePerSlot: basePeak,
    validFrom: "2026-01-01",
    validTo: "2026-12-31",
    priority: 2,
    status: "ACTIVE",
    createdAt: "2026-01-10T00:00:00.000Z",
    updatedAt: "2026-01-10T00:00:00.000Z"
  });

  // Quy tắc 3: Cuối tuần (Thứ 7 & Chủ Nhật, cả ngày)
  const idHex3 = String(ruleIdCounter++).padStart(8, '0');
  initialPriceRules.push({
    _id: `6906000000000000${idHex3}`,
    courtId: court._id,
    name: "Khung giờ cuối tuần (T7, CN)",
    specificDates: [],
    daysOfWeek: [6, 7],
    startTime: "06:00",
    endTime: "22:00",
    pricePerSlot: basePeak + 20000,
    validFrom: "2026-01-01",
    validTo: "2026-12-31",
    priority: 2,
    status: "ACTIVE",
    createdAt: "2026-01-10T00:00:00.000Z",
    updatedAt: "2026-01-10T00:00:00.000Z"
  });
});
