# PHÂN CÔNG CÔNG VIỆC — THÀNH VIÊN 1
## PHÂN HỆ: KHÁCH VÃNG LAI (GUEST), KHÁCH HÀNG ĐẶT SÂN (CUSTOMER) & CÁC CHỨC NĂNG ĐỘC LẬP DÙNG CHUNG

**Dự án:** Hệ thống Đặt sân Thể thao Trực tuyến (SportBooking)  
**Vai trò phụ trách chính:** **Khách vãng lai (`GUEST / PUBLIC`)** + **Khách hàng / Người đặt sân (`CUSTOMER`)**  
**Chức năng độc lập nhận thêm để cân bằng khối lượng với Thành viên 2:**
1. **Hồ sơ cá nhân, Upload Avatar & Đổi mật khẩu dùng chung** (dùng cho cả Khách hàng, Chủ sân và Admin).
2. **Hệ thống Chuông Thông báo (`notifications`) dùng chung** trên toàn hệ thống.
3. **Tác vụ tự động giải phóng chỗ giữ quá hạn 1 giờ (`HOLD -> EXPIRED`)**.

---

## 1. TỔNG QUAN PHẠM VI CỦA THÀNH VIÊN 1

| Nhóm người dùng / Phân hệ | Các chức năng chính Thành viên 1 đảm nhận | Giao diện Frontend (`route`) |
| :--- | :--- | :--- |
| **1. Khách vãng lai (`GUEST / PUBLIC`)** | - Quên mật khẩu & Đặt lại mật khẩu<br>- Xem Trang chủ, Danh mục môn thể thao đang hoạt động<br>- Tra cứu Danh sách Cơ sở & Xem Chi tiết Cơ sở thể thao<br>- Tìm kiếm, Lọc Sân đa tiêu chí & Xem Chi tiết Sân<br>- Xem Bảng khung giờ trống & giá tiền theo ngày trên trang Chi tiết sân<br>- Các trang tĩnh (Giới thiệu, Liên hệ, FAQ, Điều khoản, Chính sách) | `/`, `/forgot-password`, `/facilities`, `/facilities/:id`, `/search`, `/courts`, `/sports/:code`, `/courts/:id`, `/contact`, `/about`, `/faq`, `/terms`, `/privacy` |
| **2. Khách hàng — Người đặt sân (`CUSTOMER`)** | - Chọn nhiều khung giờ trống & Tạo đơn Giữ chỗ 1 giờ (`HOLD`)<br>- Thanh toán 100% hoặc Đặt cọc 20% (`payments`)<br>- Xem Lịch sử đặt sân, Thanh toán nốt 80% & Hủy lịch (Hoàn tiền nếu hủy trước `>= 24h`)<br>- Viết Đánh giá sân sau khi chơi xong (`reviews`) & Xem đánh giá của tôi<br>- Gửi Khiếu nại về đơn đặt sân (`complaints`) & Xem lịch sử khiếu nại<br>- Quản lý danh sách Cơ sở & Sân Yêu thích (`favorites`)<br>- Gửi Hồ sơ đăng ký trở thành Chủ sân (`owner_applications`)<br>- Trang Tổng quan tài khoản khách hàng | `/checkout/:courtId`, `/payment/:bookingId`, `/payment-result/:bookingId`, `/account`, `/account/bookings`, `/account/bookings/:id`, `/account/reviews`, `/account/reviews/new/:bookingId`, `/account/complaints`, `/account/complaints/new`, `/account/complaints/:id`, `/account/favorites`, `/account/owner-application` |
| **3. Chức năng Độc lập (Nhận thêm để cân bằng việc với TV2)** | - **Xem & Cập nhật Hồ sơ cá nhân, Upload Avatar, Đổi mật khẩu** (dùng chung choทั้ง Customer & Owner)<br>- **Hệ thống Thông báo (`notifications`) & Chuông thông báo Header**<br>- **Job tự động nhả khung giờ giữ chỗ quá 1 giờ (`HOLD -> EXPIRED`)** | `/account/profile`, `/owner/profile`, `/account/notifications`, Header Bell Badge |

