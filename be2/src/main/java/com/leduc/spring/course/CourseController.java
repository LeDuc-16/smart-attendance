package com.leduc.spring.course;

import com.leduc.spring.exception.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/courses")
@RequiredArgsConstructor
@Tag(name = "Course Management", description = "API quản lý khóa học")
@SecurityRequirement(name = "bearerAuth")
public class CourseController {

    private final CourseService courseService;

    @PostMapping
    @Operation(summary = "Tạo khóa học mới", description = "Chỉ admin có quyền tạo khóa học mới")
    public ResponseEntity<ApiResponse<Object>> createCourse(
            @RequestBody CreateCourseRequest request,
            HttpServletRequest servletRequest
    ) {
        ApiResponse<Object> response = courseService.createCourse(request, servletRequest);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Lấy danh sách khóa học", description = "Admin và giảng viên có quyền xem danh sách khóa học")
    public ResponseEntity<ApiResponse<Object>> listCourses(HttpServletRequest servletRequest) {
        return ResponseEntity.ok(courseService.listCourses(servletRequest));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật khóa học", description = "Chỉ admin có quyền cập nhật thông tin khóa học")
    public ResponseEntity<ApiResponse<Object>> updateCourse(
            @PathVariable("id") Long id,
            @RequestBody UpdateCourseRequest request,
            HttpServletRequest servletRequest
    ) {
        return ResponseEntity.ok(courseService.updateCourse(servletRequest, id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa khóa học", description = "Chỉ admin có quyền xóa khóa học")
    public ResponseEntity<ApiResponse<Object>> deleteCourse(
            @PathVariable("id") Long id,
            HttpServletRequest servletRequest
    ) {
        return ResponseEntity.ok(courseService.deleteCourse(servletRequest, id));
    }
}