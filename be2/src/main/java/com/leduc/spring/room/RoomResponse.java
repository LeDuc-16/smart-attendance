package com.leduc.spring.room;

import lombok.Data;

@Data
public class RoomResponse {
    private Long id;
    private String roomCode;
    private String locations;
}