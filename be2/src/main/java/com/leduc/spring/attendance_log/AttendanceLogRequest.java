package com.leduc.spring.attendance_log;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AttendanceLogRequest {
    private Long studentId;
    private Long classId;
    private Integer teacherId; // User ID của teacher
    private LocalDateTime attendanceTime;
    private AttendanceStatus status;
    private String note;
}
