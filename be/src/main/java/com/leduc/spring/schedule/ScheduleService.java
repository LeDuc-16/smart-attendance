package com.leduc.spring.schedule;

import com.leduc.spring.classes.ClassEntity;
import com.leduc.spring.classes.ClassRepository;
import com.leduc.spring.course.Course;
import com.leduc.spring.course.CourseRepository;
import com.leduc.spring.exception.ApiResponse;
import com.leduc.spring.exception.RequestValidationException;
import com.leduc.spring.exception.ResourceNotFoundException;
import com.leduc.spring.lecturer.Lecturer;
import com.leduc.spring.lecturer.LecturerRepository;
import com.leduc.spring.room.Room;
import com.leduc.spring.room.RoomRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

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

    // Thêm lịch học
    public ApiResponse<Object> addSchedule(CreateScheduleRequest request, HttpServletRequest servletRequest) {
        // Kiểm tra dữ liệu đầu vào
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: [%s]".formatted(request.getCourseId())));
        Lecturer lecturer = lecturerRepository.findById(request.getLecturerId())
                .orElseThrow(() -> new ResourceNotFoundException("Lecturer not found with id: [%s]".formatted(request.getLecturerId())));
        ClassEntity classEntity = classRepository.findById(request.getClassId())
                .orElseThrow(() -> new ResourceNotFoundException("Class not found with id: [%s]".formatted(request.getClassId())));
        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: [%s]".formatted(request.getRoomId())));

        // Tạo lịch học
        Schedule schedule = Schedule.builder()
                .course(course)
                .lecturer(lecturer)
                .classEntity(classEntity)
                .room(room)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .days(request.getDays())
                .build();

        // Lưu lịch học
        Schedule savedSchedule = scheduleRepository.save(schedule);

        return ApiResponse.success(savedSchedule, "Schedule created successfully", servletRequest.getRequestURI());
    }

    // Lấy danh sách tất cả lịch học
    public ApiResponse<Object> getAllSchedules(HttpServletRequest servletRequest) {
        List<Schedule> schedules = scheduleRepository.findAll();
        if (schedules == null || schedules.isEmpty()) {
            throw new ResourceNotFoundException("No schedules found");
        }
        return ApiResponse.success(schedules, "List of schedules", servletRequest.getRequestURI());
    }

    // Lấy chi tiết lịch học theo ID
    public ApiResponse<Object> getScheduleById(Long id, HttpServletRequest servletRequest) {
        Schedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Schedule not found with id: [%s]".formatted(id)));
        return ApiResponse.success(schedule, "Schedule details", servletRequest.getRequestURI());
    }

    // Cập nhật lịch học
    public ApiResponse<Object> updateSchedule(Long id, UpdateScheduleRequest request, HttpServletRequest servletRequest) {
        Schedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Schedule not found with id: [%s]".formatted(id)));

        boolean changes = false;

        // Cập nhật course
        if (request.getCourseId() != null && !request.getCourseId().equals(schedule.getCourse().getId())) {
            Course course = courseRepository.findById(request.getCourseId())
                    .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: [%s]".formatted(request.getCourseId())));
            schedule.setCourse(course);
            changes = true;
        }

        // Cập nhật lecturer
        if (request.getLecturerId() != null && !request.getLecturerId().equals(schedule.getLecturer().getId())) {
            Lecturer lecturer = lecturerRepository.findById(request.getLecturerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Lecturer not found with id: [%s]".formatted(request.getLecturerId())));
            schedule.setLecturer(lecturer);
            changes = true;
        }

        // Cập nhật class
        if (request.getClassId() != null && !request.getClassId().equals(schedule.getClassEntity().getId())) {
            ClassEntity classEntity = classRepository.findById(request.getClassId())
                    .orElseThrow(() -> new ResourceNotFoundException("Class not found with id: [%s]".formatted(request.getClassId())));
            schedule.setClassEntity(classEntity);
            changes = true;
        }

        // Cập nhật room
        if (request.getRoomId() != null && !request.getRoomId().equals(schedule.getRoom().getId())) {
            Room room = roomRepository.findById(request.getRoomId())
                    .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: [%s]".formatted(request.getRoomId())));
            schedule.setRoom(room);
            changes = true;
        }

        // Cập nhật startDate
        if (request.getStartDate() != null && !request.getStartDate().equals(schedule.getStartDate())) {
            schedule.setStartDate(request.getStartDate());
            changes = true;
        }

        // Cập nhật endDate
        if (request.getEndDate() != null && !request.getEndDate().equals(schedule.getEndDate())) {
            schedule.setEndDate(request.getEndDate());
            changes = true;
        }

        // Cập nhật days
        if (request.getDays() != null && !request.getDays().equals(schedule.getDays())) {
            schedule.setDays(request.getDays());
            changes = true;
        }

        if (!changes) {
            throw new RequestValidationException("No data changes found");
        }

        // Lưu lịch học
        Schedule updatedSchedule = scheduleRepository.save(schedule);

        return ApiResponse.success(updatedSchedule, "Schedule updated successfully", servletRequest.getRequestURI());
    }

    // Xóa lịch học
    public ApiResponse<Object> deleteSchedule(Long id, HttpServletRequest servletRequest) {
        Schedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Schedule not found with id: [%s]".formatted(id)));
        scheduleRepository.delete(schedule);
        return ApiResponse.success(null, "Schedule deleted successfully", servletRequest.getRequestURI());
    }
}