package com.leduc.spring.student_face_data;

import com.leduc.spring.exception.ApiResponse;
import com.leduc.spring.student.Student;
import com.leduc.spring.student.StudentRepository;
import com.leduc.spring.user.User;
import com.leduc.spring.user.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;

@RestController
@RequestMapping("/api/v1/student-faces")
@RequiredArgsConstructor
@Tag(name = "Student Face Management", description = "API quản lý dữ liệu khuôn mặt sinh viên")
@SecurityRequirement(name = "bearerAuth")
public class StudentFaceController {

    private final StudentFaceDataService studentFaceDataService;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;

    @PostMapping(
            value = "/{studentId}/face-registration",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    @Operation(summary = "Đăng ký ảnh khuôn mặt sinh viên", description = "Đăng ký 5 ảnh khuôn mặt (trên, dưới, trái, phải, giữa) cho sinh viên theo ID, sử dụng AWS Rekognition")
    public ResponseEntity<ApiResponse<FaceRegisterResponse>> registerStudentFace(
            @PathVariable("studentId") Long studentId,
            @RequestParam("top") MultipartFile top,
            @RequestParam("bottom") MultipartFile bottom,
            @RequestParam("left") MultipartFile left,
            @RequestParam("right") MultipartFile right,
            @RequestParam("center") MultipartFile center,
            HttpServletRequest servletRequest
    ) {
        FaceRegisterRequest request = FaceRegisterRequest.builder()
                .studentId(studentId)
                .files(Arrays.asList(top, bottom, left, right, center))
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

    @PostMapping(
            value = "/compare",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    @Operation(summary = "So sánh khuôn mặt", description = "So sánh 1 ảnh khuôn mặt với collection để xác minh sinh viên đã đăng nhập, yêu cầu ≥ 90% độ tương đồng")
    public ResponseEntity<ApiResponse<FaceCompareResponse>> compareFace(
            @RequestParam("file") MultipartFile file,
            HttpServletRequest servletRequest
    ) {
        // Lấy account từ JWT token
        Jwt jwt = (Jwt) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String account = jwt.getClaimAsString("account"); // Giả sử claim 'account' chứa email hoặc mã sinh viên
        if (account == null) {
            throw new IllegalArgumentException("JWT token does not contain 'account' claim");
        }
        Long studentId = extractStudentIdFromAccount(account);
        ApiResponse<FaceCompareResponse> response = studentFaceDataService.compareFace(studentId, file, servletRequest);
        return ResponseEntity.ok(response);
    }

    private Long extractStudentIdFromAccount(String account) {
        User user = userRepository.findByAccount(account)
                .orElseThrow(() -> new IllegalArgumentException("User with account [%s] not found".formatted(account)));
        Student student = studentRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Student not found for user with account [%s]".formatted(account)));
        return student.getId();
    }
}