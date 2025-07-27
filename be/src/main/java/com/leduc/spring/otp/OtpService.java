package com.leduc.spring.otp;

import com.leduc.spring.auth.AuthenticationResponse;
import com.leduc.spring.auth.AuthenticationService;
import com.leduc.spring.config.JwtService;
import com.leduc.spring.email.EmailDao;
import com.leduc.spring.email.EmailService;
import com.leduc.spring.user.User;
import com.leduc.spring.user.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class OtpService implements OtpDao {

    private final OtpRepository otpRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final EmailDao emailDao;
    private final AuthenticationService authenticationService;
    private static final int OTP_LENGTH = 6;
    private static final int OTP_EXPIRATION_MINUTES = 5;
    // gui otp
    @Override
    @Transactional
    public OtpResponse sendOtp(OtpRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Email not found"));

        String code = generateOtpCode();
        LocalDateTime expiration = LocalDateTime.now().plusMinutes(5);

        Otp otp = Otp.builder()
                .otpCode(code)
                .expiration(expiration)
                .used(false)
                .user(user)
                .build();

        otpRepository.save(otp);

        // Gửi OTP qua email HTML
        String subject = "Your OTP Code (Valid for 5 Minutes)";
        String htmlContent = "<h3>Hello " + user.getUsername() + ",</h3>" +
                "<p>Your OTP code is: <strong style='color:#2E86C1; font-size: 18px;'>" + code + "</strong></p>" +
                "<p>This code will expire in 5 minutes.</p>";

        emailDao.sendComplexNotificationEmail(user, subject, htmlContent);

        return new OtpResponse(code);
    }

    // tao ma otp
    private String generateOtpCode() {
        Random random = new Random();
        int number = 100000 + random.nextInt(900000); // ensures 6 digits
        return String.valueOf(number);
    }

    public AuthenticationResponse verifyOtp(OtpResponse response) {
        Otp otp = otpRepository.findByOtpCodeAndUsedFalseAndExpirationAfter(
                response.getOtpCode(), LocalDateTime.now()
        ).orElseThrow(() -> new IllegalArgumentException("OTP không hợp lệ hoặc đã hết hạn"));

        // Đánh dấu đã dùng
        otp.setUsed(true);
        otpRepository.save(otp);

        User user = otp.getUser(); // liên kết ManyToOne từ OTP -> User

        // Sinh token như login
        String jwtToken = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);
        authenticationService.revokeAllUserTokens(user);
        authenticationService.saveUserToken(user, jwtToken);

        return AuthenticationResponse.builder()
                .accessToken(jwtToken)
                .refreshToken(refreshToken)
                .build();
    }

}
