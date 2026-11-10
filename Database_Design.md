# SPORTBOOKING --- DATABASE DESIGN (MONGODB)

**Phiên bản:** 2.0\
**Ngày cập nhật:** 08/11/2026\
**Database:** `sportbooking_db`\
**Backend:** Java Spring Boot · MongoDB

> Tài liệu database tách riêng khỏi
> `SportBooking_Backend_Functions_API_Security_Guidelines.md`.\
> MongoDB dùng **collection/document** thay vì bảng/row như SQL. Trong
> tài liệu, từ "bảng" được dùng theo cách gọi dễ hiểu; mỗi collection có
> một bảng mô tả gồm đúng 4 cột: **Tên cột/field, Kiểu dữ liệu, NOT
> NULL, Công dụng**.

------------------------------------------------------------------------

## 1. Tổng quan thiết kế

### 1.1 Danh sách collections

Database phiên bản này có **16 collections**:

1.  `users`
2.  `auth_sessions`
3.  `owner_applications`
4.  `sports_categories`
5.  `facilities`
6.  `courts`
7.  `operating_hours`
8.  `price_rules`
9.  `blocked_slots`
10. `bookings`
11. `booking_slots`
12. `payments`
13. `reviews`
14. `favorites`
15. `notifications`
16. `complaints`

Không còn collection khuyến mãi hoặc lịch sử sử dụng khuyến mãi.

### 1.2 Quy ước dữ liệu

  ---------------------------------------------------------------------
  Quy ước                            Ý nghĩa
  ---------------------------------- ----------------------------------
  `_id`                              MongoDB ObjectId tự sinh, định
                                     danh document

  `ObjectId`                         Lưu ID tham chiếu đến document ở
                                     collection khác

  `String`                           Chuỗi ký tự

  `Boolean`                          true/false

  `Date`                             Thời điểm lưu UTC

  `Number/Int32/Int64`               Số nguyên

  `Decimal128`                       Số thập phân chính xác, phù hợp
                                     giá trị tiền

  `Object`                           Object nhúng

  `Array<T>`                         Mảng các giá trị kiểu T

  NOT NULL = Có                      Field bắt buộc phải có và không
                                     được null

  NOT NULL = Không                   Field có thể thiếu hoặc null theo
                                     quy tắc nghiệp vụ
  ---------------------------------------------------------------------

**Lưu ý:** MongoDB không có constraint `NOT NULL` như SQL theo mặc định.
Cột NOT NULL trong tài liệu là quy tắc validation ở Spring Boot/MongoDB
JSON Schema Validator. `_id` luôn bắt buộc và tự sinh nếu không truyền.

### 1.3 Quy tắc thời gian và tiền

-   Lưu timestamp dưới dạng BSON Date theo UTC.
-   `bookingDate`, `specificDates`, `effectiveFrom`, `effectiveTo` là
    ngày dạng `yyyy-MM-dd` khi chỉ cần ngày lịch.
-   Giờ trong ngày dùng chuỗi `HH:mm` theo timezone của cơ sở; phiên bản
    hiện tại mặc định `Asia/Ho_Chi_Minh`.
-   Giá trị tiền dùng Decimal128 hoặc số nguyên VND theo một quy ước duy
    nhất. Trong tài liệu này chọn `Decimal128` để biểu diễn tiền; Java
    dùng `BigDecimal`.
-   Không dùng `float` hoặc `double` cho tiền.
-   ID tham chiếu là ObjectId; MongoDB không tự enforce foreign key.

### 1.4 Quy tắc booking đã chốt

-   Một booking có thể chứa nhiều khung giờ của **cùng một sân**.
-   `bookings.items` lưu snapshot từng khung giờ và tiền của từng khung
    giờ.
-   `bookings.priceDetails` lưu tổng tiền của toàn booking.
-   `booking_slots` lưu từng slot nhỏ đã chiếm để chống đặt trùng.
-   Khách chọn đặt cọc 20% hoặc thanh toán đủ 100%.
-   Nếu trong 1 giờ từ lúc tạo booking chưa thanh toán thành công tối
    thiểu 20% hoặc đủ 100%, booking hết hạn và giải phóng toàn bộ slot.
-   Nếu đã đặt cọc/thanh toán, khách được hủy trong 24 giờ kể từ
    `bookings.createdAt`; hệ thống hoàn số tiền thực tế đã thu theo kết
    quả provider.
-   Sau 24 giờ kể từ lúc tạo booking, không cho hủy và không hoàn tiền.
-   Các quy tắc này phải được enforce ở backend, không chỉ hiển thị trên
    frontend.

### 1.5 Quy tắc lịch cho thuê và giá

-   Owner cấu hình một mẫu khung giờ cho thuê `DAILY` trên mỗi sân.
-   Mẫu được áp dụng lặp lại cho các ngày tương lai từ `effectiveFrom`,
    không cần tạo operating-hour document cho từng ngày.
-   Booking/blocked slot được đối chiếu với mẫu lịch khi khách xem
    availability hoặc đặt sân.
-   `price_rules` hỗ trợ `specificDates` để áp dụng giá cho các ngày
    được chọn; quy tắc ngày cụ thể ưu tiên hơn quy tắc lặp theo thứ.

------------------------------------------------------------------------

## 2. Collection `users`

