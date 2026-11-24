package com.example.backend.services;

import com.example.backend.dtos.upload.FileUploadResponse;
import com.example.backend.exceptions.AppException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.text.Normalizer;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
public class FileUploadService {

    private static final long MAX_FILE_SIZE_BYTES = 5L * 1024 * 1024;
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("jpg", "jpeg", "png", "webp", "gif");

    @Value("${app.upload.dir:}")
    private String configuredUploadDir;

    public FileUploadResponse storeImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "EMPTY_FILE", "Vui lòng chọn file ảnh để tải lên");
        }

        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new AppException(HttpStatus.BAD_REQUEST, "FILE_TOO_LARGE", "Kích thước file ảnh không được vượt quá 5MB");
        }

        String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "image.jpg";
        String cleanFileName = sanitizeFileName(originalFilename);
        String extension = extractExtension(cleanFileName);

        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new AppException(
                    HttpStatus.BAD_REQUEST,
                    "INVALID_FILE_TYPE",
                    "Chỉ chấp nhận định dạng ảnh: JPG, JPEG, PNG, WEBP, GIF"
            );
        }

        String uniqueToken = System.currentTimeMillis() + "_" + UUID.randomUUID().toString().replace("-", "").substring(0, 6);
        String uniqueFileName = uniqueToken + "_" + cleanFileName;
        String dbPath = "/uploads/" + uniqueFileName;

        Path uploadDir = resolveFrontendPublicUploadsDir();
        try {
            Files.createDirectories(uploadDir);
            Path targetPath = uploadDir.resolve(uniqueFileName).normalize();
            if (!targetPath.startsWith(uploadDir)) {
                throw new AppException(HttpStatus.BAD_REQUEST, "INVALID_FILE_PATH", "Tên file không hợp lệ");
            }
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, targetPath, StandardCopyOption.REPLACE_EXISTING);
            }
        } catch (IOException ex) {
            throw new AppException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "FILE_UPLOAD_FAILED",
                    "Không thể lưu file ảnh vào thư mục frontend/public/uploads"
            );
        }

        return FileUploadResponse.builder()
                .fileName(uniqueFileName)
                .originalName(originalFilename)
                .dbPath(dbPath)
                .url(dbPath)
                .size(file.getSize())
                .contentType(file.getContentType())
                .build();
    }

    public List<FileUploadResponse> storeImages(List<MultipartFile> files) {
        if (files == null || files.isEmpty()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "EMPTY_FILES", "Vui lòng chọn ít nhất một file ảnh");
        }
        List<FileUploadResponse> results = new ArrayList<>(files.size());
        for (MultipartFile file : files) {
            results.add(storeImage(file));
        }
        return results;
    }

    public Path resolveFrontendPublicUploadsDir() {
        if (configuredUploadDir != null && !configuredUploadDir.isBlank()) {
            return Paths.get(configuredUploadDir).toAbsolutePath().normalize();
        }
        Path currentDir = Paths.get("").toAbsolutePath().normalize();
        if (currentDir.getFileName() != null
                && "backend".equalsIgnoreCase(currentDir.getFileName().toString())
                && currentDir.getParent() != null) {
            return currentDir.getParent().resolve(Paths.get("frontend", "public", "uploads")).normalize();
        }
        return currentDir.resolve(Paths.get("frontend", "public", "uploads")).normalize();
    }

    private String sanitizeFileName(String rawName) {
        String baseName = Paths.get(rawName).getFileName().toString();
        String normalized = Normalizer.normalize(baseName, Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "")
                .replace('đ', 'd')
                .replace('Đ', 'D')
                .replaceAll("[^a-zA-Z0-9._-]", "_")
                .replaceAll("_+", "_")
                .toLowerCase(Locale.ROOT);
        if (normalized.isBlank()) {
            return "image.jpg";
        }
        return normalized;
    }

    private String extractExtension(String fileName) {
        int dotIndex = fileName.lastIndexOf('.');
        if (dotIndex < 0 || dotIndex == fileName.length() - 1) {
            return "jpg";
        }
        return fileName.substring(dotIndex + 1).toLowerCase(Locale.ROOT);
    }
}
