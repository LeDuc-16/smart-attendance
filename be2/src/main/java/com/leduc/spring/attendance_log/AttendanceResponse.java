package com.leduc.spring.attendance_log;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceResponse {

    private Long attendanceId;
    private Long studentId;
    private Long scheduleId;
    private Long classId;
    private Long courseId;
    private Long lecturerId;
    private AttendanceStatus status;
    private LocalDateTime attendanceTime;
    private String note;
}