# SportBooking -- Thiết kế Database MongoDB

-   **Database:** `sportbooking_db`
-   **Hệ quản trị:** MongoDB
-   **Số Collections chính:** 17
-   **Công nghệ backend dự kiến:** Java Spring Boot
-   **Quy ước:** MongoDB sử dụng `_id` kiểu `ObjectId` làm khóa định
    danh mặc định. Các trường tham chiếu như `userId`, `facilityId`,
    `courtId` cũng lưu `ObjectId`, không phải chuỗi tên hoặc email.

> Đây là tài liệu thiết kế logic. MongoDB không yêu cầu khai báo cột cố
> định như SQL; mỗi document trong cùng một Collection có thể có các
> trường khác nhau. Các trường dưới đây là cấu trúc thống nhất mà dự án
> đề xuất sử dụng.

## 1. Quy ước kiểu dữ liệu

  Kiểu                    Ý nghĩa
  ----------------------- ------------------------------------
  `ObjectId`              ID của document hoặc ID tham chiếu
  `String`                Chuỗi ký tự
  `Number`                Số
  `Boolean`               Giá trị đúng/sai
  `Date`                  Ngày giờ
  `Array<T>`              Mảng các phần tử kiểu T
  `Object`                Embedded Document
  `String (YYYY-MM-DD)`   Ngày lịch, không bao gồm giờ

## 2. Danh sách Collections

    STT Collection             Chức năng
  ----- ---------------------- ----------------------------------------
      1 `users`                Tài khoản khách hàng, chủ sân và Admin
      2 `owner_applications`   Hồ sơ đăng ký làm chủ sân
      3 `sports_categories`    Danh mục môn thể thao
      4 `facilities`           Cơ sở thể thao
      5 `courts`               Sân thuộc cơ sở
      6 `operating_hours`      Giờ hoạt động của từng sân
      7 `price_rules`          Quy tắc tính giá sân
      8 `blocked_slots`        Khoảng thời gian sân bị chặn
      9 `bookings`             Đơn đặt sân
     10 `booking_slots`        Các slot được giữ hoặc đã đặt
     11 `payments`             Giao dịch thanh toán
     12 `reviews`              Đánh giá sau khi sử dụng sân
     13 `favorites`            Cơ sở/sân yêu thích
     14 `promotions`           Chương trình khuyến mãi
     15 `promotion_usages`     Lịch sử sử dụng khuyến mãi
     16 `notifications`        Thông báo người dùng
     17 `complaints`           Khiếu nại

------------------------------------------------------------------------

## 3. Chi tiết các Collections

### 3.1. `users` -- Người dùng

Lưu thông tin tài khoản của khách hàng, chủ sân và Admin.

  -----------------------------------------------------------------------------------
  Thuộc tính           Kiểu dữ liệu             Bắt buộc          Mô tả
  -------------------- ------------------------ ----------------- -------------------
  `_id`                ObjectId                 Có                ID người dùng

  `fullName`           String                   Có                Họ và tên

  `email`              String                   Có                Email đăng nhập,
                                                                  duy nhất

  `password`           String                   Có                Mật khẩu đã mã hóa
                                                                  BCrypt

  `phone`              String                   Không             Số điện thoại, duy
                                                                  nhất nếu có

  `avatar`             String                   Không             URL ảnh đại diện

  `address`            Object                   Không             Địa chỉ người dùng

  `address.province`   String                   Không             Tỉnh/thành phố

  `address.district`   String                   Không             Quận/huyện

  `address.ward`       String                   Không             Phường/xã

  `address.detail`     String                   Không             Địa chỉ chi tiết

  `roles`              Array`<String>`{=html}   Có                Các quyền:
                                                                  `CUSTOMER`,
                                                                  `OWNER`, `ADMIN`

  `ownerStatus`        String                   Có                `NOT_REGISTERED`,
                                                                  `PENDING`,
                                                                  `APPROVED`,
                                                                  `REJECTED`

  `status`             String                   Có                `ACTIVE`,
                                                                  `INACTIVE`,
                                                                  `BANNED`

  `isEmailVerified`    Boolean                  Không             Email đã xác thực
                                                                  hay chưa

  `createdAt`          Date                     Có                Ngày tạo

  `updatedAt`          Date                     Có                Ngày cập nhật
  -----------------------------------------------------------------------------------

**Ghi chú:** `roles` xác định quyền hiện tại; `ownerStatus` theo dõi
trạng thái đăng ký Owner. Chỉ cấp quyền `OWNER` sau khi hồ sơ được
duyệt. `isEmailVerified` có thể triển khai khi có chức năng xác thực
email.

