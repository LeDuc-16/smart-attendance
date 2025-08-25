package com.leduc.spring.schedule;

import com.leduc.spring.classes.ClassEntity;
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

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/schedules")
@RequiredArgsConstructor
@Tag(name = "Schedule Management", description = "API quản lý lịch học")
@SecurityRequirement(name = "bearerAuth")
public class ScheduleController {

    private static final Logger logger = LoggerFactory.getLogger(ScheduleController.class);

    private final ScheduleService scheduleService;
    private final JwtService jwtService;

    /**
     * Tạo lịch học mới
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Tạo lịch học", description = "Tạo một lịch học mới cho lớp học, môn học, giảng viên và phòng học")
    public ResponseEntity<ApiResponse<CreateScheduleResponse>> createSchedule(
            @RequestBody CreateScheduleRequest request,
            HttpServletRequest servletRequest) {
        logger.info("Received request to create schedule: {}", request);
        ApiResponse<CreateScheduleResponse> response = scheduleService.createSchedule(request, servletRequest);
        return ResponseEntity.ok(response);
    }

    /**
     * Lấy lịch học của người dùng hiện tại
     */
    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER', 'STUDENT')")
    @Operation(summary = "Lấy lịch học của tôi", description = "Lấy danh sách lịch học của người dùng hiện tại (admin, giảng viên hoặc sinh viên)")
    public ResponseEntity<ApiResponse<Object>> getMySchedule(HttpServletRequest servletRequest) {
        logger.info("Received request to get my schedules");
        String authHeader = servletRequest.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            logger.error("Invalid or missing Authorization header");
            throw new IllegalArgumentException("Invalid or missing Authorization header");
        }
        String jwt = authHeader.substring(7);
        Long userId = jwtService.extractUserId(jwt);
        String role = jwtService.extractRole(jwt);
        ApiResponse<Object> response = scheduleService.getMySchedule(userId, role, servletRequest);
        return ResponseEntity.ok(response);
    }

    /**
     * Lấy lịch học theo ID giảng viên
     */
    @GetMapping("/lecturer/{lecturerId}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('LECTURER') and @scheduleService.isLecturer(#lecturerId, authentication.principal.userId))")
    @Operation(summary = "Lấy lịch học theo giảng viên", description = "Lấy danh sách lịch học của một giảng viên theo ID")
    public ResponseEntity<ApiResponse<Object>> getScheduleByLecturerId(
            @PathVariable Long lecturerId,
            HttpServletRequest servletRequest) {
        logger.info("Received request to get schedules for lecturer ID: {}", lecturerId);
        ApiResponse<Object> response = scheduleService.getScheduleByLecturerId(lecturerId, servletRequest);
        return ResponseEntity.ok(response);
    }

    /**
     * Cập nhật lịch học
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Cập nhật lịch học", description = "Cập nhật thông tin lịch học theo ID")
    public ResponseEntity<ApiResponse<Object>> updateSchedule(
            @PathVariable Long id,
            @RequestBody UpdateScheduleRequest request,
            HttpServletRequest servletRequest) {
        logger.info("Received request to update schedule ID: {}", id);
        ApiResponse<Object> response = scheduleService.updateSchedule(id, request, servletRequest);
        return ResponseEntity.ok(response);
    }

    /**
     * Xóa lịch học
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Xóa lịch học", description = "Xóa một lịch học theo ID")
    public ResponseEntity<ApiResponse<Object>> deleteSchedule(
            @PathVariable Long id,
            HttpServletRequest servletRequest) {
        logger.info("Received request to delete schedule ID: {}", id);
        ApiResponse<Object> response = scheduleService.deleteSchedule(id, servletRequest);
        return ResponseEntity.ok(response);
    }

    /**
     * Mở điểm danh cho lịch học
     */
    @PostMapping("/{scheduleId}/open")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('LECTURER') and @scheduleService.isScheduleOwner(#scheduleId, authentication.principal.userId))")
    @Operation(summary = "Mở điểm danh", description = "Mở điểm danh cho lịch học, chỉ admin hoặc giảng viên được phép")
    public ResponseEntity<ApiResponse<Boolean>> openAttendance(
            @PathVariable Long scheduleId,
            HttpServletRequest servletRequest) {
        logger.info("Received request to open attendance for schedule ID: {}", scheduleId);
        ApiResponse<Boolean> response = scheduleService.openAttendance(scheduleId, servletRequest);
        return ResponseEntity.ok(response);
    }

    /**
     * Đóng điểm danh cho lịch học
     */
    @PostMapping("/{scheduleId}/close")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('LECTURER') and @scheduleService.isScheduleOwner(#scheduleId, authentication.principal.userId))")
    @Operation(summary = "Đóng điểm danh", description = "Đóng điểm danh cho lịch học và trả về thời gian đóng")
    public ResponseEntity<ApiResponse<LocalDateTime>> closeAttendance(
            @PathVariable Long scheduleId,
            HttpServletRequest servletRequest) {
        logger.info("Received request to close attendance for schedule ID: {}", scheduleId);
        ApiResponse<LocalDateTime> response = scheduleService.closeAttendance(scheduleId, servletRequest);
        return ResponseEntity.ok(response);
    }

    /**
     * Lấy danh sách lớp có lịch học đang mở điểm danh
     */
    @GetMapping("/classes/open")
    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER')")
    @Operation(summary = "Lấy danh sách lớp đang mở điểm danh", description = "Lấy danh sách các lớp có lịch học đang mở điểm danh")
    public ResponseEntity<ApiResponse<List<ClassEntity>>> getClassesWithOpenAttendance(HttpServletRequest servletRequest) {
        logger.info("Received request to get classes with open attendance");
        ApiResponse<List<ClassEntity>> response = scheduleService.getClassesWithOpenAttendance(servletRequest);
        return ResponseEntity.ok(response);
    }

    /**
     * Lấy danh sách lớp có lịch học đang đóng điểm danh
     */
    @GetMapping("/classes/closed")
    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER')")
    @Operation(summary = "Lấy danh sách lớp đang đóng điểm danh", description = "Lấy danh sách các lớp có lịch học đang đóng điểm danh")
    public ResponseEntity<ApiResponse<List<ClassEntity>>> getClassesWithClosedAttendance(HttpServletRequest servletRequest) {
        logger.info("Received request to get classes with closed attendance");
        ApiResponse<List<ClassEntity>> response = scheduleService.getClassesWithClosedAttendance(servletRequest);
        return ResponseEntity.ok(response);
    }
}