package com.leduc.spring.classes;

import com.leduc.spring.student.Student;
import jakarta.persistence.*;

import java.util.List;

@Entity
@Table(name = "classes")
public class ClassEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String className;
    private Integer capacityStudent;

    @OneToMany(mappedBy = "classes")
    private List<Student> students;

}

