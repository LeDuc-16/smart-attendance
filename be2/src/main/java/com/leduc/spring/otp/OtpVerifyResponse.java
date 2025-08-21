package com.leduc.spring.otp;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class OtpVerifyResponse {
    private String otpCode; // Trả về OTP đã xác thực để sử dụng trong reset password
}