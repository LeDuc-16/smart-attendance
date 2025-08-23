package com.leduc.spring.schedule;

import org.springframework.stereotype.Component;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class ScheduleMapper {

    public CreateScheduleResponse mapToCreateScheduleResponse(Schedule schedule) {
        return CreateScheduleResponse.builder()
                .id(schedule.getId())
                .startTime(schedule.getStartTime())
                .endTime(schedule.getEndTime())
                .courseName(schedule.getCourse().getCourseName()) // Giả định Course có getCourseName()
                .lecturerName(schedule.getLecturer().getUser().getName()) // Giả định Lecturer có User với getName()
                .classId(schedule.getClassEntity().getId())
                .roomId(schedule.getRoom().getId())
                .weeks(calculateWeeklySchedule(schedule))
                .build();
    }

    private List<WeekSchedule> calculateWeeklySchedule(Schedule schedule) {
        List<WeekSchedule> weeks = new ArrayList<>();
        LocalDate startDate = schedule.getStartDate();
        LocalDate endDate = schedule.getEndDate();
        List<DayOfWeek> daysOfWeek = schedule.getDayOfWeek();

        LocalDate weekStart = startDate;
        if (weekStart.getDayOfWeek() != DayOfWeek.MONDAY) {
            weekStart = weekStart.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        }

        int weekNumber = 1;
        while (!weekStart.isAfter(endDate)) {
            LocalDate weekEnd = weekStart.plusDays(6);
            if (weekEnd.isAfter(endDate)) weekEnd = endDate;

            List<StudyDay> studyDays = new ArrayList<>();
            LocalDate currentDay = weekStart;
            while (!currentDay.isAfter(weekEnd) && !currentDay.isAfter(endDate)) {
                if (daysOfWeek.contains(currentDay.getDayOfWeek()) && !currentDay.isBefore(startDate)) {
                    studyDays.add(new StudyDay(currentDay.getDayOfWeek(), currentDay));
                }
                currentDay = currentDay.plusDays(1);
            }

            if (!studyDays.isEmpty()) {
                weeks.add(new WeekSchedule(weekNumber++, weekStart, weekEnd, studyDays));
            }

            weekStart = weekStart.plusDays(7);
        }

        return weeks;
    }
}