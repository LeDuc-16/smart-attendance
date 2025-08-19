package com.leduc.spring.student;

import com.leduc.spring.user.Role;
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
    private Role role;
}
