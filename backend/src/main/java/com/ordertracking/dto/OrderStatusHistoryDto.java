package com.ordertracking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderStatusHistoryDto {
    private Long id;
    private String previousStatus;
    private String newStatus;
    private String comments;
    private String updatedBy;
    private LocalDateTime createdAt;
}
