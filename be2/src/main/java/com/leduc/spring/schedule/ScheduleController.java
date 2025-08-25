package com.leduc.spring.schedule;

import com.leduc.spring.exception.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/v1/schedules")
@Tag(name = "Schedule Management", description = "API quản lý lịch học")
@SecurityRequirement(name = "bearerAuth")
@RequiredArgsConstructor
public class ScheduleController {

    private static final Logger logger = LoggerFactory.getLogger(ScheduleController.class);

    private final ScheduleService scheduleService;

    @PostMapping
    @Operation(summary = "Tạo lịch học", description = "Tạo một lịch học mới cho lớp học, môn học, giảng viên và phòng học")
    public ResponseEntity<ApiResponse<CreateScheduleResponse>> createSchedule(
            @RequestBody CreateScheduleRequest request,
            HttpServletRequest servletRequest) {
        logger.info("Received request to create schedule: {}", request);
        ApiResponse<CreateScheduleResponse> response = scheduleService.createSchedule(request, servletRequest);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    @Operation(summary = "Lấy lịch học của tôi", description = "Lấy danh sách lịch học của người dùng hiện tại (admin, giảng viên hoặc sinh viên)")
    public ResponseEntity<ApiResponse<Object>> getMySchedule(HttpServletRequest servletRequest) {
        logger.info("Received request to get my schedules");
        ApiResponse<Object> response = scheduleService.getMySchedule(servletRequest);
        return ResponseEntity.ok(response);
    }

    /**
     * Lấy lịch học theo ID giảng viên
     * @param lecturerId ID của giảng viên
     * @param servletRequest Request HTTP để lấy thông tin xác thực
     * @return ApiResponse chứa danh sách lịch học của giảng viên
     */
    @GetMapping("/lecturer/{lecturerId}")
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
     * @param id ID của lịch học
     * @param request Thông tin yêu cầu cập nhật lịch học
     * @param servletRequest Request HTTP để lấy thông tin xác thực
     * @return ApiResponse chứa thông tin lịch học đã cập nhật
     */
    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật lịch học", description = "Cập nhật thông tin lịch học theo ID")
    public ResponseEntity<ApiResponse<Object>> updateSchedule(
            @PathVariable Long id,
            @RequestBody UpdateScheduleRequest request,
            HttpServletRequest servletRequest) {
        logger.info("Received request to update schedule ID: {}", id);
        ApiResponse<Object> response = scheduleService.updateSchedule(servletRequest, id, request);
        return ResponseEntity.ok(response);
    }

    /**
     * Xóa lịch học
     * @param id ID của lịch học
     * @param servletRequest Request HTTP để lấy thông tin xác thực
     * @return ApiResponse xác nhận xóa thành công
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa lịch học", description = "Xóa một lịch học theo ID")
    public ResponseEntity<ApiResponse<Object>> deleteSchedule(
            @PathVariable Long id,
            HttpServletRequest servletRequest) {
        logger.info("Received request to delete schedule ID: {}", id);
        ApiResponse<Object> response = scheduleService.deleteSchedule(servletRequest, id);
        return ResponseEntity.ok(response);
    }

    /**
     * Mở điểm danh cho lịch học
     * @param scheduleId ID của lịch học
     * @param servletRequest Request HTTP để lấy thông tin xác thực
     * @return ApiResponse chứa trạng thái isOpen
     */
    @PostMapping("/{scheduleId}/open")
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
     * @param scheduleId ID của lịch học
     * @param servletRequest Request HTTP để lấy thông tin xác thực
     * @return ApiResponse chứa thời gian đóng
     */
    @PostMapping("/{scheduleId}/close")
    @Operation(summary = "Đóng điểm danh", description = "Đóng điểm danh cho lịch học và trả về thời gian đóng")
    public ResponseEntity<ApiResponse<LocalDateTime>> closeAttendance(
            @PathVariable Long scheduleId,
            HttpServletRequest servletRequest) {
        logger.info("Received request to close attendance for schedule ID: {}", scheduleId);
        ApiResponse<LocalDateTime> response = scheduleService.closeAttendance(scheduleId, servletRequest);
        return ResponseEntity.ok(response);
    }
}
