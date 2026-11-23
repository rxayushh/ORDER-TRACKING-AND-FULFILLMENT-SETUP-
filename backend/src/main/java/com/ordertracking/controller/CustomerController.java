package com.ordertracking.controller;

import com.ordertracking.dto.AddressCreateRequest;
import com.ordertracking.dto.ApiResponse;
import com.ordertracking.dto.CustomerAddressDto;
import com.ordertracking.dto.CustomerProfileDto;
import com.ordertracking.dto.CustomerSummaryDto;
import com.ordertracking.dto.ProfileUpdateRequest;
import com.ordertracking.security.UserPrincipal;
import com.ordertracking.service.CustomerService;
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

import java.util.List;

@RestController
@RequiredArgsConstructor
@Tag(name = "Customer Management", description = "Addresses, customer profiles, and admin directory")
public class CustomerController {

    private final CustomerService customerService;

    @GetMapping("/api/customer/profile")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get the signed-in user's profile")
    public ResponseEntity<ApiResponse<CustomerProfileDto>> getProfile(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success(customerService.getProfile(principal.getId())));
    }

    @PutMapping("/api/customer/profile")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Update the signed-in user's name and phone number")
    public ResponseEntity<ApiResponse<CustomerProfileDto>> updateProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ProfileUpdateRequest request) {
        CustomerProfileDto updated = customerService.updateProfile(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated", updated));
    }

    @GetMapping("/api/customer/addresses")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Operation(summary = "Get saved shipping addresses for current customer")
    public ResponseEntity<ApiResponse<List<CustomerAddressDto>>> getAddresses(@AuthenticationPrincipal UserPrincipal principal) {
        List<CustomerAddressDto> addresses = customerService.getCustomerAddresses(principal.getId());
        return ResponseEntity.ok(ApiResponse.success(addresses));
    }

    @PostMapping("/api/customer/addresses")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Operation(summary = "Add a new delivery address")
    public ResponseEntity<ApiResponse<CustomerAddressDto>> addAddress(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody AddressCreateRequest request) {
        CustomerAddressDto created = customerService.addAddress(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Address added successfully", created));
    }

    @DeleteMapping("/api/customer/addresses/{id}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Operation(summary = "Delete a delivery address")
    public ResponseEntity<ApiResponse<Void>> deleteAddress(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        customerService.deleteAddress(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Address removed successfully", null));
    }

    @PutMapping("/api/customer/addresses/{id}/default")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Operation(summary = "Mark a saved address as the default delivery address")
    public ResponseEntity<ApiResponse<CustomerAddressDto>> setDefaultAddress(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        CustomerAddressDto updated = customerService.setDefaultAddress(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Default address updated", updated));
    }

    @GetMapping("/api/admin/customers")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Search registered customers list (Admin only)")
    public ResponseEntity<ApiResponse<Page<CustomerSummaryDto>>> getCustomers(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<CustomerSummaryDto> customers = customerService.getCustomersForAdmin(search, PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return ResponseEntity.ok(ApiResponse.success(customers));
    }
}
