package com.leduc.spring.attendance_log;

import com.leduc.spring.student.Student;
import com.leduc.spring.classes.ClassEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AttendanceLogRepository extends JpaRepository<AttendanceLog, Long> {

    // Tìm lịch sử điểm danh của một sinh viên
    List<AttendanceLog> findByStudentOrderByAttendanceTimeDesc(Student student);

    // Tìm lịch sử điểm danh của một sinh viên trong một lớp
    List<AttendanceLog> findByStudentAndClassEntityOrderByAttendanceTimeDesc(Student student, ClassEntity classEntity);

    // Tìm lịch sử điểm danh theo trạng thái
    List<AttendanceLog> findByStatusOrderByAttendanceTimeDesc(AttendanceStatus status);

    // Tìm lịch sử điểm danh trong khoảng thời gian
    @Query("SELECT al FROM AttendanceLog al WHERE al.attendanceTime BETWEEN :startTime AND :endTime ORDER BY al.attendanceTime DESC")
    List<AttendanceLog> findByAttendanceTimeBetweenOrderByAttendanceTimeDesc(
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime);

    // Tìm lịch sử điểm danh của một lớp
    List<AttendanceLog> findByClassEntityOrderByAttendanceTimeDesc(ClassEntity classEntity);


}
