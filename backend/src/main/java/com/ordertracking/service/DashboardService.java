package com.ordertracking.service;

import com.ordertracking.dto.*;
import com.ordertracking.entity.OrderStatus;
import com.ordertracking.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final FulfillmentRecordRepository fulfillmentRepository;
    private final WarehouseInventoryRepository inventoryRepository;
    private final OrderService orderService;
    private final ProductService productService;
    private final InventoryService inventoryService;
    private final FulfillmentService fulfillmentService;

    @Transactional(readOnly = true)
    public AdminDashboardDto getAdminDashboard() {
        long totalOrders = orderRepository.count();
        BigDecimal totalRevenue = orderRepository.calculateTotalRevenue();
        long pending = orderRepository.countByOrderStatus(OrderStatus.PENDING) + orderRepository.countByOrderStatus(OrderStatus.CONFIRMED);
        long processing = orderRepository.countByOrderStatus(OrderStatus.PROCESSING) + orderRepository.countByOrderStatus(OrderStatus.PACKED);
        long shipped = orderRepository.countByOrderStatus(OrderStatus.SHIPPED) + orderRepository.countByOrderStatus(OrderStatus.OUT_FOR_DELIVERY);
        long delivered = orderRepository.countByOrderStatus(OrderStatus.DELIVERED);
        long totalCustomers = userRepository.countCustomers();
        long lowStockCount = productRepository.countLowStockProducts();

        List<OrderDto> recentOrders = orderRepository.findTop10ByOrderByCreatedAtDesc().stream()
                .map(orderService::mapToDto)
                .collect(Collectors.toList());

        List<ProductDto> lowStockProducts = productRepository.findLowStockProducts().stream()
                .limit(5)
                .map(productService::mapToDto)
                .collect(Collectors.toList());

        // Status Distribution for charts
        List<OrderStatusCountDto> statusDistribution = List.of(
                new OrderStatusCountDto("Pending", pending, "#f59e0b"),
                new OrderStatusCountDto("Processing", processing, "#3b82f6"),
                new OrderStatusCountDto("Shipped", shipped, "#8b5cf6"),
                new OrderStatusCountDto("Delivered", delivered, "#10b981"),
                new OrderStatusCountDto("Cancelled", orderRepository.countByOrderStatus(OrderStatus.CANCELLED), "#ef4444")
        );

        YearMonth firstMonth = YearMonth.now().minusMonths(5);
        LocalDateTime periodStart = firstMonth.atDay(1).atStartOfDay();
        LocalDateTime periodEnd = YearMonth.now().plusMonths(1).atDay(1).atStartOfDay();
        Map<YearMonth, Object[]> salesByMonth = new HashMap<>();
        orderRepository.aggregateMonthlySales(periodStart, periodEnd).forEach(row ->
                salesByMonth.put(YearMonth.of(((Number) row[0]).intValue(), ((Number) row[1]).intValue()), row));

        List<MonthlySalesDto> monthlySales = new ArrayList<>();
        for (int i = 0; i < 6; i++) {
            YearMonth month = firstMonth.plusMonths(i);
            Object[] aggregate = salesByMonth.get(month);
            monthlySales.add(new MonthlySalesDto(
                    month.format(DateTimeFormatter.ofPattern("MMM yyyy", Locale.ENGLISH)),
                    aggregate != null ? (BigDecimal) aggregate[2] : BigDecimal.ZERO,
                    aggregate != null ? ((Number) aggregate[3]).longValue() : 0L));
        }

        return AdminDashboardDto.builder()
                .totalOrders(totalOrders)
                .totalRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO)
                .pendingOrders(pending)
                .processingOrders(processing)
                .shippedOrders(shipped)
                .deliveredOrders(delivered)
                .totalCustomers(totalCustomers)
                .lowStockCount(lowStockCount)
                .recentOrders(recentOrders)
                .lowStockProducts(lowStockProducts)
                .salesAnalytics(monthlySales)
                .statusDistribution(statusDistribution)
                .build();
    }

    @Transactional(readOnly = true)
    public WarehouseDashboardDto getWarehouseDashboard(Long warehouseId) {
        long awaiting = (warehouseId != null)
                ? fulfillmentRepository.countByWarehouseIdAndFulfillmentStatus(warehouseId, "AWAITING_PROCESSING")
                : fulfillmentRepository.countByFulfillmentStatus("AWAITING_PROCESSING");

        long packed = (warehouseId != null)
                ? fulfillmentRepository.countByWarehouseIdAndFulfillmentStatus(warehouseId, "PACKED")
                : fulfillmentRepository.countByFulfillmentStatus("PACKED");

        long dispatched = (warehouseId != null)
                ? fulfillmentRepository.countByWarehouseIdAndFulfillmentStatus(warehouseId, "DISPATCHED")
                : fulfillmentRepository.countByFulfillmentStatus("DISPATCHED");

        List<FulfillmentDto> urgentQueue = fulfillmentRepository
                .findByWarehouseAndStatus(warehouseId, "AWAITING_PROCESSING", PageRequest.of(0, 8))
                .map(fulfillmentService::mapToDto)
                .getContent();

        List<WarehouseInventoryDto> criticalStock = inventoryRepository.findLowStockByWarehouse(warehouseId, PageRequest.of(0, 8)).getContent().stream()
                .map(inventoryService::mapToDto)
                .collect(Collectors.toList());

        return WarehouseDashboardDto.builder()
                .awaitingProcessing(awaiting)
                .packedOrders(packed)
                .dispatchedOrders(dispatched)
                .totalAllocatedProducts(inventoryRepository.countDistinctProductsByWarehouse(warehouseId))
                .lowStockAlerts(inventoryRepository.countLowStockByWarehouse(warehouseId))
                .urgentQueue(urgentQueue)
                .criticalStock(criticalStock)
                .build();
    }

    @Transactional(readOnly = true)
    public CustomerDashboardDto getCustomerDashboard(Long userId) {
        long totalOrders = orderRepository.countByUserId(userId);
        List<OrderDto> recentOrders = orderRepository.findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(0, 5))
                .map(orderService::mapToDto)
                .getContent();

        long activeShipments = orderRepository.countByUserIdAndOrderStatusIn(userId, List.of(
                OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.PROCESSING, OrderStatus.PACKED,
                OrderStatus.SHIPPED, OrderStatus.OUT_FOR_DELIVERY, OrderStatus.RETURN_REQUESTED));
        long delivered = orderRepository.countByUserIdAndOrderStatusIn(userId, List.of(OrderStatus.DELIVERED));

        return CustomerDashboardDto.builder()
                .totalOrders(totalOrders)
                .activeShipments(activeShipments)
                .deliveredOrders(delivered)
                .recentOrders(recentOrders)
                .build();
    }
}
