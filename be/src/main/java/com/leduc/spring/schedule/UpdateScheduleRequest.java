package com.leduc.spring.schedule;

import lombok.Data;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.Map;

@Data
public class UpdateScheduleRequest {
    private Long courseId;
    private Long lecturerId;
    private Long classId;
    private Long roomId;
    private LocalDate startDate;
    private LocalDate endDate;
    private Map<DayOfWeek, TimeRange> days;
}