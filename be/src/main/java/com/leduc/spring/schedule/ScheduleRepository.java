package com.leduc.spring.schedule;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;

@Repository
public interface ScheduleRepository extends JpaRepository<Schedule, Long> {
    // Kiểm tra lớp có lịch học vào ngày cụ thể trong khoảng thời gian
    @Query("SELECT CASE WHEN COUNT(s) > 0 THEN true ELSE false END FROM Schedule s " +
            "JOIN s.days d " +
            "WHERE s.classEntity.id = :classId " +
            "AND KEY(d) = :dayOfWeek " +
            "AND s.startDate <= :endDate " +
            "AND s.endDate >= :startDate")
    boolean existsByClassAndDay(
            Long classId,
            DayOfWeek dayOfWeek,
            LocalDate startDate,
            LocalDate endDate
    );

    // Kiểm tra giờ học trùng
    @Query("SELECT CASE WHEN COUNT(s) > 0 THEN true ELSE false END FROM Schedule s " +
            "JOIN s.days d " +
            "WHERE s.classEntity.id = :classId " +
            "AND KEY(d) = :dayOfWeek " +
            "AND s.startDate <= :endDate " +
            "AND s.endDate >= :startDate " +
            "AND (VALUE(d).startTime <= :endTime AND VALUE(d).endTime >= :startTime)")
    boolean existsByClassAndDayAndTime(
            Long classId,
            DayOfWeek dayOfWeek,
            LocalDate startDate,
            LocalDate endDate,
            LocalTime startTime,
            LocalTime endTime
    );

    // Kiểm tra phòng trùng
    @Query("SELECT CASE WHEN COUNT(s) > 0 THEN true ELSE false END FROM Schedule s " +
            "JOIN s.days d " +
            "WHERE s.classEntity.id = :classId " +
            "AND KEY(d) = :dayOfWeek " +
            "AND s.startDate <= :endDate " +
            "AND s.endDate >= :startDate " +
            "AND (VALUE(d).startTime <= :endTime AND VALUE(d).endTime >= :startTime) " +
            "AND s.room.id = :roomId")
    boolean existsByClassAndDayAndTimeAndRoom(
            Long classId,
            DayOfWeek dayOfWeek,
            LocalDate startDate,
            LocalDate endDate,
            LocalTime startTime,
            LocalTime endTime,
            Long roomId
    );

    // Kiểm tra giảng viên trùng
    @Query("SELECT CASE WHEN COUNT(s) > 0 THEN true ELSE false END FROM Schedule s " +
            "JOIN s.days d " +
            "WHERE s.classEntity.id = :classId " +
            "AND KEY(d) = :dayOfWeek " +
            "AND s.startDate <= :endDate " +
            "AND s.endDate >= :startDate " +
            "AND (VALUE(d).startTime <= :endTime AND VALUE(d).endTime >= :startTime) " +
            "AND s.lecturer.id = :lecturerId")
    boolean existsByClassAndDayAndTimeAndLecturer(
            Long classId,
            DayOfWeek dayOfWeek,
            LocalDate startDate,
            LocalDate endDate,
            LocalTime startTime,
            LocalTime endTime,
            Long lecturerId
    );
}