package com.ordertracking;

import com.ordertracking.dto.CategoryCreateRequest;
import com.ordertracking.entity.Category;
import com.ordertracking.exception.BadRequestException;
import com.ordertracking.repository.CategoryRepository;
import com.ordertracking.repository.ProductRepository;
import com.ordertracking.service.CategoryService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CategoryServiceTest {

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private CategoryService categoryService;

    @Test
    void deleteCategoryRejectsWhenProductsExist() {
        Category category = Category.builder().id(4L).name("Electronics").slug("electronics").build();
        when(categoryRepository.findById(4L)).thenReturn(Optional.of(category));
        when(productRepository.countByCategoryId(4L)).thenReturn(2L);

        assertThrows(BadRequestException.class, () -> categoryService.deleteCategory(4L));
        verify(categoryRepository, never()).delete(category);
    }

    @Test
    void updateCategoryRejectsDuplicateName() {
        Category category = Category.builder().id(4L).name("Electronics").slug("electronics").build();
        when(categoryRepository.findById(4L)).thenReturn(Optional.of(category));
        when(categoryRepository.existsByNameAndIdNot("Apparel", 4L)).thenReturn(true);

        CategoryCreateRequest request = CategoryCreateRequest.builder().name("Apparel").build();
        assertThrows(BadRequestException.class, () -> categoryService.updateCategory(4L, request));
    }
}
