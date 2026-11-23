package com.ordertracking.repository;

import com.ordertracking.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findBySlug(String slug);
    Boolean existsByName(String name);
    Boolean existsBySlug(String slug);
    Boolean existsByNameAndIdNot(String name, Long id);
    Boolean existsBySlugAndIdNot(String slug, Long id);
}
