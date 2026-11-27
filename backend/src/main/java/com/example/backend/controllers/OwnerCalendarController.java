package com.example.backend.controllers;

import com.example.backend.dtos.booking.OwnerCalendarResponseDto;
import com.example.backend.dtos.response.ApiSuccessResponse;
import com.example.backend.services.OwnerCalendarService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/owner")
@RequiredArgsConstructor
@Tag(name = "08. Owner Calendar", description = "Các API xem lịch biểu đặt sân trực quan theo cơ sở và ngày của Chủ sân (OWNER)")
public class OwnerCalendarController {

    private final OwnerCalendarService ownerCalendarService;

    @GetMapping({ "/calendar", "/bookings/calendar" })
    @Operation(summary = "Lấy dữ liệu lịch biểu đặt sân trực quan theo cơ sở và ngày của Chủ sân")
    public ResponseEntity<ApiSuccessResponse<OwnerCalendarResponseDto>> getOwnerCalendar(
            @Parameter(hidden = true)
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorizationHeader,
            @Parameter(description = "Lọc theo ID cơ sở thể thao (facilityId)")
            @RequestParam(value = "facilityId", required = false) String facilityId,
            @Parameter(description = "Ngày xem lịch biểu (yyyy-MM-dd)")
            @RequestParam(value = "date", required = false) String date
    ) {
        OwnerCalendarResponseDto data = ownerCalendarService.getOwnerCalendar(
                authorizationHeader,
                facilityId,
                date
        );
        return ResponseEntity.ok(
                ApiSuccessResponse.success("Lấy dữ liệu lịch biểu đặt sân trực quan thành công", data)
        );
    }
}
