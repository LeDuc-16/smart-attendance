package com.leduc.spring.schedule;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
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
public class CreateScheduleRequest {
    private LocalDate startDate;
    private LocalDate endDate;
    private List<DayOfWeek> dayOfWeek;
    @Schema(type = "string", example = "08:00:00")
    @JsonFormat(pattern = "HH:mm:ss")
    private LocalTime startTime;

    @Schema(type = "string", example = "10:00:00")
    @JsonFormat(pattern = "HH:mm:ss")
    private LocalTime endTime;

    private Long courseId;
    private Long lecturerId;
    private Long classId;
    private Long roomId;
}