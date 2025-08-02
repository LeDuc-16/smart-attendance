package com.leduc.spring.room;

import com.leduc.spring.schedule.Schedule;
import jakarta.persistence.*;

import java.util.List;

@Entity
@Table(name = "rooms")
public class Room {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String roomCode;
    private String locations;

    @OneToMany(mappedBy = "room")
    private List<Schedule> schedules;
}