### 3.2. `owner_applications` -- Hồ sơ đăng ký chủ sân

  Thuộc tính                 Kiểu dữ liệu             Bắt buộc   Mô tả
  -------------------------- ------------------------ ---------- -----------------------------------
  `_id`                      ObjectId                 Có         ID hồ sơ
  `userId`                   ObjectId                 Có         Tham chiếu `users._id`
  `businessName`             String                   Có         Tên đơn vị kinh doanh
  `businessAddress`          String                   Có         Địa chỉ kinh doanh
  `contactPhone`             String                   Có         Số điện thoại liên hệ
  `documents`                Array`<Object>`{=html}   Không      Danh sách giấy tờ
  `documents[].name`         String                   Không      Tên giấy tờ/tệp
  `documents[].url`          String                   Không      URL tệp
  `documents[].uploadedAt`   Date                     Không      Thời điểm tải lên
  `status`                   String                   Có         `PENDING`, `APPROVED`, `REJECTED`
  `reviewedBy`               ObjectId                 Không      Tham chiếu Admin trong `users`
  `reviewedAt`               Date                     Không      Thời điểm xét duyệt
  `rejectionReason`          String                   Không      Lý do từ chối
  `createdAt`                Date                     Có         Ngày đăng ký
  `updatedAt`                Date                     Có         Ngày cập nhật

### 3.3. `sports_categories` -- Danh mục thể thao

  Thuộc tính      Kiểu dữ liệu   Bắt buộc   Mô tả
  --------------- -------------- ---------- -------------------------------
  `_id`           ObjectId       Có         ID danh mục
  `name`          String         Có         Tên môn thể thao
  `code`          String         Có         Mã duy nhất, ví dụ `FOOTBALL`
  `description`   String         Không      Mô tả
  `icon`          String         Không      Tên icon hoặc URL icon
  `status`        String         Có         `ACTIVE`, `INACTIVE`
  `createdAt`     Date           Có         Ngày tạo
  `updatedAt`     Date           Có         Ngày cập nhật

Danh mục ban đầu: Bóng đá, Cầu lông, Tennis, Pickleball.

### 3.4. `facilities` -- Cơ sở thể thao

  ---------------------------------------------------------------------------------------------
  Thuộc tính               Kiểu dữ liệu             Bắt buộc          Mô tả
  ------------------------ ------------------------ ----------------- -------------------------
  `_id`                    ObjectId                 Có                ID cơ sở

  `ownerId`                ObjectId                 Có                Tham chiếu chủ sở hữu
                                                                      trong `users`

  `name`                   String                   Có                Tên cơ sở

  `description`            String                   Không             Mô tả cơ sở

  `address`                Object                   Có                Địa chỉ cơ sở

  `address.province`       String                   Có                Tỉnh/thành phố

  `address.district`       String                   Có                Quận/huyện

  `address.ward`           String                   Không             Phường/xã

  `address.detail`         String                   Có                Địa chỉ chi tiết

  `location`               Object                   Không             Tọa độ GeoJSON

  `location.type`          String                   Có nếu có         Giá trị `Point`
                                                    location          

  `location.coordinates`   Array`<Number>`{=html}   Có nếu có         `[longitude, latitude]`
                                                    location          

  `images`                 Array`<String>`{=html}   Không             URL ảnh cơ sở

  `amenities`              Array`<String>`{=html}   Không             Tiện ích: bãi xe, nhà vệ
                                                                      sinh, phòng thay đồ...

  `openingHours`           Array`<Object>`{=html}   Không             Giờ hoạt động chung/giới
                                                                      hạn của cơ sở, nếu áp
                                                                      dụng

  `status`                 String                   Có                `PENDING`, `APPROVED`,
                                                                      `REJECTED`, `SUSPENDED`,
                                                                      `INACTIVE`

  `createdAt`              Date                     Có                Ngày tạo

  `updatedAt`              Date                     Có                Ngày cập nhật
  ---------------------------------------------------------------------------------------------

**Ghi chú:** `location.coordinates` theo thứ tự kinh độ trước, vĩ độ
sau. `openingHours` ở cấp cơ sở là giới hạn chung; lịch hoạt động cụ thể
của từng sân nằm trong `operating_hours`.

