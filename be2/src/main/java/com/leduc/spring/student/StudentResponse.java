package com.leduc.spring.student;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class StudentResponse {
    private Long id;
    private String studentCode;
    private String studentName;
    private String className;
    private String majorName;
    private String facultyName;
    private String account;
    private String email;
}
