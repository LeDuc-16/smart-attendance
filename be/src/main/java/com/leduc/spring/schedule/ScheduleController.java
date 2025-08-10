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
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/schedules")
@RequiredArgsConstructor
@Tag(name = "Schedule Management", description = "API quản lý lịch học")
@SecurityRequirement(name = "bearerAuth")
public class ScheduleController {

    private final ScheduleService scheduleService;

    @PostMapping
    @Operation(summary = "Tạo lịch học mới", description = "Chỉ admin có quyền tạo lịch học mới")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CreateScheduleResponse>> createSchedule(
            @RequestBody CreateScheduleRequest request,
            HttpServletRequest servletRequest
    ) {
        ApiResponse<CreateScheduleResponse> response = scheduleService.createSchedule(request, servletRequest);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
}