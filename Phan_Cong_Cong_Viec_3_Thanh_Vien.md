# PHÂN CÔNG CÔNG VIỆC CHO 3 THÀNH VIÊN — DỰ ÁN SPORTBOOKING

**Dự án:** Hệ thống Đặt sân Thể thao Trực tuyến (SportBooking)  
**Nguyên tắc phân chia & cân bằng khối lượng công việc:**
- **Thành viên 1:** Phụ trách phân hệ **Khách vãng lai (`GUEST`) & Khách hàng đặt sân (`CUSTOMER`)**.
- **Thành viên 2:** Phụ trách phân hệ **Chủ sân (`OWNER`)**.
- **Thành viên 3:** Phụ trách phân hệ **Quản trị viên (`ADMIN`)**. Vì các chức năng thuần của Admin ít hơn so với Khách hàng và Chủ sân, **Thành viên 3 nhận thêm các chức năng độc lập / liên kết** từ Thành viên 1 và Thành viên 2 để 3 người có khối lượng công việc cân bằng nhau:
  1. *Quản lý Hồ sơ cá nhân, Upload Avatar, Đổi mật khẩu & Quên mật khẩu* (dùng chung toàn hệ thống).
  2. *Khách hàng gửi Hồ sơ đăng ký trở thành Chủ sân* (liên kết trực tiếp với chức năng Admin duyệt hồ sơ Chủ sân).
  3. *Hệ thống Thông báo (`notifications`) & Chuông thông báo trên Header*.
  4. *Quản lý Danh sách Cơ sở / Sân Yêu thích (`favorites`)*.

---

# 1. THÀNH VIÊN 1 — KHÁCH VÃNG LAI & KHÁCH HÀNG ĐẶT SÂN (`GUEST` & `CUSTOMER`)

### A. Danh sách các chức năng chính cần làm trước (Theo thứ tự từ trên xuống)
- **Bước 1:** Xem Trang chủ, Danh sách & Chi tiết Cơ sở thể thao (Khách vãng lai).
- **Bước 2:** Tìm kiếm, Lọc Sân đa tiêu chí & Xem thông tin Chi tiết Sân (Khách vãng lai).
- **Bước 3:** Kiểm tra & Hiển thị Bảng Khung giờ trống của Sân theo Ngày (Khách vãng lai / Khách hàng).
- **Bước 4:** Chọn nhiều khung giờ, Nhập thông tin liên hệ & Tạo đơn Giữ chỗ 1 giờ — `HOLD` (Khách hàng).
- **Bước 5:** Thanh toán 100% hoặc Đặt cọc 20% & Xác nhận Đơn đặt sân — `CONFIRMED` (Khách hàng).
- **Bước 6:** Xem Lịch sử Đặt sân, Thanh toán nốt 80% & Hủy lịch theo Quy tắc hoàn tiền 24h (Khách hàng).
- **Bước 7:** Tự động Giải phóng Chỗ giữ quá hạn 1 giờ — `HOLD -> EXPIRED` (Hệ thống).
- **Bước 8:** Viết Đánh giá Sân sau khi hoàn thành buổi chơi & Xem Đánh giá (Khách hàng).
- **Bước 9:** Gửi Khiếu nại về Đơn đặt sân & Theo dõi tiến độ Khiếu nại (Khách hàng).

---

### B. Danh sách các chức năng nhỏ chi tiết (Theo đúng thứ tự thực hiện)

- **Bước 1: Trang chủ, Danh sách & Chi tiết Cơ sở thể thao (`facilities`, `sports_categories`, `courts`)**
  - [ ] Làm API lấy danh sách môn thể thao đang hoạt động (`GET /api/v1/categories`, lọc `status = "ACTIVE"`) để hiển thị ở Trang chủ và thanh bộ lọc.
  - [ ] Làm API lấy danh sách cơ sở thể thao công khai (`GET /api/v1/facilities`, lọc `status = "ACTIVE"`): hỗ trợ tìm kiếm theo tên/địa chỉ, lọc theo quận/huyện (`district`), môn thể thao (`categoryId`), tiện ích (`amenity`), sắp xếp theo điểm đánh giá (`avgRating`) và phân trang.
  - [ ] Làm API xem chi tiết một cơ sở thể thao (`GET /api/v1/facilities/{id}`): trả về thông tin cơ sở, danh sách ảnh, tiện ích, tọa độ bản đồ và danh sách các sân con (`courts` đang `ACTIVE`) thuộc cơ sở đó.
  - [ ] Kết nối giao diện Trang chủ (`/` — `HomePage.jsx`), Danh sách cơ sở (`/facilities` — `FacilityListPage.jsx`) và Chi tiết cơ sở (`/facilities/:id` — `FacilityDetailPage.jsx`) với API thật, xóa dữ liệu mock.

- **Bước 2: Tìm kiếm, Lọc Sân đa tiêu chí & Xem Chi tiết Sân (`courts`, `operating_hours`, `price_rules`)**
  - [ ] Làm API tìm kiếm và lọc sân thể thao (`GET /api/v1/courts`): lọc theo từ khóa (`keyword`), môn thể thao (`categoryId` / `sportCode`), cơ sở (`facilityId`), quận/huyện (`district`), khoảng giá (`minPrice`, `maxPrice`), sắp xếp và phân trang.
  - [ ] Làm API xem thông tin chi tiết một sân (`GET /api/v1/courts/{id}`): trả về thông tin sân (`name`, `description`, `attributes`, `capacity`, `images`), thông tin cơ sở, cấu hình khung giờ hoạt động (`operating_hours`) và bảng giá (`price_rules`).
  - [ ] Kết nối giao diện Tìm kiếm sân (`/search` — `SearchPage.jsx`), Danh sách sân theo môn (`/courts`, `/sports/:code` — `CategoryCourtsPage.jsx`) và phần thông tin sân trên trang Chi tiết sân (`/courts/:id` — `CourtDetailPage.jsx`) với API thật.

