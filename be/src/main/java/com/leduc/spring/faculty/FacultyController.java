package com.leduc.spring.faculty;

import com.leduc.spring.exception.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/faculties")
public class FacultyController {

    private final FacultyService facultyService;

    public FacultyController(FacultyService facultyService) {
        this.facultyService = facultyService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Object>> createFaculty(
            @RequestBody CreateFacultyRequest request,
            HttpServletRequest servletRequest
    ) {
        return ResponseEntity.ok(facultyService.createFaculty(request, servletRequest));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Object>> listFaculties(HttpServletRequest servletRequest) {
        return ResponseEntity.ok(facultyService.listFaculties(servletRequest));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> updateFaculty(
            @PathVariable("id") Long id,
            @RequestBody UpdateFacultyRequest request,
            HttpServletRequest servletRequest
    ) {
        return ResponseEntity.ok(facultyService.updateFaculty(servletRequest, id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> deleteFaculty(
            @PathVariable("id") Long id,
            HttpServletRequest servletRequest
    ) {
        return ResponseEntity.ok(facultyService.deleteFaculty(servletRequest, id));
    }
}


