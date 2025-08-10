package com.leduc.spring.schedule;

import com.leduc.spring.classes.ClassEntity;
import com.leduc.spring.course.Course;
import com.leduc.spring.lecturer.Lecturer;
import com.leduc.spring.room.Room;
import com.leduc.spring.schedule.WeekSchedule;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateScheduleResponse {
    private Long id; // ID của lịch học
    private LocalTime startTime;
    private LocalTime endTime;
    private Course course;
    private Lecturer lecturer;
    private ClassEntity classEntity;
    private Room room;
    private List<WeekSchedule> weeks; // Danh sách các tuần
}