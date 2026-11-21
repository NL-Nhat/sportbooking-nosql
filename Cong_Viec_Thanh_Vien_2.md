# PHÂN CÔNG CÔNG VIỆC — THÀNH VIÊN 2
## PHÂN HỆ: CHỦ SÂN (OWNER) & QUẢN TRỊ VIÊN (ADMIN)

**Dự án:** Hệ thống Đặt sân Thể thao Trực tuyến (SportBooking)  
**Vai trò phụ trách chính:** **Chủ sân (`OWNER`)** + **Quản trị viên (`ADMIN`)**  
**Các chức năng độc lập đã chuyển sang cho Thành viên 1 làm bớt để cân bằng khối lượng:**
1. *Quản lý Hồ sơ cá nhân, Upload Avatar & Đổi mật khẩu dùng chung* (`/owner/profile`, `/account/profile`) -> **Thành viên 1 đã nhận làm**.
2. *Hệ thống Chuông Thông báo (`notifications`)* -> **Thành viên 1 đã nhận làm**.
3. *Tác vụ tự động giải phóng chỗ giữ quá hạn 1 giờ (`HOLD -> EXPIRED`)* -> **Thành viên 1 đã nhận làm**.

---

## 1. TỔNG QUAN PHẠM VI CỦA THÀNH VIÊN 2

| Nhóm người dùng / Phân hệ | Các chức năng chính Thành viên 2 đảm nhận | Giao diện Frontend (`route`) |
| :--- | :--- | :--- |
| **1. Quản trị viên (`ADMIN`)** | - Quản lý Danh mục Môn thể thao: Thêm, Sửa, Ẩn/Hiện (`sports_categories`)<br>- Xét duyệt / Từ chối Hồ sơ đăng ký Chủ sân & Cấp quyền `OWNER` (`owner_applications`, `users`)<br>- Quản lý Danh sách Người dùng & Khóa / Mở khóa tài khoản (`users`, `auth_sessions`)<br>- Kiểm duyệt & Ẩn / Hiện các Đánh giá vi phạm (`reviews`)<br>- Phân xử & Giải quyết Khiếu nại giữa Khách hàng và Chủ sân (`complaints`)<br>- Dashboard Thống kê Tổng quan Admin & Cài đặt hệ thống | `/admin`, `/admin/categories`, `/admin/owner-applications`, `/admin/owner-applications/:id`, `/admin/users`, `/admin/reviews`, `/admin/complaints`, `/admin/complaints/:id`, `/admin/settings` |
| **2. Chủ sân (`OWNER`)** | - Quản lý Cơ sở thể thao: Thêm, Sửa, Đổi trạng thái (`facilities`)<br>- Quản lý Sân thể thao & Thiết lập Khung giờ cho thuê mẫu (`courts`, `operating_hours`)<br>- Quản lý chuyên sâu Lịch hoạt động theo từng Sân (`operating_hours`)<br>- Quản lý Quy tắc Giá động theo Thứ / Ngày cụ thể / Khung giờ (`price_rules`)<br>- Quản lý Lịch chặn sân / Khóa giờ bảo trì (`blocked_slots`)<br>- Xem Lịch biểu Đặt sân Trực quan theo Cơ sở & Ngày (`/owner/calendar`)<br>- Quản lý Đơn đặt sân tại cơ sở, Thu 80% tiền còn lại tại sân & Đánh dấu Hoàn thành (`bookings`, `payments`)<br>- Phản hồi Đánh giá của khách (`reviews`) & Giải trình Khiếu nại (`complaints`)<br>- Thống kê Doanh thu, Báo cáo tài chính & Dashboard Chủ sân | `/owner`, `/owner/facilities`, `/owner/facilities/new`, `/owner/facilities/:id/edit`, `/owner/courts`, `/owner/courts/new`, `/owner/courts/:id/edit`, `/owner/operating-hours`, `/owner/pricing`, `/owner/pricing/new`, `/owner/blocked-slots`, `/owner/calendar`, `/owner/bookings`, `/owner/bookings/:id`, `/owner/reviews`, `/owner/complaints`, `/owner/revenue` |

