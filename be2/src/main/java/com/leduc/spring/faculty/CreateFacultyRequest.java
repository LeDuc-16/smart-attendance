package com.leduc.spring.faculty;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateFacultyRequest {
    @NotBlank(message = "Faculty name must not be blank")
    private String facultyName;
}
