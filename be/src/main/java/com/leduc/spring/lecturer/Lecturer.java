package com.leduc.spring.lecturer;

import com.leduc.spring.course.Course;
import com.leduc.spring.faculty.Faculty;
import com.leduc.spring.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Table(name = "lecturer")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Lecturer {
    @Id
    private Long id;

    private String lecturerCode;
    private String academicRank;

    @OneToOne
    @MapsId
    @JoinColumn(name = "id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "faculty_id")
    private Faculty faculty;

    @ManyToMany
    @JoinTable(name = "lecturer_course",
            joinColumns = @JoinColumn(name = "lecturer_id"),
            inverseJoinColumns = @JoinColumn(name = "course_id"))
    private List<Course> courses;
}
