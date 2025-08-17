package com.leduc.spring.classes;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ClassResponse {
    private Long id;
    private String className;
    private Integer capacityStudent;
    private String advisor;
}
