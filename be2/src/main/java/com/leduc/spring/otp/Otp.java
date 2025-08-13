package com.leduc.spring.otp;

import com.leduc.spring.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "otps")
public class Otp {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "otp_seq")
    @SequenceGenerator(name = "otp_seq", sequenceName = "otp_sequence", allocationSize = 1)
    private Long id;

    private String otpCode;

    private LocalDateTime expiration;

    private boolean used;

    @ManyToOne
    @JoinColumn(name = "user_id") // thêm rõ ràng tên cột FK
    private User user;
}