**Công dụng:** Lưu tài khoản, thông tin hồ sơ, vai trò và trạng thái
người dùng. Một user có thể đồng thời là Customer và Owner.

  -----------------------------------------------------------------------------
  Tên cột / Field      Kiểu dữ liệu             NOT NULL      Công dụng
  -------------------- ------------------------ ------------- -----------------
  `_id`                ObjectId                 Có            ID duy nhất của
                                                              người dùng

  `fullName`           String                   Có            Họ tên hiển thị

  `email`              String                   Có            Email đăng nhập;
                                                              normalize
                                                              lowercase và
                                                              unique

  `password`           String                   Có            Password hash
                                                              BCrypt/Argon2,
                                                              không lưu mật
                                                              khẩu rõ

  `phone`              String                   Không         Số điện thoại
                                                              liên hệ

  `avatar`             String                   Không         Đường dẫn file ảnh đại diện đã upload (`/uploads/<timestamp>_<randomId>_<fileName>`)

  `address`            Object                   Không         Địa chỉ hồ sơ
                                                              dạng nhúng

  `address.province`   String                   Không         Tỉnh/thành

  `address.district`   String                   Không         Quận/huyện

  `address.ward`       String                   Không         Phường/xã

  `address.detail`     String                   Không         Địa chỉ chi tiết

  `roles`              Array`<String>`{=html}   Có            Danh sách role:
                                                              CUSTOMER, OWNER,
                                                              ADMIN

  `ownerStatus`        String                   Có            NOT_REGISTERED,
                                                              PENDING,
                                                              APPROVED,
                                                              REJECTED

  `status`             String                   Có            ACTIVE, INACTIVE,
                                                              BANNED

  `isEmailVerified`    Boolean                  Có            Email đã được xác
                                                              minh hay chưa

  `createdAt`          Date                     Có            Thời điểm tạo tài
                                                              khoản

  `updatedAt`          Date                     Có            Thời điểm cập
                                                              nhật gần nhất
  -----------------------------------------------------------------------------

**Ràng buộc:** - `email` unique, trim và lowercase trước khi lưu. -
`roles` mặc định `["CUSTOMER"]`; không nhận roles từ API đăng ký. - Chỉ
thêm OWNER sau khi Admin duyệt Owner application. - `password` luôn là
hash; không bao giờ trả field này qua API. - Không cho user tự cập nhật
`roles`, `ownerStatus`, `status`, `isEmailVerified`.

**Index đề xuất:** unique `{email: 1}`; `{status: 1}`;
`{roles: 1, status: 1}` nếu có truy vấn phù hợp.

------------------------------------------------------------------------

## 3. Collection `auth_sessions`

**Công dụng:** Quản lý phiên đăng nhập và refresh token để hỗ trợ
refresh token rotation, logout từng thiết bị, logout tất cả và thu hồi
phiên khi tài khoản bị khóa.

  ------------------------------------------------------------------------
  Tên cột / Field       Kiểu dữ liệu     NOT NULL         Công dụng
  --------------------- ---------------- ---------------- ----------------
  `_id`                 ObjectId         Có               ID phiên đăng
                                                          nhập

  `userId`              ObjectId         Có               Người dùng sở
                                                          hữu phiên

  `sessionId`           String           Có               ID phiên public
                                                          dùng để tham
                                                          chiếu khi revoke

  `familyId`            String           Có               Nhóm token
                                                          rotation; revoke
                                                          cả family khi
                                                          phát hiện reuse

  `refreshTokenHash`    String           Có               Hash refresh
                                                          token hiện tại,
                                                          không lưu token
                                                          thô

  `previousTokenHash`   String           Không            Hash token trước
                                                          đó để phát hiện
                                                          reuse nếu triển
                                                          khai

  `deviceName`          String           Không            Tên thiết bị do
                                                          client cung cấp,
                                                          không dùng làm
                                                          bằng chứng tin
                                                          cậy

  `userAgent`           String           Không            User-Agent rút
                                                          gọn để nhận diện
                                                          phiên

  `ipAddress`           String           Không            IP tại thời điểm
                                                          đăng nhập, chỉ
                                                          lưu nếu cần và
                                                          theo policy

  `expiresAt`           Date             Có               Thời điểm phiên
                                                          hết hạn

  `lastUsedAt`          Date             Có               Lần refresh/hoạt
                                                          động gần nhất

  `revokedAt`           Date             Không            Thời điểm thu
                                                          hồi; null nếu
                                                          chưa thu hồi

  `createdAt`           Date             Có               Thời điểm tạo
                                                          phiên
  ------------------------------------------------------------------------

**Ràng buộc:** - Refresh token sinh từ random bytes đủ mạnh; chỉ lưu
hash. - Mỗi lần refresh phải rotate token và vô hiệu token cũ. - Reuse
token đã rotate phải kích hoạt thu hồi token family/session theo
policy. - User BANNED/INACTIVE không được refresh. - Có thể đặt TTL
index trên `expiresAt` để dọn dữ liệu hết hạn, nhưng vẫn phải kiểm tra
expiry trong backend.

**Index đề xuất:** `{userId: 1, revokedAt: 1}`; unique `{sessionId: 1}`;
`{familyId: 1}`; TTL `{expiresAt: 1}` (chỉ dùng để cleanup).

------------------------------------------------------------------------

## 4. Collection `owner_applications`

**Công dụng:** Lưu hồ sơ Customer đăng ký trở thành Owner và kết quả xét
duyệt của Admin.

  -------------------------------------------------------------------------------
  Tên cột / Field              Kiểu dữ liệu             NOT NULL    Công dụng
  ---------------------------- ------------------------ ----------- -------------
  `_id`                        ObjectId                 Có          ID hồ sơ

  `userId`                     ObjectId                 Có          User nộp hồ
                                                                    sơ

  `businessName`               String                   Có          Tên cá
                                                                    nhân/hộ kinh
                                                                    doanh/doanh
                                                                    nghiệp

  `businessAddress`            Object                   Có          Địa chỉ hoạt
                                                                    động kinh
                                                                    doanh

  `businessAddress.province`   String                   Có          Tỉnh/thành

  `businessAddress.district`   String                   Có          Quận/huyện

  `businessAddress.ward`       String                   Có          Phường/xã

  `businessAddress.detail`     String                   Không       Địa chỉ chi
                                                                    tiết

  `contactPhone`               String                   Có          Số điện thoại
                                                                    liên hệ

  `documents`                  Array`<Object>`{=html}   Không       Danh sách
                                                                    giấy tờ minh
                                                                    chứng

  `documents[].fileUrl`        String                   Có nếu có   Đường dẫn file đã upload (`/uploads/<timestamp>_<randomId>_<fileName>`)
                                                        document    

  `documents[].fileName`       String                   Có nếu có   Tên file lưu kèm ký tự định danh tránh trùng
                                                        document    

  `documents[].documentType`   String                   Có nếu có   Loại giấy tờ
                                                        document    

  `documents[].uploadedAt`     Date                     Có nếu có   Thời điểm
                                                        document    upload

  `status`                     String                   Có          PENDING,
                                                                    APPROVED,
                                                                    REJECTED

  `reviewedBy`                 ObjectId                 Không       Admin xét
                                                                    duyệt

  `reviewedAt`                 Date                     Không       Thời điểm xét
                                                                    duyệt

  `rejectionReason`            String                   Không       Lý do từ chối

  `createdAt`                  Date                     Có          Thời điểm nộp

  `updatedAt`                  Date                     Có          Thời điểm cập
                                                                    nhật
  -------------------------------------------------------------------------------

