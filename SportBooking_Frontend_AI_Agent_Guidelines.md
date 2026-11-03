# SportBooking -- Frontend UI/UX & AI Agent Implementation Specification

> **Mục đích:** Tài liệu giao việc cho AI Agent xây dựng toàn bộ
> frontend SportBooking bằng ReactJS. Agent phải đọc tài liệu database
> hiện có trước khi code, tuân thủ schema, tạo dữ liệu mock đầy đủ trong
> `frontend/mock/`, và triển khai các luồng demo hoạt động được dù
> backend chưa có.
>
> **Database chuẩn:** `sportbooking_db`, MongoDB, 17 Collections chính.
> Tài liệu schema gốc hiện được lưu với tên
> `SportBooking_Database_Design.md` (nếu nhóm đổi tên thành
> `database.md`, hãy sử dụng file đó). Không tự ý đổi tên Collection,
> thuộc tính, kiểu dữ liệu, trạng thái hoặc quan hệ khi chưa cập nhật
> tài liệu database.

------------------------------------------------------------------------

# 1. Vai trò và yêu cầu bắt buộc đối với AI Agent

Bạn là Senior Frontend Engineer kiêm UI/UX Designer. Hãy xây dựng một
website đặt sân thể thao có giao diện hoàn chỉnh, hiện đại, chuyên
nghiệp và có thể demo như một sản phẩm thực tế.

## 1.1. Công nghệ

-   ReactJS + Vite.
-   JavaScript hoặc TypeScript: ưu tiên TypeScript nếu dự án chưa có quy
    ước khác.
-   React Router cho định tuyến.
-   CSS Modules, SCSS Modules hoặc quy ước CSS scoped tương đương.
-   Có thể dùng Tailwind CSS nếu dự án đã cài và cấu hình đúng; không
    trộn nhiều hệ thống CSS một cách tùy tiện.
-   Lucide React cho icon.
-   React Hook Form kết hợp Zod (hoặc giải pháp tương đương) cho form và
    validation nếu phù hợp.
-   Recharts hoặc thư viện chart tương đương cho dashboard.
-   Không cài thư viện trùng chức năng nếu dự án đã có thư viện phù hợp.

**Nguyên tắc:** Trước khi cài package hoặc sửa cấu hình, kiểm tra
`package.json`, cấu trúc hiện tại và các thư viện đã có. Không phá vỡ
code đang hoạt động.

## 1.2. Điều kiện bắt buộc

1.  Đọc và đối chiếu tài liệu database trước khi tạo mock hoặc viết UI.
2.  Tạo `frontend/mock/` với dữ liệu mẫu tương ứng đầy đủ 17 Collections
    và đúng các thuộc tính trong database.
3.  Mọi trang, danh sách, biểu đồ, thẻ thống kê, lịch, chi tiết và form
    demo phải lấy dữ liệu từ mock service, không hardcode dữ liệu rải
    rác trong component.
4.  Các thao tác demo phải hoạt động: tìm kiếm, lọc, phân trang, xem chi
    tiết, thêm, sửa, xóa/ẩn, đổi trạng thái, đặt sân, hủy sân, thanh
    toán mô phỏng, đánh giá, yêu thích, thông báo, quản lý Owner và
    Admin.
5.  Vì chưa có backend, tạo một lớp service mock có API gần giống cách
    gọi backend để sau này thay bằng API Spring Boot mà không phải viết
    lại UI.
6.  Giao diện phải responsive, có trạng thái loading, empty, error,
    success, disabled và validation.
7.  Không tạo các trang sơ sài chỉ có tiêu đề và vài nút. Mỗi trang phải
    có nội dung, phân cấp thị giác, hành động chính/phụ và trạng thái dữ
    liệu thực tế.
8.  Không tự tạo Collection hoặc thuộc tính mới làm sai schema. Nếu UI
    cần dữ liệu trình bày bổ sung, hãy suy ra từ dữ liệu liên quan hoặc
    dùng view-model ở tầng frontend, không ghi ngược thuộc tính giả vào
    mock database.
9.  Không dùng dữ liệu thật, thông tin cá nhân thật, mật khẩu thật hoặc
    thông tin kết nối thật trong mock.
10. Không để nút bấm vô tác dụng. Nếu chức năng chỉ mô phỏng, phải thực
    hiện được trong mock và ghi rõ đây là thao tác demo.

## 1.3. Quy trình làm việc của Agent

Thực hiện theo thứ tự:

1.  Kiểm tra repository, framework, package, routing và CSS hiện có.
2.  Đọc tài liệu database, lập bảng ánh xạ 17 Collections.
3.  Tạo design tokens và hệ thống component dùng chung.
4.  Tạo mock data và mock services.
5.  Tạo layout theo vai trò.
6.  Tạo các trang public/customer.
7.  Tạo các trang Owner.
8.  Tạo các trang Admin.
9.  Hoàn thiện form, modal, drawer, toast, table, calendar, chart và
    responsive.
10. Chạy build/lint/test nếu dự án có script; sửa lỗi trước khi bàn
    giao.
11. Kiểm tra toàn bộ luồng demo bằng mock từ đầu đến cuối.
12. Cập nhật README hướng dẫn chạy frontend và tài khoản demo.

Không dừng ở bước dựng giao diện tĩnh.

------------------------------------------------------------------------

# 2. Định hướng sản phẩm và trải nghiệm

## 2.1. Sản phẩm

**SportBooking** là nền tảng tìm kiếm, quản lý và đặt sân thể thao trực
tuyến, hỗ trợ:

-   Bóng đá.
-   Cầu lông.
-   Tennis.
-   Pickleball.

Ba khu vực sử dụng chính:

-   **Khách truy cập/Customer:** tìm sân, xem lịch trống, đặt sân, thanh
    toán mô phỏng, đánh giá.
-   **Owner:** quản lý cơ sở, sân, giá, lịch, booking, khuyến mãi và
    doanh thu.
-   **Admin:** quản lý người dùng, duyệt Owner/cơ sở, kiểm soát booking,
    thanh toán, khiếu nại và thống kê.

## 2.2. Tính cách thiết kế

-   Hiện đại, sáng sủa, năng động, thể thao nhưng không quá sặc sỡ.
-   Ưu tiên nền sáng, khoảng trắng hợp lý, card gọn, hình ảnh sân thể
    thao chất lượng.
-   Tạo cảm giác đáng tin cậy, dễ đặt sân và dễ quản lý.
-   Không sử dụng gradient đậm trên diện rộng, không dùng quá nhiều màu
    nhấn.
-   Không lạm dụng glassmorphism, hiệu ứng phát sáng, đổ bóng nặng hoặc
    animation gây rối.
-   Tránh giao diện giống dashboard admin mặc định hoặc các trang CRUD
    thô sơ.

------------------------------------------------------------------------

# 3. Design system -- Quy chuẩn giao diện toàn website

## 3.1. Màu sắc

Dùng các token sau làm chuẩn. Có thể tinh chỉnh nhẹ để bảo đảm tương
phản, nhưng phải duy trì nhất quán toàn hệ thống.

  Token              Mã màu      Cách sử dụng
  ------------------ ----------- ------------------------------
  `primary-900`      `#123B32`   Chữ/nhấn đậm, hover
  `primary-800`      `#185044`   Sidebar active, button hover
  `primary-700`      `#216B59`   Màu thương hiệu chính
  `primary-600`      `#2D8A70`   Button chính, link chính
  `primary-100`      `#E5F4EE`   Nền nhấn nhẹ
  `primary-50`       `#F3FAF6`   Nền khu vực xanh nhạt
  `accent-500`       `#F2A93B`   CTA phụ, điểm nhấn thể thao
  `accent-100`       `#FFF3D9`   Nền nhấn vàng nhạt
  `background`       `#F7F9F8`   Nền tổng thể
  `surface`          `#FFFFFF`   Card, modal, panel
  `text-primary`     `#172B25`   Tiêu đề và nội dung chính
  `text-secondary`   `#66756F`   Nội dung phụ
  `text-muted`       `#8B9691`   Placeholder, metadata
  `border`           `#E5EBE7`   Border mặc định
  `success`          `#21865B`   Thành công
  `success-bg`       `#E8F6EE`   Nền trạng thái thành công
  `warning`          `#C78319`   Cảnh báo
  `warning-bg`       `#FFF5DF`   Nền cảnh báo
  `danger`           `#D64B4B`   Lỗi, xóa, từ chối
  `danger-bg`        `#FDECEC`   Nền lỗi
  `info`             `#3478B8`   Thông tin
  `info-bg`          `#EAF3FC`   Nền thông tin

Quy tắc màu:

-   Một màn hình chỉ có một hành động primary nổi bật.
-   CTA chính dùng `primary-600`; CTA phụ dùng nền trắng và border.
-   Màu đỏ chỉ dùng cho hành động nguy hiểm hoặc trạng thái lỗi.
-   Màu vàng dùng để nhấn vừa phải, không dùng làm nền chính của trang.
-   Status badge phải có màu và chữ, không chỉ biểu thị bằng màu.

## 3.2. Typography

Font ưu tiên:

1.  `Be Vietnam Pro` cho toàn bộ giao diện tiếng Việt.
2.  Fallback: `Inter`, `Arial`, `sans-serif`.

Khai báo font bằng Google Fonts hoặc file font local nếu dự án có sẵn.
Nếu tải từ bên ngoài không thành công, giao diện vẫn phải đọc tốt nhờ
fallback.

  Thành phần         Desktop     Mobile     Weight
  --------------- ---------- ---------- ----------
  H1 trang/hero     36--44px   28--32px        700
  H2 section        26--30px   22--24px        700
  H3/card title     18--22px   17--20px        600
  Body chính        15--16px   14--16px        400
  Body phụ          13--14px   13--14px        400
  Label             13--14px       13px   500--600
  Button            14--15px       14px        600
  Caption               12px       12px        400

Quy tắc:

