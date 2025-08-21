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
        // Validate request
        if (request == null) {
            throw new RequestValidationException("Dữ liệu yêu cầu OTP không được để trống");
        }
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new RequestValidationException("Email không được để trống");
        }

        OtpResponse response = otpService.sendOtp(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify")
    public ResponseEntity<AuthenticationResponse> verifyOtp(@RequestBody OtpResponse response) {
        // Validate request
        if (response == null) {
            throw new RequestValidationException("Dữ liệu xác thực OTP không được để trống");
        }
        if (response.getOtpCode() == null || response.getOtpCode().trim().isEmpty()) {
            throw new RequestValidationException("Mã OTP không được để trống");
        }

        AuthenticationResponse authResponse = otpService.verifyOtp(response);
        return ResponseEntity.ok(authResponse);
    }


}
