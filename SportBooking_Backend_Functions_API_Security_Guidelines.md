# SPORTBOOKING --- BACKEND FUNCTIONAL SPECIFICATION & ENGINEERING GUIDELINES

**Phiên bản:** 2.0 \| **Ngày:** 08/11/2026\
**Stack:** Java Spring Boot · MongoDB · ReactJS\
**Mục tiêu:** Đặc tả chức năng theo vai trò, API contract mẫu, quy tắc
nghiệp vụ, bảo mật, xác thực/phân quyền, hiệu năng và xử lý đồng thời.

------------------------------------------------------------------------

## 1. Tổng quan và quy ước

SportBooking hỗ trợ tìm kiếm, quản lý và đặt sân bóng đá, cầu lông,
tennis, pickleball và các môn khác.

### 1.1 Vai trò

  ---------------------------------------------------------------------
  Vai trò                            Phạm vi
  ---------------------------------- ----------------------------------
  Guest                              Người chưa đăng nhập; xem/tìm kiếm
                                     thông tin công khai, đăng ký, đăng
                                     nhập.

  Customer                           Quản lý hồ sơ, tìm sân, đặt sân,
                                     thanh toán, hủy booking, review,
                                     yêu thích, thông báo, khiếu nại.

  Owner                              Quản lý cơ sở/sân thuộc quyền sở
                                     hữu, giá, lịch, booking, khuyến
                                     mãi, doanh thu, phản hồi.

  Admin                              Quản trị người dùng, duyệt
                                     Owner/cơ sở, danh mục, booking,
                                     payment, review, complaint và
                                     thống kê.
  ---------------------------------------------------------------------

Một tài khoản có thể có `CUSTOMER` và `OWNER`. Quyền Owner chỉ có hiệu
lực sau khi Admin duyệt. Không nhận role từ frontend.

### 1.2 16 MongoDB collections

`users`, `owner_applications`, `sports_categories`, `facilities`,
`courts`, `operating_hours`, `price_rules`, `blocked_slots`, `bookings`,
`booking_slots`, `payments`, `reviews`, `favorites`, `s`, `_usages`,
`notifications`, `complaints`.

Có thể bổ sung `complaint_messages`, `audit_logs` nếu cần hội thoại
khiếu nại và kiểm toán chi tiết.

### 1.3 Quy ước kỹ thuật

-   API prefix: `/api/v1`; JSON UTF-8; field `camelCase`.
-   Mongo ObjectId truyền qua API dưới dạng chuỗi 24 ký tự hex.
-   Thời gian lưu UTC; hiển thị `Asia/Ho_Chi_Minh`; ngày đặt sân
    `yyyy-MM-dd`.
-   Timestamp API dùng ISO-8601 có timezone, ví dụ
    `2026-11-10T08:00:00+07:00`.
-   Tiền dùng `BigDecimal` trong Java và Decimal128 hoặc số nguyên có
    quy ước rõ trong MongoDB; không dùng `float`/`double`.
-   Backend là nguồn sự thật duy nhất cho quyền, giá, discount, trạng
    thái và khả năng đặt sân.
-   Không trả password/hash/token/secret hoặc document nội bộ trực tiếp.

------------------------------------------------------------------------

## 2. Ma trận quyền tổng quát

  -------------------------------------------------------------------------
  Nhóm chức năng        Guest       Customer        Owner         Admin
  ----------------- ------------- ------------- ------------- -------------
  Xem cơ sở/sân           ✓             ✓             ✓             ✓
  đang hoạt động                                              

  Tìm kiếm, lọc,          ✓             ✓             ✓             ✓
  xem lịch trống                                              

  Đăng ký/đăng            ✓             ✓             ✓             ✓
  nhập/quên mật                                               
  khẩu                                                        

  Quản lý hồ sơ của      ---            ✓             ✓             ✓
  mình                                                        

  Đặt sân/thanh          ---            ✓        Có thể dùng       ---
  toán                                              quyền     
                                                  Customer    

  Xem/hủy booking        ---            ✓             ✓            ---
  của mình                                                    

  Đánh giá sau           ---            ✓         ✓ nếu là     Kiểm duyệt
  booking                                         khách đặt   

  Yêu thích/thông        ---            ✓             ✓        Xử lý khiếu
  báo/khiếu nại                                                    nại

  Đăng ký Owner          ---            ✓        Đã có quyền       ---

  Quản lý cơ             ---           ---       ✓, dữ liệu        ---
  sở/sân/giá/lịch                                 của mình    

  Xác nhận/từ chối       ---           ---      ✓, cơ sở của       ---
  booking                                           mình      

  Dashboard vận          ---           ---       Phạm vi của    Dashboard
  hành                                              mình       user/Owner
                                                               application

  Duyệt Owner            ---           ---           ---            ✓
  application                                                 

  Quản lý user/danh      ---           ---           ---            ✓
  mục                                                         
  -------------------------------------------------------------------------

**Giới hạn Admin:** Admin không có chức năng quản lý facility/court,
quản lý booking toàn sàn hoặc quản lý payment. Admin có thể kiểm duyệt
review, xử lý complaint và quản trị tài khoản/hồ sơ Owner.

## 3. Chuẩn API và response

### 3.1 HTTP method

  Method   Mục đích
  -------- ---------------------------------------------
  GET      Đọc dữ liệu, không thay đổi trạng thái
  POST     Tạo tài nguyên hoặc thực hiện command
  PUT      Thay thế toàn bộ tài nguyên khi thật sự cần
  PATCH    Cập nhật một phần/chuyển trạng thái
  DELETE   Xóa hoặc gỡ liên kết

Không dùng GET để thay đổi dữ liệu. Nên dùng command rõ ràng như
`/cancel`, `/confirm`, `/reject`, `/refund`.

### 3.2 Response thành công chuẩn

``` json
{
  "success": true,
  "message": "Lấy dữ liệu thành công",
  "data": {},
  "meta": {
    "page": 0,
    "size": 10,
    "totalElements": 1,
    "totalPages": 1,
    "hasNext": false
  },
  "timestamp": "2026-11-08T12:00:00Z",
  "requestId": "req_01J..."
}
```

`meta` chỉ cần cho API phân trang. `data` có thể là object, array hoặc
null.

### 3.3 Response lỗi chuẩn

``` json
{
  "success": false,
  "message": "Dữ liệu không hợp lệ",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "field": "phone",
        "code": "INVALID_FORMAT",
        "message": "Số điện thoại không đúng định dạng"
      }
    ]
  },
  "timestamp": "2026-11-08T12:00:00Z",
  "path": "/api/v1/users/me",
  "requestId": "req_01J..."
}
```

Không trả stack trace, query MongoDB, tên class nội bộ hoặc secret trong
production.

### 3.4 HTTP status

  Code   Ý nghĩa
  ------ -----------------------------------------------------
  200    Thành công
  201    Tạo thành công
  202    Đã tiếp nhận xử lý bất đồng bộ
  204    Thành công, không có body
  400    Sai cấu trúc/validation
  401    Chưa xác thực/token không hợp lệ hoặc hết hạn
  403    Không có quyền
  404    Không tìm thấy hoặc che giấu tài nguyên ngoài quyền
  409    Xung đột, slot đã được đặt, duplicate
  422    Vi phạm quy tắc nghiệp vụ
  429    Quá giới hạn request
  500    Lỗi không dự kiến
  503    Dịch vụ tạm thời không sẵn sàng

Chọn một quy ước nhất quán giữa 400 và 422 cho validation/nghiệp vụ.

### 3.5 Query và header

``` http
GET /api/v1/facilities?page=0&size=12&sort=createdAt,desc&keyword=Cam%20Le
Authorization: Bearer <access_token>
Content-Type: application/json
X-Request-Id: <optional-id>
Idempotency-Key: <unique-key>
```

-   `page` mặc định 0; `size` mặc định 10, tối đa 100 hoặc thấp hơn tùy
    API.
-   `sort` chỉ chấp nhận field whitelist.
-   Trim/giới hạn độ dài `keyword`; validate mọi filter.
-   Không nhận raw MongoDB operator/query từ client.
-   Dùng `Idempotency-Key` cho booking/payment/refund và command dễ bị
    gửi lại do timeout.

------------------------------------------------------------------------

## 4. Chức năng chung

### 4.1 Đăng ký

**POST `/api/v1/auth/register`** --- Guest.

Request:

``` json
{
  "fullName": "Nguyen Van A",
  "email": "a@example.com",
  "password": "StrongPassword123!",
  "phone": "0901234567"
}
```

Response 201:

``` json
{
  "success": true,
  "message": "Đăng ký thành công. Vui lòng xác minh email.",
  "data": {
    "userId": "672a1b2c3d4e5f6071829301",
    "fullName": "Nguyen Van A",
    "email": "a@example.com",
    "roles": ["CUSTOMER"],
    "ownerStatus": "NOT_REGISTERED",
    "isEmailVerified": false
  }
}
```

Ràng buộc: - Email trim + lowercase, unique. - Password hash
BCrypt/Argon2; không lưu plaintext. - Không nhận `roles`, `ownerStatus`,
`status`, `isEmailVerified` từ client. - Mặc định `roles=["CUSTOMER"]`,
`ownerStatus=NOT_REGISTERED`, `status=ACTIVE`,
`isEmailVerified=false`. - Rate limit đăng ký; không để endpoint hỗ trợ
dò email quá dễ. - Xác minh email bằng token ngẫu nhiên một lần, có hạn;
không dùng access token làm token xác minh.

### 4.2 Đăng nhập

**POST `/api/v1/auth/login`** --- Guest.

Request:

``` json
{ "email": "a@example.com", "password": "StrongPassword123!" }
```

Response 200 (ví dụ access token trả body, refresh token qua cookie):

