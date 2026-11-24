package com.example.backend.controllers;

import com.example.backend.dtos.court.OwnerCourtDto;
import com.example.backend.dtos.response.ApiSuccessResponse;
import com.example.backend.services.OwnerCourtService;
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
}
