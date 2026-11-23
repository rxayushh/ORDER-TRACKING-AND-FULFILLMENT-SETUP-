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
public class WarehouseDashboardDto {
    private long awaitingProcessing;
    private long packedOrders;
    private long dispatchedOrders;
    private long totalAllocatedProducts;
    private long lowStockAlerts;
    private List<FulfillmentDto> urgentQueue;
    private List<WarehouseInventoryDto> criticalStock;
}