``` json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "accessToken": "<short-lived-access-token>",
    "tokenType": "Bearer",
    "expiresIn": 900,
    "user": {
      "id": "672a1b2c3d4e5f6071829301",
      "fullName": "Nguyen Van A",
      "email": "a@example.com",
      "roles": ["CUSTOMER"],
      "ownerStatus": "NOT_REGISTERED"
    }
  }
}
```

Ràng buộc: - Thông báo chung cho email không tồn tại/password sai. -
Kiểm tra user `ACTIVE`, trạng thái xác minh theo policy. - Rate limit,
backoff khi sai nhiều lần. - Refresh token đặt cookie
`HttpOnly; Secure; SameSite` phù hợp; không trả refresh token trong
JSON. - Không log password/token.

### 4.3 Refresh token

**POST `/api/v1/auth/refresh`** --- refresh token lấy từ cookie.

Response:

``` json
{
  "success": true,
  "message": "Làm mới token thành công",
  "data": {
    "accessToken": "<new-access-token>",
    "tokenType": "Bearer",
    "expiresIn": 900
  }
}
```

Ràng buộc: - Access token ngắn hạn, ví dụ 10--15 phút. - Refresh token
dài hạn hơn, ví dụ 7--30 ngày theo policy. - Refresh rotation: mỗi lần
refresh cấp token mới, vô hiệu token cũ. - Lưu hash refresh
token/session ở server, không lưu token thô. - Phát hiện token cũ bị
reuse thì thu hồi token family/session liên quan. - Gắn session với
user, expiry, trạng thái tài khoản và thiết bị ở mức tối thiểu. -
Refresh phải kiểm tra Origin/CSRF khi dùng cookie. - JWT stateless không
tự thu hồi tức thời; cần session/version/denylist hoặc TTL ngắn nếu yêu
cầu revoke nhanh.

### 4.4 Đăng xuất và phiên đăng nhập

  --------------------------------------------------------------------------
  API                                              Vai trò      Chức năng
  ------------------------------------------------ ------------ ------------
  `POST /api/v1/auth/logout`                       Đã đăng nhập Thu hồi
                                                                phiên hiện
                                                                tại, xóa
                                                                cookie

  `POST /api/v1/auth/logout-all`                   Đã đăng nhập Thu hồi mọi
                                                                phiên

  `GET /api/v1/users/me/sessions`                  Đã đăng nhập Xem phiên
                                                                của mình

  `DELETE /api/v1/users/me/sessions/{sessionId}`   Đã đăng nhập Thu hồi một
                                                                phiên
  --------------------------------------------------------------------------

Response logout:

``` json
{ "success": true, "message": "Đăng xuất thành công", "data": null }
```

Lưu ý: access token có thể còn hiệu lực đến khi hết hạn nếu không dùng
denylist/session check. Phải ghi rõ chính sách.

### 4.5 Quên/đổi mật khẩu và xác minh email

  --------------------------------------------------------------------------
  API                                              Vai trò      Chức năng
  ------------------------------------------------ ------------ ------------
  `POST /api/v1/auth/forgot-password`              Guest        Gửi hướng
                                                                dẫn reset

  `POST /api/v1/auth/reset-password`               Guest        Reset bằng
                                                                one-time
                                                                token

  `POST /api/v1/auth/change-password`              Đã đăng nhập Đổi mật khẩu

  `POST /api/v1/auth/email/verification/request`   Đã đăng nhập Gửi lại
                                                                email xác
                                                                minh

  `POST /api/v1/auth/email/verification/confirm`   Guest        Xác nhận
                                                                token
  --------------------------------------------------------------------------

Forgot request:

``` json
{ "email": "a@example.com" }
```

Response luôn chung chung:

``` json
{
  "success": true,
  "message": "Nếu email hợp lệ, hướng dẫn đặt lại mật khẩu sẽ được gửi."
}
```

Reset request:

``` json
{
  "token": "<one-time-token>",
  "newPassword": "NewStrongPassword123!"
}
```

Ràng buộc: token reset lưu hash, dùng một lần, hết hạn ngắn; reset thành
công thu hồi refresh sessions; không gửi password mới qua email. Change
password yêu cầu mật khẩu hiện tại hoặc xác thực tăng cường.

### 4.6 Hồ sơ cá nhân

  --------------------------------------------------------------------------
  API                                Vai trò                Chức năng
  ---------------------------------- ---------------------- ----------------
  `GET /api/v1/users/me`             Customer/Owner/Admin   Xem hồ sơ

  `PATCH /api/v1/users/me`           Customer/Owner/Admin   Sửa hồ sơ

  `PATCH /api/v1/users/me/avatar`    Customer/Owner/Admin   Cập nhật avatar

  `DELETE /api/v1/users/me/avatar`   Customer/Owner/Admin   Gỡ avatar
  --------------------------------------------------------------------------

Request:

``` json
{
  "fullName": "Nguyen Van B",
  "phone": "0901234567",
  "address": {
    "province": "Da Nang",
    "district": "Cam Le",
    "ward": "Hoa Xuan",
    "detail": "..."
  }
}
```

Ràng buộc: không cho sửa role/status/password/ownerStatus/emailVerified
qua API profile; đổi email cần xác minh; avatar kiểm tra MIME thực tế,
kích thước và quyền truy cập. User ID luôn lấy từ principal.

### 4.7 Danh mục, tìm kiếm cơ sở/sân và phân trang

  ------------------------------------------------------------------------
  API                                    Vai trò          Chức năng
  -------------------------------------- ---------------- ----------------
  `GET /api/v1/sports-categories`        Tất cả           Danh sách danh
                                                          mục ACTIVE, có
                                                          phân trang

  `GET /api/v1/sports-categories/{id}`   Tất cả           Chi tiết danh
                                                          mục

  `GET /api/v1/facilities`               Tất cả           Tìm/lọc cơ sở đã
                                                          duyệt, có phân
                                                          trang

  `GET /api/v1/facilities/{id}`          Tất cả           Chi tiết cơ sở
                                                          công khai

  `GET /api/v1/facilities/{id}/courts`   Tất cả           Danh sách sân,
                                                          có phân trang

  `GET /api/v1/courts/{id}`              Tất cả           Chi tiết sân

  `GET /api/v1/facilities/nearby`        Tất cả           Tìm gần vị trí,
                                                          có phân
                                                          trang/giới hạn
                                                          kết quả

  `GET /api/v1/search`                   Tất cả           Tìm tổng hợp nếu
                                                          cần, có phân
                                                          trang
  ------------------------------------------------------------------------

Ví dụ:

``` http
GET /api/v1/facilities?keyword=Cam%20Le&categoryId=672a1b2c3d4e5f6071829301&minPrice=100000&maxPrice=500000&page=0&size=12&sort=createdAt,desc
GET /api/v1/facilities/672a1b2c3d4e5f6071829302/courts?page=0&size=10
```

Response rút gọn:

``` json
{
  "success": true,
  "message": "Lấy danh sách sân thành công",
  "data": [
    {
      "id": "672a1b2c3d4e5f6071829303",
      "name": "Sân cầu lông số 1",
      "status": "AVAILABLE"
    }
  ],
  "meta": {
    "page": 0,
    "size": 10,
    "totalElements": 1,
    "totalPages": 1,
    "hasNext": false
  }
}
```

Ràng buộc: - Tất cả endpoint trả danh sách có khả năng tăng trưởng phải
phân trang; không trả toàn bộ collection. - `page` mặc định 0; `size`
mặc định 10; giới hạn tối đa 100 (có thể thấp hơn cho endpoint nặng). -
`sort` chỉ nhận các field được whitelist; luôn có tie-break bằng `_id`
để kết quả ổn định. - Với dữ liệu rất lớn hoặc cuộn liên tục, ưu tiên
cursor pagination theo cặp `{createdAt, _id}`. - Chỉ hiển thị facility
`APPROVED`; chỉ sân `AVAILABLE` được đề xuất đặt. - Giá trong danh sách
là tham khảo; backend tính lại khi tạo booking. - GeoJSON Point dùng
`[longitude, latitude]`; validate tọa độ và bán kính; dùng `2dsphere`
index. - Không nhận filter/sort MongoDB tùy ý từ client.

### 4.8 Xem lịch trống và giá dự kiến

**GET `/api/v1/courts/{courtId}/availability?date=2026-11-10`**

Response:

``` json
{
  "success": true,
  "message": "Lấy lịch trống thành công",
  "data": {
    "courtId": "672a1b2c3d4e5f6071829303",
    "date": "2026-11-10",
    "timezone": "Asia/Ho_Chi_Minh",
    "slots": [
      {
        "startAt": "2026-11-10T08:00:00+07:00",
        "endAt": "2026-11-10T09:00:00+07:00",
        "price": 150000,
        "currency": "VND",
        "status": "AVAILABLE"
      }
    ]
  }
}
```

Ràng buộc: tính theo giờ hoạt động, duration, blocked slots, booking đã
xác nhận, hold chưa hết hạn và price rules có hiệu lực. Nếu nhiều rule
cùng khớp phải có priority/tie-break xác định. Availability chỉ tham
khảo; tạo booking phải kiểm tra lại atomic.

------------------------------------------------------------------------

## 5. Chức năng Customer

### 5.1 Tạo booking với nhiều khung giờ trong một lần đặt

**API:** `POST /api/v1/bookings` --- CUSTOMER.

Một booking chứa nhiều khung giờ của **cùng một sân**. Mỗi phần tử trong
`items` là một khoảng thuê; các khoảng có thể cách nhau nhưng không được
chồng lấn. Nếu cần đặt sân khác, tạo booking riêng để quyền sở hữu, giá
và trạng thái xử lý rõ ràng.

Request:

