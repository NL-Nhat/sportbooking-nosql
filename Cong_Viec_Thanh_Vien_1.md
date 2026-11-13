# PHÂN CÔNG CÔNG VIỆC — THÀNH VIÊN 1
## PHÂN HỆ: TÀI KHOẢN, ĐỐI TÁC CHỦ SÂN, DANH MỤC, CƠ SỞ, SÂN, KHUNG GIỜ & QUY TẮC GIÁ

**Dự án:** Hệ thống Đặt sân Thể thao Trực tuyến (SportBooking)  
**Phạm vi sở hữu độc lập:** **8 / 16 Collections** · **21 Chức năng chính** · **78 Chức năng nhỏ (Micro-features)**  
**Các Collections phụ trách:** `users`, `auth_sessions`, `owner_applications`, `sports_categories`, `facilities`, `courts`, `operating_hours`, `price_rules`

---

## NGUYÊN TẮC LÀM VIỆC ĐỘC LẬP (KHÔNG CHỜ ĐỢI THÀNH VIÊN 2)
1. **Không xung đột code (Zero Merge Conflict):** Thành viên 1 làm việc riêng trên các Controllers, Services, Repositories, DTOs của 8 bảng (`users`, `auth_sessions`, `owner_applications`, `sports_categories`, `facilities`, `courts`, `operating_hours`, `price_rules`). Không đụng vào các file `Booking`, `Payment`, `Review`, `Complaint`, `Favorite`, `Notification` của Thành viên 2.
2. **Luồng nghiệp vụ khép kín:** Thành viên 1 nắm trọn vẹn luồng **Cung ứng & Quản trị nền tảng**: *Người dùng -> Hồ sơ & Phiên đăng nhập -> Đăng ký làm Chủ sân -> Admin duyệt Chủ sân -> Admin tạo Danh mục môn -> Chủ sân tạo Cơ sở -> Chủ sân tạo Sân & Khung giờ cho thuê (`timeSlots`) -> Chủ sân tạo Quy tắc giá -> Khách vãng lai tìm kiếm & xem Cơ sở/Sân*.
3. **Nền tảng đã có sẵn:** Database `sportbooking_db`, 16 Models trong Backend và 4 API Auth cơ bản (`register`, `login`, `refresh`, `logout`) đã hoàn thành, Thành viên 1 có thể bắt tay code ngay từ Bước 1 bên dưới.

---

# PHẦN I: DANH SÁCH CÁC CHỨC NĂNG CHÍNH CẦN LÀM TRƯỚC (THEO THỨ TỰ THỰC HIỆN)

> **Quy tắc thứ tự:** Làm các chức năng nền tảng (Hồ sơ User, Danh mục môn thể thao, Duyệt Chủ sân) trước -> sau đó làm chức năng tạo dữ liệu của Chủ sân (Cơ sở -> Sân -> Khung giờ -> Giá) -> cuối cùng hiển thị và tìm kiếm ra ngoài trang Public.

