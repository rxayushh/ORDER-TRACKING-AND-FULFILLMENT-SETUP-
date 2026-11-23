package com.ordertracking.service;

import com.ordertracking.dto.StockAdjustmentRequest;
import com.ordertracking.dto.WarehouseInventoryDto;
import com.ordertracking.entity.InventoryTransaction;
import com.ordertracking.entity.Product;
import com.ordertracking.entity.Warehouse;
import com.ordertracking.entity.WarehouseInventory;
import com.ordertracking.exception.BadRequestException;
import com.ordertracking.exception.InsufficientStockException;
import com.ordertracking.exception.ResourceNotFoundException;
import com.ordertracking.repository.InventoryTransactionRepository;
import com.ordertracking.repository.ProductRepository;
import com.ordertracking.repository.WarehouseInventoryRepository;
import com.ordertracking.repository.WarehouseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class InventoryService {

    private final ProductRepository productRepository;
    private final WarehouseRepository warehouseRepository;
    private final WarehouseInventoryRepository warehouseInventoryRepository;
    private final InventoryTransactionRepository transactionRepository;

    @Transactional(readOnly = true)
    public List<WarehouseInventoryDto> getInventoryByWarehouse(Long warehouseId) {
        return warehouseInventoryRepository.findByWarehouseId(warehouseId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<WarehouseInventoryDto> getAllWarehouseInventory() {
        return warehouseInventoryRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /**
     * Safely reserve inventory during order checkout
     */
    @Transactional
    public void reserveStock(Long warehouseId, Long productId, int quantity, String orderNumber, String user) {
        Product product = productRepository.findByIdForUpdate(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + productId));

        if (product.getStockQuantity() < quantity) {
            throw new InsufficientStockException("Insufficient stock for product " + product.getName() + " (Requested: " + quantity + ", Available: " + product.getStockQuantity() + ")");
        }

        WarehouseInventory whInventory = warehouseInventoryRepository
                .findByWarehouseIdAndProductIdForUpdate(warehouseId, productId)
                .orElseThrow(() -> new InsufficientStockException(
                        "No inventory for product " + product.getName() + " is allocated to the selected warehouse"));

        if (whInventory.getWarehouse() == null || !Boolean.TRUE.equals(whInventory.getWarehouse().getIsActive())) {
            throw new BadRequestException("The selected warehouse is unavailable");
        }
        if (whInventory.getAvailableQuantity() < quantity) {
            throw new InsufficientStockException("Insufficient stock at the selected warehouse for product " + product.getName()
                    + " (Requested: " + quantity + ", Available: " + whInventory.getAvailableQuantity() + ")");
        }

        whInventory.setReservedQuantity(whInventory.getReservedQuantity() + quantity);
        whInventory.setAvailableQuantity(whInventory.getAvailableQuantity() - quantity);
        warehouseInventoryRepository.save(whInventory);

        // Deduct from total global product catalog stock
        product.setStockQuantity(product.getStockQuantity() - quantity);
        productRepository.save(product);

        // Audit transaction
        transactionRepository.save(InventoryTransaction.builder()
                .product(product)
                .warehouse(whInventory.getWarehouse())
                .transactionType("RESERVED")
                .quantity(quantity)
                .referenceId(orderNumber)
                .referenceType("ORDER")
                .notes("Reserved for order " + orderNumber)
                .performedBy(user)
                .build());
    }

    /**
     * Restore stock upon order cancellation
     */
    @Transactional
    public void restoreStock(Long warehouseId, Long productId, int quantity, String orderNumber, String user) {
        Product product = productRepository.findByIdForUpdate(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + productId));

        if (warehouseId != null) {
            warehouseInventoryRepository.findByWarehouseIdAndProductIdForUpdate(warehouseId, productId).ifPresent(whInv -> {
                whInv.setAvailableQuantity(whInv.getAvailableQuantity() + quantity);
                if (whInv.getReservedQuantity() >= quantity) {
                    whInv.setReservedQuantity(whInv.getReservedQuantity() - quantity);
                }
                warehouseInventoryRepository.save(whInv);
            });
        }

        product.setStockQuantity(product.getStockQuantity() + quantity);
        productRepository.save(product);

        transactionRepository.save(InventoryTransaction.builder()
                .product(product)
                .warehouse(warehouseId != null ? warehouseRepository.findById(warehouseId).orElse(null) : null)
                .transactionType("RELEASED")
                .quantity(quantity)
                .referenceId(orderNumber)
                .referenceType("ORDER_CANCEL")
                .notes("Restored from cancelled order " + orderNumber)
                .performedBy(user)
                .build());
    }

    /**
     * Warehouse manager manual stock adjustment
     */
    @Transactional
    public WarehouseInventoryDto adjustStock(StockAdjustmentRequest request, String performedBy) {
        Product product = productRepository.findByIdForUpdate(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + request.getProductId()));
        Warehouse warehouse = warehouseRepository.findById(request.getWarehouseId())
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found: " + request.getWarehouseId()));
        if (!Boolean.TRUE.equals(warehouse.getIsActive())) {
            throw new BadRequestException("Cannot adjust stock in an inactive warehouse");
        }
        WarehouseInventory whInventory = warehouseInventoryRepository
                .findByWarehouseIdAndProductIdForUpdate(warehouse.getId(), product.getId())
                .orElseGet(() -> WarehouseInventory.builder()
                        .warehouse(warehouse)
                        .product(product)
                        .availableQuantity(0)
                        .reservedQuantity(0)
                        .build());

        int newAvail = whInventory.getAvailableQuantity() + request.getQuantityChange();
        if (newAvail < 0) {
            throw new BadRequestException("Adjustment would cause negative inventory");
        }

        whInventory.setAvailableQuantity(newAvail);
        warehouseInventoryRepository.save(whInventory);

        int newProductStock = product.getStockQuantity() + request.getQuantityChange();
        if (newProductStock < 0) {
            throw new BadRequestException("Adjustment would cause total product stock to become negative");
        }
        product.setStockQuantity(newProductStock);
        productRepository.save(product);

        transactionRepository.save(InventoryTransaction.builder()
                .product(product)
                .warehouse(warehouse)
                .transactionType(request.getQuantityChange() >= 0 ? "STOCK_IN" : "STOCK_OUT")
                .quantity(Math.abs(request.getQuantityChange()))
                .referenceId("ADJ-" + System.currentTimeMillis())
                .referenceType("MANUAL_ADJUSTMENT")
                .notes(request.getReason() != null ? request.getReason() : "Manual inventory adjustment")
                .performedBy(performedBy)
                .build());

        return mapToDto(whInventory);
    }

    public WarehouseInventoryDto mapToDto(WarehouseInventory inv) {
        if (inv == null) return null;
        int total = inv.getAvailableQuantity() + inv.getReservedQuantity();
        return WarehouseInventoryDto.builder()
                .id(inv.getId())
                .warehouseId(inv.getWarehouse().getId())
                .warehouseCode(inv.getWarehouse().getCode())
                .warehouseName(inv.getWarehouse().getName())
                .productId(inv.getProduct().getId())
                .productSku(inv.getProduct().getSku())
                .productName(inv.getProduct().getName())
                .productPrice(inv.getProduct().getPrice())
                .availableQuantity(inv.getAvailableQuantity())
                .reservedQuantity(inv.getReservedQuantity())
                .totalQuantity(total)
                .build();
    }
}
