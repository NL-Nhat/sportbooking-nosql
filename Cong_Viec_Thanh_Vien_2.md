# PHÂN CÔNG CÔNG VIỆC — THÀNH VIÊN 2
## PHÂN HỆ: LỊCH TRỐNG, ĐẶT SÂN, GIỮ CHỖ (HOLD), THANH TOÁN, ĐÁNH GIÁ, KHIẾU NẠI, YÊU THÍCH & THÔNG BÁO

**Dự án:** Hệ thống Đặt sân Thể thao Trực tuyến (SportBooking)  
**Phạm vi sở hữu độc lập:** **8 / 16 Collections** · **21 Chức năng chính** · **77 Chức năng nhỏ (Micro-features)**  
**Các Collections phụ trách:** `blocked_slots`, `booking_slots`, `bookings`, `payments`, `reviews`, `complaints`, `favorites`, `notifications`

---

## NGUYÊN TẮC LÀM VIỆC ĐỘC LẬP (KHÔNG CHỜ ĐỢI THÀNH VIÊN 1)
1. **Không cần chờ Thành viên 1 tạo Sân hay Cơ sở:** Trong database `sportbooking_db` đã có sẵn đầy đủ dữ liệu mẫu của `users`, `facilities`, `courts`, `operating_hours`, `price_rules` (từ `HuongdantaoDB.md`) và toàn bộ 16 Models Java đã được khởi tạo sẵn trong Backend. Thành viên 2 có thể dùng trực tiếp `courtId`, `facilityId`, `userId` trong DB để code và test ngay lập tức từ Bước 1!
2. **Không xung đột code (Zero Merge Conflict):** Thành viên 2 làm việc riêng trên các Controllers, Services, Repositories, DTOs của 8 bảng (`blocked_slots`, `booking_slots`, `bookings`, `payments`, `reviews`, `complaints`, `favorites`, `notifications`). Không đụng vào các file `User`, `OwnerApplication`, `SportsCategory`, `Facility`, `Court`, `OperatingHours`, `PriceRule` của Thành viên 1.
3. **Luồng nghiệp vụ khép kín:** Thành viên 2 nắm trọn vẹn luồng **Giao dịch Đặt sân & Tương tác Khách hàng**: *Chủ sân khóa giờ bảo trì (`blocked_slots`) -> Kiểm tra khung giờ trống (`booking_slots`) -> Khách chọn nhiều khung giờ & Giữ chỗ 1 giờ (`HOLD`) -> Thanh toán 100% hoặc Đặt cọc 20% (`payments`) -> Hủy lịch trước 24h & Hoàn tiền -> Chủ sân quản lý đơn đặt sân, Lịch trực quan & Doanh thu -> Khách viết Đánh giá (`reviews`) & Gửi Khiếu nại (`complaints`) -> Lưu Yêu thích (`favorites`) & Nhận Thông báo (`notifications`)*.

---

# PHẦN I: DANH SÁCH CÁC CHỨC NĂNG CHÍNH CẦN LÀM TRƯỚC (THEO THỨ TỰ THỰC HIỆN)

> **Quy tắc thứ tự:** Làm chức năng Kiểm tra lịch trống & Chặn lịch trước -> làm luồng Giữ chỗ (`HOLD`) & Đặt sân -> làm luồng Thanh toán (Cọc 20% / 100%) & Hủy lịch -> làm phần Quản lý Booking / Lịch biểu / Doanh thu của Chủ sân -> sau khi đơn `COMPLETED` mới làm Đánh giá & Khiếu nại -> cuối cùng làm Yêu thích, Thông báo & Tổng quan tài khoản.

