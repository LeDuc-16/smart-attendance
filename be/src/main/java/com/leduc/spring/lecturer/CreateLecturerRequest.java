package com.leduc.spring.lecturer;

import lombok.Data;

@Data
public class CreateLecturerRequest {
    private String lecturerCode;
    private String academicRank;
    private String email; // Để tạo User
    private String password; // Để tạo User
    private String name; // Để tạo User
    private Long facultyId; // Để liên kết với Faculty
}
