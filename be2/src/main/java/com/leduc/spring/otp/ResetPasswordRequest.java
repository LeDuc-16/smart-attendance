package com.leduc.spring.otp;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ResetPasswordRequest {
    private String email;
    private String otpCode;
    private String newPassword;
    private String confirmPassword;
}