| Thứ tự | Mã | Chức năng chính (Major Feature) | Vai trò | Collection chính | Trang Frontend kết nối |
| :--: | :--: | :--- | :---: | :--- | :--- |
| **Bước 1** | **M2-01** | **Chủ sân Quản lý Lịch chặn sân / Khóa giờ bảo trì** | Owner | `blocked_slots` | `/owner/blocked-slots` |
| **Bước 2** | **M2-02** | **Kiểm tra & Hiển thị Bảng Khung giờ trống của Sân theo Ngày** | Guest / Customer | `booking_slots`, `blocked_slots`, `operating_hours`, `price_rules` | `/courts/:id` (Khu vực chọn khung giờ) |
| **Bước 3** | **M2-03** | **Khách hàng Nhập thông tin & Tạo đơn Giữ chỗ 1 giờ (`HOLD`)** | Customer | `bookings`, `booking_slots` | `/checkout/:courtId` |
| **Bước 4** | **M2-04** | **Khách hàng Thanh toán 100% hoặc Đặt cọc 20% & Xác nhận Đơn** | Customer | `payments`, `bookings`, `booking_slots` | `/payment/:bookingId`, `/payment-result/:bookingId` |
| **Bước 5** | **M2-05** | **Khách hàng Xem Lịch sử Đặt sân, Trả nốt 80% & Hủy lịch (Quy tắc 24h)** | Customer | `bookings`, `booking_slots`, `payments` | `/account/bookings`, `/account/bookings/:id` |
| **Bước 6** | **M2-06** | **Tự động Giải phóng Chỗ giữ quá hạn 1 giờ (`HOLD` -> `EXPIRED`)** | System | `bookings`, `booking_slots` | Tác vụ tự động Backend + kiểm tra khi truy vấn |
| **Bước 7** | **M2-07** | **Chủ sân Quản lý Đơn đặt sân, Thu tiền còn lại & Đánh dấu Hoàn thành** | Owner | `bookings`, `booking_slots`, `payments` | `/owner/bookings`, `/owner/bookings/:id` |
| **Bước 8** | **M2-08** | **Chủ sân Xem Lịch biểu Đặt sân Trực quan (Ngày / Tuần)** | Owner | `bookings`, `booking_slots`, `blocked_slots` | `/owner/calendar` |
| **Bước 9** | **M2-09** | **Chủ sân Thống kê Doanh thu, Báo cáo & Dashboard Chủ sân** | Owner | `payments`, `bookings` | `/owner/revenue`, `/owner` |
| **Bước 10** | **M2-10** | **Luồng Đánh giá Sân: Khách đánh giá -> Chủ sân phản hồi -> Admin kiểm duyệt** | Customer / Owner / Admin | `reviews`, `facilities`, `bookings` | `/account/reviews/new/:bookingId`, `/account/reviews`, `/owner/reviews`, `/admin/reviews` |
| **Bước 11** | **M2-11** | **Luồng Khiếu nại: Khách gửi khiếu nại -> Chủ sân giải trình -> Admin phân xử** | Customer / Owner / Admin | `complaints`, `bookings` | `/account/complaints/new`, `/account/complaints`, `/account/complaints/:id`, `/owner/complaints`, `/admin/complaints`, `/admin/complaints/:id` |
| **Bước 12** | **M2-12** | **Khách hàng Quản lý Danh sách Cơ sở & Sân Yêu thích** | Customer | `favorites` | `/account/favorites`, `/facilities/:id`, `/courts/:id` |
| **Bước 13** | **M2-13** | **Hệ thống Thông báo & Trang Tổng quan Tài khoản Khách hàng** | Customer | `notifications`, `bookings`, `favorites` | `/account/notifications`, `/account`, Header Bell Badge |

---

# PHẦN II: CHI TIẾT CÁC CHỨC NĂNG NHỎ (MICRO-FEATURES) THEO ĐÚNG THỨ TỰ LÀM TRƯỚC - LÀM SAU

Dưới đây là danh sách toàn bộ các chức năng nhỏ nhất được sắp xếp theo đúng trình tự triển khai từ **Bước 1 đến Bước 13**:

---

## BƯỚC 1 (M2-01): Chủ sân Quản lý Lịch chặn sân / Khóa giờ bảo trì (`blocked_slots`)
> *Làm đầu tiên vì dữ liệu `blocked_slots` được dùng trực tiếp để xác định khung giờ nào đang bị khóa khi hiển thị lịch trống cho khách.*

- [ ] **1.1.** API Owner lấy danh sách lịch chặn sân (`GET /api/v1/owner/blocked-slots?courtId=...&date=...`):
  - Kiểm tra sân thuộc quyền sở hữu của Owner, lọc theo sân và khoảng thời gian, sắp xếp theo `startAt` tăng dần.
