package com.leduc.spring.student;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface StudentRepository extends JpaRepository<Student, Long> {
    boolean existsByUserName(String name); // Sửa từ existsByStudentName
    boolean existsByStudentCode(String studentCode);
    boolean existsByUserEmail(String email); // Nếu kiểm tra email
    boolean existsByUserAccount(String account); // Nếu kiểm tra account
    @Modifying
    @Query("UPDATE Student s SET s.profileImageId = :profileImageId WHERE s.id = :studentId")
    void updateProfileImageId(String profileImageId, Long studentId);

}