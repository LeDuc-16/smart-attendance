package com.leduc.spring.student_face_data;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Builder
@Getter
public class FaceRegisterResponse {
    private Long studentId;
    private String faceId;
    private String profileImageId;
    private LocalDateTime registeredAt;
}