package com.leduc.spring.user;

import lombok.*;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import static com.leduc.spring.user.Permission.*;

public enum Role {

        USER(Collections.emptySet()),

        ADMIN(
                        Set.of(
                                        ADMIN_READ,
                                        ADMIN_UPDATE,
                                        ADMIN_DELETE,
                                        ADMIN_CREATE,
                                        LECTURER_READ,
                                        LECTURER_UPDATE,
                                        LECTURER_DELETE,
                                        LECTURER_CREATE,
                                        STUDENT_READ,
                                        STUDENT_UPDATE,
                                        STUDENT_DELETE,
                                        STUDENT_CREATE)),

        LECTURER(
                        Set.of(
                                        LECTURER_READ,
                                        LECTURER_UPDATE,
                                        LECTURER_DELETE,
                                        LECTURER_CREATE,
                                        STUDENT_READ,
                                        STUDENT_UPDATE,
                                        STUDENT_DELETE,
                                        STUDENT_CREATE)),

        STUDENT(
                        Set.of(
                                        STUDENT_READ,
                                        STUDENT_UPDATE,
                                        STUDENT_DELETE,
                                        STUDENT_CREATE));

        @Getter
        private final Set<Permission> permissions;

        Role(Set<Permission> permissions) {
            this.permissions = permissions;
        }

        public List<SimpleGrantedAuthority> getAuthorities() {
                var authorities = getPermissions()
                                .stream()
                                .map(permission -> new SimpleGrantedAuthority(permission.getPermission()))
                                .collect(Collectors.toList());
                authorities.add(new SimpleGrantedAuthority("ROLE_" + this.name()));
                return authorities;
        }
}
