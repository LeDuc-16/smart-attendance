//
//package com.leduc.spring.attendance_log;
//
//import com.leduc.spring.exception.ApiResponse;
//import jakarta.servlet.http.HttpServletRequest;
//import lombok.RequiredArgsConstructor;
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//import org.springframework.http.HttpStatus;
//import org.springframework.web.bind.annotation.*;
//
//@RestController
//@RequestMapping("/api/v1/attendance")
//@RequiredArgsConstructor
//public class AttendanceLogController {
//
//    private static final Logger logger = LoggerFactory.getLogger(AttendanceLogController.class);
//    private final AttendanceLogService attendanceLogService;
//
//    @PostMapping("/log")
//    @ResponseStatus(HttpStatus.CREATED)
//    public ApiResponse<AttendanceResponse> createAttendanceLog(
//            @RequestBody AttendanceRequest request,
//            HttpServletRequest servletRequest
//    ) {
//        logger.info("Received request to create attendance log for studentId: {} and scheduleId: {}",
//                request.getStudentId(), request.getScheduleId());
//        try {
//            AttendanceResponse response = attendanceLogService.createAttendanceLog(request);
//            return ApiResponse.success(
//                    response,
//                    "Attendance log created successfully",
//                    servletRequest.getRequestURI()
//            );
//        } catch (Exception e) {
//            logger.error("Failed to create attendance log for studentId {}: {}",
//                    request.getStudentId(), e.getMessage(), e);
//            throw e; // Ném lại ngoại lệ để được xử lý bởi GlobalExceptionHandler (nếu có)
//        }
//    }
//}