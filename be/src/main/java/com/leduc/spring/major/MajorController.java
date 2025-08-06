package com.leduc.spring.major;

import com.leduc.spring.exception.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/majors")
@RequiredArgsConstructor
public class MajorController {

    private final MajorService majorService;

    // Tạo mới Major
    @PostMapping("/add")
    public ResponseEntity<ApiResponse<Object>> createMajor(
            @RequestBody MajorRequest request,
            HttpServletRequest servletRequest
    ) {
        return majorService.addMajor(request, servletRequest);
    }

    // Lấy danh sách tất cả các Major
    @GetMapping("/list")
    public ResponseEntity<ApiResponse<Object>> listMajors(HttpServletRequest servletRequest) {
        return majorService.listMajors(servletRequest);
    }


    // Xóa Major theo ID
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ApiResponse<Object>> deleteMajor(
            @PathVariable Long id,
            HttpServletRequest servletRequest
    ) {
        return majorService.deleteMajor(id, servletRequest);
    }

    // Cập nhật Major theo ID
    @PutMapping("/update/{id}")
    public ResponseEntity<ApiResponse<Object>> updateMajor(
            @PathVariable Long id,
            @RequestBody MajorRequest request,
            HttpServletRequest servletRequest
    ) {
        return majorService.updateMajor(id, request, servletRequest);
    }

    // Lấy danh sách Major theo tên Khoa
    @GetMapping("/faculty")
    public ResponseEntity<ApiResponse<Object>> getMajorsByFacultyName(
            @RequestParam String facultyName,
            HttpServletRequest servletRequest
    ) {
        return majorService.findByFacultyName(facultyName, servletRequest);
    }
}
