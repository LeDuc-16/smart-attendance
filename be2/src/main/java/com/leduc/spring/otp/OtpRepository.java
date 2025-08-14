package com.leduc.spring.otp;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Optional;

public interface OtpRepository extends JpaRepository<Otp, Long> {
    Optional<Otp> findByOtpCodeAndUsedFalseAndExpirationAfterAndUserEmail(String otpCode, LocalDateTime expiration, String email);
    Optional<Otp> findByOtpCodeAndUsedFalseAndExpirationAfter(String otpCode, LocalDateTime expiration);
}