> **Làm việc độc lập không cần chờ Thành viên 2:** Trong database `sportbooking_db` đã có sẵn đầy đủ dữ liệu mẫu của `sports_categories`, `facilities`, `courts`, `operating_hours`, `price_rules`, `blocked_slots` (từ `HuongdantaoDB.md`), nên Thành viên 1 có thể code và test ngay toàn bộ luồng Tìm kiếm sân -> Xem giờ trống -> Đặt sân -> Thanh toán mà **không cần đợi** Thành viên 2 làm xong màn hình CRUD của Chủ sân hay Admin.

---

# PHẦN I: LỘ TRÌNH CÁC CHỨC NĂNG CHÍNH CẦN LÀM TRƯỚC — LÀM SAU

> **Thứ tự thực hiện:** Làm các chức năng **Tài khoản độc lập** trước -> làm phần **Khách vãng lai tra cứu Cơ sở, Sân & Khung giờ trống** -> làm luồng cốt lõi của **Khách hàng Đặt sân, Giữ chỗ 1h, Thanh toán & Hủy lịch** -> làm các chức năng **Đánh giá, Khiếu nại, Yêu thích, Đăng ký Chủ sân & Thông báo**.

| Thứ tự | Mã | Loại người dùng | Tên chức năng chính | Collection tác động | Trang Frontend |
| :--: | :--: | :---: | :--- | :--- | :--- |
| **Bước 1** | **TV1-01** | **Độc lập / Dùng chung** | **Quản lý Hồ sơ cá nhân, Upload Avatar, Đổi mật khẩu & Quên mật khẩu** | `users`, `auth_sessions` | `/account/profile`, `/owner/profile`, `/forgot-password` |
| **Bước 2** | **TV1-02** | **Khách vãng lai (`GUEST`)** | **Trang chủ, Tra cứu Danh sách & Chi tiết Cơ sở thể thao** | `facilities`, `sports_categories`, `courts` | `/`, `/facilities`, `/facilities/:id` |
| **Bước 3** | **TV1-03** | **Khách vãng lai (`GUEST`)** | **Tìm kiếm, Lọc Sân đa tiêu chí & Xem thông tin Chi tiết Sân** | `courts`, `facilities`, `operating_hours`, `price_rules` | `/search`, `/courts`, `/sports/:code`, `/courts/:id` |
| **Bước 4** | **TV1-04** | **Khách vãng lai / Khách hàng** | **Kiểm tra & Hiển thị Bảng Khung giờ trống của Sân theo Ngày** | `operating_hours`, `price_rules`, `blocked_slots`, `booking_slots` | `/courts/:id` (Bảng chọn khung giờ) |
| **Bước 5** | **TV1-05** | **Khách hàng (`CUSTOMER`)** | **Chọn nhiều khung giờ, Nhập thông tin & Tạo đơn Giữ chỗ 1 giờ (`HOLD`)** | `bookings`, `booking_slots` | `/checkout/:courtId` |
| **Bước 6** | **TV1-06** | **Khách hàng (`CUSTOMER`)** | **Thanh toán 100% hoặc Đặt cọc 20% & Xác nhận Đơn đặt sân (`CONFIRMED`)** | `payments`, `bookings`, `booking_slots` | `/payment/:bookingId`, `/payment-result/:bookingId` |
| **Bước 7** | **TV1-07** | **Khách hàng (`CUSTOMER`)** | **Lịch sử Đặt sân, Thanh toán nốt 80% & Hủy lịch (Quy tắc hoàn tiền 24h)** | `bookings`, `booking_slots`, `payments` | `/account/bookings`, `/account/bookings/:id` |
| **Bước 8** | **TV1-08** | **Độc lập / Hệ thống** | **Tự động Giải phóng Chỗ giữ quá hạn 1 giờ (`HOLD` -> `EXPIRED`)** | `bookings`, `booking_slots` | Background Job (`@Scheduled`) |
| **Bước 9** | **TV1-09** | **Khách hàng (`CUSTOMER`)** | **Khách hàng Viết Đánh giá Sân sau khi chơi & Xem Đánh giá** | `reviews`, `facilities`, `bookings` | `/account/reviews/new/:bookingId`, `/account/reviews`, `/courts/:id` |
| **Bước 10** | **TV1-10** | **Khách hàng (`CUSTOMER`)** | **Khách hàng Gửi Khiếu nại Đơn đặt sân & Theo dõi Khiếu nại** | `complaints`, `bookings` | `/account/complaints/new`, `/account/complaints`, `/account/complaints/:id` |
| **Bước 11** | **TV1-11** | **Khách hàng (`CUSTOMER`)** | **Khách hàng Gửi Hồ sơ Đăng ký trở thành Chủ sân** | `owner_applications`, `users` | `/account/owner-application` |
| **Bước 12** | **TV1-12** | **Khách hàng (`CUSTOMER`)** | **Quản lý Danh sách Cơ sở & Sân Yêu thích** | `favorites` | `/account/favorites`, `/facilities/:id`, `/courts/:id` |
| **Bước 13** | **TV1-13** | **Độc lập / Khách hàng** | **Hệ thống Thông báo, Tổng quan Tài khoản & Các trang tĩnh** | `notifications`, `bookings`, `favorites` | `/account/notifications`, `/account`, `/contact` |

