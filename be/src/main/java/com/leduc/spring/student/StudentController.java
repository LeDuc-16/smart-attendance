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

}