**Ràng buộc:** - `userId` phải tham chiếu user tồn tại. - Mỗi user chỉ
có tối đa một hồ sơ PENDING tại một thời điểm. - Chỉ Admin được
approve/reject. - Approve phải cập nhật `users.roles` và
`users.ownerStatus` nhất quán. - File giấy tờ không nên để public nếu có
dữ liệu cá nhân.

**Index đề xuất:** `{userId: 1, status: 1}`;
`{status: 1, createdAt: -1}`.

------------------------------------------------------------------------

## 5. Collection `sports_categories`

**Công dụng:** Danh mục môn thể thao để phân loại sân, ví dụ bóng đá,
cầu lông, tennis, pickleball.

  Tên cột / Field   Kiểu dữ liệu   NOT NULL   Công dụng
  ----------------- -------------- ---------- -----------------------------
  `_id`             ObjectId       Có         ID danh mục
  `name`            String         Có         Tên môn thể thao
  `code`            String         Có         Mã duy nhất, ví dụ FOOTBALL
  `description`     String         Không      Mô tả danh mục
  `icon`            String         Không      Tên icon hoặc URL icon
  `status`          String         Có         ACTIVE hoặc INACTIVE
  `createdAt`       Date           Có         Ngày tạo
  `updatedAt`       Date           Có         Ngày cập nhật

**Ràng buộc:** `code` unique, uppercase; không hard delete khi đã có
court tham chiếu; chuyển INACTIVE khi ngừng sử dụng.

**Index đề xuất:** unique `{code: 1}`; `{status: 1, name: 1}`.

------------------------------------------------------------------------

## 6. Collection `facilities`

**Công dụng:** Lưu thông tin cơ sở thể thao do Owner quản lý. Một cơ sở
có thể chứa nhiều sân.

  --------------------------------------------------------------------------------------
  Tên cột / Field          Kiểu dữ liệu             NOT NULL   Công dụng
  ------------------------ ------------------------ ---------- -------------------------
  `_id`                    ObjectId                 Có         ID cơ sở

  `ownerId`                ObjectId                 Có         User Owner sở hữu cơ sở

  `name`                   String                   Có         Tên cơ sở

  `description`            String                   Không      Mô tả cơ sở

  `address`                Object                   Có         Địa chỉ nhúng

  `address.province`       String                   Có         Tỉnh/thành

  `address.district`       String                   Có         Quận/huyện

  `address.ward`           String                   Có         Phường/xã

  `address.detail`         String                   Không      Địa chỉ chi tiết

  `location`               Object (GeoJSON Point)   Không      Tọa độ phục vụ tìm kiếm
                                                               gần

  `location.type`          String                   Có nếu     Giá trị cố định `Point`
                                                    location   
                                                    có         

  `location.coordinates`   Array`<Number>`{=html}   Có nếu     `[longitude, latitude]`
                                                    location   
                                                    có         

  `images`                 Array`<Object>`{=html}   Không      Ảnh cơ sở (tải lên qua upload file)

  `images[].url`           String                   Có nếu có  Đường dẫn ảnh đã upload kèm
                                                    image      định danh tránh trùng (`/uploads/<timestamp>_<randomId>_<fileName>`)

  `images[].alt`           String                   Không      Mô tả ảnh

  `amenities`              Array`<String>`{=html}   Không      Tiện ích: PARKING,
                                                               CHANGING_ROOM...

  `status`                 String                   Có         PENDING, APPROVED,
                                                               REJECTED, SUSPENDED,
                                                               INACTIVE

  `createdAt`              Date                     Có         Thời điểm tạo

  `updatedAt`              Date                     Có         Thời điểm cập nhật
  --------------------------------------------------------------------------------------

**Ràng buộc:** - `ownerId` phải là user đã được duyệt OWNER. - Facility
mới mặc định PENDING; chỉ APPROVED mới công khai. - Owner chỉ đọc/sửa
facility của mình. - Tọa độ GeoJSON theo thứ tự longitude trước
latitude. - Admin không có chức năng quản lý facility/court theo phạm vi
chức năng đã chốt; Owner quản lý cơ sở của mình.

**Index đề xuất:** `{ownerId: 1, status: 1}`;
`{status: 1, createdAt: -1}`; `2dsphere` trên `location`.

------------------------------------------------------------------------

## 7. Collection `courts`

**Công dụng:** Lưu từng sân cụ thể thuộc một cơ sở, có loại hình, thuộc
tính, sức chứa và trạng thái.

  Tên cột / Field   Kiểu dữ liệu             NOT NULL          Công dụng
  ----------------- ------------------------ ----------------- ----------------------------------
  `_id`             ObjectId                 Có                ID sân
  `facilityId`      ObjectId                 Có                Cơ sở chứa sân
  `categoryId`      ObjectId                 Có                Danh mục thể thao
  `name`            String                   Có                Tên/mã hiển thị sân
  `description`     String                   Không             Mô tả sân
  `attributes`      Object                   Không             Thuộc tính linh hoạt theo môn
  `images`          Array`<Object>`{=html}   Không             Ảnh sân (tải lên qua upload file)
  `images[].url`    String                   Có nếu có image   Đường dẫn ảnh đã upload kèm định danh tránh trùng (`/uploads/<timestamp>_<randomId>_<fileName>`)
  `images[].alt`    String                   Không             Mô tả ảnh
  `capacity`        Int32                    Không             Sức chứa/số người phù hợp
  `status`          String                   Có                AVAILABLE, MAINTENANCE, INACTIVE
  `createdAt`       Date                     Có                Thời điểm tạo
  `updatedAt`       Date                     Có                Thời điểm cập nhật

