package com.leduc.spring.faculty;

import com.leduc.spring.lecturer.Lecturer;
import com.leduc.spring.major.Major;
import com.leduc.spring.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Data
@Table(name = "faculties")
public class Faculty {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String facultyName;

    @OneToOne
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    @OneToMany(mappedBy = "faculty")
    private List<Major> majors;

    @OneToMany(mappedBy = "faculty")
    private List<Lecturer> lecturers;
}
