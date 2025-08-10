package com.leduc.spring.schedule;

import com.leduc.spring.classes.ClassEntity;
import com.leduc.spring.classes.ClassRepository;
import com.leduc.spring.course.Course;
import com.leduc.spring.course.CourseRepository;
import com.leduc.spring.course.CourseService;
import com.leduc.spring.exception.ApiResponse;
import com.leduc.spring.exception.DuplicateResourceException;
import com.leduc.spring.exception.RequestValidationException;
import com.leduc.spring.exception.ResourceNotFoundException;
import com.leduc.spring.lecturer.Lecturer;
import com.leduc.spring.lecturer.LecturerRepository;
import com.leduc.spring.room.Room;
import com.leduc.spring.room.RoomRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ScheduleService {

    @Autowired
    private ScheduleRepository scheduleRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private LecturerRepository lecturerRepository;

    @Autowired
    private ClassRepository classRepository;

    @Autowired
    private RoomRepository roomRepository;

    public ApiResponse<CreateScheduleResponse> createSchedule(CreateScheduleRequest request, HttpServletRequest servletRequest) {

        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new IllegalArgumentException("Course ID không tồn tại"));

        Lecturer lecturer = lecturerRepository.findById(request.getLecturerId())
                .orElseThrow(() -> new IllegalArgumentException("Lecturer ID không tồn tại"));

        ClassEntity classEntity = classRepository.findById(request.getClassId())
                .orElseThrow(() -> new IllegalArgumentException("Class ID không tồn tại"));

        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new IllegalArgumentException("Room ID không tồn tại"));

        Schedule schedule = Schedule.builder()
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .dayOfWeek(request.getDayOfWeek())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .course(course)
                .lecturer(lecturer)
                .classEntity(classEntity)
                .room(room)
                .build();

        Schedule savedSchedule = scheduleRepository.save(schedule);

        List<WeekSchedule> weeks = calculateWeeklySchedule(savedSchedule);

        CreateScheduleResponse response = CreateScheduleResponse.builder()
                .id(savedSchedule.getId())
                .startTime(savedSchedule.getStartTime())
                .endTime(savedSchedule.getEndTime())
                .courseId(savedSchedule.getCourse().getId())
                .lecturerId(savedSchedule.getLecturer().getId())
                .classId(savedSchedule.getClassEntity().getId())
                .roomId(savedSchedule.getRoom().getId())
                .weeks(weeks)
                .build();

        return ApiResponse.success(response, "Schedule created successfully", servletRequest.getRequestURI());
    }


    public ApiResponse<Object> listSchedules(HttpServletRequest servletRequest) {
        List<CreateScheduleResponse> schedules = scheduleRepository.findAll().stream()
                .map(schedule -> CreateScheduleResponse.builder()
                        .id(schedule.getId())
                        .startTime(schedule.getStartTime())
                        .endTime(schedule.getEndTime())
                        .courseId(schedule.getCourse().getId())
                        .lecturerId(schedule.getLecturer().getId())
                        .classId(schedule.getClassEntity().getId())
                        .roomId(schedule.getRoom().getId())
                        .weeks(calculateWeeklySchedule(schedule))
                        .build())
                .collect(Collectors.toList());

        return ApiResponse.success(schedules, "Schedules retrieved successfully", servletRequest.getRequestURI());
    }

    public ApiResponse<Object> updateSchedule(HttpServletRequest servletRequest, Long id,UpdateScheduleRequest request) {
        // 1. Kiểm tra lịch học tồn tại
        Schedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Schedule not found with id: " + id));

        // 4. Cập nhật thông tin
        schedule.setStartDate(request.getStartDate());
        schedule.setEndDate(request.getEndDate());
        schedule.setDayOfWeek(request.getDayOfWeek()); // Cách 1
        // schedule.setDaysOfWeek(request.getDayOfWeek().stream().map(DayOfWeek::name).collect(Collectors.joining(","))); // Cách 2
        schedule.setStartTime(request.getStartTime());
        schedule.setEndTime(request.getEndTime());
        schedule.setCourse(Course.builder().id(request.getCourseId()).build());
        schedule.setLecturer(Lecturer.builder().id(request.getLecturerId()).build());
        schedule.setClassEntity(ClassEntity.builder().id(request.getClassId()).build());
        schedule.setRoom(Room.builder().id(request.getRoomId()).build());

        // 5. Lưu lại
        Schedule updatedSchedule = scheduleRepository.save(schedule);

        // 6. Tạo response
        CreateScheduleResponse response = CreateScheduleResponse.builder()
                .id(updatedSchedule.getId())
                .startTime(updatedSchedule.getStartTime())
                .endTime(updatedSchedule.getEndTime())
                .courseId(updatedSchedule.getCourse().getId())
                .lecturerId(updatedSchedule.getLecturer().getId())
                .classId(updatedSchedule.getClassEntity().getId())
                .roomId(updatedSchedule.getRoom().getId())
                .weeks(calculateWeeklySchedule(updatedSchedule))
                .build();

        return ApiResponse.success(response, "Schedule updated successfully", servletRequest.getRequestURI());
    }

    public ApiResponse<Object> deleteSchedule(HttpServletRequest servletRequest, Long id) {
        // 1. Kiểm tra lịch học tồn tại
        Schedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Schedule not found with id: " + id));

        // 2. Xóa lịch học
        scheduleRepository.delete(schedule);

        return ApiResponse.success(null, "Schedule deleted successfully", servletRequest.getRequestURI());
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
            if (weekEnd.isAfter(endDate)) {
                weekEnd = endDate;
            }

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