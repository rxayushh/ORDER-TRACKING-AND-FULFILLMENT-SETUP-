package com.ordertracking.controller;

import com.ordertracking.dto.AdminUserDto;
import com.ordertracking.dto.AdminUserUpdateRequest;
import com.ordertracking.dto.ApiResponse;
import com.ordertracking.security.UserPrincipal;
import com.ordertracking.service.AdminUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminUserController {
    private final AdminUserService adminUserService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<AdminUserDto>>> search(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<AdminUserDto> users = adminUserService.search(
                search, PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100), Sort.by("createdAt").descending()));
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminUserDto>> update(
            @PathVariable Long id,
            @Valid @RequestBody AdminUserUpdateRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success("User permissions updated",
                adminUserService.update(id, request, principal.getId())));
    }
}