- [ ] **1.2.** API Owner tạo lịch chặn sân mới (`POST /api/v1/owner/blocked-slots`):
  - Kiểm tra hợp lệ: `courtId`, `startAt`, `endAt` (`startAt < endAt`), `reason` bắt buộc (ví dụ: *"Bảo trì mặt cỏ"*, *"Giải đấu nội bộ"*).
  - Kiểm tra xung đột: Không cho phép chặn khoảng giờ đã có khách đặt (`booking_slots` đang ở trạng thái `HOLD` hoặc `BOOKED` trong khoảng thời gian đó -> báo lỗi `409 Conflict`).
  - Lưu vào collection `blocked_slots` với `createdBy = currentUser.id`.
- [ ] **1.3.** API Owner xóa / mở khóa lịch chặn sân (`DELETE /api/v1/owner/blocked-slots/{id}`).
- [ ] **1.4.** Kết nối Frontend trang Quản lý lịch chặn sân (`/owner/blocked-slots` — `OwnerBlockedSlotsPage.jsx`) với API thật, xóa mock data lịch chặn.

---

## BƯỚC 2 (M2-02): Kiểm tra & Hiển thị Bảng Khung giờ trống của Sân theo Ngày (`booking_slots`, `blocked_slots`)
> *Cung cấp dữ liệu trạng thái thực tế của từng khung giờ trong ngày để khách hàng bấm chọn đặt sân.*

- [ ] **2.1.** API Public lấy danh sách trạng thái các khung giờ của một sân theo ngày (`GET /api/v1/courts/{courtId}/availability?date=yyyy-MM-dd`):
  - Đọc danh sách `timeSlots` mẫu trong ngày từ collection `operating_hours` của `courtId`.
  - Đối chiếu từng khung giờ với `blocked_slots` và `booking_slots` (có `slotDate == date` và `status` thuộc `["HOLD", "BOOKED"]`, đồng thời bỏ qua các slot `HOLD` đã quá hạn `expiresAt < now`).
  - Tính đơn giá của từng khung giờ theo `price_rules` của sân trong ngày `date`.
  - Trả về danh sách các slot gồm: `startTime`, `endTime`, `startAt` (ISO-8601), `endAt` (ISO-8601), `slotLabel`, `price` (`BigDecimal`), và `availabilityStatus` (`AVAILABLE`, `HOLD`, `BOOKED`, `BLOCKED`).
- [ ] **2.2.** Kết nối khu vực chọn ngày & bảng chọn nhiều khung giờ trên trang Chi tiết sân (`/courts/:id` — `CourtDetailPage.jsx`) với API thật ở mục 2.1.

---

## BƯỚC 3 (M2-03): Khách hàng Nhập thông tin & Tạo đơn Giữ chỗ 1 giờ — `HOLD` (`bookings`, `booking_slots`)
> *Trái tim của luồng đặt sân: Khi khách chọn các khung giờ và bấm "Đến thanh toán", hệ thống tạo đơn ở trạng thái Giữ chỗ (`HOLD`) trong 1 giờ.*

- [ ] **3.1.** Kiểm tra trên trang `/checkout/:courtId` (`CheckoutPage.jsx`):
  - Hiển thị danh sách nhiều khung giờ khách đã chọn (`items`), tự động điền sẵn Họ tên và Số điện thoại người đặt từ tài khoản đang đăng nhập.
  - Ở bước này chỉ nhập thông tin cá nhân & ghi chú (`note`), chưa chọn phương thức thanh toán (phần chọn Thanh toán 100% hay Đặt cọc 20% nằm ở màn hình Thanh toán tiếp theo).
