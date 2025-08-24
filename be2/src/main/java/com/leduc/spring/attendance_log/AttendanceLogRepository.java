package com.leduc.spring.attendance_log;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttendanceLogRepository extends JpaRepository<AttendanceLog, Long> {
    /**
     * Tìm danh sách bản ghi điểm danh theo studentId và classId
     */
    List<AttendanceLog> findByStudentIdAndClassEntityId(Long studentId, Long classId);

    /**
     * Tìm danh sách bản ghi điểm danh theo studentId và courseId
     */
    List<AttendanceLog> findByStudentIdAndCourseId(Long studentId, Long courseId);

    /**
     * Tìm danh sách bản ghi điểm danh theo scheduleId
     */
    List<AttendanceLog> findByScheduleId(Long scheduleId);

    /**
     * Tìm danh sách bản ghi điểm danh theo classId
     */
    List<AttendanceLog> findByClassEntityId(Long classId);
}