### 3.5. `courts` -- Sân thể thao

  -----------------------------------------------------------------------------------------------
  Thuộc tính                 Kiểu dữ liệu             Bắt buộc          Mô tả
  -------------------------- ------------------------ ----------------- -------------------------
  `_id`                      ObjectId                 Có                ID sân

  `facilityId`               ObjectId                 Có                Tham chiếu
                                                                        `facilities._id`

  `categoryId`               ObjectId                 Có                Tham chiếu
                                                                        `sports_categories._id`

  `name`                     String                   Có                Tên sân

  `description`              String                   Không             Mô tả sân

  `attributes`               Object                   Không             Thuộc tính linh hoạt theo
                                                                        môn thể thao

  `attributes.surfaceType`   String                   Không             Loại mặt sân

  `attributes.indoor`        Boolean                  Không             Sân trong nhà hay ngoài
                                                                        trời

  `attributes.lighting`      Boolean                  Không             Có hệ thống chiếu sáng

  `images`                   Array`<String>`{=html}   Không             URL ảnh sân

  `capacity`                 Number                   Không             Sức chứa/số người phù hợp

  `status`                   String                   Có                `AVAILABLE`,
                                                                        `MAINTENANCE`, `INACTIVE`

  `createdAt`                Date                     Có                Ngày tạo

  `updatedAt`                Date                     Có                Ngày cập nhật
  -----------------------------------------------------------------------------------------------

**Ghi chú:** Có thể bổ sung thuộc tính riêng trong `attributes` như
`playerCount`, `courtType`, `courtSurface`. Không lưu lặp `capacity` ở
cả cấp ngoài và bên trong `attributes`.

### 3.6. `operating_hours` -- Giờ hoạt động

  Thuộc tính       Kiểu dữ liệu   Bắt buộc     Mô tả
  ---------------- -------------- ------------ ---------------------------------
  `_id`            ObjectId       Có           ID lịch hoạt động
  `courtId`        ObjectId       Có           Tham chiếu `courts._id`
  `dayOfWeek`      Number         Có           1 = Thứ Hai, ..., 7 = Chủ Nhật
  `isOpen`         Boolean        Có           Sân có hoạt động ngày này không
  `openTime`       String         Khi mở cửa   Giờ mở cửa, định dạng `HH:mm`
  `closeTime`      String         Khi mở cửa   Giờ đóng cửa, định dạng `HH:mm`
  `slotDuration`   Number         Có           Thời lượng slot, tính bằng phút
  `createdAt`      Date           Có           Ngày tạo
  `updatedAt`      Date           Có           Ngày cập nhật

### 3.7. `price_rules` -- Quy tắc giá

  ------------------------------------------------------------------------------
  Thuộc tính        Kiểu dữ liệu             Bắt buộc          Mô tả
  ----------------- ------------------------ ----------------- -----------------
  `_id`             ObjectId                 Có                ID quy tắc giá

  `courtId`         ObjectId                 Có                Tham chiếu
                                                               `courts._id`

  `name`            String                   Có                Tên quy tắc

  `daysOfWeek`      Array`<Number>`{=html}   Không             Các ngày áp dụng,
                                                               theo quy ước 1--7

  `startTime`       String                   Có                Giờ bắt đầu,
                                                               `HH:mm`

  `endTime`         String                   Có                Giờ kết thúc,
                                                               `HH:mm`

  `pricePerSlot`    Number                   Có                Giá slot, đơn vị
                                                               VND

  `validFrom`       Date                     Không             Ngày bắt đầu hiệu
                                                               lực

  `validTo`         Date                     Không             Ngày kết thúc
                                                               hiệu lực

  `priority`        Number                   Có                Độ ưu tiên khi
                                                               nhiều quy tắc
                                                               cùng khớp

  `status`          String                   Có                `ACTIVE`,
                                                               `INACTIVE`

  `createdAt`       Date                     Có                Ngày tạo

  `updatedAt`       Date                     Có                Ngày cập nhật
  ------------------------------------------------------------------------------

**Ghi chú:** Backend cần quy định rõ thứ tự ưu tiên, ví dụ ngày lễ \>
cuối tuần \> ngày thường, và xử lý trường hợp các quy tắc bị trùng thời
gian.

### 3.8. `blocked_slots` -- Lịch sân bị chặn

  Thuộc tính    Kiểu dữ liệu   Bắt buộc   Mô tả
  ------------- -------------- ---------- ------------------------------------
  `_id`         ObjectId       Có         ID lịch chặn
  `courtId`     ObjectId       Có         Tham chiếu `courts._id`
  `startAt`     Date           Có         Thời điểm bắt đầu
  `endAt`       Date           Có         Thời điểm kết thúc
  `reason`      String         Có         Lý do chặn
  `createdBy`   ObjectId       Có         Tham chiếu người tạo trong `users`
  `createdAt`   Date           Có         Ngày tạo

