package com.ordertracking.repository;

import com.ordertracking.entity.FulfillmentRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FulfillmentRecordRepository extends JpaRepository<FulfillmentRecord, Long> {
    Optional<FulfillmentRecord> findByOrderId(Long orderId);

    @Query("SELECT f FROM FulfillmentRecord f WHERE " +
           "(:warehouseId IS NULL OR f.warehouse.id = :warehouseId) AND " +
           "(:status IS NULL OR f.fulfillmentStatus = :status)")
    Page<FulfillmentRecord> findByWarehouseAndStatus(@Param("warehouseId") Long warehouseId,
                                                     @Param("status") String status,
                                                     Pageable pageable);

    long countByFulfillmentStatus(String status);
    long countByWarehouseIdAndFulfillmentStatus(Long warehouseId, String status);
}
