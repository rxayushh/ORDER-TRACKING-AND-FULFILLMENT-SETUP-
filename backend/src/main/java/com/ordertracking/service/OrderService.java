package com.ordertracking.service;

import com.ordertracking.dto.*;
import com.ordertracking.entity.*;
import com.ordertracking.exception.BadRequestException;
import com.ordertracking.exception.ResourceNotFoundException;
import com.ordertracking.exception.UnauthorizedException;
import com.ordertracking.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final OrderStatusHistoryRepository statusHistoryRepository;
    private final CustomerAddressRepository addressRepository;
    private final WarehouseRepository warehouseRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final CartService cartService;
    private final InventoryService inventoryService;
    private final ShipmentRepository shipmentRepository;
    private final FulfillmentRecordRepository fulfillmentRepository;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final CustomerService customerService;

    @Transactional
    public OrderDto checkout(Long userId, CheckoutRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        Cart cart = cartService.getOrCreateCart(userId);
        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new BadRequestException("Your cart is empty. Add products before checking out.");
        }

        CustomerAddress address = addressRepository.findByIdAndUserId(request.getShippingAddressId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Shipping address not found: " + request.getShippingAddressId()));

        Warehouse warehouse;
        if (request.getPreferredWarehouseId() != null) {
            warehouse = warehouseRepository.findById(request.getPreferredWarehouseId())
                    .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found: " + request.getPreferredWarehouseId()));
        } else {
            List<Warehouse> activeWarehouses = warehouseRepository.findByIsActiveTrue();
            if (activeWarehouses.isEmpty()) {
                throw new BadRequestException("No active warehouse is available for order fulfillment");
            }
            warehouse = activeWarehouses.get(0);
        }

        // Cart prices are only a convenience snapshot. Refresh them from the
        // catalog at checkout so a stale cart cannot buy at an old price.
        for (CartItem item : cart.getItems().stream().sorted(Comparator.comparing(i -> i.getProduct().getId())).toList()) {
            if (!"ACTIVE".equalsIgnoreCase(item.getProduct().getStatus())) {
                throw new BadRequestException("Product is currently unavailable: " + item.getProduct().getName());
            }
            item.setUnitPrice(item.getProduct().getPrice());
        }
        CartDto cartDto = cartService.getCartDto(userId);

        // Generate unique order number
        String orderNumber = "ORD-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")) + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        // Validate stock for all items and reserve
        for (CartItem item : cart.getItems().stream().sorted(Comparator.comparing(i -> i.getProduct().getId())).toList()) {
            inventoryService.reserveStock(
                    warehouse.getId(),
                    item.getProduct().getId(),
                    item.getQuantity(),
                    orderNumber,
                    user.getEmail()
            );
        }

        Order order = Order.builder()
                .orderNumber(orderNumber)
                .user(user)
                .shippingAddress(address)
                .warehouse(warehouse)
                .totalItems(cartDto.getTotalItems())
                .subtotal(cartDto.getSubtotal())
                .shippingFee(cartDto.getShippingFee())
                .taxAmount(cartDto.getTaxAmount())
                .totalAmount(cartDto.getTotalAmount())
                .orderStatus(OrderStatus.CONFIRMED)
                .paymentStatus("PAID")
                .customerNotes(request.getCustomerNotes())
                .build();

        order = orderRepository.save(order);

        // Save order items
        List<OrderItem> orderItems = new ArrayList<>();
        for (CartItem item : cart.getItems()) {
            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(item.getProduct())
                    .sku(item.getProduct().getSku())
                    .productName(item.getProduct().getName())
                    .unitPrice(item.getUnitPrice())
                    .quantity(item.getQuantity())
                    .subtotal(item.getUnitPrice().multiply(java.math.BigDecimal.valueOf(item.getQuantity())))
                    .build();
            orderItems.add(orderItemRepository.save(orderItem));
        }
        order.setItems(orderItems);

        // Record Initial Status History
        OrderStatusHistory historyPlaced = OrderStatusHistory.builder()
                .order(order)
                .previousStatus(null)
                .newStatus(OrderStatus.PENDING)
                .comments("Order placed by customer")
                .updatedBy(user.getEmail())
                .build();
        statusHistoryRepository.save(historyPlaced);

        OrderStatusHistory historyConfirmed = OrderStatusHistory.builder()
                .order(order)
                .previousStatus(OrderStatus.PENDING)
                .newStatus(OrderStatus.CONFIRMED)
                .comments("Payment confirmed via " + request.getPaymentMethod())
                .updatedBy("SYSTEM_GATEWAY")
                .build();
        statusHistoryRepository.save(historyConfirmed);

        // Create Shipment entry with unique tracking number
        String trackingNumber = "TRK-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")) + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        Shipment shipment = Shipment.builder()
                .order(order)
                .trackingNumber(trackingNumber)
                .carrier("LogiTrack Express")
                .shippingStatus("PREPARING")
                .estimatedDelivery(LocalDateTime.now().plusDays(4))
                .shippingNotes("Standard courier delivery allocated")
                .build();
        shipment = shipmentRepository.save(shipment);
        order.setShipment(shipment);

        // Create Fulfillment record
        FulfillmentRecord fulfillment = FulfillmentRecord.builder()
                .order(order)
                .warehouse(warehouse)
                .fulfillmentStatus("AWAITING_PROCESSING")
                .notes("New order queued for warehouse pick & pack")
                .build();
        fulfillment = fulfillmentRepository.save(fulfillment);
        order.setFulfillmentRecord(fulfillment);

        // Record simulated payment
        Payment payment = Payment.builder()
                .order(order)
                .transactionRef("TXN-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase())
                .paymentMethod(request.getPaymentMethod())
                .amount(cartDto.getTotalAmount())
                .paymentStatus("SUCCESS")
                .gatewayResponse("Simulated Payment Gateway: APPROVED")
                .build();
        paymentRepository.save(payment);

        // Clear customer cart
        cartService.clearCart(userId);

        return mapToDto(order);
    }

    @Transactional(readOnly = true)
    public Page<OrderDto> getCustomerOrders(Long userId, Pageable pageable) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(this::mapToDto);
    }

    @Transactional(readOnly = true)
    public Page<OrderDto> searchOrdersAdmin(OrderStatus status, String search, Pageable pageable) {
        String cleanSearch = (search != null && !search.isBlank()) ? search.trim() : null;
        return orderRepository.searchOrders(status, cleanSearch, pageable)
                .map(this::mapToDto);
    }

    @Transactional(readOnly = true)
    public OrderDto getOrderById(Long orderId, Long currentUserId, boolean isAdminOrManager) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        if (!isAdminOrManager && !order.getUser().getId().equals(currentUserId)) {
            throw new UnauthorizedException("You do not have access to view this order");
        }

        return mapToDto(order);
    }

    @Transactional
    public OrderDto updateOrderStatus(Long orderId, OrderStatusUpdateRequest request, String updatedBy) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        OrderStatus newStatus;
        try {
            newStatus = OrderStatus.valueOf(request.getNewStatus().trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid order status: " + request.getNewStatus());
        }

        OrderStatus prevStatus = order.getOrderStatus();
        validateStatusTransition(prevStatus, newStatus);

        order.setOrderStatus(newStatus);
        orderRepository.save(order);

        OrderStatusHistory history = OrderStatusHistory.builder()
                .order(order)
                .previousStatus(prevStatus)
                .newStatus(newStatus)
                .comments(request.getComments() != null ? request.getComments() : "Status updated to " + newStatus)
                .updatedBy(updatedBy)
                .build();
        statusHistoryRepository.save(history);

        // Synchronize shipment status if applicable
        if (order.getShipment() != null) {
            Shipment shipment = order.getShipment();
            if (newStatus == OrderStatus.SHIPPED) {
                shipment.setShippingStatus("IN_TRANSIT");
                shipment.setDispatchedAt(LocalDateTime.now());
            } else if (newStatus == OrderStatus.OUT_FOR_DELIVERY) {
                shipment.setShippingStatus("OUT_FOR_DELIVERY");
            } else if (newStatus == OrderStatus.DELIVERED) {
                shipment.setShippingStatus("DELIVERED");
                shipment.setDeliveredAt(LocalDateTime.now());
            }
            shipmentRepository.save(shipment);
        }

        // If cancelled, restore stock
        if (newStatus == OrderStatus.CANCELLED) {
            for (OrderItem item : order.getItems()) {
                inventoryService.restoreStock(
                        order.getWarehouse() != null ? order.getWarehouse().getId() : null,
                        item.getProduct().getId(),
                        item.getQuantity(),
                        order.getOrderNumber(),
                        updatedBy
                );
            }
        }

        return mapToDto(order);
    }

    @Transactional
    public OrderDto cancelOrder(Long orderId, Long currentUserId, String reason) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        if (!order.getUser().getId().equals(currentUserId)) {
            throw new UnauthorizedException("You can only cancel your own orders");
        }

        if (order.getOrderStatus() != OrderStatus.PENDING && order.getOrderStatus() != OrderStatus.CONFIRMED) {
            throw new BadRequestException("Order cannot be cancelled because it is already in " + order.getOrderStatus() + " state");
        }

        return updateOrderStatus(orderId, OrderStatusUpdateRequest.builder()
                .newStatus("CANCELLED")
                .comments("Customer cancelled order. Reason: " + (reason != null ? reason : "Customer request"))
                .build(), order.getUser().getEmail());
    }

    private void validateStatusTransition(OrderStatus from, OrderStatus to) {
        boolean valid = switch (from) {
            case PENDING -> to == OrderStatus.CONFIRMED || to == OrderStatus.CANCELLED;
            case CONFIRMED -> to == OrderStatus.PROCESSING || to == OrderStatus.CANCELLED;
            case PROCESSING -> to == OrderStatus.PACKED;
            case PACKED -> to == OrderStatus.SHIPPED;
            case SHIPPED -> to == OrderStatus.OUT_FOR_DELIVERY;
            case OUT_FOR_DELIVERY -> to == OrderStatus.DELIVERED;
            case DELIVERED -> to == OrderStatus.RETURN_REQUESTED;
            case RETURN_REQUESTED -> to == OrderStatus.RETURNED;
            case CANCELLED, RETURNED -> false;
        };
        if (!valid) {
            throw new BadRequestException("Order cannot transition from " + from + " to " + to);
        }
    }

    public OrderDto mapToDto(Order order) {
        if (order == null) return null;

        List<OrderItemDto> itemDtos = (order.getItems() != null) ? order.getItems().stream()
                .map(item -> OrderItemDto.builder()
                        .id(item.getId())
                        .productId(item.getProduct() != null ? item.getProduct().getId() : null)
                        .sku(item.getSku())
                        .productName(item.getProductName())
                        .imageUrl(item.getProduct() != null ? item.getProduct().getImageUrl() : null)
                        .unitPrice(item.getUnitPrice())
                        .quantity(item.getQuantity())
                        .subtotal(item.getSubtotal())
                        .build())
                .collect(Collectors.toList()) : Collections.emptyList();

        List<OrderStatusHistoryDto> historyDtos = statusHistoryRepository.findByOrderIdOrderByCreatedAtAsc(order.getId())
                .stream()
                .map(h -> OrderStatusHistoryDto.builder()
                        .id(h.getId())
                        .previousStatus(h.getPreviousStatus() != null ? h.getPreviousStatus().name() : null)
                        .newStatus(h.getNewStatus().name())
                        .comments(h.getComments())
                        .updatedBy(h.getUpdatedBy())
                        .createdAt(h.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        Shipment shipment = order.getShipment();

        return OrderDto.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .userId(order.getUser() != null ? order.getUser().getId() : null)
                .customerName(order.getUser() != null ? order.getUser().getFullName() : null)
                .customerEmail(order.getUser() != null ? order.getUser().getEmail() : null)
                .shippingAddress(customerService.mapAddressToDto(order.getShippingAddress()))
                .warehouseId(order.getWarehouse() != null ? order.getWarehouse().getId() : null)
                .warehouseName(order.getWarehouse() != null ? order.getWarehouse().getName() : null)
                .totalItems(order.getTotalItems())
                .subtotal(order.getSubtotal())
                .shippingFee(order.getShippingFee())
                .taxAmount(order.getTaxAmount())
                .totalAmount(order.getTotalAmount())
                .orderStatus(order.getOrderStatus().name())
                .paymentStatus(order.getPaymentStatus())
                .customerNotes(order.getCustomerNotes())
                .trackingNumber(shipment != null ? shipment.getTrackingNumber() : null)
                .carrier(shipment != null ? shipment.getCarrier() : null)
                .shippingStatus(shipment != null ? shipment.getShippingStatus() : null)
                .items(itemDtos)
                .statusHistory(historyDtos)
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }
}