> **Làm việc độc lập không cần chờ Thành viên 1:** Trong database `sportbooking_db` đã có sẵn đầy đủ dữ liệu mẫu của `users`, `owner_applications`, `bookings`, `booking_slots`, `payments`, `reviews`, `complaints` (từ `HuongdantaoDB.md`), nên Thành viên 2 có thể code và test ngay toàn bộ chức năng Duyệt hồ sơ, Quản lý sân, Quản lý đơn đặt sân, Doanh thu, Phản hồi đánh giá/khiếu nại mà **không cần đợi** Thành viên 1.

---

# PHẦN I: LỘ TRÌNH CÁC CHỨC NĂNG CHÍNH CẦN LÀM TRƯỚC — LÀM SAU

> **Thứ tự thực hiện:** Làm các chức năng nền tảng của **Admin** (Danh mục môn thể thao -> Duyệt Chủ sân -> Quản lý User) trước -> tiếp theo làm luồng thiết lập của **Chủ sân** (Tạo Cơ sở -> Tạo Sân & Khung giờ -> Tạo Quy tắc giá -> Khóa lịch bảo trì) -> sau đó làm luồng vận hành của **Chủ sân** (Quản lý Đơn đặt sân -> Lịch biểu -> Doanh thu -> Phản hồi Đánh giá/Khiếu nại) -> cuối cùng hoàn thiện **Admin Kiểm duyệt Đánh giá, Phân xử Khiếu nại & Dashboard Admin**.

| Thứ tự | Mã | Loại người dùng | Tên chức năng chính | Collection tác động | Trang Frontend |
| :--: | :--: | :---: | :--- | :--- | :--- |
| **Bước 1** | **TV2-01** | **Admin** | **Quản lý Danh mục Môn thể thao (Thêm, Sửa, Ẩn/Hiện)** | `sports_categories` | `/admin/categories` |
| **Bước 2** | **TV2-02** | **Admin** | **Xét duyệt / Từ chối Hồ sơ đăng ký Chủ sân & Cấp quyền `OWNER`** | `owner_applications`, `users` | `/admin/owner-applications`, `/admin/owner-applications/:id` |
| **Bước 3** | **TV2-03** | **Admin** | **Quản lý Danh sách Người dùng & Khóa / Mở khóa Tài khoản** | `users`, `auth_sessions` | `/admin/users` |
| **Bước 4** | **TV2-04** | **Chủ sân (`OWNER`)** | **Quản lý Cơ sở thể thao (Thêm, Sửa, Ẩn/Hiện Cơ sở)** | `facilities` | `/owner/facilities`, `/owner/facilities/new`, `/owner/facilities/:id/edit` |
| **Bước 5** | **TV2-05** | **Chủ sân (`OWNER`)** | **Quản lý Sân thể thao & Thiết lập Khung giờ cho thuê mẫu (`timeSlots`)** | `courts`, `operating_hours` | `/owner/courts`, `/owner/courts/new`, `/owner/courts/:id/edit` |
| **Bước 6** | **TV2-06** | **Chủ sân (`OWNER`)** | **Quản lý chuyên sâu Lịch hoạt động theo từng Sân** | `operating_hours` | `/owner/operating-hours` |
| **Bước 7** | **TV2-07** | **Chủ sân (`OWNER`)** | **Quản lý Quy tắc Giá động (Theo Thứ / Ngày cụ thể / Khung giờ)** | `price_rules` | `/owner/pricing`, `/owner/pricing/new` |
| **Bước 8** | **TV2-08** | **Chủ sân (`OWNER`)** | **Quản lý Lịch chặn sân / Khóa giờ bảo trì** | `blocked_slots`, `booking_slots` | `/owner/blocked-slots` |
| **Bước 9** | **TV2-09** | **Chủ sân (`OWNER`)** | **Quản lý Đơn đặt sân tại cơ sở, Thu 80% tiền còn lại & Đánh dấu Hoàn thành** | `bookings`, `booking_slots`, `payments` | `/owner/bookings`, `/owner/bookings/:id` |
| **Bước 10** | **TV2-10** | **Chủ sân (`OWNER`)** | **Xem Lịch biểu Đặt sân Trực quan & Thống kê Doanh thu / Dashboard Chủ sân** | `bookings`, `booking_slots`, `blocked_slots`, `payments` | `/owner/calendar`, `/owner/revenue`, `/owner` |
| **Bước 11** | **TV2-11** | **Chủ sân + Admin** | **Chủ sân Phản hồi Đánh giá & Admin Kiểm duyệt / Ẩn-Hiện Đánh giá** | `reviews`, `facilities` | `/owner/reviews`, `/admin/reviews` |
| **Bước 12** | **TV2-12** | **Chủ sân + Admin** | **Chủ sân Giải trình Khiếu nại & Admin Phân xử Khiếu nại** | `complaints` | `/owner/complaints`, `/admin/complaints`, `/admin/complaints/:id` |
| **Bước 13** | **TV2-13** | **Admin** | **Dashboard Thống kê Tổng quan Admin & Cài đặt hệ thống** | `users`, `owner_applications`, `facilities`, `courts`, `bookings` | `/admin`, `/admin/settings` |

