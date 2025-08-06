package com.leduc.spring.classes;

import lombok.Data;

@Data
public class CreateClassRequest {
    private String className;
    private Integer capacityStudent;
}
