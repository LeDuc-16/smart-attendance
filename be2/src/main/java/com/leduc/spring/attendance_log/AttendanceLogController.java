package com.leduc.spring.attendance_log;

import com.leduc.spring.exception.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/attendance-logs")
@RequiredArgsConstructor
public class AttendanceLogController {

        private final AttendanceLogService attendanceLogService;

        @PostMapping
        public ResponseEntity<ApiResponse<AttendanceLogResponse>> recordAttendance(
                        @RequestParam Long studentId,
                        @RequestParam Long scheduleId,
                        @RequestParam AttendanceStatus status,
                        @RequestParam(required = false) String note) {

                ApiResponse<AttendanceLogResponse> result = attendanceLogService.recordHistory(studentId, scheduleId,
                                status, note);
                return ResponseEntity.ok(result);
        }

        @GetMapping("/student/{studentId}")
        public ResponseEntity<List<AttendanceLog>> getAttendanceHistory(@PathVariable Long studentId) {
                List<AttendanceLog> history = attendanceLogService.getAttendanceHistory(studentId);
                return ResponseEntity.ok(history);
        }
}