---

# PHẦN II: DANH SÁCH CHI TIẾT CÁC CHỨC NĂNG NHỎ (THEO TỪNG LOẠI NGƯỜI DÙNG & THỨ TỰ LÀM)

---

## NHÓM 1 — PHÂN HỆ QUẢN TRỊ VIÊN (`ADMIN`): DANH MỤC, DUYỆT CHỦ SÂN & QUẢN LÝ USER

### Bước 1 (`TV2-01`): [ADMIN] Quản lý Danh mục Môn thể thao (`sports_categories`)
> *Làm đầu tiên vì mỗi Sân thể thao khi tạo mới đều phải chọn một Danh mục môn thể thao từ bảng này.*

- [ ] **1.1. API Admin lấy toàn bộ danh mục môn thể thao (`GET /api/v1/admin/categories`)**
  - Hỗ trợ tìm kiếm theo tên/mã (`code`) và lọc theo trạng thái (`ACTIVE`, `INACTIVE`).
- [ ] **1.2. API Admin thêm môn thể thao mới (`POST /api/v1/admin/categories`)**
  - Kiểm tra quyền `ADMIN`.
  - Chuẩn hóa `code` viết hoa (`FOOTBALL`, `BADMINTON`, `TENNIS`, `PICKLEBALL`, ...), kiểm tra trùng `code` (`409 Conflict`).
  - Lưu `name`, `code`, `description`, `icon`, `status = "ACTIVE"`.
- [ ] **1.3. API Admin cập nhật thông tin & đổi trạng thái Ẩn/Hiện môn thể thao (`PATCH /api/v1/admin/categories/{id}`)**
- [ ] **1.4. Kết nối giao diện Frontend**
  - Kết nối trang Quản lý danh mục của Admin (`/admin/categories` — `AdminCategoriesPage.jsx`) với API thật, xóa mock data.

---

### Bước 2 (`TV2-02`): [ADMIN] Xét duyệt / Từ chối Hồ sơ đăng ký Chủ sân (`owner_applications`, `users`)
> *Xử lý các hồ sơ xin làm Chủ sân và tự động nâng quyền tài khoản lên `OWNER`.*

