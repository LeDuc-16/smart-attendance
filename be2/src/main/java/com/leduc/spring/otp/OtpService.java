//package com.leduc.spring.otp;
//
//import com.leduc.spring.auth.AuthenticationResponse;
//import com.leduc.spring.auth.AuthenticationService;
//import com.leduc.spring.config.JwtService;
//import com.leduc.spring.email.EmailDao;
//import com.leduc.spring.exception.RequestValidationException;
//import com.leduc.spring.exception.ResourceNotFoundException;
//import com.leduc.spring.user.User;
//import com.leduc.spring.user.UserRepository;
//import jakarta.transaction.Transactional;
//import lombok.RequiredArgsConstructor;
//import org.springframework.security.crypto.password.PasswordEncoder;
//import org.springframework.stereotype.Service;
//
//import java.time.LocalDateTime;
//import java.util.Random;
//
//@Service
//@RequiredArgsConstructor
//public class OtpService implements OtpDao {
//
//        private final OtpRepository otpRepository;
//        private final UserRepository userRepository;
//        private final JwtService jwtService;
//        private final EmailDao emailDao;
//        private final AuthenticationService authenticationService;
//        private final PasswordEncoder passwordEncoder;
//        private static final int OTP_LENGTH = 6;
//        private static final int OTP_EXPIRATION_MINUTES = 5;
//
////        @Override
////        @Transactional
////        public OtpResponse sendOtp(OtpRequest request) {
////                if (request == null || request.getEmail() == null || request.getEmail().trim().isEmpty()) {
////                        throw new RequestValidationException("Email không được để trống");
////                }
////
////                User user = userRepository.findByEmail(request.getEmail())
////                        .orElseThrow(() -> new ResourceNotFoundException(
////                                "Không tìm thấy người dùng với email: " + request.getEmail()));
////
////                try {
////                        String code = generateOtpCode();
////                        LocalDateTime expiration = LocalDateTime.now().plusMinutes(OTP_EXPIRATION_MINUTES);
////
////                        Otp otp = Otp.builder()
////                                .otpCode(code)
////                                .expiration(expiration)
////                                .used(false)
////                                .user(user)
////                                .build();
////
////                        otpRepository.save(otp);
////
////                        String subject = "Your OTP Code (Valid for " + OTP_EXPIRATION_MINUTES + " Minutes)";
////                        String htmlContent = String.format(
////                                """
////                                        <html>
////                                            <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 30px;">
////                                                <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
////                                                    <h3 style="color: #333;">Xin chào %s,</h3>
////                                                    <p style="font-size: 16px; color: #555;">
////                                                        Mã OTP của bạn là: <strong style='color:#2E86C1; font-size: 18px;'>%s</strong>
////                                                    </p>
////                                                    <p style="font-size: 14px; color: #999;">
////                                                        Mã này sẽ hết hạn sau %d phút.
////                                                    </p>
////                                                    <p style="font-size: 14px; color: #999;">
////                                                        Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.
////                                                    </p>
////                                                </div>
////                                            </body>
////                                        </html>
////                                        """,
////                                user.getUsername(), code, OTP_EXPIRATION_MINUTES);
////
////                        try {
////                                emailDao.sendComplexNotificationEmail(user, subject, htmlContent);
////                        } catch (Exception emailException) {
////                                System.err.println("Lỗi gửi email OTP: " + emailException.getMessage());
////                                throw new RuntimeException("Không thể gửi email OTP. Vui lòng thử lại sau.");
////                        }
////
////                        return new OtpResponse(code);
////                } catch (Exception e) {
////                        throw new RuntimeException("Lỗi khi tạo OTP: " + e.getMessage());
////                }
////        }
//
//        @Override
//        @Transactional
//        public OtpResponse sendOtp(OtpRequest request) {
//                if (request == null || request.getEmail() == null || request.getEmail().trim().isEmpty()) {
//                        throw new RequestValidationException("Email không được để trống");
//                }
//
//                User user = userRepository.findByEmail(request.getEmail())
//                        .orElseThrow(() -> new ResourceNotFoundException(
//                                "Không tìm thấy người dùng với email: " + request.getEmail()));
//
//                try {
//                        // ✅ QUAN TRỌNG: XÓA TẤT CẢ OTP CŨ CỦA USER
//                        System.out.println("🗑️ Cleaning old OTPs for email: " + request.getEmail());
//                        otpRepository.deleteByUserEmail(request.getEmail());
//
//                        String code = generateOtpCode();
//                        LocalDateTime expiration = LocalDateTime.now().plusMinutes(OTP_EXPIRATION_MINUTES);
//
//                        Otp otp = Otp.builder()
//                                .otpCode(code)
//                                .expiration(expiration)
//                                .used(false)
//                                .user(user)
//                                .build();
//
//                        otpRepository.save(otp);
//
//                        System.out.println("📧 New OTP created: " + code + " for email: " + request.getEmail() +
//                                ", expires at: " + expiration);
//
//                        // ... existing email sending code
//
//                        return new OtpResponse(code);
//                } catch (Exception e) {
//                        System.out.println("💥 Error creating OTP: " + e.getMessage());
//                        throw new RuntimeException("Lỗi khi tạo OTP: " + e.getMessage());
//                }
//        }
//
//
//        private String generateOtpCode() {
//                Random random = new Random();
//                int number = 100000 + random.nextInt(900000);
//                return String.valueOf(number);
//        }
//
////        @Transactional
////        public OtpVerifyResponse verifyOtp(OtpResponse response) {
////                if (response == null || response.getOtpCode() == null || response.getOtpCode().trim().isEmpty()) {
////                        throw new RequestValidationException("Mã OTP không được để trống");
////                }
////
////                if (response.getOtpCode().length() != OTP_LENGTH) {
////                        throw new RequestValidationException("Mã OTP phải có đúng " + OTP_LENGTH + " chữ số");
////                }
////
////                Otp otp = otpRepository.findByOtpCodeAndUsedFalseAndExpirationAfter(
////                                response.getOtpCode(), LocalDateTime.now())
////                        .orElseThrow(() -> new RequestValidationException(
////                                "Mã OTP không hợp lệ hoặc đã hết hạn"));
////
////                try {
////                        return new OtpVerifyResponse(otp.getOtpCode());
////                } catch (Exception e) {
////                        throw new RuntimeException("Lỗi khi xác thực OTP: " + e.getMessage());
////                }
////        }
//
//
//        @Transactional
//        public OtpVerifyResponse verifyOtp(OtpVerifyRequest request) {
//                if (request == null || request.getEmail() == null || request.getOtpCode() == null) {
//                        throw new RequestValidationException("Email và mã OTP không được để trống");
//                }
//
//                if (request.getOtpCode().length() != OTP_LENGTH) {
//                        throw new RequestValidationException("Mã OTP phải có đúng " + OTP_LENGTH + " chữ số");
//                }
//
//                System.out.println("🔍 Verifying OTP: email=" + request.getEmail() + ", otp=" + request.getOtpCode());
//
//                // TÌM USER TRƯỚC
//                User user = userRepository.findByEmail(request.getEmail())
//                        .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy email: " + request.getEmail()));
//
//                System.out.println("👤 User found: " + user.getEmail());
//
//                // SỬ DỤNG CUSTOM QUERY
//                Otp otp = otpRepository.findValidOtpByCodeAndEmail(
//                                request.getOtpCode(), LocalDateTime.now(), request.getEmail())
//                        .orElseThrow(() -> {
//                                System.out.println("❌ OTP not found or invalid for email: " + request.getEmail());
//                                System.out.println("❌ Current time: " + LocalDateTime.now());
//
//                                // ✅ THÊM DEBUG: Tìm OTP latest của user để kiểm tra
//                                Optional<Otp> latestOtp = otpRepository.findLatestOtpByEmail(request.getEmail());
//                                if (latestOtp.isPresent()) {
//                                        Otp latest = latestOtp.get();
//                                        System.out.println("📊 Latest OTP found: code=" + latest.getOtpCode() +
//                                                ", used=" + latest.isUsed() +
//                                                ", expiration=" + latest.getExpiration());
//                                } else {
//                                        System.out.println("📊 No OTP found for this email");
//                                }
//
//                                return new RequestValidationException("Mã OTP không hợp lệ hoặc đã hết hạn");
//                        });
//
//                // LOG THÔNG TIN OTP
//                System.out.println("📊 Found valid OTP: code=" + otp.getOtpCode() +
//                        ", used=" + otp.isUsed() +
//                        ", expiration=" + otp.getExpiration() +
//                        ", now=" + LocalDateTime.now());
//
//                try {
//                        // ĐÁNH DẤU OTP ĐÃ SỬ DỤNG
//                        otp.setUsed(true);
//                        otpRepository.save(otp);
//
//                        System.out.println("✅ OTP verified and marked as used for: " + request.getEmail());
//
//                        return new OtpVerifyResponse(otp.getOtpCode());
//                } catch (Exception e) {
//                        System.out.println("💥 Error during OTP verification: " + e.getMessage());
//                        throw new RuntimeException("Lỗi khi xác thực OTP: " + e.getMessage());
//                }
//        }
//
//
//
//
//
//        @Transactional
//        public AuthenticationResponse resetPassword(ResetPasswordRequest request) {
//                if (request == null || request.getOtpCode() == null || request.getNewPassword() == null || request.getConfirmPassword() == null) {
//                        throw new RequestValidationException("OTP, mật khẩu mới và xác nhận mật khẩu không được để trống");
//                }
//
//                if (!request.getNewPassword().equals(request.getConfirmPassword())) {
//                        throw new RequestValidationException("Mật khẩu xác nhận không khớp");
//                }
//
//                Otp otp = otpRepository.findByOtpCodeAndUsedFalseAndExpirationAfter(
//                                request.getOtpCode(), LocalDateTime.now())
//                        .orElseThrow(() -> new RequestValidationException(
//                                "Mã OTP không hợp lệ hoặc đã hết hạn"));
//
//                try {
//                        User user = otp.getUser();
//                        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
//                        otp.setUsed(true); // Đánh dấu OTP đã sử dụng
//                        userRepository.save(user);
//                        otpRepository.save(otp);
//
//                        String jwtToken = jwtService.generateToken(user);
//                        String refreshToken = jwtService.generateRefreshToken(user);
//                        authenticationService.revokeAllUserTokens(user);
//                        authenticationService.saveUserToken(user, jwtToken);
//
//                        return AuthenticationResponse.builder()
//                                .accessToken(jwtToken)
//                                .refreshToken(refreshToken)
//                                .build();
//                } catch (Exception e) {
//                        throw new RuntimeException("Lỗi khi đổi mật khẩu: " + e.getMessage());
//                }
//        }
//}
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
import java.util.Optional;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class OtpService implements OtpDao {

        private final OtpRepository otpRepository;
        private final UserRepository userRepository;
        private final JwtService jwtService;
        private final EmailDao emailDao;
        private final AuthenticationService authenticationService;
        private final PasswordEncoder passwordEncoder;
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
                        System.out.println("🗑️ Cleaning old OTPs for email: " + request.getEmail());
                        otpRepository.deleteByUserEmail(request.getEmail());

                        String code = generateOtpCode();
                        LocalDateTime expiration = LocalDateTime.now().plusMinutes(OTP_EXPIRATION_MINUTES);

                        Otp otp = Otp.builder()
                                .otpCode(code)
                                .expiration(expiration)
                                .used(false)
                                .user(user)
                                .build();

                        otpRepository.save(otp);

                        System.out.println("📧 New OTP created: " + code + " for email: " + request.getEmail() +
                                ", expires at: " + expiration);

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
                        System.out.println("💥 Error creating OTP: " + e.getMessage());
                        throw new RuntimeException("Lỗi khi tạo OTP: " + e.getMessage());
                }
        }

        private String generateOtpCode() {
                Random random = new Random();
                int number = 100000 + random.nextInt(900000);
                return String.valueOf(number);
        }

        @Transactional
        public OtpVerifyResponse verifyOtp(OtpVerifyRequest request) {
                if (request == null || request.getEmail() == null || request.getOtpCode() == null) {
                        throw new RequestValidationException("Email và mã OTP không được để trống");
                }

                if (request.getOtpCode().length() != OTP_LENGTH) {
                        throw new RequestValidationException("Mã OTP phải có đúng " + OTP_LENGTH + " chữ số");
                }

                System.out.println("Verifying OTP: email=" + request.getEmail() + ", otp=" + request.getOtpCode());

                User user = userRepository.findByEmail(request.getEmail())
                        .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy email: " + request.getEmail()));

                System.out.println("👤 User found: " + user.getEmail());

                Otp otp = otpRepository.findValidOtpByCodeAndEmail(
                                request.getOtpCode(), LocalDateTime.now(), request.getEmail())
                        .orElseThrow(() -> {
                                System.out.println("OTP not found or invalid for email: " + request.getEmail());
                                System.out.println("Current time: " + LocalDateTime.now());

                                Optional<Otp> latestOtp = otpRepository.findLatestOtpByEmail(request.getEmail());
                                if (latestOtp.isPresent()) {
                                        Otp latest = latestOtp.get();
                                        System.out.println("Latest OTP found: code=" + latest.getOtpCode() +
                                                ", used=" + latest.isUsed() +
                                                ", expiration=" + latest.getExpiration());
                                } else {
                                        System.out.println("No OTP found for this email");
                                }

                                return new RequestValidationException("Mã OTP không hợp lệ hoặc đã hết hạn");
                        });

                // LOG THÔNG TIN OTP
                System.out.println("Found valid OTP: code=" + otp.getOtpCode() +
                        ", used=" + otp.isUsed() +
                        ", expiration=" + otp.getExpiration() +
                        ", now=" + LocalDateTime.now());

                try {

                        System.out.println("OTP verified successfully for: " + request.getEmail());
                        System.out.println("OTP not marked as used - can be reused for password reset");

                        return new OtpVerifyResponse(otp.getOtpCode());
                } catch (Exception e) {
                        System.out.println("Error during OTP verification: " + e.getMessage());
                        throw new RuntimeException("Lỗi khi xác thực OTP: " + e.getMessage());
                }
        }

        @Transactional
        public AuthenticationResponse resetPassword(ResetPasswordRequest request) {
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

                System.out.println("Reset password request: email=" + request.getEmail() + ", otp=" + request.getOtpCode());

                Otp otp = otpRepository.findValidOtpByCodeAndEmail(
                                request.getOtpCode(), LocalDateTime.now(), request.getEmail())
                        .orElseThrow(() -> {
                                System.out.println("OTP not found for reset password: " + request.getOtpCode());

                                // Debug: Tìm OTP latest
                                Optional<Otp> latestOtp = otpRepository.findLatestOtpByEmail(request.getEmail());
                                if (latestOtp.isPresent()) {
                                        Otp latest = latestOtp.get();
                                        System.out.println("Latest OTP: code=" + latest.getOtpCode() +
                                                ", used=" + latest.isUsed() +
                                                ", expiration=" + latest.getExpiration());
                                }

                                return new RequestValidationException("Mã OTP không hợp lệ hoặc đã hết hạn");
                        });

                System.out.println("Found OTP for reset: code=" + otp.getOtpCode() +
                        ", used=" + otp.isUsed() +
                        ", expiration=" + otp.getExpiration());

                try {
                        User user = otp.getUser();
                        user.setPassword(passwordEncoder.encode(request.getNewPassword()));

                        otp.setUsed(true);

                        userRepository.save(user);
                        otpRepository.save(otp);

                        System.out.println("Password reset successfully for email: " + request.getEmail());
                        System.out.println("OTP marked as used after successful password reset");

                        String jwtToken = jwtService.generateToken(user);
                        String refreshToken = jwtService.generateRefreshToken(user);
                        authenticationService.revokeAllUserTokens(user);
                        authenticationService.saveUserToken(user, jwtToken);

                        return AuthenticationResponse.builder()
                                .accessToken(jwtToken)
                                .refreshToken(refreshToken)
                                .build();
                } catch (Exception e) {
                        System.out.println("Error resetting password: " + e.getMessage());
                        throw new RuntimeException("Lỗi khi đổi mật khẩu: " + e.getMessage());
                }
        }
}
