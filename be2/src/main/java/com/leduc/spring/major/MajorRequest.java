package com.leduc.spring.major;

import lombok.Data;

@Data
public class MajorRequest {
    private String majorName;
    private Long facultyId;
}