- [ ] **2.1. API Admin lấy danh sách hồ sơ đăng ký Chủ sân (`GET /api/v1/admin/owner-applications`)**
  - Hỗ trợ lọc theo `status` (`PENDING`, `APPROVED`, `REJECTED`), tìm kiếm theo tên doanh nghiệp/SĐT, phân trang và đính kèm thông tin tóm tắt của `user` nộp đơn.
- [ ] **2.2. API Admin xem chi tiết 1 hồ sơ đăng ký Chủ sân (`GET /api/v1/admin/owner-applications/{id}`)**
  - Trả về đầy đủ thông tin doanh nghiệp, thông tin người nộp và hình ảnh giấy tờ xác minh (`identityCardUrl`, `businessLicenseUrl`).
- [ ] **2.3. API Admin Phê duyệt hồ sơ Chủ sân (`POST /api/v1/admin/owner-applications/{id}/approve`)**
  - Chỉ duyệt hồ sơ đang ở trạng thái `PENDING`.
  - Cập nhật `owner_applications`: `status = "APPROVED"`, `reviewedBy = adminId`, `reviewedAt = Instant.now()`, `rejectionReason = null`.
  - Cập nhật `users`: Thêm `"OWNER"` vào mảng `roles` (thành `["CUSTOMER", "OWNER"]`) và đặt `ownerStatus = "APPROVED"`.
- [ ] **2.4. API Admin Từ chối hồ sơ Chủ sân (`POST /api/v1/admin/owner-applications/{id}/reject`)**
  - Bắt buộc nhập lý do từ chối (`rejectionReason`).
  - Cập nhật `owner_applications`: `status = "REJECTED"`, `reviewedBy = adminId`, `reviewedAt = Instant.now()`, lưu `rejectionReason`.
  - Cập nhật `users.ownerStatus = "REJECTED"`.
- [ ] **2.5. Kết nối giao diện Frontend**
  - Kết nối 2 trang Admin (`/admin/owner-applications` và `/admin/owner-applications/:id`) với API thật.

---

### Bước 3 (`TV2-03`): [ADMIN] Quản lý Danh sách Người dùng & Khóa / Mở khóa Tài khoản (`users`, `auth_sessions`)

- [ ] **3.1. API Admin lấy danh sách người dùng (`GET /api/v1/admin/users`)**
  - Tìm kiếm theo từ khóa (`fullName`, `email`, `phone`), lọc theo vai trò (`CUSTOMER`, `OWNER`, `ADMIN`), lọc theo trạng thái (`ACTIVE`, `INACTIVE`, `BANNED`), phân trang.
- [ ] **3.2. API Admin xem chi tiết người dùng (`GET /api/v1/admin/users/{id}`)**
- [ ] **3.3. API Admin khóa hoặc mở khóa tài khoản (`PATCH /api/v1/admin/users/{id}/status`)**
  - Không cho phép Admin tự khóa chính mình.
  - Khi chuyển trạng thái sang `"BANNED"` hoặc `"INACTIVE"`, tự động thu hồi toàn bộ các phiên đăng nhập đang hoạt động của user đó trong `auth_sessions` (`revokedAt = Instant.now()`).
- [ ] **3.4. Kết nối giao diện Frontend**
  - Kết nối trang Quản lý người dùng (`/admin/users` — `AdminUsersPage.jsx`) với API thật.

---

## NHÓM 2 — PHÂN HỆ CHỦ SÂN (`OWNER`): THIẾT LẬP CƠ SỞ, SÂN, GIỜ MỞ CỬA, GIÁ & LỊCH CHẶN

### Bước 4 (`TV2-04`): [CHỦ SÂN] Quản lý Cơ sở thể thao (`facilities`)
> *Chủ sân tạo Cơ sở thể thao của mình trước khi tạo các Sân con.*