### 3.9. `bookings` -- Đơn đặt sân

  --------------------------------------------------------------------------------------
  Thuộc tính                      Kiểu dữ liệu      Bắt buộc          Mô tả
  ------------------------------- ----------------- ----------------- ------------------
  `_id`                           ObjectId          Có                ID booking

  `bookingCode`                   String            Có                Mã đơn dễ đọc, duy
                                                                      nhất

  `customerId`                    ObjectId          Có                Tham chiếu khách
                                                                      hàng trong `users`

  `facilityId`                    ObjectId          Có                Tham chiếu
                                                                      `facilities._id`

  `courtId`                       ObjectId          Có                Tham chiếu
                                                                      `courts._id`

  `bookingDate`                   String            Có                Ngày lịch
                                                                      `YYYY-MM-DD`

  `startAt`                       Date              Có                Thời điểm bắt đầu,
                                                                      lưu UTC

  `endAt`                         Date              Có                Thời điểm kết
                                                                      thúc, lưu UTC

  `duration`                      Number            Có                Thời lượng đặt,
                                                                      tính bằng phút

  `priceDetails`                  Object            Có                Snapshot giá tại
                                                                      thời điểm đặt

  `priceDetails.originalAmount`   Number            Có                Giá ban đầu, VND

  `priceDetails.discountAmount`   Number            Có                Số tiền giảm, VND

  `priceDetails.totalAmount`      Number            Có                Tổng tiền phải
                                                                      trả, VND

  `priceDetails.currency`         String            Có                Đơn vị tiền tệ,
                                                                      mặc định `VND`

  `promotionId`                   ObjectId          Không             Tham chiếu
                                                                      `promotions._id`

  `status`                        String            Có                Trạng thái booking

  `paymentStatus`                 String            Có                Trạng thái thanh
                                                                      toán

  `note`                          String            Không             Ghi chú của khách

  `createdAt`                     Date              Có                Ngày tạo

  `updatedAt`                     Date              Có                Ngày cập nhật
  --------------------------------------------------------------------------------------

Giá trị `status` đề xuất:

-   `PENDING`: Chờ xác nhận.
-   `CONFIRMED`: Đã xác nhận.
-   `REJECTED`: Bị từ chối.
-   `CANCELLED`: Đã hủy.
-   `CHECKED_IN`: Khách đã nhận sân.
-   `COMPLETED`: Đã hoàn thành.
-   `NO_SHOW`: Khách không đến.

Giá trị `paymentStatus` đề xuất:

-   `UNPAID`: Chưa thanh toán.
-   `PENDING`: Đang xử lý.
-   `PAID`: Đã thanh toán.
-   `FAILED`: Thanh toán thất bại.
-   `REFUNDED`: Đã hoàn tiền.
-   `PARTIALLY_REFUNDED`: Hoàn tiền một phần.

**Ghi chú:** Booking lưu snapshot giá để giá lịch sử không thay đổi khi
Owner chỉnh sửa `price_rules`. Booking đã tạo không nên bị xóa vật lý
khi hủy.

### 3.10. `booking_slots` -- Khung giờ đặt sân

  Thuộc tính    Kiểu dữ liệu   Bắt buộc       Mô tả
  ------------- -------------- -------------- ---------------------------
  `_id`         ObjectId       Có             ID slot
  `courtId`     ObjectId       Có             Tham chiếu `courts._id`
  `bookingId`   ObjectId       Có             Tham chiếu `bookings._id`
  `slotDate`    String         Có             Ngày slot `YYYY-MM-DD`
  `startAt`     Date           Có             Thời điểm bắt đầu
  `endAt`       Date           Có             Thời điểm kết thúc
  `status`      String         Có             `HOLD`, `BOOKED`
  `expiresAt`   Date           Chỉ với HOLD   Thời điểm hết hạn giữ chỗ
  `createdAt`   Date           Có             Ngày tạo

**Ghi chú quan trọng:**

-   `HOLD` là giữ chỗ tạm thời; `BOOKED` là slot đã được xác nhận.
-   TTL Index chỉ nên áp dụng cho document HOLD có `expiresAt`. Khi
    chuyển sang BOOKED, cần bỏ `expiresAt`.
-   TTL không xóa đúng thời điểm hết hạn. Backend vẫn phải kiểm tra
    `expiresAt` và trạng thái.
-   Unique Index theo `{courtId, slotDate, startAt}` chỉ chặn trùng thời
    điểm bắt đầu; không tự phát hiện mọi trường hợp khoảng thời gian
    giao nhau.
-   Backend phải kiểm tra overlap và xử lý request đồng thời an toàn.

