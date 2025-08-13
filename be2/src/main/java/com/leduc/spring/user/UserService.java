package com.leduc.spring.user;

import com.leduc.spring.email.EmailDao;
import com.leduc.spring.exception.RequestValidationException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.Principal;

@Service
@RequiredArgsConstructor
public class UserService {

    private final EmailDao emailDao;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository repository;

    public void changePassword(ChangePasswordRequest request, Principal connectedUser) {

        try {
            var user = (User) ((UsernamePasswordAuthenticationToken) connectedUser).getPrincipal();

            // check if the current password is correct
            if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
                throw new RequestValidationException("Mật khẩu hiện tại không chính xác");
            }
            // check if the two new passwords are the same
            if (!request.getNewPassword().equals(request.getConfirmationPassword())) {
                throw new RequestValidationException("Mật khẩu mới và xác nhận mật khẩu không khớp");
            }

            // update the password
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));

            String htmlContent = """
                        <html>
                            <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 30px;">
                                <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                    <h2 style="color: #333;">🔐 Mật khẩu đã được thay đổi thành công</h2>
                                    <p style="font-size: 16px; color: #555;">
                                        Xin chào <strong>%s</strong>,
                                    </p>
                                    <p style="font-size: 16px; color: #555;">
                                        Đây là thông báo rằng mật khẩu cho tài khoản của bạn trên <strong>LeDuc Dep Trai App</strong> đã được thay đổi thành công.
                                    </p>
                                    <p style="font-size: 16px; color: #555;">
                                        Nếu bạn không thực hiện thay đổi này, vui lòng liên hệ với chúng tôi ngay lập tức để đảm bảo an toàn cho tài khoản.
                                    </p>
                                    <p style="font-size: 16px; color: #555;">Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.</p>
                                    <hr style="margin: 30px 0;">
                                    <p style="font-size: 14px; color: #999;">LeDuc Dep Trai App - Đem lại trải nghiệm tuyệt vời cho bạn.</p>
                                </div>
                            </body>
                        </html>
                    """
                    .formatted(user.getUsername());

            try {
                emailDao.sendComplexNotificationEmail(
                        user,
                        "Thông báo từ hệ thống - LeDuc Dep Trai App",
                        htmlContent);
            } catch (Exception emailException) {
                // Log email error but don't fail the password change
                System.err.println("Lỗi gửi email thông báo thay đổi mật khẩu: " + emailException.getMessage());
            }

            // save the new password
            repository.save(user);
        } catch (ClassCastException e) {
            throw new RequestValidationException("Thông tin người dùng không hợp lệ");
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi thay đổi mật khẩu: " + e.getMessage());
        }
    }
}