- [ ] **3.2.** API Khách hàng tạo đơn đặt sân và giữ chỗ (`POST /api/v1/bookings`):
  - Yêu cầu đã đăng nhập (`CUSTOMER` / `OWNER`).
  - Nhận `courtId`, `bookingDate` (`yyyy-MM-dd`), danh sách các khung giờ `slots` (`[{ startTime, endTime }]`), thông tin liên hệ (`contactName`, `contactPhone`), `note`.
  - Tính lại giá từng khung giờ ở Backend từ `price_rules` (Backend là nguồn sự thật duy nhất về giá):
    - Tính `subtotalAmount` = tổng `finalPrice` của tất cả các `items`.
    - Tính `totalAmount = subtotalAmount`.
    - Tính tiền cọc bắt buộc 20%: `depositRequired = totalAmount * 0.20` (làm tròn chuẩn `BigDecimal`).
  - Thiết lập thời hạn giữ chỗ 1 giờ: `holdExpiresAt = Instant.now().plusSeconds(3600)`.
  - **Chống đặt trùng lịch (Double-Booking Prevention)**:
    - Tạo các bản ghi trong collection `booking_slots` cho từng khung giờ với `status = "HOLD"`, `expiresAt = holdExpiresAt`.
    - Nếu bất kỳ khung giờ nào đã có người khác giữ chỗ (`HOLD`) hoặc đã đặt (`BOOKED`), Unique Partial Index `uniq_active_court_slot` trên `(courtId, slotDate, startAt)` sẽ chặn ngay và trả về lỗi `409 Conflict` (`"Khung giờ bạn chọn vừa có người khác đặt hoặc giữ chỗ"`).
  - Lưu document `bookings` với:
    - Mã đơn duy nhất `bookingCode` (ví dụ `SB-20261113-XXXX`).
    - `status = "HOLD"`, `paymentOption = "DEPOSIT_20_PERCENT"`, `paymentStatus = "UNPAID"`, `paidAmount = 0`, `remainingAmount = totalAmount`, `holdExpiresAt`.
- [ ] **3.3.** Kết nối nút *"Đến thanh toán"* trên `CheckoutPage.jsx` với API `POST /api/v1/bookings` và chuyển hướng sang `/payment/:bookingId`.

---

## BƯỚC 4 (M2-04): Khách hàng Thanh toán 100% hoặc Đặt cọc 20% & Xác nhận Đơn (`payments`, `bookings`, `booking_slots`)
> *Hoàn tất thanh toán trong thời gian giữ chỗ 1 giờ để chuyển đơn từ `HOLD` sang `CONFIRMED` và khóa cứng lịch `BOOKED`.*

- [ ] **4.1.** API lấy thông tin đơn đặt sân để thanh toán (`GET /api/v1/bookings/{id}`):
  - Kiểm tra đơn thuộc về `currentUser.id`.
  - Kiểm tra nếu đơn đang `HOLD` nhưng `holdExpiresAt < Instant.now()` thì tự động chuyển sang `EXPIRED`, giải phóng `booking_slots` sang `RELEASED` và thông báo đơn đã hết hạn giữ chỗ.
- [ ] **4.2.** Giao diện màn hình Thanh toán (`/payment/:bookingId` — `PaymentPage.jsx`):
  - Hiển thị đồng hồ đếm ngược thời gian giữ chỗ 1 giờ (`holdExpiresAt`).
  - Chỉ hiển thị 2 lựa chọn thanh toán rõ ràng (không hiển thị phần chọn cổng/phương thức rườm rà):
    1. **Thanh toán 100% (`FULL_PAYMENT`)**: Thanh toán toàn bộ `totalAmount`.
    2. **Đặt cọc 20% (`DEPOSIT_20_PERCENT`)**: Thanh toán trước 20% (`depositRequired`), 80% còn lại thanh toán sau.
- [ ] **4.3.** API xác nhận thanh toán đơn đặt sân (`POST /api/v1/bookings/{id}/payments`):
  - Nhận lựa chọn `paymentOption` (`"FULL_PAYMENT"` hoặc `"DEPOSIT_20_PERCENT"`).
  - Kiểm tra đơn đang ở trạng thái `HOLD` và chưa hết hạn `holdExpiresAt`.
  - Xác định số tiền thanh toán:
    - Nếu `"DEPOSIT_20_PERCENT"`: `amount = booking.depositRequired`, `paymentType = "DEPOSIT"`, cập nhật `booking.paidAmount = depositRequired`, `booking.remainingAmount = totalAmount - depositRequired`, `booking.paymentStatus = "PARTIALLY_PAID"`.
    - Nếu `"FULL_PAYMENT"`: `amount = booking.totalAmount`, `paymentType = "FULL"`, cập nhật `booking.paidAmount = totalAmount`, `booking.remainingAmount = 0`, `booking.paymentStatus = "PAID"`.
  - Cập nhật trạng thái đơn `booking.status = "CONFIRMED"`, `booking.confirmedAt = Instant.now()`.
  - Cập nhật toàn bộ các slot của đơn trong `booking_slots`: chuyển `status` từ `"HOLD"` sang **`"BOOKED"`**, đặt `expiresAt = null`.
  - Lưu bản ghi giao dịch vào collection `payments` (`bookingId`, `customerId`, `type`, `method = "ONLINE"`, `amount`, `status = "PAID"`, sinh mã `transactionCode` duy nhất, `paidAt = Instant.now()`).
