package com.ordertracking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerAddressDto {
    private Long id;
    private String recipientName;
    private String phoneNumber;
    private String streetAddress;
    private String city;
    private String state;
    private String postalCode;
    private String country;
    private String addressType;
    private Boolean isDefault;
    private LocalDateTime createdAt;
}
