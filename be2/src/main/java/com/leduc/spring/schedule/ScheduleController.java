package com.leduc.spring.schedule;

import com.leduc.spring.exception.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/schedules")
@RequiredArgsConstructor
@Tag(name = "Schedule Management", description = "API quản lý lịch học")
@SecurityRequirement(name = "bearerAuth")
public class ScheduleController {

    private final ScheduleService scheduleService;

    @PostMapping
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Operation(summary = "Tạo lịch học mới", description = "Chỉ admin có quyền tạo lịch học mới")
    public ResponseEntity<ApiResponse<CreateScheduleResponse>> createSchedule(
            @RequestBody CreateScheduleRequest request,
            HttpServletRequest servletRequest
    ) {
        ApiResponse<CreateScheduleResponse> response = scheduleService.createSchedule(request, servletRequest);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_LECTURER', 'ROLE_STUDENT')")
    @Operation(summary = "Lấy lịch cá nhân", description = "Giảng viên lấy lịch giảng dạy, sinh viên lấy lịch học, admin lấy tất cả lịch")
    public ResponseEntity<ApiResponse<Object>> getMySchedule(HttpServletRequest servletRequest) {
        ApiResponse<Object> response = scheduleService.getMySchedule(servletRequest);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/lecturer/{lecturerId}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Operation(summary = "Lấy lịch học theo ID giảng viên", description = "Chỉ admin có quyền lấy lịch học của giảng viên")
    public ResponseEntity<ApiResponse<Object>> getScheduleByLecturerId(
            @PathVariable("lecturerId") Long lecturerId,
            HttpServletRequest servletRequest
    ) {
        ApiResponse<Object> response = scheduleService.getScheduleByLecturerId(lecturerId, servletRequest);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Operation(summary = "Cập nhật lịch học", description = "Chỉ admin có quyền cập nhật thông tin lịch học")
    public ResponseEntity<ApiResponse<Object>> updateSchedule(
            @PathVariable("id") Long id,
            @RequestBody UpdateScheduleRequest request,
            HttpServletRequest servletRequest
    ) {
        ApiResponse<Object> response = scheduleService.updateSchedule(servletRequest, id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Operation(summary = "Xóa lịch học", description = "Chỉ admin có quyền xóa lịch học")
    public ResponseEntity<ApiResponse<Object>> deleteSchedule(
            @PathVariable("id") Long id,
            HttpServletRequest servletRequest
    ) {
        ApiResponse<Object> response = scheduleService.deleteSchedule(servletRequest, id);
        return ResponseEntity.ok(response);
    }
}