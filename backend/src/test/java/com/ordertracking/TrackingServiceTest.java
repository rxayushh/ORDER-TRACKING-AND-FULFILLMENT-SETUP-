package com.ordertracking;

import com.ordertracking.dto.TrackingDetailDto;
import com.ordertracking.entity.*;
import com.ordertracking.repository.OrderStatusHistoryRepository;
import com.ordertracking.repository.ShipmentRepository;
import com.ordertracking.repository.OrderRepository;
import com.ordertracking.exception.UnauthorizedException;
import com.ordertracking.service.TrackingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TrackingServiceTest {

    @Mock
    private ShipmentRepository shipmentRepository;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private OrderStatusHistoryRepository historyRepository;

    @InjectMocks
    private TrackingService trackingService;

    private Order order;
    private Shipment shipment;

    @BeforeEach
    void setUp() {
        Warehouse warehouse = Warehouse.builder()
                .id(1L)
                .code("WH-MUM-01")
                .name("West Hub Central Logistics")
                .location("Mumbai")
                .build();

        CustomerAddress address = CustomerAddress.builder()
                .city("Mumbai")
                .state("Maharashtra")
                .build();

        order = Order.builder()
                .id(1001L)
                .orderNumber("ORD-20261121-0001")
                .orderStatus(OrderStatus.SHIPPED)
                .warehouse(warehouse)
                .shippingAddress(address)
                .totalItems(2)
                .totalAmount(BigDecimal.valueOf(2500.00))
                .build();

        shipment = Shipment.builder()
                .id(501L)
                .order(order)
                .trackingNumber("TRK-20261121-99887766")
                .carrier("LogiTrack Express")
                .shippingStatus("IN_TRANSIT")
                .estimatedDelivery(LocalDateTime.now().plusDays(2))
                .build();
    }

    @Test
    void testGetTrackingByNumberSuccess() {
        when(shipmentRepository.findByTrackingNumber("TRK-20261121-99887766")).thenReturn(Optional.of(shipment));
        when(historyRepository.findByOrderIdOrderByCreatedAtAsc(1001L)).thenReturn(List.of(
                OrderStatusHistory.builder().order(order).previousStatus(null).newStatus(OrderStatus.PENDING).createdAt(LocalDateTime.now().minusDays(1)).build(),
                OrderStatusHistory.builder().order(order).previousStatus(OrderStatus.PENDING).newStatus(OrderStatus.CONFIRMED).createdAt(LocalDateTime.now().minusHours(20)).build(),
                OrderStatusHistory.builder().order(order).previousStatus(OrderStatus.CONFIRMED).newStatus(OrderStatus.SHIPPED).createdAt(LocalDateTime.now().minusHours(5)).build()
        ));

        TrackingDetailDto tracking = trackingService.getTrackingByNumber("TRK-20261121-99887766");

        assertNotNull(tracking);
        assertEquals("TRK-20261121-99887766", tracking.getTrackingNumber());
        assertEquals("ORD-20261121-0001", tracking.getOrderNumber());
        assertEquals("SHIPPED", tracking.getCurrentStatus());
        assertEquals("LogiTrack Express", tracking.getCarrier());
        assertEquals("Mumbai", tracking.getDestinationCity());
        assertFalse(tracking.getTimeline().isEmpty());
    }

    @Test
    void testOrderTrackingRejectsAnotherCustomersOrder() {
        order.setUser(User.builder().id(7L).build());
        when(orderRepository.findById(1001L)).thenReturn(Optional.of(order));

        assertThrows(UnauthorizedException.class,
                () -> trackingService.getTrackingByOrderId(1001L, 99L, false));
        verify(shipmentRepository, never()).findByOrderId(anyLong());
    }
}
