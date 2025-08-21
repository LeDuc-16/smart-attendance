package com.leduc.spring.student_face_data;

import lombok.Builder;
import lombok.Getter;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Builder
@Getter
public class FaceRegisterRequest {
    private List<MultipartFile> files; // Chỉ giữ danh sách files
}