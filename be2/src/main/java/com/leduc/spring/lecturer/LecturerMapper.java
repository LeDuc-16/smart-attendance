package com.leduc.spring.lecturer;

import java.util.List;
import java.util.stream.Collectors;

public class LecturerMapper {

    public static LecturerResponse fromEntity(Lecturer lecturer) {
        LecturerResponse response = new LecturerResponse();
        response.setId(lecturer.getId());
        response.setLecturerCode(lecturer.getLecturerCode());
        response.setName(lecturer.getUser() != null ? lecturer.getUser().getName() : null);
        response.setAcademicRank(lecturer.getAcademicRank());
        response.setUserId(lecturer.getUser() != null ? lecturer.getUser().getId().longValue() : null);
        response.setFacultyId(lecturer.getFaculty() != null ? lecturer.getFaculty().getId() : null);
        response.setRole(lecturer.getUser() != null ? lecturer.getUser().getRole() : null);
        return response;
    }

    public static List<LecturerResponse> toResponseList(List<Lecturer> lecturers) {
        return lecturers.stream()
                .map(LecturerMapper::fromEntity)
                .collect(Collectors.toList());
    }
}