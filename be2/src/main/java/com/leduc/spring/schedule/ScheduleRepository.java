package com.leduc.spring.schedule;

import com.leduc.spring.lecturer.Lecturer;
import com.leduc.spring.room.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.transaction.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Transactional
public interface ScheduleRepository extends JpaRepository<Schedule, Long> {

    // Tìm tất cả lịch học theo lecturerId
    @Query("SELECT s FROM Schedule s WHERE s.lecturer.id = :lecturerId AND s.isOpen = true")
    List<Schedule> findByLecturerId(@Param("lecturerId") Long lecturerId);

    // Tìm tất cả lịch học theo classEntityId
    @Query("SELECT s FROM Schedule s WHERE s.classEntity.id = :classId AND s.isOpen = true")
    List<Schedule> findByClassEntityId(@Param("classId") Long classId);
}