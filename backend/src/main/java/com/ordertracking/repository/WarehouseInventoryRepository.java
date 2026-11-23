package com.ordertracking.repository;

import com.ordertracking.entity.WarehouseInventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import jakarta.persistence.LockModeType;

@Repository
public interface WarehouseInventoryRepository extends JpaRepository<WarehouseInventory, Long> {
    List<WarehouseInventory> findByWarehouseId(Long warehouseId);
    List<WarehouseInventory> findByProductId(Long productId);
    Optional<WarehouseInventory> findByWarehouseIdAndProductId(Long warehouseId, Long productId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT i FROM WarehouseInventory i WHERE i.warehouse.id = :warehouseId AND i.product.id = :productId")
    Optional<WarehouseInventory> findByWarehouseIdAndProductIdForUpdate(@Param("warehouseId") Long warehouseId,
                                                                         @Param("productId") Long productId);

    @Query("SELECT COUNT(DISTINCT i.product.id) FROM WarehouseInventory i " +
           "WHERE (:warehouseId IS NULL OR i.warehouse.id = :warehouseId)")
    long countDistinctProductsByWarehouse(@Param("warehouseId") Long warehouseId);

    @Query("SELECT COUNT(i) FROM WarehouseInventory i " +
           "WHERE i.availableQuantity <= i.product.lowStockThreshold " +
           "AND (:warehouseId IS NULL OR i.warehouse.id = :warehouseId)")
    long countLowStockByWarehouse(@Param("warehouseId") Long warehouseId);

    @Query("SELECT i FROM WarehouseInventory i " +
           "WHERE i.availableQuantity <= i.product.lowStockThreshold " +
           "AND (:warehouseId IS NULL OR i.warehouse.id = :warehouseId) " +
           "ORDER BY i.availableQuantity ASC")
    Page<WarehouseInventory> findLowStockByWarehouse(@Param("warehouseId") Long warehouseId, Pageable pageable);
}