| Thứ tự | Mã | Chức năng chính (Major Feature) | Vai trò | Collection chính | Trang Frontend kết nối |
| :--: | :--: | :--- | :---: | :--- | :--- |
| **Bước 1** | **M1-01** | **Hoàn thiện Quản lý Hồ sơ cá nhân & Đổi mật khẩu** | Customer / Owner | `users` | `/account/profile`, `/owner/profile` |
| **Bước 2** | **M1-02** | **Quên mật khẩu** | Customer / Guest | `auth_sessions`, `users` | `/account/sessions`, `/forgot-password` |
| **Bước 3** | **M1-03** | **Quản lý Danh mục Môn thể thao (CRUD Categories)** | Admin / Public | `sports_categories` | `/admin/categories` |
| **Bước 4** | **M1-04** | **Khách hàng gửi Hồ sơ Đăng ký trở thành Chủ sân** | Customer | `owner_applications`, `users` | `/account/owner-application` |
| **Bước 5** | **M1-05** | **Admin Xét duyệt / Từ chối Hồ sơ Chủ sân & Cấp quyền `OWNER`** | Admin | `owner_applications`, `users` | `/admin/owner-applications`, `/admin/owner-applications/:id` |
| **Bước 6** | **M1-06** | **Admin Quản lý Danh sách Người dùng & Khóa/Mở khóa tài khoản** | Admin | `users`, `auth_sessions` | `/admin/users` |
| **Bước 7** | **M1-07** | **Chủ sân Quản lý Cơ sở thể thao (Thêm, Sửa, Ẩn/Hiện Cơ sở)** | Owner | `facilities` | `/owner/facilities`, `/owner/facilities/new`, `/owner/facilities/:id/edit` |
| **Bước 8** | **M1-08** | **Chủ sân Quản lý Sân thể thao & Thiết lập Khung giờ cho thuê mẫu (`timeSlots`)** | Owner | `courts`, `operating_hours` | `/owner/courts`, `/owner/courts/new`, `/owner/courts/:id/edit` |
| **Bước 9** | **M1-09** | **Chủ sân Quản lý chuyên sâu Lịch hoạt động theo từng Sân** | Owner | `operating_hours` | `/owner/operating-hours` |
| **Bước 10** | **M1-10** | **Chủ sân Quản lý Quy tắc Giá động theo Thứ / Ngày cụ thể / Giờ** | Owner | `price_rules` | `/owner/pricing`, `/owner/pricing/new` |
| **Bước 11** | **M1-11** | **Tra cứu Công khai: Trang chủ, Danh sách & Chi tiết Cơ sở thể thao** | Guest / Public | `facilities`, `sports_categories`, `courts` | `/`, `/facilities`, `/facilities/:id` |
| **Bước 12** | **M1-12** | **Tra cứu Công khai: Tìm kiếm, Lọc Sân đa tiêu chí & Chi tiết thông tin Sân** | Guest / Public | `courts`, `facilities`, `operating_hours`, `price_rules` | `/search`, `/courts`, `/sports/:code`, `/courts/:id` |
| **Bước 13** | **M1-13** | **Dashboard Tổng quan Admin, Cài đặt Hệ thống & Các trang tĩnh** | Admin / Public | `users`, `owner_applications`, `sports_categories` | `/admin`, `/admin/settings`, `/about`, `/contact`, `/faq`, `/terms`, `/privacy` |

---

# PHẦN II: CHI TIẾT CÁC CHỨC NĂNG NHỎ (MICRO-FEATURES) THEO ĐÚNG THỨ TỰ LÀM TRƯỚC - LÀM SAU

Dưới đây là danh sách toàn bộ các chức năng nhỏ nhất được sắp xếp theo đúng trình tự triển khai từ **Bước 1 đến Bước 13**:

---

## BƯỚC 1 (M1-01): Hoàn thiện Quản lý Hồ sơ cá nhân & Đổi mật khẩu (`users`)
> *Làm đầu tiên vì mọi vai trò sau khi đăng nhập đều cần xem và cập nhật thông tin tài khoản của mình.*

- [ ] **1.1.** API lấy thông tin hồ sơ cá nhân hiện tại (`GET /api/v1/users/me`): Trích xuất `userId` từ JWT Access Token, trả về thông tin đầy đủ (`id`, `fullName`, `email`, `phone`, `avatar`, `address`, `roles`, `ownerStatus`, `status`, `isEmailVerified`).
- [ ] **1.2.** API cập nhật thông tin cá nhân (`PATCH /api/v1/users/me`):
  - Cho phép sửa `fullName`, `phone`, `address` (`street`, `ward`, `district`, `city`).
  - Kiểm tra định dạng số điện thoại và kiểm tra trùng `phone` nếu người dùng đổi sang số điện thoại mới (`409 Conflict`).
  - Không cho phép tự sửa `roles`, `ownerStatus`, `status` qua API này.
- [ ] **1.3.** API upload và cập nhật ảnh đại diện (`POST /api/v1/users/me/avatar` hoặc nhận đường dẫn file upload):
  - Kiểm tra định dạng ảnh (`jpg`, `png`, `webp`) và kích thước <= 5MB.
  - Sinh tên file kèm ký tự định danh duy nhất (`<timestamp>_<randomId>_<fileName>`) lưu vào thư mục upload và cập nhật trường `users.avatar`.