- **Bước 3: Kiểm tra & Hiển thị Bảng Khung giờ trống của Sân theo Ngày (`booking_slots`, `blocked_slots`)**
  - [ ] Làm API lấy trạng thái các khung giờ của sân theo ngày (`GET /api/v1/courts/{courtId}/availability?date=yyyy-MM-dd`):
    - Đọc danh sách `timeSlots` mẫu trong ngày từ collection `operating_hours` của `courtId`.
    - Đối chiếu từng khung giờ với `blocked_slots` (giờ bảo trì) và `booking_slots` (các slot có `slotDate == date` và `status` thuộc `["HOLD", "BOOKED"]`, bỏ qua các slot `HOLD` đã quá hạn `expiresAt < now`).
    - Tính đơn giá từng khung giờ theo `price_rules` của sân trong ngày đã chọn.
    - Trả về danh sách slot gồm: `startTime`, `endTime`, `startAt`, `endAt`, `slotLabel`, `price`, và `availabilityStatus` (`AVAILABLE`, `HOLD`, `BOOKED`, `BLOCKED`).
  - [ ] Kết nối bảng chọn ngày & chọn nhiều khung giờ trống trên trang Chi tiết sân (`/courts/:id` — `CourtDetailPage.jsx`) với API thật.

- **Bước 4: Chọn nhiều khung giờ, Nhập thông tin & Tạo đơn Giữ chỗ 1 giờ — `HOLD` (`bookings`, `booking_slots`)**
  - [ ] Kiểm tra giao diện trang Xác nhận đặt sân (`/checkout/:courtId` — `CheckoutPage.jsx`): hiển thị danh sách nhiều khung giờ khách đã chọn, tự động điền sẵn Họ tên và Số điện thoại từ tài khoản đang đăng nhập (chỉ nhập thông tin cá nhân & ghi chú, chưa chọn phương thức thanh toán ở bước này).
  - [ ] Làm API tạo đơn đặt sân và khóa giữ chỗ 1 giờ (`POST /api/v1/bookings`):
    - Tính lại giá từng khung giờ ở Backend từ `price_rules`: tính `subtotalAmount`, `totalAmount = subtotalAmount`, và tiền cọc bắt buộc 20% (`depositRequired = totalAmount * 0.20`).
    - Thiết lập thời hạn giữ chỗ 1 giờ: `holdExpiresAt = Instant.now().plusSeconds(3600)`.
    - Tạo các bản ghi trong `booking_slots` với `status = "HOLD"`, `expiresAt = holdExpiresAt` (chống đặt trùng lịch nhờ Unique Partial Index `uniq_active_court_slot`, trả về `409 Conflict` nếu khung giờ vừa có người khác giữ hoặc đặt).
    - Lưu đơn vào `bookings` với mã `bookingCode` duy nhất, `status = "HOLD"`, `paymentStatus = "UNPAID"`, `paidAmount = 0`, `remainingAmount = totalAmount`.
  - [ ] Kết nối nút *"Đến thanh toán"* trên `CheckoutPage.jsx` với API `POST /api/v1/bookings` để chuyển sang trang `/payment/:bookingId`.

- **Bước 5: Thanh toán 100% hoặc Đặt cọc 20% & Xác nhận Đơn đặt sân (`payments`, `bookings`, `booking_slots`)**
  - [ ] Làm API lấy thông tin đơn đặt sân để thanh toán (`GET /api/v1/bookings/{id}`): kiểm tra đơn thuộc về `currentUser.id` và kiểm tra thời hạn giữ chỗ `holdExpiresAt`.
  - [ ] Hoàn thiện giao diện Thanh toán (`/payment/:bookingId` — `PaymentPage.jsx`): hiển thị đồng hồ đếm ngược 1 giờ giữ chỗ và chỉ hiển thị 2 lựa chọn thanh toán (**Thanh toán 100%** hoặc **Đặt cọc 20%**).
  - [ ] Làm API xác nhận thanh toán đơn đặt sân (`POST /api/v1/bookings/{id}/payments`):
    - Nếu chọn Đặt cọc 20% (`DEPOSIT_20_PERCENT`): lưu giao dịch `payments` (`type = "DEPOSIT"`, `amount = depositRequired`), cập nhật `booking.paidAmount = depositRequired`, `remainingAmount = totalAmount - depositRequired`, `paymentStatus = "PARTIALLY_PAID"`.
    - Nếu chọn Thanh toán 100% (`FULL_PAYMENT`): lưu giao dịch `payments` (`type = "FULL"`, `amount = totalAmount`), cập nhật `booking.paidAmount = totalAmount`, `remainingAmount = 0`, `paymentStatus = "PAID"`.
    - Chuyển trạng thái đơn sang `booking.status = "CONFIRMED"`, `confirmedAt = Instant.now()`.
    - Chuyển toàn bộ các khung giờ của đơn trong `booking_slots` từ `"HOLD"` sang **`"BOOKED"`** (`expiresAt = null`).
  - [ ] Kết nối trang Thanh toán (`/payment/:bookingId`) và trang Kết quả thanh toán (`/payment-result/:bookingId` — `PaymentResultPage.jsx`) với API thật.