- [ ] **4.1. API Owner lấy danh sách cơ sở thuộc quyền sở hữu của mình (`GET /api/v1/owner/facilities`)**
  - Chỉ trả về các cơ sở có `ownerId == currentUser.id`.
  - Hỗ trợ tìm kiếm theo tên cơ sở và lọc theo trạng thái (`ACTIVE`, `INACTIVE`, `PENDING_APPROVAL`).
- [ ] **4.2. API Owner tạo cơ sở thể thao mới (`POST /api/v1/owner/facilities`)**
  - Validate dữ liệu: `name`, `description`, `address` (`street`, `ward`, `district`, `city`), tọa độ `location` (`type = "Point"`, `coordinates = [lng, lat]`), danh sách tiện ích `amenities`.
  - Upload danh sách ảnh cơ sở (`images` với tên file kèm chuỗi định danh duy nhất).
  - Gán `ownerId = currentUser.id`, `avgRating = 0.0`, `reviewCount = 0`, `status = "ACTIVE"`.
- [ ] **4.3. API Owner xem chi tiết, cập nhật thông tin & đổi trạng thái hoạt động của cơ sở (`GET`, `PATCH /api/v1/owner/facilities/{id}`, `PATCH /api/v1/owner/facilities/{id}/status`)**
- [ ] **4.4. Kết nối giao diện Frontend**
  - Kết nối các trang `/owner/facilities`, `/owner/facilities/new`, `/owner/facilities/:id/edit` với API thật.

---

### Bước 5 (`TV2-05`): [CHỦ SÂN] Quản lý Sân thể thao & Thiết lập Khung giờ cho thuê mẫu (`courts`, `operating_hours`)
> *Khi tạo Sân mới, Chủ sân cấu hình luôn danh sách khung giờ cho thuê trong ngày (`timeSlots`) để áp dụng cho mọi ngày tiếp theo.*

- [ ] **5.1. API Owner lấy danh sách các sân thuộc quyền sở hữu của mình (`GET /api/v1/owner/courts`)**
  - Lọc theo cơ sở (`facilityId`), môn thể thao (`categoryId`), trạng thái (`ACTIVE`, `MAINTENANCE`, `INACTIVE`), tìm kiếm theo tên sân.
- [ ] **5.2. API Owner tạo sân mới kèm khung giờ cho thuê mẫu (`POST /api/v1/owner/courts`)**
  - Kiểm tra `facilityId` thuộc quyền sở hữu của `currentUser.id` và `categoryId` đang `ACTIVE`.
  - Lưu thông tin sân vào `courts`: `facilityId`, `categoryId`, `name`, `description`, `attributes` (`surface`, `size`, `indoor`, `lighting`), `capacity`, danh sách ảnh `images`, `status = "ACTIVE"`.
  - **Lưu đồng thời cấu hình khung giờ cho thuê trong ngày vào `operating_hours`**:
    - Nhận mảng `timeSlots` (ví dụ: `[{ startTime: "06:00", endTime: "07:00" }, { startTime: "14:00", endTime: "16:00" }]`).
    - Kiểm tra định dạng giờ `HH:mm`, `startTime < endTime`, và không chồng lấn giờ trong cùng 1 ngày.
    - Lưu vào `operating_hours` với `courtId` vừa tạo, `scheduleType = "DAILY"`, `status = "ACTIVE"`.
- [ ] **5.3. API Owner xem chi tiết sân kèm `timeSlots`, cập nhật sân + khung giờ & đổi trạng thái sân (`GET`, `PATCH /api/v1/owner/courts/{id}`, `PATCH /api/v1/owner/courts/{id}/status`)**
- [ ] **5.4. Kết nối giao diện Frontend**
  - Kết nối các trang `/owner/courts`, `/owner/courts/new`, `/owner/courts/:id/edit` với API thật.

---

### Bước 6 (`TV2-06`): [CHỦ SÂN] Quản lý chuyên sâu Lịch hoạt động theo từng Sân (`operating_hours`)

