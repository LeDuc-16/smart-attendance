//package com.leduc.spring.otp;
//
//import com.leduc.spring.auth.AuthenticationResponse;
//import com.leduc.spring.exception.RequestValidationException;
//import lombok.RequiredArgsConstructor;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//@RestController
//@RequestMapping("/api/v1/otp")
//@RequiredArgsConstructor
//public class OtpController {
//
//    private final OtpService otpService;
//
//    @PostMapping("/forgot-password")
//    public ResponseEntity<OtpResponse> sendOtp(@RequestBody OtpRequest request) {
//        if (request == null || request.getEmail() == null || request.getEmail().trim().isEmpty()) {
//            throw new RequestValidationException("Email không được để trống");
//        }
//
//        OtpResponse response = otpService.sendOtp(request);
//        return ResponseEntity.ok(response);
//    }
//
////    @PostMapping("/verify")
////    public ResponseEntity<OtpVerifyResponse> verifyOtp(@RequestBody OtpResponse response) {
////        if (response == null || response.getOtpCode() == null || response.getOtpCode().trim().isEmpty()) {
////            throw new RequestValidationException("Mã OTP không được để trống");
////        }
////
////        OtpVerifyResponse verifyResponse = otpService.verifyOtp(response);
////        return ResponseEntity.ok(verifyResponse);
////    }
//
//    @PostMapping("/verify")
//    public ResponseEntity<OtpVerifyResponse> verifyOtp(@RequestBody OtpVerifyRequest request) {
//        if (request == null || request.getEmail() == null || request.getOtpCode() == null) {
//            throw new RequestValidationException("Email và mã OTP không được để trống");
//        }
//
//        if (request.getOtpCode().trim().isEmpty() || request.getOtpCode().length() != 6) {
//            throw new RequestValidationException("Mã OTP phải có đúng 6 chữ số");
//        }
//
//        System.out.println("Verify OTP request: email=" + request.getEmail() + ", otp=" + request.getOtpCode());
//        OtpVerifyResponse verifyResponse = otpService.verifyOtp(request);
//        System.out.println("OTP verified successfully");
//        return ResponseEntity.ok(verifyResponse);
//    }
//
//    @PostMapping("/reset-password")
//    public ResponseEntity<AuthenticationResponse> resetPassword(@RequestBody ResetPasswordRequest request) {
//        if (request == null || request.getNewPassword() == null || request.getConfirmPassword() == null) {
//            throw new RequestValidationException("Mật khẩu mới và xác nhận mật khẩu không được để trống");
//        }
//        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
//            throw new RequestValidationException("Mật khẩu xác nhận không khớp");
//        }
//
//        AuthenticationResponse authResponse = otpService.resetPassword(request);
//        return ResponseEntity.ok(authResponse);
//    }
//}

package com.leduc.spring.otp;

import com.leduc.spring.auth.AuthenticationResponse;
import com.leduc.spring.exception.RequestValidationException;
import jakarta.transaction.Transactional;
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

        System.out.println("Send OTP request for email: " + request.getEmail());
        OtpResponse response = otpService.sendOtp(request);
        System.out.println("OTP sent successfully");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify")
    @Transactional
    public ResponseEntity<OtpVerifyResponse> verifyOtp(@RequestBody OtpVerifyRequest request) {
        if (request == null || request.getEmail() == null || request.getOtpCode() == null) {
            throw new RequestValidationException("Email và mã OTP không được để trống");
        }

        if (request.getOtpCode().trim().isEmpty() || request.getOtpCode().length() != 6) {
            throw new RequestValidationException("Mã OTP phải có đúng 6 chữ số");
        }

        System.out.println("Controller received verify request: email=" + request.getEmail() + ", otp=" + request.getOtpCode());

        try {
            OtpVerifyResponse verifyResponse = otpService.verifyOtp(request);
            System.out.println("Controller: OTP verified successfully");
            return ResponseEntity.ok(verifyResponse);
        } catch (Exception e) {
            System.out.println("Controller error: " + e.getMessage());
            throw e;
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<AuthenticationResponse> resetPassword(@RequestBody ResetPasswordRequest request) {
        if (request == null || request.getEmail() == null || request.getOtpCode() == null ||
                request.getNewPassword() == null || request.getConfirmPassword() == null) {
            throw new RequestValidationException("Email, OTP, mật khẩu mới và xác nhận mật khẩu không được để trống");
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new RequestValidationException("Mật khẩu xác nhận không khớp");
        }

        if (request.getNewPassword().length() < 6) {
            throw new RequestValidationException("Mật khẩu phải có ít nhất 6 ký tự");
        }

        System.out.println("Reset password request for email: " + request.getEmail());
        AuthenticationResponse authResponse = otpService.resetPassword(request);
        System.out.println("Password reset successfully");
        return ResponseEntity.ok(authResponse);
    }
}
