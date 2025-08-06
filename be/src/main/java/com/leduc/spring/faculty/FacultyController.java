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

    @PostMapping("/add-faculties")
    public ResponseEntity<ApiResponse<Object>> createFaculty(@RequestBody CreateFacultyRequest request, HttpServletRequest servletRequest) {
        return facultyService.createFaculty(request, servletRequest);
    }

    @GetMapping("/list-faculties")
    public ResponseEntity<ApiResponse<Object>> getAllFaculties(HttpServletRequest servletRequest) {
        return facultyService.listFaculties(servletRequest);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> updateFaculty(
            @PathVariable("id") Long facultyId,
            @RequestBody UpdateFacultyRequest request,
            HttpServletRequest servletRequest
    ) {
        return facultyService.updateFaculty(servletRequest, facultyId, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> deleteFaculty(
            @PathVariable("id") Long facultyId,
            HttpServletRequest servletRequest
    ) {
        return facultyService.deleteFaculty(servletRequest, facultyId);
    }

}

