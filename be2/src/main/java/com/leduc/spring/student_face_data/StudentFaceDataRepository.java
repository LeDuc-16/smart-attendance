package com.leduc.spring.student_face_data;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface StudentFaceDataRepository extends JpaRepository<StudentFaceData, Long> {

    List<StudentFaceData> findByStudent_IdAndActiveTrue(Long studentId);

    @Modifying
    @Query("update StudentFaceData f set f.active = false where f.student.id = :studentId and f.active = true")
    void deactivateAllActiveByStudentId(Long studentId);
}
