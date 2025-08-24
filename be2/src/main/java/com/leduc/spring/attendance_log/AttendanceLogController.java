package com.leduc.spring.attendance_log;

import com.leduc.spring.config.JwtService;
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

    /**
     * Lấy lịch sử điểm danh của sinh viên theo lớp
     */
    @GetMapping("/student/{studentId}/class/{classId}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('STUDENT') and #studentId == authentication.principal.studentId)")
    @Operation(summary = "Lấy lịch sử điểm danh theo lớp", description = "Lấy danh sách lịch sử điểm danh của một sinh viên trong một lớp cụ thể")
    public ResponseEntity<ApiResponse<List<AttendanceLog>>> getAttendanceHistoryByStudentAndClass(
            @PathVariable Long studentId,
            @PathVariable Long classId,
            HttpServletRequest servletRequest) {
        logger.info("Received request to get attendance history for student ID: {} and class ID: {}", studentId, classId);
        ApiResponse<List<AttendanceLog>> response = attendanceLogService.getAttendanceHistoryByStudentAndClass(studentId, classId, servletRequest);
        return ResponseEntity.ok(response);
    }

    /**
     * Lấy lịch sử điểm danh của sinh viên theo khóa học
     */
    @GetMapping("/student/{studentId}/course/{courseId}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('STUDENT') and #studentId == authentication.principal.studentId)")
    @Operation(summary = "Lấy lịch sử điểm danh theo khóa học", description = "Lấy danh sách lịch sử điểm danh của một sinh viên trong một khóa học cụ thể")
    public ResponseEntity<ApiResponse<List<AttendanceLog>>> getAttendanceHistoryByStudentAndCourse(
            @PathVariable Long studentId,
            @PathVariable Long courseId,
            HttpServletRequest servletRequest) {
        logger.info("Received request to get attendance history for student ID: {} and course ID: {}", studentId, courseId);
        ApiResponse<List<AttendanceLog>> response = attendanceLogService.getAttendanceHistoryByStudentAndCourse(studentId, courseId, servletRequest);
        return ResponseEntity.ok(response);
    }

    /**
     * Lấy thống kê điểm danh của sinh viên theo lớp
     */
    @GetMapping("/student/{studentId}/class/{classId}/stats")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('STUDENT') and #studentId == authentication.principal.studentId)")
    @Operation(summary = "Lấy thống kê điểm danh", description = "Lấy thống kê số lần có mặt, muộn, vắng của một sinh viên trong một lớp")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getAttendanceStatsByStudentAndClass(
            @PathVariable Long studentId,
            @PathVariable Long classId,
            HttpServletRequest servletRequest) {
        logger.info("Received request to get attendance stats for student ID: {} and class ID: {}", studentId, classId);
        ApiResponse<Map<String, Long>> response = attendanceLogService.getAttendanceStatsByStudentAndClass(studentId, classId, servletRequest);
        return ResponseEntity.ok(response);
    }

    /**
     * Lấy danh sách điểm danh của một buổi học
     */
    @GetMapping("/schedule/{scheduleId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('LECTURER')")
    @Operation(summary = "Lấy danh sách điểm danh theo lịch học", description = "Lấy danh sách điểm danh của tất cả sinh viên trong một lịch học cụ thể")
    public ResponseEntity<ApiResponse<List<AttendanceLog>>> getAttendanceBySchedule(
            @PathVariable Long scheduleId,
            HttpServletRequest servletRequest) {
        logger.info("Received request to get attendance for schedule ID: {}", scheduleId);
        ApiResponse<List<AttendanceLog>> response = attendanceLogService.getAttendanceBySchedule(scheduleId, servletRequest);
        return ResponseEntity.ok(response);
    }

    /**
     * Lấy lịch sử điểm danh của toàn bộ lớp
     */
    @GetMapping("/class/{classId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('LECTURER')")
    @Operation(summary = "Lấy lịch sử điểm danh của lớp", description = "Lấy toàn bộ lịch sử điểm danh của một lớp")
    public ResponseEntity<ApiResponse<List<AttendanceLog>>> getAttendanceHistoryByClass(
            @PathVariable Long classId,
            HttpServletRequest servletRequest) {
        logger.info("Received request to get attendance history for class ID: {}", classId);
        ApiResponse<List<AttendanceLog>> response = attendanceLogService.getAttendanceHistoryByClass(classId, servletRequest);
        return ResponseEntity.ok(response);
    }
}