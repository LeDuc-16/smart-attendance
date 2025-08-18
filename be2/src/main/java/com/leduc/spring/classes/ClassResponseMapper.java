package com.leduc.spring.classes;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

public class ClassResponseMapper {

    public static ClassResponse toResponse(ClassEntity entity) {
        return ClassResponse.builder()
                .id(entity.getId())
                .className(entity.getClassName())
                .capacityStudent(entity.getCapacityStudent())
                // Lấy name từ User qua Lecturer
                .advisor(entity.getLecturer() != null && entity.getLecturer().getUser() != null
                        ? entity.getLecturer().getUser().getName()
                        : null)
                .build();
    }


    public static List<ClassResponse> toResponseList(Iterable<ClassEntity> entities) {
        return StreamSupport.stream(entities.spliterator(), false)
                .map(ClassResponseMapper::toResponse)
                .collect(Collectors.toList());
    }
}

