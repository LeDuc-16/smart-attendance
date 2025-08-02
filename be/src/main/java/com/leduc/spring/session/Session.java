package com.leduc.spring.session;

import com.leduc.spring.schedule.Schedule;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "sessions")
public class Session {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime createdAt;
    private LocalDateTime datetime;
    private Boolean statusAttendance;

    @OneToOne
    @JoinColumn(name = "schedule_id", unique = true)
    private Schedule schedule;
}

