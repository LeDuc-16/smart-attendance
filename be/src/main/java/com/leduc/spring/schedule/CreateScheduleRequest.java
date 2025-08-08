package com.leduc.spring.schedule;

import java.time.LocalDate;

public class CreateScheduleRequest {
    private String courseName;
    private TimeRange timeRange;
    private LocalDate startDate;
    private LocalDate endDate;
    private Long lecturerId;
    private Long classId;
}
