package com.leduc.spring.facedescriptor;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import com.leduc.spring.user.User;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/face-recognition")
@RequiredArgsConstructor
public class FaceRecognitionController {

    private final FaceRecognitionService faceRecognitionService;

    /**
     * Đăng ký face descriptor cho user hiện tại
     */
    @PostMapping("/register")
    public ResponseEntity<?> registerFaceDescriptor(@RequestBody RegisterFaceRequest request) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            User currentUser = (User) authentication.getPrincipal();

            FaceDescriptor faceDescriptor = faceRecognitionService.registerFaceDescriptor(
                    currentUser.getId(),
                    request.getDescriptor());

            return ResponseEntity.ok(FaceDescriptorResponse.builder()
                    .id(faceDescriptor.getId())
                    .userId(faceDescriptor.getUser().getId())
                    .userName(faceDescriptor.getUser().getName())
                    .message("Face descriptor registered successfully")
                    .build());

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error registering face descriptor: " + e.getMessage());
        }
    }

    /**
     * Lấy face descriptor của user hiện tại
     */
    @GetMapping("/my-descriptor")
    public ResponseEntity<?> getMyFaceDescriptor() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            User currentUser = (User) authentication.getPrincipal();

            Optional<FaceDescriptor> faceDescriptor = faceRecognitionService
                    .getFaceDescriptorByUserId(currentUser.getId());

            if (faceDescriptor.isPresent()) {
                FaceDescriptor fd = faceDescriptor.get();
                return ResponseEntity.ok(FaceDescriptorResponse.builder()
                        .id(fd.getId())
                        .userId(fd.getUser().getId())
                        .userName(fd.getUser().getName())
                        .descriptor(fd.getDescriptor())
                        .build());
            } else {
                return ResponseEntity.notFound().build();
            }

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error getting face descriptor: " + e.getMessage());
        }
    }

    /**
     * Kiểm tra user đã đăng ký face chưa
     */
    @GetMapping("/check-registration")
    public ResponseEntity<?> checkFaceRegistration() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            User currentUser = (User) authentication.getPrincipal();

            boolean hasRegistered = faceRecognitionService.hasRegisteredFace(currentUser.getId());

            return ResponseEntity.ok(CheckRegistrationResponse.builder()
                    .hasRegistered(hasRegistered)
                    .userId(currentUser.getId())
                    .userName(currentUser.getName())
                    .build());

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error checking registration: " + e.getMessage());
        }
    }

    /**
     * Lấy tất cả descriptors để so sánh khi điểm danh
     */
    @GetMapping("/all-descriptors")
    public ResponseEntity<?> getAllDescriptors() {
        try {
            List<FaceDescriptor> descriptors = faceRecognitionService.getAllDescriptorsForComparison();

            List<FaceDescriptorResponse> responses = descriptors.stream()
                    .map(fd -> FaceDescriptorResponse.builder()
                            .id(fd.getId())
                            .userId(fd.getUser().getId())
                            .userName(fd.getUser().getName())
                            .descriptor(fd.getDescriptor())
                            .build())
                    .toList();

            return ResponseEntity.ok(responses);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error getting descriptors: " + e.getMessage());
        }
    }

    /**
     * Xóa face descriptor của user hiện tại
     */
    @DeleteMapping("/my-descriptor")
    public ResponseEntity<?> deleteMyFaceDescriptor() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            User currentUser = (User) authentication.getPrincipal();

            faceRecognitionService.deleteFaceDescriptor(currentUser.getId());

            return ResponseEntity.ok("Face descriptor deleted successfully");

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error deleting face descriptor: " + e.getMessage());
        }
    }

    /**
     * API để điểm danh bằng face recognition
     */
    @PostMapping("/attendance")
    public ResponseEntity<?> markAttendanceByFace(@RequestBody AttendanceRequest request) {
        try {
            // Logic điểm danh sẽ được implement sau
            // Hiện tại chỉ trả về thông báo thành công
            return ResponseEntity.ok(AttendanceResponse.builder()
                    .success(true)
                    .message("Attendance marked successfully")
                    .timestamp(java.time.LocalDateTime.now())
                    .build());

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error marking attendance: " + e.getMessage());
        }
    }
}