- **Bước 6: Lịch sử Đặt sân, Thanh toán nốt 80% & Hủy lịch theo Quy tắc 24h (`bookings`, `booking_slots`, `payments`)**
  - [ ] Làm API lấy danh sách đơn đặt sân của khách hàng (`GET /api/v1/bookings/me`): lọc theo `status` (`HOLD`, `CONFIRMED`, `COMPLETED`, `CANCELLED`, `EXPIRED`), tìm kiếm theo `bookingCode`, phân trang.
  - [ ] Làm API xem chi tiết đơn đặt sân kèm lịch sử các lần thanh toán (`GET /api/v1/bookings/{id}`).
  - [ ] Làm API thanh toán nốt 80% tiền còn lại (`POST /api/v1/bookings/{id}/pay-remaining`): tạo bản ghi `payments` (`type = "REMAINING"`, `amount = remainingAmount`, `status = "PAID"`), cập nhật `booking.paidAmount = totalAmount`, `remainingAmount = 0`, `paymentStatus = "PAID"`.
  - [ ] Làm API hủy đơn đặt sân của khách hàng (`POST /api/v1/bookings/{id}/cancel`):
    - Áp dụng quy tắc hoàn tiền 24 giờ so với khung giờ bắt đầu sớm nhất (`earliestStartAt`):
      - Nếu hủy trước giờ chơi **>= 24 giờ** và `paidAmount > 0`: hoàn lại 100% tiền đã trả (`isRefundEligible = true`, `refundAmount = paidAmount`), tạo bản ghi `payments` (`type = "REFUND"`, `status = "REFUNDED"`), cập nhật `booking.paymentStatus = "REFUNDED"`.
      - Nếu hủy **< 24 giờ** trước giờ chơi: không hoàn lại tiền đã cọc (`isRefundEligible = false`, `refundAmount = 0`).
    - Cập nhật `booking.status = "CANCELLED"`, `cancelledBy = "CUSTOMER"`, `cancelledAt = Instant.now()`, lưu `cancelReason`.
    - Chuyển toàn bộ `booking_slots` của đơn sang `status = "RELEASED"` để mở lại khung giờ cho người khác đặt.
  - [ ] Kết nối giao diện Lịch sử đặt sân (`/account/bookings` — `BookingsPage.jsx`) và Chi tiết đơn đặt sân (`/account/bookings/:id` — `BookingDetailPage.jsx`) với API thật.

- **Bước 7: Tự động Giải phóng Chỗ giữ quá hạn 1 giờ (`HOLD -> EXPIRED`)**
  - [ ] Viết tác vụ tự động chạy định kỳ (`@Scheduled(fixedDelay = 60000)`): tìm các đơn có `status == "HOLD"` và `holdExpiresAt < Instant.now()`, chuyển `bookings.status = "EXPIRED"` và chuyển các slot tương ứng trong `booking_slots` sang `status = "EXPIRED"`.

- **Bước 8: Khách hàng Viết Đánh giá Sân & Xem Đánh giá (`reviews`, `facilities`)**
  - [ ] Làm API khách hàng gửi đánh giá sân sau khi hoàn thành buổi chơi (`POST /api/v1/reviews`):
    - Kiểm tra đơn `bookingId` thuộc về `currentUser.id`, có `status == "COMPLETED"`, và chưa từng được đánh giá (`409 Conflict` nếu đánh giá lần 2).
    - Ảnh đính kèm được tải lên qua API `POST /api/v1/uploads/image` (lưu file ảnh vật lý trực tiếp vào thư mục `frontend/public/uploads/<timestamp>_<randomId>_<fileName>` và lưu đường dẫn `/uploads/<tên_file>` vào mảng `images`).
    - Lưu `rating` (`1..5`), `comment`, ảnh đính kèm `images` với `status = "VISIBLE"`.
    - Tự động tính lại điểm trung bình `avgRating` và tổng số lượt đánh giá `reviewCount` cập nhật vào bảng `facilities`.
  - [ ] Làm API lấy danh sách đánh giá công khai của cơ sở/sân (`GET /api/v1/reviews?facilityId=...&courtId=...`) và danh sách đánh giá của tôi (`GET /api/v1/reviews/me`).
  - [ ] Kết nối trang Viết đánh giá (`/account/reviews/new/:bookingId` — `CreateReviewPage.jsx`), Đánh giá của tôi (`/account/reviews` — `MyReviewsPage.jsx`) và mục đánh giá trên trang Chi tiết sân với API thật.

- **Bước 9: Khách hàng Gửi Khiếu nại Đơn đặt sân & Xem Lịch sử Khiếu nại (`complaints`)**
  - [ ] Làm API khách hàng gửi khiếu nại mới về đơn đặt sân (`POST /api/v1/complaints`): kiểm tra `bookingId` thuộc về `currentUser.id`, tải ảnh minh chứng lên thư mục vật lý `frontend/public/uploads/` qua `POST /api/v1/uploads/image`, lưu `subject`, `content`, đường dẫn ảnh `images` (`/uploads/<timestamp>_<randomId>_<fileName>`) với `status = "OPEN"`.
  - [ ] Làm API xem danh sách khiếu nại của tôi (`GET /api/v1/complaints/me`) và xem chi tiết khiếu nại (`GET /api/v1/complaints/{id}`).
  - [ ] Kết nối 3 trang Khiếu nại của khách hàng (`/account/complaints`, `/account/complaints/new`, `/account/complaints/:id`) với API thật.

---

# 2. THÀNH VIÊN 2 — CHỦ SÂN (`OWNER`)

### A. Danh sách các chức năng chính cần làm trước (Theo thứ tự từ trên xuống)
- **Bước 1:** Chủ sân Quản lý Cơ sở thể thao (Thêm, Sửa, Ẩn/Hiện Cơ sở).
- **Bước 2:** Chủ sân Quản lý Sân thể thao & Thiết lập Khung giờ cho thuê mẫu (`timeSlots`).
- **Bước 3:** Chủ sân Quản lý Quy tắc Giá động (Theo Thứ / Ngày cụ thể / Khung giờ).
- **Bước 4:** Chủ sân Quản lý Lịch chặn sân / Khóa giờ bảo trì.
- **Bước 5:** Chủ sân Quản lý Đơn đặt sân tại cơ sở, Thu 80% tiền còn lại & Đánh dấu Hoàn thành.
- **Bước 6:** Chủ sân Xem Lịch biểu Đặt sân Trực quan theo Cơ sở & Ngày.
- **Bước 7:** Chủ sân Thống kê Doanh thu, Báo cáo tài chính & Dashboard Tổng quan Chủ sân.
- **Bước 8:** Chủ sân Phản hồi Đánh giá & Giải trình Khiếu nại của Khách hàng.

