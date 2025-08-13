package com.leduc.spring.facedescriptor;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceResponse {
    private boolean success;
    private String message;
    private Long userId;
    private String userName;
    private LocalDateTime timestamp;
    private Double similarityScore; // Điểm tương đồng
}
