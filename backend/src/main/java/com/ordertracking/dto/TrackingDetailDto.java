package com.ordertracking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrackingDetailDto {
    private String trackingNumber;
    private String orderNumber;
    private String carrier;
    private String currentStatus;
    private LocalDateTime estimatedDelivery;
    private LocalDateTime dispatchedAt;
    private LocalDateTime deliveredAt;
    private String originWarehouse;
    private String destinationCity;
    private String destinationState;
    private Integer totalItems;
    @Builder.Default
    private List<TimelineStepDto> timeline = new ArrayList<>();
    @Builder.Default
    private List<OrderStatusHistoryDto> statusLogs = new ArrayList<>();
}
