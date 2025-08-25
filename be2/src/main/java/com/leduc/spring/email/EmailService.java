package com.leduc.spring.email;

import com.leduc.spring.user.User;
import jakarta.mail.Message;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.mail.javamail.MimeMessagePreparator;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
public class EmailService implements EmailDao {

    @Autowired
    private JavaMailSender mailSender;

    @Override
    public void sendSimpleNotificationEmail(User user, String subject, String text) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(user.getEmail());
            message.setFrom("ngnlduc@gmail.com");

            // Gộp subject + nội dung vào body mail
            String fullText = "Subject: " + subject + "\n\n" + text;
            message.setText(fullText);

            mailSender.send(message);
        } catch (MailException e) {
            System.err.println("📧 Error sending email: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @Override
    public void sendComplexNotificationEmail(User user, String subject, String htmlContent) {
        MimeMessagePreparator preparator = mimeMessage -> {
            mimeMessage.setRecipient(Message.RecipientType.TO, new InternetAddress(user.getEmail()));
            mimeMessage.setFrom(new InternetAddress("ngnlduc@gmail.com"));
            mimeMessage.setSubject(subject);
            mimeMessage.setContent(htmlContent, "text/html; charset=utf-8");
        };

        try {
            mailSender.send(preparator);
        } catch (MailException e) {
            e.printStackTrace();
        }
    }

    public String buildProfessionalEmailContent(String studentName) {
        return """
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body { font-family: Arial, sans-serif; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #f4f4f4; padding: 15px; text-align: center; }
                .content { padding: 20px; }
                .footer { font-size: 12px; color: #777; text-align: center; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2>Face Registration Confirmation</h2>
                </div>
                <div class="content">
                    <p>Dear %s,</p>
                    <p>We are pleased to inform you that your face registration has been successfully completed. Your profile has been updated, and you are now fully registered in our system.</p>
                    <p>This registration enables secure and efficient access to our services. Should you have any questions or require further assistance, please do not hesitate to contact our support team at <a href="mailto:support@yourdomain.com">support@yourdomain.com</a>.</p>
                    <p>Thank you for choosing our services.</p>
                    <p>Best regards,</p>
                    <p><strong>Your Organization Name</strong><br>
                    Student Management System</p>
                </div>
                <div class="footer">
                    <p>&copy; %d Your Organization Name. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """.formatted(studentName, LocalDate.now().getYear());
    }

}
