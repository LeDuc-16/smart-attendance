package com.leduc.spring.otp;

import com.leduc.spring.auth.AuthenticationResponse;
import com.leduc.spring.exception.RequestValidationException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/otp")
@RequiredArgsConstructor
public class OtpController {

    private final OtpService otpService;

    @PostMapping("/forgot-password")
    public ResponseEntity<OtpResponse> sendOtp(@RequestBody OtpRequest request) {
        if (request == null || request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new RequestValidationException("Email không được để trống");
        }

        OtpResponse response = otpService.sendOtp(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify")
    public ResponseEntity<OtpVerifyResponse> verifyOtp(@RequestBody OtpResponse response) {
        if (response == null || response.getOtpCode() == null || response.getOtpCode().trim().isEmpty()) {
            throw new RequestValidationException("Mã OTP không được để trống");
        }

        OtpVerifyResponse verifyResponse = otpService.verifyOtp(response);
        return ResponseEntity.ok(verifyResponse);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<AuthenticationResponse> resetPassword(@RequestBody ResetPasswordRequest request) {
        if (request == null || request.getNewPassword() == null || request.getConfirmPassword() == null) {
            throw new RequestValidationException("Mật khẩu mới và xác nhận mật khẩu không được để trống");
        }
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new RequestValidationException("Mật khẩu xác nhận không khớp");
        }

        AuthenticationResponse authResponse = otpService.resetPassword(request);
        return ResponseEntity.ok(authResponse);
    }
}