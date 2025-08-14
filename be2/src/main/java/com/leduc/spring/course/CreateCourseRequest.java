package com.leduc.spring.course;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateCourseRequest {
    @NotBlank(message = "Course name is required")
    private String courseName;

    @NotNull(message = "Credits is required")
    @Min(value = 1, message = "Credits must be at least 1")
    private Integer credits; // Sử dụng Integer thay vì int để hỗ trợ validation
}