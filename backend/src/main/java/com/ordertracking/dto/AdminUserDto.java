package com.ordertracking.dto;

import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;
import java.util.List;

@Value
@Builder
public class AdminUserDto {
    Long id;
    String email;
    String fullName;
    String phoneNumber;
    Boolean enabled;
    List<String> roles;
    LocalDateTime createdAt;
}
