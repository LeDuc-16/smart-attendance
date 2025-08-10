package com.leduc.spring.room;

import com.leduc.spring.schedule.Schedule;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Table(name = "rooms")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "room_seq")
    @SequenceGenerator(name = "room_seq", sequenceName = "room_sequence", allocationSize = 1)
    private Long id;

    private String roomCode;
    private String locations;

    @OneToMany(mappedBy = "room")
    private List<Schedule> schedules;

    public Room(Long id) {
        this.id = id;
    }
}