``` json
{
  "courtId": "672a1b2c3d4e5f6071829303",
  "items": [
    {
      "bookingDate": "2026-11-10",
      "startAt": "2026-11-10T08:00:00+07:00",
      "endAt": "2026-11-10T09:00:00+07:00"
    },
    {
      "bookingDate": "2026-11-10",
      "startAt": "2026-11-10T10:00:00+07:00",
      "endAt": "2026-11-10T12:00:00+07:00"
    }
  ],
  "paymentOption": "DEPOSIT_20_PERCENT",
  "note": "Vui lòng chuẩn bị bóng"
}
```

`paymentOption` nhận `DEPOSIT_20_PERCENT` hoặc `FULL_PAYMENT`. Không
nhận tổng tiền, đơn giá, discount hay customerId từ client.

Response 201:

``` json
{
  "success": true,
  "message": "Tạo booking và giữ các khung giờ thành công",
  "data": {
    "bookingId": "672a1b2c3d4e5f6071829304",
    "bookingCode": "SB-20261110-000001",
    "courtId": "672a1b2c3d4e5f6071829303",
    "items": [
      {
        "bookingDate": "2026-11-10",
        "startAt": "2026-11-10T01:00:00Z",
        "endAt": "2026-11-10T02:00:00Z",
        "durationMinutes": 60,
        "amount": 150000
      },
      {
        "bookingDate": "2026-11-10",
        "startAt": "2026-11-10T03:00:00Z",
        "endAt": "2026-11-10T05:00:00Z",
        "durationMinutes": 120,
        "amount": 300000
      }
    ],
    "totalDurationMinutes": 180,
    "priceDetails": {
      "totalAmount": 450000,
      "depositRequired": 90000,
      "paidAmount": 0,
      "remainingAmount": 450000,
      "currency": "VND"
    },
    "paymentOption": "DEPOSIT_20_PERCENT",
    "status": "PENDING_PAYMENT",
    "paymentStatus": "UNPAID",
    "holdExpiresAt": "2026-11-08T13:45:00Z",
    "cancellationDeadline": "2026-11-09T12:45:00Z"
  }
}
```

Ràng buộc: - `customerId` lấy từ principal; không nhận từ body. - Một
booking gồm nhiều khoảng giờ của cùng `courtId`; mỗi khoảng có
`bookingDate`, `startAt`, `endAt`. Có thể cho phép nhiều ngày trong cùng
booking nếu nhóm muốn, nhưng phải validate từng ngày và lưu snapshot rõ
ràng. - `items` không rỗng; giới hạn số item, ví dụ tối đa 20; không có
hai item giao nhau; không cho trùng item. - Mỗi khoảng phải căn theo
slot duration đã cấu hình; nằm trong giờ cho thuê; không ở quá khứ; tuân
thủ duration min/max. - Kiểm tra facility/court đang được phép kinh
doanh, blocked slots, booking và HOLD còn hiệu lực. - Backend tính giá
từng khoảng theo price rule áp dụng cho ngày/giờ đó; cộng tất cả item
thành `totalAmount`. - Lưu snapshot giá từng item và tổng booking; thay
đổi giá sau này không làm đổi booking cũ. - Tạo booking và giữ toàn bộ
slot trong cùng transaction/atomic reservation. Nếu bất kỳ slot nào xung
đột, rollback toàn bộ booking. - Khi tạo booking, thời gian giữ chỗ tối
đa 1 giờ. Nếu trong 1 giờ chưa thanh toán ít nhất khoản đặt cọc 20% hoặc
thanh toán đủ, booking hết hạn, chuyển trạng thái EXPIRED/CANCELLED theo
state machine và giải phóng tất cả slot. - Thanh toán đặt cọc đúng 20%
tổng tiền hoặc thanh toán 100%. Backend tự tính số tiền phải trả; làm
tròn theo quy tắc tiền tệ đã thống nhất. - Nếu khách chọn đặt cọc, số
tiền còn lại phải được ghi nhận là `remainingAmount`; quy định thời
điểm/địa điểm thu phần còn lại cần nhóm chốt. - Gửi thông báo sau khi
tạo booking, nêu tổng tiền, số tiền đặt cọc, hạn thanh toán 1 giờ, thời
hạn hủy và chính sách hoàn tiền. - Dùng `Idempotency-Key`; nếu slot xung
đột trả `409 SLOT_UNAVAILABLE`.

### 5.2 Danh sách/chi tiết booking

  API                                  Chức năng
  ------------------------------------ ----------------------------
  `GET /api/v1/bookings/me`            Danh sách booking của mình
  `GET /api/v1/bookings/{id}`          Chi tiết booking của mình
  `GET /api/v1/bookings/me/upcoming`   Booking sắp tới
  `GET /api/v1/bookings/me/history`    Lịch sử

Query: `?status=CONFIRMED&page=0&size=10&sort=createdAt,desc`.

Ràng buộc: mọi query tự gắn `customerId` từ principal. Không cho truyền
ID user khác để xem booking.

### 5.3 Hủy booking và chính sách hoàn tiền

**PATCH `/api/v1/bookings/{bookingId}/cancel`**

Request:

``` json
{ "reason": "Tôi có việc đột xuất" }
```

Response:

``` json
{
  "success": true,
  "message": "Đã tiếp nhận yêu cầu hủy booking",
  "data": {
    "bookingId": "672a1b2c3d4e5f6071829304",
    "status": "CANCELLED",
    "paymentStatus": "REFUND_PENDING",
    "paidAmount": 90000,
    "refundAmount": 90000
  }
}
```

Ràng buộc: - Chỉ chủ booking được hủy. - Chỉ booking đã đặt cọc hoặc
thanh toán đủ mới được áp dụng chính sách hủy có hoàn tiền. - Thời hạn
hủy là 24 giờ kể từ `bookings.createdAt`, không phải 24 giờ trước giờ
chơi. Backend so sánh theo UTC. - Trong 24 giờ kể từ lúc đặt: cho phép
hủy; tạo refund request đối với số tiền thực tế đã thu. Nếu khách mới
đặt cọc thì hoàn khoản cọc đã thu; nếu đã thanh toán đủ thì hoàn số tiền
thực tế đã thu theo chính sách. - Sau 24 giờ kể từ lúc đặt: không cho
hủy và không hoàn tiền; trả `422 CANCELLATION_WINDOW_EXPIRED`. - Booking
chưa thanh toán/đặt cọc không áp dụng hủy có hoàn tiền; sau 1 giờ tự hết
hạn và giải phóng slot. - Không đánh dấu `REFUNDED` khi provider chưa
xác nhận hoàn tiền. Dùng `REFUND_PENDING` rồi cập nhật theo webhook/kết
quả provider. - Giải phóng toàn bộ slot của booking atomic; giữ
audit/history. - Khi tạo booking phải thông báo rõ chính sách 24 giờ và
không hoàn tiền sau thời hạn này.

### 5.4 Thanh toán, đặt cọc và thanh toán phần còn lại

  ---------------------------------------------------------------------------
  API                                           Vai trò        Chức năng
  --------------------------------------------- -------------- --------------
  `POST /api/v1/payments`                       Customer       Tạo giao dịch
                                                               đặt cọc 20%
                                                               hoặc thanh
                                                               toán đủ

  `GET /api/v1/payments/{id}`                   Customer       Xem payment
                                                               của mình

  `GET /api/v1/bookings/{bookingId}/payments`   Customer       Lịch sử
                                                               payment

  `POST /api/v1/payments/{id}/retry`            Customer       Thử lại khi
                                                               hợp lệ

  `POST /api/v1/payments/webhook/{provider}`    Provider       Webhook xác
                                                               nhận giao dịch

  `POST /api/v1/payments/{id}/pay-remaining`    Customer       Thanh toán
                                                               phần còn lại
                                                               nếu hệ thống
                                                               hỗ trợ online
  ---------------------------------------------------------------------------

Request:

``` json
{
  "bookingId": "672a1b2c3d4e5f6071829304",
  "paymentType": "DEPOSIT",
  "method": "ONLINE"
}
```

`paymentType` là `DEPOSIT` (20% tổng tiền), `FULL` (100%) hoặc
`REMAINING` (phần còn lại nếu cho phép thanh toán online sau đó).
Backend xác định amount từ booking, không nhận amount từ client.

Response:

``` json
{
  "success": true,
  "message": "Tạo giao dịch đặt cọc thành công",
  "data": {
    "paymentId": "672a1b2c3d4e5f6071829305",
    "bookingId": "672a1b2c3d4e5f6071829304",
    "paymentType": "DEPOSIT",
    "amount": 90000,
    "currency": "VND",
    "method": "ONLINE",
    "status": "PENDING",
    "checkoutUrl": "https://payment-provider.example/checkout/..."
  }
}
```

Ràng buộc: - Customer chỉ thanh toán booking của mình. - Khách phải chọn
đặt cọc 20% hoặc thanh toán đủ 100% trong thời gian hold 1 giờ. -
Backend tính tiền cọc = 20% tổng tiền booking; làm tròn theo quy tắc đã
chốt. Không nhận amount từ frontend. - Khi provider xác nhận cọc thành
công, booking được giữ/xác nhận theo policy và không còn tự hết hạn sau
1 giờ; phần còn lại vẫn được theo dõi. - Khi thanh toán đủ,
`paidAmount=totalAmount`, `remainingAmount=0`. - Nếu cọc,
`paidAmount=depositRequired`,
`remainingAmount=totalAmount-paidAmount`. - Không lưu số thẻ/CVV. - Chỉ
webhook verify chữ ký mới xác nhận giao dịch; không tin redirect trình
duyệt. - Webhook idempotent; kiểm tra event ID, amount, currency,
transaction reference, booking và state trước khi cập nhật. - Không xác
nhận payment nếu booking đã EXPIRED/CANCELLED hoặc hold đã hết hạn; xử
lý giao dịch đến muộn theo quy trình đối soát/hoàn tiền. - Payment có
thể có nhiều attempt; không mặc định unique `bookingId`. - Không tạo
checkout URL giả nếu chưa tích hợp provider.

