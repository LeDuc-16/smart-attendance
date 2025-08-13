package com.leduc.spring.lecturer;

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
@RequestMapping("/api/v1/lecturers")
@RequiredArgsConstructor
@Tag(name = "Lecturer Management", description = "API quản lý giảng viên")
@SecurityRequirement(name = "bearerAuth")
public class LecturerController {

    private final LecturerService lecturerService;

    @PostMapping
    @Operation(summary = "Tạo giảng viên", description = "Chỉ admin có quyền tạo giảng viên")
    public ResponseEntity<ApiResponse<Object>> createLecturer(
            @RequestBody CreateLecturerRequest request,
            HttpServletRequest servletRequest
    ) {
        ApiResponse<Object> response = lecturerService.createLecturer(request, servletRequest);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Lấy danh sách giảng viên", description = "Admin và giảng viên có quyền xem danh sách giảng viên")
    public ResponseEntity<ApiResponse<Object>> getAllLecturers(
            HttpServletRequest servletRequest
    ) {
        ApiResponse<Object> response = lecturerService.getAllLecturers(servletRequest);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy chi tiết giảng viên", description = "Admin và giảng viên có quyền xem chi tiết giảng viên")
    public ResponseEntity<ApiResponse<Object>> getLecturerById(
            @PathVariable("id") Long id,
            HttpServletRequest servletRequest
    ) {
        ApiResponse<Object> response = lecturerService.getLecturerById(id, servletRequest);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Cập nhật giảng viên", description = "Chỉ admin có quyền cập nhật giảng viên")
    public ResponseEntity<ApiResponse<Object>> updateLecturer(
            @PathVariable("id") Long id,
            @RequestBody UpdateLecturerRequest request,
            HttpServletRequest servletRequest
    ) {
        ApiResponse<Object> response = lecturerService.updateLecturer(id, request, servletRequest);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa giảng viên", description = "Chỉ admin có quyền xóa giảng viên")
    public ResponseEntity<ApiResponse<Object>> deleteLecturer(
            @PathVariable("id") Long id,
            HttpServletRequest servletRequest
    ) {
        ApiResponse<Object> response = lecturerService.deleteLecturer(id, servletRequest);
        return ResponseEntity.ok(response);
    }
}