---

# PHẦN II: DANH SÁCH CHI TIẾT CÁC CHỨC NĂNG NHỎ (THEO TỪNG LOẠI NGƯỜI DÙNG & THỨ TỰ LÀM)

---

## NHÓM 1 — CHỨC NĂNG ĐỘC LẬP VỀ TÀI KHOẢN (Cân bằng khối lượng công việc)

### Bước 1 (`TV1-01`): Quản lý Hồ sơ cá nhân, Đổi mật khẩu & Quên mật khẩu (`users`, `auth_sessions`)
> *Đây là nhóm chức năng hoàn toàn độc lập, làm đầu tiên để dùng chung cho mọi tài khoản sau khi đăng nhập.*

- [ ] **1.1. Xem thông tin hồ sơ cá nhân hiện tại (`GET /api/v1/users/me`)**
  - Lấy `userId` từ JWT Access Token, trả về thông tin đầy đủ (`id`, `fullName`, `email`, `phone`, `avatar`, `address`, `roles`, `ownerStatus`, `status`).
- [ ] **1.2. Cập nhật thông tin cá nhân (`PATCH /api/v1/users/me`)**
  - Cho phép sửa `fullName`, `phone`, `address` (`street`, `ward`, `district`, `city`).
  - Kiểm tra định dạng SĐT và kiểm tra trùng số điện thoại (`409 Conflict`) nếu người dùng đổi sang số mới.
- [ ] **1.3. Upload và cập nhật ảnh đại diện (`POST /api/v1/users/me/avatar`)**
  - Kiểm tra định dạng ảnh (`jpg`, `png`, `webp`) <= 5MB, sinh tên file kèm chuỗi định danh duy nhất và lưu vào `users.avatar`.
- [ ] **1.4. Đổi mật khẩu khi đang đăng nhập (`POST /api/v1/auth/change-password`)**
  - Kiểm tra `currentPassword` khớp với BCrypt hash trong DB, kiểm tra `newPassword` (6–72 ký tự), mã hóa BCrypt mật khẩu mới và thu hồi các phiên cũ trong `auth_sessions`.
- [ ] **1.5. Quên mật khẩu & Đặt lại mật khẩu cho Khách vãng lai (`POST /api/v1/auth/forgot-password`, `POST /api/v1/auth/reset-password`)**
- [ ] **1.6. Kết nối giao diện Frontend**
  - Kết nối trang Hồ sơ khách hàng (`/account/profile` — `ProfilePage.jsx`), Hồ sơ chủ sân (`/owner/profile` — `OwnerProfilePage.jsx`) và Quên mật khẩu (`/forgot-password` — `ForgotPasswordPage.jsx`) với API thật, xóa mock data.

---

