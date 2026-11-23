package com.ordertracking.dto;

import com.ordertracking.entity.RoleName;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.Set;

@Data
public class AdminUserUpdateRequest {
    @NotEmpty(message = "At least one role is required")
    private Set<RoleName> roles;

    @NotNull(message = "Enabled state is required")
    private Boolean enabled;
}
