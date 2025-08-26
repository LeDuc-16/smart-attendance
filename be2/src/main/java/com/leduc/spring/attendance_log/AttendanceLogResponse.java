package com.leduc.spring.attendance_log;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AttendanceLogResponse {
    private Long id;
    private Long studentId;
    private Long scheduleId;
    private String status;
    private String note;
    private LocalDateTime createdAt;
}
