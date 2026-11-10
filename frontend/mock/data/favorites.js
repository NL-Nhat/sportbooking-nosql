import { USER_IDS, FACILITY_IDS } from '../fixtures/ids.js';
import { initialCourts } from './courts.js';

export const initialFavorites = [
  // Customer 1 favorites
  { _id: "690c00000000000000000001", userId: USER_IDS.CUSTOMER_1, targetType: "FACILITY", targetId: FACILITY_IDS.FAC_1, createdAt: "2026-01-15T08:00:00.000Z" },
  { _id: "690c00000000000000000002", userId: USER_IDS.CUSTOMER_1, targetType: "FACILITY", targetId: FACILITY_IDS.FAC_3, createdAt: "2026-01-20T09:30:00.000Z" },
  { _id: "690c00000000000000000003", userId: USER_IDS.CUSTOMER_1, targetType: "COURT", targetId: initialCourts[0]._id, createdAt: "2026-01-22T10:00:00.000Z" },
  { _id: "690c00000000000000000004", userId: USER_IDS.CUSTOMER_1, targetType: "COURT", targetId: initialCourts[2]._id, createdAt: "2026-01-25T14:15:00.000Z" },
  { _id: "690c00000000000000000005", userId: USER_IDS.CUSTOMER_1, targetType: "COURT", targetId: initialCourts[9]._id, createdAt: "2026-02-01T11:00:00.000Z" },

  // Customer 2 favorites
  { _id: "690c00000000000000000006", userId: USER_IDS.CUSTOMER_2, targetType: "FACILITY", targetId: FACILITY_IDS.FAC_2, createdAt: "2026-01-18T07:45:00.000Z" },
  { _id: "690c00000000000000000007", userId: USER_IDS.CUSTOMER_2, targetType: "FACILITY", targetId: FACILITY_IDS.FAC_4, createdAt: "2026-01-22T08:00:00.000Z" },
  { _id: "690c00000000000000000008", userId: USER_IDS.CUSTOMER_2, targetType: "COURT", targetId: initialCourts[4]._id, createdAt: "2026-01-24T15:30:00.000Z" },
  { _id: "690c00000000000000000009", userId: USER_IDS.CUSTOMER_2, targetType: "COURT", targetId: initialCourts[11]._id, createdAt: "2026-02-05T09:20:00.000Z" },
  { _id: "690c00000000000000000010", userId: USER_IDS.CUSTOMER_2, targetType: "COURT", targetId: initialCourts[18]._id, createdAt: "2026-02-10T16:00:00.000Z" },

  // Customer 3 favorites
  { _id: "690c00000000000000000011", userId: USER_IDS.CUSTOMER_3, targetType: "FACILITY", targetId: FACILITY_IDS.FAC_3, createdAt: "2026-01-25T11:00:00.000Z" },
  { _id: "690c00000000000000000012", userId: USER_IDS.CUSTOMER_3, targetType: "COURT", targetId: initialCourts[7]._id, createdAt: "2026-01-26T14:00:00.000Z" },
  { _id: "690c00000000000000000013", userId: USER_IDS.CUSTOMER_3, targetType: "COURT", targetId: initialCourts[10]._id, createdAt: "2026-02-02T10:00:00.000Z" },

  // Customer 4 favorites
  { _id: "690c00000000000000000014", userId: USER_IDS.CUSTOMER_4, targetType: "FACILITY", targetId: FACILITY_IDS.FAC_6, createdAt: "2026-02-05T08:30:00.000Z" },
  { _id: "690c00000000000000000015", userId: USER_IDS.CUSTOMER_4, targetType: "COURT", targetId: initialCourts[16]._id, createdAt: "2026-02-08T12:00:00.000Z" }
];

