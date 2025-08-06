package com.leduc.spring.classes;

import com.leduc.spring.exception.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/classes")
@RequiredArgsConstructor
@Tag(name = "Class Management", description = "API quản lý lớp học")
@SecurityRequirement(name = "bearerAuth")
public class ClassController {
    private final ClassService classService;

    @PostMapping("/add-class")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Tạo lớp học mới", description = "Chỉ Admin mới có thể tạo lớp học")
    public void addClass(@RequestBody CreateClassRequest request) {
        classService.addClass(request);
    }

}
