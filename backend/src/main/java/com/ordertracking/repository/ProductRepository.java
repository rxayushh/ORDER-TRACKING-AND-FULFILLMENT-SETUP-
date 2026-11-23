package com.ordertracking.repository;

import com.ordertracking.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import jakarta.persistence.LockModeType;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    Optional<Product> findBySku(String sku);

    long countByCategoryId(Long categoryId);

    Boolean existsBySku(String sku);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Product p WHERE p.id = :id")
    Optional<Product> findByIdForUpdate(@Param("id") Long id);

    @Query("SELECT p FROM Product p WHERE " +
           "(:categoryId IS NULL OR p.category.id = :categoryId) AND " +
           "(:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.sku) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.description) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:status IS NULL OR p.status = :status)")
    Page<Product> searchProducts(@Param("categoryId") Long categoryId,
                                 @Param("search") String search,
                                 @Param("status") String status,
                                 Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.stockQuantity <= p.lowStockThreshold AND p.status = 'ACTIVE'")
    List<Product> findLowStockProducts();

    @Query("SELECT COUNT(p) FROM Product p WHERE p.stockQuantity <= p.lowStockThreshold AND p.status = 'ACTIVE'")
    long countLowStockProducts();
}
