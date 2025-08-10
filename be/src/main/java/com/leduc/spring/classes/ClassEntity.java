package com.leduc.spring.classes;

import com.leduc.spring.lecturer.Lecturer;
import com.leduc.spring.student.Student;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "classes")
public class ClassEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "class_seq")
    @SequenceGenerator(name = "class_seq", sequenceName = "class_sequence", allocationSize = 1)
    private Long id;

    private String className;
    private Integer capacityStudent;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lecturer_id") // Giảng viên chủ nhiệm
    private Lecturer lecturer;

    @OneToMany(mappedBy = "classes")
    private List<Student> students;

    public ClassEntity(Long id) {
        this.id = id;
    }
}

