package com.leduc.spring.major;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MajorRepository extends JpaRepository<Major, Long> {
    Optional<Major> findByName(String name); // Đồng bộ với findByName trong service
    Optional<Major> findByMajorName(String majorName); // Giữ lại để tương thích với các code khác (nếu cần)
    boolean existsByMajorNameIgnoreCaseAndFacultyId(String majorName, Long facultyId);
    List<Major> findByFacultyId(Long facultyId);
}