### 3.11. `payments` -- Thanh toán

  ------------------------------------------------------------------------------
  Thuộc tính          Kiểu dữ liệu      Bắt buộc          Mô tả
  ------------------- ----------------- ----------------- ----------------------
  `_id`               ObjectId          Có                ID thanh toán

  `bookingId`         ObjectId          Có                Tham chiếu
                                                          `bookings._id`

  `customerId`        ObjectId          Có                Tham chiếu khách hàng
                                                          trong `users`

  `amount`            Number            Có                Số tiền giao dịch, VND

  `method`            String            Có                `CASH`,
                                                          `BANK_TRANSFER`,
                                                          `ONLINE`

  `transactionCode`   String            Không             Mã giao dịch

  `status`            String            Có                `PENDING`, `PAID`,
                                                          `FAILED`, `REFUNDED`,
                                                          `PARTIALLY_REFUNDED`

  `paidAt`            Date              Không             Thời điểm thanh toán

  `refundedAt`        Date              Không             Thời điểm hoàn tiền

  `createdAt`         Date              Có                Ngày tạo

  `updatedAt`         Date              Có                Ngày cập nhật
  ------------------------------------------------------------------------------

**Ghi chú:** Một booking có thể có nhiều lần thử thanh toán, do đó không
đặt Unique Index trên `bookingId`. Cần cơ chế idempotency để tránh xử lý
một giao dịch nhiều lần.

### 3.12. `reviews` -- Đánh giá

  Thuộc tính               Kiểu dữ liệu             Bắt buộc   Mô tả
  ------------------------ ------------------------ ---------- -------------------------------------
  `_id`                    ObjectId                 Có         ID đánh giá
  `bookingId`              ObjectId                 Có         Tham chiếu `bookings._id`, duy nhất
  `customerId`             ObjectId                 Có         Tham chiếu khách hàng trong `users`
  `facilityId`             ObjectId                 Có         Tham chiếu `facilities._id`
  `courtId`                ObjectId                 Có         Tham chiếu `courts._id`
  `rating`                 Number                   Có         Số sao, từ 1 đến 5
  `content`                String                   Không      Nội dung đánh giá
  `images`                 Array`<String>`{=html}   Không      URL ảnh đánh giá
  `ownerReply`             Object                   Không      Phản hồi của chủ sân
  `ownerReply.content`     String                   Không      Nội dung phản hồi
  `ownerReply.repliedAt`   Date                     Không      Thời điểm phản hồi
  `status`                 String                   Có         Trạng thái đánh giá
  `createdAt`              Date                     Có         Ngày đánh giá
  `updatedAt`              Date                     Có         Ngày cập nhật

**Quy tắc:** Chỉ booking `COMPLETED` mới được đánh giá; mỗi booking chỉ
được đánh giá tối đa một lần.

### 3.13. `favorites` -- Danh sách yêu thích

  Thuộc tính     Kiểu dữ liệu   Bắt buộc   Mô tả
  -------------- -------------- ---------- -----------------------------
  `_id`          ObjectId       Có         ID yêu thích
  `userId`       ObjectId       Có         Tham chiếu `users._id`
  `targetType`   String         Có         `FACILITY` hoặc `COURT`
  `targetId`     ObjectId       Có         ID cơ sở hoặc sân tương ứng
  `createdAt`    Date           Có         Ngày thêm yêu thích

**Ghi chú:** Dùng `targetType` và `targetId` thay cho việc để `courtId`
null khi người dùng yêu thích cả cơ sở lẫn sân.

### 3.14. `promotions` -- Khuyến mãi

  Thuộc tính         Kiểu dữ liệu   Bắt buộc   Mô tả
  ------------------ -------------- ---------- -------------------------------------
  `_id`              ObjectId       Có         ID khuyến mãi
  `facilityId`       ObjectId       Có         Tham chiếu `facilities._id`
  `ownerId`          ObjectId       Có         Tham chiếu chủ sở hữu trong `users`
  `code`             String         Có         Mã khuyến mãi
  `name`             String         Có         Tên chương trình
  `discountType`     String         Có         `PERCENTAGE`, `FIXED_AMOUNT`
  `discountValue`    Number         Có         Phần trăm hoặc số tiền giảm
  `minOrderAmount`   Number         Không      Giá trị đơn tối thiểu, VND
  `maxDiscount`      Number         Không      Mức giảm tối đa, VND
  `usageLimit`       Number         Không      Tổng lượt sử dụng tối đa
  `usedCount`        Number         Có         Số lượt đã sử dụng
  `startDate`        Date           Có         Ngày bắt đầu
  `endDate`          Date           Có         Ngày kết thúc
  `status`           String         Có         `ACTIVE`, `INACTIVE`, `EXPIRED`
  `createdAt`        Date           Có         Ngày tạo
  `updatedAt`        Date           Có         Ngày cập nhật