### 5.5 Review

  API                                     Chức năng
  --------------------------------------- ---------------------
  `POST /api/v1/reviews`                  Tạo review
  `GET /api/v1/facilities/{id}/reviews`   Review công khai
  `GET /api/v1/reviews/me`                Review của tôi
  `PATCH /api/v1/reviews/{id}`            Sửa review của mình
  `DELETE /api/v1/reviews/{id}`           Xóa/ẩn theo policy

Request:

``` json
{
  "bookingId": "672a1b2c3d4e5f6071829304",
  "rating": 5,
  "content": "Sân sạch, nhân viên hỗ trợ tốt",
  "images": []
}
```

Ràng buộc: booking thuộc user hiện tại và đã COMPLETED; một booking chỉ
review một lần (unique `bookingId`); rating integer 1--5; giới hạn
text/ảnh; chống spam và kiểm duyệt nội dung.

### 5.6 Favorites

  API                                       Chức năng
  ----------------------------------------- ----------------
  `GET /api/v1/favorites`                   Danh sách
  `POST /api/v1/favorites`                  Thêm
  `DELETE /api/v1/favorites/{favoriteId}`   Xóa
  `DELETE /api/v1/favorites/target`         Bỏ theo target

Request:

``` json
{
  "targetType": "FACILITY",
  "targetId": "672a1b2c3d4e5f6071829302"
}
```

Ràng buộc: `userId` từ principal; targetType chỉ `FACILITY`/`COURT`;
target phải tồn tại; unique `{userId,targetType,targetId}`; không nhận
userId từ body.

### 5.7 Notifications

  API                                        Chức năng
  ------------------------------------------ -----------------
  `GET /api/v1/notifications`                Danh sách
  `GET /api/v1/notifications/unread-count`   Số chưa đọc
  `PATCH /api/v1/notifications/{id}/read`    Đánh dấu đã đọc
  `PATCH /api/v1/notifications/read-all`     Đọc tất cả
  `DELETE /api/v1/notifications/{id}`        Xóa/ẩn

Ràng buộc: chỉ thao tác notification của principal; phân trang
`createdAt desc`; không chứa dữ liệu nhạy cảm trong message.

### 5.8 Complaints

  ----------------------------------------------------------------------
  API                                       Chức năng
  ----------------------------------------- ----------------------------
  `POST /api/v1/complaints`                 Tạo khiếu nại

  `GET /api/v1/complaints/me`               Danh sách của tôi

  `GET /api/v1/complaints/{id}`             Chi tiết

  `POST /api/v1/complaints/{id}/messages`   Bổ sung nội dung nếu có
                                            module message

  `PATCH /api/v1/complaints/{id}/close`     Đóng theo policy
  ----------------------------------------------------------------------

Request:

``` json
{
  "bookingId": "672a1b2c3d4e5f6071829304",
  "subject": "Sân không đúng mô tả",
  "content": "Nội dung khiếu nại...",
  "images": []
}
```

Ràng buộc: booking thuộc user hoặc tài nguyên được policy cho phép; giới
hạn ảnh/file; Customer không tự sửa status/response/respondedBy; lưu
actor, thời gian và lịch sử trạng thái.

------------------------------------------------------------------------

## 6. Chức năng Owner

### 6.1 Đăng ký Owner

  API                                             Chức năng
  ----------------------------------------------- -------------------
  `POST /api/v1/owner-applications`               Nộp hồ sơ
  `GET /api/v1/owner-applications/me`             Xem hồ sơ
  `PATCH /api/v1/owner-applications/me`           Sửa khi được phép
  `POST /api/v1/owner-applications/me/resubmit`   Nộp lại

Request:

``` json
{
  "businessName": "Sport Center A",
  "businessAddress": {
    "province": "Da Nang",
    "district": "Cam Le",
    "ward": "Hoa Xuan",
    "detail": "..."
  },
  "contactPhone": "0901234567",
  "documents": [
    {
      "fileUrl": "https://cdn.example.com/docs/business.pdf",
      "fileName": "business.pdf",
      "documentType": "BUSINESS_LICENSE"
    }
  ]
}
```

Ràng buộc: một hồ sơ PENDING/user; nộp hồ sơ đặt `ownerStatus=PENDING`,
chưa cấp quyền Owner; Admin approve mới thêm role OWNER và đặt APPROVED;
file hồ sơ phải có quyền truy cập kiểm soát.

### 6.2 Dashboard

  API                                               Chức năng
  ------------------------------------------------- --------------------
  `GET /api/v1/owner/dashboard/summary`             Tổng quan
  `GET /api/v1/owner/dashboard/revenue`             Doanh thu
  `GET /api/v1/owner/dashboard/bookings`            Thống kê booking
  `GET /api/v1/owner/dashboard/top-courts`          Sân được đặt nhiều
  `GET /api/v1/owner/dashboard/recent-activities`   Hoạt động gần đây

Ràng buộc: tất cả query giới hạn theo `ownerId` từ principal; khoảng
thời gian hợp lệ và có giới hạn; định nghĩa gross/net/refund/pending rõ
ràng; không lấy số liệu từ client.

### 6.3 Quản lý cơ sở

  API                                                       Chức năng
  --------------------------------------------------------- --------------------
  `POST /api/v1/owner/facilities`                           Tạo
  `GET /api/v1/owner/facilities`                            Danh sách của mình
  `GET /api/v1/owner/facilities/{id}`                       Chi tiết
  `PATCH /api/v1/owner/facilities/{id}`                     Cập nhật
  `POST /api/v1/owner/facilities/{id}/submit-review`        Gửi duyệt
  `PATCH /api/v1/owner/facilities/{id}/deactivate`          Ngừng hoạt động
  `POST /api/v1/owner/facilities/{id}/images`               Thêm ảnh
  `DELETE /api/v1/owner/facilities/{id}/images/{imageId}`   Xóa ảnh

Request:

``` json
{
  "name": "Sport Center A",
  "description": "Cơ sở thể thao...",
  "address": {
    "province": "Da Nang",
    "district": "Cam Le",
    "ward": "Hoa Xuan",
    "detail": "..."
  },
  "location": {
    "type": "Point",
    "coordinates": [108.2022, 16.0544]
  },
  "images": [],
  "amenities": ["PARKING", "CHANGING_ROOM"]
}
```

Ràng buộc: `ownerId` từ principal; facility mới PENDING; chỉ APPROVED
hiển thị công khai; Owner chỉ truy cập facility của mình; validate
longitude/latitude; ảnh qua storage service, DB lưu metadata/URL.

### 6.4 Quản lý sân

  API                                                        Chức năng
  ---------------------------------------------------------- ----------------
  `POST /api/v1/owner/facilities/{facilityId}/courts`        Tạo sân
  `GET /api/v1/owner/facilities/{facilityId}/courts`         Danh sách
  `GET /api/v1/owner/courts/{courtId}`                       Chi tiết
  `PATCH /api/v1/owner/courts/{courtId}`                     Cập nhật
  `PATCH /api/v1/owner/courts/{courtId}/status`              Đổi trạng thái
  `POST /api/v1/owner/courts/{courtId}/images`               Thêm ảnh
  `DELETE /api/v1/owner/courts/{courtId}/images/{imageId}`   Xóa ảnh

Request:

``` json
{
  "categoryId": "672a1b2c3d4e5f6071829301",
  "name": "Sân cầu lông số 1",
  "description": "Sân tiêu chuẩn...",
  "attributes": {
    "surface": "WOOD",
    "indoor": true,
    "lighting": true
  },
  "capacity": 4,
  "images": [],
  "operatingHours": {
    "repeatMode": "DAILY",
    "effectiveFrom": "2026-11-08",
    "effectiveTo": null,
    "timeSlots": [
      { "startTime": "06:00", "endTime": "07:00" },
      { "startTime": "07:00", "endTime": "08:00" },
      { "startTime": "17:00", "endTime": "18:00" }
    ]
  }
}
```

Ràng buộc: facility thuộc Owner; category ACTIVE; không chuyển sân sang
INACTIVE/MAINTENANCE nếu còn booking tương lai chưa xử lý; attributes
validate theo loại sân, không cho ghi field hệ thống.

### 6.5 Cấu hình khung giờ cho thuê lặp lại hằng ngày

  --------------------------------------------------------------------------------------
  API                                                                       Chức năng
  ------------------------------------------------------------------------- ------------
  `GET /api/v1/owner/courts/{courtId}/operating-hours`                      Xem mẫu giờ
                                                                            cho thuê

  `PUT /api/v1/owner/courts/{courtId}/operating-hours`                      Tạo/cập nhật
                                                                            mẫu giờ

  `PATCH /api/v1/owner/courts/{courtId}/operating-hours/overrides/{date}`   Điều chỉnh
                                                                            riêng một
                                                                            ngày nếu
                                                                            triển khai
                                                                            override
  --------------------------------------------------------------------------------------

Khi tạo hoặc cập nhật sân, Owner cấu hình các khung giờ cho thuê của một
ngày mẫu. Hệ thống áp dụng mẫu đó lặp lại cho các ngày tiếp theo kể từ
`effectiveFrom`, không yêu cầu Owner nhập lại từng ngày.

Request:

``` json
{
  "repeatMode": "DAILY",
  "effectiveFrom": "2026-11-08",
  "effectiveTo": null,
  "timeSlots": [
    { "startTime": "06:00", "endTime": "07:00" },
    { "startTime": "07:00", "endTime": "08:00" },
    { "startTime": "08:00", "endTime": "09:00" },
    { "startTime": "17:00", "endTime": "18:00" }
  ]
}
```

