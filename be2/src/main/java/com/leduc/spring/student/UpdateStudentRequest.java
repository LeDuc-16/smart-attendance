package com.leduc.spring.student;

import lombok.Data;

@Data
public class UpdateStudentRequest {
    private String studentCode;
    private String studentName;
    private String account;
    private String email;
    private String majorName;
    private String facultyName;
    private String className;
}
