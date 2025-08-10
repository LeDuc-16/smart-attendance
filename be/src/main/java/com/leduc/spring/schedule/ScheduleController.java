package com.leduc.spring.schedule;

import com.leduc.spring.exception.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/v1/schedules")
@RequiredArgsConstructor
@Tag(name = "Schedule Management", description = "API quản lý lịch học")
@SecurityRequirement(name = "bearerAuth")
public class ScheduleController {

    private final ScheduleService scheduleService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Tạo lịch học", description = "Chỉ admin có quyền tạo lịch học")
    public ResponseEntity<ApiResponse<Object>> createSchedule(
            @RequestBody CreateScheduleRequest request,
            HttpServletRequest servletRequest
    ) {
        ApiResponse<Object> response = scheduleService.addSchedule(request, servletRequest);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Lấy danh sách lịch học", description = "Admin và giảng viên có quyền xem danh sách lịch học")
    public ResponseEntity<ApiResponse<Object>> listSchedules(
            HttpServletRequest servletRequest
    ) {
        ApiResponse<Object> response = scheduleService.getAllSchedules(servletRequest);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy chi tiết lịch học", description = "Admin và giảng viên có quyền xem chi tiết lịch học")
    public ResponseEntity<ApiResponse<Object>> getSchedule(
            @PathVariable("id") Long id,
            HttpServletRequest servletRequest
    ) {
        ApiResponse<Object> response = scheduleService.getScheduleById(id, servletRequest);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Cập nhật lịch học", description = "Chỉ admin có quyền cập nhật lịch học")
    public ResponseEntity<ApiResponse<Object>> updateSchedule(
            @PathVariable("id") Long id,
            @RequestBody UpdateScheduleRequest request,
            HttpServletRequest servletRequest
    ) {
        ApiResponse<Object> response = scheduleService.updateSchedule(id, request, servletRequest);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Xóa lịch học", description = "Chỉ admin có quyền xóa lịch học")
    public ResponseEntity<ApiResponse<Object>> deleteSchedule(
            @PathVariable("id") Long id,
            HttpServletRequest servletRequest
    ) {
        ApiResponse<Object> response = scheduleService.deleteSchedule(id, servletRequest);
        return ResponseEntity.ok(response);
    }
}