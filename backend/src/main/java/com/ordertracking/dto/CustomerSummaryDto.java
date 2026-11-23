package com.ordertracking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerSummaryDto {
    private Long id;
    private String email;
    private String fullName;
    private String phoneNumber;
    private Boolean enabled;
    private long orderCount;
    private List<String> roles;
    private LocalDateTime createdAt;
}
