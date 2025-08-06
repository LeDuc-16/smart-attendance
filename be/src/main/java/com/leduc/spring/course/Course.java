package com.leduc.spring.course;

import com.leduc.spring.lecturer.Lecturer;
import com.leduc.spring.student.Student;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "courses")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "course_seq")
    @SequenceGenerator(name = "course_seq", sequenceName = "course_sequence", allocationSize = 1)
    private Long id;

    private String courseName;
    private LocalDate startDate;
    private LocalDate endDate;

    @ManyToMany(mappedBy = "courses")
    private List<Lecturer> lecturers;

    @ManyToMany(mappedBy = "courses")
    private List<Student> students;
}
