package com.leduc.spring.room;

import com.leduc.spring.exception.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/v1/rooms")
@RequiredArgsConstructor
@Tag(name = "Room Management", description = "API quản lý phòng học")
@SecurityRequirement(name = "bearerAuth")
public class RoomController {

    private final RoomService roomService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Tạo phòng học", description = "Chỉ admin có quyền tạo phòng học")
    public ResponseEntity<ApiResponse<Object>> createRoom(
            @RequestBody CreateRoomRequest request,
            HttpServletRequest servletRequest
    ) {
        ApiResponse<Object> response = roomService.addRoom(request, servletRequest);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER')")
    @Operation(summary = "Lấy danh sách phòng học", description = "Admin và giảng viên có quyền xem danh sách phòng học")
    public ResponseEntity<ApiResponse<Object>> listRooms(
            HttpServletRequest servletRequest
    ) {
        ApiResponse<Object> response = roomService.getAllRooms(servletRequest);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Cập nhật phòng học", description = "Chỉ admin có quyền cập nhật phòng học")
    public ResponseEntity<ApiResponse<Object>> updateRoom(
            @PathVariable("id") Long id,
            @RequestBody UpdateRoomRequest request,
            HttpServletRequest servletRequest
    ) {
        ApiResponse<Object> response = roomService.updateRoom(servletRequest, id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Xóa phòng học", description = "Chỉ admin có quyền xóa phòng học")
    public ResponseEntity<ApiResponse<Object>> deleteRoom(
            @PathVariable("id") Long id,
            HttpServletRequest servletRequest
    ) {
        ApiResponse<Object> response = roomService.deleteRoom(servletRequest, id);
        return ResponseEntity.ok(response);
    }
}