**Ràng buộc:** - `facilityId` phải thuộc Owner hiện tại khi tạo/sửa. -
`categoryId` phải tồn tại và ACTIVE. - `attributes` được validate theo
loại sân, không cho ghi đè field hệ thống. - Không chuyển
INACTIVE/MAINTENANCE nếu còn booking tương lai chưa được xử lý.

**Index đề xuất:** `{facilityId: 1, status: 1}`;
`{categoryId: 1, status: 1}`.

------------------------------------------------------------------------

## 8. Collection `operating_hours`

**Công dụng:** Lưu mẫu khung giờ cho thuê lặp lại hằng ngày của một sân.
Owner cấu hình ngay khi thêm/sửa sân (hoặc tại màn hình lịch hoạt động) các khung giờ cho thuê của 1 ngày (ví dụ `12:00 - 13:00`, `14:00 - 16:00`); các ngày tiếp theo dùng cùng mẫu từ
`effectiveFrom`. Không cần tạo document cho từng ngày.

  ----------------------------------------------------------------------------
  Tên cột / Field           Kiểu dữ liệu             NOT NULL     Công dụng
  ------------------------- ------------------------ ------------ ------------
  `_id`                     ObjectId                 Có           ID cấu hình
                                                                  lịch

  `courtId`                 ObjectId                 Có           Sân áp dụng
                                                                  lịch

  `repeatMode`              String                   Có           Phiên bản
                                                                  này dùng
                                                                  `DAILY`

  `effectiveFrom`           String (yyyy-MM-dd)      Có           Ngày bắt đầu
                                                                  áp dụng mẫu

  `effectiveTo`             String (yyyy-MM-dd)      Không        Ngày kết
                                                                  thúc; null
                                                                  nghĩa là
                                                                  chưa giới
                                                                  hạn

  `timeSlots`               Array`<Object>`{=html}   Có           Danh sách
                                                                  khung giờ
                                                                  cho thuê
                                                                  trong một
                                                                  ngày

  `timeSlots[].startTime`   String (HH:mm)           Có nếu có    Giờ bắt đầu
                                                     slot         

  `timeSlots[].endTime`     String (HH:mm)           Có nếu có    Giờ kết thúc
                                                     slot         

  `createdAt`               Date                     Có           Thời điểm
                                                                  tạo

  `updatedAt`               Date                     Có           Thời điểm
                                                                  cập nhật
  ----------------------------------------------------------------------------

**Ràng buộc:** - Một mẫu DAILY hiện hành cho mỗi court; unique
`courtId`. - Các slot phải có startTime \< endTime, không chồng lấn và
tuân theo duration/slot policy. - `effectiveTo` phải lớn hơn hoặc bằng
`effectiveFrom`. - Khi lấy availability, backend áp mẫu DAILY cho ngày
được hỏi, sau đó trừ blocked slots và booking/hold. - Thay đổi template
không được làm mất booking đã xác nhận. - Nếu sau này cần nghỉ lễ/ngoại
lệ theo ngày, có thể mở rộng bằng schedule override riêng hoặc bổ sung
collection; không tạo trước document cho mọi ngày.

**Index đề xuất:** unique `{courtId: 1}`.

------------------------------------------------------------------------

## 9. Collection `price_rules`

**Công dụng:** Lưu quy tắc giá theo khoảng giờ, ngày cụ thể hoặc thứ lặp
lại. Backend dùng collection này để tính giá từng khung giờ trong
booking.

  ------------------------------------------------------------------------
  Tên cột / Field   Kiểu dữ liệu             NOT NULL       Công dụng
  ----------------- ------------------------ -------------- --------------
  `_id`             ObjectId                 Có             ID quy tắc giá

  `courtId`         ObjectId                 Có             Sân áp dụng

  `name`            String                   Có             Tên quy tắc

  `specificDates`   Array`<String>`{=html}   Không          Các ngày cụ
                    (yyyy-MM-dd)                            thể được Owner
                                                            chọn

  `daysOfWeek`      Array`<Int32>`{=html}    Không          Các thứ ISO
                                                            1--7 cho rule
                                                            lặp

  `startTime`       String (HH:mm)           Có             Giờ bắt đầu áp
                                                            dụng

  `endTime`         String (HH:mm)           Có             Giờ kết thúc
                                                            áp dụng

  `pricePerSlot`    Decimal128               Có             Giá cho một
                                                            slot chuẩn

  `validFrom`       String (yyyy-MM-dd)      Có             Ngày bắt đầu
                                                            hiệu lực

  `validTo`         String (yyyy-MM-dd)      Không          Ngày kết thúc
                                                            hiệu lực

  `priority`        Int32                    Có             Độ ưu tiên khi
                                                            nhiều rule
                                                            cùng khớp

  `status`          String                   Có             ACTIVE hoặc
                                                            INACTIVE

  `createdAt`       Date                     Có             Thời điểm tạo

  `updatedAt`       Date                     Có             Thời điểm cập
                                                            nhật
  ------------------------------------------------------------------------

**Ràng buộc:** - Owner phải sở hữu court. - `pricePerSlot > 0`;
`startTime < endTime`; `validFrom <= validTo` nếu có validTo. -
`specificDates` và `daysOfWeek` không chứa phần tử trùng. - Rule theo
ngày cụ thể được ưu tiên hơn rule lặp theo thứ. - Nếu nhiều rule cùng độ
ưu tiên và cùng áp dụng, phải từ chối cấu hình xung đột hoặc áp
tie-break cố định. - Không có rule phù hợp thì dùng giá mặc định đã được
định nghĩa hoặc không cho đặt; không tự suy đoán giá. - Booking lưu
snapshot giá, không bị thay đổi khi rule được chỉnh sửa.

