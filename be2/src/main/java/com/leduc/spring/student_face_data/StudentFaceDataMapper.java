package com.leduc.spring.student_face_data;

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
}