-   Body text không nhỏ hơn 14px nếu là nội dung quan trọng.
-   Không dùng quá 3 cấp heading trong một khu vực.
-   Line-height body từ 1.5 đến 1.65.
-   Không dùng ALL CAPS cho tiêu đề dài.
-   Giá tiền, mã booking và số liệu nên dùng font có số dễ đọc; giữ định
    dạng thống nhất.

## 3.3. Kích thước, spacing và layout

Dùng hệ spacing cơ sở 4px:

`4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80`.

  Thành phần                 Kích thước đề xuất
  -------------------------- ------------------------
  Container desktop          max-width 1200--1280px
  Container rộng dashboard   max-width 1440px
  Padding trang desktop      32px
  Padding trang tablet       24px
  Padding trang mobile       16px
  Header public              cao 72px
  Header dashboard           cao 64--72px
  Sidebar desktop            rộng 248px
  Sidebar thu gọn            76px
  Button lớn                 cao 48px
  Button thường              cao 40px
  Input                      cao 44--48px
  Search input lớn           cao 52--56px
  Card radius                14--18px
  Input radius               10px
  Button radius              10--12px
  Modal radius               18px
  Card padding               20--24px
  Table row                  tối thiểu 56px
  Icon button                40px × 40px

Quy tắc:

-   Căn theo grid 12 cột trên desktop khi cần.
-   Nội dung chính không kéo dài toàn màn hình nếu gây khó đọc.
-   Dùng khoảng trắng để phân nhóm, không dùng quá nhiều đường kẻ.
-   Các card cùng loại phải có chiều cao và cách căn nội dung nhất quán.
-   Không đặt quá nhiều card nhỏ cạnh nhau khiến dashboard bị vụn.

## 3.4. Responsive breakpoints

  -----------------------------------------------------------------------
  Tên                     Kích thước              Quy tắc
  ----------------------- ----------------------- -----------------------
  Mobile nhỏ              dưới 375px              Một cột, giảm padding,
                                                  không tràn ngang

  Mobile                  375--767px              Một cột, menu drawer,
                                                  form xếp dọc

  Tablet                  768--1023px             Hai cột nếu phù hợp,
                                                  sidebar dạng drawer

  Desktop                 1024--1439px            Layout tiêu chuẩn

  Wide desktop            từ 1440px               Giới hạn max-width,
                                                  không kéo nội dung quá
                                                  rộng
  -----------------------------------------------------------------------

Yêu cầu responsive:

-   Không có horizontal overflow ở chiều rộng 320px trở lên.
-   Header mobile có logo, nút menu, tài khoản/đăng nhập.
-   Bảng dữ liệu chuyển thành card/list hoặc có vùng cuộn ngang có kiểm
    soát trên mobile.
-   Sidebar dashboard chuyển thành drawer trên tablet/mobile.
-   Bộ lọc tìm kiếm chuyển thành bottom sheet hoặc drawer trên mobile.
-   Modal lớn trên desktop chuyển thành full-screen sheet trên mobile.
-   Calendar và time slot phải dùng được bằng cảm ứng.
-   Không ẩn chức năng quan trọng chỉ vì màn hình nhỏ.

## 3.5. Border, shadow, radius và animation

-   Border mặc định 1px `#E5EBE7`.
-   Shadow card: nhẹ, ví dụ `0 4px 18px rgba(20, 50, 40, 0.05)`.
-   Shadow popover/modal rõ hơn nhưng không quá đậm.
-   Radius theo token, không tùy tiện mỗi component một kiểu.
-   Transition 150--220ms cho hover/focus.
-   Animation chỉ hỗ trợ phản hồi: dropdown, modal, skeleton, hover
    card.
-   Tôn trọng `prefers-reduced-motion`.
-   Không dùng animation liên tục gây mất tập trung.

## 3.6. Icon

-   Dùng **Lucide React** thống nhất.
-   Không trộn icon emoji với icon hệ thống.
-   Icon điều hướng thường 18--20px.
-   Icon trong button 16--18px.
-   Icon trang trí lớn 24--32px.
-   Icon-only button bắt buộc có tooltip hoặc accessible label.
-   Dùng cùng một icon cho cùng một hành động trên toàn website.
-   Không tự vẽ SVG khác phong cách nếu Lucide đã có icon phù hợp.

## 3.7. Logo và thương hiệu

-   Tạo logo SportBooking dạng vector/SVG hoặc component React.
-   Ý tưởng: biểu tượng sân/đường sân kết hợp chuyển động thể thao;
    wordmark `SportBooking`.
-   Màu logo chính `primary-700`, điểm nhấn `accent-500`.
-   Logo ngang dùng ở header; logo rút gọn dùng sidebar mobile.
-   Không dùng emoji làm logo.
-   Không dùng logo hoặc nhãn hiệu của bên thứ ba.

## 3.8. Ảnh và nội dung hình ảnh

-   Ưu tiên ảnh thật, rõ nét về sân bóng đá, cầu lông, tennis,
    pickleball.
-   Ảnh card sân/cơ sở: tỷ lệ 16:9 hoặc 4:3, `object-fit: cover`.
-   Avatar: tỷ lệ 1:1, bo tròn.
-   Ảnh hero: rộng, ít chi tiết rối, có vùng trống để đặt chữ.
-   Gallery: thumbnail đồng nhất, click mở lightbox.
-   Có placeholder/skeleton khi ảnh tải lỗi.
-   Không để ảnh vỡ, ảnh sai loại sân hoặc ảnh kéo méo.
-   Mock image dùng URL ổn định hoặc asset local trong `public/images/`;
    có fallback local.
-   Không phụ thuộc hoàn toàn vào URL ảnh bên ngoài để demo.

------------------------------------------------------------------------

# 4. Quy chuẩn bố cục theo loại trang

## 4.1. Public website layout

-   Header cố định hoặc sticky, nền trắng, border dưới nhẹ.
-   Logo bên trái.
-   Menu chính ở giữa/trái: Trang chủ, Tìm sân, Loại sân, Giới thiệu.
-   Khu vực phải: nút yêu thích/thông báo khi đăng nhập, avatar menu
    hoặc Đăng nhập/Đăng ký.
-   Nội dung nằm trong container max-width 1280px.
-   Footer có logo, mô tả ngắn, liên kết, hỗ trợ và thông tin liên hệ
    giả lập.
-   Mobile: header gọn, menu dạng drawer.

## 4.2. Customer layout

Có thể dùng public header nhưng bổ sung:

-   Avatar và menu tài khoản.
-   Badge số thông báo chưa đọc.
-   Trang tài khoản có sidebar/tab điều hướng.
-   Trên mobile, sidebar chuyển thành tab selector hoặc menu dropdown.

## 4.3. Owner dashboard layout

-   Sidebar trái 248px, có logo, menu nhóm, trạng thái active.
-   Header trên cùng có breadcrumb, tìm kiếm tùy chọn, thông báo,
    avatar.
-   Main content nền `#F7F9F8`.
-   Dashboard dùng card thống kê, chart, bảng booking gần đây và lịch.
-   Sidebar có thể thu gọn.
-   Mobile/tablet: sidebar thành drawer; header có nút mở menu.
-   Menu nhóm:
    -   Tổng quan
    -   Cơ sở của tôi
    -   Quản lý sân
    -   Lịch hoạt động
    -   Giá sân
    -   Đơn đặt sân
    -   Lịch sân
    -   Khuyến mãi
    -   Đánh giá
    -   Khiếu nại
    -   Doanh thu
    -   Hồ sơ Owner

## 4.4. Admin dashboard layout

-   Bố cục tương tự Owner nhưng nhận diện rõ khu vực quản trị.
-   Sidebar có nhóm menu:
    -   Tổng quan
    -   Người dùng
    -   Hồ sơ Owner
    -   Cơ sở thể thao
    -   Danh mục thể thao
    -   Sân thể thao
    -   Đơn đặt sân
    -   Thanh toán
    -   Khuyến mãi
    -   Đánh giá
    -   Khiếu nại
    -   Nhật ký hệ thống (nếu triển khai)
-   Có bộ lọc, phân trang, trạng thái, thao tác hàng loạt ở những màn
    hình phù hợp.
-   Các hành động khóa tài khoản, từ chối hồ sơ, xóa dữ liệu phải có
    confirm dialog.

------------------------------------------------------------------------

# 5. Danh sách đầy đủ các giao diện phải triển khai

Agent phải tạo đủ route/page/component dưới đây. Có thể gộp các trang
cùng mẫu thành một component tái sử dụng, nhưng không được bỏ chức năng
hoặc trạng thái.

## 5.1. Public -- Khách chưa đăng nhập

  -------------------------------------------------------------------------
  Mã                Route đề xuất       Giao diện         Thành phần/chi
                                                          tiết bắt buộc
  ----------------- ------------------- ----------------- -----------------
  PUB-01            `/`                 Trang chủ         Hero, search sân,
                                                          danh mục thể
                                                          thao, sân nổi
                                                          bật, cơ sở nổi
                                                          bật, cách hoạt
                                                          động, CTA Owner,
                                                          footer

  PUB-02            `/courts` hoặc      Tìm kiếm sân      Search bar, ngày,
                    `/search`                             giờ, môn thể
                                                          thao, địa điểm,
                                                          bộ lọc, sort, kết
                                                          quả, pagination

  PUB-03            `/facilities`       Danh sách cơ sở   Card cơ sở, bộ
                                                          lọc địa điểm,
                                                          đánh giá, tiện
                                                          ích, sort

  PUB-04            `/facilities/:id`   Chi tiết cơ sở    Gallery, địa chỉ,
                                                          bản đồ minh họa,
                                                          tiện ích, giờ mở
                                                          cửa, danh sách
                                                          sân, rating,
                                                          review

  PUB-05            `/courts/:id`       Chi tiết sân      Gallery, thông
                                                          tin sân, loại
                                                          sân, thuộc tính,
                                                          giá, lịch trống,
                                                          chọn slot, review

  PUB-06            `/sports/:code`     Trang theo môn    Hero nhỏ, mô tả
                                        thể thao          môn, bộ lọc, danh
                                                          sách sân phù hợp

  PUB-07            `/promotions`       Khuyến mãi        Banner, danh sách
                                                          mã, điều kiện,
                                                          thời gian hiệu
                                                          lực

  PUB-08            `/about`            Giới thiệu        Sứ mệnh, cách
                                                          hoạt động, lợi
                                                          ích khách
                                                          hàng/Owner

  PUB-09            `/contact`          Liên hệ           Thông tin liên hệ
                                                          mock, form liên
                                                          hệ demo,
                                                          validation

  PUB-10            `/faq`              Câu hỏi thường    Accordion theo
                                        gặp               chủ đề

  PUB-11            `/terms`            Điều khoản        Nội dung mẫu có
                                                          cấu trúc

  PUB-12            `/privacy`          Chính sách bảo    Nội dung mẫu có
                                        mật               cấu trúc

  PUB-13            `*`                 404               Minh họa, thông
                                                          báo, nút về trang
                                                          chủ/tìm sân
  -------------------------------------------------------------------------

