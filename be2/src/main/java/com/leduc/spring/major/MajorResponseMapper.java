package com.leduc.spring.major;

import java.util.List;
import java.util.stream.Collectors;

public class MajorResponseMapper {

    public static MajorResponse toResponse(Major major) {
        return new MajorResponse(
                major.getId(),
                major.getMajorName(),
                major.getFaculty() != null ? major.getFaculty().getId() : null,
                major.getFaculty() != null ? major.getFaculty().getFacultyName() : null
        );
    }

    public static List<MajorResponse> toResponseList(List<Major> majors) {
        return majors.stream()
                .map(MajorResponseMapper::toResponse)
                .collect(Collectors.toList());
    }
}
