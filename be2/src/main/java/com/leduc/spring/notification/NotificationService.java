package com.leduc.spring.notification;

import com.leduc.spring.classes.ClassEntity;
import com.leduc.spring.classes.ClassRepository;
import com.leduc.spring.course.CourseRepository;
import com.leduc.spring.exception.ApiResponse;
import com.leduc.spring.exception.ResourceNotFoundException;
import com.leduc.spring.student.Student;
import com.leduc.spring.student.StudentRepository;
import com.leduc.spring.user.User;
import com.leduc.spring.user.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);
    private final NotificationRepository notificationRepository;
    private final ClassRepository classRepository;

    // Gửi thông báo từ giảng viên đến danh sách sinh viên
    @Transactional
    public ApiResponse<Object> sendNotificationToClass(
            String title,
            String content,
            Long classId,
            HttpServletRequest servletRequest
    ) {
        // Lấy class
        ClassEntity classEntity = classRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Class with ID [%s] not found".formatted(classId)));

        // Lấy danh sách Student trong lớp
        List<Student> students = classEntity.getStudents();
        if (students == null || students.isEmpty()) {
            throw new ResourceNotFoundException("No students found in class ID: [%s]".formatted(classId));
        }

        // Lấy danh sách User từ Student
        List<User> users = students.stream()
                .map(Student::getUser)   // mỗi Student có User
                .toList();

        // Tạo notification
        Notification notification = Notification.builder()
                .title(title)
                .content(content)
                .createdAt(LocalDateTime.now())
                .isRead(false)
                .users(users)  // lưu list User
                .build();

        notificationRepository.save(notification);

        logger.info("Notification sent to class {} with {} students", classId, users.size());
        return ApiResponse.success(null, "Notification sent successfully", servletRequest.getRequestURI());
    }

    // Lấy danh sách notification của một user
    @Transactional(readOnly = true)
    public ApiResponse<List<Notification>> getUserNotifications(Long userId, HttpServletRequest servletRequest) {
        List<Notification> notifications = notificationRepository.findByUsersId(userId);
        if (notifications.isEmpty()) {
            throw new ResourceNotFoundException("No notifications found for user ID: [%s]".formatted(userId));
        }
        return ApiResponse.success(notifications, "Notifications retrieved successfully", servletRequest.getRequestURI());
    }

    // Đánh dấu notification là đã đọc
    @Transactional
    public ApiResponse<Object> markNotificationAsRead(Long notificationId, Long userId, HttpServletRequest servletRequest) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification with ID [%s] not found".formatted(notificationId)));

        if (!notification.getUsers().stream().anyMatch(user -> user.getId().equals(userId))) {
            throw new ResourceNotFoundException("User [%s] is not associated with notification [%s]".formatted(userId, notificationId));
        }

        notification.setRead(true);
        notificationRepository.save(notification);

        logger.info("Marked notification ID: {} as read for user ID: {}", notificationId, userId);
        return ApiResponse.success(null, "Notification marked as read", servletRequest.getRequestURI());
    }

    // Xóa notification
    @Transactional
    public ApiResponse<Object> deleteNotification(Long notificationId, HttpServletRequest servletRequest) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification with ID [%s] not found".formatted(notificationId)));

        notificationRepository.delete(notification);
        logger.info("Deleted notification with ID: {}", notificationId);
        return ApiResponse.success(null, "Notification deleted successfully", servletRequest.getRequestURI());
    }
}