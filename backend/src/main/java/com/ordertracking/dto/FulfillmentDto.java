package com.ordertracking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FulfillmentDto {
    private Long id;
    private Long orderId;
    private String orderNumber;
    private Long warehouseId;
    private String warehouseName;
    private String warehouseCode;
    private Long assignedToUserId;
    private String assignedToName;
    private String fulfillmentStatus;
    private String orderStatus;
    private Integer totalItems;
    private List<OrderItemDto> items;
    private String destinationCity;
    private String trackingNumber;
    private LocalDateTime pickedAt;
    private LocalDateTime packedAt;
    private LocalDateTime dispatchedAt;
    private String notes;
    private LocalDateTime createdAt;
}
