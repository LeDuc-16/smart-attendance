package com.leduc.spring.course;

import com.leduc.spring.exception.ApiResponse;
import com.leduc.spring.exception.DuplicateResourceException;
import com.leduc.spring.exception.ResourceNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;

    // Tạo khóa học mới
    public ApiResponse<Object> createCourse(CreateCourseRequest request, HttpServletRequest servletRequest) {
        // Kiểm tra xem courseName đã tồn tại chưa
        if (courseRepository.existsByCourseName(request.getCourseName())) {
            throw new DuplicateResourceException("Course with name [%s] already exists".formatted(request.getCourseName()));
        }

        // Tạo entity Course
        Course course = Course.builder()
                .courseName(request.getCourseName())
                .credits(request.getCredits())
                .build();

        // Lưu khóa học
        courseRepository.save(course);

        return ApiResponse.success(null, "Course created successfully", servletRequest.getRequestURI());
    }

    // Lấy danh sách khóa học
    public ApiResponse<Object> listCourses(HttpServletRequest servletRequest) {
        List<Course> courses = courseRepository.findAll();
        List<CourseResponse> courseResponses = courses.stream()
                .map(course -> new CourseResponse(course.getId(), course.getCourseName(), course.getCredits()))
                .collect(Collectors.toList());
        return ApiResponse.success(courseResponses, "Courses retrieved successfully", servletRequest.getRequestURI());
    }

    // Cập nhật khóa học
    public ApiResponse<Object> updateCourse(HttpServletRequest servletRequest, Long id, UpdateCourseRequest request) {
        // Kiểm tra xem khóa học có tồn tại không
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: [%d]".formatted(id)));

        // Kiểm tra xem courseName mới đã tồn tại chưa (trừ khóa học hiện tại)
        if (!course.getCourseName().equals(request.getCourseName()) &&
                courseRepository.existsByCourseName(request.getCourseName())) {
            throw new DuplicateResourceException("Course with name [%s] already exists".formatted(request.getCourseName()));
        }

        // Cập nhật thông tin
        course.setCourseName(request.getCourseName());
        course.setCredits(request.getCredits());
        courseRepository.save(course);

        return ApiResponse.success(null, "Course updated successfully", servletRequest.getRequestURI());
    }

    // Xóa khóa học
    public ApiResponse<Object> deleteCourse(HttpServletRequest servletRequest, Long id) {
        // Kiểm tra xem khóa học có tồn tại không
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: [%d]".formatted(id)));

        // Xóa khóa học
        courseRepository.delete(course);

        return ApiResponse.success(null, "Course deleted successfully", servletRequest.getRequestURI());
    }
}