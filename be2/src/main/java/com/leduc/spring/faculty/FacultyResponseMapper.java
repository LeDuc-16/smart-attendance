package com.leduc.spring.faculty;

public class FacultyResponseMapper {

    public static FacultyResponse toResponse(Faculty faculty) {
        return FacultyResponse.builder()
                .id(faculty.getId())
                .facultyName(faculty.getFacultyName())
                .students(faculty.getStudents())
                .majors(faculty.getMajors())
                .lecturers(faculty.getLecturers())
                .build();
    }
}