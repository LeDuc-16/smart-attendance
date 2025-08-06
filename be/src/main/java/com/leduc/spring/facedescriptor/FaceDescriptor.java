package com.leduc.spring.facedescriptor;

import com.leduc.spring.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "face_descriptors")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FaceDescriptor {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "face_descriptor_seq")
    @SequenceGenerator(name = "face_descriptor_seq", sequenceName = "face_descriptor_sequence", allocationSize = 1)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String descriptor;
}