---

### B. Danh sách các chức năng nhỏ chi tiết (Theo đúng thứ tự thực hiện)

- **Bước 1: Chủ sân Quản lý Cơ sở thể thao (`facilities`)**
  - [x] Làm API lấy danh sách cơ sở thuộc quyền sở hữu của Chủ sân (`GET /api/v1/owner/facilities`, lọc `ownerId == currentUser.id`, tìm kiếm theo tên, lọc theo `status`).
  - [x] Làm API tạo cơ sở thể thao mới (`POST /api/v1/owner/facilities`):
    - Kiểm tra quyền `OWNER`.
    - Lưu `name`, `description`, `address` (`province`, `district`, `ward`, `detail`), tọa độ `location` (`type = "Point"`, `coordinates = [lng, lat]`), danh sách tiện ích `amenities`.
    - Xử lý upload danh sách ảnh cơ sở qua `POST /api/v1/uploads/image` (lưu file ảnh vật lý trực tiếp vào thư mục `frontend/public/uploads/<timestamp>_<randomId>_<fileName>` và lưu đường dẫn `/uploads/<tên_file>` vào DB, không dùng `localStorage`).
    - Khởi tạo `ownerId = currentUser.id`, **`status = "PENDING"` (Chờ Admin xét duyệt mới được phép hoạt động công khai)**.
  - [x] Làm API xem chi tiết cơ sở của Chủ sân (`GET /api/v1/owner/facilities/{id}`) và kết nối giao diện Chi tiết cơ sở (`/owner/facilities/:id` — `OwnerFacilityDetailPage.jsx`).
  - [x] Làm API cập nhật thông tin cơ sở (`PATCH /api/v1/owner/facilities/{id}`) và đổi trạng thái hoạt động (`PATCH /api/v1/owner/facilities/{id}/status`, `/deactivate`, `/submit-review`).
  - [x] Kết nối giao diện Danh sách cơ sở (`/owner/facilities` — `OwnerFacilitiesPage.jsx`) và Form Thêm/Sửa cơ sở (`/owner/facilities/new`, `/owner/facilities/:id/edit` — `OwnerFacilityFormPage.jsx`) với API thật.

- **Bước 2: Chủ sân Quản lý Sân thể thao & Thiết lập Khung giờ cho thuê mẫu (`courts`, `operating_hours`)**
  - [x] Làm API lấy danh sách các sân của Chủ sân (`GET /api/v1/owner/courts` và `GET /api/v1/owner/facilities/{facilityId}/courts`): lọc theo cơ sở (`facilityId`), môn thể thao (`categoryId`), trạng thái (`AVAILABLE`, `MAINTENANCE`, `INACTIVE`), tìm kiếm theo tên sân, kết nối giao diện `/owner/courts` (`OwnerCourtsPage.jsx`).
  - [x] Làm API tạo sân mới kèm cấu hình khung giờ cho thuê trong ngày (`POST /api/v1/owner/courts` và `POST /api/v1/owner/facilities/{facilityId}/courts`):
    - Kiểm tra `facilityId` thuộc quyền sở hữu của Chủ sân hiện tại và `categoryId` hợp lệ (`ACTIVE`).
    - Tải ảnh sân lên thư mục vật lý `frontend/public/uploads/` qua `POST /api/v1/uploads/image` và lưu đường dẫn `/uploads/<timestamp>_<randomId>_<fileName>` vào mảng `courts.images`.
    - Lưu thông tin sân vào collection `courts`: `facilityId`, `categoryId`, `name`, `description`, `attributes` (`surface`, `size`, `indoor`, `lighting`), `capacity`, danh sách ảnh `images`, `status = "AVAILABLE"`.
    - Lưu đồng thời danh sách khung giờ cho thuê mẫu vào collection `operating_hours`: nhận mảng `timeSlots` (ví dụ `[{ startTime: "06:00", endTime: "07:00" }, { startTime: "14:00", endTime: "16:00" }]`), kiểm tra `startTime < endTime` và không chồng lấn giờ, đặt `repeatMode = "DAILY"`.
  - [x] Làm API xem chi tiết sân kèm `timeSlots` (`GET /api/v1/owner/courts/{id}`) và kết nối giao diện Chi tiết sân của Chủ sân (`/owner/courts/:id` — `OwnerCourtDetailPage.jsx`).
  - [x] Làm API cập nhật thông tin sân + khung giờ (`PATCH /api/v1/owner/courts/{id}`) và đổi trạng thái sân (`PATCH /api/v1/owner/courts/{id}/status`).
  - [x] Kết nối giao diện Danh sách sân (`/owner/courts` — `OwnerCourtsPage.jsx`) và Form Thêm/Sửa sân (`/owner/courts/new`, `/owner/courts/:id/edit` — `OwnerCourtFormPage.jsx`) với API thật.

