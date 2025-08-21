package com.leduc.spring.lecturer;

import com.leduc.spring.user.Role;
import lombok.Data;

@Data
public class LecturerResponse {
    private Long id;
    private String lecturerCode;
    private String name;
    private String academicRank;
    private Long userId;
    private String account;
    private String email;
    private Long facultyId;
    private Role role;
}