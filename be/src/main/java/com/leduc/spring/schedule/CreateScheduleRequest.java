package com.leduc.spring.schedule;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.Map;

@Data
public class CreateScheduleRequest {
    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    @FutureOrPresent(message = "End date must be today or in the future")
    private LocalDate endDate;

    @NotEmpty(message = "Days of week are required")
    private Map<DayOfWeek, TimeRange> days;

    @NotNull(message = "Course ID is required")
    @Min(value = 1, message = "Course ID must be positive")
    private Long courseId;

    @NotNull(message = "Lecturer ID is required")
    @Min(value = 1, message = "Lecturer ID must be positive")
    private Long lecturerId;

    @NotNull(message = "Class ID is required")
    @Min(value = 1, message = "Class ID must be positive")
    private Long classId;

    @NotNull(message = "Room ID is required")
    @Min(value = 1, message = "Room ID must be positive")
    private Long roomId;
}