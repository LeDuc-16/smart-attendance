package com.leduc.spring.student_face_data;

import com.leduc.spring.config.JwtService;
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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;

@RestController
@RequestMapping("/api/v1/student-faces")
@RequiredArgsConstructor
@Tag(name = "Student Face Management", description = "API quản lý dữ liệu khuôn mặt sinh viên")
@SecurityRequirement(name = "bearerAuth")
public class StudentFaceController {

    private static final Logger logger = LoggerFactory.getLogger(StudentFaceController.class);
    private final StudentFaceDataService studentFaceDataService;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final JwtService jwtService;

    /**
     * Đăng ký ảnh khuôn mặt cho sinh viên
     * @param top Ảnh chụp từ trên
     * @param bottom Ảnh chụp từ dưới
     * @param left Ảnh chụp từ trái
     * @param right Ảnh chụp từ phải
     * @param center Ảnh chụp từ giữa
     * @param servletRequest Request HTTP để lấy thông tin xác thực
     * @return ApiResponse chứa thông tin đăng ký khuôn mặt
     */
    @PostMapping(value = "/face-registration", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Đăng ký khuôn mặt sinh viên", description = "Đăng ký 5 ảnh khuôn mặt (trên, dưới, trái, phải, giữa) cho sinh viên hiện tại")
    public ResponseEntity<ApiResponse<FaceRegisterResponse>> registerStudentFace(
            @RequestParam("top") MultipartFile top,
            @RequestParam("bottom") MultipartFile bottom,
            @RequestParam("left") MultipartFile left,
            @RequestParam("right") MultipartFile right,
            @RequestParam("center") MultipartFile center,
            HttpServletRequest servletRequest) {
        logger.info("Received request to register face for authenticated user");

        // Xác thực người dùng
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String account = userDetails.getUsername();
        logger.info("Authenticated account: {}", account);

        // Kiểm tra JWT token
        String authHeader = servletRequest.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            logger.error("Invalid or missing Authorization header");
            throw new IllegalArgumentException("Invalid or missing Authorization header");
        }
        String jwt = authHeader.substring(7);
        String extractedAccount = jwtService.extractUsername(jwt);
        if (!extractedAccount.equals(account)) {
            logger.error("JWT token username does not match authenticated user: {} vs {}", extractedAccount, account);
            throw new IllegalArgumentException("JWT token username does not match authenticated user");
        }

        // Lấy studentId từ account
        Long studentId = extractStudentIdFromAccount(account);

        // Tạo request với danh sách ảnh
        FaceRegisterRequest request = FaceRegisterRequest.builder()
                .files(Arrays.asList(top, bottom, left, right, center))
                .build();

        ApiResponse<FaceRegisterResponse> response = studentFaceDataService.registerStudentFace(request, studentId, servletRequest);
        return ResponseEntity.ok(response);
    }

    /**
     * Xóa khuôn mặt khỏi collection
     * @param faceId ID của khuôn mặt cần xóa
     * @param servletRequest Request HTTP để lấy thông tin xác thực
     * @return ApiResponse xác nhận xóa thành công
     */
    @DeleteMapping("/{faceId}")
    @Operation(summary = "Xóa khuôn mặt", description = "Xóa một faceId khỏi collection của AWS Rekognition")
    public ResponseEntity<ApiResponse<String>> deleteFace(
            @PathVariable("faceId") String faceId,
            HttpServletRequest servletRequest) {
        logger.info("Received request to delete face ID: {}", faceId);
        ApiResponse<String> response = studentFaceDataService.deleteFace(faceId, servletRequest);
        return ResponseEntity.ok(response);
    }

