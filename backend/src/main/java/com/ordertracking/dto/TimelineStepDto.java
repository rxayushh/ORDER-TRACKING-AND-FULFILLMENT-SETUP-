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
public class TimelineStepDto {
    private String step;
    private String label;
    private String description;
    private LocalDateTime timestamp;
    private Boolean isCompleted;
    private Boolean isCurrent;
}