## 5.2. Authentication -- Xác thực

  --------------------------------------------------------------------------
  Mã                Route                Giao diện         Chi tiết
  ----------------- -------------------- ----------------- -----------------
  AUTH-01           `/login`             Đăng nhập         Email, password,
                                                           hiện/ẩn password,
                                                           remember demo,
                                                           validation

  AUTH-02           `/register`          Đăng ký           Họ tên, email, số
                                                           điện thoại, mật
                                                           khẩu, xác nhận
                                                           mật khẩu, điều
                                                           khoản

  AUTH-03           `/forgot-password`   Quên mật khẩu     Nhập email, thông
                                                           báo gửi link giả
                                                           lập

  AUTH-04           `/reset-password`    Đặt lại mật khẩu  Mật khẩu mới, xác
                                                           nhận, token mock

  AUTH-05           `/verify-email`      Xác thực email    Trạng thái
                                                           chờ/xác thực
                                                           thành công/thất
                                                           bại giả lập

  AUTH-06           ---                  Đăng xuất confirm Xác nhận đăng
                                                           xuất

  AUTH-07           ---                  Session expired   Dialog thông báo
                                                           phiên demo hết
                                                           hạn
  --------------------------------------------------------------------------

## 5.3. Customer -- Khách hàng đăng nhập

  ----------------------------------------------------------------------------------------------------
  Mã                Route                               Giao diện         Chi tiết
  ----------------- ----------------------------------- ----------------- ----------------------------
  CUS-01            `/account`                          Tổng quan tài     Thông tin user, booking sắp
                                                        khoản             tới, booking gần đây,
                                                                          shortcut

  CUS-02            `/account/profile`                  Hồ sơ cá nhân     Avatar, họ tên, email,
                                                                          phone, address, chỉnh sửa

  CUS-03            `/account/change-password`          Đổi mật khẩu      Mật khẩu hiện tại, mới, xác
                                                                          nhận

  CUS-04            `/account/bookings`                 Danh sách booking Tab theo trạng thái, tìm
                                                                          kiếm, lọc ngày, pagination

  CUS-05            `/account/bookings/:id`             Chi tiết booking  Mã booking, cơ sở, sân, giờ,
                                                                          giá, payment, timeline, hành
                                                                          động

  CUS-06            `/account/favorites`                Yêu thích         Tab cơ sở/sân, bỏ yêu thích,
                                                                          mở chi tiết

  CUS-07            `/account/notifications`            Thông báo         Danh sách, unread badge,
                                                                          đánh dấu đã đọc, đánh dấu
                                                                          tất cả

  CUS-08            `/account/reviews`                  Đánh giá của tôi  Danh sách review, trạng
                                                                          thái, chỉnh sửa nếu chính
                                                                          sách cho phép

  CUS-09            `/account/complaints`               Khiếu nại của tôi Danh sách, trạng thái, tìm
                                                                          kiếm

  CUS-10            `/account/complaints/new`           Tạo khiếu nại     Chọn booking/cơ sở, subject,
                                                                          content, ảnh mock

  CUS-11            `/account/complaints/:id`           Chi tiết khiếu    Nội dung, ảnh, phản hồi,
                                                        nại               trạng thái

  CUS-12            `/checkout/:courtId`                Xác nhận đặt sân  Tóm tắt sân, ngày, slot,
                                                                          giá, mã khuyến mãi, thông
                                                                          tin người đặt

  CUS-13            `/payment/:bookingId`               Thanh toán        Chọn
                                                                          CASH/BANK_TRANSFER/ONLINE,
                                                                          hướng dẫn mock, xác nhận
                                                                          demo

  CUS-14            `/payment-result/:bookingId`        Kết quả thanh     Thành công/thất bại/chờ xử
                                                        toán              lý, xem booking

  CUS-15            `/account/reviews/new/:bookingId`   Viết đánh giá     Rating 1--5, nội dung, ảnh
                                                                          demo, chỉ booking COMPLETED

  CUS-16            `/account/owner-application`        Đăng ký Owner     Business name/address,
                                                                          phone, upload giấy tờ mock,
                                                                          trạng thái hồ sơ
  ----------------------------------------------------------------------------------------------------

## 5.4. Owner -- Chủ sân

  ------------------------------------------------------------------------------------------
  Mã                Route                          Giao diện          Chi tiết
  ----------------- ------------------------------ ------------------ ----------------------
  OWN-01            `/owner`                       Dashboard Owner    KPI, booking gần đây,
                                                                      chart doanh thu, sân
                                                                      hoạt động, lịch hôm
                                                                      nay

  OWN-02            `/owner/facilities`            Danh sách cơ sở    Search, filter status,
                                                                      card/table,
                                                                      thêm/sửa/ẩn

  OWN-03            `/owner/facilities/new`        Tạo cơ sở          Tên, mô tả, địa chỉ,
                                                                      tọa độ mock, ảnh, tiện
                                                                      ích

  OWN-04            `/owner/facilities/:id`        Chi tiết cơ sở     Overview, thông tin,
                                                                      sân, giờ chung, ảnh,
                                                                      trạng thái duyệt

  OWN-05            `/owner/facilities/:id/edit`   Sửa cơ sở          Form prefilled,
                                                                      validation, preview
                                                                      ảnh

  OWN-06            `/owner/courts`                Danh sách sân      Chọn cơ sở, filter
                                                                      category/status,
                                                                      search, table/card

  OWN-07            `/owner/courts/new`            Tạo sân            Cơ sở, category, tên,
                                                                      mô tả, attributes linh
                                                                      hoạt, capacity, ảnh

  OWN-08            `/owner/courts/:id`            Chi tiết sân       Gallery, thông tin,
                                                                      giá hiện hành, lịch,
                                                                      trạng thái

  OWN-09            `/owner/courts/:id/edit`       Sửa sân            Form cập nhật, preview

  OWN-10            `/owner/operating-hours`       Lịch hoạt động     Chọn cơ sở/sân, cấu
                                                                      hình 7 ngày, mở/đóng,
                                                                      giờ, slot duration

  OWN-11            `/owner/pricing`               Danh sách quy tắc  Chọn sân, lọc trạng
                                                   giá                thái, ngày áp dụng,
                                                                      giờ áp dụng, priority

  OWN-12            `/owner/pricing/new`           Tạo quy tắc giá    Tên, sân, ngày, giờ,
                                                                      giá/slot, hiệu lực,
                                                                      priority

  OWN-13            `/owner/pricing/:id/edit`      Sửa quy tắc giá    Form prefilled, cảnh
                                                                      báo quy tắc trùng

  OWN-14            `/owner/blocked-slots`         Lịch chặn sân      Calendar, filter sân,
                                                                      danh sách khoảng bị
                                                                      chặn

  OWN-15            ---                            Tạo lịch chặn      Modal/drawer chọn sân,
                                                                      thời gian, lý do

  OWN-16            `/owner/bookings`              Quản lý booking    Table, filter trạng
                                                                      thái/ngày/sân, search
                                                                      bookingCode

  OWN-17            `/owner/bookings/:id`          Chi tiết booking   Khách, sân, slot, giá
                                                                      snapshot, payment,
                                                                      timeline, xác nhận/từ
                                                                      chối

  OWN-18            `/owner/calendar`              Lịch đặt sân       Day/week view, court
                                                                      lanes, slot
                                                                      HOLD/BOOKED/blocked,
                                                                      điều hướng ngày

  OWN-19            `/owner/promotions`            Danh sách khuyến   Search, status, thời
                                                   mãi                gian, usage count

  OWN-20            `/owner/promotions/new`        Tạo khuyến mãi     Code, name, discount
                                                                      type/value, min/max,
                                                                      usage limit, date

  OWN-21            `/owner/promotions/:id/edit`   Sửa khuyến mãi     Form prefilled,
                                                                      validation

  OWN-22            `/owner/reviews`               Quản lý đánh giá   Rating filter, review
                                                                      list, phản hồi

  OWN-23            `/owner/complaints`            Khiếu nại cơ sở    Danh sách, trạng thái,
                                                                      lọc

  OWN-24            `/owner/complaints/:id`        Chi tiết khiếu nại Nội dung, booking,
                                                                      ảnh, phản hồi

  OWN-25            `/owner/revenue`               Doanh thu          KPI, biểu đồ theo thời
                                                                      gian, lọc cơ sở/sân,
                                                                      bảng giao dịch

  OWN-26            `/owner/profile`               Hồ sơ Owner        Thông tin tài khoản,
                                                                      hồ sơ kinh doanh,
                                                                      trạng thái xét duyệt

  OWN-27            ---                            Empty state Owner  Chưa có cơ
                                                                      sở/sân/booking

  OWN-28            ---                            Owner              Màn hình trạng thái
                                                   pending/rejected   chờ duyệt/từ chối,
                                                                      hướng dẫn xử lý
  ------------------------------------------------------------------------------------------

