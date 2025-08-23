package com.leduc.spring.notification;

import com.leduc.spring.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "notification")
public class Notification {

    @Id
    @SequenceGenerator(
            name = "notification_seq",
            sequenceName = "notification_sequence",
            allocationSize = 1
    )
    @GeneratedValue(
            strategy = GenerationType.SEQUENCE,
            generator = "notification_seq"
    )
    private Long id;

    private String title; // Tiêu đề thông báo
    private String content; // Nội dung thông báo
    private LocalDateTime createdAt; // Thời gian tạo
    private boolean isRead; // Trạng thái đã đọc

    @ManyToMany(mappedBy = "notifications")
    private List<User> users; // Danh sách user nhận thông báo
}