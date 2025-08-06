package com.leduc.spring.classes;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Transactional
public interface ClassRepository extends JpaRepository<ClassEntity, Long> {
    boolean existsByClassName(String className);
}
