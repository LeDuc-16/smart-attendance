package com.leduc.spring.student_face_data;

import lombok.Builder;
import lombok.Getter;
import org.springframework.web.multipart.MultipartFile;

@Builder
@Getter
public class FaceRegisterRequest {
    private Long studentId;
    private MultipartFile file;
}