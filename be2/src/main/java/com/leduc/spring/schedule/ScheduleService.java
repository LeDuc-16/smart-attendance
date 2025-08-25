package com.leduc.spring.schedule;

import com.leduc.spring.classes.ClassEntity;
import com.leduc.spring.classes.ClassRepository;
import com.leduc.spring.classes.ClassResponse;
import com.leduc.spring.course.Course;
import com.leduc.spring.course.CourseRepository;
import com.leduc.spring.exception.ApiResponse;
import com.leduc.spring.exception.ResourceNotFoundException;
import com.leduc.spring.lecturer.Lecturer;
import com.leduc.spring.lecturer.LecturerRepository;
import com.leduc.spring.room.Room;
import com.leduc.spring.room.RoomRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ScheduleService {

    private static final Logger logger = LoggerFactory.getLogger(ScheduleService.class);

    private final ScheduleRepository scheduleRepository;
    private final CourseRepository courseRepository;
    private final LecturerRepository lecturerRepository;
    private final ClassRepository classRepository;
    private final RoomRepository roomRepository;
    private final ScheduleMapper scheduleMapper;

    /**
     * Tạo lịch học mới
     */
    @Transactional
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
                .build();

        Schedule savedSchedule = scheduleRepository.save(schedule);

        // Calculate weekly schedule
        List<WeekSchedule> weeks = calculateWeeklySchedule(savedSchedule);

        // Build response
        CreateScheduleResponse response = scheduleMapper.mapToCreateScheduleResponse(savedSchedule, weeks);
        return ApiResponse.success(response, "Lịch học được tạo thành công", servletRequest.getRequestURI());
    }

    /**
     * Lấy lịch học của người dùng hiện tại
     */
    @Transactional(readOnly = true)
    public ApiResponse<Object> getMySchedule(Long userId, String role, HttpServletRequest servletRequest) {
        List<CreateScheduleResponse> schedules;

        // Lấy lịch học dựa trên vai trò
        if ("ROLE_ADMIN".equals(role)) {
            schedules = scheduleRepository.findAll().stream()
                    .map(schedule -> scheduleMapper.mapToCreateScheduleResponse(schedule, calculateWeeklySchedule(schedule)))
                    .collect(Collectors.toList());
        } else if ("ROLE_LECTURER".equals(role)) {
            Lecturer lecturer = lecturerRepository.findByUserId(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy giảng viên cho userId: " + userId));
            schedules = scheduleRepository.findByLecturerId(lecturer.getId()).stream()
                    .map(schedule -> scheduleMapper.mapToCreateScheduleResponse(schedule, calculateWeeklySchedule(schedule)))
                    .collect(Collectors.toList());
            logger.info("Found {} schedules for lecturerId: {}", schedules.size(), lecturer.getId());
        } else if ("ROLE_STUDENT".equals(role)) {
            ClassEntity studentClass = classRepository.findByStudentId(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lớp cho sinh viên: " + userId));
            schedules = scheduleRepository.findByClassEntityId(studentClass.getId()).stream()
                    .map(schedule -> scheduleMapper.mapToCreateScheduleResponse(schedule, calculateWeeklySchedule(schedule)))
                    .collect(Collectors.toList());
        } else {
            throw new IllegalArgumentException("Vai trò không hợp lệ: " + role);
        }

        return ApiResponse.success(schedules, "Lấy lịch học thành công", servletRequest.getRequestURI());
    }

    /**
     * Lấy lịch học theo ID giảng viên
     */
    @Transactional(readOnly = true)
    public ApiResponse<Object> getScheduleByLecturerId(Long lecturerId, HttpServletRequest servletRequest) {
        Lecturer lecturer = lecturerRepository.findById(lecturerId)
                .orElseThrow(() -> new ResourceNotFoundException("Lecturer ID không tồn tại: " + lecturerId));

        List<Schedule> schedules = scheduleRepository.findByLecturerId(lecturerId);
        List<CreateScheduleResponse> scheduleResponses = schedules.stream()
                .map(schedule -> scheduleMapper.mapToCreateScheduleResponse(schedule, calculateWeeklySchedule(schedule)))
                .collect(Collectors.toList());

        return ApiResponse.success(scheduleResponses, "Lấy lịch học của giảng viên thành công", servletRequest.getRequestURI());
    }

    /**
     * Cập nhật lịch học
     */
    @Transactional
    public ApiResponse<Object> updateSchedule(Long id, UpdateScheduleRequest request, HttpServletRequest servletRequest) {
        Schedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lịch học với ID: " + id));

        // Validate and fetch entities
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course ID không tồn tại: " + request.getCourseId()));
        Lecturer lecturer = lecturerRepository.findById(request.getLecturerId())
                .orElseThrow(() -> new ResourceNotFoundException("Lecturer ID không tồn tại: " + request.getLecturerId()));
        ClassEntity classEntity = classRepository.findById(request.getClassId())
                .orElseThrow(() -> new ResourceNotFoundException("Class ID không tồn tại: " + request.getClassId()));
        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new ResourceNotFoundException("Room ID không tồn tại: " + request.getRoomId()));

        schedule.setStartDate(request.getStartDate());
        schedule.setEndDate(request.getEndDate());
        schedule.setDayOfWeek(request.getDayOfWeek());
        schedule.setStartTime(request.getStartTime());
        schedule.setEndTime(request.getEndTime());
        schedule.setCourse(course);
        schedule.setLecturer(lecturer);
        schedule.setClassEntity(classEntity);
        schedule.setRoom(room);

        Schedule updatedSchedule = scheduleRepository.save(schedule);
        List<WeekSchedule> weeks = calculateWeeklySchedule(updatedSchedule);

        CreateScheduleResponse response = scheduleMapper.mapToCreateScheduleResponse(updatedSchedule, weeks);
        return ApiResponse.success(response, "Cập nhật lịch học thành công", servletRequest.getRequestURI());
    }

    /**
     * Xóa lịch học
     */
    @Transactional
    public ApiResponse<Object> deleteSchedule(Long id, HttpServletRequest servletRequest) {
        Schedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lịch học với ID: " + id));
        scheduleRepository.delete(schedule);
        return ApiResponse.success(null, "Xóa lịch học thành công", servletRequest.getRequestURI());
    }

    /**
     * Kiểm tra xem userId có phải là giảng viên với lecturerId
     */
    public boolean isLecturer(Long lecturerId, Long userId) {
        Lecturer lecturer = lecturerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy giảng viên cho userId: " + userId));
        return lecturer.getId().equals(lecturerId);
    }


    @Transactional
    public ApiResponse<List<WeekSchedule>> openAttendance(Long scheduleId ,HttpServletRequest servletRequest) {
        // Lấy schedule từ DB
        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lịch học với ID: " + scheduleId));

        LocalDate today = LocalDate.now(); // <-- đây là current day

        // Kiểm tra hôm nay có trong lịch học không
        if (schedule.getDayOfWeek().contains(today.getDayOfWeek())) {
            // Tạo StudyDay cho hôm nay hoặc cập nhật trạng thái mở
            StudyDay studyDay = new StudyDay(today.getDayOfWeek(), today, true, null);

            // Nếu bạn lưu StudyDay vào DB hoặc liên kết với Schedule, xử lý ở đây
            // Hiện tại bạn chỉ muốn trả tuần học, nên set isOpen trong tuần hiện tại
        }

        // Tính toán tuần học dựa trên schedule
        List<WeekSchedule> weeks = calculateWeeklySchedule(schedule);

        // Đánh dấu ngày hiện tại là mở
        weeks.forEach(week -> week.getStudyDays().forEach(sd -> {
            if (sd.getDate().isEqual(today)) {
                sd.setOpen(true);
            }
        }));

        return ApiResponse.success(weeks, "Mở lớp điểm danh thành công", servletRequest.getRequestURI());
    }


    @Transactional
    public ApiResponse<List<WeekSchedule>> closeAttendance(Long scheduleId, HttpServletRequest servletRequest) {
        // Lấy schedule từ DB
        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lịch học với ID: " + scheduleId));

        LocalDate today = LocalDate.now(); // Current day
        LocalDateTime now = LocalDateTime.now(); // Thời gian hiện tại

        // Kiểm tra hôm nay có trong lịch học không
        if (schedule.getDayOfWeek().contains(today.getDayOfWeek())) {
            // Tạo hoặc cập nhật StudyDay cho hôm nay với trạng thái đóng
            StudyDay studyDay = new StudyDay(today.getDayOfWeek(), today, false, now);
            // Nếu cần lưu vào DB hoặc liên kết với Schedule thì xử lý ở đây
        }

        // Tính toán tuần học dựa trên schedule
        List<WeekSchedule> weeks = calculateWeeklySchedule(schedule);

        // Đánh dấu ngày hiện tại là đóng và lưu thời gian đóng
        weeks.forEach(week -> week.getStudyDays().forEach(sd -> {
            if (sd.getDate().isEqual(today)) {
                sd.setOpen(false);
                sd.setCloseTime(now); // lưu thời điểm đóng
            }
        }));

        return ApiResponse.success(weeks, "Đóng lớp điểm danh thành công", servletRequest.getRequestURI());
    }


    public List<WeekSchedule> calculateWeeklySchedule(Schedule schedule) {
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
                    studyDays.add(new StudyDay(currentDay.getDayOfWeek(), currentDay, false, null));
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