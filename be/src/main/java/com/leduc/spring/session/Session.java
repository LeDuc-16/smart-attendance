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

    private LocalDateTime createdAt;
    private LocalDateTime datetime;

    // Lưu trạng thái điểm danh của sinh viên: PRESENT, LATE, ABSENT, EXCUSED
    @Enumerated(EnumType.STRING)
    @Column(name = "status_attendance")
    private AttendanceStatus statusAttendance;

    // Lưu trạng thái lớp học (được kích hoạt bởi giảng viên)
    private boolean isOpened;

    @OneToOne
    @JoinColumn(name = "schedule_id", unique = true)
    private Schedule schedule;
}