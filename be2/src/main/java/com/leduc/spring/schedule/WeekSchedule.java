package com.leduc.spring.schedule;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WeekSchedule {
    private int weekNumber;
    private LocalDate startDate;
    private LocalDate endDate;
    private List<StudyDay> studyDays;
}