- **Bước 3: Chủ sân Quản lý Quy tắc Giá động (`price_rules`)**
  - [x] Làm API lấy danh sách quy tắc giá theo sân (`GET /api/v1/owner/price-rules?courtId=...`): sắp xếp theo độ ưu tiên `priority` giảm dần, lọc theo trạng thái (`ACTIVE`, `INACTIVE`).
  - [x] Làm API tạo quy tắc giá mới (`POST /api/v1/owner/price-rules`): lưu `courtId`, `name`, `startTime`, `endTime` (`startTime < endTime`), `pricePerSlot` (`BigDecimal` > 0), `daysOfWeek` (`1..7`), `specificDates` (`yyyy-MM-dd`), `validFrom`, `validTo`, `priority`.
  - [x] Làm API cập nhật quy tắc giá (`PATCH /api/v1/owner/price-rules/{id}`), bật/tắt trạng thái và xóa quy tắc giá (`DELETE /api/v1/owner/price-rules/{id}`).
  - [x] Kết nối giao diện Danh sách quy tắc giá (`/owner/pricing` — `OwnerPricingPage.jsx`) và Form Tạo quy tắc giá (`/owner/pricing/new` — `OwnerPriceRuleFormPage.jsx`) với API thật.

- **Bước 4: Chủ sân Quản lý Lịch chặn sân / Khóa giờ bảo trì (`blocked_slots`)**
  - [x] Làm API lấy danh sách lịch chặn sân (`GET /api/v1/owner/blocked-slots?courtId=...&date=...`).
  - [x] Làm API tạo lịch chặn sân mới (`POST /api/v1/owner/blocked-slots`):
    - Kiểm tra `courtId`, `startAt < endAt`, `reason` bắt buộc (ví dụ: *"Bảo trì mặt cỏ"*, *"Giải đấu nội bộ"*).
    - Kiểm tra xung đột: không cho phép chặn khoảng giờ đã có khách giữ chỗ hoặc đặt (`booking_slots` đang ở trạng thái `HOLD` hoặc `BOOKED` -> trả về lỗi `409 Conflict`).
  - [ ] Làm API xóa / mở khóa lịch chặn sân (`DELETE /api/v1/owner/blocked-slots/{id}`).
  - [ ] Kết nối giao diện Quản lý lịch chặn sân (`/owner/blocked-slots` — `OwnerBlockedSlotsPage.jsx`) với API thật.

- **Bước 5: Chủ sân Quản lý Đơn đặt sân, Thu 80% tiền còn lại & Đánh dấu Hoàn thành (`bookings`, `payments`)**
  - [ ] Làm API lấy danh sách đơn đặt sân tại các cơ sở của Chủ sân (`GET /api/v1/owner/bookings`): lọc theo `facilityId`, `courtId`, ngày đặt (`bookingDate`), trạng thái thanh toán (`paymentStatus`), tìm kiếm theo `bookingCode`, tên hoặc SĐT khách.
  - [ ] Hiển thị rõ ràng **danh sách các khung giờ đặt sân** của từng đơn trên bảng Quản lý đặt sân (`/owner/bookings` — `OwnerBookingsPage.jsx`, ví dụ: `12:00 - 13:00, 14:00 - 16:00`).
  - [ ] Làm API xác nhận đã thu phần tiền 80% còn lại tại sân (`POST /api/v1/owner/bookings/{id}/collect-remaining`): tạo bản ghi `payments` (`type = "REMAINING"`, `method = "CASH"`, `amount = remainingAmount`, `status = "PAID"`), cập nhật `booking.paidAmount = totalAmount`, `remainingAmount = 0`, `paymentStatus = "PAID"`.
  - [ ] Làm API đánh dấu đơn đặt sân đã hoàn thành (`POST /api/v1/owner/bookings/{id}/complete`): chuyển `booking.status = "COMPLETED"`, `completedAt = Instant.now()`.
  - [ ] Làm API Chủ sân hủy đơn đặt sân (`POST /api/v1/owner/bookings/{id}/cancel`): cập nhật `status = "CANCELLED"`, `cancelledBy = "OWNER"`, giải phóng `booking_slots` sang `"RELEASED"`.
  - [ ] Kết nối 2 trang `/owner/bookings` (`OwnerBookingsPage.jsx`) và `/owner/bookings/:id` (`OwnerBookingDetailPage.jsx`) với API thật.

- **Bước 6: Chủ sân Xem Lịch biểu Đặt sân Trực quan (`bookings`, `booking_slots`, `blocked_slots`)**
  - [ ] Làm API lấy dữ liệu lịch biểu trực quan theo cơ sở và ngày (`GET /api/v1/owner/calendar?facilityId=...&date=yyyy-MM-dd`): trả về toàn bộ các sân thuộc cơ sở cùng danh sách khung giờ Trống (`AVAILABLE`), Đang giữ chỗ (`HOLD`), Đã đặt (`BOOKED` kèm tên khách, SĐT, mã đơn) và Đang bảo trì (`BLOCKED`).
  - [ ] Kết nối giao diện Lịch biểu trực quan (`/owner/calendar` — `OwnerCalendarPage.jsx`) với API thật.

- **Bước 7: Chủ sân Thống kê Doanh thu, Báo cáo & Dashboard Chủ sân (`payments`, `bookings`)**
  - [ ] Làm API thống kê doanh thu & báo cáo tài chính (`GET /api/v1/owner/revenue?from=...&to=...&facilityId=...`): tính tổng doanh thu thực nhận (`paidAmount`), tổng tiền cọc đã thu, tổng tiền còn phải thu (`remainingAmount`), tổng tiền đã hoàn trả (`refundAmount`), thống kê doanh thu theo từng cơ sở/sân.
  - [ ] Làm API lấy số liệu tổng quan cho Dashboard Chủ sân (`GET /api/v1/owner/dashboard/summary`): doanh thu tháng, tổng số đơn đặt sân, số ca đặt sân hôm nay, danh sách các đơn đặt sân mới nhất.
  - [ ] Kết nối giao diện Doanh thu (`/owner/revenue` — `OwnerRevenuePage.jsx`) và Dashboard Chủ sân (`/owner` — `OwnerDashboardPage.jsx`) với API thật.

