package com.ordertracking.controller;

import com.ordertracking.dto.ApiResponse;
import com.ordertracking.dto.TrackingDetailDto;
import com.ordertracking.security.UserPrincipal;
import com.ordertracking.service.TrackingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

@RestController
@RequiredArgsConstructor
@Tag(name = "Order Tracking", description = "Public tracking lookup & authenticated detailed timeline")
public class TrackingController {

    private final TrackingService trackingService;

    @GetMapping("/api/tracking/{trackingNumber}")
    @Operation(summary = "Public tracking lookup by tracking number (No login required)")
    public ResponseEntity<ApiResponse<TrackingDetailDto>> getTrackingByNumber(@PathVariable String trackingNumber) {
        TrackingDetailDto tracking = trackingService.getTrackingByNumber(trackingNumber);
        return ResponseEntity.ok(ApiResponse.success(tracking));
    }

    @GetMapping("/api/orders/{orderId}/tracking")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get detailed milestone tracking timeline by Order ID")
    public ResponseEntity<ApiResponse<TrackingDetailDto>> getTrackingByOrderId(
            @PathVariable Long orderId,
            @AuthenticationPrincipal UserPrincipal principal) {
        boolean privileged = principal.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN")
                        || authority.getAuthority().equals("ROLE_WAREHOUSE_MANAGER"));
        TrackingDetailDto tracking = trackingService.getTrackingByOrderId(orderId, principal.getId(), privileged);
        return ResponseEntity.ok(ApiResponse.success(tracking));
    }
}