**Index đề xuất:** `{courtId: 1, status: 1, validFrom: 1, validTo: 1}`;
kiểm tra query thực tế khi lọc `specificDates`.

------------------------------------------------------------------------

## 10. Collection `blocked_slots`

**Công dụng:** Lưu khoảng thời gian Owner khóa sân do bảo trì, sự kiện
riêng hoặc lý do khác.

  Tên cột / Field   Kiểu dữ liệu   NOT NULL   Công dụng
  ----------------- -------------- ---------- -------------------------------
  `_id`             ObjectId       Có         ID lịch khóa
  `courtId`         ObjectId       Có         Sân bị khóa
  `startAt`         Date           Có         Thời điểm bắt đầu khóa (UTC)
  `endAt`           Date           Có         Thời điểm kết thúc khóa (UTC)
  `reason`          String         Có         Lý do khóa
  `createdBy`       ObjectId       Có         Owner tạo lịch khóa
  `createdAt`       Date           Có         Thời điểm tạo

**Ràng buộc:** - `startAt < endAt`. - Không được overlap với booking đã
xác nhận nếu chưa có quy trình xử lý booking. - Không cho Owner khóa sân
thuộc cơ sở của Owner khác. - Gỡ blocked slot không thay đổi booking
hiện có. - Cần kiểm tra overlap bằng logic nghiệp vụ/transaction; index
thông thường không tự enforce interval exclusion.

**Index đề xuất:** `{courtId: 1, startAt: 1, endAt: 1}`.

------------------------------------------------------------------------

## 11. Collection `bookings`

**Công dụng:** Lưu booking cha của Customer. Một booking có thể gồm
nhiều khung giờ của cùng một sân; collection này lưu danh sách item và
tổng tiền.

  -----------------------------------------------------------------------------------------
  Tên cột / Field                  Kiểu dữ liệu             NOT NULL  Công dụng
  -------------------------------- ------------------------ --------- ---------------------
  `_id`                            ObjectId                 Có        ID booking

  `bookingCode`                    String                   Có        Mã booking hiển thị,
                                                                      unique

  `customerId`                     ObjectId                 Có        Customer tạo booking

  `facilityId`                     ObjectId                 Có        Cơ sở có sân được đặt

  `courtId`                        ObjectId                 Có        Sân được đặt; một
                                                                      booking chỉ một court

  `items`                          Array`<Object>`{=html}   Có        Danh sách các khung
                                                                      giờ được đặt

  `items[].bookingDate`            String (yyyy-MM-dd)      Có nếu có Ngày thuê của item
                                                            item      

  `items[].startAt`                Date                     Có nếu có Thời điểm bắt đầu UTC
                                                            item      

  `items[].endAt`                  Date                     Có nếu có Thời điểm kết thúc
                                                            item      UTC

  `items[].durationMinutes`        Int32                    Có nếu có Thời lượng item
                                                            item      

  `items[].unitPrice`              Decimal128               Có nếu có Giá slot/đơn vị đã
                                                            item      chốt

  `items[].amount`                 Decimal128               Có nếu có Thành tiền item
                                                            item      

  `totalDurationMinutes`           Int32                    Có        Tổng thời lượng tất
                                                                      cả item

  `priceDetails`                   Object                   Có        Snapshot tổng tiền

  `priceDetails.originalAmount`    Decimal128               Có        Tổng tiền trước điều
                                                                      chỉnh

  `priceDetails.depositRequired`   Decimal128               Có        Số tiền đặt cọc 20%

  `priceDetails.paidAmount`        Decimal128               Có        Tổng số tiền đã thu
                                                                      thành công

  `priceDetails.remainingAmount`   Decimal128               Có        Số tiền còn phải thu

  `priceDetails.currency`          String                   Có        Đơn vị tiền, ví dụ
                                                                      VND

  `paymentOption`                  String                   Có        DEPOSIT_20_PERCENT
                                                                      hoặc FULL_PAYMENT (Khách hàng chọn ở màn hình Thanh toán sau khi bấm "Đến thanh toán" giữ chỗ HOLD)

  `status`                         String                   Có        PENDING_PAYMENT,
                                                                      CONFIRMED, EXPIRED,
                                                                      CANCELLED, COMPLETED

  `paymentStatus`                  String                   Có        UNPAID, DEPOSIT_PAID,
                                                                      PAID, REFUND_PENDING,
                                                                      PARTIALLY_REFUNDED,
                                                                      REFUNDED,
                                                                      PAYMENT_FAILED

  `holdExpiresAt`                  Date                     Không     Hạn giữ chỗ =
                                                                      createdAt + 1 giờ;
                                                                      null sau khi thanh
                                                                      toán hợp lệ

  `cancellationDeadline`           Date                     Có        Hạn hủy = createdAt +
                                                                      24 giờ

  `cancelledAt`                    Date                     Không     Thời điểm hủy

  `cancelReason`                   String                   Không     Lý do hủy

  `note`                           String                   Không     Ghi chú của Customer

  `createdAt`                      Date                     Có        Thời điểm tạo booking

  `updatedAt`                      Date                     Có        Thời điểm cập nhật
  -----------------------------------------------------------------------------------------

**Ràng buộc:** - `customerId` lấy từ access token; không nhận từ request
body. - `facilityId`/`courtId` phải khớp quan hệ thực tế. - `items`
không rỗng; giới hạn số item; item không được trùng/chồng lấn. - Mỗi
item phải khớp lịch DAILY, slot duration, blocked slots và
availability. - Backend tính từng item amount và tổng amount; không tin
giá từ frontend. - `depositRequired = 20% * totalAmount` theo quy tắc
làm tròn được thống nhất. - Nếu chưa thu được ít nhất tiền cọc trong 1
giờ từ createdAt, booking EXPIRED và release mọi slot. - Nếu đã thanh
toán cọc/đủ, booking chuyển CONFIRMED; hủy chỉ được trong 24 giờ từ
createdAt. - Sau 24 giờ, API cancel bị từ chối và không refund. - Khi
hủy trong thời hạn, refund chỉ bằng số tiền thực tế đã thu và chỉ cập
nhật REFUNDED khi provider xác nhận. - Không sửa snapshot giá lịch sử.

