package com.leduc.spring.attendance_log;

import com.leduc.spring.exception.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/attendance-logs")
@RequiredArgsConstructor
@Tag(name = "Attendance Log Management", description = "API quản lý lịch sử điểm danh")
@SecurityRequirement(name = "bearerAuth")
public class AttendanceLogController {

    private static final Logger logger = LoggerFactory.getLogger(AttendanceLogController.class);

    private final AttendanceLogService attendanceLogService;

    // Sinh viên chỉ được xem lịch sử của chính mình, admin thì xem tất cả
    @GetMapping("/student/{studentId}/class/{classId}")
    @PreAuthorize("hasAnyRole('ADMIN','STUDENT')")
    public ResponseEntity<ApiResponse<List<AttendanceLog>>> getAttendanceHistoryByStudentAndClass(
            @PathVariable Long studentId,
            @PathVariable Long classId,
            HttpServletRequest servletRequest) {
        logger.info("Get attendance history: student={}, class={}", studentId, classId);
        return ResponseEntity.ok(
                attendanceLogService.getAttendanceHistoryByStudentAndClass(studentId, classId, servletRequest)
        );
    }

    @GetMapping("/student/{studentId}/course/{courseId}")
    @PreAuthorize("hasAnyRole('ADMIN','STUDENT')")
    public ResponseEntity<ApiResponse<List<AttendanceLog>>> getAttendanceHistoryByStudentAndCourse(
            @PathVariable Long studentId,
            @PathVariable Long courseId,
            HttpServletRequest servletRequest) {
        logger.info("Get attendance history: student={}, course={}", studentId, courseId);
        return ResponseEntity.ok(
                attendanceLogService.getAttendanceHistoryByStudentAndCourse(studentId, courseId, servletRequest)
        );
    }

    @GetMapping("/student/{studentId}/class/{classId}/stats")
    @PreAuthorize("hasAnyRole('ADMIN','STUDENT')")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getAttendanceStatsByStudentAndClass(
            @PathVariable Long studentId,
            @PathVariable Long classId,
            HttpServletRequest servletRequest) {
        logger.info("Get attendance stats: student={}, class={}", studentId, classId);
        return ResponseEntity.ok(
                attendanceLogService.getAttendanceStatsByStudentAndClass(studentId, classId, servletRequest)
        );
    }

    // Giảng viên hoặc admin mới được xem danh sách toàn lớp
    @GetMapping("/schedule/{scheduleId}")
    @PreAuthorize("hasAnyRole('ADMIN','LECTURER')")
    public ResponseEntity<ApiResponse<List<AttendanceLog>>> getAttendanceBySchedule(
            @PathVariable Long scheduleId,
            HttpServletRequest servletRequest) {
        logger.info("Get attendance for schedule={}", scheduleId);
        return ResponseEntity.ok(
                attendanceLogService.getAttendanceBySchedule(scheduleId, servletRequest)
        );
    }

    @GetMapping("/class/{classId}")
    @PreAuthorize("hasAnyRole('ADMIN','LECTURER')")
    public ResponseEntity<ApiResponse<List<AttendanceLog>>> getAttendanceHistoryByClass(
            @PathVariable Long classId,
            HttpServletRequest servletRequest) {
        logger.info("Get attendance history for class={}", classId);
        return ResponseEntity.ok(
                attendanceLogService.getAttendanceHistoryByClass(classId, servletRequest)
        );
    }
}
