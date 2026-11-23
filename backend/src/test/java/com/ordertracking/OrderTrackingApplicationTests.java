package com.ordertracking;

import com.ordertracking.dto.AddToCartRequest;
import com.ordertracking.dto.CheckoutRequest;
import com.ordertracking.repository.CartItemRepository;
import com.ordertracking.repository.CustomerAddressRepository;
import com.ordertracking.repository.ProductRepository;
import com.ordertracking.repository.UserRepository;
import com.ordertracking.service.CartService;
import com.ordertracking.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest
@ActiveProfiles("dev")
class OrderTrackingApplicationTests {

    @Autowired private CartService cartService;
    @Autowired private CartItemRepository cartItemRepository;
    @Autowired private CustomerAddressRepository addressRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private OrderService orderService;

    @Test
    void contextLoads() {
        // Verifies Spring ApplicationContext starts cleanly with all beans
    }

    @Test
    void removingAndClearingCartItemsUpdatesTheOwningCollectionAndDatabase() {
        Long userId = userRepository.findByEmail("customer@ordertrack.com").orElseThrow().getId();
        var cart = cartService.getOrCreateCart(userId);
        var added = cartService.addToCart(userId, AddToCartRequest.builder().productId(1L).quantity(1).build());

        var removed = cartService.removeCartItem(userId, added.getItems().getFirst().getId());
        assertEquals(0, removed.getTotalItems());
        assertEquals(0L, cartItemRepository.countByCartId(cart.getId()));

        cartService.addToCart(userId, AddToCartRequest.builder().productId(1L).quantity(1).build());
        cartService.clearCart(userId);
        assertEquals(0, cartService.getCartDto(userId).getTotalItems());
        assertEquals(0L, cartItemRepository.countByCartId(cart.getId()));
    }

    @Test
    void checkoutReservesStockAndCancellationRestoresItExactlyOnce() {
        Long userId = userRepository.findByEmail("customer@ordertrack.com").orElseThrow().getId();
        Long addressId = addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(userId).getFirst().getId();
        int stockBefore = productRepository.findById(1L).orElseThrow().getStockQuantity();
        cartService.clearCart(userId);
        cartService.addToCart(userId, AddToCartRequest.builder().productId(1L).quantity(1).build());

        var order = orderService.checkout(userId, CheckoutRequest.builder()
                .shippingAddressId(addressId)
                .paymentMethod("SIMULATED_CARD")
                .build());
        assertEquals("CONFIRMED", order.getOrderStatus());
        assertEquals(stockBefore - 1, productRepository.findById(1L).orElseThrow().getStockQuantity());
        assertEquals(0, cartService.getCartDto(userId).getTotalItems());

        var cancelled = orderService.cancelOrder(order.getId(), userId, "Integration test cancellation");
        assertEquals("CANCELLED", cancelled.getOrderStatus());
        assertEquals(stockBefore, productRepository.findById(1L).orElseThrow().getStockQuantity());
        assertEquals(0, cartService.getCartDto(userId).getTotalItems());
    }
}