- **Bước 8: Chủ sân Phản hồi Đánh giá & Giải trình Khiếu nại của Khách hàng (`reviews`, `complaints`)**
  - [ ] Làm API Chủ sân xem danh sách đánh giá tại cơ sở của mình (`GET /api/v1/owner/reviews`) và gửi phản hồi cho đánh giá của khách (`POST /api/v1/owner/reviews/{id}/reply`, cập nhật `ownerReply: { content, repliedAt }`).
  - [ ] Làm API Chủ sân xem danh sách khiếu nại tại cơ sở của mình (`GET /api/v1/owner/complaints`) và gửi phản hồi giải trình (`POST /api/v1/owner/complaints/{id}/respond`, cập nhật `ownerResponse` và chuyển trạng thái sang `IN_PROGRESS`).
  - [ ] Kết nối giao diện Quản lý đánh giá (`/owner/reviews` — `OwnerReviewsPage.jsx`) và Quản lý khiếu nại (`/owner/complaints` — `OwnerComplaintsPage.jsx`) với API thật.

---

# 3. THÀNH VIÊN 3 — QUẢN TRỊ VIÊN (`ADMIN`) & CÁC CHỨC NĂNG ĐỘC LẬP / LIÊN KẾT ĐỂ CÂN BẰNG CÔNG VIỆC

### A. Danh sách các chức năng chính cần làm trước (Theo thứ tự từ trên xuống)
- **Bước 1:** *(Độc lập - Dùng chung)* Quản lý Hồ sơ cá nhân, Upload Avatar, Đổi mật khẩu & Quên mật khẩu (của cả khách hàng, chủ sân và admin).
- **Bước 2:** *(Admin)* Quản lý Danh mục Môn thể thao (Thêm, Sửa, Ẩn/Hiện).
- **Bước 3:** *(Luồng liên kết Khách hàng + Admin)* Khách hàng Gửi Hồ sơ đăng ký Chủ sân & Admin Xét duyệt / Từ chối Hồ sơ Chủ sân.
- **Bước 4:** *(Admin)* **Admin Xét duyệt / Từ chối Cơ sở thể thao mới do Chủ sân tạo (`PENDING` -> `APPROVED` / `REJECTED`)**.
- **Bước 5:** *(Admin)* Quản lý Danh sách Người dùng & Khóa / Mở khóa Tài khoản.
- **Bước 6:** *(Admin)* Kiểm duyệt & Ẩn / Hiện các Đánh giá vi phạm trên hệ thống.
- **Bước 7:** *(Admin)* Phân xử & Giải quyết Khiếu nại giữa Khách hàng và Chủ sân.
- **Bước 8:** Quản lý Danh sách Cơ sở & Sân Yêu thích của khách hàng (`favorites`).
- **Bước 9:** Hệ thống Thông báo (`notifications`), Chuông thông báo Header, Tổng quan Tài khoản & Dashboard Thống kê Admin.

---

### B. Danh sách các chức năng nhỏ chi tiết (Theo đúng thứ tự thực hiện)

- **Bước 1: Quản lý Hồ sơ cá nhân, Upload Avatar, Đổi mật khẩu & Quên mật khẩu (`users`, `auth_sessions`)**
  - [ ] Làm API lấy thông tin hồ sơ cá nhân hiện tại (`GET /api/v1/users/me`): trích xuất `userId` từ JWT Access Token, trả về thông tin đầy đủ (`id`, `fullName`, `email`, `phone`, `avatar`, `address`, `roles`, `ownerStatus`, `status`).
  - [ ] Làm API cập nhật thông tin cá nhân (`PATCH /api/v1/users/me`): cho phép sửa `fullName`, `phone`, `address` (`province`, `district`, `ward`, `detail`), kiểm tra trùng `phone` (`409 Conflict`) nếu đổi sang SĐT mới.
  - [ ] Làm API upload và cập nhật ảnh đại diện (`POST /api/v1/users/me/avatar` hoặc dùng `POST /api/v1/uploads/image`): kiểm tra ảnh (`jpg`, `png`, `webp`) <= 5MB, **lưu file ảnh vật lý trực tiếp vào thư mục `frontend/public/uploads/<timestamp>_<randomId>_<fileName>`** và cập nhật đường dẫn `/uploads/<tên_file>` vào `users.avatar` (không dùng `localStorage`).
  - [ ] Làm API đổi mật khẩu khi đang đăng nhập (`POST /api/v1/auth/change-password`): kiểm tra `currentPassword` khớp với BCrypt hash trong DB, mã hóa `newPassword` (6–72 ký tự) và thu hồi các phiên đăng nhập cũ trong `auth_sessions`.
  - [ ] Làm API yêu cầu quên mật khẩu (`POST /api/v1/auth/forgot-password`) và đặt lại mật khẩu (`POST /api/v1/auth/reset-password`).
  - [ ] Kết nối giao diện Hồ sơ khách hàng (`/account/profile` — `ProfilePage.jsx`), Hồ sơ chủ sân (`/owner/profile` — `OwnerProfilePage.jsx`) và Quên mật khẩu (`/forgot-password` — `ForgotPasswordPage.jsx`) với API thật.

- **Bước 2: Admin Quản lý Danh mục Môn thể thao (`sports_categories`)**
  - [ ] Làm API Admin lấy toàn bộ danh mục môn thể thao (`GET /api/v1/admin/categories`): hỗ trợ tìm kiếm theo tên/mã (`code`) và lọc theo trạng thái (`ACTIVE`, `INACTIVE`).
  - [ ] Làm API Admin thêm môn thể thao mới (`POST /api/v1/admin/categories`): chuẩn hóa `code` viết hoa (`FOOTBALL`, `BADMINTON`, `TENNIS`, `PICKLEBALL`, ...), kiểm tra trùng `code` (`409 Conflict`), lưu `name`, `code`, `description`, `icon`, `status = "ACTIVE"`.
  - [ ] Làm API Admin cập nhật thông tin môn thể thao & đổi trạng thái Ẩn/Hiện (`PATCH /api/v1/admin/categories/{id}`).
  - [ ] Kết nối giao diện Quản lý danh mục của Admin (`/admin/categories` — `AdminCategoriesPage.jsx`) với API thật.

