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
public class ShipmentDto {
    private Long id;
    private Long orderId;
    private String orderNumber;
    private String trackingNumber;
    private String carrier;
    private String shippingStatus;
    private LocalDateTime estimatedDelivery;
    private LocalDateTime dispatchedAt;
    private LocalDateTime deliveredAt;
    private String shippingNotes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
