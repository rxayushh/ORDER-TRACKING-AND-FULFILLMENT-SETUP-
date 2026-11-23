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
public class FulfillmentActionRequest {
    @NotBlank(message = "Action is required (PICK, PACK, DISPATCH)")
    private String action; // PICK, PACK, DISPATCH

    private String carrier;
    private String trackingNumber;
    private String notes;
}
