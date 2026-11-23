package com.ordertracking;

import com.ordertracking.dto.OrderStatusUpdateRequest;
import com.ordertracking.entity.Order;
import com.ordertracking.entity.OrderStatus;
import com.ordertracking.exception.BadRequestException;
import com.ordertracking.repository.*;
import com.ordertracking.service.CartService;
import com.ordertracking.service.CustomerService;
import com.ordertracking.service.InventoryService;
import com.ordertracking.service.OrderService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {
    @Mock OrderRepository orderRepository;
    @Mock OrderItemRepository orderItemRepository;
    @Mock OrderStatusHistoryRepository statusHistoryRepository;
    @Mock CustomerAddressRepository addressRepository;
    @Mock WarehouseRepository warehouseRepository;
    @Mock CartRepository cartRepository;
    @Mock CartItemRepository cartItemRepository;
    @Mock CartService cartService;
    @Mock InventoryService inventoryService;
    @Mock ShipmentRepository shipmentRepository;
    @Mock FulfillmentRecordRepository fulfillmentRepository;
    @Mock PaymentRepository paymentRepository;
    @Mock UserRepository userRepository;
    @Mock CustomerService customerService;

    @InjectMocks OrderService orderService;

    @Test
    void rejectsSkippingRequiredFulfillmentStages() {
        Order order = Order.builder().id(10L).orderStatus(OrderStatus.CONFIRMED).build();
        when(orderRepository.findById(10L)).thenReturn(Optional.of(order));
        OrderStatusUpdateRequest request = OrderStatusUpdateRequest.builder()
                .newStatus("SHIPPED")
                .comments("skip processing and packing")
                .build();

        assertThrows(BadRequestException.class,
                () -> orderService.updateOrderStatus(10L, request, "warehouse@example.com"));
        verify(orderRepository, never()).save(any());
        verify(statusHistoryRepository, never()).save(any());
    }
}
