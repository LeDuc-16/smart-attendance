package com.leduc.spring.classes;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AddLecturerToClassRequest {
    @NotBlank(message = "Class name is required")
    private String className;

    @NotNull(message = "Lecturer ID is required")
    @Min(value = 1, message = "Lecturer ID must be positive")
    private Long lecturerId;
}