**Index đề xuất:** unique `{bookingCode: 1}`;
`{customerId: 1, createdAt: -1}`; `{courtId: 1, createdAt: -1}`;
`{status: 1, holdExpiresAt: 1}`.

------------------------------------------------------------------------

## 12. Collection `booking_slots`

**Công dụng:** Lưu từng slot nhỏ được chiếm bởi một booking. Một booking
có nhiều slot documents. Đây là collection phục vụ chống đặt trùng khi
nhiều khách đặt đồng thời.

  Tên cột / Field   Kiểu dữ liệu          NOT NULL   Công dụng
  ----------------- --------------------- ---------- -----------------------------------
  `_id`             ObjectId              Có         ID slot record
  `courtId`         ObjectId              Có         Sân bị chiếm
  `bookingId`       ObjectId              Có         Booking cha
  `slotDate`        String (yyyy-MM-dd)   Có         Ngày slot
  `startAt`         Date                  Có         Bắt đầu slot UTC
  `endAt`           Date                  Có         Kết thúc slot UTC
  `status`          String                Có         HOLD, BOOKED, RELEASED
  `expiresAt`       Date                  Không      Hạn hold; chỉ có giá trị khi HOLD
  `createdAt`       Date                  Có         Thời điểm tạo record
  `updatedAt`       Date                  Có         Thời điểm cập nhật

**Ràng buộc:** - Mỗi slot chuẩn có độ dài theo cấu hình sân. - Unique
key phải bảo đảm cùng court + ngày + startAt chỉ có một slot đang
HOLD/BOOKED. Có thể dùng partial unique index cho status đang chiếm chỗ
hoặc chiến lược record active riêng. - Khi một item kéo dài nhiều slot,
tạo đủ slot con; transaction phải commit tất cả hoặc rollback tất cả. -
Khi hold hết hạn/hủy, chuyển RELEASED hoặc xóa record theo chiến lược
index đã chọn để slot có thể được đặt lại. - Không dựa vào TTL để quyết
định slot đã hết hạn; backend phải so sánh `expiresAt`. - Không cho slot
status chuyển ngược tùy ý.

**Index đề xuất:** unique partial
`{courtId: 1, slotDate: 1, startAt: 1}` với điều kiện status thuộc
HOLD/BOOKED; `{bookingId: 1}`; `{status: 1, expiresAt: 1}`.

------------------------------------------------------------------------

## 13. Collection `payments`

**Công dụng:** Lưu các lần thanh toán/đặt cọc/thanh toán phần còn lại và
hoàn tiền cho booking. Một booking có thể có nhiều payment attempts.

  ------------------------------------------------------------------------
  Tên cột / Field     Kiểu dữ liệu    NOT NULL        Công dụng
  ------------------- --------------- --------------- --------------------
  `_id`               ObjectId        Có              ID payment

  `bookingId`         ObjectId        Có              Booking được thanh
                                                      toán

  `customerId`        ObjectId        Có              Người thanh toán

  `paymentType`       String          Có              DEPOSIT, FULL,
                                                      REMAINING, REFUND

  `amount`            Decimal128      Có              Số tiền giao dịch

  `currency`          String          Có              Đơn vị tiền

  `method`            String          Có              CASH, BANK_TRANSFER,
                                                      ONLINE

  `provider`          String          Không           Nhà cung cấp thanh
                                                      toán

  `transactionCode`   String          Không           Mã giao dịch
                                                      provider

  `providerEventId`   String          Không           ID webhook/event để
                                                      chống xử lý lặp

  `status`            String          Có              PENDING, PAID,
                                                      FAILED,
                                                      REFUND_PENDING,
                                                      REFUNDED,
                                                      PARTIALLY_REFUNDED

  `paidAt`            Date            Không           Thời điểm thanh toán
                                                      thành công

  `refundedAt`        Date            Không           Thời điểm hoàn tiền
                                                      được xác nhận

  `failureReason`     String          Không           Lý do thất bại đã
                                                      được làm sạch dữ
                                                      liệu

  `createdAt`         Date            Có              Thời điểm tạo

  `updatedAt`         Date            Có              Thời điểm cập nhật
  ------------------------------------------------------------------------

**Ràng buộc:** - Amount do backend tính từ booking; không nhận amount
client. - Deposit bằng 20% tổng booking; Full bằng 100%; Remaining bằng
số tiền còn thiếu. - Chỉ webhook hợp lệ hoặc quy trình xác nhận được
phân quyền mới đổi trạng thái sang PAID. - Verify chữ ký, amount,
currency, booking, transaction code và event ID. - Webhook xử lý
idempotent; event đã xử lý không được cộng tiền lần nữa. - Không lưu số
thẻ, CVV, OTP hoặc credential thanh toán. - Không unique `bookingId` vì
có thể nhiều lần thử thanh toán. - `providerEventId`/`transactionCode`
nên unique khi có giá trị, bằng partial unique index.

**Index đề xuất:** `{bookingId: 1, createdAt: -1}`;
`{customerId: 1, createdAt: -1}`; unique partial `{transactionCode: 1}`;
unique partial `{providerEventId: 1}`.

------------------------------------------------------------------------

## 14. Collection `reviews`

**Công dụng:** Lưu đánh giá của Customer cho sân/cơ sở sau khi hoàn
thành booking.

  Tên cột / Field          Kiểu dữ liệu             NOT NULL          Công dụng
  ------------------------ ------------------------ ----------------- ---------------------------------
  `_id`                    ObjectId                 Có                ID review
  `bookingId`              ObjectId                 Có                Booking được đánh giá; unique
  `customerId`             ObjectId                 Có                Người đánh giá
  `facilityId`             ObjectId                 Có                Cơ sở liên quan
  `courtId`                ObjectId                 Có                Sân liên quan
  `rating`                 Int32                    Có                Điểm 1--5
  `content`                String                   Không             Nội dung đánh giá
  `images`                 Array`<String>`{=html}   Không             Đường dẫn file ảnh đã upload (`/uploads/<timestamp>_<randomId>_<fileName>`)
  `ownerReply`             Object                   Không             Phản hồi của Owner
  `ownerReply.content`     String                   Có nếu có reply   Nội dung phản hồi
  `ownerReply.repliedAt`   Date                     Có nếu có reply   Thời điểm phản hồi
  `status`                 String                   Có                VISIBLE, HIDDEN, PENDING_REVIEW
  `createdAt`              Date                     Có                Thời điểm tạo
  `updatedAt`              Date                     Có                Thời điểm cập nhật

