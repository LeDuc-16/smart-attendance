package com.leduc.spring.student_face_data;

import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class FaceCompareResponse {
    private Long studentId;      // ID sinh viên
    private String faceId;       // FaceId trong collection
    private Float similarity;    // % độ tương đồng
    private String studentName;  // Tên sinh viên
    private String studentCode;  // Mã sinh viên
    private String studentClass; // Lớp sinh viên
    private boolean isAttendance;
}