- [ ] **6.1. API lấy cấu hình lịch hoạt động của một sân (`GET /api/v1/owner/courts/{courtId}/operating-hours`)**
- [ ] **6.2. API cập nhật cấu hình lịch hoạt động của sân (`PUT /api/v1/owner/courts/{courtId}/operating-hours`)**
  - Cập nhật `effectiveFrom`, `effectiveTo`, `status` và danh sách `timeSlots` (kiểm tra không giao nhau).
- [ ] **6.3. Kết nối giao diện Frontend**
  - Kết nối trang Lịch hoạt động (`/owner/operating-hours` — `OwnerOperatingHoursPage.jsx`) với API thật.

---

### Bước 7 (`TV2-07`): [CHỦ SÂN] Quản lý Quy tắc Giá động (`price_rules`)

- [ ] **7.1. API Owner lấy danh sách quy tắc giá theo sân (`GET /api/v1/owner/price-rules?courtId=...`)**
  - Kiểm tra sân thuộc quyền sở hữu của Owner, lọc theo trạng thái (`ACTIVE`, `INACTIVE`), sắp xếp theo `priority` giảm dần.
- [ ] **7.2. API Owner tạo quy tắc giá mới (`POST /api/v1/owner/price-rules`)**
  - Validate dữ liệu: `courtId`, `name`, `startTime`, `endTime` (`startTime < endTime`), `pricePerSlot` (`BigDecimal` > 0), `daysOfWeek` (`1..7`), `specificDates` (`yyyy-MM-dd`), `validFrom`, `validTo`, `priority`.
- [ ] **7.3. API Owner cập nhật, bật/tắt và xóa quy tắc giá (`PATCH /api/v1/owner/price-rules/{id}`, `DELETE /api/v1/owner/price-rules/{id}`)**
- [ ] **7.4. Kết nối giao diện Frontend**
  - Kết nối trang Danh sách quy tắc giá (`/owner/pricing`) và Form Tạo quy tắc giá (`/owner/pricing/new`) với API thật.

---

### Bước 8 (`TV2-08`): [CHỦ SÂN] Quản lý Lịch chặn sân / Khóa giờ bảo trì (`blocked_slots`)

- [ ] **8.1. API Owner lấy danh sách lịch chặn sân (`GET /api/v1/owner/blocked-slots?courtId=...&date=...`)**
- [ ] **8.2. API Owner tạo lịch chặn sân mới (`POST /api/v1/owner/blocked-slots`)**
  - Kiểm tra `courtId`, `startAt < endAt`, `reason` bắt buộc (ví dụ: *"Bảo trì mặt cỏ"*, *"Giải đấu nội bộ"*).
  - Kiểm tra không trùng với khung giờ đã có khách đặt (`booking_slots` đang `HOLD` hoặc `BOOKED` -> trả về lỗi `409 Conflict`).
- [ ] **8.3. API Owner xóa / mở khóa lịch chặn sân (`DELETE /api/v1/owner/blocked-slots/{id}`)**
- [ ] **8.4. Kết nối giao diện Frontend**
  - Kết nối trang Quản lý lịch chặn sân (`/owner/blocked-slots` — `OwnerBlockedSlotsPage.jsx`) với API thật.

---

## NHÓM 3 — PHÂN HỆ CHỦ SÂN (`OWNER`): VẬN HÀNH ĐƠN ĐẶT SÂN, LỊCH BIỂU & DOANH THU

### Bước 9 (`TV2-09`): [CHỦ SÂN] Quản lý Đơn đặt sân tại cơ sở, Thu 80% tiền còn lại & Đánh dấu Hoàn thành (`bookings`, `payments`)

- [ ] **9.1. API Owner lấy danh sách đơn đặt sân tại các cơ sở của mình (`GET /api/v1/owner/bookings`)**
  - Chỉ lấy các đơn thuộc các `facilityId` do `currentUser.id` sở hữu.
  - Hỗ trợ lọc theo `facilityId`, `courtId`, ngày đặt (`bookingDate`), `paymentStatus` và tìm kiếm theo `bookingCode`, tên/SĐT khách đặt.
