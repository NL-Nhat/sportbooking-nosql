package com.example.backend.controllers;

import com.example.backend.dtos.blockedslot.OwnerBlockedSlotDto;
import com.example.backend.dtos.response.ApiSuccessResponse;
import com.example.backend.services.OwnerBlockedSlotService;
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
@Tag(name = "06. Owner Blocked Slots", description = "Các API quản lý lịch chặn sân / khóa giờ bảo trì của Chủ sân (OWNER)")
public class OwnerBlockedSlotController {

    private final OwnerBlockedSlotService ownerBlockedSlotService;

    @GetMapping("/blocked-slots")
    @Operation(summary = "Lấy danh sách lịch chặn sân thuộc quyền sở hữu của Chủ sân")
    public ResponseEntity<ApiSuccessResponse<List<OwnerBlockedSlotDto>>> getBlockedSlots(
            @Parameter(hidden = true)
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorizationHeader,
            @Parameter(description = "Lọc theo ID sân thể thao (courtId)")
            @RequestParam(value = "courtId", required = false) String courtId,
            @Parameter(description = "Lọc theo ngày (yyyy-MM-dd)")
            @RequestParam(value = "date", required = false) String date
    ) {
        List<OwnerBlockedSlotDto> slots = ownerBlockedSlotService.getOwnerBlockedSlots(
                authorizationHeader,
                courtId,
                date
        );
        return ResponseEntity.ok(
                ApiSuccessResponse.success("Lấy danh sách lịch chặn sân thành công", slots)
        );
    }

    @GetMapping("/courts/{courtId}/blocked-slots")
    @Operation(summary = "Lấy danh sách lịch chặn của một sân cụ thể thuộc Chủ sân")
    public ResponseEntity<ApiSuccessResponse<List<OwnerBlockedSlotDto>>> getBlockedSlotsByCourt(
            @Parameter(hidden = true)
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorizationHeader,
            @Parameter(description = "ID của sân thể thao")
            @PathVariable("courtId") String courtId,
            @Parameter(description = "Lọc theo ngày (yyyy-MM-dd)")
            @RequestParam(value = "date", required = false) String date
    ) {
        List<OwnerBlockedSlotDto> slots = ownerBlockedSlotService.getOwnerBlockedSlots(
                authorizationHeader,
                courtId,
                date
        );
        return ResponseEntity.ok(
                ApiSuccessResponse.success("Lấy danh sách lịch chặn của sân thành công", slots)
        );
    }
}
