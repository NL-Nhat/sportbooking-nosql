# SportBooking Mock Database & Services Architecture

Tài liệu hướng dẫn tầng Mock Data & Mock Service độc lập cho frontend SportBooking (`sportbooking_db`).

## 1. 17 Collections chuẩn hoá theo Database Design
1. `users`: Quản lý tài khoản (Customer, Owner, Admin; active/inactive/banned)
2. `owner_applications`: Đơn đăng ký làm chủ sân (PENDING, APPROVED, REJECTED)
3. `sports_categories`: Môn thể thao (FOOTBALL, BADMINTON, TENNIS, PICKLEBALL)
4. `facilities`: Cơ sở thể thao tại Đà Nẵng (Hải Châu, Sơn Trà, Cẩm Lệ, Ngũ Hành Sơn...)
5. `courts`: Sân thể thao chi tiết (Sân 5, sân 7, thảm PVC, hard-court...)
6. `operating_hours`: Lịch hoạt động 7 ngày cho các sân
7. `price_rules`: Quy tắc tính giá giờ tiêu chuẩn, giờ cao điểm, cuối tuần
8. `blocked_slots`: Lịch tạm khóa/bảo trì sân
9. `bookings`: Đơn đặt sân với trạng thái PENDING, CONFIRMED, COMPLETED, CANCELLED
10. `booking_slots`: Quản lý giữ chỗ (HOLD, BOOKED)
11. `payments`: Giao dịch thanh toán mô phỏng (CASH, BANK_TRANSFER, ONLINE)
12. `reviews`: Đánh giá & phản hồi của chủ sân (rating 1-5 sao)
13. `favorites`: Danh sách cơ sở & sân yêu thích
14. `promotions`: Mã khuyến mãi giảm giá (Phần trăm hoặc số tiền cố định)
15. `promotion_usages`: Lịch sử áp dụng khuyến mãi
16. `notifications`: Thông báo người dùng (Booking, Payment, Promotion, System)
17. `complaints`: Khiếu nại dịch vụ và biên bản xử lý

## 2. Tài khoản Demo
- **Customer:** `customer@sportbooking.demo` / `Demo@123`
- **Owner (Approved):** `owner@sportbooking.demo` / `Demo@123`
- **Owner (Pending):** `pending@sportbooking.demo` / `Demo@123`
- **Admin:** `admin@sportbooking.demo` / `Demo@123`

## 3. Khôi phục dữ liệu gốc
Trong giao diện ứng dụng, bấm nút **"Reset Demo Data"** ở thanh chuyển tài khoản hoặc gọi hàm `resetMockDatabase()` trong console.

