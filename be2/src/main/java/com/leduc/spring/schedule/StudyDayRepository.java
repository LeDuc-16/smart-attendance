package com.leduc.spring.schedule;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface StudyDayRepository extends JpaRepository<StudyDay, Long> {

    @Query("SELECT sd FROM StudyDay sd WHERE sd.schedule.id = :scheduleId ORDER BY sd.date")
    List<StudyDay> findByScheduleId(@Param("scheduleId") Long scheduleId);

    @Query("SELECT sd FROM StudyDay sd WHERE sd.schedule.id = :scheduleId AND sd.date = :date")
    StudyDay findByScheduleIdAndDate(@Param("scheduleId") Long scheduleId, @Param("date") LocalDate date);
}
