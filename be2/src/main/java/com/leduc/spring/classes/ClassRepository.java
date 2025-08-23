package com.leduc.spring.classes;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
@Transactional
public interface ClassRepository extends JpaRepository<ClassEntity, Long> {
    boolean existsByClassName(String className);
    Optional<ClassEntity> findByClassName(String className);

    @Query("SELECT c FROM ClassEntity c JOIN c.students s WHERE s.id = :studentId")
    Optional<ClassEntity> findByStudentId(@Param("studentId") Long studentId);
}