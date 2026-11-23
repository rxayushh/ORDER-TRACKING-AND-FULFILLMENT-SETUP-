package com.ordertracking.service;

import com.ordertracking.dto.AdminUserDto;
import com.ordertracking.dto.AdminUserUpdateRequest;
import com.ordertracking.entity.RoleName;
import com.ordertracking.entity.User;
import com.ordertracking.exception.BadRequestException;
import com.ordertracking.exception.ResourceNotFoundException;
import com.ordertracking.repository.RoleRepository;
import com.ordertracking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminUserService {
    private final UserRepository users;
    private final RoleRepository roles;

    @Transactional(readOnly = true)
    public Page<AdminUserDto> search(String search, Pageable pageable) {
        String term = search == null || search.isBlank() ? null : search.trim();
        return users.searchAllUsers(term, pageable).map(this::toDto);
    }

    @Transactional
    public AdminUserDto update(Long id, AdminUserUpdateRequest request, Long actingUserId) {
        User user = users.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        boolean currentlyAdmin = user.getRoles().stream().anyMatch(r -> r.getName() == RoleName.ROLE_ADMIN);
        boolean remainsAdmin = request.getRoles().contains(RoleName.ROLE_ADMIN);
        boolean enabled = Boolean.TRUE.equals(request.getEnabled());

        if (id.equals(actingUserId) && (!enabled || !remainsAdmin)) {
            throw new BadRequestException("You cannot disable your own account or remove your admin role");
        }
        if (currentlyAdmin && (!remainsAdmin || !enabled) && users.countEnabledByRole(RoleName.ROLE_ADMIN) <= 1) {
            throw new BadRequestException("The last enabled administrator cannot be removed or disabled");
        }

        user.setRoles(request.getRoles().stream()
                .map(roleName -> roles.findByName(roleName)
                        .orElseThrow(() -> new BadRequestException("Role is not configured: " + roleName)))
                .collect(Collectors.toSet()));
        user.setEnabled(enabled);
        return toDto(users.save(user));
    }

    private AdminUserDto toDto(User user) {
        return AdminUserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phoneNumber(user.getPhoneNumber())
                .enabled(user.getEnabled())
                .roles(user.getRoles().stream().map(role -> role.getName().name()).sorted().toList())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
