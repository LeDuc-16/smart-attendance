package com.leduc.spring.student_face_data;

import com.leduc.spring.student.Student;
import lombok.Builder;
import lombok.Getter;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class StudentFaceDataMapper {

    public FaceRegisterResponse toFaceRegisterResponse(Student student, String faceId, String profileImageId, LocalDateTime registeredAt) {
        return FaceRegisterResponse.builder()
                .studentId(student.getId())
                .studentName(student.getUser().getName())
                .studentCode(student.getStudentCode())
                .studentClass(student.getClasses().getClassName())
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
                .studentClass(student.getClasses().getClassName())
                .build();
    }
}