- [ ] **4.4.** Kết nối `PaymentPage.jsx` và trang Kết quả thanh toán (`/payment-result/:bookingId` — `PaymentResultPage.jsx`) với API thật.

---

## BƯỚC 5 (M2-05): Khách hàng Xem Lịch sử Đặt sân, Trả nốt 80% & Hủy lịch trước 24h (`bookings`, `booking_slots`, `payments`)
> *Giúp khách hàng quản lý các đơn đã đặt, thanh toán nốt phần còn lại hoặc hủy lịch theo quy tắc hoàn tiền 24 giờ.*

- [ ] **5.1.** API lấy danh sách đơn đặt sân của tôi (`GET /api/v1/bookings/me`):
  - Lọc theo `customerId == currentUser.id`, lọc theo `status` (`HOLD`, `CONFIRMED`, `COMPLETED`, `CANCELLED`, `EXPIRED`), tìm kiếm theo `bookingCode`, sắp xếp mới nhất lên đầu, phân trang.
- [ ] **5.2.** API xem chi tiết đơn đặt sân kèm lịch sử các lần thanh toán (`GET /api/v1/bookings/{id}` + danh sách `payments` của `bookingId`).
- [ ] **5.3.** API thanh toán phần tiền 80% còn lại (`POST /api/v1/bookings/{id}/pay-remaining`):
  - Dành cho đơn đang có `paymentStatus == "PARTIALLY_PAID"` và `remainingAmount > 0`.
  - Tạo bản ghi `payments` mới với `type = "REMAINING"`, `amount = booking.remainingAmount`, `status = "PAID"`.
  - Cập nhật `booking.paidAmount = booking.totalAmount`, `booking.remainingAmount = 0`, `booking.paymentStatus = "PAID"`.
- [ ] **5.4.** API Khách hàng hủy đơn đặt sân (`POST /api/v1/bookings/{id}/cancel`):
  - Chỉ cho phép hủy khi đơn đang ở trạng thái `HOLD` hoặc `CONFIRMED`.
  - Tìm thời điểm bắt đầu sớm nhất (`earliestStartAt`) trong danh sách `booking.items`.
  - **Áp dụng quy tắc hoàn tiền 24 giờ**:
    - Nếu thời điểm hủy cách `earliestStartAt` **>= 24 giờ** và `paidAmount > 0`: Đủ điều kiện hoàn tiền (`isRefundEligible = true`, `refundAmount = paidAmount`), tạo bản ghi `payments` với `type = "REFUND"`, `status = "REFUNDED"` và cập nhật `booking.paymentStatus = "REFUNDED"`.
    - Nếu hủy **< 24 giờ** trước giờ chơi: Không hoàn lại tiền đã cọc (`isRefundEligible = false`, `refundAmount = 0`).
  - Cập nhật `booking.status = "CANCELLED"`, `cancelledBy = "CUSTOMER"`, `cancelledAt = Instant.now()`, lưu `cancelReason`.
  - **Giải phóng khung giờ ngay lập tức**: Cập nhật toàn bộ `booking_slots` của đơn sang `status = "RELEASED"` để khách khác có thể đặt lại khung giờ đó.
- [ ] **5.5.** Kết nối Frontend trang Lịch sử đặt sân (`/account/bookings` — `BookingsPage.jsx`) và Chi tiết đơn đặt sân (`/account/bookings/:id` — `BookingDetailPage.jsx`) với API thật.

---

## BƯỚC 6 (M2-06): Tự động Giải phóng Chỗ giữ quá hạn 1 giờ (`HOLD` -> `EXPIRED`)
> *Đảm bảo không có khung giờ nào bị kẹt ở trạng thái `HOLD` quá 60 phút nếu khách thoát trình duyệt không thanh toán.*

- [ ] **6.1.** Viết hàm quét tự động (`@Scheduled(fixedDelay = 60000)` chạy mỗi 60 giây hoặc chạy trước khi kiểm tra lịch trống):
  - Tìm các đơn trong `bookings` có `status == "HOLD"` và `holdExpiresAt < Instant.now()`.
  - Chuyển trạng thái các đơn đó sang `status = "EXPIRED"`.
  - Chuyển toàn bộ các bản ghi tương ứng trong `booking_slots` từ `"HOLD"` sang `"EXPIRED"` (nhờ đó Partial Unique Index chỉ áp dụng cho `["HOLD", "BOOKED"]` sẽ tự động mở khóa khung giờ cho người mới đặt).