Ràng buộc: - Một cấu hình mẫu DAILY cho mỗi court; có thể thêm date
override khi cần ngoại lệ. - Các khung giờ phải có
`startTime < endTime`, không giao nhau, tuân theo slot duration và nằm
trong một ngày. - `effectiveFrom` bắt buộc; `effectiveTo` null nghĩa là
chưa đặt ngày kết thúc. - Availability cho ngày tương lai sinh từ mẫu
DAILY, sau đó trừ blocked slots và booking/hold. - Không tạo trước hàng
nghìn operating-hour documents cho từng ngày; lưu template và tính lịch
theo ngày được yêu cầu. - Thay đổi template không làm thay đổi booking
đã xác nhận; kiểm tra booking tương lai trước khi áp dụng. - Owner phải
sở hữu court.

### 6.6 Quy tắc giá theo ngày và khung giờ

  --------------------------------------------------------------------------
  API                                                 Chức năng
  --------------------------------------------------- ----------------------
  `POST /api/v1/owner/courts/{courtId}/price-rules`   Tạo quy tắc giá

  `GET /api/v1/owner/courts/{courtId}/price-rules`    Danh sách quy tắc, có
                                                      phân trang

  `PATCH /api/v1/owner/price-rules/{id}`              Cập nhật

  `DELETE /api/v1/owner/price-rules/{id}`             Ngừng/xóa logic
  --------------------------------------------------------------------------

Request:

``` json
{
  "name": "Giá cuối tuần",
  "specificDates": ["2026-11-14", "2026-11-15"],
  "daysOfWeek": [],
  "startTime": "07:00",
  "endTime": "12:00",
  "pricePerSlot": 220000,
  "validFrom": "2026-11-14",
  "validTo": "2026-11-15",
  "priority": 20,
  "status": "ACTIVE"
}
```

Ràng buộc: - Owner phải sở hữu court; giá \> 0; validFrom \<= validTo;
startTime \< endTime. - Cho phép chọn `specificDates` để áp dụng giá vào
đúng các ngày đã chọn; cũng có thể dùng `daysOfWeek` cho quy tắc lặp
theo thứ. - `specificDates` nếu có phải là ngày hợp lệ và nằm trong hiệu
lực rule; không trùng. - Quy tắc ngày cụ thể có độ ưu tiên cao hơn quy
tắc lặp theo thứ; nếu cùng mức ưu tiên phải có tie-break xác định hoặc
từ chối cấu hình xung đột. - Nếu không có rule phù hợp, áp dụng giá mặc
định đã cấu hình hoặc không cho đặt; không tự đoán giá. - Không sửa
snapshot giá của booking cũ; giữ lịch sử rule đã áp dụng.

### 6.7 Khóa lịch

  API                                                   Chức năng
  ----------------------------------------------------- -----------
  `POST /api/v1/owner/courts/{courtId}/blocked-slots`   Khóa giờ
  `GET /api/v1/owner/courts/{courtId}/blocked-slots`    Danh sách
  `DELETE /api/v1/owner/blocked-slots/{id}`             Gỡ khóa

Request:

``` json
{
  "startAt": "2026-11-10T13:00:00+07:00",
  "endAt": "2026-11-10T15:00:00+07:00",
  "reason": "Bảo trì sân"
}
```

Ràng buộc: Owner sở hữu sân; không khóa trùng booking CONFIRMED nếu chưa
có quy trình xử lý; chống overlap blocked slots; `createdBy` lấy từ
principal; gỡ khóa không sửa booking.

### 6.8 Quản lý booking

  -----------------------------------------------------------------------
  API                                            Chức năng
  ---------------------------------------------- ------------------------
  `GET /api/v1/owner/bookings`                   Danh sách booking của
                                                 mình

  `GET /api/v1/owner/bookings/{id}`              Chi tiết

  `PATCH /api/v1/owner/bookings/{id}/confirm`    Xác nhận

  `PATCH /api/v1/owner/bookings/{id}/reject`     Từ chối

  `PATCH /api/v1/owner/bookings/{id}/complete`   Hoàn thành

  `PATCH /api/v1/owner/bookings/{id}/no-show`    Khách không đến nếu
                                                 policy có

  `GET /api/v1/owner/bookings/calendar`          Lịch booking
  -----------------------------------------------------------------------

Reject request:

``` json
{ "reason": "Sân cần bảo trì đột xuất" }
```

Ràng buộc: chỉ booking thuộc facility của Owner; chỉ chuyển trạng thái
hợp lệ; confirm kiểm tra slot/hold/payment; reject giải phóng slot
atomic và refund flow nếu cần; complete sau khi thời gian kết thúc; mọi
override phải audit.

### 6.9 Review và complaint

  API                                                      Chức năng
  -------------------------------------------------------- ---------------------
  `POST /api/v1/owner/reviews/{reviewId}/reply`            Trả lời review
  `GET /api/v1/owner/complaints`                           Danh sách khiếu nại
  `GET /api/v1/owner/complaints/{id}`                      Chi tiết
  `POST /api/v1/owner/complaints/{id}/response`            Phản hồi
  `PATCH /api/v1/owner/complaints/{id}/mark-in-progress`   Tiếp nhận
  `PATCH /api/v1/owner/complaints/{id}/resolve`            Xử lý theo policy

Ràng buộc: chỉ dữ liệu thuộc facility của mình; không tự xóa review/đóng
khiếu nại của Customer; response giới hạn độ dài; lưu actor và thời
gian.

------------------------------------------------------------------------

## 7. Chức năng Admin

Admin không có chức năng quản lý cơ sở/sân, quản lý đơn đặt sân toàn sàn
hoặc quản lý giao dịch thanh toán. Các nghiệp vụ vận hành cơ sở, sân,
booking và payment thuộc Owner/Customer cùng các tích hợp hệ thống;
Admin chỉ thực hiện các nhóm chức năng dưới đây.

### 7.1 Dashboard quản trị giới hạn

  --------------------------------------------------------------------------
  API                                                Chức năng
  -------------------------------------------------- -----------------------
  `GET /api/v1/admin/dashboard/summary`              Tổng quan tài khoản và
                                                     hồ sơ Owner

  `GET /api/v1/admin/dashboard/users`                Thống kê user

  `GET /api/v1/admin/dashboard/owner-applications`   Thống kê hồ sơ Owner
  --------------------------------------------------------------------------

Ràng buộc: chỉ ADMIN; không cung cấp dashboard quản lý booking, payment,
doanh thu hoặc vận hành sân bãi.

### 7.2 Quản lý user

  ------------------------------------------------------------------------
  API                                            Chức năng
  ---------------------------------------------- -------------------------
  `GET /api/v1/admin/users`                      Danh sách/tìm kiếm, có
                                                 phân trang

  `GET /api/v1/admin/users/{id}`                 Chi tiết

  `PATCH /api/v1/admin/users/{id}/status`        Khóa/mở

  `PATCH /api/v1/admin/users/{id}/roles`         Điều chỉnh role có kiểm
                                                 soát

  `POST /api/v1/admin/users/{id}/force-logout`   Thu hồi phiên

  `GET /api/v1/admin/users/{id}/activity`        Hoạt động cần thiết
  ------------------------------------------------------------------------

Request khóa:

``` json
{ "status": "BANNED", "reason": "Vi phạm điều khoản sử dụng" }
```

Ràng buộc: - Không tự khóa Admin cuối cùng. - Thay role phải kiểm tra
trạng thái Owner application và audit. - Không trả password hash/session
secret. - Khóa user thu hồi refresh sessions.

### 7.3 Duyệt hồ sơ Owner

  API                                                     Chức năng
  ------------------------------------------------------- --------------------------
  `GET /api/v1/admin/owner-applications`                  Danh sách, có phân trang
  `GET /api/v1/admin/owner-applications/{id}`             Chi tiết
  `PATCH /api/v1/admin/owner-applications/{id}/approve`   Duyệt
  `PATCH /api/v1/admin/owner-applications/{id}/reject`    Từ chối

Reject request:

``` json
{ "reason": "Hồ sơ chưa đầy đủ thông tin pháp lý" }
```

Ràng buộc: chỉ xử lý PENDING; approve cập nhật application +
user.ownerStatus + roles trong transaction/đảm bảo nhất quán; ghi
reviewedBy/reviewedAt/reason; user không thể tự duyệt.

### 7.4 Quản lý danh mục thể thao

  API                                                   Chức năng
  ----------------------------------------------------- --------------------------
  `POST /api/v1/admin/sports-categories`                Tạo
  `GET /api/v1/admin/sports-categories`                 Danh sách, có phân trang
  `PATCH /api/v1/admin/sports-categories/{id}`          Sửa
  `PATCH /api/v1/admin/sports-categories/{id}/status`   Bật/tắt

Ràng buộc: code unique, uppercase; không hard delete category đang được
court tham chiếu; chuyển INACTIVE.

### 7.5 Kiểm duyệt review và xử lý complaint

  API                                             Chức năng
  ----------------------------------------------- --------------------------
  `GET /api/v1/admin/reviews`                     Danh sách, có phân trang
  `PATCH /api/v1/admin/reviews/{id}/hide`         Ẩn review vi phạm
  `PATCH /api/v1/admin/reviews/{id}/restore`      Khôi phục
  `GET /api/v1/admin/complaints`                  Danh sách, có phân trang
  `PATCH /api/v1/admin/complaints/{id}/assign`    Phân công
  `POST /api/v1/admin/complaints/{id}/response`   Phản hồi
  `PATCH /api/v1/admin/complaints/{id}/resolve`   Giải quyết

Ràng buộc: mọi hành động moderation có reason/actor; không sửa nội dung
gốc để che lịch sử; state transition hợp lệ; Admin không được quản lý
booking/payment hoặc sân bãi.

## 8. Authentication và Authorization

### 8.1 Phân biệt

-   **Authentication (AuthN):** xác định request là ai; ví dụ xác minh
    access token và lấy user ID.
