Bước 1: Tạo database
1. Mở MongoDB Compass.
2. Kết nối đến localhost:27017.
3. Chọn Create Database.
4. Nhập:

Thuộc tính	        Giá trị
Database Name	    sportbooking_db
Collection Name	    users


Tạo các collections bằng câu lệnh mongosh:

    1. Đầu tiên cài MongoDB Shell
    2. Mở Powershell nhập: mongosh -> chạy
    3. Nhập: use sportbooking_db (sportbooking_db là tên DB)
    4 copy toàn bộ và chạy:
        db.createCollection("users");
        db.createCollection("auth_sessions");
        db.createCollection("owner_applications");
        db.createCollection("sports_categories");
        db.createCollection("facilities");
        db.createCollection("courts");
        db.createCollection("operating_hours");
        db.createCollection("price_rules");
        db.createCollection("blocked_slots");
        db.createCollection("bookings");
        db.createCollection("booking_slots");
        db.createCollection("payments");
        db.createCollection("reviews");
        db.createCollection("favorites");
        db.createCollection("notifications");
        db.createCollection("complaints");

    5. Kiểm tra colection: show collections
    6. Tạo các Index chạy lần lượt các phần:

        1. Collection users
            db.users.createIndex(
                { email: 1 },
                { unique: true }
            );

            db.users.createIndex(
                { status: 1 }
            );

            db.users.createIndex(
                { roles: 1, status: 1 }
            );


        2. Collection auth_sessions

            db.auth_sessions.createIndex(
                { sessionId: 1 },
                { unique: true }
            );

            db.auth_sessions.createIndex(
                { userId: 1, revokedAt: 1 }
            );

            db.auth_sessions.createIndex(
                { familyId: 1 }
            );

            db.auth_sessions.createIndex(
                { expiresAt: 1 },
                { expireAfterSeconds: 0 }
            );


        3. Collection owner_applications

            db.owner_applications.createIndex(
                { userId: 1, status: 1 }
            );

            db.owner_applications.createIndex(
                { status: 1, createdAt: -1 }
            );


        4. Collection sports_categories

            db.sports_categories.createIndex(
                { code: 1 },
                { unique: true }
            );

            db.sports_categories.createIndex(
                { status: 1, name: 1 }
            );


        5. Collection facilities

            db.facilities.createIndex(
                { ownerId: 1, status: 1 }
            );

            db.facilities.createIndex(
                { status: 1, createdAt: -1 }
            );

            db.facilities.createIndex(
                { location: "2dsphere" }
            );


        6. Collection courts

            db.courts.createIndex(
                { facilityId: 1, status: 1 }
            );

            db.courts.createIndex(
                { categoryId: 1, status: 1 }
            );


        7. Collection operating_hours

            db.operating_hours.createIndex(
                { courtId: 1 },
                { unique: true }
            );


        8. Collection price_rules

            db.price_rules.createIndex(
                {
                    courtId: 1,
                    status: 1,
                    validFrom: 1,
                    validTo: 1
                }
            );


        9. Collection blocked_slots

            db.blocked_slots.createIndex(
                {
                    courtId: 1,
                    startAt: 1,
                    endAt: 1
                }
            );


        10. Collection bookings

            db.bookings.createIndex(
                { bookingCode: 1 },
                { unique: true }
            );

            db.bookings.createIndex(
                { customerId: 1, createdAt: -1 }
            );

            db.bookings.createIndex(
                { courtId: 1, createdAt: -1 }
            );

            db.bookings.createIndex(
                { status: 1, holdExpiresAt: 1 }
            );


        11. Collection booking_slots

            db.booking_slots.createIndex(
                {
                    courtId: 1,
                    slotDate: 1,
                    startAt: 1
                },
                {
                    unique: true,
                    partialFilterExpression: {
                        status: { $in: ["HOLD", "BOOKED"] }
                    }
                }
            );

            db.booking_slots.createIndex(
                { bookingId: 1 }
            );

            db.booking_slots.createIndex(
                { status: 1, expiresAt: 1 }
            );


        Index đầu tiên đặc biệt quan trọng: ngăn hai booking cùng chiếm một khung giờ đang HOLD hoặc BOOKED.
        12. Collection payments

            db.payments.createIndex(
                { bookingId: 1, createdAt: -1 }
            );

            db.payments.createIndex(
                { customerId: 1, createdAt: -1 }
            );

            db.payments.createIndex(
                { transactionCode: 1 },
                {
                    unique: true,
                    partialFilterExpression: {
                        transactionCode: { $type: "string" }
                    }
                }
            );

            db.payments.createIndex(
                { providerEventId: 1 },
                {
                    unique: true,
                    partialFilterExpression: {
                        providerEventId: { $type: "string" }
                    }
                }
            );


        13. Collection reviews

            db.reviews.createIndex(
                { bookingId: 1 },
                { unique: true }
            );

            db.reviews.createIndex(
                { facilityId: 1, createdAt: -1 }
            );

            db.reviews.createIndex(
                { status: 1 }
            );


        14. Collection favorites

            db.favorites.createIndex(
                {
                    userId: 1,
                    targetType: 1,
                    targetId: 1
                },
                { unique: true }
            );

            db.favorites.createIndex(
                { userId: 1, createdAt: -1 }
            );


        15. Collection notifications

            db.notifications.createIndex(
                {
                    userId: 1,
                    isRead: 1,
                    createdAt: -1
                }
            );


        16. Collection complaints

            db.complaints.createIndex(
                { userId: 1, createdAt: -1 }
            );

            db.complaints.createIndex(
                { facilityId: 1, status: 1 }
            );

            db.complaints.createIndex(
                { status: 1, createdAt: -1 }
            );

    7. Kiểm tra index của tất cả collections: 

        db.getCollectionNames().forEach(name => {
            print("\nCollection: " + name);
            printjson(db.getCollection(name).getIndexes());
        });


        ==========================================================================
        =====================================================================
        ================================================================

    TẠO DỮ LIỆU MẪU BẰNG MONGODB SHELL

    1. Đầu tiên cài MongoDB Shell (nếu chưa)
    2. Mở Powershell nhập: mongosh -> chạy
    3. Nhập: use sportbooking_db (sportbooking_db là tên DB)
    4. Làm theo phần dưới:

        Bước 1: Tạo tài khoản mẫu trong users
            Tạo 3 tài khoản: Admin, Owner và Customer.
            const adminId = ObjectId();
            const ownerId = ObjectId();
            const customerId = ObjectId();

            db.users.insertMany([
                {
                    _id: adminId,
                    fullName: "Admin SportBooking",
                    email: "admin@sportbooking.com",
                    password: "$2a$12$sample_admin_hash",
                    roles: ["ADMIN"],
                    ownerStatus: "NOT_REGISTERED",
                    status: "ACTIVE",
                    isEmailVerified: true,
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                {
                    _id: ownerId,
                    fullName: "Nguyen Van Owner",
                    email: "owner@gmail.com",
                    password: "$2a$12$sample_owner_hash",
                    phone: "0901234567",
                    roles: ["CUSTOMER", "OWNER"],
                    ownerStatus: "APPROVED",
                    status: "ACTIVE",
                    isEmailVerified: true,
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                {
                    _id: customerId,
                    fullName: "Tran Van Customer",
                    email: "customer@gmail.com",
                    password: "$2a$12$sample_customer_hash",
                    phone: "0909876543",
                    roles: ["CUSTOMER"],
                    ownerStatus: "NOT_REGISTERED",
                    status: "ACTIVE",
                    isEmailVerified: true,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            ]);


            ObjectId() tạo ID mới. Ta lưu ID vào biến adminId, ownerId, customerId để sử dụng ở các collection tiếp theo.

            Lưu ý: Các chuỗi password ở trên chỉ là giá trị minh họa, không phải BCrypt hash hợp lệ để đăng nhập. Khi chạy ứng dụng thật, hãy tạo hash bằng Spring Security.

        Bước 2: Tạo danh mục môn thể thao
            Collection: sports_categories
            const footballId = ObjectId();
            const badmintonId = ObjectId();
            const pickleballId = ObjectId();

            db.sports_categories.insertMany([
                {
                    _id: footballId,
                    name: "Bóng đá",
                    code: "FOOTBALL",
                    description: "Sân bóng đá mini",
                    icon: "football",
                    status: "ACTIVE",
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                {
                    _id: badmintonId,
                    name: "Cầu lông",
                    code: "BADMINTON",
                    description: "Sân cầu lông",
                    icon: "badminton",
                    status: "ACTIVE",
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                {
                    _id: pickleballId,
                    name: "Pickleball",
                    code: "PICKLEBALL",
                    description: "Sân pickleball",
                    icon: "pickleball",
                    status: "ACTIVE",
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            ]);


        Bước 3: Tạo cơ sở thể thao
            Collection: facilities
            const facilityId = ObjectId();

            db.facilities.insertOne({
                _id: facilityId,
                ownerId: ownerId,
                name: "Sport Center Da Nang",
                description: "Trung tâm thể thao tại Đà Nẵng",
                address: {
                    province: "Đà Nẵng",
                    district: "Cẩm Lệ",
                    ward: "Hòa Xuân",
                    detail: "Đường Nguyễn Phước Lan"
                },
                location: {
                    type: "Point",
                    coordinates: [108.2022, 16.0235]
                },
                images: [],
                amenities: ["PARKING", "CHANGING_ROOM"],
                status: "APPROVED",
                createdAt: new Date(),
                updatedAt: new Date()
            });


            ownerId được lấy từ tài khoản Owner đã tạo ở bước 1.

        Bước 4: Tạo sân thể thao
            Collection: courts
            const courtId = ObjectId();

            db.courts.insertOne({
                _id: courtId,
                facilityId: facilityId,
                categoryId: footballId,
                name: "Sân bóng số 1",
                description: "Sân bóng đá mini",
                attributes: {
                    surface: "ARTIFICIAL_GRASS",
                    size: "5_A_SIDE"
                },
                images: [],
                capacity: NumberInt(10),
                status: "AVAILABLE",
                createdAt: new Date(),
                updatedAt: new Date()
            });


            Ở đây:
            - facilityId: ID cơ sở vừa tạo.
            - categoryId: ID danh mục bóng đá vừa tạo.

        Bước 5: Tạo lịch hoạt động
            Collection: operating_hours
            db.operating_hours.insertOne({
                courtId: courtId,
                repeatMode: "DAILY",
                effectiveFrom: "2026-11-10",
                effectiveTo: null,
                timeSlots: [
                    {
                        startTime: "06:00",
                        endTime: "12:00"
                    },
                    {
                        startTime: "13:00",
                        endTime: "22:00"
                    }
                ],
                createdAt: new Date(),
                updatedAt: new Date()
            });


            Lịch này là mẫu hoạt động lặp lại hằng ngày, không phải tạo một document cho mỗi ngày.

        Bước 6: Tạo quy tắc giá
            Collection: price_rules
            const priceRuleId = ObjectId();

            db.price_rules.insertOne({
                _id: priceRuleId,
                courtId: courtId,
                name: "Giá ngày thường",
                specificDates: [],
                daysOfWeek: [1, 2, 3, 4, 5],
                startTime: "06:00",
                endTime: "22:00",
                pricePerSlot: NumberDecimal("500000"),
                validFrom: "2026-11-10",
                validTo: null,
                priority: NumberInt(1),
                status: "ACTIVE",
                createdAt: new Date(),
                updatedAt: new Date()
            });


            pricePerSlot sử dụng NumberDecimal() để lưu tiền chính xác, không sử dụng kiểu double.

        Bước 7: Tạo booking mẫu
            Collection: bookings

            Ví dụ khách hàng đặt sân ngày 15/11/2026, từ 06:00 đến 07:00, giá 500.000 VNĐ. Khách thanh toán trước 20%.
            const bookingId = ObjectId();

            const bookingStart = ISODate("2026-11-14T23:00:00.000Z");
            const bookingEnd = ISODate("2026-11-15T00:00:00.000Z");

            db.bookings.insertOne({
                _id: bookingId,
                bookingCode: "SB202611150001",
                customerId: customerId,
                facilityId: facilityId,
                courtId: courtId,

                items: [
                    {
                        bookingDate: "2026-11-15",
                        startAt: bookingStart,
                        endAt: bookingEnd,
                        durationMinutes: NumberInt(60),
                        unitPrice: NumberDecimal("500000"),
                        amount: NumberDecimal("500000")
                    }
                ],

                totalDurationMinutes: NumberInt(60),

                priceDetails: {
                    originalAmount: NumberDecimal("500000"),
                    depositRequired: NumberDecimal("100000"),
                    paidAmount: NumberDecimal("100000"),
                    remainingAmount: NumberDecimal("400000"),
                    currency: "VND"
                },

                paymentOption: "DEPOSIT_20_PERCENT",
                status: "CONFIRMED",
                paymentStatus: "DEPOSIT_PAID",

                holdExpiresAt: null,
                cancellationDeadline: new Date("2026-11-11T00:00:00.000Z"),
                cancelledAt: null,
                cancelReason: null,
                note: "Đặt sân đá bóng",

                createdAt: new Date("2026-11-10T10:00:00+07:00"),
                updatedAt: new Date()
            });


            Lưu ý:
            - Thời điểm startAt, endAt được lưu theo UTC.
            - bookingDate lưu ngày theo định dạng yyyy-MM-dd.
            - paidAmount là số tiền đã thanh toán thực tế.
            - Đây là dữ liệu minh họa trạng thái sau khi thanh toán cọc thành công. Khi triển khai thật, backend phải tự tính tiền và kiểm tra trạng thái thanh toán.

            
        Bước 8: Tạo các slot được đặt
            Collection: booking_slots
            db.booking_slots.insertOne({
                courtId: courtId,
                bookingId: bookingId,
                slotDate: "2026-11-15",
                startAt: bookingStart,
                endAt: bookingEnd,
                status: "BOOKED",
                expiresAt: null,
                createdAt: new Date(),
                updatedAt: new Date()
            });


            bookingId liên kết slot với booking vừa tạo.
           
        Bước 9: Tạo lịch thanh toán
            Collection: payments
            db.payments.insertOne({
                bookingId: bookingId,
                customerId: customerId,
                paymentType: "DEPOSIT",
                amount: NumberDecimal("100000"),
                currency: "VND",
                method: "BANK_TRANSFER",
                provider: "DEMO",
                transactionCode: "TXN-DEMO-001",
                status: "PAID",
                paidAt: new Date(),
                createdAt: new Date(),
                updatedAt: new Date()
            });


        Bước 10: Tạo dữ liệu phụ trợ
            Bạn có thể tiếp tục thêm dữ liệu vào những collection còn lại.

            auth_sessions – phiên đăng nhập
            db.auth_sessions.insertOne({
                userId: customerId,
                sessionId: "SESSION-DEMO-001",
                familyId: "FAMILY-DEMO-001",
                refreshTokenHash: "sample-refresh-token-hash",
                previousTokenHash: null,
                deviceName: "Chrome Windows",
                userAgent: "Chrome",
                ipAddress: "127.0.0.1",
                expiresAt: ISODate("2026-12-10T00:00:00Z"),
                lastUsedAt: new Date(),
                revokedAt: null,
                createdAt: new Date()
            });


            owner_applications – hồ sơ đăng ký Owner
            db.owner_applications.insertOne({
                userId: customerId,
                businessName: "Sport Center Da Nang",
                businessAddress: {
                    province: "Đà Nẵng",
                    district: "Cẩm Lệ",
                    ward: "Hòa Xuân",
                    detail: "Đường Nguyễn Phước Lan"
                },
                contactPhone: "0901234567",
                documents: [],
                status: "APPROVED",
                reviewedBy: adminId,
                reviewedAt: new Date(),
                rejectionReason: null,
                createdAt: new Date(),
                updatedAt: new Date()
            });


            Đây chỉ là document minh họa. Trong hệ thống thật, nếu hồ sơ được duyệt thì phải cập nhật users.roles và users.ownerStatus nhất quán.

            blocked_slots – lịch khóa sân
            db.blocked_slots.insertOne({
                courtId: courtId,
                startAt: ISODate("2026-11-16T01:00:00Z"),
                endAt: ISODate("2026-11-16T03:00:00Z"),
                reason: "Bảo trì sân",
                createdBy: ownerId,
                createdAt: new Date()
            });


            favorites – sân yêu thích
            db.favorites.insertOne({
                userId: customerId,
                targetType: "FACILITY",
                targetId: facilityId,
                createdAt: new Date()
            });


            notifications – thông báo
            db.notifications.insertOne({
                userId: customerId,
                title: "Đặt sân thành công",
                message: "Bạn đã đặt sân bóng số 1 thành công.",
                type: "BOOKING",
                referenceId: bookingId,
                isRead: false,
                createdAt: new Date()
            });


            complaints – khiếu nại
            db.complaints.insertOne({
                userId: customerId,
                bookingId: bookingId,
                facilityId: facilityId,
                subject: "Chất lượng sân",
                content: "Tôi muốn phản ánh về chất lượng mặt sân.",
                images: [],
                response: null,
                status: "OPEN",
                createdAt: new Date(),
                updatedAt: new Date()
            });


            reviews – đánh giá

            Collection này chỉ nên tạo đánh giá cho booking đã hoàn thành (COMPLETED). Vì booking mẫu ở trên đang CONFIRMED, chưa nên tạo review cho booking đó.

        3. Tạo review mẫu
            Vì booking ở trên chưa hoàn thành, hãy tạo một booking riêng có trạng thái COMPLETED để thử chức năng đánh giá.
            const completedBookingId = ObjectId();

            db.bookings.insertOne({
                _id: completedBookingId,
                bookingCode: "SB202611010001",
                customerId: customerId,
                facilityId: facilityId,
                courtId: courtId,
                items: [
                    {
                        bookingDate: "2026-11-01",
                        startAt: ISODate("2026-11-01T01:00:00Z"),
                        endAt: ISODate("2026-11-01T02:00:00Z"),
                        durationMinutes: NumberInt(60),
                        unitPrice: NumberDecimal("500000"),
                        amount: NumberDecimal("500000")
                    }
                ],
                totalDurationMinutes: NumberInt(60),
                priceDetails: {
                    originalAmount: NumberDecimal("500000"),
                    depositRequired: NumberDecimal("100000"),
                    paidAmount: NumberDecimal("500000"),
                    remainingAmount: NumberDecimal("0"),
                    currency: "VND"
                },
                paymentOption: "FULL_PAYMENT",
                status: "COMPLETED",
                paymentStatus: "PAID",
                holdExpiresAt: null,
                cancellationDeadline: ISODate("2026-11-02T03:00:00Z"),
                createdAt: ISODate("2026-11-01T03:00:00Z"),
                updatedAt: new Date()
            });


        Sau đó thêm review:

            db.reviews.insertOne({
                bookingId: completedBookingId,
                customerId: customerId,
                facilityId: facilityId,
                courtId: courtId,
                rating: NumberInt(5),
                content: "Sân sạch sẽ, chất lượng tốt.",
                images: [],
                ownerReply: null,
                status: "VISIBLE",
                createdAt: new Date(),
                updatedAt: new Date()
            });


            Mỗi booking chỉ được có tối đa một review.

    Mở mongoDB compass để kiểm tra dữ liệu mẫu