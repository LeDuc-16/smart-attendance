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
    @Operation(summary = "Tạo lịch học mới", description = "Chỉ admin có quyền tạo lịch học mới")
    public ResponseEntity<ApiResponse<CreateScheduleResponse>> createSchedule(
            @RequestBody CreateScheduleRequest request,
            HttpServletRequest servletRequest
    ) {
        ApiResponse<CreateScheduleResponse> response = scheduleService.createSchedule(request, servletRequest);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Lấy danh sách lịch học", description = "Admin và giảng viên có quyền xem danh sách lịch học")
    public ResponseEntity<ApiResponse<Object>> listSchedules(HttpServletRequest servletRequest) {
        return ResponseEntity.ok(scheduleService.listSchedules(servletRequest));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật lịch học", description = "Chỉ admin có quyền cập nhật thông tin lịch học")
    public ResponseEntity<ApiResponse<Object>> updateSchedule(
            @PathVariable("id") Long id,
            @RequestBody UpdateScheduleRequest request,
            HttpServletRequest servletRequest
    ) {
        return ResponseEntity.ok(scheduleService.updateSchedule(servletRequest, id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa lịch học", description = "Chỉ admin có quyền xóa lịch học")
    public ResponseEntity<ApiResponse<Object>> deleteSchedule(
            @PathVariable("id") Long id,
            HttpServletRequest servletRequest
    ) {
        return ResponseEntity.ok(scheduleService.deleteSchedule(servletRequest, id));
    }
}