-   **Authorization (AuthZ):** xác định user được làm gì trên tài nguyên
    cụ thể; ví dụ Owner chỉ sửa facility do mình sở hữu.

Đăng nhập thành công không đồng nghĩa có quyền truy cập mọi tài nguyên.

### 8.2 JWT access token

Claim gợi ý:

``` json
{
  "iss": "sportbooking-api",
  "sub": "672a1b2c3d4e5f6071829301",
  "aud": "sportbooking-web",
  "iat": 1794140000,
  "exp": 1794140900,
  "jti": "unique-token-id",
  "roles": ["CUSTOMER"]
}
```

Quy tắc: - Thời hạn ngắn, ví dụ 10--15 phút. - Validate signature,
issuer, audience, exp, nbf và thuật toán trong allowlist; từ chối
`alg=none`. - Không chứa password, refresh token, địa chỉ/số điện thoại
không cần thiết. - Secret/private key không hardcode hoặc commit Git; có
key rotation. - Role trong token có thể cũ nếu bị thu hồi; cân nhắc
tokenVersion/session check hoặc TTL ngắn. - Không dùng JWT access token
làm refresh token.

### 8.3 Refresh token và session

-   Ưu tiên opaque random refresh token hoặc session identifier có
    entropy cao.
-   Lưu hash ở server, gắn
    userId/sessionId/familyId/expiresAt/revokedAt.
-   Rotate mỗi lần refresh; token cũ lập tức vô hiệu.
-   Reuse token đã rotate: thu hồi family/session và yêu cầu đăng nhập
    lại.
-   Không gửi refresh token qua URL, query, log hoặc analytics.
-   Hỗ trợ revoke từng thiết bị và logout-all.
-   Tài khoản BANNED/INACTIVE không được refresh.

### 8.4 Cookie, CORS, CSRF

-   Refresh cookie: `HttpOnly`, `Secure` trên HTTPS, `SameSite` phù hợp.
-   CORS chỉ allowlist domain frontend thực tế.
-   Không kết hợp wildcard origin với `allowCredentials=true`.
-   Khi dùng cookie cho request thay đổi dữ liệu, triển khai CSRF token
    và/hoặc kiểm tra Origin.
-   Xóa cookie với đúng path/domain/attributes lúc tạo.
-   Access token có thể giữ trong memory của SPA; tránh lưu token dài
    hạn trong localStorage nếu có thể.

### 8.5 Phân quyền và ownership

-   Spring Security filter chain xác thực token.
-   Dùng `@PreAuthorize`/permission cho role, nhưng vẫn kiểm tra
    ownership ở service/repository.
-   Query an toàn dạng `findByIdAndOwnerId(id, currentOwnerId)`.
-   Không lấy document theo ID rồi quên kiểm tra owner.
-   Không nhận ownerId/customerId/createdBy/reviewedBy từ client khi
    server suy ra được.
-   Tách route `/admin`, `/owner`, `/me` rõ ràng.
-   Có thể trả 404 thay 403 cho tài nguyên riêng tư để tránh lộ sự tồn
    tại.

  Permission                   Guest   Customer             Owner         Admin
  -------------------------- ------- ---------- ----------------- -------------
  facility:read_public             ✓          ✓                 ✓             ✓
  booking:create                 ---          ✓   Nếu có Customer   Theo policy
  booking:read_own               ---          ✓                 ✓             ✓
  booking:manage_facility        ---        ---                 ✓             ✓
  facility:manage_own            ---        ---                 ✓             ✓
  owner_application:create       ---          ✓                 ✓           ---
  owner_application:review       ---        ---               ---             ✓
  facility:moderate              ---        ---               ---             ✓
  user:moderate                  ---        ---               ---             ✓

------------------------------------------------------------------------

## 9. Bảo mật dữ liệu

### 9.1 Password và secrets

-   Hash password bằng BCrypt/Argon2; không mã hóa để giải mã lại.
-   Không log request body login/reset.
-   Secret lấy từ environment/secret manager, không hardcode.
-   `.env` thật nằm trong `.gitignore`; có quy trình rotate.
-   Không commit private key, JWT secret, DB password.

### 9.2 Input validation và mass assignment

-   Dùng Jakarta Validation: `@NotBlank`, `@Email`, `@Size`, `@Min`,
    `@Max`, custom validator.
-   Validate ở Request DTO, không bind thẳng Mongo document.
-   Trim/normalize email, phone, mã tham chiếu.
-   Giới hạn body size, text length, file size.
-   Validate ObjectId, enum, tọa độ, ngày/giờ.
-   Whitelist sort field.
-   Không nhận raw Mongo query/operator.
-   Không cho client set
    role/status/ownerId/customerId/amount/discount/createdBy.

### 9.3 Rủi ro và biện pháp

  ---------------------------------------------------------------------
  Rủi ro                             Biện pháp
  ---------------------------------- ----------------------------------
  IDOR/Broken Access Control         Role + ownership check trên
                                     backend

  Brute force                        Rate limit, backoff, cảnh báo/khóa
                                     tạm

  Credential stuffing                Rate limit, password policy, MFA
                                     Admin nếu triển khai

  XSS                                Escape output, sanitize rich text,
                                     CSP

  CSRF                               SameSite, CSRF token, Origin check

  Injection                          Query tham số, whitelist, không
                                     ghép query từ input

  Mass assignment                    Request DTO chỉ chứa field được
                                     phép

  File upload abuse                  MIME/magic bytes/size check,
                                     random storage key

  SSRF                               Không fetch URL tùy ý; allowlist
                                     host

  Data leakage                       Response DTO tối thiểu, mask PII

  Replay                             Idempotency, webhook
                                     signature/event ID

  Enumeration                        Error chung cho login/forgot, rate
                                     limit

  DoS                                Rate limit, pagination cap, body
                                     cap, timeout

  Secret exposure                    Secret manager/env, log redaction,
                                     key rotation
  ---------------------------------------------------------------------

### 9.4 PII và logging

-   Chỉ thu thập dữ liệu cần thiết.
-   Mask email/phone với người không cần dữ liệu đầy đủ.
-   Không log password, OTP, access/refresh token, payment secret.
-   Có retention policy; xóa/ẩn dữ liệu theo quy định.
-   Audit log cho Admin/Owner actions nhạy cảm; không cho user thường
    đọc.

------------------------------------------------------------------------

## 10. MongoDB và tối ưu query

### 10.1 Thiết kế

-   Embed dữ liệu nhỏ, thường đọc cùng nhau và phụ thuộc vòng đời
    (address, ownerReply, response).
-   Reference dữ liệu lớn/độc lập (users, facilities, courts, bookings).
-   Không nhúng mảng tăng không giới hạn như toàn bộ booking/messages.
-   MongoDB ObjectId reference là liên kết logic, không có foreign key
    enforcement.
-   Validate document tham chiếu tồn tại.
-   Dùng projection, không `findAll()` trên collection lớn.
-   Tránh document vượt giới hạn 16 MB.

### 10.2 Index đề xuất

  -----------------------------------------------------------------------------
  Collection             Index
  ---------------------- ------------------------------------------------------
  `users`                unique `{email: 1}`; `{status: 1}`

  `owner_applications`   `{userId: 1, status: 1}`; `{status: 1, createdAt: -1}`

  `sports_categories`    unique `{code: 1}`; `{status: 1, name: 1}`

  `facilities`           `{ownerId: 1, status: 1}`;
                         `{status: 1, createdAt: -1}`; `2dsphere(location)`

  `courts`               `{facilityId: 1, status: 1}`;
                         `{categoryId: 1, status: 1}`

  `operating_hours`      unique `{courtId: 1}` cho template DAILY; nếu hỗ trợ
                         override, dùng unique compound theo court +
                         scheduleType + date

  `price_rules`          `{courtId: 1, status: 1, validFrom: 1, validTo: 1}`;
                         cân nhắc index specificDates

  `blocked_slots`        `{courtId: 1, startAt: 1, endAt: 1}`

  `bookings`             unique `{bookingCode: 1}`;
                         `{customerId: 1, createdAt: -1}`;
                         `{courtId: 1, createdAt: -1}`;
                         `{status: 1, holdExpiresAt: 1}`

  `booking_slots`        unique `{courtId: 1, slotDate: 1, startAt: 1}` cho
                         slot đang chiếm; `{bookingId: 1}`;
                         `{status: 1, expiresAt: 1}`

  `payments`             `{bookingId: 1, createdAt: -1}`;
                         `{customerId: 1, createdAt: -1}`; unique partial
                         `{transactionCode: 1}` khi tồn tại

  `reviews`              unique `{bookingId: 1}`;
                         `{facilityId: 1, createdAt: -1}`; `{status: 1}`

  `favorites`            unique `{userId: 1, targetType: 1, targetId: 1}`

  `notifications`        `{userId: 1, isRead: 1, createdAt: -1}`

  `complaints`           `{userId: 1, createdAt: -1}`;
                         `{facilityId: 1, status: 1}`;
                         `{status: 1, createdAt: -1}`
  -----------------------------------------------------------------------------

Index phải được xác minh bằng `explain("executionStats")`; index làm
tăng chi phí ghi và dung lượng nên không tạo tràn lan. Với
`booking_slots`, unique index cần được thiết kế để chỉ slot HOLD/BOOKED
còn hiệu lực chiếm khóa; khi release phải cập nhật/xóa theo một chiến
lược nhất quán.

### 10.3 Tối ưu truy vấn

-   Filter/sort theo field có index; tránh regex không anchor trên
    collection lớn.
-   Keyword search lớn cân nhắc Atlas Search.
-   Projection chỉ lấy field cần.
-   Cap page size; dữ liệu lớn có thể dùng cursor pagination theo
    `{createdAt,_id}`.
