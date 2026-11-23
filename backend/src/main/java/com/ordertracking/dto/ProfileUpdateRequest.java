package com.ordertracking.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileUpdateRequest {

    @NotBlank(message = "Full name is required")
    @Size(max = 150, message = "Full name must be 150 characters or fewer")
    private String fullName;

    @Size(max = 30, message = "Phone number must be 30 characters or fewer")
    private String phoneNumber;
}
