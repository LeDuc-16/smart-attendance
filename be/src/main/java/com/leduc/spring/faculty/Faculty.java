package com.leduc.spring.faculty;

import com.leduc.spring.lecturer.Lecturer;
import com.leduc.spring.major.Major;
import com.leduc.spring.user.User;
import jakarta.persistence.*;

import java.util.List;

@Entity
@Table(name = "faculties")
public class Faculty {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String facultyName;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @OneToMany(mappedBy = "faculty")
    private List<Major> majors;

    @OneToMany(mappedBy = "faculty")
    private List<Lecturer> lecturers;
}