## 5.5. Admin -- Quản trị hệ thống

  ------------------------------------------------------------------------------------------------
  Mã                Route                             Giao diện         Chi tiết
  ----------------- --------------------------------- ----------------- --------------------------
  ADM-01            `/admin`                          Dashboard Admin   KPI, chart
                                                                        booking/revenue, user
                                                                        growth, pending queue

  ADM-02            `/admin/users`                    Quản lý người     Search, role/status
                                                      dùng              filter, pagination

  ADM-03            `/admin/users/:id`                Chi tiết người    Profile, roles, status,
                                                      dùng              booking liên quan

  ADM-04            ---                               Khóa/mở khóa tài  Confirm modal, lý do
                                                      khoản             

  ADM-05            `/admin/owner-applications`       Hồ sơ Owner       Danh sách chờ duyệt,
                                                                        filter status

  ADM-06            `/admin/owner-applications/:id`   Chi tiết hồ sơ    Thông tin, giấy tờ
                                                      Owner             preview, approve/reject

  ADM-07            `/admin/facilities`               Quản lý cơ sở     Search, status, owner, địa
                                                                        điểm

  ADM-08            `/admin/facilities/:id`           Chi tiết cơ sở    Thông tin, sân, Owner,
                                                                        lịch sử trạng thái

  ADM-09            ---                               Duyệt/từ chối cơ  Confirm modal, lý do từ
                                                      sở                chối

  ADM-10            `/admin/courts`                   Quản lý sân       Search, filter
                                                                        facility/category/status

  ADM-11            `/admin/categories`               Danh mục thể thao CRUD danh mục, icon,
                                                                        status

  ADM-12            `/admin/bookings`                 Quản lý booking   Search bookingCode, filter
                                                                        status/date/payment

  ADM-13            `/admin/bookings/:id`             Chi tiết booking  Customer, Owner, facility,
                                                                        court, slot, payment

  ADM-14            `/admin/payments`                 Quản lý thanh     Transaction list, filter
                                                      toán              method/status/date

  ADM-15            `/admin/payments/:id`             Chi tiết thanh    Amount, method,
                                                      toán              transactionCode, booking

  ADM-16            `/admin/promotions`               Quản lý khuyến    Danh sách, filter, trạng
                                                      mãi               thái

  ADM-17            `/admin/reviews`                  Kiểm duyệt đánh   Search, rating, status,
                                                      giá               ẩn/hiện

  ADM-18            `/admin/complaints`               Quản lý khiếu nại Queue, priority
                                                                        presentation, status

  ADM-19            `/admin/complaints/:id`           Chi tiết khiếu    Nội dung, ảnh, booking,
                                                      nại               phản hồi, xử lý

  ADM-20            `/admin/reports`                  Báo cáo hệ thống  Booking, revenue, users,
                                                                        facilities, categories

  ADM-21            `/admin/settings`                 Cài đặt hiển thị  Cấu hình demo UI, không
                                                                        giả lập cấu hình backend
                                                                        chưa có

  ADM-22            ---                               Empty/error state Không có dữ liệu, lỗi tải
                                                      Admin             dữ liệu
  ------------------------------------------------------------------------------------------------

## 5.6. Shared overlays và giao diện nhỏ bắt buộc

Đây là các thành phần/giao diện nhỏ không nhất thiết có route riêng
nhưng phải thiết kế đầy đủ:

-   Login modal nếu sản phẩm dùng modal.
-   Account dropdown.
-   Public mobile navigation drawer.
-   Owner/Admin sidebar drawer.
-   Notification popover.
-   Search suggestions dropdown.
-   Filter drawer/bottom sheet.
-   Date picker/calendar.
-   Time-slot picker.
-   Price breakdown popover.
-   Promotion code input và kết quả hợp lệ/không hợp lệ.
-   Confirm booking modal.
-   Cancel booking modal, nhập lý do nếu cần.
-   Reject booking modal.
-   Approve/reject Owner application modal.
-   Approve/reject Facility modal.
-   Ban/unban user modal.
-   Delete/deactivate confirmation modal.
-   Add/edit facility modal nếu dùng modal thay route.
-   Add/edit court modal.
-   Add/edit price rule modal.
-   Add blocked slot modal.
-   Add/edit promotion modal.
-   Review form modal hoặc page.
-   Complaint response form.
-   Image uploader, preview, remove image.
-   Image gallery lightbox.
-   Avatar menu.
-   Toast success/error/warning/info.
-   Tooltip.
-   Popover.
-   Tabs.
-   Accordion.
-   Pagination.
-   Table column visibility nếu cần.
-   Table row action menu.
-   Skeleton cho card, table, chart, detail.
-   Empty state cho mọi danh sách.
-   Error state và retry.
-   Network/mock loading indicator.
-   Form field error, helper text, required indicator.
-   Password visibility toggle.
-   Copy booking code / transaction code.
-   Status badge.
-   Breadcrumb.
-   Mobile bottom action bar cho checkout/detail khi phù hợp.
-   Scroll-to-top nếu trang dài.
-   403 Unauthorized.
-   404 Not Found.
-   500/Unexpected error.

------------------------------------------------------------------------

# 6. Hướng dẫn bố cục chi tiết cho các trang quan trọng

## 6.1. Trang chủ

Bố cục từ trên xuống:

1.  Header.
2.  Hero section nền ảnh thể thao rộng, overlay vừa đủ, H1 rõ ràng, mô
    tả ngắn.
3.  Search panel nổi hoặc đặt trong hero:
    -   Địa điểm.
    -   Môn thể thao.
    -   Ngày.
    -   Giờ bắt đầu.
    -   Nút Tìm sân.
4.  Danh mục môn thể thao dạng card/icon.
5.  Sân nổi bật dạng card ảnh.
6.  Cơ sở được đánh giá tốt.
7.  Khối "Đặt sân trong 3 bước".
8.  CTA dành cho chủ sân.
9.  Đánh giá/nhận xét mock.
10. Footer.

Không đặt quá nhiều chữ lên hero. Search phải là thành phần nổi bật
nhất.

## 6.2. Trang tìm kiếm

Desktop: - Thanh tìm kiếm ngang phía trên kết quả. - Bộ lọc bên trái
rộng khoảng 260px. - Kết quả bên phải. - Card sân gồm ảnh, tên sân/cơ
sở, địa chỉ, loại thể thao, rating, tiện ích, giá tham khảo, trạng thái
còn sân và nút xem chi tiết. - Sort theo liên quan, giá tăng/giảm, đánh
giá.

Mobile: - Search summary ở trên. - Nút "Bộ lọc" mở bottom sheet. - Card
một cột. - Filter đã chọn hiển thị chip có thể xóa.

Bộ lọc phải hoạt động thật trên mock data, không chỉ là UI trang trí.

## 6.3. Card sân/cơ sở

-   Ảnh chiếm phần lớn phía trên, tỷ lệ 16:9.
-   Badge loại sân hoặc trạng thái ở góc ảnh nhưng không che nội dung.
-   Tên sân/cơ sở rõ ràng.
-   Địa điểm và rating ở dòng phụ.
-   Tiện ích hiển thị tối đa 2--3 chip, phần còn lại ghi "+N".
-   Giá hiển thị rõ ràng, có đơn vị `/giờ` hoặc đơn vị tương ứng.
-   CTA "Xem chi tiết" hoặc "Đặt sân".
-   Hover chỉ nâng nhẹ card và ảnh; không phóng to quá mức.

## 6.4. Chi tiết sân

-   Breadcrumb.
-   Gallery ảnh lớn + thumbnail.
-   Tên sân, cơ sở, địa chỉ, rating.
-   Thông tin loại sân và `attributes`.
-   Giá/khung giờ.
-   Lịch chọn ngày.
-   Slot picker theo thời gian; slot đã đặt, HOLD, bị chặn, còn trống
    phải phân biệt rõ.
-   Panel tóm tắt booking sticky trên desktop nếu phù hợp.
-   Reviews và owner reply.
-   Sân/cơ sở liên quan.

Không cho chọn slot đã BOOKED, HOLD còn hiệu lực hoặc bị blocked.

## 6.5. Checkout và thanh toán

Checkout gồm: - Thông tin sân/cơ sở. - Ngày, giờ, thời lượng. - Thông
tin khách đặt. - Mã khuyến mãi. - Bảng tính giá: giá gốc, giảm giá, tổng
tiền. - Điều khoản/hủy đặt. - CTA xác nhận.

Payment: - Phương thức CASH, BANK_TRANSFER, ONLINE. - Đây là thanh toán
demo, không tích hợp cổng thanh toán thật. - Có trạng thái
pending/success/failed để demo. - Không thu thập dữ liệu thẻ ngân hàng
thật. - Sau khi hoàn tất, cập nhật mock booking/payment và điều hướng
trang kết quả.

## 6.6. Dashboard Owner/Admin

Phần đầu: - Breadcrumb và tiêu đề. - Mô tả ngắn. - Date range/filter. -
CTA chính nếu có.

KPI cards: - Giá trị lớn, nhãn rõ, biến động so kỳ trước nếu mock có dữ
liệu. - Không bịa số liệu không có nguồn; mọi KPI phải tính từ mock
collections liên quan.

Phần giữa: - Chart doanh thu/booking. - Phân bố trạng thái. - Booking
gần đây hoặc queue cần xử lý.

Phần cuối: - Bảng dữ liệu hoặc hoạt động gần đây. - Quick actions.

Không dùng quá 4 KPI cards trên một hàng ở desktop. Mobile xếp 1--2 cột
tùy chiều rộng.

## 6.7. Data table

-   Có tiêu đề, mô tả, bộ lọc và CTA rõ ràng.
-   Header dễ đọc, row height tối thiểu 56px.
-   Không hiển thị quá nhiều cột; dùng detail page/drawer cho thông tin
    dài.
-   Có sort, search, filter, pagination hoạt động.
-   Trạng thái dùng badge.
-   Action menu gồm xem/sửa/ẩn/xóa tùy quyền.
-   Có empty state và loading skeleton.
-   Mobile chuyển thành card list hoặc horizontal scroll có kiểm soát.

