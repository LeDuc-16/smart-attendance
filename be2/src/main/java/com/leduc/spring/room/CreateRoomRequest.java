package com.leduc.spring.room;

import lombok.Data;

@Data
public class CreateRoomRequest {
    private String roomCode;
    private String locations;
}