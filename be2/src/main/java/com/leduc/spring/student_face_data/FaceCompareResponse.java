package com.leduc.spring.student_face_data;

import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class FaceCompareResponse {
    private Long studentId; // ID của sinh viên khớp
    private String faceId; // FaceId khớp trong collection
    private Float similarity; // Độ tương đồng (%)
    private String studentName; // Tên sinh viên
    private String studentCode; // Mã sinh viên
}