## 6.8. Form

-   Chia nhóm thông tin theo section.
-   Label nằm trên input.
-   Required marker rõ ràng.
-   Helper text ngắn.
-   Validation ngay khi blur hoặc submit.
-   Error hiển thị dưới field, không chỉ dùng toast.
-   Nút submit và cancel rõ ràng.
-   Khi submit: disable button và hiển thị loading.
-   Khi thành công: toast + cập nhật UI.
-   Khi sửa: prefill dữ liệu.
-   Khi hủy form có thay đổi: cảnh báo mất dữ liệu.

------------------------------------------------------------------------

# 7. Kiến trúc frontend và quy tắc tách code

## 7.1. Cấu trúc thư mục đề xuất

Điều chỉnh theo repository thực tế, nhưng phải giữ nguyên nguyên tắc
phân lớp:

``` text
frontend/
├── public/
│   ├── images/
│   │   ├── logo/
│   │   ├── hero/
│   │   ├── sports/
│   │   ├── facilities/
│   │   └── placeholders/
│   └── favicon.svg
│
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   ├── router.tsx
│   │   └── providers/
│   │
│   ├── assets/
│   ├── components/
│   │   ├── ui/
│   │   ├── common/
│   │   ├── forms/
│   │   ├── data-display/
│   │   └── feedback/
│   │
│   ├── layouts/
│   │   ├── PublicLayout/
│   │   ├── CustomerLayout/
│   │   ├── OwnerLayout/
│   │   ├── AdminLayout/
│   │   └── AuthLayout/
│   │
│   ├── pages/
│   │   ├── public/
│   │   ├── auth/
│   │   ├── customer/
│   │   ├── owner/
│   │   ├── admin/
│   │   └── errors/
│   │
│   ├── features/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── facilities/
│   │   ├── courts/
│   │   ├── bookings/
│   │   ├── payments/
│   │   ├── reviews/
│   │   ├── favorites/
│   │   ├── promotions/
│   │   ├── notifications/
│   │   └── complaints/
│   │
│   ├── services/
│   │   ├── mock/
│   │   ├── api/
│   │   └── adapters/
│   │
│   ├── hooks/
│   ├── contexts/
│   ├── utils/
│   ├── constants/
│   ├── styles/
│   │   ├── tokens.css
│   │   ├── reset.css
│   │   ├── global.css
│   │   ├── utilities.css
│   │   └── typography.css
│   │
│   └── types/
│
├── mock/
│   ├── data/
│   ├── images/
│   ├── fixtures/
│   ├── factories/
│   ├── services/
│   ├── storage/
│   ├── seed.js
│   ├── reset.js
│   └── README.md
│
├── .env.example
├── package.json
└── README.md
```

Nếu dự án dùng JavaScript, đổi `.tsx/.ts` thành `.jsx/.js`. Không tạo
thêm tầng thư mục rườm rà nếu quy mô file chưa cần.

## 7.2. Phân trách nhiệm

-   `pages/`: ghép component để tạo trang; không chứa toàn bộ nghiệp vụ
    dữ liệu.
-   `components/ui/`: Button, Input, Select, Dialog, Badge, Card,
    Tabs...
-   `components/common/`: Header, Footer, Breadcrumb, PageHeader,
    EmptyState...
-   `layouts/`: bố cục theo vai trò.
-   `features/`: component và logic riêng theo nghiệp vụ.
-   `services/`: giao tiếp dữ liệu; UI không import mock JSON trực tiếp.
-   `hooks/`: hook dùng chung.
-   `contexts/`: auth, theme nếu thực sự cần.
-   `utils/`: format tiền, ngày giờ, validation, mapping.
-   `constants/`: status, route, menu, label.
-   `styles/`: CSS tokens và global reset.
-   `mock/data/`: dữ liệu nguồn theo Collection.
-   `mock/services/`: thao tác CRUD/query trên mock.
-   `mock/storage/`: adapter lưu trạng thái demo.

## 7.3. Quy tắc component

-   Component chỉ làm một nhiệm vụ rõ ràng.
-   Ưu tiên component nhỏ, tái sử dụng, có props rõ ràng.
-   Không tạo một component vài trăm dòng chứa cả page, form, modal và
    business logic.
-   Không lặp markup table/card/form giữa các trang nếu có thể dùng
    component chung.
-   Component dùng chung phải nhận props và không phụ thuộc trực tiếp
    vào route cụ thể.
-   Không tạo component tổng quát quá mức khiến việc sử dụng khó hiểu.
-   Mỗi page cần có loading, error và empty state phù hợp.
-   Không dùng index làm key nếu danh sách có ID ổn định; dùng `_id`
    hoặc ID mock.

## 7.4. Quy tắc CSS và tránh xung đột

Bắt buộc dùng CSS Modules/SCSS Modules hoặc Tailwind có cấu hình rõ
ràng.

Nếu dùng CSS thường:

-   Prefix class theo component/feature, ví dụ `.sb-header`,
    `.sb-court-card`, `.owner-sidebar`.
-   Không viết selector toàn cục kiểu `button {}`, `table {}`,
    `.active {}` để tùy biến trang.
-   Chỉ reset/global style trong `reset.css` và `global.css`.
-   Dùng CSS variables trong `tokens.css`.
-   Tránh `!important`; chỉ dùng khi có lý do kỹ thuật rõ ràng.
-   Không style theo cấu trúc DOM sâu như `.page div section span`.
-   Không để CSS của Owner ảnh hưởng Public/Admin.
-   Không đặt tên class chung chung như `.box`, `.item`, `.title`,
    `.left`, `.right`.
-   Không dùng inline style cho toàn bộ layout; chỉ dùng cho giá trị
    động thực sự cần thiết.
-   Không tạo nhiều định nghĩa token trùng nhau.

Ví dụ:

``` css
/* styles/tokens.css */
:root {
  --sb-primary-700: #216b59;
  --sb-primary-600: #2d8a70;
  --sb-background: #f7f9f8;
  --sb-surface: #ffffff;
  --sb-text-primary: #172b25;
  --sb-text-secondary: #66756f;
  --sb-border: #e5ebe7;

  --sb-radius-sm: 8px;
  --sb-radius-md: 12px;
  --sb-radius-lg: 16px;

  --sb-space-1: 4px;
  --sb-space-2: 8px;
  --sb-space-3: 12px;
  --sb-space-4: 16px;
  --sb-space-6: 24px;
  --sb-space-8: 32px;
}
```

## 7.5. Quy tắc layout dùng chung

Tạo tối thiểu:

-   `PublicLayout`
-   `CustomerLayout`
-   `OwnerLayout`
-   `AdminLayout`
-   `AuthLayout`

Không copy/paste header, sidebar, footer ở từng trang.

Header, sidebar và menu phải được định nghĩa tập trung trong config
tương ứng. Active menu phải tự nhận diện theo route hiện tại.

## 7.6. Routing và quyền truy cập

-   Dùng React Router.
-   Có route guard cho CUSTOMER, OWNER, ADMIN.
-   Guest không truy cập trang cần đăng nhập.
-   Customer không được vào Owner/Admin.
-   Owner chưa được duyệt không được truy cập chức năng quản lý cơ
    sở/sân.
-   Admin có quyền quản trị theo mock role.
-   Nếu không có quyền: hiển thị 403 hoặc redirect phù hợp.
-   Không chỉ ẩn menu; phải kiểm tra quyền ở route/page action.
-   Đây là kiểm soát phía frontend phục vụ demo, không thay thế bảo mật
    backend.

------------------------------------------------------------------------

# 8. Mock database -- Bắt buộc tạo thư mục `frontend/mock/`

## 8.1. Mục tiêu

Backend chưa có, do đó frontend phải có mock database để chạy độc lập.

Mock phải:

-   Phản ánh đúng 17 Collections trong tài liệu database.
-   Đúng tên thuộc tính, kiểu dữ liệu, enum và quan hệ ObjectId.
-   Có đủ dữ liệu để mọi trang đều hiển thị phong phú.
-   Có dữ liệu nhiều trạng thái để test filter và dashboard.
-   Có thể CRUD và cập nhật quan hệ trong phạm vi demo.
-   Có thể reset về dữ liệu ban đầu.
-   Không viết mock data trực tiếp trong JSX/TSX component.

## 8.2. Cấu trúc thư mục mock bắt buộc

``` text
frontend/mock/
├── data/
│   ├── users.js
│   ├── ownerApplications.js
│   ├── sportsCategories.js
│   ├── facilities.js
│   ├── courts.js
│   ├── operatingHours.js
│   ├── priceRules.js
│   ├── blockedSlots.js
│   ├── bookings.js
│   ├── bookingSlots.js
│   ├── payments.js
│   ├── reviews.js
│   ├── favorites.js
│   ├── promotions.js
│   ├── promotionUsages.js
│   ├── notifications.js
│   └── complaints.js
│
├── fixtures/
│   ├── images.js
│   ├── ids.js
│   └── demoAccounts.js
│
├── factories/
│   └── createMockData.js
│
├── services/
│   ├── userMockService.js
│   ├── facilityMockService.js
│   ├── courtMockService.js
│   ├── bookingMockService.js
│   ├── paymentMockService.js
│   ├── reviewMockService.js
│   ├── promotionMockService.js
│   ├── notificationMockService.js
│   └── complaintMockService.js
│
├── storage/
│   ├── mockStorage.js
│   └── mockRepository.js
│
├── seed.js
├── reset.js
└── README.md
```

Có thể gộp service theo feature nếu hợp lý, nhưng **17 file dữ liệu theo
Collection phải có** để dễ đối chiếu database.

## 8.3. Quy tắc dữ liệu mock

### A. ID và quan hệ

-   Mỗi document có `_id` dạng chuỗi ObjectId 24 ký tự hex trong mock.
-   Mọi trường tham chiếu phải trỏ tới `_id` có thật trong Collection
    liên quan.
