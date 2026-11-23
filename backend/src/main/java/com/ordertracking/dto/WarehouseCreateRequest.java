package com.ordertracking.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WarehouseCreateRequest {
    @NotBlank(message = "Warehouse code is required")
    private String code;

    @NotBlank(message = "Warehouse name is required")
    private String name;

    @NotBlank(message = "Location is required")
    private String location;

    @NotBlank(message = "Address is required")
    private String address;

    private String contactPerson;
    private String contactPhone;
    private String contactEmail;
    @Builder.Default
    private Boolean isActive = true;
}
