package com.leduc.spring.course;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CourseResponse {
    private Long id;
    private String courseName;
    private int credits; // Thêm trường credits
}