---

## BƯỚC 7 (M2-07): Chủ sân Quản lý Đơn đặt sân, Thu tiền còn lại & Đánh dấu Hoàn thành (`bookings`, `payments`)
> *Sau khi khách đặt sân, Chủ sân quản lý danh sách đơn của các cơ sở thuộc quyền sở hữu của mình.*

- [ ] **7.1.** API Owner lấy danh sách đơn đặt sân tại các cơ sở của mình (`GET /api/v1/owner/bookings`):
  - Chỉ lấy các đơn thuộc các `facilityId` do `currentUser.id` sở hữu.
  - Hỗ trợ lọc theo `facilityId`, `courtId`, ngày đặt (`bookingDate`), `paymentStatus` và tìm kiếm theo `bookingCode`, tên/SĐT khách đặt.
- [ ] **7.2.** Giao diện Quản lý đặt sân của Chủ sân (`/owner/bookings` — `OwnerBookingsPage.jsx`):
  - Hiển thị rõ ràng **danh sách các khung giờ đặt sân** của từng đơn (ví dụ: `12:00 - 13:00, 14:00 - 16:00`), không hiển thị cột trạng thái dư thừa theo đúng yêu cầu giao diện đã chỉnh sửa.
- [ ] **7.3.** API Owner xác nhận đã thu phần tiền 80% còn lại tại sân (`POST /api/v1/owner/bookings/{id}/collect-remaining`):
  - Tạo bản ghi `payments` với `type = "REMAINING"`, `method = "CASH"` (hoặc `"BANK_TRANSFER"`), `amount = remainingAmount`, `status = "PAID"`.
  - Cập nhật `booking.paidAmount = totalAmount`, `booking.remainingAmount = 0`, `booking.paymentStatus = "PAID"`.
- [ ] **7.4.** API Owner đánh dấu đơn đặt sân đã hoàn thành (`POST /api/v1/owner/bookings/{id}/complete`):
  - Chuyển `booking.status = "COMPLETED"`, `completedAt = Instant.now()` (mở khóa điều kiện để khách hàng viết đánh giá sân).
- [ ] **7.5.** API Owner hủy/từ chối đơn đặt sân (`POST /api/v1/owner/bookings/{id}/cancel`):
  - Cập nhật `status = "CANCELLED"`, `cancelledBy = "OWNER"`, giải phóng `booking_slots` sang `"RELEASED"`.
- [ ] **7.6.** Kết nối Frontend 2 trang `/owner/bookings` (`OwnerBookingsPage.jsx`) và `/owner/bookings/:id` (`OwnerBookingDetailPage.jsx`) với API thật.

---

## BƯỚC 8 (M2-08): Chủ sân Xem Lịch biểu Đặt sân Trực quan (`bookings`, `booking_slots`, `blocked_slots`)
> *Giúp Chủ sân theo dõi trực quan toàn bộ các khung giờ Trống / Đang giữ chỗ / Đã đặt / Đang bảo trì trên lưới lịch.*

- [ ] **8.1.** API Owner lấy dữ liệu lịch biểu theo cơ sở và ngày (`GET /api/v1/owner/calendar?facilityId=...&date=yyyy-MM-dd`):
  - Trả về danh sách các sân thuộc cơ sở cùng toàn bộ `timeSlots`, các slot đang `HOLD` / `BOOKED` (kèm tên khách, SĐT, `bookingCode`) và các khoảng `blocked_slots`.
- [ ] **8.2.** Kết nối Frontend trang Lịch biểu trực quan (`/owner/calendar` — `OwnerCalendarPage.jsx`) với API thật.

---

## BƯỚC 9 (M2-09): Chủ sân Thống kê Doanh thu, Báo cáo & Dashboard Chủ sân (`payments`, `bookings`)
> *Tổng hợp số liệu tài chính từ các giao dịch `payments` và đơn đặt sân `bookings` của Chủ sân.*

