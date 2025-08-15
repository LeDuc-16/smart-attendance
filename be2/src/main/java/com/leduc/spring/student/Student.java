package com.leduc.spring.student;

import com.leduc.spring.classes.ClassEntity;
import com.leduc.spring.course.Course;
import com.leduc.spring.faculty.Faculty;
import com.leduc.spring.major.Major;
import com.leduc.spring.schedule.Schedule;
import com.leduc.spring.student_face_data.StudentFaceData; // ✅ Import đúng package
import com.leduc.spring.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "students")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Student {

    @Id
    private Long id;

    @Column(name = "student_code", unique = true, nullable = false)
    private String studentCode;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "major_id")
    private Major major;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_id")
    private ClassEntity classes;

    @Column(name = "profile_image_id")
    private String profileImageId;

    @ManyToMany
    @JoinTable(
            name = "student_course",
            joinColumns = @JoinColumn(name = "student_id"),
            inverseJoinColumns = @JoinColumn(name = "course_id")
    )
    private List<Course> courses;

    @ManyToMany
    @JoinTable(
            name = "student_schedule",
            joinColumns = @JoinColumn(name = "student_id"),
            inverseJoinColumns = @JoinColumn(name = "schedule_id")
    )
    private List<Schedule> schedules;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "faculty_id")
    private Faculty faculty;

    // Một sinh viên có thể có nhiều bản dữ liệu khuôn mặt
    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<StudentFaceData> faceDataList;
}
