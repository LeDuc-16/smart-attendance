package com.leduc.spring.schedule;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateScheduleRequest {
    private LocalDate startDate;
    private LocalDate endDate;
    private List<DayOfWeek> dayOfWeek;
    private LocalTime startTime;
    private LocalTime endTime;
    private Long courseId;
    private Long lecturerId;
    private Long classId;
    private Long roomId;
}