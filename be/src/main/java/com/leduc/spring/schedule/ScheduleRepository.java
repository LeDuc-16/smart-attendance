package com.leduc.spring.schedule;

import com.leduc.spring.lecturer.Lecturer;
import com.leduc.spring.room.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import jakarta.transaction.Transactional;
import java.time.LocalDate;
import java.time.LocalTime;

@Transactional
public interface ScheduleRepository extends JpaRepository<Schedule, Long> {
    boolean existsByRoomAndDateAndTime(Room room, LocalDate date, LocalTime startTime, LocalTime endTime);
    boolean existsByLecturerAndDateAndTime(Lecturer lecturer, LocalDate date, LocalTime startTime, LocalTime endTime);
}