### 3.15. `promotion_usages` -- Lịch sử sử dụng khuyến mãi

  Thuộc tính         Kiểu dữ liệu   Bắt buộc   Mô tả
  ------------------ -------------- ---------- ----------------------------------------
  `_id`              ObjectId       Có         ID lịch sử
  `promotionId`      ObjectId       Có         Tham chiếu `promotions._id`
  `userId`           ObjectId       Có         Tham chiếu người sử dụng trong `users`
  `bookingId`        ObjectId       Có         Tham chiếu `bookings._id`
  `discountAmount`   Number         Có         Số tiền được giảm, VND
  `usedAt`           Date           Có         Thời điểm sử dụng

### 3.16. `notifications` -- Thông báo

  -----------------------------------------------------------------------
  Thuộc tính        Kiểu dữ liệu      Bắt buộc          Mô tả
  ----------------- ----------------- ----------------- -----------------
  `_id`             ObjectId          Có                ID thông báo

  `userId`          ObjectId          Có                Tham chiếu người
                                                        nhận trong
                                                        `users`

  `title`           String            Có                Tiêu đề

  `message`         String            Có                Nội dung

  `type`            String            Có                Ví dụ `BOOKING`,
                                                        `PAYMENT`,
                                                        `PROMOTION`,
                                                        `SYSTEM`

  `referenceId`     ObjectId          Không             ID đối tượng liên
                                                        quan

  `isRead`          Boolean           Có                Đã đọc hay chưa

  `createdAt`       Date              Có                Ngày tạo
  -----------------------------------------------------------------------

### 3.17. `complaints` -- Khiếu nại

  --------------------------------------------------------------------------------------
  Thuộc tính               Kiểu dữ liệu             Bắt buộc          Mô tả
  ------------------------ ------------------------ ----------------- ------------------
  `_id`                    ObjectId                 Có                ID khiếu nại

  `userId`                 ObjectId                 Có                Tham chiếu người
                                                                      gửi trong `users`

  `bookingId`              ObjectId                 Không             Tham chiếu
                                                                      `bookings._id`

  `facilityId`             ObjectId                 Không             Tham chiếu
                                                                      `facilities._id`

  `subject`                String                   Có                Tiêu đề khiếu nại

  `content`                String                   Có                Nội dung khiếu nại

  `images`                 Array`<String>`{=html}   Không             URL ảnh minh chứng

  `response`               Object                   Không             Phản hồi xử lý

  `response.content`       String                   Không             Nội dung phản hồi

  `response.respondedBy`   ObjectId                 Không             Tham chiếu người
                                                                      phản hồi trong
                                                                      `users`

  `response.respondedAt`   Date                     Không             Thời điểm phản hồi

  `status`                 String                   Có                `PENDING`,
                                                                      `PROCESSING`,
                                                                      `RESOLVED`,
                                                                      `REJECTED`

  `createdAt`              Date                     Có                Ngày tạo

  `updatedAt`              Date                     Có                Ngày cập nhật
  --------------------------------------------------------------------------------------

------------------------------------------------------------------------

## 4. Tổng hợp quan hệ giữa các Collections

MongoDB không tự áp đặt khóa ngoại như hệ quản trị quan hệ. Các liên kết
ObjectId dưới đây cần được kiểm tra trong tầng Service của Spring Boot.

  --------------------------------------------------------------------------------
  Collection nguồn       Collection được tham  Quan hệ logic     Trường tham chiếu
                         chiếu                                   
  ---------------------- --------------------- ----------------- -----------------
  `owner_applications`   `users`               N-1               `userId`

  `owner_applications`   `users` (Admin)       N-1               `reviewedBy`

  `facilities`           `users`               N-1               `ownerId`

  `courts`               `facilities`          N-1               `facilityId`

  `courts`               `sports_categories`   N-1               `categoryId`

  `operating_hours`      `courts`              N-1               `courtId`

  `price_rules`          `courts`              N-1               `courtId`

  `blocked_slots`        `courts`              N-1               `courtId`

  `blocked_slots`        `users`               N-1               `createdBy`

  `bookings`             `users`               N-1               `customerId`

  `bookings`             `facilities`          N-1               `facilityId`

  `bookings`             `courts`              N-1               `courtId`

  `bookings`             `promotions`          N-1               `promotionId`

  `booking_slots`        `courts`              N-1               `courtId`

  `booking_slots`        `bookings`            N-1               `bookingId`

  `payments`             `bookings`            N-1               `bookingId`

  `payments`             `users`               N-1               `customerId`

  `reviews`              `bookings`            1-0..1            `bookingId`

  `reviews`              `users`               N-1               `customerId`

  `reviews`              `facilities`          N-1               `facilityId`

  `reviews`              `courts`              N-1               `courtId`

  `favorites`            `users`               N-1               `userId`

  `favorites`            `facilities` hoặc     Tham chiếu đa     `targetType`,
                         `courts`              loại              `targetId`

  `promotions`           `facilities`          N-1               `facilityId`

  `promotions`           `users`               N-1               `ownerId`

  `promotion_usages`     `promotions`          N-1               `promotionId`

  `promotion_usages`     `users`               N-1               `userId`

  `promotion_usages`     `bookings`            1-1 theo booking  `bookingId`

  `notifications`        `users`               N-1               `userId`

  `complaints`           `users`               N-1               `userId`

  `complaints`           `bookings`            N-1, tùy chọn     `bookingId`

  `complaints`           `facilities`          N-1, tùy chọn     `facilityId`
  --------------------------------------------------------------------------------

