package com.leduc.spring.otp;

import com.leduc.spring.auth.AuthenticationResponse;
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
        return ResponseEntity.ok(otpService.sendOtp(request));
    }

    @PostMapping("/verify")
    public ResponseEntity<AuthenticationResponse> verifyOtp(@RequestBody OtpResponse response) {
        return ResponseEntity.ok(otpService.verifyOtp(response));
    }
}
