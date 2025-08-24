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
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ScheduleService {

    private static final Logger logger = LoggerFactory.getLogger(ScheduleService.class);

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

    @Autowired
    private ScheduleMapper scheduleMapper;

    public ApiResponse<CreateScheduleResponse> createSchedule(CreateScheduleRequest request, HttpServletRequest servletRequest) {
        // Authenticate user
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String username = userDetails.getUsername();
        logger.info("Authenticated user for createSchedule: {}", username);

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
                .isOpen(true)
                .build();

        Schedule savedSchedule = scheduleRepository.save(schedule);

        // Calculate weekly schedule
        List<WeekSchedule> weeks = calculateWeeklySchedule(savedSchedule);

        // Build response
        CreateScheduleResponse response = scheduleMapper.mapToCreateScheduleResponse(savedSchedule, weeks);
        return ApiResponse.success(response, "Schedule created successfully", servletRequest.getRequestURI());
    }

    public ApiResponse<Object> getMySchedule(HttpServletRequest servletRequest) {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String username = userDetails.getUsername();
        logger.info("Authenticated user for getMySchedule: {}", username);

        String authHeader = servletRequest.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            logger.error("Invalid or missing Authorization header");
            throw new IllegalArgumentException("Invalid or missing Authorization header");
        }
        String jwt = authHeader.substring(7);
        String extractedUsername = jwtService.extractUsername(jwt);
        if (!extractedUsername.equals(username)) {
            logger.error("JWT token username does not match authenticated user: {} vs {}", extractedUsername, username);
            throw new IllegalArgumentException("JWT token username does not match authenticated user");
        }

        Long userId = jwtService.extractUserId(jwt);
        List<CreateScheduleResponse> schedules;

        boolean isAdmin = userDetails.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));
        boolean isLecturer = userDetails.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_LECTURER"));
        boolean isStudent = userDetails.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_STUDENT"));

        if (isAdmin) {
            schedules = scheduleRepository.findAll().stream()
                    .map(schedule -> scheduleMapper.mapToCreateScheduleResponse(schedule, calculateWeeklySchedule(schedule)))
                    .collect(Collectors.toList());
        } else if (isLecturer) {
            Lecturer lecturer = lecturerRepository.findByUserId(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy giảng viên cho userId: " + userId));
            logger.info("Lecturer ID for userId {}: {}", userId, lecturer.getId());
            schedules = scheduleRepository.findByLecturerId(lecturer.getId()).stream()
                    .map(schedule -> scheduleMapper.mapToCreateScheduleResponse(schedule, calculateWeeklySchedule(schedule)))
                    .collect(Collectors.toList());
            logger.info("Found {} schedules for lecturerId: {}", schedules.size(), lecturer.getId());
        } else if (isStudent) {
            ClassEntity studentClass = classRepository.findByStudentId(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lớp cho sinh viên: " + userId));
            schedules = scheduleRepository.findByClassEntityId(studentClass.getId()).stream()
                    .map(schedule -> scheduleMapper.mapToCreateScheduleResponse(schedule, calculateWeeklySchedule(schedule)))
                    .collect(Collectors.toList());
        } else {
            throw new ResourceNotFoundException("Vai trò không được hỗ trợ: " + userDetails.getAuthorities());
        }

        return ApiResponse.success(schedules, "Schedules retrieved successfully", servletRequest.getRequestURI());
    }
    public ApiResponse<Object> getScheduleByLecturerId(Long lecturerId, HttpServletRequest servletRequest) {
        // Authenticate user
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String username = userDetails.getUsername();
        logger.info("Authenticated user for getScheduleByLecturerId: {}", username);

        // Validate JWT token
        String authHeader = servletRequest.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            logger.error("Invalid or missing Authorization header");
            throw new IllegalArgumentException("Invalid or missing Authorization header");
        }
        String jwt = authHeader.substring(7);
        String extractedUsername = jwtService.extractUsername(jwt);
        if (!extractedUsername.equals(username)) {
            logger.error("JWT token username does not match authenticated user: {} vs {}", extractedUsername, username);
            throw new IllegalArgumentException("JWT token username does not match authenticated user");
        }

        // Validate lecturer existence
        Lecturer lecturer = lecturerRepository.findById(lecturerId)
                .orElseThrow(() -> new ResourceNotFoundException("Lecturer ID không tồn tại: " + lecturerId));

        // Lấy tất cả lịch học của giảng viên
        List<Schedule> schedules = scheduleRepository.findByLecturerId(lecturerId).stream()
                .collect(Collectors.toList());

        // Chuyển đổi sang danh sách CreateScheduleResponse
        List<CreateScheduleResponse> scheduleResponses = schedules.stream()
                .map(schedule -> scheduleMapper.mapToCreateScheduleResponse(schedule, calculateWeeklySchedule(schedule)))
                .collect(Collectors.toList());

        return ApiResponse.success(scheduleResponses, "Schedules retrieved for lecturer successfully", servletRequest.getRequestURI());
    }

    public ApiResponse<Object> updateSchedule(HttpServletRequest servletRequest, Long id, UpdateScheduleRequest request) {
        // Authenticate user
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String username = userDetails.getUsername();
        logger.info("Authenticated user for updateSchedule: {}", username);

        // Validate JWT token
        String authHeader = servletRequest.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            logger.error("Invalid or missing Authorization header");
            throw new IllegalArgumentException("Invalid or missing Authorization header");
        }
        String jwt = authHeader.substring(7);
        String extractedUsername = jwtService.extractUsername(jwt);
        if (!extractedUsername.equals(username)) {
            logger.error("JWT token username does not match authenticated user: {} vs {}", extractedUsername, username);
            throw new IllegalArgumentException("JWT token username does not match authenticated user");
        }

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

        // Calculate weekly schedule for updated schedule
        List<WeekSchedule> weeks = calculateWeeklySchedule(updatedSchedule);

        CreateScheduleResponse response = scheduleMapper.mapToCreateScheduleResponse(updatedSchedule, weeks);
        return ApiResponse.success(response, "Schedule updated successfully", servletRequest.getRequestURI());
    }

    public ApiResponse<Object> deleteSchedule(HttpServletRequest servletRequest, Long id) {
        // Authenticate user
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String username = userDetails.getUsername();
        logger.info("Authenticated user for deleteSchedule: {}", username);

        // Validate JWT token
        String authHeader = servletRequest.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            logger.error("Invalid or missing Authorization header");
            throw new IllegalArgumentException("Invalid or missing Authorization header");
        }
        String jwt = authHeader.substring(7);
        String extractedUsername = jwtService.extractUsername(jwt);
        if (!extractedUsername.equals(username)) {
            logger.error("JWT token username does not match authenticated user: {} vs {}", extractedUsername, username);
            throw new IllegalArgumentException("JWT token username does not match authenticated user");
        }

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
}