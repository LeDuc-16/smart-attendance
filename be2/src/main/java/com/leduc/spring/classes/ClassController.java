package com.leduc.spring.classes;

import com.leduc.spring.exception.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/v1/classes")
@RequiredArgsConstructor
@Tag(name = "Class Management", description = "API quản lý lớp học")
@SecurityRequirement(name = "bearerAuth")
public class ClassController {

    private final ClassService classService;

    @PostMapping
    @Operation(summary = "Tạo lớp học", description = "Chỉ admin có quyền tạo lớp học")
    public ResponseEntity<ApiResponse<Object>> createClass(
            @RequestBody CreateClassRequest request,
            HttpServletRequest servletRequest
    ) {
        ApiResponse<Object> response = classService.addClass(request, servletRequest);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Lấy danh sách lớp học", description = "Admin và giảng viên có quyền xem danh sách lớp học")
    public ResponseEntity<ApiResponse<Object>> listClasses(
            HttpServletRequest servletRequest
    ) {
        ApiResponse<Object> response = classService.getAllClass(servletRequest);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật lớp học", description = "Chỉ admin có quyền cập nhật lớp học")
    public ResponseEntity<ApiResponse<Object>> updateClass(
            @PathVariable("id") Long id,
            @RequestBody UpdateClassRequest request,
            HttpServletRequest servletRequest
    ) {
        ApiResponse<Object> response = classService.updateClass(servletRequest, id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa lớp học", description = "Chỉ admin có quyền xóa lớp học")
    public ResponseEntity<ApiResponse<Object>> deleteClass(
            @PathVariable("id") Long id,
            HttpServletRequest servletRequest
    ) {
        ApiResponse<Object> response = classService.deleteClass(servletRequest, id);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/add-lecturer-to-class")
    @Operation(summary = "Gán giảng viên chủ nhiệm cho lớp", description = "Chỉ admin có quyền gán giảng viên chủ nhiệm")
    public ResponseEntity<ApiResponse<Object>> addLecturerToClass(
            @RequestBody AddLecturerToClassRequest request,
            HttpServletRequest servletRequest
    ) {
        ApiResponse<Object> response = classService.addLecturerToClass(request, servletRequest);
        return ResponseEntity.ok(response);
    }
}