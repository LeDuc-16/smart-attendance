package com.leduc.spring.otp;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ResetPasswordRequest {
    private String otpCode; // OTP đã xác thực
    private String newPassword;
    private String confirmPassword;
}