- [ ] **9.1.** API Owner thống kê doanh thu & báo cáo (`GET /api/v1/owner/revenue?from=...&to=...&facilityId=...`):
  - Tính tổng doanh thu đã thu (`paidAmount`), tổng tiền cọc đã nhận, tổng tiền còn phải thu (`remainingAmount`), tổng số tiền đã hoàn trả (`refundAmount`).
  - Thống kê doanh thu theo từng cơ sở, từng sân và danh sách các giao dịch thanh toán gần nhất.
- [ ] **9.2.** API Owner lấy số liệu tổng quan cho Dashboard Chủ sân (`GET /api/v1/owner/dashboard/summary`):
  - Tổng doanh thu tháng, tổng số đơn đặt sân, số lịch đặt sân hôm nay, danh sách các đơn đặt sân mới nhất.
- [ ] **9.3.** Kết nối Frontend trang Doanh thu (`/owner/revenue` — `OwnerRevenuePage.jsx`) và Dashboard Chủ sân (`/owner` — `OwnerDashboardPage.jsx`) với API thật.

---

## BƯỚC 10 (M2-10): Luồng Đánh giá Sân khép kín (`reviews`, `facilities`, `bookings`)
> *Sau khi đơn đặt sân chuyển sang `COMPLETED` ở Bước 7, Khách hàng có thể đánh giá sân -> Chủ sân phản hồi -> Admin kiểm duyệt.*

- [ ] **10.1.** API Khách hàng tạo đánh giá mới (`POST /api/v1/reviews`):
  - Kiểm tra điều kiện: Đơn `bookingId` phải thuộc về `currentUser.id`, có `status == "COMPLETED"`, và chưa có bản ghi nào trong `reviews` có cùng `bookingId` (`409 Conflict` nếu đánh giá lại lần 2).
  - Validate `rating` (số nguyên từ `1` đến `5`), `comment` (nội dung đánh giá), danh sách ảnh `images` (upload file kèm định danh).
  - Lưu vào collection `reviews` với `status = "VISIBLE"`.
  - **Tự động tính lại và cập nhật `avgRating` và `reviewCount`** của cơ sở (`facilities`) tương ứng.
- [ ] **10.2.** API Public lấy danh sách đánh giá hiển thị của cơ sở/sân (`GET /api/v1/reviews?facilityId=...&courtId=...`):
  - Chỉ trả về các đánh giá có `status == "VISIBLE"`.
- [ ] **10.3.** API Khách hàng xem danh sách các đánh giá đã viết của mình (`GET /api/v1/reviews/me`).
- [ ] **10.4.** API Chủ sân gửi phản hồi cho đánh giá của khách (`POST /api/v1/owner/reviews/{id}/reply`):
  - Kiểm tra đánh giá thuộc cơ sở của Owner, cập nhật trường nhúng `ownerReply: { content, repliedAt: Instant.now() }`.
- [ ] **10.5.** API Admin lấy danh sách toàn bộ đánh giá và ẩn/hiện đánh giá vi phạm (`GET /api/v1/admin/reviews` & `PATCH /api/v1/admin/reviews/{id}/status`):
  - Khi Admin đổi trạng thái giữa `VISIBLE` và `HIDDEN`, tự động tính lại `avgRating` và `reviewCount` của cơ sở.
- [ ] **10.6.** Kết nối cả 4 trang Frontend: Tạo đánh giá (`/account/reviews/new/:bookingId`), Đánh giá của tôi (`/account/reviews`), Quản lý đánh giá của Owner (`/owner/reviews`) và Kiểm duyệt đánh giá của Admin (`/admin/reviews`) với API thật.

---

## BƯỚC 11 (M2-11): Luồng Khiếu nại & Phân xử khép kín (`complaints`, `bookings`)
> *Khách hàng gửi khiếu nại về đơn đặt sân -> Chủ sân gửi giải trình -> Admin ra quyết định xử lý.*

- [ ] **11.1.** API Khách hàng gửi khiếu nại mới (`POST /api/v1/complaints`):
  - Kiểm tra `bookingId` thuộc về `currentUser.id`, lấy `facilityId` từ đơn đặt sân.
  - Lưu `subject`, `content`, danh sách ảnh bằng chứng `images` (upload file kèm định danh), khởi tạo `status = "OPEN"`.
