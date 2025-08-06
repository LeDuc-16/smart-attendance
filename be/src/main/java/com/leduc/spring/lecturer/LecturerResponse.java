package com.leduc.spring.lecturer;

import lombok.Data;

@Data
public class LecturerResponse {
    private Long id;
    private String lecturerCode;
    private String academicRank;
    private Long userId;
    private Long facultyId;
}