package com.leduc.spring.student_face_data;

import com.leduc.spring.student.Student;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "student_face_data")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentFaceData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Liên kết đến Student
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(name = "face_id", nullable = false)
    private String faceId; // AWS Rekognition FaceId

    @Column(name = "image_s3_key")
    private String imageS3Key; // Link ảnh gốc trên S3

    @Column(name = "active", nullable = false)
    private boolean active; // Đang dùng hay không

    @Column(name = "registered_at", nullable = false)
    private LocalDateTime registeredAt;
}
