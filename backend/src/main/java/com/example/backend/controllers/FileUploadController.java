package com.example.backend.controllers;

import com.example.backend.dtos.response.ApiSuccessResponse;
import com.example.backend.dtos.upload.FileUploadResponse;
import com.example.backend.services.FileUploadService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/uploads")
@RequiredArgsConstructor
@Tag(name = "03. File Uploads", description = "Các API tải file ảnh vật lý lưu trực tiếp vào thư mục frontend/public/uploads/")
public class FileUploadController {

    private final FileUploadService fileUploadService;

    @PostMapping(value = "/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Tải lên 1 file ảnh và lưu vật lý vào thư mục frontend/public/uploads/")
    public ResponseEntity<ApiSuccessResponse<FileUploadResponse>> uploadSingleImage(
            @RequestParam("file") MultipartFile file
    ) {
        FileUploadResponse uploaded = fileUploadService.storeImage(file);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiSuccessResponse.success("Tải ảnh lên thành công", uploaded));
    }

    @PostMapping(value = "/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Tải lên nhiều file ảnh cùng lúc vào thư mục frontend/public/uploads/")
    public ResponseEntity<ApiSuccessResponse<List<FileUploadResponse>>> uploadMultipleImages(
            @RequestParam("files") List<MultipartFile> files
    ) {
        List<FileUploadResponse> uploadedList = fileUploadService.storeImages(files);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiSuccessResponse.success("Tải danh sách ảnh lên thành công", uploadedList));
    }
}
