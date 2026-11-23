package com.ordertracking;

import com.ordertracking.dto.AdminUserUpdateRequest;
import com.ordertracking.entity.Role;
import com.ordertracking.entity.RoleName;
import com.ordertracking.entity.User;
import com.ordertracking.exception.BadRequestException;
import com.ordertracking.repository.RoleRepository;
import com.ordertracking.repository.UserRepository;
import com.ordertracking.service.AdminUserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminUserServiceTest {
    @Mock UserRepository users;
    @Mock RoleRepository roles;
    @InjectMocks AdminUserService service;

    @Test
    void preventsRemovingTheLastEnabledAdmin() {
        Role admin = Role.builder().name(RoleName.ROLE_ADMIN).build();
        User user = User.builder().id(1L).enabled(true).roles(new HashSet<>(Set.of(admin))).build();
        AdminUserUpdateRequest request = new AdminUserUpdateRequest();
        request.setRoles(Set.of(RoleName.ROLE_CUSTOMER));
        request.setEnabled(true);
        when(users.findById(1L)).thenReturn(Optional.of(user));
        when(users.countEnabledByRole(RoleName.ROLE_ADMIN)).thenReturn(1L);

        assertThrows(BadRequestException.class, () -> service.update(1L, request, 2L));
        verify(users, never()).save(any());
    }

    @Test
    void preventsAnAdminFromDisablingTheirOwnAccount() {
        Role admin = Role.builder().name(RoleName.ROLE_ADMIN).build();
        User user = User.builder().id(1L).enabled(true).roles(new HashSet<>(Set.of(admin))).build();
        AdminUserUpdateRequest request = new AdminUserUpdateRequest();
        request.setRoles(Set.of(RoleName.ROLE_ADMIN));
        request.setEnabled(false);
        when(users.findById(1L)).thenReturn(Optional.of(user));

        assertThrows(BadRequestException.class, () -> service.update(1L, request, 1L));
        verify(users, never()).save(any());
    }
}
