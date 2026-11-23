package com.ordertracking.repository;

import com.ordertracking.entity.RoleName;
import com.ordertracking.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Boolean existsByEmail(String email);

    @Query("SELECT u FROM User u JOIN u.roles r WHERE r.name = :roleName AND (:search IS NULL OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<User> findByRoleAndSearch(@Param("roleName") RoleName roleName, @Param("search") String search, Pageable pageable);

    @Query("SELECT COUNT(u) FROM User u JOIN u.roles r WHERE r.name = 'ROLE_CUSTOMER'")
    long countCustomers();

    @Query(value = "SELECT DISTINCT u FROM User u WHERE (:search IS NULL OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')))",
            countQuery = "SELECT COUNT(u) FROM User u WHERE (:search IS NULL OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<User> searchAllUsers(@Param("search") String search, Pageable pageable);

    @Query("SELECT COUNT(DISTINCT u.id) FROM User u JOIN u.roles r WHERE r.name = :roleName AND u.enabled = true")
    long countEnabledByRole(@Param("roleName") RoleName roleName);
}
