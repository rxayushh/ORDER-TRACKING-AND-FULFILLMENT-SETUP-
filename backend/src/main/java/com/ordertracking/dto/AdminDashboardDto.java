package com.ordertracking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardDto {
    private long totalOrders;
    private BigDecimal totalRevenue;
    private long pendingOrders;
    private long processingOrders;
    private long shippedOrders;
    private long deliveredOrders;
    private long totalCustomers;
    private long lowStockCount;
    private List<OrderDto> recentOrders;
    private List<ProductDto> lowStockProducts;
    private List<MonthlySalesDto> salesAnalytics;
    private List<OrderStatusCountDto> statusDistribution;
}
