package com.leduc.spring.attendance_log;

import com.leduc.spring.classes.ClassEntity;
import com.leduc.spring.course.Course;
import com.leduc.spring.exception.ApiResponse;
import com.leduc.spring.exception.ResourceNotFoundException;
import com.leduc.spring.lecturer.Lecturer;
import com.leduc.spring.schedule.Schedule;
import com.leduc.spring.schedule.ScheduleRepository;
import com.leduc.spring.student.Student;
import com.leduc.spring.student.StudentRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AttendanceLogService {

    private static final Logger logger = LoggerFactory.getLogger(AttendanceLogService.class);

    @Autowired
    private AttendanceLogRepository attendanceLogRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private ScheduleRepository scheduleRepository;

    /**
     * Ghi log điểm danh cho sinh viên
     */
    @Transactional

    public ApiResponse<AttendanceLog> recordHistory(Long studentId, Long scheduleId, AttendanceStatus status,
            String note, HttpServletRequest servletRequest) {
        // Tìm sinh viên
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sinh viên với ID: " + studentId));

        // Tìm lịch học
        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lịch học với ID: " + scheduleId));

        // Lấy thông tin từ lịch học
        ClassEntity classEntity = schedule.getClassEntity();
        Course course = schedule.getCourse();
        Lecturer lecturer = schedule.getLecturer();
        LocalDate sessionDate = LocalDate.now();
        LocalTime scheduledStartTime = schedule.getStartTime();
        LocalTime scheduledEndTime = schedule.getEndTime();
        LocalDateTime attendanceTime = LocalDateTime.now();

        // Tạo bản ghi điểm danh
        AttendanceLog attendanceLog = AttendanceLog.builder()
                .student(student)
                .classEntity(classEntity)
                .course(course)

                .schedule(schedule)
                .lecturer(lecturer)
                .sessionDate(sessionDate)
                .scheduledStartTime(scheduledStartTime)
                .scheduledEndTime(scheduledEndTime)
                .attendanceTime(attendanceTime)
                .status(status)
                .note(note != null ? note : "")
                .build();

        // Lưu vào CSDL
        AttendanceLog savedLog = attendanceLogRepository.save(attendanceLog);

        logger.info("Đã ghi log điểm danh cho sinh viên ID: {} trong lịch ID: {} với trạng thái: {}", studentId,
                scheduleId, status);

        return ApiResponse.success(savedLog, "Điểm danh thành công", servletRequest.getRequestURI());
    }

    /**
     * Lấy lịch sử điểm danh của sinh viên theo lớp
     */
    @Transactional(readOnly = true)
    public ApiResponse<List<AttendanceLog>> getAttendanceHistoryByStudentAndClass(
            Long studentId, Long classId, HttpServletRequest servletRequest) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sinh viên với ID: " + studentId));


        List<AttendanceLog> attendanceLogs = attendanceLogRepository.findByStudentIdAndClassEntityId(studentId,
                classId);
        if (attendanceLogs.isEmpty()) {
            logger.info("Không tìm thấy lịch sử điểm danh cho sinh viên ID: {} trong lớp ID: {}", studentId, classId);
            return ApiResponse.success(attendanceLogs, "Không có lịch sử điểm danh", servletRequest.getRequestURI());
        }


        logger.info("Lấy được {} bản ghi điểm danh cho sinh viên ID: {} trong lớp ID: {}", attendanceLogs.size(),
                studentId, classId);
        return ApiResponse.success(attendanceLogs, "Lấy lịch sử điểm danh thành công", servletRequest.getRequestURI());
    }

    /**
     * Lấy lịch sử điểm danh của sinh viên theo khóa học
<<<<<<< HEAD
     * @param studentId ID của sinh viên
     * @param courseId ID của khóa học
=======
     * 
     * @param studentId      ID của sinh viên
     * @param courseId       ID của khóa học
>>>>>>> f82db7366760b358df0511bd61daa959bae64cf1
     * @param servletRequest Request HTTP để lấy đường dẫn
     * @return ApiResponse chứa danh sách lịch sử điểm danh
     */
    @Transactional(readOnly = true)
    public ApiResponse<List<AttendanceLog>> getAttendanceHistoryByStudentAndCourse(
            Long studentId, Long courseId, HttpServletRequest servletRequest) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sinh viên với ID: " + studentId));

        List<AttendanceLog> attendanceLogs = attendanceLogRepository.findByStudentIdAndCourseId(studentId, courseId);
        if (attendanceLogs.isEmpty()) {

            logger.info("Không tìm thấy lịch sử điểm danh cho sinh viên ID: {} trong khóa học ID: {}", studentId,
                    courseId);
            return ApiResponse.success(attendanceLogs, "Không có lịch sử điểm danh", servletRequest.getRequestURI());
        }

        logger.info("Lấy được {} bản ghi điểm danh cho sinh viên ID: {} trong khóa học ID: {}", attendanceLogs.size(),
                studentId, courseId);
        return ApiResponse.success(attendanceLogs, "Lấy lịch sử điểm danh thành công", servletRequest.getRequestURI());
    }

    /**
     * Lấy thống kê điểm danh của sinh viên theo lớp
<<<<<<< HEAD
     * @param studentId ID của sinh viên
     * @param classId ID của lớp học
=======
     * 
     * @param studentId      ID của sinh viên
     * @param classId        ID của lớp học
>>>>>>> f82db7366760b358df0511bd61daa959bae64cf1
     * @param servletRequest Request HTTP để lấy đường dẫn
     * @return ApiResponse chứa thống kê (số lần PRESENT, LATE, ABSENT)
     */
    @Transactional(readOnly = true)
    public ApiResponse<Map<String, Long>> getAttendanceStatsByStudentAndClass(
            Long studentId, Long classId, HttpServletRequest servletRequest) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sinh viên với ID: " + studentId));

        List<AttendanceLog> attendanceLogs = attendanceLogRepository.findByStudentIdAndClassEntityId(studentId,
                classId);
        Map<String, Long> stats = new HashMap<>();
        stats.put("PRESENT", 0L);
        stats.put("LATE", 0L);
        stats.put("ABSENT", 0L);

        for (AttendanceLog log : attendanceLogs) {
            String status = log.getStatus().name();
            stats.put(status, stats.get(status) + 1);
        }

        logger.info("Lấy thống kê điểm danh cho sinh viên ID: {} trong lớp ID: {}", studentId, classId);
        return ApiResponse.success(stats, "Lấy thống kê điểm danh thành công", servletRequest.getRequestURI());
    }

    /**
     * Lấy danh sách điểm danh của một buổi học
<<<<<<< HEAD
     * @param scheduleId ID của lịch học
=======
     * 
     * @param scheduleId     ID của lịch học
>>>>>>> f82db7366760b358df0511bd61daa959bae64cf1
     * @param servletRequest Request HTTP để lấy đường dẫn
     * @return ApiResponse chứa danh sách điểm danh
     */
    @Transactional(readOnly = true)
    public ApiResponse<List<AttendanceLog>> getAttendanceBySchedule(
            Long scheduleId, HttpServletRequest servletRequest) {
        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lịch học với ID: " + scheduleId));

        List<AttendanceLog> attendanceLogs = attendanceLogRepository.findByScheduleId(scheduleId);
        if (attendanceLogs.isEmpty()) {
            logger.info("Không tìm thấy bản ghi điểm danh cho lịch học ID: {}", scheduleId);
            return ApiResponse.success(attendanceLogs, "Không có bản ghi điểm danh", servletRequest.getRequestURI());
        }

        logger.info("Lấy được {} bản ghi điểm danh cho lịch học ID: {}", attendanceLogs.size(), scheduleId);

        return ApiResponse.success(attendanceLogs, "Lấy danh sách điểm danh thành công",
                servletRequest.getRequestURI());
    }

    /**
     * Lấy lịch sử điểm danh của toàn bộ lớp
<<<<<<< HEAD
     * @param classId ID của lớp học
=======
     * 
     * @param classId        ID của lớp học
>>>>>>> f82db7366760b358df0511bd61daa959bae64cf1
     * @param servletRequest Request HTTP để lấy đường dẫn
     * @return ApiResponse chứa danh sách lịch sử điểm danh
     */
    @Transactional(readOnly = true)
    public ApiResponse<List<AttendanceLog>> getAttendanceHistoryByClass(
            Long classId, HttpServletRequest servletRequest) {
        List<AttendanceLog> attendanceLogs = attendanceLogRepository.findByClassEntityId(classId);
        if (attendanceLogs.isEmpty()) {
            logger.info("Không tìm thấy lịch sử điểm danh cho lớp ID: {}", classId);
            return ApiResponse.success(attendanceLogs, "Không có lịch sử điểm danh", servletRequest.getRequestURI());
        }

        logger.info("Lấy được {} bản ghi điểm danh cho lớp ID: {}", attendanceLogs.size(), classId);
        return ApiResponse.success(attendanceLogs, "Lấy lịch sử điểm danh thành công", servletRequest.getRequestURI());
    }

}
