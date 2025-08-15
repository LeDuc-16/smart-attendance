package com.leduc.spring.faculty;

import com.leduc.spring.lecturer.LecturerResponse;
import com.leduc.spring.major.MajorResponse;
import com.leduc.spring.student.StudentResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FacultyResponse {

    private Long id;
    private String facultyName;
}
