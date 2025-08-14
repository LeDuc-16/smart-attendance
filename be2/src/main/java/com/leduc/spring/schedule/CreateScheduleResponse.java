package com.leduc.spring.schedule;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.leduc.spring.schedule.WeekSchedule;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateScheduleResponse {
    private Long id;           // ID của lịch học
    @Schema(type = "string", example = "08:00:00")
    @JsonFormat(pattern = "HH:mm:ss")
    private LocalTime startTime;

    @Schema(type = "string", example = "10:00:00")
    @JsonFormat(pattern = "HH:mm:ss")
    private LocalTime endTime;

    private Long courseId;     // Chỉ trả về ID
    private Long lecturerId;   // Chỉ trả về ID
    private Long classId;      // Chỉ trả về ID
    private Long roomId;       // Chỉ trả về ID
    private List<WeekSchedule> weeks; // Danh sách các tuần
}