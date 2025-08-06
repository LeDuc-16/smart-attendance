package com.leduc.spring.lecturer;

import lombok.Data;

@Data
public class UpdateLecturerRequest {
    private String lecturerCode;
    private String academicRank;
    private Long facultyId;
}