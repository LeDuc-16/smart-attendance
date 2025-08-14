package com.leduc.spring.lecturer;

import com.leduc.spring.exception.ApiResponse;
import com.leduc.spring.exception.DuplicateResourceException;
import com.leduc.spring.exception.RequestValidationException;
import com.leduc.spring.exception.ResourceNotFoundException;
import com.leduc.spring.faculty.Faculty;
import com.leduc.spring.faculty.FacultyRepository;
import com.leduc.spring.user.Role;
import com.leduc.spring.user.User;
import com.leduc.spring.user.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LecturerService {

    @Autowired
    private LecturerRepository lecturerRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FacultyRepository facultyRepository;

    public ApiResponse<Object> createLecturer(CreateLecturerRequest request, HttpServletRequest servletRequest) {
        // Kiểm tra trùng lặp lecturerCode
        if (lecturerRepository.existsByLecturerCode(request.getLecturerCode())) {
            throw new DuplicateResourceException("Lecturer code already exists");
        }

        // Kiểm tra trùng lặp email
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already exists");
        }

        // Kiểm tra Faculty tồn tại
        Faculty faculty = facultyRepository.findById(request.getFacultyId())
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found with id: [%s]".formatted(request.getFacultyId())));

        // Tạo User với vai trò LECTURER
        User user = User.builder()
                .email(request.getEmail())
                .password(request.getPassword()) // Nên mã hóa password trong thực tế
                .name(request.getName())
                .account(request.getAccount())
                .role(Role.LECTURER) // Tự động gán vai trò LECTURER
                .build();
        userRepository.save(user);

        // Tạo Lecturer
        Lecturer lecturer = Lecturer.builder()
                .lecturerCode(request.getLecturerCode())
                .academicRank(request.getAcademicRank())
                .user(user)
                .faculty(faculty)
                .build();
        lecturerRepository.save(lecturer);

        return ApiResponse.success(null, "Lecturer created successfully", servletRequest.getRequestURI());
    }

    // Get All Lecturers
    public ApiResponse<Object> getAllLecturers(HttpServletRequest servletRequest) {
        List<Lecturer> lecturers = lecturerRepository.findAll();
        if (lecturers == null || lecturers.isEmpty()) {
            throw new ResourceNotFoundException("No lecturers found");
        }
        List<LecturerResponse> responses = Lecturer.(lecturers);
        return ApiResponse.success(responses, "List of lecturers", servletRequest.getRequestURI());
    }

    // Get Lecturer by ID
    public ApiResponse<Object> getLecturerById(Long id, HttpServletRequest servletRequest) {
        Lecturer lecturer = lecturerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lecturer not found with id: [%s]".formatted(id)));
        LecturerResponse response = LecturerMapper.fromEntity(lecturer);
        return ApiResponse.success(response, "Lecturer details", servletRequest.getRequestURI());
    }

    // Update Lecturer
    public ApiResponse<Object> updateLecturer(Long id, UpdateLecturerRequest request, HttpServletRequest servletRequest) {
        Lecturer lecturer = lecturerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lecturer not found with id: [%s]".formatted(id)));

        boolean changes = false;

        if (request.getLecturerCode() != null && !request.getLecturerCode().equals(lecturer.getLecturerCode())) {
            if (lecturerRepository.existsByLecturerCode(request.getLecturerCode())) {
                throw new DuplicateResourceException("Lecturer code already exists");
            }
            lecturer.setLecturerCode(request.getLecturerCode());
            changes = true;
        }

        if (request.getAcademicRank() != null && !request.getAcademicRank().equals(lecturer.getAcademicRank())) {
            lecturer.setAcademicRank(request.getAcademicRank());
            changes = true;
        }

        if (request.getFacultyId() != null && !request.getFacultyId().equals(lecturer.getFaculty().getId())) {
            Faculty faculty = facultyRepository.findById(request.getFacultyId())
                    .orElseThrow(() -> new ResourceNotFoundException("Faculty not found with id: [%s]".formatted(request.getFacultyId())));
            lecturer.setFaculty(faculty);
            changes = true;
        }

        if (!changes) {
            throw new RequestValidationException("No data changes found");
        }

        lecturerRepository.save(lecturer);
        return ApiResponse.success(null, "Lecturer updated successfully", servletRequest.getRequestURI());
    }

    // Delete Lecturer
    public ApiResponse<Object> deleteLecturer(Long id, HttpServletRequest servletRequest) {
        Lecturer lecturer = lecturerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lecturer not found with id: [%s]".formatted(id)));
        lecturerRepository.delete(lecturer);
        return ApiResponse.success(null, "Lecturer deleted successfully", servletRequest.getRequestURI());
    }

}