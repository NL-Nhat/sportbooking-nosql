package com.example.backend.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

/**
 * Collection 4: sports_categories
 * Lưu danh mục môn thể thao để phân loại sân và hỗ trợ tìm kiếm/lọc.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "sports_categories")
@CompoundIndex(def = "{'status': 1, 'name': 1}")
public class SportsCategory {

    @Id
    private String id;

    private String name;

    @Indexed(unique = true)
    private String code; // FOOTBALL, BADMINTON, TENNIS, PICKLEBALL

    private String description;

    private String icon;

    private String status; // ACTIVE, INACTIVE

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}

