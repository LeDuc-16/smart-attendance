package com.leduc.spring.faculty;

import com.leduc.spring.lecturer.Lecturer;
import com.leduc.spring.major.Major;
import com.leduc.spring.student.Student;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FacultyResponse {

    private Long id;

    private String facultyName;

    private List<Student> students = new ArrayList<>();

    private List<Major> majors = new ArrayList<>();

    private List<Lecturer> lecturers = new ArrayList<>();
}