-   Không tạo ID ngẫu nhiên mỗi lần render.
-   Dùng bộ ID cố định trong fixtures để test ổn định.
-   Dữ liệu mock phải có thể serialize JSON.
-   Ngày giờ dùng ISO string trong file JSON/JS, chuyển đổi khi xử lý.

Ví dụ:

``` js
export const users = [
  {
    _id: "690000000000000000000001",
    fullName: "Nguyễn Minh Anh",
    email: "customer@sportbooking.demo",
    password: "$2a$10$MOCK_HASH_ONLY",
    phone: "0900000001",
    avatar: "/images/avatars/customer-01.webp",
    address: {
      province: "Đà Nẵng",
      district: "Hải Châu",
      ward: "Hòa Cường",
      detail: "Địa chỉ demo"
    },
    roles: ["CUSTOMER"],
    ownerStatus: "NOT_REGISTERED",
    status: "ACTIVE",
    isEmailVerified: true,
    createdAt: "2026-01-10T08:00:00.000Z",
    updatedAt: "2026-01-10T08:00:00.000Z"
  }
];
```

`password` trong mock chỉ là giá trị giả để khớp schema; đăng nhập demo
nên so sánh tài khoản demo theo cấu hình riêng, không dùng chuỗi hash
giả như một hash BCrypt thực.

### B. Quy mô dữ liệu tối thiểu

Tạo đủ dữ liệu để mọi giao diện có nội dung và có thể lọc:

  ----------------------------------------------------------------------------
  Collection               Số document mock tối thiểu Yêu cầu dữ liệu
  ---------------------- ---------------------------- ------------------------
  `users`                                          12 Customer, Owner, Admin;
                                                      active/inactive/banned

  `owner_applications`                              5 PENDING, APPROVED,
                                                      REJECTED

  `sports_categories`                               4 Football, Badminton,
                                                      Tennis, Pickleball

  `facilities`                                      8 Nhiều Owner, địa điểm,
                                                      status

  `courts`                                         20 Đủ 4 môn, nhiều cơ sở và
                                                      trạng thái

  `operating_hours`                               140 Có lịch 7 ngày cho các
                                                      sân

  `price_rules`                                    30 Ngày thường, cuối tuần,
                                                      giờ cao điểm

  `blocked_slots`                                  10 Bảo trì/chặn lịch

  `bookings`                                       30 Đủ trạng thái booking và
                                                      payment

  `booking_slots`                          40 trở lên HOLD, BOOKED; tham chiếu
                                                      booking hợp lệ

  `payments`                                       35 PENDING, PAID, FAILED,
                                                      REFUNDED

  `reviews`                                        12 Rating 1--5, có/không
                                                      ownerReply

  `favorites`                                      15 Favorite facility và
                                                      court

  `promotions`                                      8 Active, inactive,
                                                      expired

  `promotion_usages`                               10 Liên kết promotion,
                                                      user, booking

  `notifications`                                  25 Read/unread, nhiều type

  `complaints`                                      6 PENDING, PROCESSING,
                                                      RESOLVED, REJECTED
  ----------------------------------------------------------------------------

Đây là số lượng tối thiểu khuyến nghị, có thể tăng khi cần demo nhưng
không tạo dữ liệu vô nghĩa.

### C. Đúng schema database

Mock phải tuân thủ chính xác các trường trong tài liệu database:

-   `users`: `_id`, `fullName`, `email`, `password`, `phone`, `avatar`,
    `address`, `roles`, `ownerStatus`, `status`, `isEmailVerified`,
    `createdAt`, `updatedAt`.
-   `owner_applications`: `_id`, `userId`, `businessName`,
    `businessAddress`, `contactPhone`, `documents`, `status`,
    `reviewedBy`, `reviewedAt`, `rejectionReason`, `createdAt`,
    `updatedAt`.
-   `sports_categories`: `_id`, `name`, `code`, `description`, `icon`,
    `status`, `createdAt`, `updatedAt`.
-   `facilities`: `_id`, `ownerId`, `name`, `description`, `address`,
    `location`, `images`, `amenities`, `openingHours`, `status`,
    `createdAt`, `updatedAt`.
-   `courts`: `_id`, `facilityId`, `categoryId`, `name`, `description`,
    `attributes`, `images`, `capacity`, `status`, `createdAt`,
    `updatedAt`.
-   `operating_hours`: `_id`, `courtId`, `dayOfWeek`, `isOpen`,
    `openTime`, `closeTime`, `slotDuration`, `createdAt`, `updatedAt`.
-   `price_rules`: `_id`, `courtId`, `name`, `daysOfWeek`, `startTime`,
    `endTime`, `pricePerSlot`, `validFrom`, `validTo`, `priority`,
    `status`, `createdAt`, `updatedAt`.
-   `blocked_slots`: `_id`, `courtId`, `startAt`, `endAt`, `reason`,
    `createdBy`, `createdAt`.
-   `bookings`: `_id`, `bookingCode`, `customerId`, `facilityId`,
    `courtId`, `bookingDate`, `startAt`, `endAt`, `duration`,
    `priceDetails`, `promotionId`, `status`, `paymentStatus`, `note`,
    `createdAt`, `updatedAt`.
-   `booking_slots`: `_id`, `courtId`, `bookingId`, `slotDate`,
    `startAt`, `endAt`, `status`, `expiresAt`, `createdAt`.
-   `payments`: `_id`, `bookingId`, `customerId`, `amount`, `method`,
    `transactionCode`, `status`, `paidAt`, `refundedAt`, `createdAt`,
    `updatedAt`.
-   `reviews`: `_id`, `bookingId`, `customerId`, `facilityId`,
    `courtId`, `rating`, `content`, `images`, `ownerReply`, `status`,
    `createdAt`, `updatedAt`.
-   `favorites`: `_id`, `userId`, `targetType`, `targetId`, `createdAt`.
-   `promotions`: `_id`, `facilityId`, `ownerId`, `code`, `name`,
    `discountType`, `discountValue`, `minOrderAmount`, `maxDiscount`,
    `usageLimit`, `usedCount`, `startDate`, `endDate`, `status`,
    `createdAt`, `updatedAt`.
-   `promotion_usages`: `_id`, `promotionId`, `userId`, `bookingId`,
    `discountAmount`, `usedAt`.
-   `notifications`: `_id`, `userId`, `title`, `message`, `type`,
    `referenceId`, `isRead`, `createdAt`.
-   `complaints`: `_id`, `userId`, `bookingId`, `facilityId`, `subject`,
    `content`, `images`, `response`, `status`, `createdAt`, `updatedAt`.

Không thêm trường cấp cao nhất không có trong schema. Trường con trong
`Object`/`Array<Object>` phải theo tài liệu database.

### D. Dữ liệu có tính liên kết

Ví dụ:

-   Mỗi `facilities.ownerId` phải tồn tại trong `users`.
-   Mỗi `courts.facilityId` phải tồn tại trong `facilities`.
-   Mỗi `courts.categoryId` phải tồn tại trong `sports_categories`.
-   `operating_hours.courtId`, `price_rules.courtId`,
    `blocked_slots.courtId` phải tồn tại trong `courts`.
-   `bookings.customerId`, `facilityId`, `courtId` phải tồn tại.
-   `booking_slots.bookingId` phải tồn tại trong `bookings`.
-   `payments.bookingId` phải tồn tại trong `bookings`.
-   `reviews.bookingId` phải tồn tại và booking có status `COMPLETED`.
-   `promotion_usages` phải trỏ đến promotion, user, booking có thật.
-   `favorites.targetId` phải trỏ đúng Collection theo `targetType`.
-   `notifications.userId` phải tồn tại.
-   `complaints.userId` phải tồn tại; booking/facility có thể null theo
    schema.

### E. Dữ liệu phong phú và thực tế

-   Dùng tên, địa điểm, mô tả tiếng Việt tự nhiên.
-   Phân bổ facility ở nhiều quận của Đà Nẵng trong dữ liệu demo.
-   Có đủ 4 loại sân.
-   Giá hợp lý, thống nhất VND.
-   Có nhiều ngày đặt khác nhau: quá khứ, hôm nay, tương lai.
-   Có booking ở tất cả trạng thái.
-   Có các khung giờ còn trống, đã đặt, HOLD và blocked.
-   Có review nhiều mức sao.
-   Có promotion phần trăm và giảm tiền cố định.
-   Có complaint đang xử lý và đã giải quyết.
-   Dữ liệu phải đủ để biểu đồ theo ngày/tháng có nhiều điểm.
-   Không dùng toàn bộ cùng một tên, cùng một giá hoặc cùng một trạng
    thái.

------------------------------------------------------------------------

# 9. Mock service và cơ chế demo không cần backend

## 9.1. Nguyên tắc kiến trúc

UI không được import trực tiếp `mock/data/*.js`.

Luồng dữ liệu:

``` text
Page / Component
      |
      v
Feature Hook
      |
      v
Service Interface
      |
      +------ Mock Service (hiện tại)
      |
      +------ REST API Service (sau này)
      |
      v
Mock Data / Spring Boot API
```

Ví dụ API service:

``` js
export const bookingService = {
  getAll: async (filters) => {},
  getById: async (id) => {},
  create: async (payload) => {},
  updateStatus: async (id, status) => {},
  cancel: async (id, reason) => {}
};
```

Mock service phải có cùng chữ ký logic với API service dự kiến. Khi có
backend, chỉ thay implementation, không sửa component.

## 9.2. CRUD demo