- [ ] **1.4.** API đổi mật khẩu khi đang đăng nhập (`POST /api/v1/auth/change-password`):
  - Kiểm tra mật khẩu hiện tại (`currentPassword`) phải khớp với BCrypt hash trong DB.
  - Kiểm tra mật khẩu mới (`newPassword`) từ 6–72 ký tự và không trùng mật khẩu cũ.
  - Mã hóa BCrypt mật khẩu mới, cập nhật `users.password` và thu hồi các phiên đăng nhập cũ trong `auth_sessions`.
- [ ] **1.5.** Kết nối Frontend trang Hồ sơ khách hàng (`/account/profile`) và Hồ sơ chủ sân (`/owner/profile`) với các API thật ở mục 1.1 – 1.4, xóa dữ liệu mock trong `ProfilePage.jsx` và `OwnerProfilePage.jsx`.

---

## BƯỚC 2 (M1-02): Quên mật khẩu (`auth_sessions`, `users`)

- [ ] **2.6.** API yêu cầu quên mật khẩu (`POST /api/v1/auth/forgot-password`) và đặt lại mật khẩu (`POST /api/v1/auth/reset-password`), kết nối với trang `/forgot-password` (`ForgotPasswordPage.jsx`).

---

## BƯỚC 3 (M1-03): Quản lý Danh mục Môn thể thao (`sports_categories`)
> *Làm trước khi tạo Sân vì mỗi Sân (`courts`) bắt buộc phải chọn một Danh mục môn thể thao (`categoryId`).*

- [ ] **3.1.** API Public lấy danh sách môn thể thao đang hoạt động (`GET /api/v1/categories`):
  - Trả về các môn có `status = "ACTIVE"` để hiển thị ở Trang chủ, Bộ lọc tìm sân và Form tạo sân của Owner.
- [ ] **3.2.** API Admin lấy toàn bộ danh mục môn thể thao (`GET /api/v1/admin/categories`):
  - Hỗ trợ tìm kiếm theo tên/mã (`code`) và lọc theo trạng thái (`ACTIVE`, `INACTIVE`).
- [ ] **3.3.** API Admin thêm môn thể thao mới (`POST /api/v1/admin/categories`):
  - Kiểm tra quyền `ADMIN`.
  - Chuẩn hóa `code` viết hoa (`UPPERCASE`, ví dụ `FOOTBALL`, `BADMINTON`, `TENNIS`, `PICKLEBALL`), kiểm tra trùng `code` (`409 Conflict`).
  - Lưu `name`, `code`, `description`, `icon`, `status = "ACTIVE"`.
- [ ] **3.4.** API Admin cập nhật môn thể thao (`PATCH /api/v1/admin/categories/{id}`) và đổi trạng thái Ẩn/Hiện (`ACTIVE` / `INACTIVE`).
- [ ] **3.5.** Kết nối Frontend trang Quản lý danh mục của Admin (`/admin/categories` — `AdminCategoriesPage.jsx`) với API thật, xóa mock data danh mục.

---

## BƯỚC 4 (M1-04): Khách hàng gửi Hồ sơ Đăng ký trở thành Chủ sân (`owner_applications`, `users`)
> *Làm bước này để tài khoản Customer có thể nộp hồ sơ xin cấp quyền Owner.*

- [ ] **4.1.** API lấy trạng thái và lịch sử hồ sơ đăng ký Chủ sân của tôi (`GET /api/v1/owner-applications/me`):
  - Trả về hồ sơ gần nhất của `userId` hiện tại (kèm trạng thái `PENDING`, `APPROVED`, `REJECTED` và `rejectionReason` nếu bị từ chối).
- [ ] **4.2.** API gửi hồ sơ đăng ký làm Chủ sân (`POST /api/v1/owner-applications`):
  - Kiểm tra điều kiện: User chưa phải là `OWNER` và không có hồ sơ nào đang ở trạng thái `PENDING` (`409 Conflict`).
  - Kiểm tra hợp lệ: `businessName`, `businessAddress`, `contactPhone` bắt buộc; `documents` gồm file ảnh CCCD (`identityCardUrl`) và Giấy phép kinh doanh (`businessLicenseUrl`) đã upload kèm chuỗi định danh duy nhất.
  - Tạo bản ghi `owner_applications` với `status = "PENDING"` và cập nhật đồng thời `users.ownerStatus = "PENDING"`.
