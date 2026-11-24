package com.example.backend.controllers;

import com.example.backend.dtos.response.ApiSuccessResponse;
import com.example.backend.models.SportsCategory;
import com.example.backend.repositories.SportsCategoryRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "05. Sports Categories", description = "Các API lấy danh mục môn thể thao")
public class SportsCategoryController {

    private final SportsCategoryRepository sportsCategoryRepository;

    @GetMapping({"/categories", "/sports-categories"})
    @Operation(summary = "Lấy danh sách các môn thể thao đang hoạt động (ACTIVE)")
    public ResponseEntity<ApiSuccessResponse<List<SportsCategory>>> getActiveCategories() {
        List<SportsCategory> categories = sportsCategoryRepository.findByStatusOrderByNameAsc("ACTIVE");
        return ResponseEntity.ok(
                ApiSuccessResponse.success("Lấy danh sách môn thể thao thành công", categories)
        );
    }
}
