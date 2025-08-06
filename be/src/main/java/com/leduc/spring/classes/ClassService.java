package com.leduc.spring.classes;

import com.leduc.spring.exception.DuplicateResourceException;
import org.springframework.stereotype.Service;

@Service
public class ClassService {
    private final ClassRepository classRepository;

    public ClassService(ClassRepository classRepository) {
        this.classRepository = classRepository;
    }

    public void addClass(CreateClassRequest createClassRequest) {
        if (classRepository.existsByClassName(createClassRequest.getClassName())) {
            throw new DuplicateResourceException("Class name already exists");
        }
        ClassEntity classEntity = ClassEntity.builder()
                .className(createClassRequest.getClassName())
                .capacityStudent(createClassRequest.getCapacityStudent())
                .build();
        classRepository.save(classEntity);
    }
}
