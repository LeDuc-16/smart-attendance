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
    @Query("SELECT s FROM Schedule s WHERE s.lecturer.id = :lecturerId")
    List<Schedule> findByLecturerId(@Param("lecturerId") Long lecturerId);

    // Tìm tất cả lịch học theo classEntityId
    @Query("SELECT s FROM Schedule s WHERE s.classEntity.id = :classId ")
    List<Schedule> findByClassEntityId(@Param("classId") Long classId);


}