- [ ] **9.2. Hiển thị danh sách khung giờ đặt sân trên trang Quản lý đặt sân (`/owner/bookings` — `OwnerBookingsPage.jsx`)**
  - Hiển thị rõ ràng **danh sách các khung giờ đặt sân** của từng đơn (ví dụ: `12:00 - 13:00, 14:00 - 16:00`), giữ giao diện gọn gàng theo đúng thiết kế.
- [ ] **9.3. API Owner xác nhận đã thu phần tiền 80% còn lại tại sân (`POST /api/v1/owner/bookings/{id}/collect-remaining`)**
  - Tạo bản ghi `payments` với `type = "REMAINING"`, `method = "CASH"`, `amount = remainingAmount`, `status = "PAID"`.
  - Cập nhật `booking.paidAmount = totalAmount`, `booking.remainingAmount = 0`, `booking.paymentStatus = "PAID"`.
- [ ] **9.4. API Owner đánh dấu đơn đặt sân đã hoàn thành (`POST /api/v1/owner/bookings/{id}/complete`)**
  - Chuyển `booking.status = "COMPLETED"`, `completedAt = Instant.now()`.
- [ ] **9.5. API Owner hủy/từ chối đơn đặt sân (`POST /api/v1/owner/bookings/{id}/cancel`)**
  - Cập nhật `status = "CANCELLED"`, `cancelledBy = "OWNER"`, giải phóng `booking_slots` sang `"RELEASED"`.
- [ ] **9.6. Kết nối giao diện Frontend**
  - Kết nối 2 trang `/owner/bookings` (`OwnerBookingsPage.jsx`) và `/owner/bookings/:id` (`OwnerBookingDetailPage.jsx`) với API thật.

---

### Bước 10 (`TV2-10`): [CHỦ SÂN] Lịch biểu Đặt sân Trực quan, Thống kê Doanh thu & Dashboard Chủ sân (`bookings`, `payments`)

- [ ] **10.1. API Owner lấy dữ liệu lịch biểu trực quan theo cơ sở và ngày (`GET /api/v1/owner/calendar?facilityId=...&date=yyyy-MM-dd`)**
  - Trả về danh sách các sân thuộc cơ sở cùng toàn bộ `timeSlots`, các slot đang `HOLD` / `BOOKED` (kèm tên khách, SĐT, `bookingCode`) và các khoảng `blocked_slots`.
- [ ] **10.2. API Owner thống kê doanh thu & báo cáo (`GET /api/v1/owner/revenue?from=...&to=...&facilityId=...`)**
  - Tính tổng doanh thu đã thu (`paidAmount`), tổng tiền cọc đã nhận, tổng tiền còn phải thu (`remainingAmount`), tổng số tiền đã hoàn trả (`refundAmount`), thống kê theo cơ sở/sân.
- [ ] **10.3. API Owner lấy số liệu tổng quan cho Dashboard Chủ sân (`GET /api/v1/owner/dashboard/summary`)**
  - Tổng doanh thu tháng, tổng số đơn đặt sân, số lịch đặt sân hôm nay, danh sách đơn đặt sân mới nhất.
- [ ] **10.4. Kết nối giao diện Frontend**
  - Kết nối trang Lịch biểu (`/owner/calendar` — `OwnerCalendarPage.jsx`), trang Doanh thu (`/owner/revenue` — `OwnerRevenuePage.jsx`) và Dashboard Chủ sân (`/owner` — `OwnerDashboardPage.jsx`) với API thật.

---

## NHÓM 4 — PHỐI HỢP CHỦ SÂN (`OWNER`) & QUẢN TRỊ VIÊN (`ADMIN`): ĐÁNH GIÁ, KHIẾU NẠI & TỔNG QUAN

