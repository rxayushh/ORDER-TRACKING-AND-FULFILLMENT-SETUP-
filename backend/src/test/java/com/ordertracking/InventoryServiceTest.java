package com.ordertracking;

import com.ordertracking.dto.StockAdjustmentRequest;
import com.ordertracking.dto.WarehouseInventoryDto;
import com.ordertracking.entity.Product;
import com.ordertracking.entity.Warehouse;
import com.ordertracking.entity.WarehouseInventory;
import com.ordertracking.exception.InsufficientStockException;
import com.ordertracking.repository.InventoryTransactionRepository;
import com.ordertracking.repository.ProductRepository;
import com.ordertracking.repository.WarehouseInventoryRepository;
import com.ordertracking.repository.WarehouseRepository;
import com.ordertracking.service.InventoryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InventoryServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private WarehouseRepository warehouseRepository;

    @Mock
    private WarehouseInventoryRepository warehouseInventoryRepository;

    @Mock
    private InventoryTransactionRepository transactionRepository;

    @InjectMocks
    private InventoryService inventoryService;

    private Product product;
    private Warehouse warehouse;
    private WarehouseInventory whInventory;

    @BeforeEach
    void setUp() {
        product = Product.builder()
                .id(1L)
                .sku("SKU-TEST-01")
                .name("Test Product")
                .price(BigDecimal.valueOf(500.00))
                .stockQuantity(50)
                .lowStockThreshold(10)
                .build();

        warehouse = Warehouse.builder()
                .id(100L)
                .code("WH-MUM-01")
                .name("Mumbai Logistics Hub")
                .build();

        whInventory = WarehouseInventory.builder()
                .id(500L)
                .warehouse(warehouse)
                .product(product)
                .availableQuantity(50)
                .reservedQuantity(0)
                .build();
    }

    @Test
    void testReserveStockSuccess() {
        when(productRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(product));
        when(warehouseInventoryRepository.findByWarehouseIdAndProductIdForUpdate(100L, 1L))
                .thenReturn(Optional.of(whInventory));

        inventoryService.reserveStock(100L, 1L, 5, "ORD-20261121-0001", "user@test.com");

        assertEquals(45, product.getStockQuantity());
        assertEquals(45, whInventory.getAvailableQuantity());
        assertEquals(5, whInventory.getReservedQuantity());
        verify(productRepository, times(1)).save(product);
        verify(warehouseInventoryRepository, times(1)).save(whInventory);
    }

    @Test
    void testReserveStockThrowsInsufficientStock() {
        when(productRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(product));

        assertThrows(InsufficientStockException.class, () ->
                inventoryService.reserveStock(100L, 1L, 100, "ORD-20261121-0001", "user@test.com")
        );
    }

    @Test
    void testAdjustStockIn() {
        StockAdjustmentRequest req = StockAdjustmentRequest.builder()
                .warehouseId(100L)
                .productId(1L)
                .quantityChange(20)
                .reason("RESTOCK")
                .build();

        when(warehouseRepository.findById(100L)).thenReturn(Optional.of(warehouse));
        when(productRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(product));
        when(warehouseInventoryRepository.findByWarehouseIdAndProductIdForUpdate(100L, 1L)).thenReturn(Optional.of(whInventory));

        WarehouseInventoryDto dto = inventoryService.adjustStock(req, "manager@test.com");

        assertNotNull(dto);
        assertEquals(70, product.getStockQuantity());
        assertEquals(70, whInventory.getAvailableQuantity());
    }
}
