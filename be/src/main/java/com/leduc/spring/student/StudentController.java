package com.leduc.spring.student;

import com.leduc.spring.auth.AuthenticationService;
import com.leduc.spring.exception.ApiResponse;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/student")
public class StudentController {
    // import nhieu sinh vien
    private final AuthenticationService authenticationService;
    private final StudentService studentService;

    public StudentController(AuthenticationService authenticationService, StudentService studentService) {
        this.authenticationService = authenticationService;
        this.studentService = studentService;
    }

    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ImportStudentExcelResponse>> importStudents(
            @ModelAttribute ImportStudentExcelRequest request
    ) {
        ApiResponse<ImportStudentExcelResponse> response = studentService.importFromExcel(
                request.getFile(), request
        );
        return ResponseEntity.ok(response);
    }





}
