package com.leduc.spring.student_face_data;

import com.leduc.spring.student.Student;
import lombok.Builder;
import lombok.Getter;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Builder
@Getter
@Component
public class StudentFaceDataMapper {
    public FaceRegisterResponse toFaceRegisterResponse(Long studentId, String faceId, String profileImageId, LocalDateTime registeredAt) {
        return FaceRegisterResponse.builder()
                .studentId(studentId)
                .faceId(faceId)
                .profileImageId(profileImageId)
                .registeredAt(registeredAt)
                .build();
    }

    public FaceCompareResponse toFaceCompareResponse(Student student, String faceId, Float similarity) {
        return FaceCompareResponse.builder()
                .studentId(student.getId())
                .faceId(faceId)
                .similarity(similarity)
                .studentName(student.getUser().getName())
                .studentCode(student.getStudentCode())
                .build();
    }
}