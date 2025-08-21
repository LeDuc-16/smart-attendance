package com.leduc.spring.otp;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;
public interface OtpRepository extends JpaRepository<Otp, Long> {
//    Optional<Otp> findByOtpCodeAndUsedFalseAndExpirationAfterAndUserEmail(String otpCode, LocalDateTime expiration, String email);
//    Optional<Otp> findByOtpCodeAndUsedFalseAndExpirationAfter(String otpCode, LocalDateTime expiration);

    @Query("SELECT o FROM Otp o WHERE o.otpCode = :otpCode AND o.used = false AND o.expiration > :now AND o.user.email = :email")
    Optional<Otp> findValidOtpByCodeAndEmail(@Param("otpCode") String otpCode, @Param("now") LocalDateTime now, @Param("email") String email);

    Optional<Otp> findByOtpCodeAndUsedFalseAndExpirationAfter(String otpCode, LocalDateTime expiration);

    @Modifying
    @Query("DELETE FROM Otp o WHERE o.user.email = :email")
    void deleteByUserEmail(@Param("email") String email);

    @Modifying
    @Query("DELETE FROM Otp o WHERE o.expiration < :now")
    void deleteExpiredOtps(@Param("now") LocalDateTime now);

    @Query("SELECT o FROM Otp o WHERE o.user.email = :email ORDER BY o.expiration DESC")
    Optional<Otp> findLatestOtpByEmail(@Param("email") String email);
}
