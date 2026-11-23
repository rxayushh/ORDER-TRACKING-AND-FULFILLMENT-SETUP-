package com.ordertracking.service;

import com.ordertracking.dto.OrderStatusHistoryDto;
import com.ordertracking.dto.TimelineStepDto;
import com.ordertracking.dto.TrackingDetailDto;
import com.ordertracking.entity.Order;
import com.ordertracking.entity.OrderStatus;
import com.ordertracking.entity.OrderStatusHistory;
import com.ordertracking.entity.Shipment;
import com.ordertracking.exception.ResourceNotFoundException;
import com.ordertracking.exception.UnauthorizedException;
import com.ordertracking.repository.OrderRepository;
import com.ordertracking.repository.OrderStatusHistoryRepository;
import com.ordertracking.repository.ShipmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TrackingService {

    private final ShipmentRepository shipmentRepository;
    private final OrderRepository orderRepository;
    private final OrderStatusHistoryRepository historyRepository;

    @Transactional(readOnly = true)
    public TrackingDetailDto getTrackingByNumber(String trackingNumber) {
        Shipment shipment = shipmentRepository.findByTrackingNumber(trackingNumber.trim())
                .orElseThrow(() -> new ResourceNotFoundException("No shipment found with tracking number: " + trackingNumber));

        return buildTrackingDetail(shipment.getOrder(), shipment);
    }

    @Transactional(readOnly = true)
    public TrackingDetailDto getTrackingByOrderId(Long orderId, Long currentUserId, boolean privileged) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
        if (!privileged && !order.getUser().getId().equals(currentUserId)) {
            throw new UnauthorizedException("You do not have access to view this order tracking information");
        }
        Shipment shipment = order.getShipment();
        if (shipment == null) {
            shipment = shipmentRepository.findByOrderId(orderId)
                    .orElseThrow(() -> new ResourceNotFoundException("No shipment attached to order: " + orderId));
        }
        return buildTrackingDetail(order, shipment);
    }

    private TrackingDetailDto buildTrackingDetail(Order order, Shipment shipment) {
        List<OrderStatusHistory> histories = historyRepository.findByOrderIdOrderByCreatedAtAsc(order.getId());

        Map<OrderStatus, LocalDateTime> statusTimestamps = new HashMap<>();
        for (OrderStatusHistory h : histories) {
            statusTimestamps.putIfAbsent(h.getNewStatus(), h.getCreatedAt());
        }

        OrderStatus currentStatus = order.getOrderStatus();

        List<TimelineStepDto> timeline = new ArrayList<>();

        // 7 Canonical Milestones
        OrderStatus[] milestones = {
                OrderStatus.PENDING,
                OrderStatus.CONFIRMED,
                OrderStatus.PROCESSING,
                OrderStatus.PACKED,
                OrderStatus.SHIPPED,
                OrderStatus.OUT_FOR_DELIVERY,
                OrderStatus.DELIVERED
        };

        String[] labels = {
                "Order Placed",
                "Order Confirmed",
                "Processing & Picking",
                "Packed & Quality Checked",
                "Shipped & In Transit",
                "Out for Delivery",
                "Delivered"
        };

        String[] descriptions = {
                "Order received and registered in system",
                "Payment verified and inventory allocated",
                "Warehouse personnel picking items from storage racks",
                "Items securely packaged and shipping label generated",
                "Carrier picked up package from warehouse distribution center",
                "Courier out for delivery to destination doorstep",
                "Package delivered and verified"
        };

        int currentRank = getStatusRank(currentStatus);

        for (int i = 0; i < milestones.length; i++) {
            OrderStatus m = milestones[i];
            int milestoneRank = getStatusRank(m);

            boolean isCompleted = currentRank >= milestoneRank && currentStatus != OrderStatus.CANCELLED;
            boolean isCurrent = currentStatus == m;

            LocalDateTime timestamp = statusTimestamps.get(m);
            if (timestamp == null && isCompleted && i > 0) {
                timestamp = statusTimestamps.get(milestones[i - 1]);
            }

            timeline.add(TimelineStepDto.builder()
                    .step(m.name())
                    .label(labels[i])
                    .description(descriptions[i])
                    .timestamp(timestamp)
                    .isCompleted(isCompleted)
                    .isCurrent(isCurrent)
                    .build());
        }

        List<OrderStatusHistoryDto> logs = histories.stream()
                .map(h -> OrderStatusHistoryDto.builder()
                        .id(h.getId())
                        .previousStatus(h.getPreviousStatus() != null ? h.getPreviousStatus().name() : null)
                        .newStatus(h.getNewStatus().name())
                        .comments(h.getComments())
                        // Public tracking must not disclose employee or customer emails.
                        .updatedBy("OrderTrack operations")
                        .createdAt(h.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        String origin = (order.getWarehouse() != null)
                ? order.getWarehouse().getName() + " (" + order.getWarehouse().getLocation() + ")"
                : "Central Hub";

        String city = (order.getShippingAddress() != null) ? order.getShippingAddress().getCity() : "Protected";
        String state = (order.getShippingAddress() != null) ? order.getShippingAddress().getState() : "Protected";

        return TrackingDetailDto.builder()
                .trackingNumber(shipment.getTrackingNumber())
                .orderNumber(order.getOrderNumber())
                .carrier(shipment.getCarrier())
                .currentStatus(order.getOrderStatus().name())
                .estimatedDelivery(shipment.getEstimatedDelivery())
                .dispatchedAt(shipment.getDispatchedAt())
                .deliveredAt(shipment.getDeliveredAt())
                .originWarehouse(origin)
                .destinationCity(city)
                .destinationState(state)
                .totalItems(order.getTotalItems())
                .timeline(timeline)
                .statusLogs(logs)
                .build();
    }

    private int getStatusRank(OrderStatus status) {
        return switch (status) {
            case PENDING -> 1;
            case CONFIRMED -> 2;
            case PROCESSING -> 3;
            case PACKED -> 4;
            case SHIPPED -> 5;
            case OUT_FOR_DELIVERY -> 6;
            case DELIVERED -> 7;
            case RETURN_REQUESTED -> 8;
            case RETURNED -> 9;
            case CANCELLED -> -1;
        };
    }
}
