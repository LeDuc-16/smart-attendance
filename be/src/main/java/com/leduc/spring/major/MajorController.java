package com.leduc.spring.major;

import com.leduc.spring.exception.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/majors")
public class MajorController {

    private final MajorService majorService;

    public MajorController(MajorService majorService) {
        this.majorService = majorService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Object>> addMajor(@RequestBody MajorRequest request, HttpServletRequest servletRequest) {
        return ResponseEntity.ok(majorService.addMajor(request, servletRequest));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> deleteMajor(@PathVariable Long id, HttpServletRequest servletRequest) {
        return ResponseEntity.ok(majorService.deleteMajor(id, servletRequest));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> updateMajor(@PathVariable Long id, @RequestBody MajorRequest request, HttpServletRequest servletRequest) {
        return ResponseEntity.ok(majorService.updateMajor(id, request, servletRequest));
    }

    @GetMapping("/faculty/{name}")
    public ResponseEntity<ApiResponse<Object>> findByFacultyName(@PathVariable String name, HttpServletRequest servletRequest) {
        return ResponseEntity.ok(majorService.findByFacultyName(name, servletRequest));
    }

    @GetMapping("/list")
    public ResponseEntity<ApiResponse<Object>> listMajors(HttpServletRequest servletRequest) {
        return ResponseEntity.ok(majorService.listMajors(servletRequest));
    }
}
