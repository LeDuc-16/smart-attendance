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
@Table(name = "faculties")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Faculty {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "faculty_seq")
    @SequenceGenerator(name = "faculty_seq", sequenceName = "faculty_sequence", allocationSize = 1)
    private Long id;

    @Column(nullable = false, unique = true)
    private String facultyName;

    @OneToOne
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    @OneToMany(mappedBy = "faculty", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Major> majors;

    @OneToMany(mappedBy = "faculty", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Lecturer> lecturers;
}
