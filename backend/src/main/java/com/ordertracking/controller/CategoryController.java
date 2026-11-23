package com.ordertracking.controller;

import com.ordertracking.dto.ApiResponse;
import com.ordertracking.dto.CategoryCreateRequest;
import com.ordertracking.dto.CategoryDto;
import com.ordertracking.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Tag(name = "Categories", description = "Product category browsing and management")
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping("/api/categories")
    @Operation(summary = "Get all product categories")
    public ResponseEntity<ApiResponse<List<CategoryDto>>> getCategories() {
        return ResponseEntity.ok(ApiResponse.success(categoryService.getAllCategories()));
    }

    @GetMapping("/api/categories/{id}")
    @Operation(summary = "Get category by ID")
    public ResponseEntity<ApiResponse<CategoryDto>> getCategoryById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(categoryService.getCategoryById(id)));
    }

    @PostMapping("/api/admin/categories")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new product category")
    public ResponseEntity<ApiResponse<CategoryDto>> createCategory(@Valid @RequestBody CategoryCreateRequest request) {
        CategoryDto created = categoryService.createCategory(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Category created successfully", created));
    }

    @PutMapping("/api/admin/categories/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update a product category")
    public ResponseEntity<ApiResponse<CategoryDto>> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryCreateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Category updated", categoryService.updateCategory(id, request)));
    }

    @DeleteMapping("/api/admin/categories/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a category that has no products")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.success("Category deleted", null));
    }
}