Các nghiệp vụ mock tối thiểu:

  -----------------------------------------------------------------------
  Nghiệp vụ                           Hành động phải demo được
  ----------------------------------- -----------------------------------
  Users                               Xem, tìm, lọc, sửa thông tin demo,
                                      khóa/mở khóa

  Owner applications                  Xem hồ sơ, approve, reject, ghi lý
                                      do

  Categories                          Thêm, sửa, bật/tắt

  Facilities                          Tạo, sửa, xem, đổi trạng thái demo

  Courts                              Tạo, sửa, xem, đổi trạng thái

  Operating hours                     Xem và cập nhật lịch 7 ngày

  Price rules                         Tạo, sửa, bật/tắt, kiểm tra rule
                                      trùng

  Blocked slots                       Tạo, xem, gỡ lịch chặn

  Bookings                            Tạo, xem, xác nhận, từ chối, hủy,
                                      hoàn tất demo

  Booking slots                       Giữ slot, xác nhận slot, giải phóng
                                      slot

  Payments                            Tạo giao dịch demo, chuyển trạng
                                      thái thành công/thất bại/hoàn tiền

  Reviews                             Tạo review, Owner reply, Admin
                                      ẩn/hiện

  Favorites                           Thêm/bỏ yêu thích facility/court

  Promotions                          Tạo, sửa, bật/tắt, kiểm tra hiệu
                                      lực

  Promotion usages                    Ghi lịch sử khi áp dụng mã

  Notifications                       Tạo, đọc, đánh dấu tất cả đã đọc

  Complaints                          Tạo, xử lý, phản hồi, đổi trạng
                                      thái
  -----------------------------------------------------------------------

## 9.3. Persistence

-   Có thể dùng `localStorage` để lưu thay đổi demo qua reload.
-   Dữ liệu gốc phải nằm trong `mock/data/`.
-   Khi khởi tạo, nạp seed vào mock storage nếu chưa có.
-   Có chức năng "Reset dữ liệu demo" trong khu vực dev hoặc README.
-   Không dùng `localStorage` làm nơi lưu mật khẩu thật hoặc thông tin
    nhạy cảm.
-   Tạo repository/adapter để sau này đổi sang backend.
-   Mọi thao tác CRUD phải cập nhật đồng bộ các Collection liên quan
    trong mock.

## 9.4. Các luồng demo end-to-end bắt buộc

### Flow A -- Khách đặt sân

1.  Mở trang chủ.
2.  Chọn môn thể thao, ngày, giờ, địa điểm.
3.  Xem danh sách kết quả.
4.  Mở chi tiết sân.
5.  Chọn slot còn trống.
6.  Chọn mã khuyến mãi (nếu có).
7.  Xem price breakdown.
8.  Xác nhận booking.
9.  Mock service kiểm tra slot không bị BOOKED/HOLD còn hạn/blocked.
10. Tạo `bookings`, `booking_slots`, `payments` tương ứng.
11. Chuyển đến trang thanh toán.
12. Chọn phương thức và mô phỏng thành công hoặc thất bại.
13. Cập nhật payment/booking state phù hợp.
14. Hiển thị kết quả và booking trong lịch sử khách hàng.
15. Owner nhìn thấy booking mới trong dashboard/lịch.

### Flow B -- Owner xử lý booking

1.  Đăng nhập bằng tài khoản Owner demo đã duyệt.
2.  Xem dashboard có booking mới.
3.  Mở chi tiết booking.
4.  Xác nhận hoặc từ chối.
5.  Nếu từ chối/hủy, giải phóng slot liên quan.
6.  Cập nhật thông báo cho Customer.
7.  Customer nhìn thấy trạng thái mới trong lịch sử.

### Flow C -- Owner quản lý cơ sở và sân

1.  Tạo Facility.
2.  Facility mới có status phù hợp theo quy trình duyệt.
3.  Admin duyệt Facility.
4.  Owner thêm Court.
5.  Cấu hình operating hours.
6.  Tạo price rules.
7.  Tạo blocked slots.
8.  Sân xuất hiện ở trang tìm kiếm khi đủ điều kiện hiển thị.

### Flow D -- Admin duyệt Owner

1.  Customer gửi hồ sơ đăng ký Owner.
2.  Tạo `owner_applications` status `PENDING`.
3.  Admin xem hồ sơ và giấy tờ.
4.  Admin approve hoặc reject.
5.  Nếu approve, cập nhật `ownerStatus` và cấp role `OWNER` trong mock
    user.
6.  Nếu reject, lưu `rejectionReason`.
7.  Customer thấy kết quả trong hồ sơ.

### Flow E -- Đánh giá

1.  Chỉ booking `COMPLETED` mới có nút đánh giá.
2.  Customer gửi rating và content.
3.  Tạo `reviews`.
4.  Owner xem review và gửi `ownerReply`.
5.  Review xuất hiện ở trang chi tiết cơ sở/sân nếu status cho phép.

### Flow F -- Khuyến mãi

1.  Owner tạo promotion.
2.  Customer nhập code ở checkout.
3.  Mock service kiểm tra status, thời hạn, mức đơn tối thiểu, usage
    limit.
4.  Tính discount theo `PERCENTAGE` hoặc `FIXED_AMOUNT`.
5.  Tạo booking với snapshot giá.
6.  Tạo `promotion_usages`, cập nhật `usedCount`.
7.  Chặn áp dụng vượt giới hạn hoặc dùng sai cơ sở.

### Flow G -- Khiếu nại

1.  Customer tạo complaint có thể liên kết booking/facility.
2.  Complaint xuất hiện trong khu vực Owner/Admin phù hợp.
3.  Người xử lý gửi phản hồi.
4.  Cập nhật status.
5.  Customer xem kết quả.

## 9.5. Quy tắc xử lý booking mock

-   Không cho đặt slot đã BOOKED.
-   Không cho đặt slot HOLD còn hiệu lực.
-   Không cho đặt slot nằm trong blocked slot.
-   Không cho đặt ngoài operating hours.
-   Không cho đặt sân MAINTENANCE hoặc INACTIVE.
-   Không cho đặt sân thuộc facility chưa APPROVED.
-   Khi booking bị hủy/từ chối, giải phóng các slot của booking.
-   Khi HOLD hết hạn, mock service phải kiểm tra `expiresAt` và giải
    phóng khi cần; không dựa vào TTL.
-   Chống double-click submit bằng loading/disabled state.
-   Kiểm tra lại availability ở service trước khi tạo booking.
-   Đây là mô phỏng frontend; không tuyên bố đảm bảo concurrency như
    backend/transaction thật.

## 9.6. Tài khoản demo

Tạo `mock/fixtures/demoAccounts.js` với ít nhất:

  Vai trò          Email demo                     Mật khẩu demo
  ---------------- ------------------------------ ---------------
  Customer         `customer@sportbooking.demo`   `Demo@123`
  Owner approved   `owner@sportbooking.demo`      `Demo@123`
  Admin            `admin@sportbooking.demo`      `Demo@123`
  Owner pending    `pending@sportbooking.demo`    `Demo@123`

Đây là tài khoản demo frontend, không phải tài khoản backend hoặc tài
khoản thật.

Sau đăng nhập, điều hướng đúng dashboard theo role. Tài khoản Owner
pending phải nhìn thấy trạng thái chờ duyệt, không được truy cập chức
năng Owner đã duyệt.

------------------------------------------------------------------------

# 10. Quy tắc trạng thái, format và validation

## 10.1. Format tiền

-   Lưu giá trị Number theo VND.
-   Hiển thị bằng
    `Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })`.
-   Không hiển thị số tiền dạng chuỗi không có phân tách hàng nghìn.
-   Thống nhất cách làm tròn và tính discount.
-   Không tính lại giá lịch sử từ price rules.

## 10.2. Format ngày giờ

-   Dữ liệu ISO/Date được xử lý thống nhất.
-   Ngày lịch `bookingDate` dùng `YYYY-MM-DD`.
-   Hiển thị theo múi giờ `Asia/Ho_Chi_Minh`.
-   Thời gian slot hiển thị `HH:mm`.
-   Không tự chuyển ngày sai khi parse date-only string.
-   Tạo utility dùng chung cho date/time.

## 10.3. Status badge

Tạo một component `StatusBadge` dùng chung, map status sang label tiếng
Việt và màu:

-   ACTIVE: Đang hoạt động.
-   INACTIVE: Ngừng hoạt động.
-   PENDING: Chờ xử lý.
-   APPROVED: Đã duyệt.
-   REJECTED: Bị từ chối.
-   SUSPENDED: Tạm đình chỉ.
-   AVAILABLE: Có thể đặt.
-   MAINTENANCE: Đang bảo trì.
-   HOLD: Đang giữ chỗ.
-   BOOKED: Đã đặt.
-   CONFIRMED: Đã xác nhận.
-   CANCELLED: Đã hủy.
-   COMPLETED: Hoàn thành.
-   NO_SHOW: Không đến.
-   PAID: Đã thanh toán.
-   UNPAID: Chưa thanh toán.
-   FAILED: Thất bại.
-   REFUNDED: Đã hoàn tiền.
-   PROCESSING: Đang xử lý.
-   RESOLVED: Đã giải quyết.

Không tự ý đổi enum lưu trong mock. Label tiếng Việt chỉ là lớp hiển
thị.

## 10.4. Validation tối thiểu

-   Email đúng định dạng.
-   Password có độ dài tối thiểu hợp lý và xác nhận khớp.
-   Phone chỉ chứa ký tự số và dấu `+` nếu cho phép.
-   Giá và số lượng không âm.
-   `endTime` phải sau `startTime`.
-   `validTo` không trước `validFrom`.
-   `startAt` phải trước `endAt`.
-   Rating từ 1 đến 5.
-   Discount percentage trong khoảng 1--100.
-   `maxDiscount`, `minOrderAmount`, `usageLimit` phải hợp lệ.
-   Không tạo slot nằm ngoài giờ hoạt động.
-   Không tạo price rule sai khoảng thời gian.
-   Hiển thị lỗi ngay tại field.

------------------------------------------------------------------------

# 11. Accessibility và chất lượng trải nghiệm

-   Dùng semantic HTML: `header`, `nav`, `main`, `section`, `footer`,
    `button`, `form`.
