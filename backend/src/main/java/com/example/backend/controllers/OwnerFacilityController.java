package com.example.backend.controllers;

import com.example.backend.dtos.facility.CreateFacilityRequest;
import com.example.backend.dtos.facility.OwnerFacilityDto;
import com.example.backend.dtos.response.ApiSuccessResponse;
import com.example.backend.services.OwnerFacilityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/owner/facilities")
@RequiredArgsConstructor
@Tag(name = "02. Owner Facilities", description = "Các API quản lý cơ sở thể thao thuộc quyền sở hữu của Chủ sân (OWNER)")
public class OwnerFacilityController {

    private final OwnerFacilityService ownerFacilityService;

    @GetMapping
    @Operation(summary = "Lấy danh sách cơ sở thể thao thuộc quyền sở hữu của Chủ sân hiện tại")
    public ResponseEntity<ApiSuccessResponse<List<OwnerFacilityDto>>> getMyFacilities(
            @Parameter(hidden = true)
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorizationHeader,
            @Parameter(description = "Từ khóa tìm kiếm theo tên hoặc địa chỉ cơ sở")
            @RequestParam(value = "keyword", required = false) String keyword,
            @Parameter(description = "Lọc theo trạng thái cơ sở (PENDING, APPROVED, REJECTED, SUSPENDED, INACTIVE)")
            @RequestParam(value = "status", required = false) String status
    ) {
        List<OwnerFacilityDto> facilities = ownerFacilityService.getOwnerFacilities(
                authorizationHeader,
                keyword,
                status
        );
        return ResponseEntity.ok(
                ApiSuccessResponse.success("Lấy danh sách cơ sở thể thao của chủ sân thành công", facilities)
        );
    }

    @GetMapping("/{id}")
    @Operation(summary = "Xem chi tiết cơ sở thể thao thuộc quyền sở hữu của Chủ sân hiện tại")
    public ResponseEntity<ApiSuccessResponse<OwnerFacilityDto>> getMyFacilityDetail(
            @Parameter(hidden = true)
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorizationHeader,
            @Parameter(description = "ID của cơ sở thể thao")
            @PathVariable("id") String id
    ) {
        OwnerFacilityDto facility = ownerFacilityService.getOwnerFacilityDetail(authorizationHeader, id);
        return ResponseEntity.ok(
                ApiSuccessResponse.success("Lấy chi tiết cơ sở thể thao thành công", facility)
        );
    }

    @PostMapping
    @Operation(summary = "Tạo cơ sở thể thao mới cho Chủ sân hiện tại")
    public ResponseEntity<ApiSuccessResponse<OwnerFacilityDto>> createFacility(
            @Parameter(hidden = true)
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorizationHeader,
            @RequestBody CreateFacilityRequest request
    ) {
        OwnerFacilityDto created = ownerFacilityService.createFacility(authorizationHeader, request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiSuccessResponse.success("Tạo cơ sở thể thao mới thành công", created));
    }
}
