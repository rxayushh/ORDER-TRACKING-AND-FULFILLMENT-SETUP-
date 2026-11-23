package com.ordertracking.controller;

import com.ordertracking.dto.AddToCartRequest;
import com.ordertracking.dto.ApiResponse;
import com.ordertracking.dto.CartDto;
import com.ordertracking.dto.UpdateCartItemRequest;
import com.ordertracking.security.UserPrincipal;
import com.ordertracking.service.CartService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
@Tag(name = "Shopping Cart", description = "Add, update, remove items, and live total calculation")
public class CartController {

    private final CartService cartService;

    @GetMapping
    @Operation(summary = "Get current customer's shopping cart")
    public ResponseEntity<ApiResponse<CartDto>> getCart(@AuthenticationPrincipal UserPrincipal principal) {
        CartDto cart = cartService.getCartDto(principal.getId());
        return ResponseEntity.ok(ApiResponse.success(cart));
    }

    @PostMapping("/items")
    @Operation(summary = "Add a product to cart")
    public ResponseEntity<ApiResponse<CartDto>> addToCart(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody AddToCartRequest request) {
        CartDto updated = cartService.addToCart(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Item added to cart", updated));
    }

    @PutMapping("/items/{itemId}")
    @Operation(summary = "Update quantity of a cart item")
    public ResponseEntity<ApiResponse<CartDto>> updateCartItem(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long itemId,
            @Valid @RequestBody UpdateCartItemRequest request) {
        CartDto updated = cartService.updateCartItem(principal.getId(), itemId, request);
        return ResponseEntity.ok(ApiResponse.success("Cart updated", updated));
    }

    @DeleteMapping("/items/{itemId}")
    @Operation(summary = "Remove an item from cart")
    public ResponseEntity<ApiResponse<CartDto>> removeCartItem(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long itemId) {
        CartDto updated = cartService.removeCartItem(principal.getId(), itemId);
        return ResponseEntity.ok(ApiResponse.success("Item removed from cart", updated));
    }

    @DeleteMapping
    @Operation(summary = "Clear all items from cart")
    public ResponseEntity<ApiResponse<Void>> clearCart(@AuthenticationPrincipal UserPrincipal principal) {
        cartService.clearCart(principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Cart cleared", null));
    }
}
