package com.leduc.spring.user;

import com.leduc.spring.exception.RequestValidationException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class UserController {

    private final UserService service;

    @PatchMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @RequestBody ChangePasswordRequest request,
            Principal connectedUser) {

        System.out.println("=== CHANGE PASSWORD REQUEST RECEIVED ===");
        System.out.println("Connected User: " + (connectedUser != null ? connectedUser.getName() : "NULL"));
        System.out.println("Request received: " + (request != null ? "YES" : "NULL"));

        if (request != null) {
            System.out.println("Request details: " + request.toString());
        }

        // Validate input
        if (request == null) {
            System.out.println("Request is NULL");
            return resp(400, "Dữ liệu thay đổi mật khẩu không được để trống");
        }

        if (connectedUser == null) {
            System.out.println("Connected user is NULL");
            return resp(401, "Người dùng chưa đăng nhập");
        }

        if (request.isCurrentPasswordEmpty()) {
            System.out.println("Current password is empty");
            return resp(400, "Mật khẩu hiện tại không được để trống");
        }

        if (request.isNewPasswordEmpty()) {
            System.out.println("New password is empty");
            return resp(400, "Mật khẩu mới không được để trống");
        }

        if (request.isConfirmationPasswordEmpty()) {
            System.out.println("Confirmation password is empty");
            return resp(400, "Xác nhận mật khẩu không được để trống");
        }

        if (!request.isPasswordsMatch()) {
            System.out.println("Passwords do not match");
            return resp(400, "Mật khẩu mới và xác nhận mật khẩu không khớp");
        }

        if (!request.isNewPasswordValid()) {
            System.out.println("Password too short");
            return resp(400, "Mật khẩu mới phải có ít nhất 6 ký tự");
        }

        try {
            System.out.println("Changing password for user: " + connectedUser.getName());
            service.changePassword(request, connectedUser);
            System.out.println("Password changed successfully");
            return resp(200, "Đổi mật khẩu thành công!");
        } catch (RequestValidationException e) {
            System.out.println("Validation error: " + e.getMessage());
            return resp(400, e.getMessage());
        } catch (Exception e) {
            System.out.println("Unexpected error: " + e.getMessage());
            e.printStackTrace();
            return resp(500, "Có lỗi xảy ra khi đổi mật khẩu. Vui lòng thử lại sau.");
        }
    }

    private ResponseEntity<Map<String, Object>> resp(int status, String message) {
        HttpStatus httpStatus = switch (status) {
            case 200 -> HttpStatus.OK;
            case 401 -> HttpStatus.UNAUTHORIZED;
            case 500 -> HttpStatus.INTERNAL_SERVER_ERROR;
            default -> HttpStatus.BAD_REQUEST;
        };

        return ResponseEntity.status(httpStatus).body(Map.of(
                "statusCode", status,
                "message", message,
                "path", "/api/v1/users/change-password",
                "data", Map.of()
        ));
    }
}

