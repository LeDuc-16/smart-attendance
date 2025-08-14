package com.leduc.spring.faculty;

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
@RequestMapping("/api/v1/faculties")
@RequiredArgsConstructor
@Tag(name = "Faculty Management", description = "API quản lý khoa")
@SecurityRequirement(name = "bearerAuth")
public class FacultyController {

    private final FacultyService facultyService;

    @PostMapping
    @Operation(summary = "Tạo khoa mới", description = "Chỉ admin có quyền tạo khoa mới")
    public ResponseEntity<ApiResponse<Object>> createFaculty(
            @RequestBody CreateFacultyRequest request,
            HttpServletRequest servletRequest
    ) {
        ApiResponse<Object> response = facultyService.createFaculty(request, servletRequest);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Lấy danh sách khoa", description = "Admin và giảng viên có quyền xem danh sách khoa")
    public ResponseEntity<ApiResponse<Object>> listFaculties(HttpServletRequest servletRequest) {
        return ResponseEntity.ok(facultyService.listFaculties(servletRequest));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật khoa", description = "Chỉ admin có quyền cập nhật thông tin khoa")
    public ResponseEntity<ApiResponse<Object>> updateFaculty(
            @PathVariable("id") Long id,
            @RequestBody UpdateFacultyRequest request,
            HttpServletRequest servletRequest
    ) {
        return ResponseEntity.ok(facultyService.updateFaculty(servletRequest, id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa khoa", description = "Chỉ admin có quyền xóa khoa")
    public ResponseEntity<ApiResponse<Object>> deleteFaculty(
            @PathVariable("id") Long id,
            HttpServletRequest servletRequest
    ) {
        return ResponseEntity.ok(facultyService.deleteFaculty(servletRequest, id));
    }
}