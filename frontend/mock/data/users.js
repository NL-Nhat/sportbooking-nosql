import { USER_IDS } from '../fixtures/ids.js';
import { SPORT_IMAGES } from '../fixtures/images.js';

export const initialUsers = [
  {
    _id: USER_IDS.CUSTOMER_1,
    fullName: "Nguyễn Minh Anh",
    email: "customer@sportbooking.demo",
    password: "$2a$10$MOCK_BCRYPT_HASH_CUSTOMER_1",
    phone: "0905123456",
    avatar: SPORT_IMAGES.AVATARS[0],
    address: {
      province: "Đà Nẵng",
      district: "Hải Châu",
      ward: "Hòa Cường Bắc",
      detail: "125 Núi Thành"
    },
    roles: ["CUSTOMER"],
    ownerStatus: "NOT_REGISTERED",
    status: "ACTIVE",
    isEmailVerified: true,
    createdAt: "2026-01-10T08:00:00.000Z",
    updatedAt: "2026-02-15T09:30:00.000Z"
  },
  {
    _id: USER_IDS.CUSTOMER_2,
    fullName: "Trần Hoàng Quân",
    email: "quan.tran@example.com",
    password: "$2a$10$MOCK_BCRYPT_HASH_CUSTOMER_2",
    phone: "0914234567",
    avatar: SPORT_IMAGES.AVATARS[1],
    address: {
      province: "Đà Nẵng",
      district: "Thanh Khê",
      ward: "Chính Gián",
      detail: "45 Điện Biên Phủ"
    },
    roles: ["CUSTOMER"],
    ownerStatus: "NOT_REGISTERED",
    status: "ACTIVE",
    isEmailVerified: true,
    createdAt: "2026-01-15T10:00:00.000Z",
    updatedAt: "2026-01-15T10:00:00.000Z"
  },
  {
    _id: USER_IDS.CUSTOMER_3,
    fullName: "Lê Thị Thu Thảo",
    email: "thao.le@example.com",
    password: "$2a$10$MOCK_BCRYPT_HASH_CUSTOMER_3",
    phone: "0935345678",
    avatar: SPORT_IMAGES.AVATARS[2],
    address: {
      province: "Đà Nẵng",
      district: "Sơn Trà",
      ward: "An Hải Tây",
      detail: "88 Võ Văn Kiệt"
    },
    roles: ["CUSTOMER"],
    ownerStatus: "NOT_REGISTERED",
    status: "ACTIVE",
    isEmailVerified: true,
    createdAt: "2026-01-20T14:20:00.000Z",
    updatedAt: "2026-01-20T14:20:00.000Z"
  },
  {
    _id: USER_IDS.CUSTOMER_4,
    fullName: "Đỗ Quốc Bảo",
    email: "bao.do@example.com",
    password: "$2a$10$MOCK_BCRYPT_HASH_CUSTOMER_4",
    phone: "0905987654",
    avatar: SPORT_IMAGES.AVATARS[3],
    address: {
      province: "Đà Nẵng",
      district: "Cẩm Lệ",
      ward: "Hòa Xuân",
      detail: "12 Đô Đốc Lộc"
    },
    roles: ["CUSTOMER"],
    ownerStatus: "NOT_REGISTERED",
    status: "ACTIVE",
    isEmailVerified: true,
    createdAt: "2026-02-01T11:15:00.000Z",
    updatedAt: "2026-02-01T11:15:00.000Z"
  },
  {
    _id: USER_IDS.OWNER_APPROVED,
    fullName: "Phạm Văn Thành (Chủ Sân Pro)",
    email: "owner@sportbooking.demo",
    password: "$2a$10$MOCK_BCRYPT_HASH_OWNER_APP",
    phone: "0988776655",
    avatar: SPORT_IMAGES.AVATARS[1],
    address: {
      province: "Đà Nẵng",
      district: "Hải Châu",
      ward: "Hòa Cường Nam",
      detail: "18 2 Tháng 9"
    },
    roles: ["CUSTOMER", "OWNER"],
    ownerStatus: "APPROVED",
    status: "ACTIVE",
    isEmailVerified: true,
    createdAt: "2026-01-05T07:00:00.000Z",
    updatedAt: "2026-01-12T16:00:00.000Z"
  },
  {
    _id: USER_IDS.OWNER_APPROVED_2,
    fullName: "Võ Đức Huy",
    email: "huy.voduc@sportcenter.vn",
    password: "$2a$10$MOCK_BCRYPT_HASH_OWNER_2",
    phone: "0977889900",
    avatar: SPORT_IMAGES.AVATARS[2],
    address: {
      province: "Đà Nẵng",
      district: "Ngũ Hành Sơn",
      ward: "Mỹ An",
      detail: "99 Võ Nguyên Giáp"
    },
    roles: ["CUSTOMER", "OWNER"],
    ownerStatus: "APPROVED",
    status: "ACTIVE",
    isEmailVerified: true,
    createdAt: "2026-01-08T08:30:00.000Z",
    updatedAt: "2026-01-14T11:20:00.000Z"
  },
  {
    _id: USER_IDS.OWNER_PENDING,
    fullName: "Hoàng Minh Trí (Đang chờ duyệt)",
    email: "pending@sportbooking.demo",
    password: "$2a$10$MOCK_BCRYPT_HASH_OWNER_PEN",
    phone: "0905443322",
    avatar: SPORT_IMAGES.AVATARS[3],
    address: {
      province: "Đà Nẵng",
      district: "Liên Chiểu",
      ward: "Hòa Khánh Bắc",
      detail: "24 Tôn Đức Thắng"
    },
    roles: ["CUSTOMER"],
    ownerStatus: "PENDING",
    status: "ACTIVE",
    isEmailVerified: true,
    createdAt: "2026-02-18T09:00:00.000Z",
    updatedAt: "2026-02-18T09:00:00.000Z"
  },
  {
    _id: USER_IDS.OWNER_REJECTED,
    fullName: "Đinh Trọng Hưng",
    email: "hung.dinh@example.com",
    password: "$2a$10$MOCK_BCRYPT_HASH_OWNER_REJ",
    phone: "0905112233",
    avatar: SPORT_IMAGES.AVATARS[0],
    address: {
      province: "Đà Nẵng",
      district: "Hải Châu",
      ward: "Bình Thuận",
      detail: "55 Hoàng Diệu"
    },
    roles: ["CUSTOMER"],
    ownerStatus: "REJECTED",
    status: "ACTIVE",
    isEmailVerified: true,
    createdAt: "2026-02-10T14:00:00.000Z",
    updatedAt: "2026-02-12T15:30:00.000Z"
  },
  {
    _id: USER_IDS.ADMIN_1,
    fullName: "Quản Trị Viên Hệ Thống",
    email: "admin@sportbooking.demo",
    password: "$2a$10$MOCK_BCRYPT_HASH_ADMIN_1",
    phone: "0909090909",
    avatar: SPORT_IMAGES.AVATARS[1],
    address: {
      province: "Đà Nẵng",
      district: "Hải Châu",
      ward: "Thạch Thang",
      detail: "24 Trần Phú"
    },
    roles: ["ADMIN"],
    ownerStatus: "NOT_REGISTERED",
    status: "ACTIVE",
    isEmailVerified: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z"
  },
  {
    _id: USER_IDS.ADMIN_2,
    fullName: "Vũ Khánh Linh (Admin Support)",
    email: "linh.admin@sportbooking.demo",
    password: "$2a$10$MOCK_BCRYPT_HASH_ADMIN_2",
    phone: "0908080808",
    avatar: SPORT_IMAGES.AVATARS[2],
    address: {
      province: "Đà Nẵng",
      district: "Hải Châu",
      ward: "Hải Châu 1",
      detail: "10 Bạch Đằng"
    },
    roles: ["ADMIN"],
    ownerStatus: "NOT_REGISTERED",
    status: "ACTIVE",
    isEmailVerified: true,
    createdAt: "2026-01-02T08:00:00.000Z",
    updatedAt: "2026-01-02T08:00:00.000Z"
  },
  {
    _id: USER_IDS.USER_BANNED,
    fullName: "Nguyễn Văn Vi Phạm",
    email: "banned.user@example.com",
    password: "$2a$10$MOCK_BCRYPT_HASH_BANNED",
    phone: "0901000999",
    avatar: SPORT_IMAGES.AVATARS[3],
    address: {
      province: "Đà Nẵng",
      district: "Thanh Khê",
      ward: "Tam Thuận",
      detail: "100 Trần Cao Vân"
    },
    roles: ["CUSTOMER"],
    ownerStatus: "NOT_REGISTERED",
    status: "BANNED",
    isEmailVerified: false,
    createdAt: "2026-01-25T16:00:00.000Z",
    updatedAt: "2026-02-05T10:00:00.000Z"
  },
  {
    _id: USER_IDS.USER_INACTIVE,
    fullName: "Dương Tuấn Khải",
    email: "inactive.user@example.com",
    password: "$2a$10$MOCK_BCRYPT_HASH_INACTIVE",
    phone: "0902111888",
    avatar: SPORT_IMAGES.AVATARS[0],
    address: {
      province: "Đà Nẵng",
      district: "Sơn Trà",
      ward: "Mân Thái",
      detail: "72 Ngô Quyền"
    },
    roles: ["CUSTOMER"],
    ownerStatus: "NOT_REGISTERED",
    status: "INACTIVE",
    isEmailVerified: false,
    createdAt: "2026-02-12T13:00:00.000Z",
    updatedAt: "2026-02-12T13:00:00.000Z"
  }
];

