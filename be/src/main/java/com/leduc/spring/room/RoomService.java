package com.leduc.spring.room;

import com.leduc.spring.exception.ApiResponse;
import com.leduc.spring.exception.DuplicateResourceException;
import com.leduc.spring.exception.RequestValidationException;
import com.leduc.spring.exception.ResourceNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RoomService {

    @Autowired
    private RoomRepository roomRepository;

    // Thêm phòng
    public ApiResponse<Object> addRoom(CreateRoomRequest request, HttpServletRequest servletRequest) {
        if (request.getRoomCode() == null || request.getRoomCode().trim().isEmpty()) {
            throw new RequestValidationException("Room code cannot be empty");
        }
        if (roomRepository.existsByRoomCode(request.getRoomCode())) {
            throw new DuplicateResourceException("Room code already exists");
        }
        Room room = Room.builder()
                .roomCode(request.getRoomCode())
                .locations(request.getLocations())
                .build();
        roomRepository.save(room);
        return ApiResponse.success(null, "Room created successfully", servletRequest.getRequestURI());
    }

    // Lấy danh sách tất cả các phòng
    public ApiResponse<Object> getAllRooms(HttpServletRequest servletRequest) {
        List<Room> rooms = roomRepository.findAll();
        if (rooms == null || rooms.isEmpty()) {
            throw new ResourceNotFoundException("No rooms have found yet");
        }
        List<RoomResponse> responses = RoomResponseMapper.toResponseList(rooms);
        return ApiResponse.success(responses, "List of rooms", servletRequest.getRequestURI());
    }

    // Cập nhật phòng
    public ApiResponse<Object> updateRoom(HttpServletRequest servletRequest, Long roomId, UpdateRoomRequest request) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: [%s]".formatted(roomId)));

        boolean changes = false;

        if (request.getRoomCode() != null && !request.getRoomCode().equals(room.getRoomCode())) {
            if (roomRepository.existsByRoomCode(request.getRoomCode())) {
                throw new DuplicateResourceException("Another room with the same code already exists");
            }
            room.setRoomCode(request.getRoomCode());
            changes = true;
        }

        if (request.getLocations() != null && !request.getLocations().equals(room.getLocations())) {
            room.setLocations(request.getLocations());
            changes = true;
        }

        if (!changes) {
            throw new RequestValidationException("No data changes found");
        }

        roomRepository.save(room);
        return ApiResponse.success(null, "Room updated successfully", servletRequest.getRequestURI());
    }

    // Xóa phòng
    public ApiResponse<Object> deleteRoom(HttpServletRequest servletRequest, Long roomId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: [%s]".formatted(roomId)));
        roomRepository.delete(room);
        return ApiResponse.success(null, "Room deleted successfully", servletRequest.getRequestURI());
    }
}