### Bước 11 (`TV2-11`): [CHỦ SÂN & ADMIN] Phản hồi Đánh giá & Kiểm duyệt Đánh giá (`reviews`, `facilities`)

- [ ] **11.1. [Chủ sân] Xem danh sách đánh giá tại các cơ sở của mình & gửi phản hồi (`GET /api/v1/owner/reviews`, `POST /api/v1/owner/reviews/{id}/reply`)**
  - Kiểm tra đánh giá thuộc cơ sở của Owner, cập nhật sub-document `ownerReply: { content, repliedAt: Instant.now() }`.
- [ ] **11.2. [Admin] Xem toàn bộ đánh giá trên sàn & Ẩn/Hiện đánh giá vi phạm (`GET /api/v1/admin/reviews`, `PATCH /api/v1/admin/reviews/{id}/status`)**
  - Khi Admin đổi trạng thái giữa `VISIBLE` và `HIDDEN`, tự động tính lại `avgRating` và `reviewCount` của cơ sở (`facilities`).
- [ ] **11.3. Kết nối giao diện Frontend của Chủ sân & Admin**
  - Kết nối trang Quản lý đánh giá của Chủ sân (`/owner/reviews` — `OwnerReviewsPage.jsx`) và Kiểm duyệt đánh giá của Admin (`/admin/reviews` — `AdminReviewsPage.jsx`) với API thật.

---

### Bước 12 (`TV2-12`): [CHỦ SÂN & ADMIN] Giải trình Khiếu nại & Phân xử Khiếu nại (`complaints`)

- [ ] **12.1. [Chủ sân] Xem danh sách khiếu nại tại cơ sở của mình & gửi phản hồi giải trình (`GET /api/v1/owner/complaints`, `POST /api/v1/owner/complaints/{id}/respond`)**
  - Lưu vào sub-document `ownerResponse: { respondedBy: currentUser.id, content, respondedAt: Instant.now() }`.
  - Nếu khiếu nại đang `OPEN` thì chuyển sang `IN_PROGRESS`.
- [ ] **12.2. [Admin] Xem toàn bộ khiếu nại trên sàn & ra quyết định phân xử (`GET /api/v1/admin/complaints`, `POST /api/v1/admin/complaints/{id}/resolve`)**
  - Lưu vào sub-document `adminResolution: { resolvedBy: adminId, decision, note, resolvedAt: Instant.now() }` và cập nhật `status` (`RESOLVED`, `REJECTED` hoặc `CLOSED`).
- [ ] **12.3. Kết nối giao diện Frontend của Chủ sân & Admin**
  - Kết nối `/owner/complaints` (`OwnerComplaintsPage.jsx`), `/admin/complaints` (`AdminComplaintsPage.jsx`) và `/admin/complaints/:id` (`AdminComplaintDetailPage.jsx`) với API thật.

---

### Bước 13 (`TV2-13`): [ADMIN] Dashboard Thống kê Tổng quan Admin & Cài đặt hệ thống

- [ ] **13.1. API Thống kê tổng quan cho Admin Dashboard (`GET /api/v1/admin/dashboard/summary`)**
  - Đếm tổng số người dùng theo vai trò (`CUSTOMER`, `OWNER`, `ADMIN`), số tài khoản bị khóa (`BANNED`).
  - Đếm số hồ sơ đăng ký Chủ sân đang chờ duyệt (`PENDING`), tổng số môn thể thao (`sports_categories`), cơ sở (`facilities`), sân (`courts`), tổng số đơn đặt sân (`bookings`) và khiếu nại chờ xử lý (`complaints`).
- [ ] **13.2. Kết nối giao diện Frontend**
  - Kết nối trang Admin Dashboard (`/admin` — `AdminDashboardPage.jsx`) và Cài đặt hệ thống (`/admin/settings` — `AdminSettingsPage.jsx`) với API thật.
