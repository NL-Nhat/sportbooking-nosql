package com.example.backend.controllers;

import com.example.backend.dtos.pricing.CreatePriceRuleRequest;
import com.example.backend.dtos.pricing.OwnerPriceRuleDto;
import com.example.backend.dtos.pricing.UpdatePriceRuleRequest;
import com.example.backend.dtos.response.ApiSuccessResponse;
import com.example.backend.services.OwnerPriceRuleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
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
@Tag(name = "05. Owner Price Rules", description = "Các API quản lý quy tắc giá động theo sân của Chủ sân (OWNER)")
public class OwnerPriceRuleController {

    private final OwnerPriceRuleService ownerPriceRuleService;

    @GetMapping("/price-rules")
    @Operation(summary = "Lấy danh sách quy tắc giá theo sân thuộc quyền sở hữu của Chủ sân")
    public ResponseEntity<ApiSuccessResponse<List<OwnerPriceRuleDto>>> getPriceRules(
            @Parameter(hidden = true)
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorizationHeader,
            @Parameter(description = "Lọc theo ID sân thể thao (courtId)")
            @RequestParam(value = "courtId", required = false) String courtId,
            @Parameter(description = "Lọc theo trạng thái quy tắc giá (ACTIVE, INACTIVE)")
            @RequestParam(value = "status", required = false) String status
    ) {
        List<OwnerPriceRuleDto> rules = ownerPriceRuleService.getOwnerPriceRules(
                authorizationHeader,
                courtId,
                status
        );
        return ResponseEntity.ok(
                ApiSuccessResponse.success("Lấy danh sách quy tắc giá thành công", rules)
        );
    }

    @GetMapping("/courts/{courtId}/price-rules")
    @Operation(summary = "Lấy danh sách quy tắc giá của một sân cụ thể thuộc Chủ sân")
    public ResponseEntity<ApiSuccessResponse<List<OwnerPriceRuleDto>>> getPriceRulesByCourt(
            @Parameter(hidden = true)
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorizationHeader,
            @Parameter(description = "ID của sân thể thao")
            @PathVariable("courtId") String courtId,
            @Parameter(description = "Lọc theo trạng thái quy tắc giá (ACTIVE, INACTIVE)")
            @RequestParam(value = "status", required = false) String status
    ) {
        List<OwnerPriceRuleDto> rules = ownerPriceRuleService.getOwnerPriceRules(
                authorizationHeader,
                courtId,
                status
        );
        return ResponseEntity.ok(
                ApiSuccessResponse.success("Lấy danh sách quy tắc giá của sân thành công", rules)
        );
    }

    @PostMapping("/price-rules")
    @Operation(summary = "Tạo quy tắc giá động mới cho sân của Chủ sân")
    public ResponseEntity<ApiSuccessResponse<OwnerPriceRuleDto>> createPriceRule(
            @Parameter(hidden = true)
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorizationHeader,
            @RequestBody CreatePriceRuleRequest request
    ) {
        OwnerPriceRuleDto created = ownerPriceRuleService.createPriceRule(authorizationHeader, null, request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiSuccessResponse.success("Tạo quy tắc giá mới thành công", created));
    }

    @PostMapping("/courts/{courtId}/price-rules")
    @Operation(summary = "Tạo quy tắc giá động mới cho một sân cụ thể thuộc Chủ sân")
    public ResponseEntity<ApiSuccessResponse<OwnerPriceRuleDto>> createPriceRuleForCourt(
            @Parameter(hidden = true)
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorizationHeader,
            @Parameter(description = "ID của sân thể thao")
            @PathVariable("courtId") String courtId,
            @RequestBody CreatePriceRuleRequest request
    ) {
        OwnerPriceRuleDto created = ownerPriceRuleService.createPriceRule(authorizationHeader, courtId, request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiSuccessResponse.success("Tạo quy tắc giá mới cho sân thành công", created));
    }

    @GetMapping("/price-rules/{id}")
    @Operation(summary = "Xem chi tiết một quy tắc giá thuộc quyền sở hữu của Chủ sân")
    public ResponseEntity<ApiSuccessResponse<OwnerPriceRuleDto>> getPriceRuleById(
            @Parameter(hidden = true)
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorizationHeader,
            @Parameter(description = "ID của quy tắc giá")
            @PathVariable("id") String id
    ) {
        OwnerPriceRuleDto rule = ownerPriceRuleService.getPriceRuleDetail(authorizationHeader, id);
        return ResponseEntity.ok(
                ApiSuccessResponse.success("Lấy thông tin quy tắc giá thành công", rule)
        );
    }

    @PatchMapping("/price-rules/{id}")
    @Operation(summary = "Cập nhật thông tin hoặc bật/tắt trạng thái một quy tắc giá của Chủ sân")
    public ResponseEntity<ApiSuccessResponse<OwnerPriceRuleDto>> updatePriceRule(
            @Parameter(hidden = true)
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorizationHeader,
            @Parameter(description = "ID của quy tắc giá")
            @PathVariable("id") String id,
            @RequestBody UpdatePriceRuleRequest request
    ) {
        OwnerPriceRuleDto updated = ownerPriceRuleService.updatePriceRule(authorizationHeader, id, request);
        return ResponseEntity.ok(
                ApiSuccessResponse.success("Cập nhật quy tắc giá thành công", updated)
        );
    }

    @DeleteMapping("/price-rules/{id}")
    @Operation(summary = "Xóa quy tắc giá của Chủ sân")
    public ResponseEntity<ApiSuccessResponse<Void>> deletePriceRule(
            @Parameter(hidden = true)
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorizationHeader,
            @Parameter(description = "ID của quy tắc giá")
            @PathVariable("id") String id
    ) {
        ownerPriceRuleService.deletePriceRule(authorizationHeader, id);
        return ResponseEntity.ok(
                ApiSuccessResponse.success("Xóa quy tắc giá thành công", null)
        );
    }
}
