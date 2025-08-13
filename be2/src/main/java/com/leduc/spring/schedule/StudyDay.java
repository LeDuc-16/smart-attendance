package com.leduc.spring.schedule;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.DayOfWeek;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudyDay {
    private DayOfWeek dayOfWeek;
    private LocalDate date;
}