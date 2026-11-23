package com.ordertracking.controller;

import com.ordertracking.dto.*;
import com.ordertracking.security.UserPrincipal;
import com.ordertracking.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Tag(name = "Analytics & Dashboards", description = "Role-specific statistical feeds and charts")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin summary metrics, revenue, and charts")
    public ResponseEntity<ApiResponse<AdminDashboardDto>> getAdminDashboard() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getAdminDashboard()));
    }

    @GetMapping("/warehouse")
    @PreAuthorize("hasAnyRole('WAREHOUSE_MANAGER', 'ADMIN')")
    @Operation(summary = "Warehouse metrics, packing status, and inventory alerts")
    public ResponseEntity<ApiResponse<WarehouseDashboardDto>> getWarehouseDashboard(
            @RequestParam(required = false) Long warehouseId) {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getWarehouseDashboard(warehouseId)));
    }

    @GetMapping("/customer")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Operation(summary = "Customer order metrics and recent shipment status")
    public ResponseEntity<ApiResponse<CustomerDashboardDto>> getCustomerDashboard(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getCustomerDashboard(principal.getId())));
    }
}
