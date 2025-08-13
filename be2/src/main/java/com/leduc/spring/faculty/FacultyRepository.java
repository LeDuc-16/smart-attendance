package com.leduc.spring.faculty;

import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

@Transactional
public interface FacultyRepository extends JpaRepository<Faculty, Long> {
    Optional<Faculty> findByFacultyName(String facultyName); // ✔ OK
    Optional<Faculty> findById(Long facultyId);               // ✔ kế thừa sẵn từ JpaRepository (thực ra dòng này có thể xóa)
    boolean existsByFacultyName(String facultyName);// ✔ OK
    Optional<Faculty> findByFacultyNameIgnoreCase(String facultyName);
}
