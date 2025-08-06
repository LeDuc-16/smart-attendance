package com.leduc.spring.major;

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
@RequestMapping("/api/v1/majors")
@RequiredArgsConstructor
@Tag(name = "Major Management", description = "API quản lý ngành học")
@SecurityRequirement(name = "bearerAuth")
public class MajorController {

    private final MajorService majorService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Tạo ngành học mới", description = "Chỉ admin có quyền tạo ngành học mới")
    public ResponseEntity<ApiResponse<Object>> addMajor(
            @RequestBody MajorRequest request,
            HttpServletRequest servletRequest
    ) {
        ApiResponse<Object> response = majorService.addMajor(request, servletRequest);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Xóa ngành học", description = "Chỉ admin có quyền xóa ngành học")
    public ResponseEntity<ApiResponse<Object>> deleteMajor(
            @PathVariable Long id,
            HttpServletRequest servletRequest
    ) {
        return ResponseEntity.ok(majorService.deleteMajor(id, servletRequest));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Cập nhật ngành học", description = "Chỉ admin có quyền cập nhật thông tin ngành học")
    public ResponseEntity<ApiResponse<Object>> updateMajor(
            @PathVariable Long id,
            @RequestBody MajorRequest request,
            HttpServletRequest servletRequest
    ) {
        return ResponseEntity.ok(majorService.updateMajor(id, request, servletRequest));
    }

    @GetMapping("/faculty/{name}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER')")
    @Operation(summary = "Tìm ngành học theo tên khoa", description = "Admin và giảng viên có quyền tìm ngành học theo tên khoa")
    public ResponseEntity<ApiResponse<Object>> findByFacultyName(
            @PathVariable String name,
            HttpServletRequest servletRequest
    ) {
        return ResponseEntity.ok(majorService.findByFacultyName(name, servletRequest));
    }

    @GetMapping("/list")
    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER')")
    @Operation(summary = "Lấy danh sách ngành học", description = "Admin và giảng viên có quyền xem danh sách ngành học")
    public ResponseEntity<ApiResponse<Object>> listMajors(
            HttpServletRequest servletRequest
    ) {
        return ResponseEntity.ok(majorService.listMajors(servletRequest));
    }
}