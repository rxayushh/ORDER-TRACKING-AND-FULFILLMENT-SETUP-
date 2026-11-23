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
public class WarehouseDto {
    private Long id;
    private String code;
    private String name;
    private String location;
    private String address;
    private String contactPerson;
    private String contactPhone;
    private String contactEmail;
    private Boolean isActive;
    private LocalDateTime createdAt;
}