## NHÓM 2 — PHÂN HỆ KHÁCH VÃNG LAI (`GUEST / PUBLIC`)

### Bước 2 (`TV1-02`): [KHÁCH VÃNG LAI] Trang chủ, Danh sách & Chi tiết Cơ sở thể thao (`facilities`, `sports_categories`, `courts`)
> *Giúp khách vãng lai khám phá danh mục môn thể thao và các cơ sở thể thao trên sàn.*

- [ ] **2.1. API Public lấy danh sách môn thể thao đang hoạt động (`GET /api/v1/categories`)**
  - Trả về các môn có `status = "ACTIVE"` để hiển thị ở Trang chủ và thanh bộ lọc tìm kiếm.
- [ ] **2.2. API Public lấy danh sách cơ sở thể thao (`GET /api/v1/facilities`)**
  - Chỉ lấy các cơ sở có `status = "ACTIVE"`.
  - Hỗ trợ tìm kiếm theo từ khóa (`name`, `address`), lọc theo quận/huyện (`district`), lọc theo môn thể thao (`categoryId`), lọc theo tiện ích (`amenity`), sắp xếp theo `avgRating` và phân trang.
- [ ] **2.3. API Public xem chi tiết một cơ sở thể thao (`GET /api/v1/facilities/{id}`)**
  - Trả về thông tin chi tiết cơ sở, danh sách ảnh, tiện ích, tọa độ vị trí và danh sách các sân con (`courts` đang `ACTIVE`) thuộc cơ sở đó.
- [ ] **2.4. Kết nối giao diện Frontend**
  - Kết nối Trang chủ (`/` — `HomePage.jsx`), Danh sách cơ sở (`/facilities` — `FacilityListPage.jsx`) và Chi tiết cơ sở (`/facilities/:id` — `FacilityDetailPage.jsx`) với API thật.

---

### Bước 3 (`TV1-03`): [KHÁCH VÃNG LAI] Tìm kiếm, Lọc Sân đa tiêu chí & Xem thông tin Chi tiết Sân (`courts`, `operating_hours`, `price_rules`)

- [ ] **3.1. API Public tìm kiếm và lọc sân thể thao (`GET /api/v1/courts`)**
  - Hỗ trợ lọc theo `keyword` (tên sân, tên cơ sở, địa chỉ), `categoryId` / `sportCode`, `facilityId`, `district`, `city`, khoảng giá (`minPrice`, `maxPrice`), sắp xếp và phân trang.
  - Đính kèm thông tin cơ sở (`facilityName`, `address`, `avgRating`), môn thể thao (`categoryName`) và mức giá tham khảo từ `price_rules`.
- [ ] **3.2. API Public xem thông tin chi tiết một sân (`GET /api/v1/courts/{id}`)**
  - Trả về thông tin sân (`name`, `description`, `attributes`, `capacity`, `images`), thông tin cơ sở trực thuộc, danh mục môn, cấu hình `operating_hours` và bảng giá `price_rules`.
- [ ] **3.3. Kết nối giao diện Frontend**
  - Kết nối trang Tìm kiếm sân (`/search` — `SearchPage.jsx`), Danh sách sân theo môn (`/courts`, `/sports/:code` — `CategoryCourtsPage.jsx`) và thông tin sân trên trang Chi tiết sân (`/courts/:id` — `CourtDetailPage.jsx`) với API thật.

---

### Bước 4 (`TV1-04`): [KHÁCH VÃNG LAI / KHÁCH HÀNG] Kiểm tra & Hiển thị Bảng Khung giờ trống theo Ngày (`booking_slots`, `blocked_slots`)
> *Bước chuyển tiếp từ Khách vãng lai xem sân sang Khách hàng chọn khung giờ để đặt sân.*

