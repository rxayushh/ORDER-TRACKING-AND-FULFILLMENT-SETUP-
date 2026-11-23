package com.ordertracking.controller;

import com.ordertracking.dto.ApiResponse;
import com.ordertracking.dto.ProductCreateRequest;
import com.ordertracking.dto.ProductDto;
import com.ordertracking.dto.ProductUpdateRequest;
import com.ordertracking.service.ProductService;
import com.ordertracking.security.UserPrincipal;
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
@Tag(name = "Products", description = "Product catalog and administration APIs")
public class ProductController {

    private final ProductService productService;

    @GetMapping("/api/products")
    @Operation(summary = "Search and filter product catalog with pagination")
    public ResponseEntity<ApiResponse<Page<ProductDto>>> getProducts(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String direction,
            @AuthenticationPrincipal UserPrincipal principal) {

        Sort sort = direction.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        boolean admin = principal != null && principal.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));
        String visibleStatus = admin ? status : "ACTIVE";
        Page<ProductDto> products = productService.searchProducts(categoryId, search, visibleStatus,
                PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100), sort));
        return ResponseEntity.ok(ApiResponse.success(products));
    }

    @GetMapping("/api/products/{id}")
    @Operation(summary = "Get single product by ID")
    public ResponseEntity<ApiResponse<ProductDto>> getProductById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        ProductDto product = productService.getProductById(id);
        boolean admin = principal != null && principal.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));
        if (!admin && !"ACTIVE".equalsIgnoreCase(product.getStatus())) {
            throw new com.ordertracking.exception.ResourceNotFoundException("Product not found with id: " + id);
        }
        return ResponseEntity.ok(ApiResponse.success(product));
    }

    @GetMapping("/api/products/low-stock")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_MANAGER')")
    @Operation(summary = "Get list of low stock products (threshold triggered)")
    public ResponseEntity<ApiResponse<List<ProductDto>>> getLowStockProducts() {
        List<ProductDto> products = productService.getLowStockProducts();
        return ResponseEntity.ok(ApiResponse.success(products));
    }

    @PostMapping("/api/admin/products")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new product with initial inventory allocation")
    public ResponseEntity<ApiResponse<ProductDto>> createProduct(@Valid @RequestBody ProductCreateRequest request) {
        ProductDto created = productService.createProduct(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Product created successfully", created));
    }

    @PutMapping("/api/admin/products/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update product details, pricing, and threshold")
    public ResponseEntity<ApiResponse<ProductDto>> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductUpdateRequest request) {
        ProductDto updated = productService.updateProduct(id, request);
        return ResponseEntity.ok(ApiResponse.success("Product updated successfully", updated));
    }

    @DeleteMapping("/api/admin/products/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Archive product (safe soft delete)")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success("Product archived successfully", null));
    }
}
