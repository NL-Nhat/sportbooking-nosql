package com.example.backend.controllers;

import com.example.backend.dtos.court.CreateCourtRequest;
import com.example.backend.dtos.court.OwnerCourtDto;
import com.example.backend.dtos.court.OwnerOperatingHoursDto;
import com.example.backend.dtos.court.UpdateCourtRequest;
import com.example.backend.dtos.court.UpdateCourtStatusRequest;
import com.example.backend.dtos.response.ApiSuccessResponse;
import com.example.backend.services.OwnerCourtService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/owner")
@RequiredArgsConstructor
@Tag(name = "04. Owner Courts", description = "Các API quản lý sân thể thao thuộc quyền sở hữu của Chủ sân (OWNER)")
public class OwnerCourtController {

    private final OwnerCourtService ownerCourtService;

    @GetMapping("/courts")
    @Operation(summary = "Lấy danh sách các sân thể thao thuộc quyền sở hữu của Chủ sân hiện tại")
    public ResponseEntity<ApiSuccessResponse<List<OwnerCourtDto>>> getMyCourts(
            @Parameter(hidden = true)
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorizationHeader,
            @Parameter(description = "Lọc theo ID cơ sở thể thao (facilityId)")
            @RequestParam(value = "facilityId", required = false) String facilityId,
            @Parameter(description = "Lọc theo ID danh mục môn thể thao (categoryId)")
            @RequestParam(value = "categoryId", required = false) String categoryId,
            @Parameter(description = "Lọc theo trạng thái sân (AVAILABLE, MAINTENANCE, INACTIVE)")
            @RequestParam(value = "status", required = false) String status,
            @Parameter(description = "Tìm kiếm theo tên sân hoặc tên cơ sở")
            @RequestParam(value = "keyword", required = false) String keyword
    ) {
        List<OwnerCourtDto> courts = ownerCourtService.getOwnerCourts(
                authorizationHeader,
                facilityId,
                categoryId,
                status,
                keyword
        );
        return ResponseEntity.ok(
                ApiSuccessResponse.success("Lấy danh sách sân thể thao của chủ sân thành công", courts)
        );
    }

    @GetMapping("/facilities/{facilityId}/courts")
    @Operation(summary = "Lấy danh sách các sân thuộc một cơ sở thể thao của Chủ sân hiện tại")
    public ResponseEntity<ApiSuccessResponse<List<OwnerCourtDto>>> getCourtsByFacility(
            @Parameter(hidden = true)
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorizationHeader,
            @Parameter(description = "ID của cơ sở thể thao")
            @PathVariable("facilityId") String facilityId,
            @Parameter(description = "Lọc theo ID danh mục môn thể thao (categoryId)")
            @RequestParam(value = "categoryId", required = false) String categoryId,
            @Parameter(description = "Lọc theo trạng thái sân (AVAILABLE, MAINTENANCE, INACTIVE)")
            @RequestParam(value = "status", required = false) String status,
            @Parameter(description = "Tìm kiếm theo tên sân")
            @RequestParam(value = "keyword", required = false) String keyword
    ) {
        List<OwnerCourtDto> courts = ownerCourtService.getOwnerCourts(
                authorizationHeader,
                facilityId,
                categoryId,
                status,
                keyword
        );
        return ResponseEntity.ok(
                ApiSuccessResponse.success("Lấy danh sách sân theo cơ sở thành công", courts)
        );
    }

    @GetMapping("/courts/{courtId}")
    @Operation(summary = "Xem chi tiết một sân thể thao thuộc quyền sở hữu của Chủ sân hiện tại")
    public ResponseEntity<ApiSuccessResponse<OwnerCourtDto>> getMyCourtDetail(
            @Parameter(hidden = true)
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorizationHeader,
            @Parameter(description = "ID của sân thể thao")
            @PathVariable("courtId") String courtId
    ) {
        OwnerCourtDto court = ownerCourtService.getOwnerCourtDetail(authorizationHeader, courtId);
        return ResponseEntity.ok(
                ApiSuccessResponse.success("Lấy chi tiết sân thể thao thành công", court)
        );
    }

