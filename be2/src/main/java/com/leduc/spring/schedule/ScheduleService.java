package com.leduc.spring.schedule;

import com.leduc.spring.classes.ClassEntity;
import com.leduc.spring.classes.ClassRepository;
import com.leduc.spring.config.JwtService;
import com.leduc.spring.course.Course;
import com.leduc.spring.course.CourseRepository;
import com.leduc.spring.exception.ApiResponse;
import com.leduc.spring.exception.ResourceNotFoundException;
import com.leduc.spring.lecturer.Lecturer;
import com.leduc.spring.lecturer.LecturerRepository;
import com.leduc.spring.room.Room;
import com.leduc.spring.room.RoomRepository;
import com.leduc.spring.user.User;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
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

    @Autowired
    private JwtService jwtService;

    public ApiResponse<CreateScheduleResponse> createSchedule(CreateScheduleRequest request, HttpServletRequest servletRequest) {
        // Validate and fetch entities
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course ID không tồn tại: " + request.getCourseId()));
        Lecturer lecturer = lecturerRepository.findById(request.getLecturerId())
                .orElseThrow(() -> new ResourceNotFoundException("Lecturer ID không tồn tại: " + request.getLecturerId()));
        ClassEntity classEntity = classRepository.findById(request.getClassId())
                .orElseThrow(() -> new ResourceNotFoundException("Class ID không tồn tại: " + request.getClassId()));
        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new ResourceNotFoundException("Room ID không tồn tại: " + request.getRoomId()));

        // Create and save schedule
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
                .isOpen(true) // Giả định lịch học ban đầu là mở
                .build();

        Schedule savedSchedule = scheduleRepository.save(schedule);

        // Calculate weekly schedule
        List<WeekSchedule> weeks = calculateWeeklySchedule(savedSchedule);

        // Build response with courseName and lecturerName
        CreateScheduleResponse response = CreateScheduleResponse.builder()
                .id(savedSchedule.getId())
                .startTime(savedSchedule.getStartTime())
                .endTime(savedSchedule.getEndTime())
                .courseName(course.getName()) // Lấy tên khóa học
                .lecturerName(lecturer.getName()) // Lấy tên giảng viên
                .classId(savedSchedule.getClassEntity().getId())
                .roomId(savedSchedule.getRoom().getId())
                .weeks(weeks)
                .build();

        return ApiResponse.success(response, "Schedule created successfully", servletRequest.getRequestURI());
    }

    public ApiResponse<Object> getMySchedule(HttpServletRequest servletRequest) {
        // Lấy thông tin người dùng từ SecurityContextHolder
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = jwtService.getUserFromToken(username); // Lấy User từ JWT

        List<CreateScheduleResponse> schedules;
        if ("LECTURER".equals(currentUser.getRole())) {
            // Lấy tất cả lịch giảng dạy của giảng viên
            schedules = scheduleRepository.findByLecturerId(currentUser.getId()).stream()
                    .map(this::mapToCreateScheduleResponse)
                    .collect(Collectors.toList());
        } else if ("STUDENT".equals(currentUser.getRole())) {
            // Lấy tất cả lịch học của sinh viên dựa trên lớp
            ClassEntity studentClass = classRepository.findByStudentsId(currentUser.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lớp cho sinh viên: " + currentUser.getId()));
            schedules = scheduleRepository.findByClassEntityId(studentClass.getId()).stream()
                    .map(this::mapToCreateScheduleResponse)
                    .collect(Collectors.toList());
        } else {
            throw new ResourceNotFoundException("Vai trò không được hỗ trợ: " + currentUser.getRole());
        }

        return ApiResponse.success(schedules, "Schedules retrieved successfully", servletRequest.getRequestURI());
    }

    public ApiResponse<Object> updateSchedule(HttpServletRequest servletRequest, Long id, UpdateScheduleRequest request) {
        Schedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Schedule not found with id: " + id));

        schedule.setStartDate(request.getStartDate());
        schedule.setEndDate(request.getEndDate());
        schedule.setDayOfWeek(request.getDayOfWeek());
        schedule.setStartTime(request.getStartTime());
        schedule.setEndTime(request.getEndTime());
        schedule.setCourse(Course.builder().id(request.getCourseId()).build());
        schedule.setLecturer(Lecturer.builder().id(request.getLecturerId()).build());
        schedule.setClassEntity(ClassEntity.builder().id(request.getClassId()).build());
        schedule.setRoom(Room.builder().id(request.getRoomId()).build());

        Schedule updatedSchedule = scheduleRepository.save(schedule);

        CreateScheduleResponse response = mapToCreateScheduleResponse(updatedSchedule);
        return ApiResponse.success(response, "Schedule updated successfully", servletRequest.getRequestURI());
    }

    public ApiResponse<Object> deleteSchedule(HttpServletRequest servletRequest, Long id) {
        Schedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Schedule not found with id: " + id));
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

    private CreateScheduleResponse mapToCreateScheduleResponse(Schedule schedule) {
        return CreateScheduleResponse.builder()
                .id(schedule.getId())
                .startTime(schedule.getStartTime())
                .endTime(schedule.getEndTime())
                .courseName(schedule.getCourse().getName()) // Lấy tên khóa học
                .lecturerName(schedule.getLecturer().getUser().getName()) //
                .classId(schedule.getClassEntity().getId())
                .roomId(schedule.getRoom().getId())
                .weeks(calculateWeeklySchedule(schedule))
                .build();
    }
}