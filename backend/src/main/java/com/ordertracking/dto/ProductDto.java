package com.ordertracking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductDto {
    private Long id;
    private Long categoryId;
    private String categoryName;
    private String sku;
    private String name;
    private String description;
    private BigDecimal price;
    private Integer stockQuantity;
    private Integer lowStockThreshold;
    private String imageUrl;
    private String status;
    private Boolean isLowStock;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
