package com.leduc.spring.student;

import lombok.Data;

@Data
public class CreateStudentRequest {
    private String className;
    private String studentCode;
    private String studentName;
    private String account;
    private String email;
    private String password;
    private String facultyName;
    private String majorName;
}
