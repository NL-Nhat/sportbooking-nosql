import { initialCourts } from './courts.js';

// Mẫu khung giờ cho thuê lặp lại hằng ngày (DAILY) cho mỗi sân theo Database_Design.md v2.0
export const initialOperatingHours = initialCourts.map((court, index) => {
  const idHex = String(index + 1).padStart(8, '0');
  
  // Tạo danh sách khung giờ từ 06:00 đến 22:00 (mỗi slot 60 phút)
  const timeSlots = [];
  for (let hour = 6; hour < 22; hour++) {
    const startHour = String(hour).padStart(2, '0');
    const endHour = String(hour + 1).padStart(2, '0');
    timeSlots.push({
      startTime: `${startHour}:00`,
      endTime: `${endHour}:00`
    });
  }

  return {
    _id: `6905000000000000${idHex}`,
    courtId: court._id,
    repeatMode: 'DAILY',
    effectiveFrom: '2026-01-01',
    effectiveTo: null,
    timeSlots,
    createdAt: '2026-01-10T00:00:00.000Z',
    updatedAt: '2026-01-10T00:00:00.000Z'
  };
});