- [ ] **4.1. API Public lấy trạng thái các khung giờ của sân theo ngày (`GET /api/v1/courts/{courtId}/availability?date=yyyy-MM-dd`)**
  - Đọc danh sách `timeSlots` mẫu trong ngày từ collection `operating_hours` của `courtId`.
  - Đối chiếu từng khung giờ với `blocked_slots` (giờ khóa bảo trì) và `booking_slots` (các slot có `slotDate == date` và `status` thuộc `["HOLD", "BOOKED"]`, bỏ qua các slot `HOLD` đã quá hạn `expiresAt < now`).
  - Tính đơn giá của từng khung giờ theo `price_rules` của sân trong ngày `date` (ưu tiên `specificDates` -> `daysOfWeek` -> `priority` cao nhất).
  - Trả về danh sách các slot gồm: `startTime`, `endTime`, `startAt`, `endAt`, `slotLabel`, `price` (`BigDecimal`), và `availabilityStatus` (`AVAILABLE`, `HOLD`, `BOOKED`, `BLOCKED`).
- [ ] **4.2. Kết nối khu vực chọn ngày & chọn nhiều khung giờ trên trang Chi tiết sân (`/courts/:id` — `CourtDetailPage.jsx`)**
  - Cho phép người dùng chọn 1 hoặc **nhiều khung giờ trống** trong ngày và bấm chuyển sang trang Đặt sân (`/checkout/:courtId`).

---

## NHÓM 3 — PHÂN HỆ KHÁCH HÀNG / NGƯỜI ĐẶT SÂN (`CUSTOMER`)

### Bước 5 (`TV1-05`): [KHÁCH HÀNG] Nhập thông tin & Tạo đơn Giữ chỗ 1 giờ — `HOLD` (`bookings`, `booking_slots`)
> *Khi khách chọn các khung giờ và bấm "Đến thanh toán", hệ thống tạo đơn ở trạng thái Giữ chỗ (`HOLD`) trong 1 giờ.*

- [ ] **5.1. Hoàn thiện giao diện trang Xác nhận thông tin đặt sân (`/checkout/:courtId` — `CheckoutPage.jsx`)**
  - Hiển thị danh sách các khung giờ khách đã chọn, tự động điền sẵn Họ tên và Số điện thoại từ tài khoản đang đăng nhập.
  - Ở bước này chỉ nhập thông tin cá nhân (`contactName`, `contactPhone`) và ghi chú (`note`), chưa chọn phương thức thanh toán (việc chọn Thanh toán 100% hay Đặt cọc 20% nằm ở màn hình Thanh toán tiếp theo).
- [ ] **5.2. API Khách hàng tạo đơn đặt sân và khóa giữ chỗ 1 giờ (`POST /api/v1/bookings`)**
  - Tính lại giá từng khung giờ ở Backend từ `price_rules`:
    - `subtotalAmount` = tổng `finalPrice` của tất cả các `items`.
    - `totalAmount = subtotalAmount`.
    - Tiền cọc bắt buộc 20%: `depositRequired = totalAmount * 0.20`.
  - Thiết lập thời hạn giữ chỗ 1 giờ: `holdExpiresAt = Instant.now().plusSeconds(3600)`.
  - **Chống đặt trùng lịch (Double-Booking Prevention)**:
    - Tạo các bản ghi trong `booking_slots` cho từng khung giờ với `status = "HOLD"`, `expiresAt = holdExpiresAt`.
    - Nếu khung giờ vừa có người khác giữ hoặc đặt, Unique Partial Index `uniq_active_court_slot` trên `(courtId, slotDate, startAt)` sẽ chặn ngay và trả về lỗi `409 Conflict`.
  - Lưu document `bookings` với mã `bookingCode` duy nhất, `status = "HOLD"`, `paymentStatus = "UNPAID"`, `paidAmount = 0`, `remainingAmount = totalAmount`, `holdExpiresAt`.
- [ ] **5.3. Kết nối nút "Đến thanh toán" trên `CheckoutPage.jsx`**
  - Gọi `POST /api/v1/bookings` và điều hướng sang `/payment/:bookingId`.

---

### Bước 6 (`TV1-06`): [KHÁCH HÀNG] Thanh toán 100% hoặc Đặt cọc 20% & Xác nhận Đơn (`payments`, `bookings`, `booking_slots`)
> *Hoàn tất thanh toán trong thời gian giữ chỗ 1 giờ để chuyển đơn từ `HOLD` sang `CONFIRMED` và khóa cứng lịch `BOOKED`.*

