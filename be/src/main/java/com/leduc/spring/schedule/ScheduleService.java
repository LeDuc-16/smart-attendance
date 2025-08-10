package com.leduc.spring.schedule;
import com.leduc.spring.classes.ClassEntity;
import com.leduc.spring.course.Course;
import com.leduc.spring.exception.ApiResponse;
import com.leduc.spring.exception.DuplicateResourceException;
import com.leduc.spring.lecturer.Lecturer;
import com.leduc.spring.room.Room;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;

@Service
public class ScheduleService {

    @Autowired
    private ScheduleRepository scheduleRepository;

    public ApiResponse<CreateScheduleResponse> createSchedule(CreateScheduleRequest request, HttpServletRequest servletRequest) {
        // 2. Kiểm tra xung đột lịch (phòng hoặc giảng viên trong cùng khung giờ)
        if (hasScheduleConflict(request)) {
            throw new DuplicateResourceException("Schedule conflict detected for room or lecturer at the specified time");
        }

        // 3. Chuyển đổi request thành entity Schedule
        Schedule schedule = Schedule.builder()
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .dayOfWeek(request.getDayOfWeek())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .course(new Course(request.getCourse().getId()))
                .lecturer(new Lecturer(request.getLecturer().getId()))
                .classEntity(new ClassEntity(request.getClassEntity().getId()))
                .room(new Room(request.getRoom().getId()))
                .build();

        // 4. Lưu Schedule vào database
        Schedule savedSchedule = scheduleRepository.save(schedule);

        // 5. Tính toán các tuần và ngày học
        List<WeekSchedule> weeks = calculateWeeklySchedule(savedSchedule);

        // 6. Tạo response
        CreateScheduleResponse response = CreateScheduleResponse.builder()
                .id(savedSchedule.getId())
                .startTime(savedSchedule.getStartTime())
                .endTime(savedSchedule.getEndTime())
                .course(savedSchedule.getCourse())
                .lecturer(savedSchedule.getLecturer())
                .classEntity(savedSchedule.getClassEntity())
                .room(savedSchedule.getRoom())
                .weeks(weeks)
                .build();

        return ApiResponse.success(response, "Schedule created successfully", servletRequest.getRequestURI());
    }


    private boolean hasScheduleConflict(CreateScheduleRequest request) {
        // Kiểm tra xem phòng hoặc giảng viên có lịch trùng trong cùng khung giờ và ngày
        LocalDate currentDay = request.getStartDate();
        while (!currentDay.isAfter(request.getEndDate())) {
            if (request.getDayOfWeek().contains(currentDay.getDayOfWeek())) {
                if (scheduleRepository.existsByRoomAndDateAndTime(
                        new Room(request.getRoom().getId()),
                        currentDay,
                        request.getStartTime(),
                        request.getEndTime()) ||
                        scheduleRepository.existsByLecturerAndDateAndTime(
                                new Lecturer(request.getLecturer().getId()),
                                currentDay,
                                request.getStartTime(),
                                request.getEndTime())) {
                    return true;
                }
            }
            currentDay = currentDay.plusDays(1);
        }
        return false;
    }

    private List<WeekSchedule> calculateWeeklySchedule(Schedule schedule) {
        List<WeekSchedule> weeks = new ArrayList<>();
        LocalDate startDate = schedule.getStartDate();
        LocalDate endDate = schedule.getEndDate();
        List<DayOfWeek> daysOfWeek = schedule.getDayOfWeek();

        // Tìm ngày thứ Hai đầu tiên
        LocalDate weekStart = startDate;
        if (weekStart.getDayOfWeek() != DayOfWeek.MONDAY) {
            weekStart = weekStart.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        }

        int weekNumber = 1;
        while (!weekStart.isAfter(endDate)) {
            LocalDate weekEnd = weekStart.plusDays(6); // Chủ Nhật
            if (weekEnd.isAfter(endDate)) {
                weekEnd = endDate;
            }

            // Tìm các ngày học trong tuần
            List<StudyDay> studyDays = new ArrayList<>();
            LocalDate currentDay = weekStart;
            while (!currentDay.isAfter(weekEnd) && !currentDay.isAfter(endDate)) {
                if (daysOfWeek.contains(currentDay.getDayOfWeek()) && !currentDay.isBefore(startDate)) {
                    studyDays.add(new StudyDay(currentDay.getDayOfWeek(), currentDay));
                }
                currentDay = currentDay.plusDays(1);
            }

            // Thêm tuần vào danh sách
            if (!studyDays.isEmpty()) { // Chỉ thêm tuần nếu có ngày học
                weeks.add(new WeekSchedule(weekNumber++, weekStart, weekEnd, studyDays));
            }

            // Chuyển sang tuần tiếp theo
            weekStart = weekStart.plusDays(7);
        }

        return weeks;
    }
}