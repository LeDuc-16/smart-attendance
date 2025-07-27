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
            mimeMessage.setFrom(new InternetAddress("no-reply@leduccorp.com"));
            mimeMessage.setSubject(subject);
            mimeMessage.setContent(htmlContent, "text/html; charset=utf-8");
        };

        try {
            mailSender.send(preparator);
        } catch (MailException e) {
            e.printStackTrace();
        }
    }

}
