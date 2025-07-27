package com.leduc.spring.otp;

public interface OtpDao {
    OtpResponse sendOtp(OtpRequest request);
}