- [ ] **6.1. API lấy thông tin đơn đặt sân để thanh toán (`GET /api/v1/bookings/{id}`)**
  - Kiểm tra đơn thuộc về `currentUser.id` và kiểm tra đơn còn trong thời hạn giữ chỗ `holdExpiresAt`.
- [ ] **6.2. Giao diện màn hình Thanh toán (`/payment/:bookingId` — `PaymentPage.jsx`)**
  - Hiển thị đồng hồ đếm ngược thời gian giữ chỗ 1 giờ (`holdExpiresAt`).
  - Chỉ hiển thị 2 lựa chọn thanh toán rõ ràng:
    1. **Thanh toán 100% (`FULL_PAYMENT`)**: Thanh toán toàn bộ `totalAmount`.
    2. **Đặt cọc 20% (`DEPOSIT_20_PERCENT`)**: Thanh toán trước 20% (`depositRequired`), 80% còn lại thanh toán sau.
- [ ] **6.3. API xác nhận thanh toán đơn đặt sân (`POST /api/v1/bookings/{id}/payments`)**
  - Nhận lựa chọn `paymentOption` (`"FULL_PAYMENT"` hoặc `"DEPOSIT_20_PERCENT"`).
  - Nếu `"DEPOSIT_20_PERCENT"`: tạo bản ghi `payments` (`type = "DEPOSIT"`, `amount = depositRequired`, `status = "PAID"`), cập nhật `booking.paidAmount = depositRequired`, `remainingAmount = totalAmount - depositRequired`, `paymentStatus = "PARTIALLY_PAID"`.
  - Nếu `"FULL_PAYMENT"`: tạo bản ghi `payments` (`type = "FULL"`, `amount = totalAmount`, `status = "PAID"`), cập nhật `booking.paidAmount = totalAmount`, `remainingAmount = 0`, `paymentStatus = "PAID"`.
  - Cập nhật trạng thái đơn `booking.status = "CONFIRMED"`, `confirmedAt = Instant.now()`.
  - Cập nhật toàn bộ các slot của đơn trong `booking_slots` từ `"HOLD"` sang **`"BOOKED"`** (`expiresAt = null`).
- [ ] **6.4. Kết nối giao diện Frontend**
  - Kết nối `PaymentPage.jsx` và trang Kết quả thanh toán (`/payment-result/:bookingId` — `PaymentResultPage.jsx`) với API thật.

---

### Bước 7 (`TV1-07`): [KHÁCH HÀNG] Lịch sử Đặt sân, Trả nốt 80% & Hủy lịch theo Quy tắc 24h (`bookings`, `booking_slots`, `payments`)

- [ ] **7.1. API lấy danh sách đơn đặt sân của tôi (`GET /api/v1/bookings/me`)**
  - Lọc theo `status` (`HOLD`, `CONFIRMED`, `COMPLETED`, `CANCELLED`, `EXPIRED`), tìm kiếm theo `bookingCode`, sắp xếp mới nhất lên đầu, phân trang.
- [ ] **7.2. API xem chi tiết đơn đặt sân kèm lịch sử các lần thanh toán (`GET /api/v1/bookings/{id}`)**
- [ ] **7.3. API Khách hàng thanh toán nốt 80% còn lại (`POST /api/v1/bookings/{id}/pay-remaining`)**
  - Tạo bản ghi `payments` mới (`type = "REMAINING"`, `amount = remainingAmount`, `status = "PAID"`).
  - Cập nhật `booking.paidAmount = totalAmount`, `remainingAmount = 0`, `paymentStatus = "PAID"`.
