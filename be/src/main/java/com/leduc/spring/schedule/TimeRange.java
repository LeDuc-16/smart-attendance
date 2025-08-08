package com.leduc.spring.schedule;

import jakarta.persistence.Embeddable;
import lombok.*;

import java.time.LocalTime;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimeRange {
    private LocalTime startTime;
    private LocalTime endTime;
}
