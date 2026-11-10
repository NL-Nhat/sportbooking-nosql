import { initialCourts } from './courts.js';
import { USER_IDS } from '../fixtures/ids.js';

export const initialBlockedSlots = [
  {
    _id: "690700000000000000000001",
    courtId: initialCourts[0]._id, // Sân bóng 1 Tuyên Sơn
    startAt: "2026-11-04T07:00:00.000Z",
    endAt: "2026-11-04T10:00:00.000Z",
    reason: "Bảo dưỡng hệ thống thoát nước sân cỏ",
    createdBy: USER_IDS.OWNER_APPROVED,
    createdAt: "2026-11-01T08:00:00.000Z"
  },
  {
    _id: "690700000000000000000002",
    courtId: initialCourts[2]._id, // Sân Cầu Lông VIP 01
    startAt: "2026-11-05T12:00:00.000Z",
    endAt: "2026-11-05T14:00:00.000Z",
    reason: "Thay bóng đèn LED chiếu sáng trần",
    createdBy: USER_IDS.OWNER_APPROVED,
    createdAt: "2026-11-02T09:00:00.000Z"
  },
  {
    _id: "690700000000000000000003",
    courtId: initialCourts[5]._id, // Sân Bóng Chi Lăng 5B
    startAt: "2026-11-01T06:00:00.000Z",
    endAt: "2026-11-10T22:00:00.000Z",
    reason: "Thay thế toàn bộ hạt cao su và vá mặt cỏ nhân tạo",
    createdBy: USER_IDS.OWNER_APPROVED,
    createdAt: "2026-10-30T10:00:00.000Z"
  },
  {
    _id: "690700000000000000000004",
    courtId: initialCourts[9]._id, // Sân Pickleball Sơn Trà P1
    startAt: "2026-11-06T13:00:00.000Z",
    endAt: "2026-11-06T15:00:00.000Z",
    reason: "Vệ sinh công nghiệp mặt sân trong nhà",
    createdBy: USER_IDS.OWNER_APPROVED,
    createdAt: "2026-11-02T10:30:00.000Z"
  },
  {
    _id: "690700000000000000000005",
    courtId: initialCourts[6]._id, // Sân Tennis Trung Tâm 01
    startAt: "2026-11-07T08:00:00.000Z",
    endAt: "2026-11-07T12:00:00.000Z",
    reason: "Giải quần vợt lão tướng nội bộ Chi Lăng",
    createdBy: USER_IDS.OWNER_APPROVED,
    createdAt: "2026-11-01T14:00:00.000Z"
  },
  {
    _id: "690700000000000000000006",
    courtId: initialCourts[11]._id, // Sân Tennis Riverside T1
    startAt: "2026-11-08T14:00:00.000Z",
    endAt: "2026-11-08T18:00:00.000Z",
    reason: "Tổ chức lớp đào tạo kỹ năng cho học viên thiếu nhi",
    createdBy: USER_IDS.OWNER_APPROVED_2,
    createdAt: "2026-11-02T11:00:00.000Z"
  },
  {
    _id: "690700000000000000000007",
    courtId: initialCourts[13]._id, // Pickleball Riverside Pro
    startAt: "2026-11-05T08:00:00.000Z",
    endAt: "2026-11-05T11:00:00.000Z",
    reason: "Kiểm tra lưới thi đấu và cột neo",
    createdBy: USER_IDS.OWNER_APPROVED_2,
    createdAt: "2026-11-02T15:00:00.000Z"
  },
  {
    _id: "690700000000000000000008",
    courtId: initialCourts[14]._id, // Sân bóng Hòa Xuân 7A
    startAt: "2026-11-09T06:00:00.000Z",
    endAt: "2026-11-09T09:00:00.000Z",
    reason: "Cắt tỉa cây xanh hành lang bảo vệ quanh sân",
    createdBy: USER_IDS.OWNER_APPROVED_2,
    createdAt: "2026-11-01T16:00:00.000Z"
  },
  {
    _id: "690700000000000000000009",
    courtId: initialCourts[18]._id, // Pickleball Mỹ Khê 01
    startAt: "2026-11-06T06:00:00.000Z",
    endAt: "2026-11-06T08:00:00.000Z",
    reason: "Phun xịt rửa cát biển bám trên bề mặt sân",
    createdBy: USER_IDS.OWNER_APPROVED_2,
    createdAt: "2026-11-02T18:00:00.000Z"
  },
  {
    _id: "690700000000000000000010",
    courtId: initialCourts[1]._id, // Sân Bóng Đá Số 2 Tuyên Sơn
    startAt: "2026-11-10T14:00:00.000Z",
    endAt: "2026-11-10T17:00:00.000Z",
    reason: "Họp ban tổ chức giải bóng đá sinh viên khối ĐH Đà Nẵng",
    createdBy: USER_IDS.OWNER_APPROVED,
    createdAt: "2026-11-02T19:00:00.000Z"
  }
];

