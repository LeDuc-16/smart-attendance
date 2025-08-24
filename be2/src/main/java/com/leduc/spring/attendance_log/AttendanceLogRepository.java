package com.leduc.spring.attendance_log;

import com.leduc.spring.classes.ClassEntity;
import com.leduc.spring.schedule.Schedule;
import com.leduc.spring.student.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AttendanceLogRepository extends JpaRepository<AttendanceLog, Long> {

    // Tìm tất cả bản ghi điểm danh của một sinh viên
    List<AttendanceLog> findByStudent(Student student);

    // Tìm tất cả bản ghi điểm danh của một sinh viên trong một lớp học
    List<AttendanceLog> findByStudentAndClassEntity(Student student, ClassEntity classEntity);

    // Tìm tất cả bản ghi điểm danh theo lịch học
    List<AttendanceLog> findBySchedule(Schedule schedule);

    // Tìm tất cả bản ghi điểm danh của một sinh viên trong một khoảng thời gian
    @Query("SELECT al FROM AttendanceLog al WHERE al.student = :student AND al.createdAt BETWEEN :startDate AND :endDate")
    List<AttendanceLog> findByStudentAndCreatedAtBetween(
            @Param("student") Student student,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    @Query("SELECT al FROM AttendanceLog al WHERE al.classEntity = :classEntity AND al.createdAt >= :date AND al.createdAt < :date + 1")
    List<AttendanceLog> findByClassEntityAndDate(
            @Param("classEntity") ClassEntity classEntity,
            @Param("date") LocalDate date
    );

    // Đếm số lần điểm danh của một sinh viên theo trạng thái trong một lịch học
    @Query("SELECT COUNT(al) FROM AttendanceLog al WHERE al.student = :student AND al.schedule = :schedule AND al.status = :status")
    long countByStudentAndScheduleAndStatus(
            @Param("student") Student student,
            @Param("schedule") Schedule schedule,
            @Param("status") AttendanceStatus status
    );

}