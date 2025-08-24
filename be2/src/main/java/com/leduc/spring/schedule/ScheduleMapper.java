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
                .courseName(schedule.getCourse().getCourseName())  // Nếu Course có field khác thì đổi cho khớp
                .lecturerName(schedule.getLecturer().getUser().getName())  // Giả sử Lecturer liên kết User
                .className(schedule.getClassEntity().getClassName())
                .roomName(schedule.getRoom().getRoomCode())
                .weeks(weeks)
                .isOpen(schedule.isOpen())   // <-- thêm mapping cho isOpen
                .build();
    }
}
