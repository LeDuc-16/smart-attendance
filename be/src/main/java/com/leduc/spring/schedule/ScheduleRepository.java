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

@Transactional
public interface ScheduleRepository extends JpaRepository<Schedule, Long> {

}