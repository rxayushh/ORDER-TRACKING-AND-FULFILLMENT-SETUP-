package com.ordertracking.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockAdjustmentRequest {
    @NotNull(message = "Warehouse ID is required")
    private Long warehouseId;

    @NotNull(message = "Product ID is required")
    private Long productId;

    @NotNull(message = "Quantity change is required")
    private Integer quantityChange; // positive to add stock, negative to reduce

    private String reason; // AUDIT, RESTOCK, DAMAGED
}