-   Tránh sort field không index.
-   Tránh N+1: gom ID rồi query `$in`, hoặc aggregation `$lookup` có
    kiểm soát.
-   Không query database trong vòng lặp nếu có thể batch.
-   Cache categories/public summaries; không cache availability quá lâu.
-   Không cache slot nhạy cảm theo cách gây hiển thị sai.
-   TTL chỉ là cleanup; không thay thế kiểm tra `expiresAt`.
-   Theo dõi slow query, p95/p99 latency, pool connections.

### 10.4 Unique index và khoảng thời gian

Unique `{courtId,slotDate,startAt}` chỉ chặn cùng start time, **không
chặn mọi khoảng thời gian giao nhau**. Muốn chống overlap phải chuẩn hóa
thành slot cố định và chiếm từng slot, hoặc dùng
transaction/locking/atomic reservation có thể chứng minh tính đúng.
Không được coi unique start-time index là đủ.

### 10.5 Transaction

-   Multi-document transaction cần replica set hoặc sharded cluster phù
    hợp; local cần cấu hình replica set.
-   Transaction ngắn; không gọi payment/email/network bên trong
    transaction.
-   Dùng cho booking + booking_slots + payment state khi cần nhất quán.
-   Retry transient transaction errors có giới hạn.
-   Kết hợp idempotency cho command nhạy cảm.

------------------------------------------------------------------------

## 11. Xử lý nhiều người dùng đồng thời

### 11.1 Race condition đặt sân

Hai Customer có thể cùng thấy slot AVAILABLE. Quy trình đọc availability
rồi insert booking thông thường không an toàn.

### 11.2 Chiến lược đề xuất với nhiều khung giờ trong một booking

1.  Chuẩn hóa từng khoảng người dùng chọn thành các slot nhỏ theo
    `slotDuration`.
2.  Kiểm tra các item trong cùng request không giao nhau, đúng lịch lặp
    DAILY và đúng ngày/giờ hoạt động.
3.  Nhận `Idempotency-Key`.
4.  Trong transaction, tạo booking cha và chiếm tất cả `booking_slots`
    của mọi item.
5.  Unique index trên court + ngày + giờ bắt đầu bảo đảm chỉ một request
    chiếm được từng slot.
6.  Nếu bất kỳ slot nào duplicate/xung đột, rollback toàn transaction;
    không để booking chỉ giữ được một phần khung giờ.
7.  Đặt `holdExpiresAt = createdAt + 1 giờ`. Nếu không có payment thành
    công tối thiểu 20% hoặc 100% trong thời gian này, booking EXPIRED và
    toàn bộ slot được release.
8.  Nếu payment đặt cọc 20% hoặc đủ 100% được xác nhận đúng hạn, chuyển
    booking sang trạng thái đã được xác nhận/đặt cọc theo state machine;
    không áp dụng hold timeout nữa.
9.  Hủy trong 24 giờ từ `createdAt` nếu đã có tiền thu: tạo refund
    request và release toàn bộ slot sau khi state transition hợp lệ.
10. Nếu đã quá 24 giờ, từ chối cancel/refund theo policy.

Nếu duration không khớp slot, phải từ chối hoặc chuẩn hóa; không nhận
khoảng tùy ý rồi chỉ dựa vào unique start time.

### 11.3 State machine gợi ý

Booking:

``` text
PENDING_PAYMENT --(deposit 20% or full payment within 1h)--> CONFIRMED -> COMPLETED
       |                         |
       v                         v
    EXPIRED                 CANCELLED (within 24h if paid)

PENDING_PAYMENT -> EXPIRED (no deposit/full payment after 1h)
CONFIRMED -> CANCELLED (only within 24h from booking creation, refund flow)
CONFIRMED -> COMPLETED
```

Payment:

``` text
PENDING -> PAID (DEPOSIT or FULL)
   |        |
   v        v
FAILED   REFUND_PENDING -> REFUNDED
```

Đây là flow tham khảo; nhóm phải chốt một flow nhất quán. Không trộn
`booking.status` và `payment.status`.

### 11.4 Atomic update và optimistic locking

-   Dùng `version` hoặc compare-and-set.
-   Chỉ update khi status hiện tại đúng, ví dụ `status=PENDING`.
-   Nếu modifiedCount=0, trả conflict.
-   Dùng `$inc`, `$set`, `$unset` phù hợp; tránh ghi đè document cũ.
-   Không dùng `synchronized` để bảo vệ nhiều instance backend; lock JVM
    không bảo vệ instance khác.

### 11.5 Idempotency

Nên áp dụng cho create booking, payment intent, webhook, refund, payment
state. Lưu key + user + operation + request hash + trạng thái + kết quả.
Cùng key/cùng request trả kết quả cũ; cùng key/payload khác trả
`409 IDEMPOTENCY_KEY_REUSED`.

### 11.6 Webhook và event

-   Verify chữ ký provider.
-   Lưu event ID unique để chống xử lý lặp.
-   Ghi nhận event an toàn rồi trả nhanh; việc nặng đưa queue.
-   Transactional outbox nếu cần bảo đảm event chỉ phát sau commit.
-   Retry backoff và dead-letter queue nếu có broker.
-   Không gửi email/notification trước khi transaction commit.

### 11.7 Rate limit

Áp dụng theo IP/user/endpoint cho login, forgot password, verification,
search, availability, booking, payment, upload. Dùng Redis/API gateway
khi scale nhiều instance; in-memory limiter không đủ cho distributed
deployment.

------------------------------------------------------------------------

## 12. Quy tắc trạng thái

  -----------------------------------------------------------------------
  Entity                    Trạng thái và chuyển đổi
  ------------------------- ---------------------------------------------
  User                      `ACTIVE`, `INACTIVE`, `BANNED`; user bị khóa
                            không được refresh token

  Owner application         `PENDING` → `APPROVED`/`REJECTED`; REJECTED
                            có thể resubmit theo policy

  Facility                  `ACTIVE` hoặc `INACTIVE`; Owner quản lý trạng
                            thái cơ sở của mình

  Court                     `AVAILABLE`, `MAINTENANCE`, `INACTIVE`; chỉ
                            AVAILABLE mới nhận booking

  Booking                   Chỉ chuyển theo state machine; không nhận
                            status tùy ý từ client

  Payment                   PENDING/PAID/FAILED/REFUND_PENDING/REFUNDED
                            theo provider và policy
  -----------------------------------------------------------------------

Mỗi state transition phải kiểm tra trạng thái nguồn, actor, quyền, điều
kiện thời gian, update atomic, audit và notification sau commit.

------------------------------------------------------------------------

## 13. Kiến trúc Spring Boot

### 13.1 Cấu trúc thư mục

``` text
backend/
└── src/main/java/com/sportbooking/
    ├── SportBookingApplication.java
    ├── config/
    │   ├── SecurityConfig.java
    │   ├── CorsConfig.java
    │   ├── MongoConfig.java
    │   ├── JwtConfig.java
    │   └── WebConfig.java
    ├── security/
    │   ├── JwtAuthenticationFilter.java
    │   ├── JwtTokenProvider.java
    │   ├── CustomUserDetails.java
    │   └── CustomUserDetailsService.java
    ├── common/
    │   ├── constants/
    │   ├── enums/
    │   ├── exception/
    │   ├── response/
    │   └── utils/
    ├── modules/
    │   ├── auth/ user/ owner/ sports/ facility/ court/
    │   ├── operatinghour/ pricing/ blockedslot/
    │   ├── booking/ bookingslot/ payment/ review/
    │   ├── favorite/ / notification/ complaint/
    └── infrastructure/
        ├── storage/
        ├── email/
        ├── payment/
        └── messaging/
```

Mỗi module có thể tổ chức:

``` text
facility/
├── controller/
├── service/
├── repository/
├── document/
├── dto/
│   ├── request/
│   └── response/
├── mapper/
└── validator/
```

Không cần tạo thư mục rỗng cho mọi module nhỏ. Tránh controller chứa
nghiệp vụ và service khổng lồ.

### 13.2 Trách nhiệm từng tầng

  Tầng           Trách nhiệm
  -------------- -------------------------------------------------------
  Controller     Nhận HTTP, validate DTO, gọi service, trả response
  Service        Business logic, ownership, transaction, orchestration
  Repository     Truy vấn/cập nhật MongoDB
  Document       Mapping MongoDB document
  Request DTO    Chỉ chứa input được phép
  Response DTO   Chỉ trả dữ liệu cần thiết
  Mapper         Chuyển Document ↔ DTO
  Validator      Kiểm tra dữ liệu/điều kiện chuyên biệt

Không query DB trực tiếp ở controller; không trả Document trực tiếp;
không dùng chung DTO nếu quyền ghi field khác nhau.

### 13.3 DTO và validation

-   Mỗi use case có Request DTO riêng.
-   Dùng `@Valid`, `@NotBlank`, `@Email`, `@Size`, `@Min`, `@Max`,
    custom validator.
-   Không bind trực tiếp document.
-   Không nhận field hệ thống do backend quản lý.
-   Dùng enum; `BigDecimal`/long cho tiền; `Instant`/`OffsetDateTime`
    cho thời gian.
-   Response không expose password, refresh hash, internal flags.

### 13.4 Exception handling

Dùng `@RestControllerAdvice`: - ResourceNotFound → 404. - Authentication
→ 401. - AccessDenied → 403. - Validation → 400. - Duplicate key/slot
conflict → 409. - Business rule → 422 (hoặc quy ước đã thống nhất). -
Unexpected → 500 với requestId.

Không expose message nội bộ có query/path/secret/PII.

### 13.5 Cấu hình môi trường

`application.yml`:

``` yaml
spring:
  application:
    name: sportbooking
  profiles:
    active: ${SPRING_PROFILES_ACTIVE:dev}
  data:
    mongodb:
      uri: ${MONGODB_URI}
server:
  port: ${SERVER_PORT:8080}
```

