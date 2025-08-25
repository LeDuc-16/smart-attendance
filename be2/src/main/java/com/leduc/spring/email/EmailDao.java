package com.leduc.spring.email;

import com.leduc.spring.user.User;

public interface EmailDao {
    void sendSimpleNotificationEmail(User user, String subject, String text);
    void sendComplexNotificationEmail(User user, String subject, String text);
    String buildProfessionalEmailContent(String studentName);
}
