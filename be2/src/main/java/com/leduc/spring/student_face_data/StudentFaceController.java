package com.leduc.spring.student_face_data;

import com.leduc.spring.exception.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/student-faces")
@RequiredArgsConstructor
@Tag(name = "Student Face Management", description = "API quản lý dữ liệu khuôn mặt sinh viên")
@SecurityRequirement(name = "bearerAuth")
public class StudentFaceController {

    private final StudentFaceDataService studentFaceDataService;

    @PostMapping(
            value = "/{studentId}/face-registration",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    @Operation(summary = "Đăng ký ảnh khuôn mặt sinh viên", description = "Đăng ký ảnh khuôn mặt cho sinh viên theo ID, sử dụng AWS Rekognition")
    public ResponseEntity<ApiResponse<FaceRegisterResponse>> registerStudentFace(
            @PathVariable("studentId") Long studentId,
            @RequestParam("file") MultipartFile file,
            HttpServletRequest servletRequest
    ) {
        FaceRegisterRequest request = FaceRegisterRequest.builder()
                .studentId(studentId)
                .file(file)
                .build();
        ApiResponse<FaceRegisterResponse> response = studentFaceDataService.registerStudentFace(request, servletRequest);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{faceId}")
    @Operation(summary = "Xoá khuôn mặt sinh viên", description = "Xoá một faceId khỏi AWS Rekognition collection")
    public ResponseEntity<ApiResponse<String>> deleteFace(
            @PathVariable("faceId") String faceId,
            HttpServletRequest servletRequest
    ) {
        ApiResponse<String> response = studentFaceDataService.deleteFace(faceId, servletRequest);
        return ResponseEntity.ok(response);
    }

}