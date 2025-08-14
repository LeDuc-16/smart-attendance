package com.leduc.spring.otp;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class OtpRequest {
    private String email;
}