- [ ] **4.3.** Kết nối Frontend trang Đăng ký làm Chủ sân (`/account/owner-application` — `OwnerApplicationPage.jsx`) với API thật.

---

## BƯỚC 5 (M1-05): Admin Xét duyệt / Từ chối Hồ sơ Chủ sân (`owner_applications`, `users`)
> *Làm ngay sau Bước 4 để khép kín luồng cấp quyền Chủ sân (Customer -> nộp đơn -> Admin duyệt -> thành Owner).*

- [ ] **5.1.** API Admin lấy danh sách hồ sơ đăng ký Chủ sân (`GET /api/v1/admin/owner-applications`):
  - Hỗ trợ lọc theo `status` (`PENDING`, `APPROVED`, `REJECTED`), tìm kiếm theo tên doanh nghiệp/SĐT, phân trang và đính kèm thông tin tóm tắt của `user` nộp đơn.
- [ ] **5.2.** API Admin xem chi tiết 1 hồ sơ đăng ký Chủ sân (`GET /api/v1/admin/owner-applications/{id}`):
  - Trả về đầy đủ thông tin doanh nghiệp, thông tin tài khoản người nộp và đường dẫn hình ảnh giấy tờ xác minh (`documents`).
- [ ] **5.3.** API Admin **Phê duyệt** hồ sơ Chủ sân (`POST /api/v1/admin/owner-applications/{id}/approve`):
  - Chỉ cho phép duyệt hồ sơ đang ở trạng thái `PENDING`.
  - Cập nhật `owner_applications`: `status = "APPROVED"`, `reviewedBy = adminId`, `reviewedAt = Instant.now()`, `rejectionReason = null`.
  - Cập nhật `users`: Thêm `"OWNER"` vào mảng `roles` (thành `["CUSTOMER", "OWNER"]`) và đặt `ownerStatus = "APPROVED"`.
- [ ] **5.4.** API Admin **Từ chối** hồ sơ Chủ sân (`POST /api/v1/admin/owner-applications/{id}/reject`):
  - Bắt buộc phải nhập lý do từ chối (`rejectionReason`).
  - Cập nhật `owner_applications`: `status = "REJECTED"`, `reviewedBy = adminId`, `reviewedAt = Instant.now()`, lưu `rejectionReason`.
  - Cập nhật `users.ownerStatus = "REJECTED"`.
- [ ] **5.5.** Kết nối Frontend 2 trang của Admin (`/admin/owner-applications` và `/admin/owner-applications/:id`) với API thật.

---

## BƯỚC 6 (M1-06): Admin Quản lý Danh sách Người dùng & Khóa/Mở khóa tài khoản (`users`, `auth_sessions`)
> *Hoàn thiện công cụ quản trị tài khoản người dùng cho Admin.*

- [ ] **6.1.** API Admin lấy danh sách người dùng (`GET /api/v1/admin/users`):
  - Hỗ trợ tìm kiếm theo từ khóa (`fullName`, `email`, `phone`), lọc theo vai trò (`CUSTOMER`, `OWNER`, `ADMIN`), lọc theo trạng thái (`ACTIVE`, `INACTIVE`, `BANNED`), phân trang.
- [ ] **6.2.** API Admin xem chi tiết người dùng (`GET /api/v1/admin/users/{id}`).
- [ ] **6.3.** API Admin khóa hoặc mở khóa tài khoản (`PATCH /api/v1/admin/users/{id}/status`):
  - Không cho phép Admin tự khóa chính mình.
  - Khi chuyển trạng thái sang `"BANNED"` hoặc `"INACTIVE"`, tự động thu hồi toàn bộ các phiên đăng nhập đang hoạt động của user đó trong collection `auth_sessions` (`revokedAt = Instant.now()`).
- [ ] **6.4.** Kết nối Frontend trang Quản lý người dùng (`/admin/users` — `AdminUsersPage.jsx`) với API thật.

---