- [ ] **11.2.** API Khách hàng xem danh sách khiếu nại của mình (`GET /api/v1/complaints/me`) và xem chi tiết khiếu nại (`GET /api/v1/complaints/{id}`).
- [ ] **11.3.** API Chủ sân xem danh sách khiếu nại tại cơ sở của mình (`GET /api/v1/owner/complaints`) và gửi phản hồi giải trình (`POST /api/v1/owner/complaints/{id}/respond`):
  - Lưu vào trường nhúng `ownerResponse: { respondedBy: currentUser.id, content, respondedAt: Instant.now() }`.
  - Nếu khiếu nại đang `OPEN` thì chuyển sang `IN_PROGRESS`.
- [ ] **11.4.** API Admin xem toàn bộ khiếu nại trên sàn (`GET /api/v1/admin/complaints`) và cập nhật quyết định xử lý (`POST /api/v1/admin/complaints/{id}/resolve`):
  - Lưu vào trường nhúng `adminResolution: { resolvedBy: adminId, decision, note, resolvedAt: Instant.now() }` và cập nhật `status` (`RESOLVED`, `REJECTED` hoặc `CLOSED`).
- [ ] **11.5.** Kết nối toàn bộ 6 trang Khiếu nại trên Frontend (`/account/complaints`, `/account/complaints/new`, `/account/complaints/:id`, `/owner/complaints`, `/admin/complaints`, `/admin/complaints/:id`) với API thật.

---

## BƯỚC 12 (M2-12): Khách hàng Quản lý Danh sách Cơ sở & Sân Yêu thích (`favorites`)
> *Cho phép khách hàng lưu lại các cơ sở và sân thường chơi để đặt lịch nhanh.*

- [ ] **12.1.** API lấy danh sách yêu thích của tôi (`GET /api/v1/favorites?targetType=FACILITY|COURT`):
  - Trả về danh sách yêu thích của `currentUser.id` kèm thông tin chi tiết của Cơ sở (`facilities`) hoặc Sân (`courts`) tương ứng.
- [ ] **12.2.** API thêm vào danh sách yêu thích (`POST /api/v1/favorites`):
  - Nhận `targetType` (`"FACILITY"` hoặc `"COURT"`) và `targetId`.
  - Đảm bảo không trùng lặp nhờ Unique Compound Index `(userId, targetType, targetId)`.
- [ ] **12.3.** API xóa khỏi danh sách yêu thích (`DELETE /api/v1/favorites/{id}` hoặc theo `targetType` + `targetId`).
- [ ] **12.4.** Kết nối Frontend trang Yêu thích (`/account/favorites` — `FavoritesPage.jsx`) và nút Trái tim trên trang Chi tiết cơ sở / Chi tiết sân với API thật.

---

## BƯỚC 13 (M2-13): Hệ thống Thông báo & Trang Tổng quan Tài khoản Khách hàng (`notifications`)
> *Bước hoàn thiện cuối cùng của Thành viên 2: Gửi thông báo tự động khi Đặt sân / Thanh toán / Khiếu nại và hiển thị trên Header + Trang thông báo.*

- [ ] **13.1.** Viết hàm `NotificationService.createNotification(userId, type, title, body, referenceType, referenceId)` để tự động tạo thông báo trong collection `notifications` khi:
  - Khách giữ chỗ / thanh toán đơn đặt sân thành công (`type = "BOOKING"` / `"PAYMENT"`).
  - Đơn đặt sân bị hủy hoặc hoàn thành (`type = "BOOKING"`).
  - Khiếu nại được Chủ sân phản hồi hoặc Admin giải quyết (`type = "COMPLAINT"`).
- [ ] **13.2.** API lấy danh sách thông báo của người dùng hiện tại (`GET /api/v1/notifications`) và số lượng thông báo chưa đọc (`GET /api/v1/notifications/unread-count`).
- [ ] **13.3.** API đánh dấu 1 thông báo là đã đọc (`PATCH /api/v1/notifications/{id}/read`) và đánh dấu tất cả là đã đọc (`POST /api/v1/notifications/read-all`).
- [ ] **13.4.** Kết nối biểu tượng chuông thông báo trên `PublicHeader.jsx`, trang Thông báo (`/account/notifications` — `NotificationsPage.jsx`) và trang Tổng quan tài khoản (`/account` — `AccountOverviewPage.jsx`) với API thật, xóa `notificationMockService`.