**Ràng buộc:** - Booking thuộc Customer và đã COMPLETED. - Mỗi booking
chỉ có một review; unique `bookingId`. - Rating integer 1--5; giới hạn
content và số lượng ảnh. - Owner chỉ phản hồi review thuộc facility mình
sở hữu. - Admin có thể kiểm duyệt ẩn/khôi phục; không sửa nội dung gốc
để che lịch sử.

**Index đề xuất:** unique `{bookingId: 1}`;
`{facilityId: 1, createdAt: -1}`; `{status: 1}`.

------------------------------------------------------------------------

## 15. Collection `favorites`

**Công dụng:** Lưu cơ sở hoặc sân mà user đánh dấu yêu thích.

  Tên cột / Field   Kiểu dữ liệu   NOT NULL   Công dụng
  ----------------- -------------- ---------- ----------------------------------
  `_id`             ObjectId       Có         ID favorite
  `userId`          ObjectId       Có         User sở hữu favorite
  `targetType`      String         Có         FACILITY hoặc COURT
  `targetId`        ObjectId       Có         ID cơ sở hoặc sân được yêu thích
  `createdAt`       Date           Có         Thời điểm thêm yêu thích

**Ràng buộc:** `userId` lấy từ principal; targetType chỉ FACILITY/COURT;
target tồn tại; không cho user thao tác favorite của người khác.

**Index đề xuất:** unique `{userId: 1, targetType: 1, targetId: 1}`;
`{userId: 1, createdAt: -1}`.

------------------------------------------------------------------------

## 16. Collection `notifications`

**Công dụng:** Lưu thông báo gửi đến user: booking, thanh toán, hủy,
hoàn tiền, Owner application, khiếu nại và các sự kiện hệ thống.

  -------------------------------------------------------------------------
  Tên cột / Field Kiểu dữ liệu  NOT NULL      Công dụng
  --------------- ------------- ------------- -----------------------------
  `_id`           ObjectId      Có            ID thông báo

  `userId`        ObjectId      Có            Người nhận

  `title`         String        Có            Tiêu đề

  `message`       String        Có            Nội dung

  `type`          String        Có            BOOKING, PAYMENT, REFUND,
                                              OWNER, COMPLAINT, SYSTEM...

  `referenceId`   ObjectId      Không         ID
                                              booking/payment/application
                                              liên quan

  `isRead`        Boolean       Có            Đã đọc hay chưa

  `createdAt`     Date          Có            Thời điểm tạo
  -------------------------------------------------------------------------

**Ràng buộc:** - Chỉ user nhận được đọc/cập nhật/xóa notification của
mình. - `read-all` phải lọc theo userId từ principal. - Không chứa
password, token hoặc dữ liệu thanh toán nhạy cảm. - Thông báo tạo sau
khi transaction nghiệp vụ commit. - Nội dung khi tạo booking phải nêu
tổng tiền, cọc 20%/thanh toán đủ, hạn thanh toán 1 giờ, hạn hủy 24 giờ
và chính sách không hoàn sau thời hạn.

**Index đề xuất:** `{userId: 1, isRead: 1, createdAt: -1}`.

------------------------------------------------------------------------

## 17. Collection `complaints`

**Công dụng:** Lưu khiếu nại của Customer về booking/cơ sở và phản hồi
xử lý từ Owner/Admin.

  -----------------------------------------------------------------------------
  Tên cột / Field          Kiểu dữ liệu             NOT NULL     Công dụng
  ------------------------ ------------------------ ------------ --------------
  `_id`                    ObjectId                 Có           ID khiếu nại

  `userId`                 ObjectId                 Có           User tạo khiếu
                                                                 nại

  `bookingId`              ObjectId                 Không        Booking liên
                                                                 quan nếu có

  `facilityId`             ObjectId                 Không        Cơ sở liên
                                                                 quan nếu có

  `subject`                String                   Có           Tiêu đề

  `content`                String                   Có           Nội dung khiếu
                                                                 nại

  `images`                 Array`<String>`{=html}   Không        Đường dẫn file ảnh minh chứng
                                                                 đã upload (`/uploads/<timestamp>_<randomId>_<fileName>`)

  `response`               Object                   Không        Phản hồi xử lý
                                                                 hiện tại

  `response.content`       String                   Có nếu có    Nội dung phản
                                                    response     hồi

  `response.respondedBy`   ObjectId                 Có nếu có    Owner/Admin
                                                    response     phản hồi

  `response.respondedAt`   Date                     Có nếu có    Thời điểm phản
                                                    response     hồi

  `status`                 String                   Có           OPEN,
                                                                 IN_PROGRESS,
                                                                 RESOLVED,
                                                                 REJECTED,
                                                                 CLOSED

  `createdAt`              Date                     Có           Thời điểm tạo

  `updatedAt`              Date                     Có           Thời điểm cập
                                                                 nhật
  -----------------------------------------------------------------------------

**Ràng buộc:** - User chỉ khiếu nại booking của mình hoặc đối tượng được
policy cho phép. - Owner chỉ xem/phản hồi khiếu nại liên quan facility
mình sở hữu. - Admin được phân công và xử lý complaint. - Customer không
tự sửa `status`, `response`, `respondedBy`. - Giới hạn kích thước nội
dung/ảnh; lưu actor và thời điểm.

**Index đề xuất:** `{userId: 1, createdAt: -1}`;
`{facilityId: 1, status: 1}`; `{status: 1, createdAt: -1}`.

