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
import com.amazonaws.services.rekognition.AmazonRekognition;
import com.amazonaws.services.rekognition.model.CreateFaceLivenessSessionRequest;
import com.amazonaws.services.rekognition.model.CreateFaceLivenessSessionResult;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Date;
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
    @Autowired
    private AmazonRekognition rekognitionClient;

    @PostMapping(
            value = "/face-registration",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    @Operation(summary = "Đăng ký ảnh khuôn mặt sinh viên", description = "Đăng ký 5 ảnh khuôn mặt (trên, dưới, trái, phải, giữa) cho sinh viên hiện tại, sử dụng AWS Rekognition")
    public ResponseEntity<ApiResponse<FaceRegisterResponse>> registerStudentFace(
            @RequestParam("top") MultipartFile top,
            @RequestParam("bottom") MultipartFile bottom,
            @RequestParam("left") MultipartFile left,
            @RequestParam("right") MultipartFile right,
            @RequestParam("center") MultipartFile center,
            HttpServletRequest servletRequest
    ) {
        // Get account from authenticated principal
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String account = userDetails.getUsername();
        logger.info("Authenticated account: {}", account);

        // Validate JWT token
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

        // Extract studentId from account
        Long studentId = extractStudentIdFromAccount(account);

        FaceRegisterRequest request = FaceRegisterRequest.builder()
                .files(Arrays.asList(top, bottom, left, right, center))
                .build();
        ApiResponse<FaceRegisterResponse> response = studentFaceDataService.registerStudentFace(request, studentId, servletRequest);
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
        // Get account from authenticated principal
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String account = userDetails.getUsername();
        logger.info("Authenticated account: {}", account);

        // Validate JWT token
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

        // Extract studentId from account
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

    @GetMapping("/liveness-session")
    public CreateFaceLivenessSessionResult createLivenessSession() {
        String clientRequestToken = String.valueOf(new Date().getTime());
        CreateFaceLivenessSessionRequest request = new CreateFaceLivenessSessionRequest()
                .withClientRequestToken(clientRequestToken)
                .withSettings(new com.amazonaws.services.rekognition.model.Settings()
                        .withSessionId("session-" + clientRequestToken));

        return rekognitionClient.createFaceLivenessSession(request);
    }


}