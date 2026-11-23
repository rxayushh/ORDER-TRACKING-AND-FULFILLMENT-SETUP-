package com.ordertracking.controller;

import com.ordertracking.dto.*;
import com.ordertracking.entity.Warehouse;
import com.ordertracking.repository.WarehouseRepository;
import com.ordertracking.security.UserPrincipal;
import com.ordertracking.service.FulfillmentService;
import com.ordertracking.service.InventoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@Tag(name = "Warehouse & Fulfillment", description = "Fulfillment queue, picking, packing, dispatch, and multi-warehouse inventory")
public class WarehouseController {

    private final FulfillmentService fulfillmentService;
    private final InventoryService inventoryService;
    private final WarehouseRepository warehouseRepository;

    @GetMapping("/api/warehouse/fulfillment")
    @PreAuthorize("hasAnyRole('WAREHOUSE_MANAGER', 'ADMIN')")
    @Operation(summary = "Get fulfillment order processing queue")
    public ResponseEntity<ApiResponse<Page<FulfillmentDto>>> getFulfillmentQueue(
            @RequestParam(required = false) Long warehouseId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        Page<FulfillmentDto> queue = fulfillmentService.getFulfillmentQueue(warehouseId, status, PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return ResponseEntity.ok(ApiResponse.success(queue));
    }

    @PostMapping("/api/warehouse/orders/{orderId}/action")
    @PreAuthorize("hasAnyRole('WAREHOUSE_MANAGER', 'ADMIN')")
    @Operation(summary = "Execute fulfillment action (PICK, PACK, DISPATCH, OUT_FOR_DELIVERY, DELIVER)")
    public ResponseEntity<ApiResponse<FulfillmentDto>> executeFulfillmentAction(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long orderId,
            @Valid @RequestBody FulfillmentActionRequest request) {
        FulfillmentDto result = fulfillmentService.processFulfillmentAction(orderId, request, principal.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Action executed successfully", result));
    }

    @GetMapping("/api/warehouse/inventory")
    @PreAuthorize("hasAnyRole('WAREHOUSE_MANAGER', 'ADMIN')")
    @Operation(summary = "Get stock allocation across warehouses")
    public ResponseEntity<ApiResponse<List<WarehouseInventoryDto>>> getWarehouseInventory(
            @RequestParam(required = false) Long warehouseId) {
        List<WarehouseInventoryDto> list = (warehouseId != null)
                ? inventoryService.getInventoryByWarehouse(warehouseId)
                : inventoryService.getAllWarehouseInventory();
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @PostMapping("/api/warehouse/inventory/adjust")
    @PreAuthorize("hasAnyRole('WAREHOUSE_MANAGER', 'ADMIN')")
    @Operation(summary = "Manually adjust warehouse stock quantity (Stock In / Stock Out audit)")
    public ResponseEntity<ApiResponse<WarehouseInventoryDto>> adjustStock(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody StockAdjustmentRequest request) {
        WarehouseInventoryDto updated = inventoryService.adjustStock(request, principal.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Inventory adjusted successfully", updated));
    }

    @GetMapping("/api/warehouses")
    @Operation(summary = "List all active warehouses")
    public ResponseEntity<ApiResponse<List<WarehouseDto>>> getWarehouses() {
        List<WarehouseDto> list = warehouseRepository.findByIsActiveTrue().stream()
                .map(wh -> WarehouseDto.builder()
                        .id(wh.getId())
                        .code(wh.getCode())
                        .name(wh.getName())
                        .location(wh.getLocation())
                        .address(wh.getAddress())
                        .contactPerson(wh.getContactPerson())
                        .contactPhone(wh.getContactPhone())
                        .contactEmail(wh.getContactEmail())
                        .isActive(wh.getIsActive())
                        .createdAt(wh.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/api/admin/warehouses")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List all warehouses, including inactive facilities")
    public ResponseEntity<ApiResponse<List<WarehouseDto>>> getAllWarehousesForAdmin() {
        return ResponseEntity.ok(ApiResponse.success(warehouseRepository.findAll().stream()
                .map(this::toWarehouseDto)
                .toList()));
    }

    @PostMapping("/api/admin/warehouses")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Add a new warehouse facility")
    public ResponseEntity<ApiResponse<WarehouseDto>> createWarehouse(@Valid @RequestBody WarehouseCreateRequest request) {
        Warehouse warehouse = warehouseRepository.save(applyWarehouseRequest(new Warehouse(), request));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Warehouse added", toWarehouseDto(warehouse)));
    }

    @PutMapping("/api/admin/warehouses/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update warehouse details and operational status")
    public ResponseEntity<ApiResponse<WarehouseDto>> updateWarehouse(
            @PathVariable Long id,
            @Valid @RequestBody WarehouseCreateRequest request) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new com.ordertracking.exception.ResourceNotFoundException("Warehouse not found: " + id));
        warehouse = warehouseRepository.save(applyWarehouseRequest(warehouse, request));
        return ResponseEntity.ok(ApiResponse.success("Warehouse updated", toWarehouseDto(warehouse)));
    }

    private Warehouse applyWarehouseRequest(Warehouse warehouse, WarehouseCreateRequest request) {
        warehouse.setCode(request.getCode().trim().toUpperCase());
        warehouse.setName(request.getName().trim());
        warehouse.setLocation(request.getLocation().trim());
        warehouse.setAddress(request.getAddress().trim());
        warehouse.setContactPerson(request.getContactPerson());
        warehouse.setContactPhone(request.getContactPhone());
        warehouse.setContactEmail(request.getContactEmail());
        warehouse.setIsActive(request.getIsActive());
        return warehouse;
    }

    private WarehouseDto toWarehouseDto(Warehouse warehouse) {
        return WarehouseDto.builder()
                .id(warehouse.getId())
                .code(warehouse.getCode())
                .name(warehouse.getName())
                .location(warehouse.getLocation())
                .address(warehouse.getAddress())
                .contactPerson(warehouse.getContactPerson())
                .contactPhone(warehouse.getContactPhone())
                .contactEmail(warehouse.getContactEmail())
                .isActive(warehouse.getIsActive())
                .createdAt(warehouse.getCreatedAt())
                .build();
    }
}
