package com.leduc.spring.session;

import com.leduc.spring.schedule.Schedule;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "sessions")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Session {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "session_seq")
    @SequenceGenerator(name = "session_seq", sequenceName = "session_sequence", allocationSize = 1)
    private Long id;

    // Thời điểm giảng viên mở điểm danh
    @Column(nullable = false)
    private LocalDateTime openedAt;

    // Thời điểm giảng viên đóng điểm danh thủ công (null nếu chưa đóng)
    private LocalDateTime closedAt;

    // Phiên đang mở hay không
    @Column(nullable = false)
    private boolean isOpened;

    // Lịch học liên kết (mỗi phiên = 1 buổi học trong lịch)
    @OneToOne
    @JoinColumn(name = "schedule_id", unique = true, nullable = false)
    private Schedule schedule;

    // Mở phiên
    public void openSession() {
        this.openedAt = LocalDateTime.now();
        this.isOpened = true;
    }

    // Đóng phiên
    public void closeSession() {
        this.closedAt = LocalDateTime.now();
        this.isOpened = false;
    }

    // Kiểm tra quá hạn 30 phút kể từ mở phiên
    public boolean isOverTimeLimit() {
        return LocalDateTime.now().isAfter(this.openedAt.plusMinutes(30));
    }
}