## 5. Danh sách Index đề xuất

Các Index nên được tạo bằng script trong Mongosh hoặc MongoDB Compass.

  -------------------------------------------------------------------------------------------
  Collection              Index                                       Tùy chọn
  ----------------------- ------------------------------------------- -----------------------
  `users`                 `{email: 1}`                                Unique

  `users`                 `{phone: 1}`                                Unique, Sparse

  `users`                 `{roles: 1}`                                Thường

  `owner_applications`    `{userId: 1, createdAt: -1}`                Thường

  `owner_applications`    `{status: 1, createdAt: -1}`                Thường

  `sports_categories`     `{code: 1}`                                 Unique

  `facilities`            `{ownerId: 1}`                              Thường

  `facilities`            `{location: "2dsphere"}`                    Geospatial

  `facilities`            `{status: 1}`                               Thường

  `courts`                `{facilityId: 1}`                           Thường

  `courts`                `{categoryId: 1}`                           Thường

  `courts`                `{facilityId: 1, status: 1}`                Thường

  `operating_hours`       `{courtId: 1, dayOfWeek: 1}`                Unique

  `price_rules`           `{courtId: 1, status: 1}`                   Thường

  `blocked_slots`         `{courtId: 1, startAt: 1}`                  Thường

  `bookings`              `{bookingCode: 1}`                          Unique

  `bookings`              `{customerId: 1, createdAt: -1}`            Thường

  `bookings`              `{courtId: 1, bookingDate: 1, status: 1}`   Thường

  `bookings`              `{facilityId: 1, createdAt: -1}`            Thường

  `booking_slots`         `{courtId: 1, slotDate: 1, startAt: 1}`     Partial Unique, chỉ
                                                                      `HOLD`/`BOOKED`

  `booking_slots`         `{bookingId: 1}`                            Thường

  `booking_slots`         `{expiresAt: 1}`                            TTL, chỉ gán cho HOLD

  `payments`              `{bookingId: 1}`                            Thường

  `payments`              `{customerId: 1, createdAt: -1}`            Thường

  `payments`              `{transactionCode: 1}`                      Unique, Sparse nếu có
                                                                      mã

  `reviews`               `{bookingId: 1}`                            Unique

  `reviews`               `{facilityId: 1, createdAt: -1}`            Thường

  `favorites`             `{userId: 1, targetType: 1, targetId: 1}`   Unique

  `promotions`            `{facilityId: 1, code: 1}`                  Unique

  `promotions`            `{status: 1, startDate: 1, endDate: 1}`     Thường

  `promotion_usages`      `{bookingId: 1}`                            Unique

  `promotion_usages`      `{promotionId: 1, userId: 1}`               Thường

  `notifications`         `{userId: 1, isRead: 1, createdAt: -1}`     Thường

  `complaints`            `{userId: 1, createdAt: -1}`                Thường

  `complaints`            `{status: 1, createdAt: -1}`                Thường
  -------------------------------------------------------------------------------------------

**Lưu ý về Index:**

1.  Unique Index chỉ tạo thành công nếu dữ liệu hiện có không vi phạm
    tính duy nhất.
2.  `booking_slots` cần Partial Unique Index để slot đã hủy/giải phóng
    không chặn khách đặt lại. Nếu giữ document trạng thái hủy, phải
    thiết kế điều kiện partial tương ứng.
3.  TTL không đảm bảo xóa document đúng thời điểm hết hạn. Backend phải
    tự kiểm tra thời gian giữ chỗ.
