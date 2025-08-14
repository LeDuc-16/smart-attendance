package com.leduc.spring.student;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateStudentRequest {
    @NotBlank(message = "Class name is required")
    private String className;

    @NotBlank(message = "Student code is required")
    private String studentCode;

    @NotBlank(message = "Student name is required")
    private String studentName;

    @NotBlank(message = "Account is required")
    private String account;

    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;

    @NotBlank(message = "Faculty is required")
    private String facultyName;

    @NotBlank(message = "Major name is required")
    private String majorName;
}