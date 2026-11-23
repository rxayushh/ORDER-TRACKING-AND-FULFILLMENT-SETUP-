package com.ordertracking.service;

import com.ordertracking.dto.ProductCreateRequest;
import com.ordertracking.dto.ProductDto;
import com.ordertracking.dto.ProductUpdateRequest;
import com.ordertracking.entity.Category;
import com.ordertracking.entity.Product;
import com.ordertracking.entity.Warehouse;
import com.ordertracking.entity.WarehouseInventory;
import com.ordertracking.exception.BadRequestException;
import com.ordertracking.exception.ResourceNotFoundException;
import com.ordertracking.repository.CategoryRepository;
import com.ordertracking.repository.ProductRepository;
import com.ordertracking.repository.WarehouseInventoryRepository;
import com.ordertracking.repository.WarehouseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final WarehouseRepository warehouseRepository;
    private final WarehouseInventoryRepository warehouseInventoryRepository;

    @Transactional(readOnly = true)
    public Page<ProductDto> searchProducts(Long categoryId, String search, String status, Pageable pageable) {
        String cleanSearch = (search != null && !search.isBlank()) ? search.trim() : null;
        String cleanStatus = (status != null && !status.isBlank()) ? status.trim().toUpperCase() : null;
        return productRepository.searchProducts(categoryId, cleanSearch, cleanStatus, pageable)
                .map(this::mapToDto);
    }

    @Transactional(readOnly = true)
    public ProductDto getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        return mapToDto(product);
    }

    @Transactional(readOnly = true)
    public List<ProductDto> getLowStockProducts() {
        return productRepository.findLowStockProducts().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProductDto createProduct(ProductCreateRequest request) {
        if (productRepository.existsBySku(request.getSku().trim().toUpperCase())) {
            throw new BadRequestException("SKU already exists: " + request.getSku());
        }

        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));
        }

        Warehouse stockWarehouse = null;
        if (request.getStockQuantity() > 0) {
            if (request.getInitialWarehouseId() != null) {
                stockWarehouse = warehouseRepository.findById(request.getInitialWarehouseId())
                        .filter(w -> Boolean.TRUE.equals(w.getIsActive()))
                        .orElseThrow(() -> new BadRequestException("Selected warehouse does not exist or is inactive"));
            } else {
                stockWarehouse = warehouseRepository.findByIsActiveTrue().stream().findFirst()
                        .orElseThrow(() -> new BadRequestException("Create an active warehouse before adding product stock"));
            }
        }

        Product product = Product.builder()
                .category(category)
                .sku(request.getSku().trim().toUpperCase())
                .name(request.getName().trim())
                .description(request.getDescription())
                .price(request.getPrice())
                .stockQuantity(request.getStockQuantity())
                .lowStockThreshold(request.getLowStockThreshold() != null ? request.getLowStockThreshold() : 10)
                .imageUrl(request.getImageUrl())
                .status("ACTIVE")
                .build();

        product = productRepository.save(product);

        if (stockWarehouse != null) {
            WarehouseInventory inventory = WarehouseInventory.builder()
                    .warehouse(stockWarehouse)
                    .product(product)
                    .availableQuantity(request.getStockQuantity())
                    .reservedQuantity(0)
                    .build();
            warehouseInventoryRepository.save(inventory);
        }

        return mapToDto(product);
    }

    @Transactional
    public ProductDto updateProduct(Long id, ProductUpdateRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));
            product.setCategory(category);
        }

        product.setName(request.getName().trim());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        // Stock is managed through warehouse inventory adjustments so the
        // catalog total cannot drift from its warehouse allocations.
        if (request.getLowStockThreshold() != null) {
            product.setLowStockThreshold(request.getLowStockThreshold());
        }
        if (request.getImageUrl() != null) {
            product.setImageUrl(request.getImageUrl());
        }
        if (request.getStatus() != null) {
            product.setStatus(request.getStatus().trim().toUpperCase());
        }

        return mapToDto(productRepository.save(product));
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        // Soft-delete to maintain historical order integrity
        product.setStatus("ARCHIVED");
        productRepository.save(product);
    }

    public ProductDto mapToDto(Product product) {
        if (product == null) return null;
        return ProductDto.builder()
                .id(product.getId())
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .sku(product.getSku())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .stockQuantity(product.getStockQuantity())
                .lowStockThreshold(product.getLowStockThreshold())
                .imageUrl(product.getImageUrl())
                .status(product.getStatus())
                .isLowStock(product.getStockQuantity() <= product.getLowStockThreshold())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }
}