- [ ] **7.4. API Khách hàng hủy đơn đặt sân (`POST /api/v1/bookings/{id}/cancel`)**
  - Chỉ cho phép hủy khi đơn đang `HOLD` hoặc `CONFIRMED`.
  - **Áp dụng quy tắc hoàn tiền 24 giờ** (so với thời điểm bắt đầu sớm nhất `earliestStartAt` trong đơn):
    - Nếu hủy trước giờ chơi **>= 24 giờ** và `paidAmount > 0`: Hoàn lại 100% số tiền đã trả (`isRefundEligible = true`, `refundAmount = paidAmount`), tạo bản ghi `payments` (`type = "REFUND"`, `status = "REFUNDED"`), cập nhật `booking.paymentStatus = "REFUNDED"`.
    - Nếu hủy **< 24 giờ** trước giờ chơi: Không hoàn lại tiền đã cọc (`isRefundEligible = false`, `refundAmount = 0`).
  - Cập nhật `booking.status = "CANCELLED"`, `cancelledBy = "CUSTOMER"`, `cancelledAt = Instant.now()`, lưu `cancelReason`.
  - **Giải phóng khung giờ ngay lập tức**: Chuyển toàn bộ `booking_slots` của đơn sang `status = "RELEASED"` để khách khác có thể đặt lại.
- [ ] **7.5. Kết nối giao diện Frontend**
  - Kết nối trang Lịch sử đặt sân (`/account/bookings` — `BookingsPage.jsx`) và Chi tiết đơn (`/account/bookings/:id` — `BookingDetailPage.jsx`) với API thật.

---

### Bước 8 (`TV1-08`): [ĐỘC LẬP / HỆ THỐNG] Tự động Giải phóng Chỗ giữ quá hạn 1 giờ (`HOLD` -> `EXPIRED`)

- [ ] **8.1. Tác vụ tự động giải phóng đơn giữ chỗ quá hạn (`@Scheduled(fixedDelay = 60000)`)**
  - Quét các đơn có `status == "HOLD"` và `holdExpiresAt < Instant.now()`.
  - Chuyển `bookings.status = "EXPIRED"` và chuyển toàn bộ `booking_slots` tương ứng sang `status = "EXPIRED"` để mở khóa khung giờ cho người khác đặt.

---

### Bước 9 (`TV1-09`): [KHÁCH HÀNG] Viết Đánh giá Sân sau khi chơi & Xem danh sách Đánh giá (`reviews`, `facilities`)

- [ ] **9.1. API Khách hàng tạo đánh giá mới (`POST /api/v1/reviews`)**
  - Kiểm tra đơn `bookingId` thuộc về `currentUser.id`, có `status == "COMPLETED"`, và chưa từng được đánh giá (`409 Conflict` nếu đánh giá lần 2).
  - Lưu `rating` (`1..5`), `comment`, danh sách ảnh `images` với `status = "VISIBLE"`.
  - Tự động tính lại và cập nhật `avgRating` và `reviewCount` của cơ sở (`facilities`).
- [ ] **9.2. API Public lấy danh sách đánh giá hiển thị của cơ sở/sân (`GET /api/v1/reviews?facilityId=...&courtId=...`)**
- [ ] **9.3. API Khách hàng xem danh sách các đánh giá đã viết của mình (`GET /api/v1/reviews/me`)**
- [ ] **9.4. Kết nối giao diện Frontend của Khách hàng**
  - Kết nối trang Viết đánh giá (`/account/reviews/new/:bookingId` — `CreateReviewPage.jsx`), Đánh giá của tôi (`/account/reviews` — `MyReviewsPage.jsx`) và mục hiển thị đánh giá trên trang Chi tiết sân/cơ sở với API thật.

---

### Bước 10 (`TV1-10`): [KHÁCH HÀNG] Gửi Khiếu nại Đơn đặt sân & Xem Lịch sử Khiếu nại (`complaints`)

- [ ] **10.1. API Khách hàng gửi khiếu nại mới (`POST /api/v1/complaints`)**
  - Kiểm tra `bookingId` thuộc về `currentUser.id`, lưu `subject`, `content`, ảnh bằng chứng `images` với `status = "OPEN"`.
- [ ] **10.2. API Khách hàng xem danh sách khiếu nại của mình (`GET /api/v1/complaints/me`) và chi tiết khiếu nại (`GET /api/v1/complaints/{id}`)**
  - Xem tiến độ xử lý, phản hồi của Chủ sân (`ownerResponse`) và kết luận của Admin (`adminResolution`).
