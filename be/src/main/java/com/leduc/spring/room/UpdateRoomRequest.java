package com.leduc.spring.room;

import lombok.Data;

@Data
public class UpdateRoomRequest {
    private String roomCode;
    private String locations;
}