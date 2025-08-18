package com.leduc.spring.student;

import com.leduc.spring.exception.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/v1/students")
@RequiredArgsConstructor
@Tag(name = "Student Management", description = "API quản lý sinh viên")
@SecurityRequirement(name = "bearerAuth")
public class StudentController {

    private final StudentService studentService;

    @PostMapping
    @Operation(summary = "Thêm sinh viên", description = "Chỉ admin có quyền thêm sinh viên")
    public ResponseEntity<ApiResponse<Object>> addStudent(
            @Valid @RequestBody CreateStudentRequest request,
            HttpServletRequest servletRequest
    ) {
        ApiResponse<Object> response = studentService.addStudent(request, servletRequest);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Import danh sách sinh viên từ file Excel", description = "Chỉ admin có quyền import sinh viên")
    public ResponseEntity<ApiResponse<Object>> importStudents(
            @RequestParam("className") String className,
            @RequestParam("file") MultipartFile file,
            HttpServletRequest servletRequest
    ) throws IOException {
        ApiResponse<Object> response = studentService.importStudentsFromExcel(className, file, servletRequest);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping(
            value = "/{studentId}/profile-image",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    @Operation(summary = "Tải lên ảnh hồ sơ sinh viên", description = "Tải lên ảnh hồ sơ cho sinh viên theo ID")
    public ResponseEntity<ApiResponse<Object>> uploadStudentProfileImage(
            @PathVariable("studentId") Long studentId,
            @RequestParam("file") MultipartFile file,
            HttpServletRequest servletRequest
    ) {
        ApiResponse<Object> response = studentService.uploadStudentProfileImage(studentId, file, servletRequest);
        return ResponseEntity.ok(response);
    }

    @GetMapping(
            value = "/{studentId}/profile-image",
            produces = MediaType.IMAGE_JPEG_VALUE
    )
    @Operation(summary = "Lấy ảnh hồ sơ sinh viên", description = "Lấy ảnh hồ sơ của sinh viên theo ID")
    public ResponseEntity<byte[]> getStudentProfileImage(
            @PathVariable("studentId") Long studentId,
            HttpServletRequest servletRequest
    ) {
        ApiResponse<Object> response = studentService.getStudentProfileImage(studentId, servletRequest);
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG)
                .body((byte[]) response.getData());
    }

    @GetMapping
    @Operation(summary = "Lấy danh sách sinh viên", description = "Lấy danh sách tất cả sinh viên")
    public ResponseEntity<ApiResponse<Object>> listStudents(HttpServletRequest servletRequest) {
        return ResponseEntity.ok(studentService.listStudents(servletRequest));
    }

    @DeleteMapping("/{studentId}")
    @Operation(summary = "Xóa sinh viên", description = "Chỉ admin có quyền xóa sinh viên")
    public ResponseEntity<ApiResponse<Object>> deleteStudent(
            @PathVariable("studentId") Long studentId,
            HttpServletRequest servletRequest
    ) {
        ApiResponse<Object> response = studentService.deleteStudent(studentId, servletRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping(
            value = "/{studentId}/face-registration",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    @Operation(summary = "Đăng ký ảnh khuôn mặt sinh viên", description = "Đăng ký ảnh khuôn mặt cho sinh viên theo ID, sử dụng AWS Rekognition")
    public ResponseEntity<ApiResponse<Object>> registerStudentFace(
            @PathVariable("studentId") Long studentId,
            @RequestParam("file") MultipartFile file,
            HttpServletRequest servletRequest
    ) {
        ApiResponse<Object> response = studentService.registerStudentFace(studentId, file, servletRequest);
        return ResponseEntity.ok(response);
    }

}