    /**
     * So sánh khuôn mặt để xác minh sinh viên
     * @param file Ảnh khuôn mặt để so sánh
     * @param servletRequest Request HTTP để lấy thông tin xác thực
     * @return ApiResponse chứa kết quả so sánh khuôn mặt
     */
    @PostMapping(value = "/compare", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "So sánh khuôn mặt", description = "So sánh một ảnh khuôn mặt với collection để xác minh sinh viên")
    public ResponseEntity<ApiResponse<FaceCompareResponse>> compareFace(
            @RequestParam("file") MultipartFile file,
            HttpServletRequest servletRequest) {
        logger.info("Received request to compare face for authenticated user");

        // Xác thực người dùng
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String account = userDetails.getUsername();
        logger.info("Authenticated account: {}", account);

        // Kiểm tra JWT token
        String authHeader = servletRequest.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            logger.error("Invalid or missing Authorization header");
            throw new IllegalArgumentException("Invalid or missing Authorization header");
        }
        String jwt = authHeader.substring(7);
        String extractedAccount = jwtService.extractUsername(jwt);
        if (!extractedAccount.equals(account)) {
            logger.error("JWT token username does not match authenticated user: {} vs {}", extractedAccount, account);
            throw new IllegalArgumentException("JWT token username does not match authenticated user");
        }

        // Lấy studentId từ account
        Long studentId = extractStudentIdFromAccount(account);

        ApiResponse<FaceCompareResponse> response = studentFaceDataService.compareFace(studentId, file, servletRequest);
        return ResponseEntity.ok(response);
    }

    /**
     * Tạo session liveness cho kiểm tra khuôn mặt
     * @param servletRequest Request HTTP để lấy thông tin xác thực
     * @return ApiResponse chứa thông tin session liveness
//     */
//    @PostMapping("/liveness-session")
//    @Operation(summary = "Tạo session liveness", description = "Tạo một session mới để kiểm tra liveness của khuôn mặt")
//    public ResponseEntity<ApiResponse<LivenessSessionResponse>> createLivenessSession(HttpServletRequest servletRequest) {
//        logger.info("Received request to create liveness session");
//        ApiResponse<LivenessSessionResponse> response = studentFaceDataService.createLivenessSession(servletRequest);
//        return ResponseEntity.ok(response);
//    }
//
    @PostMapping(value = "/attendance", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Điểm danh sinh viên", description = "Điểm danh bằng nhận diện khuôn mặt cho một lịch học cụ thể")
    public ResponseEntity<ApiResponse<FaceCompareResponse>> attendance(
            @RequestParam("scheduleId") Long scheduleId,
            @RequestParam("file") MultipartFile file,
            HttpServletRequest servletRequest) {
        logger.info("Received request to perform attendance for schedule ID: {}", scheduleId);

        // Xác thực người dùng
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String account = userDetails.getUsername();
        logger.info("Authenticated account: {}", account);

        // Kiểm tra JWT token
        String authHeader = servletRequest.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            logger.error("Invalid or missing Authorization header");
            throw new IllegalArgumentException("Invalid or missing Authorization header");
        }
        String jwt = authHeader.substring(7);
        String extractedAccount = jwtService.extractUsername(jwt);
        if (!extractedAccount.equals(account)) {
            logger.error("JWT token username does not match authenticated user: {} vs {}", extractedAccount, account);
            throw new IllegalArgumentException("JWT token username does not match authenticated user");
        }

        // Lấy studentId từ account
        Long authenticatedStudentId = extractStudentIdFromAccount(account);

        ApiResponse<FaceCompareResponse> response = studentFaceDataService.attendance(authenticatedStudentId, scheduleId, file, servletRequest);
        return ResponseEntity.ok(response);
    }

    /**
     * Lấy studentId từ account của người dùng
     * @param account Tên tài khoản của người dùng
     * @return ID của sinh viên
     */
    private Long extractStudentIdFromAccount(String account) {
        User user = userRepository.findByAccount(account)
                .orElseThrow(() -> new IllegalArgumentException("User with account [%s] not found".formatted(account)));
        Student student = studentRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Student not found for user with account [%s]".formatted(account)));
        return student.getId();
    }
}