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
public class AddressCreateRequest {
    @NotBlank(message = "Recipient name is required")
    private String recipientName;

    @NotBlank(message = "Phone number is required")
    private String phoneNumber;

    @NotBlank(message = "Street address is required")
    private String streetAddress;

    @NotBlank(message = "City is required")
    private String city;

    @NotBlank(message = "State is required")
    private String state;

    @NotBlank(message = "Postal code is required")
    private String postalCode;

    @Builder.Default
    private String country = "India";

    @Builder.Default
    private String addressType = "HOME";

    @Builder.Default
    private Boolean isDefault = false;
}
