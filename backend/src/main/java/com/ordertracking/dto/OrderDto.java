package com.ordertracking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderDto {
    private Long id;
    private String orderNumber;
    private Long userId;
    private String customerName;
    private String customerEmail;
    private CustomerAddressDto shippingAddress;
    private Long warehouseId;
    private String warehouseName;
    private Integer totalItems;
    private BigDecimal subtotal;
    private BigDecimal shippingFee;
    private BigDecimal taxAmount;
    private BigDecimal totalAmount;
    private String orderStatus;
    private String paymentStatus;
    private String customerNotes;
    private String trackingNumber;
    private String carrier;
    private String shippingStatus;
    @Builder.Default
    private List<OrderItemDto> items = new ArrayList<>();
    @Builder.Default
    private List<OrderStatusHistoryDto> statusHistory = new ArrayList<>();
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
