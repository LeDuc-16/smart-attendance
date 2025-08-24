package com.leduc.spring.attendance_log;

import com.leduc.spring.classes.ClassEntity;
import com.leduc.spring.course.Course;
import com.leduc.spring.lecturer.Lecturer;
import com.leduc.spring.schedule.Schedule;
import com.leduc.spring.schedule.ScheduleRepository;
import com.leduc.spring.student.Student;
import com.leduc.spring.student.StudentRepository;
import com.leduc.spring.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Service
@RequiredArgsConstructor
public class AttendanceLogService {

    private static final Logger logger = LoggerFactory.getLogger(AttendanceLogService.class);
    private final AttendanceLogRepository attendanceLogRepository;
    private final StudentRepository studentRepository;
    private final ScheduleRepository scheduleRepository;

    @Transactional
    public AttendanceResponse createAttendanceLog(AttendanceRequest request) {
        // Lấy thông tin sinh viên
        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Student with id [%s] not found".formatted(request.getStudentId())));

        // Lấy thông tin lịch học
        Schedule schedule = scheduleRepository.findById(request.getScheduleId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Schedule with id [%s] not found".formatted(request.getScheduleId())));

        // Xác định trạng thái điểm danh
        AttendanceStatus status = determineAttendanceStatus(schedule.getStartTime());

        // Tạo bản ghi điểm danh
        AttendanceLog attendanceLog = AttendanceLog.builder()
                .student(student)
                .classEntity(schedule.getClassEntity())
                .course(schedule.getCourse())
                .lecturer(schedule.getLecturer())
                .schedule(schedule) // Liên kết với Schedule
                .status(status)
                .note("Điểm danh bằng nhận diện khuôn mặt")
                .build();

        attendanceLogRepository.save(attendanceLog);
        logger.info("Saved attendance log for studentId: {} at {}", student.getId(), LocalDateTime.now());

        // Trả về response
        return AttendanceResponse.builder()
                .attendanceId(attendanceLog.getId())
                .studentId(student.getId())
                .scheduleId(schedule.getId())
                .classId(schedule.getClassEntity().getId())
                .courseId(schedule.getCourse().getId())
                .lecturerId(schedule.getLecturer().getId())
                .status(attendanceLog.getStatus())
                .attendanceTime(attendanceLog.getCreatedAt())
                .note(attendanceLog.getNote())
                .build();
    }

    private AttendanceStatus determineAttendanceStatus(LocalTime scheduledStartTime) {
        LocalTime currentTime = LocalTime.now();
        // Giả định nếu điểm danh muộn hơn 15 phút thì là LATE
        LocalTime lateThreshold = scheduledStartTime.plusMinutes(15);
        return currentTime.isAfter(lateThreshold) ? AttendanceStatus.LATE : AttendanceStatus.PRESENT;
    }
}