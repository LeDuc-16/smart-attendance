package com.leduc.spring.major;

import com.leduc.spring.faculty.Faculty;
import com.leduc.spring.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "majors")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Major {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "major_seq")
    @SequenceGenerator(
            name = "major_seq",
            sequenceName = "major_seq",
            allocationSize = 1
    )
    private Long id;

    private String majorName;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "faculty_id")
    private Faculty faculty;
}