4.  Index slot không tự phát hiện mọi khoảng thời gian giao nhau.
    Backend cần kiểm tra overlap và xử lý đồng thời.
5.  Với `favorites`, `targetId` phải là ID đúng loại theo `targetType`;
    backend phải xác thực đối tượng tồn tại.

## 6. Các quy tắc nghiệp vụ và toàn vẹn dữ liệu

-   Một Owner có thể sở hữu nhiều Facility.
-   Một Facility có thể có nhiều Court.
-   Một Court thuộc đúng một Facility và một Sports Category.
-   Mỗi Court có tối đa một lịch hoạt động cho mỗi thứ trong tuần theo
    mô hình lịch đơn giản.
-   Một Booking thuộc một Customer, một Facility và một Court.
-   Một Booking có thể có nhiều lần thử thanh toán.
-   Một Booking chỉ được đánh giá tối đa một lần.
-   Một Booking chỉ áp dụng tối đa một promotion trong mô hình hiện tại.
-   Chỉ booking `COMPLETED` mới được đánh giá.
-   Không xóa vật lý booking đã phát sinh giao dịch; sử dụng trạng thái
    hủy.
-   Giá booking phải được lưu snapshot, không tính lại từ quy tắc giá
    hiện tại.
-   Khi hủy booking, phải giải phóng slot tương ứng.
-   Backend phải xác thực các ObjectId tham chiếu vì MongoDB không tự
    enforce foreign key.
-   Nếu cần transaction cho nhiều thao tác booking/payment, MongoDB phải
    chạy replica set; môi trường local có thể cấu hình single-node
    replica set.

## 7. Collections tùy chọn (chưa nằm trong 17 Collections chính)

### 7.1. `complaint_messages`

Chỉ bổ sung nếu muốn khách hàng và Admin trao đổi nhiều lần trong một
khiếu nại.

  Thuộc tính      Kiểu dữ liệu             Mô tả
  --------------- ------------------------ ------------------------------------
  `_id`           ObjectId                 ID tin nhắn
  `complaintId`   ObjectId                 Tham chiếu `complaints._id`
  `senderId`      ObjectId                 Tham chiếu người gửi trong `users`
  `content`       String                   Nội dung
  `images`        Array`<String>`{=html}   Ảnh đính kèm
  `createdAt`     Date                     Thời điểm gửi

### 7.2. `audit_logs`

Chỉ bổ sung nếu cần lưu lịch sử thao tác quan trọng của Admin/Owner.

  Thuộc tính      Kiểu dữ liệu   Mô tả
  --------------- -------------- ---------------------
  `_id`           ObjectId       ID log
  `userId`        ObjectId       Người thực hiện
  `action`        String         Hành động
  `entityType`    String         Loại đối tượng
  `entityId`      ObjectId       ID đối tượng
  `description`   String         Mô tả thao tác
  `createdAt`     Date           Thời điểm thực hiện

## 8. Quy ước triển khai Spring Boot

-   Dùng `@Document(collection = "ten_collection")` cho mỗi lớp
    Document.
-   Dùng `@Id private String id;` hoặc `ObjectId` để ánh xạ `_id`.
-   Các trường tham chiếu dùng `String` hoặc `ObjectId` theo quy ước
    thống nhất của dự án; giá trị lưu trong MongoDB phải là BSON
    ObjectId nếu thiết kế yêu cầu ObjectId.
-   Không lưu mật khẩu dạng văn bản thuần; sử dụng BCrypt.
-   Ngày giờ nghiệp vụ nên lưu nhất quán theo UTC; giao diện hiển thị
    theo múi giờ `Asia/Ho_Chi_Minh`.
-   `bookingDate` là ngày lịch dạng `YYYY-MM-DD`; `startAt` và `endAt`
    là thời điểm Date.
-   Cấu hình URI MongoDB qua biến môi trường, không commit mật khẩu hoặc
    thông tin kết nối bí mật lên Git.

Ví dụ `application.properties`:

``` properties
spring.data.mongodb.uri=${MONGODB_URI}
```

Ví dụ `.env.example`:

``` env
MONGODB_URI=mongodb://localhost:27017/sportbooking_db
```

------------------------------------------------------------------------

**Kết luận:** Database SportBooking gồm 17 Collections chính, sử dụng
Reference cho các dữ liệu liên kết và Embedded Document cho các dữ liệu
nhỏ, thường được đọc cùng nhau. Hai Collections `complaint_messages` và
`audit_logs` là tùy chọn, không bắt buộc triển khai trong phiên bản đầu
tiên.
