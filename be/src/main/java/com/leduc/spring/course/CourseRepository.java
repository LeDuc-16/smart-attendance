package com.leduc.spring.course;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CourseRepository extends JpaRepository<Course, Long> {
    boolean existsByCourseName(String courseName);
    Optional<Course> findByCourseName(String courseName);
    boolean existsById(Long courseId);
}