    @GetMapping("/courts/{courtId}/operating-hours")
    @Operation(summary = "Xem cấu hình lịch hoạt động hằng ngày (DAILY) của một sân thể thao thuộc Chủ sân")
    public ResponseEntity<ApiSuccessResponse<OwnerOperatingHoursDto>> getCourtOperatingHours(
            @Parameter(hidden = true)
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorizationHeader,
            @Parameter(description = "ID của sân thể thao")
            @PathVariable("courtId") String courtId
    ) {
        OwnerOperatingHoursDto operatingHours = ownerCourtService.getCourtOperatingHours(authorizationHeader, courtId);
        return ResponseEntity.ok(
                ApiSuccessResponse.success("Lấy cấu hình lịch hoạt động của sân thành công", operatingHours)
        );
    }

    @PostMapping("/courts")
    @Operation(summary = "Tạo sân thể thao mới kèm cấu hình khung giờ cho thuê hằng ngày (DAILY)")
    public ResponseEntity<ApiSuccessResponse<OwnerCourtDto>> createCourt(
            @Parameter(hidden = true)
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorizationHeader,
            @RequestBody CreateCourtRequest request
    ) {
        OwnerCourtDto created = ownerCourtService.createCourt(authorizationHeader, null, request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiSuccessResponse.success("Tạo sân thể thao và lưu mẫu khung giờ cho thuê hằng ngày thành công", created));
    }

    @PostMapping("/facilities/{facilityId}/courts")
    @Operation(summary = "Tạo sân thể thao mới cho một cơ sở cụ thể kèm cấu hình khung giờ cho thuê hằng ngày (DAILY)")
    public ResponseEntity<ApiSuccessResponse<OwnerCourtDto>> createCourtForFacility(
            @Parameter(hidden = true)
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorizationHeader,
            @Parameter(description = "ID của cơ sở thể thao")
            @PathVariable("facilityId") String facilityId,
            @RequestBody CreateCourtRequest request
    ) {
        OwnerCourtDto created = ownerCourtService.createCourt(authorizationHeader, facilityId, request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiSuccessResponse.success("Tạo sân thể thao và lưu mẫu khung giờ cho thuê hằng ngày thành công", created));
    }

    @PatchMapping("/courts/{courtId}")
    @Operation(summary = "Cập nhật thông tin sân thể thao và mẫu khung giờ cho thuê hằng ngày (DAILY)")
    public ResponseEntity<ApiSuccessResponse<OwnerCourtDto>> updateCourt(
            @Parameter(hidden = true)
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorizationHeader,
            @Parameter(description = "ID của sân thể thao")
            @PathVariable("courtId") String courtId,
            @RequestBody UpdateCourtRequest request
    ) {
        OwnerCourtDto updated = ownerCourtService.updateCourt(authorizationHeader, courtId, request);
        return ResponseEntity.ok(
                ApiSuccessResponse.success("Cập nhật thông tin sân và khung giờ cho thuê thành công", updated)
        );
    }

    @PatchMapping("/courts/{courtId}/status")
    @Operation(summary = "Đổi trạng thái hoạt động của sân thể thao (AVAILABLE, MAINTENANCE, INACTIVE)")
    public ResponseEntity<ApiSuccessResponse<OwnerCourtDto>> updateCourtStatus(
            @Parameter(hidden = true)
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorizationHeader,
            @Parameter(description = "ID của sân thể thao")
            @PathVariable("courtId") String courtId,
            @RequestBody UpdateCourtStatusRequest request
    ) {
        OwnerCourtDto updated = ownerCourtService.updateCourtStatus(authorizationHeader, courtId, request);
        return ResponseEntity.ok(
                ApiSuccessResponse.success("Cập nhật trạng thái sân thể thao thành công", updated)
        );
    }
}
