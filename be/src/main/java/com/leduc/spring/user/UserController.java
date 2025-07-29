package com.leduc.spring.user;

import com.leduc.spring.exception.RequestValidationException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService service;

    @PatchMapping
    public ResponseEntity<?> changePassword(
            @RequestBody ChangePasswordRequest request,
            Principal connectedUser) {
        // Validate input
        if (request == null) {
            throw new RequestValidationException("Dữ liệu thay đổi mật khẩu không được để trống");
        }
        if (connectedUser == null) {
            throw new RequestValidationException("Người dùng chưa đăng nhập");
        }

        service.changePassword(request, connectedUser);
        return ResponseEntity.ok().build();
    }
}
