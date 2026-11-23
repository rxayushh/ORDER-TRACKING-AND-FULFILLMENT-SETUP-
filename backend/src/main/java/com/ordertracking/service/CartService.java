package com.ordertracking.service;

import com.ordertracking.dto.AddToCartRequest;
import com.ordertracking.dto.CartDto;
import com.ordertracking.dto.CartItemDto;
import com.ordertracking.dto.UpdateCartItemRequest;
import com.ordertracking.entity.Cart;
import com.ordertracking.entity.CartItem;
import com.ordertracking.entity.Product;
import com.ordertracking.entity.User;
import com.ordertracking.exception.BadRequestException;
import com.ordertracking.exception.InsufficientStockException;
import com.ordertracking.exception.ResourceNotFoundException;
import com.ordertracking.repository.CartItemRepository;
import com.ordertracking.repository.CartRepository;
import com.ordertracking.repository.ProductRepository;
import com.ordertracking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional
    public Cart getOrCreateCart(Long userId) {
        return cartRepository.findByUserId(userId).orElseGet(() -> {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
            Cart cart = Cart.builder()
                    .user(user)
                    .items(new ArrayList<>())
                    .build();
            return cartRepository.save(cart);
        });
    }

    @Transactional(readOnly = true)
    public CartDto getCartDto(Long userId) {
        Cart cart = getOrCreateCart(userId);
        return mapToDto(cart);
    }

    @Transactional
    public CartDto addToCart(Long userId, AddToCartRequest request) {
        Cart cart = getOrCreateCart(userId);
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + request.getProductId()));

        if (!"ACTIVE".equalsIgnoreCase(product.getStatus())) {
            throw new BadRequestException("Product is currently unavailable");
        }

        Optional<CartItem> existingItem = cartItemRepository.findByCartIdAndProductId(cart.getId(), product.getId());

        int newQuantity = request.getQuantity();
        if (existingItem.isPresent()) {
            newQuantity += existingItem.get().getQuantity();
        }

        if (newQuantity > product.getStockQuantity()) {
            throw new InsufficientStockException("Requested quantity (" + newQuantity + ") exceeds available stock (" + product.getStockQuantity() + ")");
        }

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            item.setQuantity(newQuantity);
            item.setUnitPrice(product.getPrice());
            cartItemRepository.save(item);
        } else {
            CartItem item = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(request.getQuantity())
                    .unitPrice(product.getPrice())
                    .build();
            cartItemRepository.save(item);
        }

        // Refresh cart
        cart = cartRepository.findById(cart.getId()).orElse(cart);
        return mapToDto(cart);
    }

    @Transactional
    public CartDto updateCartItem(Long userId, Long itemId, UpdateCartItemRequest request) {
        Cart cart = getOrCreateCart(userId);
        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with id: " + itemId));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new BadRequestException("Item does not belong to your cart");
        }

        Product product = item.getProduct();
        if (request.getQuantity() > product.getStockQuantity()) {
            throw new InsufficientStockException("Requested quantity (" + request.getQuantity() + ") exceeds available stock (" + product.getStockQuantity() + ")");
        }

        item.setQuantity(request.getQuantity());
        item.setUnitPrice(product.getPrice());
        cartItemRepository.save(item);

        cart = cartRepository.findById(cart.getId()).orElse(cart);
        return mapToDto(cart);
    }

    @Transactional
    public CartDto removeCartItem(Long userId, Long itemId) {
        Cart cart = getOrCreateCart(userId);
        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with id: " + itemId));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new BadRequestException("Item does not belong to your cart");
        }

        cart.getItems().removeIf(cartItem -> cartItem.getId().equals(itemId));
        cart = cartRepository.findById(cart.getId()).orElse(cart);
        return mapToDto(cart);
    }

    @Transactional
    public void clearCart(Long userId) {
        Cart cart = getOrCreateCart(userId);
        cart.getItems().clear();
    }

    public CartDto mapToDto(Cart cart) {
        List<CartItemDto> itemDtos = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;
        int totalItems = 0;

        for (CartItem item : cart.getItems()) {
            BigDecimal lineTotal = item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            subtotal = subtotal.add(lineTotal);
            totalItems += item.getQuantity();

            itemDtos.add(CartItemDto.builder()
                    .id(item.getId())
                    .productId(item.getProduct().getId())
                    .sku(item.getProduct().getSku())
                    .productName(item.getProduct().getName())
                    .imageUrl(item.getProduct().getImageUrl())
                    .unitPrice(item.getUnitPrice())
                    .quantity(item.getQuantity())
                    .subtotal(lineTotal)
                    .availableStock(item.getProduct().getStockQuantity())
                    .build());
        }

        // Standard logistics rate calculation: Free shipping above 2000, else 150; 5% GST
        BigDecimal shippingFee = (subtotal.compareTo(BigDecimal.valueOf(2000)) >= 0 || totalItems == 0)
                ? BigDecimal.ZERO
                : BigDecimal.valueOf(150.00);

        BigDecimal taxAmount = subtotal.multiply(BigDecimal.valueOf(0.05)).setScale(2, RoundingMode.HALF_UP);
        BigDecimal totalAmount = subtotal.add(shippingFee).add(taxAmount);

        return CartDto.builder()
                .id(cart.getId())
                .userId(cart.getUser().getId())
                .items(itemDtos)
                .totalItems(totalItems)
                .subtotal(subtotal)
                .shippingFee(shippingFee)
                .taxAmount(taxAmount)
                .totalAmount(totalAmount)
                .build();
    }
}