## BƯỚC 7 (M1-07): Chủ sân Quản lý Cơ sở thể thao (`facilities`)
> *Sau khi có quyền Owner, Chủ sân bắt đầu tạo Cơ sở thể thao (`facilities`) trước khi tạo từng Sân con.*

- [ ] **7.1.** API Owner lấy danh sách cơ sở thuộc quyền sở hữu của mình (`GET /api/v1/owner/facilities`):
  - Chỉ trả về các cơ sở có `ownerId == currentUser.id` (bảo mật chống truy cập chéo dữ liệu của Owner khác).
  - Hỗ trợ tìm kiếm theo tên cơ sở và lọc theo trạng thái (`ACTIVE`, `INACTIVE`, `PENDING_APPROVAL`).
- [ ] **7.2.** API Owner tạo cơ sở thể thao mới (`POST /api/v1/owner/facilities`):
  - Kiểm tra người gọi có role `OWNER`.
  - Validate dữ liệu: `name`, `description`, `address` (`street`, `ward`, `district`, `city`), `location` (`type = "Point"`, `coordinates = [lng, lat]`), danh sách tiện ích `amenities`.
  - Xử lý upload danh sách ảnh cơ sở (`images` với tên file kèm chuỗi định danh duy nhất).
  - Gán `ownerId = currentUser.id`, `avgRating = 0.0`, `reviewCount = 0`, `status = "ACTIVE"`.
- [ ] **7.3.** API Owner xem chi tiết cơ sở của mình (`GET /api/v1/owner/facilities/{id}`) và cập nhật thông tin cơ sở (`PATCH /api/v1/owner/facilities/{id}`).
- [ ] **7.4.** API Owner đổi trạng thái hoạt động của cơ sở (`PATCH /api/v1/owner/facilities/{id}/status` — `ACTIVE` / `INACTIVE`).
- [ ] **7.5.** Kết nối Frontend trang Danh sách cơ sở (`/owner/facilities`) và Form Thêm/Sửa cơ sở (`/owner/facilities/new`, `/owner/facilities/:id/edit`) với API thật.

---

## BƯỚC 8 (M1-08): Chủ sân Quản lý Sân thể thao & Thiết lập Khung giờ cho thuê (`courts`, `operating_hours`)
> *Sau khi có Cơ sở (`facilities`) và Danh mục môn (`sports_categories`), Chủ sân tạo Sân (`courts`) kèm danh sách khung giờ cho thuê trong ngày (`timeSlots`).*

- [ ] **8.1.** API Owner lấy danh sách các sân thuộc quyền sở hữu của mình (`GET /api/v1/owner/courts`):
  - Lọc theo cơ sở (`facilityId`), lọc theo môn thể thao (`categoryId`), lọc theo trạng thái (`ACTIVE`, `MAINTENANCE`, `INACTIVE`), tìm kiếm theo tên sân.
- [ ] **8.2.** API Owner tạo sân mới kèm khung giờ cho thuê mẫu (`POST /api/v1/owner/courts`):
  - Kiểm tra `facilityId` phải thuộc quyền sở hữu của `currentUser.id` và `categoryId` phải tồn tại, đang `ACTIVE`.
  - Lưu thông tin sân vào collection `courts`: `facilityId`, `categoryId`, `name`, `description`, `attributes` (`surface`, `size`, `indoor`, `lighting`), `capacity`, danh sách ảnh `images` (upload file kèm định danh), `status = "ACTIVE"`.
  - **Lưu đồng thời cấu hình khung giờ cho thuê trong ngày vào collection `operating_hours`**:
    - Nhận mảng `timeSlots` (ví dụ: `[{ startTime: "06:00", endTime: "07:00" }, { startTime: "14:00", endTime: "16:00" }]`).
    - Kiểm tra định dạng giờ `HH:mm`, `startTime < endTime`, và kiểm tra các khung giờ trong cùng 1 ngày không bị chồng lấn nhau.
    - Lưu vào `operating_hours` với `courtId` vừa tạo, `scheduleType = "DAILY"` (áp dụng mẫu khung giờ này cho mọi ngày tiếp theo), `status = "ACTIVE"`.
