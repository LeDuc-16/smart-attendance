package com.leduc.spring.schedule;

import com.leduc.spring.classes.ClassEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.transaction.Transactional;

import java.util.List;

@Transactional
public interface ScheduleRepository extends JpaRepository<Schedule, Long> {

    // Tìm tất cả lịch học theo lecturerId
    @Query("SELECT s FROM Schedule s WHERE s.lecturer.id = :lecturerId AND s.isOpen = true")
    List<Schedule> findByLecturerId(@Param("lecturerId") Long lecturerId);

    // Tìm tất cả lịch học theo classEntityId
    @Query("SELECT s FROM Schedule s WHERE s.classEntity.id = :classId AND s.isOpen = true")
    List<Schedule> findByClassEntityId(@Param("classId") Long classId);

    // Tìm tất cả lớp có lịch học đang mở điểm danh
    @Query("SELECT DISTINCT s.classEntity FROM Schedule s WHERE s.isOpen = true")
    List<ClassEntity> findClassesWithOpenAttendance();

    // Tìm tất cả lớp có lịch học đang đóng điểm danh
    @Query("SELECT DISTINCT s.classEntity FROM Schedule s WHERE s.isOpen = false")
    List<ClassEntity> findClassesWithClosedAttendance();
}