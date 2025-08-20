package com.leduc.spring.student_face_data;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Builder
@Getter
public class FaceRegisterResponse {
    private Long studentId;
    private String studentName;
    private String studentCode;
    private String studentClass;
    private List<String> faceIds; // Sửa thành List<String> để chứa 5 faceId
    private List<String> profileImageIds; // Sửa thành List<String> để chứa 5 profileImageId
    private LocalDateTime registeredAt;
}