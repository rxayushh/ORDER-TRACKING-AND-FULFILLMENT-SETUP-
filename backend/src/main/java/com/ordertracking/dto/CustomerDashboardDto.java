package com.ordertracking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerDashboardDto {
    private long totalOrders;
    private long activeShipments;
    private long deliveredOrders;
    private List<OrderDto> recentOrders;
}
