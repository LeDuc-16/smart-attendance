package com.leduc.spring.notification;

import com.leduc.spring.config.JwtService;
import com.leduc.spring.exception.ApiResponse;
import com.leduc.spring.user.Role;
import com.leduc.spring.user.User;
import com.leduc.spring.user.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@Tag(name = "Notification Management", description = "API quản lý thông báo")
@SecurityRequirement(name = "bearerAuth")
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    @PostMapping("/lecturer")
    @PreAuthorize("hasRole('LECTURER')")
    @Operation(summary = "Gửi thông báo từ giảng viên", description = "Giảng viên gửi thông báo cho toàn bộ sinh viên trong một lớp")
    public ResponseEntity<ApiResponse<Object>> sendNotificationFromLecturer(
            @RequestParam String title,
            @RequestParam String content,
            @RequestParam Long classId,
            HttpServletRequest servletRequest
    ) {
        String jwt = servletRequest.getHeader("Authorization").substring(7);
        String account = jwtService.extractUsername(jwt);

        User lecturer = userRepository.findByAccount(account)
                .orElseThrow(() -> new IllegalArgumentException("Lecturer not found for account: " + account));

        if (!Role.LECTURER.equals(lecturer.getRole())) {
            throw new IllegalArgumentException("User is not authorized as a lecturer");
        }

        ApiResponse<Object> response = notificationService.sendNotificationToClass(
                title,
                content,
                classId,
                servletRequest
        );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Lấy danh sách thông báo của user", description = "Trả về tất cả thông báo của user theo userId")
    public ResponseEntity<ApiResponse<List<Notification>>> getUserNotifications(
            @PathVariable Long userId,
            HttpServletRequest servletRequest
    ) {
        ApiResponse<List<Notification>> response = notificationService.getUserNotifications(userId, servletRequest);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{notificationId}/read")
    @Operation(summary = "Đánh dấu thông báo là đã đọc", description = "Đánh dấu thông báo theo notificationId là đã đọc cho user")
    public ResponseEntity<ApiResponse<Object>> markNotificationAsRead(
            @PathVariable Long notificationId,
            @RequestParam Long userId,
            HttpServletRequest servletRequest
    ) {
        ApiResponse<Object> response = notificationService.markNotificationAsRead(notificationId, userId, servletRequest);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{notificationId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Xóa thông báo", description = "Chỉ admin có thể xóa thông báo theo notificationId")
    public ResponseEntity<ApiResponse<Object>> deleteNotification(
            @PathVariable Long notificationId,
            HttpServletRequest servletRequest
    ) {
        ApiResponse<Object> response = notificationService.deleteNotification(notificationId, servletRequest);
        return ResponseEntity.ok(response);
    }
}
