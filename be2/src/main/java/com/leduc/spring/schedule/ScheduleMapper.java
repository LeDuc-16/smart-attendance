package com.leduc.spring.schedule;

import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ScheduleMapper {

    public CreateScheduleResponse mapToCreateScheduleResponse(Schedule schedule, List<WeekSchedule> weeks) {
        return CreateScheduleResponse.builder()
                .id(schedule.getId())
                .startTime(schedule.getStartTime())
                .endTime(schedule.getEndTime())
                .courseName(schedule.getCourse().getCourseName()) // Sửa thành getName() nếu Course có trường name
                .lecturerName(schedule.getLecturer().getUser().getName()) // Đúng nếu Lecturer có User
                .className(schedule.getClassEntity().getClassName())
                .roomName(schedule.getRoom().getRoomCode())
                .weeks(weeks)
                .build();
    }
}