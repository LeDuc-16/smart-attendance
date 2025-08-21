package com.leduc.spring.student;

import com.leduc.spring.exception.ApiResponse;
import com.leduc.spring.student_face_data.StudentFaceDataService;
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

    private final StudentFaceDataService studentFaceDataService;
    private final StudentService studentService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Thêm sinh viên", description = "Chỉ admin có quyền thêm sinh viên")
    public ResponseEntity<ApiResponse<Object>> addStudent(
            @Valid @RequestBody CreateStudentRequest request,
            HttpServletRequest servletRequest
    ) {
        ApiResponse<Object> response = studentService.addStudent(request, servletRequest);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
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
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    @Operation(summary = "Tải lên ảnh hồ sơ sinh viên", description = "Tải lên ảnh hồ sơ cho sinh viên theo ID, chỉ admin và giảng viên")
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
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER','STUDENT')")
    @Operation(summary = "Lấy ảnh hồ sơ sinh viên", description = "Lấy ảnh hồ sơ của sinh viên theo ID (ai cũng có thể xem nếu có quyền truy cập)")
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
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Lấy danh sách sinh viên", description = "Lấy danh sách tất cả sinh viên, chỉ admin")
    public ResponseEntity<ApiResponse<Object>> listStudents(HttpServletRequest servletRequest) {
        return ResponseEntity.ok(studentService.listStudents(servletRequest));
    }

    @DeleteMapping("/{studentId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Xóa sinh viên", description = "Chỉ admin có quyền xóa sinh viên")
    public ResponseEntity<ApiResponse<Object>> deleteStudent(
            @PathVariable("studentId") Long studentId,
            HttpServletRequest servletRequest
    ) {
        ApiResponse<Object> response = studentService.deleteStudent(studentId, servletRequest);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/by-class/{className}")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    @Operation(summary = "Lấy danh sách sinh viên theo tên lớp", description = "Chỉ admin và giảng viên có quyền xem")
    public ResponseEntity<ApiResponse<Object>> getStudentsByClassName(
            @PathVariable("className") String className,
            HttpServletRequest servletRequest
    ) {
        ApiResponse<Object> response = studentService.getStudentsByClassName(className, servletRequest);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{studentId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Cập nhật sinh viên", description = "Chỉ admin có quyền cập nhật thông tin sinh viên")
    public ResponseEntity<ApiResponse<Object>> updateStudent(
            @PathVariable("studentId") Long studentId,
            @Valid @RequestBody CreateStudentRequest request,
            HttpServletRequest servletRequest
    ) {
        ApiResponse<Object> response = studentService.updateStudent(studentId, request, servletRequest);
        return ResponseEntity.ok(response);
    }

}
