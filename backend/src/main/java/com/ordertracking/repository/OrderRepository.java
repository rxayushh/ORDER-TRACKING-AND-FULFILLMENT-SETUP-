package com.ordertracking.repository;

import com.ordertracking.entity.Order;
import com.ordertracking.entity.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    Optional<Order> findByOrderNumber(String orderNumber);

    Page<Order> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    @Query("SELECT o FROM Order o WHERE " +
           "(:status IS NULL OR o.orderStatus = :status) AND " +
           "(:search IS NULL OR LOWER(o.orderNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(o.user.email) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(o.user.fullName) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Order> searchOrders(@Param("status") OrderStatus status,
                             @Param("search") String search,
                             Pageable pageable);

    long countByOrderStatus(OrderStatus status);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.orderStatus NOT IN ('CANCELLED', 'RETURNED')")
    BigDecimal calculateTotalRevenue();

    @Query("SELECT YEAR(o.createdAt), MONTH(o.createdAt), SUM(o.totalAmount), COUNT(o.id) " +
           "FROM Order o WHERE o.createdAt >= :start AND o.createdAt < :end " +
           "AND o.orderStatus NOT IN ('CANCELLED', 'RETURNED') " +
           "GROUP BY YEAR(o.createdAt), MONTH(o.createdAt)")
    List<Object[]> aggregateMonthlySales(@Param("start") LocalDateTime start,
                                        @Param("end") LocalDateTime end);

    List<Order> findTop10ByOrderByCreatedAtDesc();

    long countByUserId(Long userId);

    long countByUserIdAndOrderStatusIn(Long userId, Collection<OrderStatus> statuses);
}
