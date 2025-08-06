package com.leduc.spring.faculty;

import com.leduc.spring.exception.ApiResponse;
import com.leduc.spring.exception.DuplicateResourceException;
import com.leduc.spring.exception.RequestValidationException;
import com.leduc.spring.exception.ResourceNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class FacultyService {

    @Autowired
    private FacultyRepository facultyRepository;

    public ApiResponse<Object> createFaculty(CreateFacultyRequest request, HttpServletRequest servletRequest) {
        boolean exists = facultyRepository.existsByFacultyName(request.getFacultyName());
        if (exists) {
            throw new DuplicateResourceException("Faculty name already exists");
        }

        Faculty faculty = Faculty.builder()
                .facultyName(request.getFacultyName())
                .build();

        facultyRepository.save(faculty);

        return ApiResponse.success(null, "Faculty created successfully", servletRequest.getRequestURI());
    }

    // Liệt kê tất cả các khoa
    public ApiResponse<Object> listFaculties(HttpServletRequest servletRequest) {
        Iterable<Faculty> faculties = facultyRepository.findAll();

        if (faculties == null || !faculties.iterator().hasNext()) {
            throw new ResourceNotFoundException("No faculties have found yet");
        }

        return ApiResponse.success(faculties, "List of faculties", servletRequest.getRequestURI());
    }

    // Cập nhật thông tin khoa
    public ApiResponse<Object> updateFaculty(HttpServletRequest servletRequest, Long facultyId, UpdateFacultyRequest request) {
        Faculty faculty = facultyRepository.findById(facultyId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Faculty not found with id: [%s]".formatted(facultyId)));

        boolean changes = false;

        if (request.getFacultyName() != null && !request.getFacultyName().equals(faculty.getFacultyName())) {
            if (facultyRepository.existsByFacultyName(request.getFacultyName())) {
                throw new DuplicateResourceException("Faculty name already exists");
            }
            faculty.setFacultyName(request.getFacultyName());
            changes = true;
        }

        if (!changes) {
            throw new RequestValidationException("No data changes found");
        }

        facultyRepository.save(faculty);

        return ApiResponse.success(null, "Faculty updated successfully", servletRequest.getRequestURI());
    }

    public ApiResponse<Object> deleteFaculty(HttpServletRequest servletRequest, Long facultyId) {
        Faculty faculty = facultyRepository.findById(facultyId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Faculty not found with id: [%s]".formatted(facultyId)));

        facultyRepository.delete(faculty);

        return ApiResponse.success(null, "Faculty deleted successfully", servletRequest.getRequestURI());
    }
}
