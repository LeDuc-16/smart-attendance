package com.leduc.spring.major;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MajorRepository extends JpaRepository<Major, Long> {
    Optional<Major> findByMajorName(String majorName);
    boolean existsByMajorNameIgnoreCaseAndFacultyId(String majorName, Long facultyId);
    List<Major> findByFacultyId(Long facultyId);
}