- [ ] **8.3.** API Owner xem chi tiết sân kèm `timeSlots` (`GET /api/v1/owner/courts/{id}`) và cập nhật thông tin sân + cập nhật danh sách khung giờ cho thuê (`PATCH /api/v1/owner/courts/{id}`).
- [ ] **8.4.** API Owner đổi trạng thái sân nhanh (`PATCH /api/v1/owner/courts/{id}/status` — `ACTIVE`, `MAINTENANCE`, `INACTIVE`).
- [ ] **8.5.** Kết nối Frontend trang Danh sách sân (`/owner/courts`) và Form Thêm/Sửa sân kèm khung giờ (`/owner/courts/new`, `/owner/courts/:id/edit`) với API thật.

---

## BƯỚC 9 (M1-09): Chủ sân Quản lý chuyên sâu Lịch hoạt động theo từng Sân (`operating_hours`)
> *Cho phép Chủ sân xem và chỉnh sửa nhanh cấu hình `operating_hours` (`effectiveFrom`, `effectiveTo`, `timeSlots`) của bất kỳ sân nào.*

- [ ] **9.1.** API lấy cấu hình lịch hoạt động của một sân (`GET /api/v1/owner/courts/{courtId}/operating-hours`).
- [ ] **9.2.** API cập nhật cấu hình lịch hoạt động của sân (`PUT /api/v1/owner/courts/{courtId}/operating-hours`):
  - Cập nhật `effectiveFrom`, `effectiveTo`, `status` và danh sách `timeSlots` (`startTime`, `endTime`).
  - Kiểm tra không cho phép 2 khung giờ trong `timeSlots` giao nhau.
- [ ] **9.3.** Kết nối Frontend trang Lịch hoạt động (`/owner/operating-hours` — `OwnerOperatingHoursPage.jsx`) với API thật.

---

## BƯỚC 10 (M1-10): Chủ sân Quản lý Quy tắc Giá động (`price_rules`)
> *Sau khi Sân đã có các khung giờ hoạt động, Chủ sân cấu hình bảng giá theo giờ thường / giờ vàng / cuối tuần / ngày lễ.*

- [ ] **10.1.** API Owner lấy danh sách quy tắc giá theo sân (`GET /api/v1/owner/price-rules?courtId=...`):
  - Kiểm tra sân thuộc quyền sở hữu của Owner, lọc theo trạng thái (`ACTIVE`, `INACTIVE`), sắp xếp theo `priority` giảm dần.
- [ ] **10.2.** API Owner tạo quy tắc giá mới (`POST /api/v1/owner/price-rules`):
  - Validate dữ liệu: `courtId`, `name`, `startTime`, `endTime` (`startTime < endTime`), `pricePerSlot` (`BigDecimal` > 0, lưu kiểu `DECIMAL128`), `daysOfWeek` (`1..7`), `specificDates` (`yyyy-MM-dd`), `validFrom`, `validTo`, `priority`.
- [ ] **10.3.** API Owner cập nhật quy tắc giá (`PATCH /api/v1/owner/price-rules/{id}`), bật/tắt trạng thái (`ACTIVE` / `INACTIVE`) và xóa quy tắc giá (`DELETE /api/v1/owner/price-rules/{id}`).
- [ ] **10.4.** Viết hàm tính giá chuẩn (Pricing Engine Helper) dùng chung: Với một `(courtId, slotDate, startTime, endTime)`, tự động tìm quy tắc giá `ACTIVE` khớp điều kiện có ưu tiên cao nhất (`specificDates` -> `daysOfWeek` -> `priority` lớn nhất).
- [ ] **10.5.** Kết nối Frontend trang Danh sách quy tắc giá (`/owner/pricing`) và Form Tạo quy tắc giá (`/owner/pricing/new`) với API thật.

---

## BƯỚC 11 (M1-11): Tra cứu Công khai — Trang chủ, Danh sách & Chi tiết Cơ sở (`facilities`, `sports_categories`, `courts`)
> *Đưa dữ liệu Danh mục, Cơ sở và Sân đã tạo ở các bước trên ra giao diện công khai cho khách hàng tìm kiếm.*

