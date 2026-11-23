package com.ordertracking;

import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import com.ordertracking.repository.UserRepository;
import com.ordertracking.repository.OrderRepository;
import com.ordertracking.entity.OrderStatus;
import com.ordertracking.repository.WarehouseInventoryRepository;
import org.springframework.data.domain.PageRequest;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:migrationvalidation;DB_CLOSE_DELAY=-1;MODE=MySQL;DATABASE_TO_LOWER=TRUE;CASE_INSENSITIVE_IDENTIFIERS=TRUE",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.flyway.enabled=true",
        "spring.jpa.hibernate.ddl-auto=validate"
})
@ActiveProfiles("dev")
class FlywaySchemaValidationTest {
    @Autowired Flyway flyway;
    @Autowired UserRepository userRepository;
    @Autowired OrderRepository orderRepository;
    @Autowired WarehouseInventoryRepository warehouseInventoryRepository;

    @Test
    void migrationsApplyAndMatchJpaMappingsInH2MysqlMode() {
        assertEquals(3, flyway.info().applied().length);
    }

    @Test
    void userSearchRepositoryPagesSeededAccounts() {
        var page = userRepository.searchAllUsers("ordertrack.com", PageRequest.of(0, 10));
        assertEquals(3, page.getTotalElements());
    }

    @Test
    void monthlySalesAggregationQueryRunsAgainstMigratedSchema() {
        var sales = orderRepository.aggregateMonthlySales(LocalDateTime.now().minusMonths(6), LocalDateTime.now().plusDays(1));
        var currentMonth = sales.stream()
                .filter(row -> ((Number) row[0]).intValue() == YearMonth.now().getYear()
                        && ((Number) row[1]).intValue() == YearMonth.now().getMonthValue())
                .findFirst()
                .orElseThrow();
        assertEquals(3L, ((Number) currentMonth[3]).longValue());
        assertTrue(((java.math.BigDecimal) currentMonth[2]).signum() > 0);
    }

    @Test
    void dashboardMetricsAggregateAllCustomerOrdersAndConfiguredWarehouseThresholds() {
        Long customerId = userRepository.findByEmail("customer@ordertrack.com").orElseThrow().getId();
        assertEquals(2L, orderRepository.countByUserIdAndOrderStatusIn(customerId, List.of(
                OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.PROCESSING, OrderStatus.PACKED,
                OrderStatus.SHIPPED, OrderStatus.OUT_FOR_DELIVERY, OrderStatus.RETURN_REQUESTED)));
        assertEquals(1L, orderRepository.countByUserIdAndOrderStatusIn(customerId, List.of(OrderStatus.DELIVERED)));
        assertEquals(8L, warehouseInventoryRepository.countDistinctProductsByWarehouse(null));
        assertEquals(3L, warehouseInventoryRepository.countLowStockByWarehouse(null));
        assertEquals(3L, warehouseInventoryRepository.findLowStockByWarehouse(null, PageRequest.of(0, 8)).getTotalElements());
    }
}
