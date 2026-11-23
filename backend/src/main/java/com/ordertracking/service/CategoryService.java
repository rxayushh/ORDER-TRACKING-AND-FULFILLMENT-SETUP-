package com.ordertracking.service;

import com.ordertracking.dto.CategoryCreateRequest;
import com.ordertracking.dto.CategoryDto;
import com.ordertracking.entity.Category;
import com.ordertracking.exception.BadRequestException;
import com.ordertracking.exception.ResourceNotFoundException;
import com.ordertracking.repository.CategoryRepository;
import com.ordertracking.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    @Transactional(readOnly = true)
    public List<CategoryDto> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CategoryDto getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        return mapToDto(category);
    }

    @Transactional
    public CategoryDto createCategory(CategoryCreateRequest request) {
        if (categoryRepository.existsByName(request.getName().trim())) {
            throw new BadRequestException("Category name already exists: " + request.getName());
        }

        String slug = request.getSlug();
        if (slug == null || slug.isBlank()) {
            slug = request.getName().toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("(^-|-$)", "");
        }

        if (categoryRepository.existsBySlug(slug)) {
            slug = slug + "-" + System.currentTimeMillis();
        }

        Category category = Category.builder()
                .name(request.getName().trim())
                .slug(slug)
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .build();

        return mapToDto(categoryRepository.save(category));
    }

    @Transactional
    public CategoryDto updateCategory(Long id, CategoryCreateRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        String name = request.getName().trim();
        if (Boolean.TRUE.equals(categoryRepository.existsByNameAndIdNot(name, id))) {
            throw new BadRequestException("Category name already exists: " + name);
        }

        String slug = request.getSlug();
        if (slug == null || slug.isBlank()) {
            slug = name.toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("(^-|-$)", "");
        }
        if (Boolean.TRUE.equals(categoryRepository.existsBySlugAndIdNot(slug, id))) {
            slug = slug + "-" + System.currentTimeMillis();
        }

        category.setName(name);
        category.setSlug(slug);
        category.setDescription(request.getDescription());
        category.setImageUrl(request.getImageUrl());
        return mapToDto(categoryRepository.save(category));
    }

    @Transactional
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        if (productRepository.countByCategoryId(id) > 0) {
            throw new BadRequestException("Category still has products. Reassign or archive those products before deleting it.");
        }
        categoryRepository.delete(category);
    }

    public CategoryDto mapToDto(Category category) {
        if (category == null) return null;
        return CategoryDto.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .description(category.getDescription())
                .imageUrl(category.getImageUrl())
                .createdAt(category.getCreatedAt())
                .build();
    }
}