- [ ] **10.3. Kết nối giao diện Frontend của Khách hàng**
  - Kết nối 3 trang `/account/complaints` (`MyComplaintsPage.jsx`), `/account/complaints/new` (`CreateComplaintPage.jsx`) và `/account/complaints/:id` (`ComplaintDetailPage.jsx`) với API thật.

---

### Bước 11 (`TV1-11`): [KHÁCH HÀNG] Gửi Hồ sơ Đăng ký trở thành Chủ sân (`owner_applications`, `users`)

- [ ] **11.1. API Khách hàng xem trạng thái hồ sơ đăng ký Chủ sân của mình (`GET /api/v1/owner-applications/me`)**
  - Hiển thị trạng thái (`PENDING`, `APPROVED`, `REJECTED`) và lý do từ chối nếu có.
- [ ] **11.2. API Khách hàng gửi hồ sơ đăng ký làm Chủ sân (`POST /api/v1/owner-applications`)**
  - Kiểm tra user chưa phải là `OWNER` và không có hồ sơ nào đang `PENDING`.
  - Lưu `businessName`, `businessAddress`, `contactPhone`, upload ảnh CCCD (`identityCardUrl`) & Giấy phép kinh doanh (`businessLicenseUrl`).
  - Tạo bản ghi `owner_applications` (`status = "PENDING"`) và cập nhật `users.ownerStatus = "PENDING"`.
- [ ] **11.3. Kết nối giao diện Frontend của Khách hàng**
  - Kết nối trang Đăng ký làm Chủ sân (`/account/owner-application` — `OwnerApplicationPage.jsx`) với API thật.

---

### Bước 12 (`TV1-12`): [KHÁCH HÀNG] Quản lý Danh sách Cơ sở & Sân Yêu thích (`favorites`)

- [ ] **12.1. API lấy danh sách yêu thích của tôi (`GET /api/v1/favorites?targetType=FACILITY|COURT`)**
  - Đính kèm thông tin chi tiết của Cơ sở (`facilities`) hoặc Sân (`courts`) tương ứng.
- [ ] **12.2. API thêm vào danh sách yêu thích (`POST /api/v1/favorites`) & xóa khỏi yêu thích (`DELETE /api/v1/favorites/{id}`)**
- [ ] **12.3. Kết nối giao diện Frontend**
  - Kết nối trang Yêu thích (`/account/favorites` — `FavoritesPage.jsx`) và nút Trái tim trên trang Chi tiết cơ sở / Chi tiết sân với API thật.

---

### Bước 13 (`TV1-13`): [ĐỘC LẬP / KHÁCH HÀNG] Hệ thống Thông báo, Trang Tổng quan Tài khoản & Các trang tĩnh (`notifications`)

- [ ] **13.1. Xây dựng `NotificationService` dùng chung toàn hệ thống**
  - Cung cấp hàm `createNotification(userId, type, title, body, referenceType, referenceId)` để tự động tạo thông báo khi Đặt sân, Thanh toán, Hủy đơn, Duyệt hồ sơ hoặc Phản hồi khiếu nại.
- [ ] **13.2. API lấy danh sách thông báo & số thông báo chưa đọc (`GET /api/v1/notifications`, `GET /api/v1/notifications/unread-count`)**
- [ ] **13.3. API đánh dấu đã đọc 1 thông báo và đánh dấu đọc tất cả (`PATCH /api/v1/notifications/{id}/read`, `POST /api/v1/notifications/read-all`)**
- [ ] **13.4. Kết nối giao diện Frontend**
  - Kết nối biểu tượng chuông thông báo trên `PublicHeader.jsx`, trang Thông báo (`/account/notifications` — `NotificationsPage.jsx`), trang Tổng quan tài khoản (`/account` — `AccountOverviewPage.jsx`) và trang Liên hệ (`/contact` — `ContactPage.jsx`), xóa `notificationMockService`.