- **Bước 3: Luồng liên kết Đăng ký làm Chủ sân & Admin Xét duyệt Hồ sơ Chủ sân (`owner_applications`, `users`)**
  - [ ] Làm API cho Khách hàng xem trạng thái hồ sơ đăng ký Chủ sân của mình (`GET /api/v1/owner-applications/me`).
  - [ ] Làm API cho Khách hàng gửi hồ sơ đăng ký trở thành Chủ sân (`POST /api/v1/owner-applications`):
    - Kiểm tra user chưa phải là `OWNER` và không có hồ sơ nào đang `PENDING`.
    - Tải ảnh giấy tờ xác minh (CCCD, Giấy phép kinh doanh) lên thư mục vật lý `frontend/public/uploads/` qua `POST /api/v1/uploads/image` và lưu đường dẫn `/uploads/<timestamp>_<randomId>_<fileName>` vào mảng `documents`.
    - Lưu `businessName`, `businessAddress`, `contactPhone` và `documents`.
    - Tạo bản ghi `owner_applications` (`status = "PENDING"`) và cập nhật `users.ownerStatus = "PENDING"`.
  - [ ] Làm API cho Admin lấy danh sách hồ sơ đăng ký Chủ sân (`GET /api/v1/admin/owner-applications`, lọc theo `status`, tìm kiếm, phân trang) và xem chi tiết hồ sơ (`GET /api/v1/admin/owner-applications/{id}`).
  - [ ] Làm API cho Admin **Phê duyệt** hồ sơ Chủ sân (`POST /api/v1/admin/owner-applications/{id}/approve`):
    - Cập nhật `owner_applications`: `status = "APPROVED"`, `reviewedBy = adminId`, `reviewedAt = Instant.now()`.
    - Cập nhật `users`: thêm `"OWNER"` vào mảng `roles` (thành `["CUSTOMER", "OWNER"]`) và đặt `ownerStatus = "APPROVED"`.
  - [ ] Làm API cho Admin **Từ chối** hồ sơ Chủ sân (`POST /api/v1/admin/owner-applications/{id}/reject`): bắt buộc nhập lý do `rejectionReason`, cập nhật `status = "REJECTED"` ở cả `owner_applications` và `users.ownerStatus`.
  - [ ] Kết nối cả 3 trang Frontend: trang Khách nộp hồ sơ (`/account/owner-application` — `OwnerApplicationPage.jsx`), trang Admin danh sách hồ sơ (`/admin/owner-applications` — `AdminOwnerApplicationsPage.jsx`) và Chi tiết hồ sơ (`/admin/owner-applications/:id` — `AdminOwnerAppDetailPage.jsx`) với API thật.

- **Bước 4: Admin Xét duyệt / Từ chối Cơ sở thể thao mới của Chủ sân (`facilities`)**
  - [x] Thiết kế giao diện trang Admin Xét duyệt Cơ sở thể thao (`/admin/facilities` — `AdminFacilitiesPage.jsx`): hiển thị danh sách cơ sở mới do Chủ sân tạo đang ở trạng thái `PENDING`, lọc theo trạng thái (`PENDING`, `APPROVED`, `REJECTED`, `SUSPENDED`, `INACTIVE`), xem chi tiết hình ảnh/tọa độ/tiện ích và nút Phê duyệt / Từ chối.
  - [ ] Làm API Admin lấy danh sách toàn bộ cơ sở thể thao để xét duyệt (`GET /api/v1/admin/facilities?status=PENDING&keyword=...`).
  - [ ] Làm API Admin **Phê duyệt** cơ sở thể thao mới (`PATCH /api/v1/admin/facilities/{id}/approve`): chuyển `facilities.status` từ `"PENDING"` sang `"APPROVED"` để cơ sở bắt đầu hoạt động và hiển thị công khai.
  - [ ] Làm API Admin **Từ chối** cơ sở thể thao (`PATCH /api/v1/admin/facilities/{id}/reject`): chuyển `facilities.status` sang `"REJECTED"`.
  - [ ] Kết nối trang `/admin/facilities` (`AdminFacilitiesPage.jsx`) với API thật.

- **Bước 5: Admin Quản lý Danh sách Người dùng & Khóa / Mở khóa Tài khoản (`users`, `auth_sessions`)**
  - [ ] Làm API Admin lấy danh sách người dùng (`GET /api/v1/admin/users`): tìm kiếm theo `fullName`, `email`, `phone`; lọc theo vai trò (`CUSTOMER`, `OWNER`, `ADMIN`) và trạng thái (`ACTIVE`, `INACTIVE`, `BANNED`); phân trang.
  - [ ] Làm API Admin xem chi tiết người dùng (`GET /api/v1/admin/users/{id}`).
  - [ ] Làm API Admin khóa hoặc mở khóa tài khoản (`PATCH /api/v1/admin/users/{id}/status`):
    - Không cho phép Admin tự khóa chính mình.
    - Khi chuyển sang `"BANNED"` hoặc `"INACTIVE"`, tự động thu hồi toàn bộ các phiên đăng nhập đang hoạt động của user đó trong bảng `auth_sessions` (`revokedAt = Instant.now()`).
  - [ ] Kết nối giao diện Quản lý người dùng (`/admin/users` — `AdminUsersPage.jsx`) với API thật.

