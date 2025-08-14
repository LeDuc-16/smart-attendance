package com.leduc.spring.facedescriptor;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceRequest {
    private String descriptor; // Face descriptor từ camera
    private Double threshold; // Ngưỡng độ tương đồng (optional)
}
