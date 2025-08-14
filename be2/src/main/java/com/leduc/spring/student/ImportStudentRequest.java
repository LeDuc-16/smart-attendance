package com.leduc.spring.student;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class ImportStudentRequest {
    @NotBlank(message = "Class name is required")
    private String className;
    private MultipartFile file;
}