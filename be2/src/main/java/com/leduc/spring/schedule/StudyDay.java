package com.leduc.spring.schedule;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "study_days")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudyDay {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "study_day_seq")
    @SequenceGenerator(name = "study_day_seq", sequenceName = "study_day_sequence", allocationSize = 1)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "day_of_week")
    private DayOfWeek dayOfWeek;

    @Column(name = "date")
    private LocalDate date;

    @Column(name = "is_open")
    @Builder.Default
    private boolean isOpen = false;

    @Column(name = "close_time")
    private LocalDateTime closeTime;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "schedule_id")
    @JsonIgnore
    private Schedule schedule;

    // Constructor for backward compatibility with existing code
    public StudyDay(DayOfWeek dayOfWeek, LocalDate date) {
        this.dayOfWeek = dayOfWeek;
        this.date = date;
        this.isOpen = false;
        this.closeTime = null;
    }

    // Constructor with all fields for backward compatibility
    public StudyDay(DayOfWeek dayOfWeek, LocalDate date, boolean isOpen, LocalDateTime closeTime) {
        this.dayOfWeek = dayOfWeek;
        this.date = date;
        this.isOpen = isOpen;
        this.closeTime = closeTime;
    }
}