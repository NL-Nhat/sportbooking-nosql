package com.example.backend.dtos.upload;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FileUploadResponse {

    private String fileName;

    private String originalName;

    private String dbPath;

    private String url;

    private long size;

    private String contentType;
}
