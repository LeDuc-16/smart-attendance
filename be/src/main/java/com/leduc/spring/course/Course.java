package com.leduc.spring.course;

import com.leduc.spring.lecturer.Lecturer;
import com.leduc.spring.student.Student;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "courses")
public class Course {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String courseName;
    private LocalDate startDate;
    private LocalDate endDate;

    @ManyToMany(mappedBy = "courses")
    private List<Lecturer> lecturers;

    @ManyToMany(mappedBy = "courses")
    private List<Student> students;
}

