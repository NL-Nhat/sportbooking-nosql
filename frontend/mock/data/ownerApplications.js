import { USER_IDS } from '../fixtures/ids.js';

export const initialOwnerApplications = [
  {
    _id: "690300000000000000000001",
    userId: USER_IDS.OWNER_APPROVED,
    businessName: "Công ty TNHH Thể Thao Tuyên Sơn Đà Nẵng",
    businessAddress: {
      province: "Đà Nẵng",
      district: "Hải Châu",
      ward: "Hòa Cường Nam",
      detail: "Số 02 Đường 2 Tháng 9"
    },
    contactPhone: "0988776655",
    documents: [
      {
        fileUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80",
        fileName: "1704706200001_ts01_giay_phep_kinh_doanh.jpg",
        documentType: "BUSINESS_LICENSE",
        uploadedAt: "2026-01-08T09:30:00.000Z"
      },
      {
        fileUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80",
        fileName: "1704706200002_ts02_cccd_mat_truoc.jpg",
        documentType: "ID_CARD_FRONT",
        uploadedAt: "2026-01-08T09:30:00.000Z"
      }
    ],
    status: "APPROVED",
    reviewedBy: USER_IDS.ADMIN_1,
    reviewedAt: "2026-01-12T16:00:00.000Z",
    rejectionReason: null,
    createdAt: "2026-01-08T09:30:00.000Z",
    updatedAt: "2026-01-12T16:00:00.000Z"
  },
  {
    _id: "690300000000000000000002",
    userId: USER_IDS.OWNER_APPROVED_2,
    businessName: "Hộ Kinh Doanh CLB Thể Thao Sông Hàn",
    businessAddress: {
      province: "Đà Nẵng",
      district: "Ngũ Hành Sơn",
      ward: "Mỹ An",
      detail: "99 Võ Nguyên Giáp"
    },
    contactPhone: "0977889900",
    documents: [
      {
        fileUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80",
        fileName: "1704896100001_sh01_giay_phep_kinh_doanh.jpg",
        documentType: "BUSINESS_LICENSE",
        uploadedAt: "2026-01-10T14:15:00.000Z"
      },
      {
        fileUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80",
        fileName: "1704896100002_sh02_cccd_mat_truoc.jpg",
        documentType: "ID_CARD_FRONT",
        uploadedAt: "2026-01-10T14:15:00.000Z"
      }
    ],
    status: "APPROVED",
    reviewedBy: USER_IDS.ADMIN_1,
    reviewedAt: "2026-01-14T11:20:00.000Z",
    rejectionReason: null,
    createdAt: "2026-01-10T14:15:00.000Z",
    updatedAt: "2026-01-14T11:20:00.000Z"
  },
  {
    _id: "690300000000000000000003",
    userId: USER_IDS.OWNER_PENDING,
    businessName: "CLB Cầu Lông & Pickleball Hòa Khánh",
    businessAddress: {
      province: "Đà Nẵng",
      district: "Liên Chiểu",
      ward: "Hòa Khánh Bắc",
      detail: "24 Tôn Đức Thắng"
    },
    contactPhone: "0905443322",
    documents: [
      {
        fileUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80",
        fileName: "1708246800001_hk01_giay_phep_kinh_doanh.jpg",
        documentType: "BUSINESS_LICENSE",
        uploadedAt: "2026-02-18T09:00:00.000Z"
      },
      {
        fileUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80",
        fileName: "1708246800002_hk02_cccd_mat_truoc.jpg",
        documentType: "ID_CARD_FRONT",
        uploadedAt: "2026-02-18T09:00:00.000Z"
      }
    ],
    status: "PENDING",
    reviewedBy: null,
    reviewedAt: null,
    rejectionReason: null,
    createdAt: "2026-02-18T09:00:00.000Z",
    updatedAt: "2026-02-18T09:00:00.000Z"
  },
  {
    _id: "690300000000000000000004",
    userId: USER_IDS.OWNER_REJECTED,
    businessName: "Sân Bóng Mini Trung Tâm Hải Châu",
    businessAddress: {
      province: "Đà Nẵng",
      district: "Hải Châu",
      ward: "Bình Thuận",
      detail: "55 Hoàng Diệu"
    },
    contactPhone: "0905112233",
    documents: [
      {
        fileUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80",
        fileName: "1707573600001_hc01_giay_phep_kinh_doanh.jpg",
        documentType: "BUSINESS_LICENSE",
        uploadedAt: "2026-02-10T14:00:00.000Z"
      },
      {
        fileUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80",
        fileName: "1707573600002_hc02_cccd_mat_truoc.jpg",
        documentType: "ID_CARD_FRONT",
        uploadedAt: "2026-02-10T14:00:00.000Z"
      }
    ],
    status: "REJECTED",
    reviewedBy: USER_IDS.ADMIN_1,
    reviewedAt: "2026-02-12T15:30:00.000Z",
    rejectionReason: "Giấy phép đăng ký kinh doanh đã hết hạn và thông tin địa chỉ chưa khớp với CMND/CCCD.",
    createdAt: "2026-02-10T14:00:00.000Z",
    updatedAt: "2026-02-12T15:30:00.000Z"
  },
  {
    _id: "690300000000000000000005",
    userId: USER_IDS.CUSTOMER_3,
    businessName: "Trung Tâm Thể Thao Bán Đảo Sơn Trà",
    businessAddress: {
      province: "Đà Nẵng",
      district: "Sơn Trà",
      ward: "An Hải Đông",
      detail: "12 Võ Văn Kiệt"
    },
    contactPhone: "0935345678",
    documents: [
      {
        fileUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80",
        fileName: "1708855200001_st01_giay_phep_kinh_doanh.jpg",
        documentType: "BUSINESS_LICENSE",
        uploadedAt: "2026-02-25T10:00:00.000Z"
      },
      {
        fileUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80",
        fileName: "1708855200002_st02_cccd_mat_truoc.jpg",
        documentType: "ID_CARD_FRONT",
        uploadedAt: "2026-02-25T10:00:00.000Z"
      }
    ],
    status: "PENDING",
    reviewedBy: null,
    reviewedAt: null,
    rejectionReason: null,
    createdAt: "2026-02-25T10:00:00.000Z",
    updatedAt: "2026-02-25T10:00:00.000Z"
  }
];
