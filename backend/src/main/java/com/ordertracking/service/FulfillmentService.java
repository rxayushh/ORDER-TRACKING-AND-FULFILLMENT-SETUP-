package com.ordertracking.service;

import com.ordertracking.dto.FulfillmentActionRequest;
import com.ordertracking.dto.FulfillmentDto;
import com.ordertracking.dto.OrderItemDto;
import com.ordertracking.dto.OrderStatusUpdateRequest;
import com.ordertracking.entity.*;
import com.ordertracking.exception.BadRequestException;
import com.ordertracking.exception.ResourceNotFoundException;
import com.ordertracking.repository.FulfillmentRecordRepository;
import com.ordertracking.repository.OrderRepository;
import com.ordertracking.repository.ShipmentRepository;
import com.ordertracking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class FulfillmentService {

    private final FulfillmentRecordRepository fulfillmentRepository;
    private final OrderRepository orderRepository;
    private final OrderService orderService;
    private final ShipmentRepository shipmentRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public Page<FulfillmentDto> getFulfillmentQueue(Long warehouseId, String status, Pageable pageable) {
        String cleanStatus = (status != null && !status.isBlank()) ? status.trim().toUpperCase() : null;
        return fulfillmentRepository.findByWarehouseAndStatus(warehouseId, cleanStatus, pageable)
                .map(this::mapToDto);
    }

    @Transactional
    public FulfillmentDto processFulfillmentAction(Long orderId, FulfillmentActionRequest request, String performedByEmail) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        FulfillmentRecord record = fulfillmentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Fulfillment record not found for order: " + orderId));

        User user = userRepository.findByEmail(performedByEmail).orElse(null);
        if (user != null) {
            record.setAssignedTo(user);
        }

        String action = request.getAction().trim().toUpperCase();

        switch (action) {
            case "PICK":
                record.setFulfillmentStatus("PICKED");
                record.setPickedAt(LocalDateTime.now());
                orderService.updateOrderStatus(orderId, OrderStatusUpdateRequest.builder()
                        .newStatus(OrderStatus.PROCESSING.name())
                        .comments("Products picked from warehouse bins by " + performedByEmail)
                        .build(), performedByEmail);
                break;

            case "PACK":
                record.setFulfillmentStatus("PACKED");
                record.setPackedAt(LocalDateTime.now());
                orderService.updateOrderStatus(orderId, OrderStatusUpdateRequest.builder()
                        .newStatus(OrderStatus.PACKED.name())
                        .comments("Products inspected and packed securely into shipping parcel")
                        .build(), performedByEmail);
                break;

            case "DISPATCH":
                record.setFulfillmentStatus("DISPATCHED");
                record.setDispatchedAt(LocalDateTime.now());

                Shipment shipment = order.getShipment();
                if (shipment != null) {
                    if (request.getCarrier() != null && !request.getCarrier().isBlank()) {
                        shipment.setCarrier(request.getCarrier().trim());
                    }
                    if (request.getTrackingNumber() != null && !request.getTrackingNumber().isBlank()) {
                        shipment.setTrackingNumber(request.getTrackingNumber().trim());
                    }
                    shipment.setShippingStatus("IN_TRANSIT");
                    shipment.setDispatchedAt(LocalDateTime.now());
                    shipmentRepository.save(shipment);
                }

                orderService.updateOrderStatus(orderId, OrderStatusUpdateRequest.builder()
                        .newStatus(OrderStatus.SHIPPED.name())
                        .comments("Package dispatched from warehouse hub. In transit with " + (shipment != null ? shipment.getCarrier() : "carrier"))
                        .build(), performedByEmail);
                break;

            case "OUT_FOR_DELIVERY":
                orderService.updateOrderStatus(orderId, OrderStatusUpdateRequest.builder()
                        .newStatus(OrderStatus.OUT_FOR_DELIVERY.name())
                        .comments("Package has arrived at local facility and is out for doorstep delivery")
                        .build(), performedByEmail);
                break;

            case "DELIVER":
                record.setFulfillmentStatus("COMPLETED");
                orderService.updateOrderStatus(orderId, OrderStatusUpdateRequest.builder()
                        .newStatus(OrderStatus.DELIVERED.name())
                        .comments("Package successfully delivered to customer")
                        .build(), performedByEmail);
                break;

            default:
                throw new BadRequestException("Unknown fulfillment action: " + action + ". Valid actions: PICK, PACK, DISPATCH, OUT_FOR_DELIVERY, DELIVER");
        }

        if (request.getNotes() != null) {
            record.setNotes(request.getNotes());
        }

        return mapToDto(fulfillmentRepository.save(record));
    }

    public FulfillmentDto mapToDto(FulfillmentRecord record) {
        if (record == null) return null;
        Order order = record.getOrder();

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

        String destinationCity = (order.getShippingAddress() != null)
                ? order.getShippingAddress().getCity() + ", " + order.getShippingAddress().getState()
                : "Unknown";

        String tracking = (order.getShipment() != null) ? order.getShipment().getTrackingNumber() : null;

        return FulfillmentDto.builder()
                .id(record.getId())
                .orderId(order.getId())
                .orderNumber(order.getOrderNumber())
                .warehouseId(record.getWarehouse() != null ? record.getWarehouse().getId() : null)
                .warehouseName(record.getWarehouse() != null ? record.getWarehouse().getName() : null)
                .warehouseCode(record.getWarehouse() != null ? record.getWarehouse().getCode() : null)
                .assignedToUserId(record.getAssignedTo() != null ? record.getAssignedTo().getId() : null)
                .assignedToName(record.getAssignedTo() != null ? record.getAssignedTo().getFullName() : null)
                .fulfillmentStatus(record.getFulfillmentStatus())
                .orderStatus(order.getOrderStatus().name())
                .totalItems(order.getTotalItems())
                .items(itemDtos)
                .destinationCity(destinationCity)
                .trackingNumber(tracking)
                .pickedAt(record.getPickedAt())
                .packedAt(record.getPackedAt())
                .dispatchedAt(record.getDispatchedAt())
                .notes(record.getNotes())
                .createdAt(record.getCreatedAt())
                .build();
    }
}
