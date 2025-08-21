package com.leduc.spring.otp;

import com.leduc.spring.auth.AuthenticationResponse;
import com.leduc.spring.auth.AuthenticationService;
import com.leduc.spring.config.JwtService;
import com.leduc.spring.email.EmailDao;
import com.leduc.spring.exception.RequestValidationException;
import com.leduc.spring.exception.ResourceNotFoundException;
import com.leduc.spring.user.User;
import com.leduc.spring.user.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
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
        private final PasswordEncoder passwordEncoder; // Thêm PasswordEncoder
        private static final int OTP_LENGTH = 6;
        private static final int OTP_EXPIRATION_MINUTES = 5;

        @Override
        @Transactional
        public OtpResponse sendOtp(OtpRequest request) {
                if (request == null || request.getEmail() == null || request.getEmail().trim().isEmpty()) {
                        throw new RequestValidationException("Email không được để trống");
                }

                User user = userRepository.findByEmail(request.getEmail())
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "Không tìm thấy người dùng với email: " + request.getEmail()));

                try {
                        String code = generateOtpCode();
                        LocalDateTime expiration = LocalDateTime.now().plusMinutes(OTP_EXPIRATION_MINUTES);

                        Otp otp = Otp.builder()
                                .otpCode(code)
                                .expiration(expiration)
                                .used(false)
                                .user(user)
                                .build();

                        otpRepository.save(otp);

                        String subject = "Your OTP Code (Valid for " + OTP_EXPIRATION_MINUTES + " Minutes)";
                        String htmlContent = String.format(
                                """
                                        <html>
                                            <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 30px;">
                                                <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                                    <h3 style="color: #333;">Xin chào %s,</h3>
                                                    <p style="font-size: 16px; color: #555;">
                                                        Mã OTP của bạn là: <strong style='color:#2E86C1; font-size: 18px;'>%s</strong>
                                                    </p>
                                                    <p style="font-size: 14px; color: #999;">
                                                        Mã này sẽ hết hạn sau %d phút.
                                                    </p>
                                                    <p style="font-size: 14px; color: #999;">
                                                        Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.
                                                    </p>
                                                </div>
                                            </body>
                                        </html>
                                        """,
                                user.getUsername(), code, OTP_EXPIRATION_MINUTES);

                        try {
                                emailDao.sendComplexNotificationEmail(user, subject, htmlContent);
                        } catch (Exception emailException) {
                                System.err.println("Lỗi gửi email OTP: " + emailException.getMessage());
                                throw new RuntimeException("Không thể gửi email OTP. Vui lòng thử lại sau.");
                        }

                        return new OtpResponse(code);
                } catch (Exception e) {
                        throw new RuntimeException("Lỗi khi tạo OTP: " + e.getMessage());
                }
        }

        private String generateOtpCode() {
                Random random = new Random();
                int number = 100000 + random.nextInt(900000);
                return String.valueOf(number);
        }

        public AuthenticationResponse verifyOtp(OtpResponse response) {
                if (response == null || response.getOtpCode() == null || response.getOtpCode().trim().isEmpty()) {
                        throw new RequestValidationException("Mã OTP không được để trống");
                }

                if (response.getOtpCode().length() != OTP_LENGTH) {
                        throw new RequestValidationException("Mã OTP phải có đúng " + OTP_LENGTH + " chữ số");
                }

                Otp otp = otpRepository.findByOtpCodeAndUsedFalseAndExpirationAfter(
                                response.getOtpCode(), LocalDateTime.now())
                        .orElseThrow(() -> new RequestValidationException(
                                "Mã OTP không hợp lệ hoặc đã hết hạn"));

                try {
                        otp.setUsed(true);
                        otpRepository.save(otp);

                        User user = otp.getUser();
                        return AuthenticationResponse.builder()
                                .email(user.getEmail()) // Trả về email để sử dụng trong bước đổi mật khẩu
                                .build();
                } catch (Exception e) {
                        throw new RuntimeException("Lỗi khi xác thực OTP: " + e.getMessage());
                }
        }

        @Transactional
        public AuthenticationResponse resetPassword(ResetPasswordRequest request) {
                if (request == null || request.getEmail() == null || request.getNewPassword() == null) {
                        throw new RequestValidationException("Email và mật khẩu mới không được để trống");
                }

                User user = userRepository.findByEmail(request.getEmail())
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "Không tìm thấy người dùng với email: " + request.getEmail()));

                try {
                        // Mã hóa mật khẩu mới
                        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
                        userRepository.save(user);

                        // Tạo token mới sau khi đổi mật khẩu
                        String jwtToken = jwtService.generateToken(user);
                        String refreshToken = jwtService.generateRefreshToken(user);
                        authenticationService.revokeAllUserTokens(user);
                        authenticationService.saveUserToken(user, jwtToken);

                        return AuthenticationResponse.builder()
                                .accessToken(jwtToken)
                                .refreshToken(refreshToken)
                                .build();
                } catch (Exception e) {
                        throw new RuntimeException("Lỗi khi đổi mật khẩu: " + e.getMessage());
                }
        }
}