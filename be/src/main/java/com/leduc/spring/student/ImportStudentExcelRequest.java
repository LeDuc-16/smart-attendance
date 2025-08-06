package com.leduc.spring.student;


import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class ImportStudentExcelRequest {
    private MultipartFile file;
    private String className;
}
