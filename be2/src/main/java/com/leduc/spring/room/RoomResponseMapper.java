package com.leduc.spring.room;

import java.util.List;
import java.util.stream.Collectors;

public class RoomResponseMapper {

    public static RoomResponse toResponse(Room room) {
        RoomResponse response = new RoomResponse();
        response.setId(room.getId());
        response.setRoomCode(room.getRoomCode());
        response.setLocations(room.getLocations());
        return response;
    }

    public static List<RoomResponse> toResponseList(List<Room> rooms) {
        return rooms.stream()
                .map(RoomResponseMapper::toResponse)
                .collect(Collectors.toList());
    }
}