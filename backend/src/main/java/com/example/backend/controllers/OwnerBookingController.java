package com.example.backend.controllers;

import com.example.backend.dtos.booking.OwnerBookingDto;
import com.example.backend.dtos.response.ApiSuccessResponse;
import com.example.backend.services.OwnerBookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/owner/bookings")
@RequiredArgsConstructor
@Tag(name = "07. Owner Bookings", description = "Các API quản lý đơn đặt sân tại cơ sở của Chủ sân (OWNER)")
public class OwnerBookingController {

    private final OwnerBookingService ownerBookingService;

    @GetMapping
    @Operation(summary = "Lấy danh sách đơn đặt sân tại các cơ sở thuộc quyền sở hữu của Chủ sân")
    public ResponseEntity<ApiSuccessResponse<List<OwnerBookingDto>>> getOwnerBookings(
            @Parameter(hidden = true)
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorizationHeader,
            @Parameter(description = "Lọc theo ID cơ sở thể thao (facilityId)")
            @RequestParam(value = "facilityId", required = false) String facilityId,
            @Parameter(description = "Lọc theo ID sân thể thao (courtId)")
            @RequestParam(value = "courtId", required = false) String courtId,
            @Parameter(description = "Lọc theo ngày đặt sân (yyyy-MM-dd)")
            @RequestParam(value = "bookingDate", required = false) String bookingDate,
            @Parameter(description = "Lọc theo trạng thái đơn (PENDING_PAYMENT, CONFIRMED, COMPLETED, CANCELLED, EXPIRED)")
            @RequestParam(value = "status", required = false) String status,
            @Parameter(description = "Lọc theo trạng thái thanh toán (UNPAID, DEPOSIT_PAID, PAID, REFUNDED)")
            @RequestParam(value = "paymentStatus", required = false) String paymentStatus,
            @Parameter(description = "Tìm kiếm theo mã đơn (bookingCode), tên hoặc SĐT khách hàng")
            @RequestParam(value = "keyword", required = false) String keyword
    ) {
        List<OwnerBookingDto> bookings = ownerBookingService.getOwnerBookings(
                authorizationHeader,
                facilityId,
                courtId,
                bookingDate,
                status,
                paymentStatus,
                keyword
        );
        return ResponseEntity.ok(
                ApiSuccessResponse.success("Lấy danh sách đơn đặt sân thành công", bookings)
        );
    }

    @GetMapping("/{id}")
    @Operation(summary = "Xem chi tiết một đơn đặt sân tại cơ sở của Chủ sân")
    public ResponseEntity<ApiSuccessResponse<OwnerBookingDto>> getOwnerBookingDetail(
            @Parameter(hidden = true)
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorizationHeader,
            @Parameter(description = "ID của đơn đặt sân")
            @PathVariable("id") String id
    ) {
        OwnerBookingDto booking = ownerBookingService.getOwnerBookingDetail(authorizationHeader, id);
        return ResponseEntity.ok(
                ApiSuccessResponse.success("Lấy thông tin chi tiết đơn đặt sân thành công", booking)
        );
    }
}