- **Bước 6: Admin Kiểm duyệt & Ẩn / Hiện Đánh giá vi phạm (`reviews`, `facilities`)**
  - [ ] Làm API Admin lấy danh sách toàn bộ đánh giá trên hệ thống (`GET /api/v1/admin/reviews`): lọc theo số sao (`rating`), trạng thái (`VISIBLE`, `HIDDEN`), cơ sở (`facilityId`), phân trang.
  - [ ] Làm API Admin đổi trạng thái Ẩn / Hiện đánh giá (`PATCH /api/v1/admin/reviews/{id}/status`): khi ẩn hoặc hiện lại đánh giá, tự động tính lại `avgRating` và `reviewCount` của cơ sở (`facilities`) tương ứng.
  - [ ] Kết nối giao diện Kiểm duyệt đánh giá của Admin (`/admin/reviews` — `AdminReviewsPage.jsx`) với API thật.

- **Bước 7: Admin Phân xử & Giải quyết Khiếu nại (`complaints`)**
  - [ ] Làm API Admin lấy danh sách toàn bộ khiếu nại trên sàn (`GET /api/v1/admin/complaints`, lọc theo `status`: `OPEN`, `IN_PROGRESS`, `RESOLVED`, `REJECTED`, `CLOSED`) và xem chi tiết khiếu nại (`GET /api/v1/admin/complaints/{id}`).
  - [ ] Làm API Admin cập nhật quyết định xử lý khiếu nại (`POST /api/v1/admin/complaints/{id}/resolve`): lưu vào sub-document `adminResolution: { resolvedBy: adminId, decision, note, resolvedAt: Instant.now() }` và cập nhật `status` (`RESOLVED`, `REJECTED` hoặc `CLOSED`).
  - [ ] Kết nối 2 trang Khiếu nại của Admin (`/admin/complaints` — `AdminComplaintsPage.jsx` và `/admin/complaints/:id` — `AdminComplaintDetailPage.jsx`) với API thật.

- **Bước 8: Quản lý Danh sách Cơ sở & Sân Yêu thích (`favorites`)** *(Chức năng độc lập nhận thêm)*
  - [ ] Làm API lấy danh sách Cơ sở & Sân yêu thích của người dùng (`GET /api/v1/favorites?targetType=FACILITY|COURT`): đính kèm thông tin chi tiết của Cơ sở (`facilities`) hoặc Sân (`courts`).
  - [ ] Làm API thêm vào danh sách yêu thích (`POST /api/v1/favorites`) và xóa khỏi yêu thích (`DELETE /api/v1/favorites/{id}`).
  - [ ] Kết nối trang Yêu thích (`/account/favorites` — `FavoritesPage.jsx`) và nút Trái tim trên trang Chi tiết cơ sở / Chi tiết sân với API thật.

- **Bước 9: Hệ thống Thông báo, Trang Tổng quan Tài khoản & Dashboard Thống kê Admin (`notifications`)**
  - [ ] Xây dựng `NotificationService.createNotification(userId, type, title, body, referenceType, referenceId)` dùng chung toàn hệ thống để tạo thông báo khi Đặt sân, Thanh toán, Duyệt hồ sơ Chủ sân, Duyệt cơ sở thể thao hoặc Giải quyết khiếu nại.
  - [ ] Làm API lấy danh sách thông báo của người dùng hiện tại (`GET /api/v1/notifications`) và đếm số thông báo chưa đọc (`GET /api/v1/notifications/unread-count`).
  - [ ] Làm API đánh dấu đã đọc 1 thông báo (`PATCH /api/v1/notifications/{id}/read`) và đánh dấu đọc tất cả (`POST /api/v1/notifications/read-all`).
  - [ ] Kết nối chuông thông báo trên `PublicHeader.jsx`, trang Thông báo (`/account/notifications` — `NotificationsPage.jsx`) và trang Tổng quan tài khoản (`/account` — `AccountOverviewPage.jsx`) với API thật, xóa `notificationMockService`.
  - [ ] Làm API Thống kê tổng quan cho Admin Dashboard (`GET /api/v1/admin/dashboard/summary`): đếm người dùng theo vai trò, hồ sơ Chủ sân chờ duyệt (`PENDING`), cơ sở mới chờ duyệt (`PENDING`), môn thể thao, đánh giá và khiếu nại; kết nối trang `/admin` (`AdminDashboardPage.jsx`).

---

# 4. BẢNG SO SÁNH & CÂN BẰNG KHỐI LƯỢNG CÔNG VIỆC CỦA 3 THÀNH VIÊN

- **Thành viên 1 (Khách vãng lai & Khách hàng đặt sân):**
  - Số nhóm chức năng chính: **9 Bước**
  - Số chức năng nhỏ (Micro-features): **30 mục**
  - Độ phức tạp trọng tâm: Tìm kiếm/Lọc sân, Tính khung giờ trống, Giữ chỗ 1 giờ (`HOLD`), Thanh toán 100% / Cọc 20%, Hủy lịch hoàn tiền 24h.
- **Thành viên 2 (Chủ sân — `OWNER`):**
  - Số nhóm chức năng chính: **9 Bước**
  - Số chức năng nhỏ (Micro-features): **30 mục**
  - Độ phức tạp trọng tâm: CRUD Cơ sở, CRUD Sân + Khung giờ mẫu (`timeSlots`), Quy tắc giá động, Khóa lịch bảo trì, Quản lý đơn đặt sân của khách, Lịch biểu trực quan & Thống kê doanh thu.
- **Thành viên 3 (Admin + Các chức năng độc lập/liên kết):**
  - Số nhóm chức năng chính: **9 Bước**
  - Số chức năng nhỏ (Micro-features): **30 mục**
  - Độ phức tạp trọng tâm: Hồ sơ cá nhân & Đổi/Quên mật khẩu, Luồng nộp & duyệt hồ sơ Chủ sân, Quản lý Danh mục môn & Khóa User, Kiểm duyệt Đánh giá, Phân xử Khiếu nại, Yêu thích (`favorites`), Hệ thống Thông báo (`notifications`) & Dashboard Admin.
