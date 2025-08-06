package com.leduc.spring.classes;

import lombok.Data;

@Data
public class UpdateClassRequest {
    private String className;
    private Integer capacityStudent;
}
