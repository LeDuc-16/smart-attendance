package com.leduc.spring.user;

import lombok.Getter;

public enum Permission {

    ADMIN_READ("admin:read"),
    ADMIN_UPDATE("admin:update"),
    ADMIN_CREATE("admin:create"),
    ADMIN_DELETE("admin:delete"),

    LECTURER_READ("teacher:read"),
    LECTURER_UPDATE("teacher:update"),
    LECTURER_CREATE("teacher:create"),
    LECTURER_DELETE("teacher:delete"),

    STUDENT_READ("student:read"),
    STUDENT_UPDATE("student:update"),
    STUDENT_CREATE("student:create"),
    STUDENT_DELETE("student:delete");

    @Getter
    private final String permission;

    Permission(String permission) {
        this.permission = permission;
    }
}