-   Form input có label gắn đúng.
-   Button có tên truy cập rõ ràng.
-   Có focus state nhìn thấy được.
-   Có thể điều hướng bằng bàn phím cho menu, modal, dropdown và form.
-   Modal quản lý focus và đóng bằng Escape khi phù hợp.
-   Không chỉ dùng màu để biểu đạt trạng thái.
-   Đảm bảo contrast văn bản đủ đọc.
-   Ảnh nội dung có alt text.
-   Không dùng `div` thay button cho thao tác click.
-   Không tạo target click quá nhỏ; vùng bấm tối thiểu khoảng 40--44px.
-   Thông báo lỗi không chỉ dựa vào màu.

------------------------------------------------------------------------

# 12. Quy tắc nội dung và ngôn ngữ

-   Ngôn ngữ giao diện mặc định: Tiếng Việt.
-   Tên Collection/field trong code giữ đúng tiếng Anh theo database.
-   Label, tiêu đề, button, thông báo dùng tiếng Việt tự nhiên.
-   Dùng cùng một thuật ngữ xuyên suốt: "Cơ sở", "Sân", "Đơn đặt sân",
    "Khung giờ", "Chủ sân".
-   Không dùng Lorem Ipsum ở giao diện hoàn thiện.
-   Không dùng nội dung giả kiểu "Test 1", "ABC", "Lorem".
-   Mock data nên có tên, mô tả, địa chỉ, giá và trạng thái hợp lý.
-   Nội dung dài cần có line clamp hoặc xem thêm.

------------------------------------------------------------------------

# 13. Quy tắc ảnh, asset và icon

-   Tổ chức ảnh theo nhóm trong `public/images/`.
-   Tên file có ý nghĩa, ví dụ `football-court-01.webp`,
    `badminton-court-02.webp`.
-   Ưu tiên WebP/AVIF; có fallback nếu cần.
-   Lazy-load ảnh dưới fold.
-   Ảnh có kích thước và tỷ lệ thống nhất theo component.
-   Dùng placeholder khi không có ảnh.
-   Không nhúng base64 ảnh lớn vào file mock.
-   Không dùng icon emoji làm icon điều hướng.
-   Không sử dụng hình ảnh vi phạm bản quyền hoặc logo thương hiệu khác.
-   Nếu ảnh remote không ổn định, tải asset phù hợp vào dự án hoặc tạo
    placeholder local.

------------------------------------------------------------------------

# 14. Quy tắc bảo mật và giới hạn mock

-   Mock login chỉ phục vụ demo frontend.
-   Không đưa password thật hoặc secret vào Git.
-   `.env` phải nằm trong `.gitignore`.
-   Chỉ commit `.env.example`.
-   Không để lộ MongoDB URI hoặc thông tin Atlas.
-   Không giả vờ đã gọi API/backend khi chưa có backend.
-   Không giả vờ đã thanh toán tiền thật.
-   Không lưu thông tin thẻ thanh toán.
-   Không hiển thị dữ liệu cá nhân thật.
-   Frontend route guard chỉ là demo; backend sau này phải xác thực và
    phân quyền độc lập.

------------------------------------------------------------------------

# 15. Kiểm thử giao diện và nghiệm thu

## 15.1. Responsive test

Kiểm tra tối thiểu tại các viewport:

-   320 × 720.
-   375 × 812.
-   390 × 844.
-   768 × 1024.
-   1024 × 768.
-   1366 × 768.
-   1440 × 900.
-   1920 × 1080.

Tiêu chí:

-   Không tràn ngang ngoài vùng table/calendar được kiểm soát.
-   Không vỡ header/sidebar.
-   Modal không vượt chiều cao viewport.
-   Form không bị cắt.
-   Button không chồng lấn.
-   Card không méo ảnh.
-   Text không bị cắt bất hợp lý.
-   Có thể thao tác trên màn hình cảm ứng.

## 15.2. Kiểm tra chức năng

-   [ ] Tất cả route trong danh sách được tạo.
-   [ ] Điều hướng menu đúng.
-   [ ] Active menu đúng route.
-   [ ] Đăng nhập demo theo 4 vai trò/trạng thái.
-   [ ] Route guard hoạt động.
-   [ ] Search/filter/sort/pagination hoạt động.
-   [ ] Form validate.
-   [ ] CRUD mock hoạt động.
-   [ ] Booking flow chạy từ tìm sân đến kết quả thanh toán.
-   [ ] Booking slot được giữ/giải phóng đúng trong mock.
-   [ ] Owner xử lý booking.
-   [ ] Admin duyệt Owner và Facility.
-   [ ] Customer xem booking, favorite, notification, review, complaint.
-   [ ] Promotion tính giảm giá đúng.
-   [ ] Dashboard tính KPI từ mock data.
-   [ ] Toast/modal/drawer hoạt động.
-   [ ] Reset mock data hoạt động.
-   [ ] Không có nút quan trọng vô tác dụng.
-   [ ] Không có lỗi console nghiêm trọng.

## 15.3. Kiểm tra dữ liệu

-   [ ] Có đủ 17 file dữ liệu mock.
-   [ ] Field name khớp database.
-   [ ] Enum khớp database.
-   [ ] ObjectId tham chiếu tồn tại.
-   [ ] Dữ liệu đủ trạng thái.
-   [ ] Dữ liệu có thể lọc và phân trang.
-   [ ] Mock service không sửa trực tiếp file seed.
-   [ ] Reset khôi phục dữ liệu ban đầu.
-   [ ] Không có dữ liệu demo bị hardcode trong JSX.

## 15.4. Kiểm tra chất lượng code

-   [ ] Không có CSS global gây xung đột.
-   [ ] Không copy/paste layout.
-   [ ] Component có trách nhiệm rõ.
-   [ ] Không có component khổng lồ.
-   [ ] Không có import thừa hoặc dependency trùng.
-   [ ] Không có warning React key nghiêm trọng.
-   [ ] Không có lỗi TypeScript/ESLint nếu dự án dùng.
-   [ ] Build production thành công.
-   [ ] README hướng dẫn cài đặt và chạy.

------------------------------------------------------------------------

# 16. Tiêu chí thẩm mỹ -- Không chấp nhận giao diện sơ sài

Không nghiệm thu nếu có một trong các lỗi sau:

-   Chỉ có header, sidebar và bảng dữ liệu mặc định.
-   Tất cả trang dùng cùng một layout mà không phân biệt
    public/customer/Owner/Admin.
-   Không có phân cấp tiêu đề, spacing và typography.
-   Màu sắc tùy tiện, mỗi trang một kiểu.
-   Dùng emoji làm icon chính.
-   Card không có ảnh hoặc nội dung thiếu thực tế trong khi trang cần
    ảnh.
-   Form không chia nhóm và không có validation.
-   Dashboard chỉ có vài con số không có biểu đồ hoặc bảng hỗ trợ.
-   Danh sách không có search/filter/pagination khi dữ liệu nhiều.
-   Không có empty/loading/error state.
-   Responsive chỉ co nhỏ desktop mà không thay đổi bố cục.
-   Có nút bấm nhưng không thực hiện hành động.
-   Mock data ít hoặc lặp khiến giao diện trống.
-   Dùng alert trình duyệt cho mọi tương tác thay vì modal/toast phù
    hợp.
-   Có lỗi tràn, chồng lấn, ảnh méo hoặc text khó đọc.

**Mức chất lượng mong muốn:** Một sản phẩm SaaS/booking hiện đại, có thể
dùng làm bản demo học kỳ và tiếp tục kết nối Spring Boot sau này.

------------------------------------------------------------------------

# 17. Deliverables -- Sản phẩm Agent phải bàn giao

1.  Frontend ReactJS chạy được.
2.  Public, Customer, Owner và Admin layouts.
3.  Đầy đủ các route/page được liệt kê.
4.  Hệ thống component dùng chung.
5.  Design tokens, global styles và CSS scoped.
6.  Thư mục `frontend/mock/` có 17 file dữ liệu.
7.  Mock services CRUD và query.
8.  Demo accounts cho Customer, Owner approved, Owner pending, Admin.
9.  Các flow demo end-to-end.
10. Responsive cho mobile, tablet, desktop.
11. README hướng dẫn cài đặt, chạy, đăng nhập demo và reset mock.
12. `.env.example`, `.gitignore` đúng chuẩn.
13. Build production thành công.
14. Báo cáo ngắn các route đã làm, chức năng demo và phần chưa triển
    khai.

------------------------------------------------------------------------

# 18. Chỉ dẫn cuối cùng dành cho AI Agent

Trước khi bắt đầu:

1.  Tìm và đọc file database trong repository. File chuẩn hiện có thể
    mang tên `SportBooking_Database_Design.md` hoặc được nhóm đổi thành
    `database.md`.
2.  Nếu không tìm thấy file database, dừng việc tự thiết kế schema và
    yêu cầu người dùng cung cấp; không tự suy đoán.
3.  Tạo bảng đối chiếu Collection → mock file → service → page sử dụng.
4.  Tạo đủ 17 Collections mock trước khi hoàn thiện các trang phụ thuộc
    dữ liệu.
5.  Xây dựng design system và layout dùng chung trước khi triển khai
    hàng loạt page.
6.  Triển khai theo từng nhóm Public → Auth → Customer → Owner → Admin.
7.  Sau mỗi nhóm, chạy ứng dụng và kiểm tra responsive, console, luồng
    thao tác.
8.  Chỉ dùng mock service để cấp dữ liệu. Không viết dữ liệu trực tiếp
    trong JSX.
9.  Giữ schema đồng nhất với database. Nếu phát hiện mâu thuẫn giữa tài
    liệu và yêu cầu UI, ghi lại vấn đề và hỏi người dùng; không tự ý sửa
    database.
10. Không bàn giao một bản giao diện tĩnh. Phải có dữ liệu phong phú và
    các chức năng demo thao tác được.

**Ưu tiên cao nhất:** Đúng database, trải nghiệm đẹp và nhất quán, đủ
màn hình, responsive, mock data liên kết chính xác, các luồng demo hoạt
động và kiến trúc dễ thay mock bằng Spring Boot API.