------------------------------------------------------------------------

## 18. Quan hệ giữa các collections

  ------------------------------------------------------------------------------
  Nguồn                  Field tham     Đích                      Quan hệ
                         chiếu                                    
  ---------------------- -------------- ------------------------- --------------
  `auth_sessions`        `userId`       `users._id`               Một user có
                                                                  nhiều session

  `owner_applications`   `userId`       `users._id`               Một user có hồ
                                                                  sơ đăng ký
                                                                  Owner

  `owner_applications`   `reviewedBy`   `users._id`               Admin duyệt hồ
                                                                  sơ

  `facilities`           `ownerId`      `users._id`               Một Owner có
                                                                  nhiều facility

  `courts`               `facilityId`   `facilities._id`          Một facility
                                                                  có nhiều court

  `courts`               `categoryId`   `sports_categories._id`   Một category
                                                                  có nhiều court

  `operating_hours`      `courtId`      `courts._id`              Một court có
                                                                  mẫu lịch DAILY

  `price_rules`          `courtId`      `courts._id`              Một court có
                                                                  nhiều rule giá

  `blocked_slots`        `courtId`      `courts._id`              Một court có
                                                                  nhiều lịch
                                                                  khóa

  `blocked_slots`        `createdBy`    `users._id`               Owner tạo lịch
                                                                  khóa

  `bookings`             `customerId`   `users._id`               Một Customer
                                                                  có nhiều
                                                                  booking

  `bookings`             `facilityId`   `facilities._id`          Booking thuộc
                                                                  facility

  `bookings`             `courtId`      `courts._id`              Booking của
                                                                  một court

  `booking_slots`        `bookingId`    `bookings._id`            Booking có
                                                                  nhiều slot

  `booking_slots`        `courtId`      `courts._id`              Slot chiếm
                                                                  trên một court

  `payments`             `bookingId`    `bookings._id`            Booking có
                                                                  nhiều payment
                                                                  attempts

  `payments`             `customerId`   `users._id`               Người thanh
                                                                  toán

  `reviews`              `bookingId`    `bookings._id`            Booking có tối
                                                                  đa một review

  `reviews`              `customerId`   `users._id`               Người đánh giá

  `reviews`              `facilityId`   `facilities._id`          Review thuộc
                                                                  facility

  `reviews`              `courtId`      `courts._id`              Review thuộc
                                                                  court

  `favorites`            `userId`       `users._id`               User có nhiều
                                                                  favorite

  `notifications`        `userId`       `users._id`               User có nhiều
                                                                  notification

  `complaints`           `userId`       `users._id`               User tạo
                                                                  complaint

  `complaints`           `bookingId`    `bookings._id`            Complaint liên
                                                                  quan booking

  `complaints`           `facilityId`   `facilities._id`          Complaint liên
                                                                  quan facility
  ------------------------------------------------------------------------------

MongoDB không enforce foreign key. Service phải kiểm tra tham chiếu và
ownership trước khi ghi/đọc dữ liệu.

------------------------------------------------------------------------

## 19. Quy tắc index và tính nhất quán

1.  Tạo unique index cho email, bookingCode, court/day/start slot đang
    chiếm, review booking, favorite target và sessionId.
2.  Chỉ tạo index theo truy vấn thực tế; kiểm tra
    `explain("executionStats")`.
3.  Dùng compound index đúng thứ tự equality → sort/range theo query.
4.  Dùng `2dsphere` cho facility location.
5.  TTL chỉ dùng dọn `auth_sessions` hết hạn hoặc dữ liệu tạm; không
    dùng TTL để xác định chính xác thời điểm slot hết hạn.
6.  `booking_slots` cần partial unique index cho trạng thái HOLD/BOOKED;
    khi release phải bảo đảm slot có thể được đặt lại.
7.  Booking + booking_slots + cập nhật tổng tiền phải nhất quán trong
    transaction/atomic workflow.
8.  Payment webhook phải idempotent; unique provider event ID nếu
    provider cung cấp.
9.  Snapshot giá lưu ở booking để giá lịch sử không thay đổi.
10. Không hard delete user/facility/court/category đã có dữ liệu nghiệp
    vụ tham chiếu; ưu tiên trạng thái INACTIVE/BANNED/SUSPENDED.

------------------------------------------------------------------------

## 20. Những điểm cần thống nhất thêm

1.  Một booking nhiều khung giờ có cho phép trải trên nhiều ngày không?
    Thiết kế hiện tại cho phép lưu nhiều `bookingDate` trong `items`,
    nhưng một court duy nhất.
2.  Phần 80% còn lại sau khi đặt cọc thu online trước giờ chơi hay thu
    tại sân?
3.  Refund trong 24 giờ có hoàn toàn bộ số tiền thực thu hay có ngoại
    lệ/phí xử lý?
4.  Webhook thanh toán đến muộn sau khi hold hết 1 giờ sẽ tự động refund
    hay đưa vào đối soát?
5.  Mẫu DAILY có cần ngoại lệ ngày lễ/ngày nghỉ/giờ đặc biệt không? Nếu
    có, nên thêm schedule override.
6.  Khi Owner thay đổi giờ hoạt động, thay đổi có hiệu lực ngay hay từ
    một ngày được chọn?

------------------------------------------------------------------------

## 21. Nguyên tắc triển khai

-   Dùng Request DTO/Response DTO, không expose Mongo document trực
    tiếp.
-   Dữ liệu bắt buộc phải được validate ở backend.
-   Không tin ID, role, amount, status hoặc timestamp do client tự quyết
    định.
-   Kiểm tra ownership cho mọi tài nguyên riêng tư.
-   Dùng transaction/atomic update cho booking và slot.
-   Kiểm tra overlap; unique index start-time đơn lẻ không đủ cho khoảng
    giờ tùy ý.
-   Dùng `BigDecimal` trong Java và quy tắc làm tròn nhất quán.
-   Lưu UTC, hiển thị theo timezone của cơ sở.
-   Có test concurrency cho đặt nhiều khung giờ, payment, expiry và
    refund.
