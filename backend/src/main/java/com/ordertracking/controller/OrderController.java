package com.ordertracking.controller;

import com.ordertracking.dto.ApiResponse;
import com.ordertracking.dto.CheckoutRequest;
import com.ordertracking.dto.OrderDto;
import com.ordertracking.dto.OrderStatusUpdateRequest;
import com.ordertracking.entity.OrderStatus;
import com.ordertracking.security.UserPrincipal;
import com.ordertracking.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@Tag(name = "Order Lifecycle", description = "Order placement, checkout, order history, and lifecycle transitions")
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/api/orders/checkout")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Operation(summary = "Checkout current shopping cart into a placed & confirmed order")
    public ResponseEntity<ApiResponse<OrderDto>> checkout(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CheckoutRequest request) {
        OrderDto order = orderService.checkout(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Order placed successfully!", order));
    }

    @GetMapping("/api/customer/orders")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Operation(summary = "Get current customer's order history")
    public ResponseEntity<ApiResponse<Page<OrderDto>>> getCustomerOrders(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<OrderDto> orders = orderService.getCustomerOrders(principal.getId(), PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(orders));
    }

    @GetMapping("/api/orders/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get complete order details by order ID")
    public ResponseEntity<ApiResponse<OrderDto>> getOrderById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        boolean isAdminOrManager = principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_WAREHOUSE_MANAGER"));

        OrderDto order = orderService.getOrderById(id, principal.getId(), isAdminOrManager);
        return ResponseEntity.ok(ApiResponse.success(order));
    }

    @PostMapping("/api/orders/{id}/cancel")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Operation(summary = "Cancel an order (valid for PENDING or CONFIRMED state)")
    public ResponseEntity<ApiResponse<OrderDto>> cancelOrder(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestParam(required = false) String reason) {
        OrderDto cancelled = orderService.cancelOrder(id, principal.getId(), reason);
        return ResponseEntity.ok(ApiResponse.success("Order cancelled successfully", cancelled));
    }

    @GetMapping("/api/admin/orders")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_MANAGER')")
    @Operation(summary = "Search and filter all orders across system")
    public ResponseEntity<ApiResponse<Page<OrderDto>>> searchOrdersAdmin(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Sort sort = direction.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Page<OrderDto> orders = orderService.searchOrdersAdmin(status, search, PageRequest.of(page, size, sort));
        return ResponseEntity.ok(ApiResponse.success(orders));
    }

    @PutMapping("/api/orders/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_MANAGER')")
    @Operation(summary = "Update order status with audit log (Admin / Warehouse Manager)")
    public ResponseEntity<ApiResponse<OrderDto>> updateOrderStatus(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody OrderStatusUpdateRequest request) {
        OrderDto updated = orderService.updateOrderStatus(id, request, principal.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Order status updated", updated));
    }
}
