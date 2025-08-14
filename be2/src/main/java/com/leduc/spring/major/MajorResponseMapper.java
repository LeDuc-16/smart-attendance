package com.leduc.spring.major;

import java.util.List;
import java.util.stream.Collectors;

public class MajorResponseMapper {
    public static MajorResponse toResponse(Major major) {
        return new MajorResponse(
                major.getId(),
                major.getMajorName(),
                major.getFaculty().getId(),
                major.getFaculty().getFacultyName()
        );
    }

    public static List<MajorResponse> toResponseList(Iterable<Major> majors) {
        return ((List<Major>) majors).stream()
                .map(MajorResponseMapper::toResponse)
                .collect(Collectors.toList());
    }
}