`.env.example`:

``` env
SPRING_PROFILES_ACTIVE=dev
SERVER_PORT=8080
MONGODB_URI=mongodb://localhost:27017/sportbooking_db
JWT_SECRET=replace_with_a_secure_secret
JWT_ACCESS_TTL_SECONDS=900
JWT_REFRESH_TTL_SECONDS=1209600
FRONTEND_ORIGIN=http://localhost:5173
```

`.env` thật phải nằm trong `.gitignore`; production dùng secret
manager/environment injection; tách dev/prod; không mở actuator/debug
nhạy cảm công khai.

------------------------------------------------------------------------

## 14. Checklist API theo module

### Auth

-   [ ] Register, login, refresh, logout current session, logout all
-   [ ] Forgot/reset/change password
-   [ ] Request/confirm email verification
-   [ ] List/revoke sessions

### Public

-   [ ] List categories, facilities, courts
-   [ ] Facility/court detail
-   [ ] Search/filter/sort/page/nearby
-   [ ] Court availability
-   [ ] Public reviews

### Customer

-   [ ] Get/update profile, upload/delete avatar
-   [ ] Create/list/detail/upcoming/history/cancel booking
-   [ ] Create/view/retry payment
-   [ ] Create/edit/delete review
-   [ ] Add/remove/list favorites
-   [ ] List/read/read-all/delete notifications
-   [ ] Create/list/detail/close complaint

### Owner

-   [ ] Submit/view/edit/resubmit Owner application
-   [ ] Dashboard summary/revenue/bookings/top courts
-   [ ] CRUD facility, manage images
-   [ ] CRUD court, change status, manage images
-   [ ] View/update operating hours
-   [ ] CRUD/deactivate price rules
-   [ ] Create/list/remove blocked slots
-   [ ] List/detail/confirm/reject/complete/no-show booking, calendar
-   [ ] Reply review; list/respond/resolve complaint

### Admin

-   [ ] Dashboard tài khoản và hồ sơ Owner (không có
    booking/payment/revenue/facility operations)
-   [ ] Search/detail/ban/activate users, change roles, force logout
-   [ ] Review/approve/reject Owner applications
-   [ ] CRUD/deactivate sports categories
-   [ ] Moderate reviews
-   [ ] Assign/respond/resolve complaints
-   [ ] View audit logs nếu triển khai

## 15. Kiểm thử bắt buộc

### 15.1 Unit test

-   Price calculation theo ngày/khung giờ.
-   Booking/payment state transitions.
-   Ownership authorization.
-   Token rotation/reuse detection.
-   DTO/custom validation.

### 15.2 Integration test

-   Mongo repository và index assumptions.
-   Transaction với Mongo replica set test.
-   Security filter/JWT expiry/signature.
-   Cookie refresh/logout.
-   Upload file.
-   Payment webhook signature/idempotency.
-   Concurrent booking.

### 15.3 Permission test

  Tình huống                          Kết quả
  ----------------------------------- -----------------------------
  Guest gọi API Customer              401
  Customer gọi API Admin              403
  Owner A sửa facility Owner B        403/404 theo policy
  Customer A xem booking Customer B   403/404
  Register gửi roles ADMIN            Không cấp role
  Owner chưa duyệt gọi API Owner      403
  User B sửa notification User A      403/404
  Token hết hạn                       401
  Reuse refresh token cũ              Revoke token family/session

### 15.4 Concurrency test

-   Hai request cùng court/slot: chỉ một thành công.
-   Hai slot không overlap: cả hai được phép.
-   Retry cùng idempotency key: chỉ một booking.
-   Webhook lặp: chỉ ghi nhận một lần.
-   Hai user dùng có usageLimit còn 1: chỉ một người được áp dụng.
-   Owner khóa sân đồng thời Customer đặt sân: không có booking trong
    blocked interval.
-   Hold hết hạn đồng thời payment: chỉ một state transition hợp lệ.

### 15.5 Load test

Test tìm kiếm, availability, booking đồng thời, dashboard aggregation.
Theo dõi p50/p95/p99, error rate, DB pool, CPU/memory. Đặt mục tiêu sau
khi đo baseline; không tuyên bố đạt tải nếu chưa test.

------------------------------------------------------------------------

## 16. Vận hành và triển khai

-   Structured logging JSON; requestId/trace ID.
-   Metrics: request count, error rate, latency, DB query latency, pool,
    queue lag.
-   Health/readiness/liveness; bảo vệ actuator.
-   Alert lỗi đăng nhập, webhook fail, booking conflict, DB unavailable.
-   Backup MongoDB định kỳ và diễn tập restore.
-   HTTPS/TLS production.
-   Tách dev/staging/prod; index setup có kiểm soát.
-   Rollback deploy; tương thích API khi frontend/backend deploy lệch
    thời điểm.
-   Feature flag cho tính năng chưa sẵn sàng nếu cần.

------------------------------------------------------------------------

## 17. Quy tắc nghiệp vụ đã chốt và nội dung cần xác nhận

### 17.1 Quy tắc áp dụng theo yêu cầu hiện tại

1.  Không triển khai chức năng khuyến mãi; không có collections `s` và
    `_usages`.
2.  Một booking có thể chứa nhiều khung giờ của cùng một sân; tổng tiền
    bằng tổng giá của tất cả khung giờ.
3.  Khách phải đặt cọc 20% hoặc thanh toán đủ 100%.
4.  Nếu sau 1 giờ kể từ lúc tạo booking chưa thanh toán/đặt cọc thành
    công, booking hết hạn và toàn bộ slot được giải phóng.
5.  Nếu đã đặt cọc hoặc thanh toán, khách được hủy trong 24 giờ kể từ
    `createdAt`; hệ thống tạo yêu cầu hoàn số tiền thực tế đã thu.
6.  Sau 24 giờ kể từ lúc đặt, không cho hủy và không hoàn tiền.
7.  Khi tạo/cập nhật sân, Owner cấu hình mẫu khung giờ của một ngày; hệ
    thống lặp mẫu DAILY cho những ngày tiếp theo.
8.  Quy tắc giá hỗ trợ chọn ngày cụ thể; ngày cụ thể được ưu tiên hơn
    quy tắc lặp theo thứ.
9.  Admin không có API quản lý facility/court, booking toàn sàn hoặc
    payment.

### 17.2 Nội dung nhóm cần xác nhận trước production

1.  Booking nhiều khung giờ có cho phép trải trên nhiều ngày hay chỉ một
    ngày?
2.  Một booking chỉ chứa các khung giờ của một sân hay có nhu cầu chọn
    nhiều sân trong một lần?
3.  Sau khi đặt cọc 20%, phần 80% còn lại thu khi nào và bằng phương
    thức nào?
4.  Refund trong 24 giờ là hoàn 100% khoản đã thu hay có phí xử lý/điều
    kiện ngoại lệ?
5.  Thời điểm bắt đầu 24 giờ tính chính xác từ `bookings.createdAt` hay
    từ thời điểm payment thành công? Tài liệu hiện dùng `createdAt`.
6.  Nếu webhook payment đến sau khi hold 1 giờ đã hết hạn, xử lý hoàn
    tiền/đối soát như thế nào?
7.  Mẫu DAILY có cần hỗ trợ ngày nghỉ riêng, ngày lễ hoặc giờ đặc biệt
    không? Nếu có, nên thêm schedule override.
8.  Khi Owner thay mẫu giờ hoặc giá, thay đổi có hiệu lực ngay hay từ
    ngày tương lai được chọn?

## 18. Nguyên tắc bắt buộc khi triển khai

1.  Backend là nguồn sự thật cho giá, quyền, trạng thái và availability.
2.  Không tin ID user/owner/customer, role, amount, discount hoặc status
    từ frontend.
3.  Mọi dữ liệu riêng tư phải kiểm tra ownership.
4.  Mọi state transition phải validate và update atomic.
5.  Booking phải chống overlap/race condition; unique index đơn lẻ không
    đủ cho khoảng tùy ý.
6.  Payment chỉ xác nhận từ nguồn tin cậy; webhook phải verify và
    idempotent.
7.  Access token ngắn hạn; refresh token rotate, lưu hash, có thể
    revoke.
8.  Không lưu password/token/secret dạng rõ hoặc ghi vào log.
9.  Không trả Mongo document trực tiếp; dùng response DTO.
10. List endpoint phải phân trang và giới hạn size.
11. Index theo query thực tế, xác minh bằng explain.
12. Không gọi dịch vụ ngoài trong transaction DB.
13. Test permission và concurrency là tiêu chí nghiệm thu.
14. Hành động Admin/Owner nhạy cảm phải có audit trail.
15. Chốt các quyết định tại mục 17 trước production.

------------------------------------------------------------------------

## 19. Tài liệu tham khảo

-   Spring Security: https://docs.spring.io/spring-security/reference/
-   Spring Boot: https://docs.spring.io/spring-boot/reference/
-   Spring Data MongoDB:
    https://docs.spring.io/spring-data/mongodb/reference/
-   MongoDB Indexes: https://www.mongodb.com/docs/manual/indexes/
-   MongoDB Transactions:
    https://www.mongodb.com/docs/manual/core/transactions/
-   OWASP ASVS:
    https://owasp.org/www-project-application-security-verification-standard/
-   OWASP API Security: https://owasp.org/www-project-api-security/
-   RFC 7519 --- JWT: https://www.rfc-editor.org/rfc/rfc7519
-   RFC 9700 --- OAuth 2.0 Security BCP:
    https://www.rfc-editor.org/rfc/rfc9700

> Đây là đặc tả nền tảng và API contract đề xuất. Cần điều chỉnh theo
> quyết định nghiệp vụ, cổng thanh toán và hạ tầng thực tế. Token, URL
> và dữ liệu ví dụ không phải credential có thể sử dụng.
