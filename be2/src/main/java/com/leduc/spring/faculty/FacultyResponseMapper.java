package com.leduc.spring.faculty;

public class FacultyResponseMapper {


    public static FacultyResponse toResponse(Faculty faculty) {
        return FacultyResponse.builder()
                .id(faculty.getId())
                .facultyName(faculty.getFacultyName())
                .build();
    }
}
