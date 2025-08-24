//package com.leduc.spring.attendance_log;
//
//import com.leduc.spring.classes.ClassEntity;
//import com.leduc.spring.course.Course;
//import com.leduc.spring.lecturer.Lecturer;
//import com.leduc.spring.schedule.Schedule;
//import com.leduc.spring.student.Student;
//import jakarta.persistence.*;
//import lombok.*;
//
//import java.time.LocalDate;
//import java.time.LocalDateTime;
//import java.time.LocalTime;
//
//@Entity
//@Table(name = "attendance_logs")
//@Data
//@NoArgsConstructor
//@AllArgsConstructor
//@Builder
//public class AttendanceLog {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//    // Sinh viên điểm danh
//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "student_id", nullable = false)
//    private Student student;
//
//    // Lớp học (ví dụ: 64KTPM3)
//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "class_id", nullable = false)
//    private ClassEntity classEntity;
//
//    // Môn học (VD: CSDL)
//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "course_id", nullable = false)
//    private Course course;
//
//    // Giảng viên
//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "lecturer_id", nullable = false)
//    private Lecturer lecturer;
//
//    // Trạng thái điểm danh (Đúng giờ, Muộn, Có phép, Vắng)
//    @Enumerated(EnumType.STRING)
//    @Column(nullable = false)
//    private AttendanceStatus status;
//
//    // Thêm mối quan hệ
//    private Schedule schedule;
//
//    // Ghi chú thêm
//    @Column(length = 500)
//    private String note;
//
//    // Ngày giờ log được tạo
//    @Column(nullable = false, updatable = false)
//    private LocalDateTime createdAt;
//
//    @PrePersist
//    protected void onCreate() {
//        createdAt = LocalDateTime.now();
//    }
//}
