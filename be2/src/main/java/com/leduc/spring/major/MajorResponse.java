package com.leduc.spring.major;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor

public class MajorResponse {
    private Long id;
    private String majorName;
    private Long facultyId;
    private String facultyName;
}
