package com.leduc.spring.facedescriptor;

import com.leduc.spring.user.User;
import jakarta.persistence.*;

@Entity
@Table(name = "face_descriptors")
public class FaceDescriptor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    private String descriptor;
}
