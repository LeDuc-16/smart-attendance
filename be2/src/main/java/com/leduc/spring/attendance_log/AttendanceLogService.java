package com.leduc.spring.attendance_log;

import com.leduc.spring.exception.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AttendanceLogService {

        private final AttendanceLogRepository attendanceLogRepository;

        @Transactional
        public ApiResponse<AttendanceLogResponse> recordHistory(Long studentId, Long scheduleId,
                        AttendanceStatus status, String note) {
                AttendanceLog log = new AttendanceLog();
                log.setStudentId(studentId);
                log.setScheduleId(scheduleId);
                log.setStatus(status);
                log.setNote(note);
                log.setCreatedAt(LocalDateTime.now());

                AttendanceLog savedLog = attendanceLogRepository.save(log);

                AttendanceLogResponse response = new AttendanceLogResponse(
                        savedLog.getId(),
                        savedLog.getStudentId(),
                        savedLog.getScheduleId(),
                        savedLog.getStatus().name(),
                        savedLog.getNote(),
                        savedLog.getCreatedAt()
                );

                return new ApiResponse<>(200, "Ghi lịch sử điểm danh thành công", "/api/v1/attendance-logs", response);
        }

        public List<AttendanceLog> getAttendanceHistory(Long studentId) {
                return attendanceLogRepository.findByStudentId(studentId);
        }
}