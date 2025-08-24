package com.leduc.spring.student_face_data;

import com.leduc.spring.student.Student;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@RequiredArgsConstructor
@Getter
@Component
public class StudentFaceDataMapper {

    public FaceRegisterResponse toFaceRegisterResponse(Student student, List<String> faceIds,
            List<String> profileImageIds, LocalDateTime registeredAt) {
        return FaceRegisterResponse.builder()
                .studentId(student.getId())
                .studentName(student.getUser().getName()) // Adjusted to use Student.user.name
                .studentCode(student.getStudentCode())
                .studentClass(student.getClasses() != null ? student.getClasses().getClassName() : "N/A")
                .faceIds(faceIds)
                .profileImageIds(profileImageIds)
                .registeredAt(registeredAt)
                .isRegistered(student.isRegisted()) // Include isRegisted from Student
                .build();
    }

    public FaceCompareResponse toFaceCompareResponse(Student student, String faceId, Float similarity) {
        return FaceCompareResponse.builder()
                .studentId(student.getId())
                .studentName(student.getUser().getName()) // Adjusted to use Student.user.name
                .studentCode(student.getStudentCode())
                .studentClass(student.getClasses() != null ? student.getClasses().getClassName() : "N/A")
                .faceId(faceId)
                .similarity(similarity)
                .build();
    }
}