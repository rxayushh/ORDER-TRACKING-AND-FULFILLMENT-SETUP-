package com.ordertracking.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckoutRequest {

    @NotNull(message = "Shipping address ID is required")
    private Long shippingAddressId;

    private Long preferredWarehouseId;

    private String customerNotes;

    @NotBlank(message = "Choose a simulated payment method")
    @Pattern(regexp = "SIMULATED_CARD|SIMULATED_UPI|SIMULATED_NET_BANKING",
            message = "Payment method must use the academic simulated gateway")
    @Builder.Default
    private String paymentMethod = "SIMULATED_CARD"; // SIMULATED_CARD, SIMULATED_UPI, SIMULATED_NET_BANKING
}