- [ ] **11.1.** API Public lấy danh sách cơ sở thể thao (`GET /api/v1/facilities`):
  - Chỉ lấy các cơ sở có `status = "ACTIVE"`.
  - Hỗ trợ tìm kiếm theo từ khóa (`name`, `address.street`, `address.district`, `address.city`), lọc theo quận/huyện (`district`), lọc theo môn thể thao có tại cơ sở (`categoryId`), lọc theo tiện ích (`amenity`), sắp xếp theo `avgRating` hoặc mới nhất, phân trang.
- [ ] **11.2.** API Public xem chi tiết một cơ sở thể thao (`GET /api/v1/facilities/{id}`):
  - Trả về thông tin cơ sở, danh sách ảnh, tiện ích, tọa độ vị trí và danh sách các sân con (`courts` đang `ACTIVE`) thuộc cơ sở đó kèm giá tham khảo.
- [ ] **11.3.** Kết nối Frontend Trang chủ (`/` — `HomePage.jsx`), Trang danh sách cơ sở (`/facilities` — `FacilityListPage.jsx`) và Trang chi tiết cơ sở (`/facilities/:id` — `FacilityDetailPage.jsx`) với API thật.

---

## BƯỚC 12 (M1-12): Tra cứu Công khai — Tìm kiếm, Lọc Sân & Chi tiết thông tin Sân (`courts`, `operating_hours`, `price_rules`)
> *Hoàn thiện công cụ tìm kiếm sân đa tiêu chí và hiển thị thông tin chi tiết sân.*

- [ ] **12.1.** API Public tìm kiếm và lọc sân thể thao (`GET /api/v1/courts`):
  - Hỗ trợ lọc theo `keyword` (tên sân, tên cơ sở, địa chỉ), `categoryId` / `sportCode`, `facilityId`, `district`, `city`, khoảng giá (`minPrice`, `maxPrice`), sắp xếp và phân trang.
  - Đính kèm thông tin cơ sở (`facilityName`, `address`, `avgRating`), thông tin môn thể thao (`categoryName`) và mức giá thấp nhất/mặc định từ `price_rules`.
- [ ] **12.2.** API Public xem thông tin chi tiết sân (`GET /api/v1/courts/{id}`):
  - Trả về thông tin sân (`name`, `description`, `attributes`, `capacity`, `images`), thông tin cơ sở trực thuộc, danh mục môn, cấu hình `operating_hours` và bảng giá `price_rules`.
- [ ] **12.3.** Kết nối Frontend các trang Tìm kiếm sân (`/search` — `SearchPage.jsx`), Danh sách sân theo môn (`/courts`, `/sports/:code` — `CategoryCourtsPage.jsx`) và phần thông tin sân trên trang Chi tiết sân (`/courts/:id` — `CourtDetailPage.jsx`) với API thật.

---

## BƯỚC 13 (M1-13): Dashboard Tổng quan Admin, Cài đặt Hệ thống & Các trang tĩnh
> *Bước hoàn thiện cuối cùng của Thành viên 1 để tổng hợp số liệu quản trị.*

- [ ] **13.1.** API Thống kê tổng quan cho Admin Dashboard (`GET /api/v1/admin/dashboard/summary`):
  - Đếm tổng số người dùng theo vai trò (`CUSTOMER`, `OWNER`, `ADMIN`), số tài khoản bị khóa (`BANNED`).
  - Đếm số hồ sơ đăng ký Chủ sân đang chờ duyệt (`PENDING`), đã duyệt (`APPROVED`), từ chối (`REJECTED`).
  - Đếm tổng số danh mục môn thể thao (`sports_categories`), tổng số cơ sở (`facilities`) và sân (`courts`) đang hoạt động trên sàn.
  - Trả về danh sách 5 hồ sơ đăng ký Chủ sân mới nhất đang chờ duyệt.
- [ ] **13.2.** Kết nối Frontend trang Admin Dashboard (`/admin` — `AdminDashboardPage.jsx`) với API thật.
- [ ] **13.3.** Rà soát và hoàn thiện trang Cài đặt hệ thống (`/admin/settings`) và biểu mẫu gửi liên hệ tại trang `/contact` (`ContactPage.jsx`).

