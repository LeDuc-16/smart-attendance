package com.leduc.spring.faculty;

import com.leduc.spring.exception.ApiResponse;
import com.leduc.spring.exception.RequestValidationException;
import com.leduc.spring.exception.ResourceNotFoundException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import com.leduc.spring.exception.DuplicateResourceException;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class FacultyService {

    @Autowired
    private FacultyRepository facultyRepository;

    public ResponseEntity<ApiResponse<Object>> createFaculty(CreateFacultyRequest request, HttpServletRequest servletRequest) {
        // Check duplicate
        boolean exists = facultyRepository.existsByFacultyName(request.getFacultyName());
        if (exists) {
            throw new DuplicateResourceException("Faculty name already exists");
        }
        Faculty faculty = Faculty.builder()
                .facultyName(request.getFacultyName())
                .build();

        facultyRepository.save(faculty);

        return ResponseEntity.ok(
                ApiResponse.success(null, "Faculty created successfully", servletRequest.getRequestURI())
        );
    }

    //liet ke tat ca cac faculty dang co
    public ResponseEntity<ApiResponse<Object>> listFaculties(HttpServletRequest servletRequest) {
        Iterable<Faculty> faculties = facultyRepository.findAll();
        if (faculties == null || !faculties.iterator().hasNext()) {
            throw new ResourceNotFoundException("No faculties have found yet");
        }
        return ResponseEntity.ok(
                ApiResponse.success(faculties, "List of faculties", servletRequest.getRequestURI())
        );
    }

    // Chỉnh sửa Faculty
    public ResponseEntity<ApiResponse<Object>> updateFaculty(HttpServletRequest servletRequest, Long facultyId, UpdateFacultyRequest request) {
        Faculty faculty = facultyRepository.findById(facultyId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Faculty not found with id: [%s]".formatted(facultyId)));

        boolean changes = false;

        // Kiểm tra và cập nhật tên khoa nếu cần
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

        // Lưu thay đổi
        facultyRepository.save(faculty);

        // Tạo response thành công
        ApiResponse<Object> response = ApiResponse.success(
                null,
                "Faculty updated successfully",
                servletRequest.getRequestURI()
        );

        return ResponseEntity.ok(response);
    }

    public ResponseEntity<ApiResponse<Object>> deleteFaculty(HttpServletRequest servletRequest, Long facultyId) {
        Faculty faculty = facultyRepository.findById(facultyId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Faculty not found with id: [%s]".formatted(facultyId)));
        facultyRepository.delete(faculty);
        return ResponseEntity.ok(
                ApiResponse.success(null, "Faculty deleted successfully", servletRequest.getRequestURI())
        );
    }


}



