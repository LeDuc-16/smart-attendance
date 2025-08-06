package com.leduc.spring.major;

import com.leduc.spring.exception.ApiResponse;
import com.leduc.spring.exception.DuplicateResourceException;
import com.leduc.spring.exception.RequestValidationException;
import com.leduc.spring.exception.ResourceNotFoundException;
import com.leduc.spring.faculty.Faculty;
import com.leduc.spring.faculty.FacultyRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MajorService {

    private final MajorRepository majorRepository;
    private final FacultyRepository facultyRepository;

    public MajorService(MajorRepository majorRepository, FacultyRepository facultyRepository) {
        this.majorRepository = majorRepository;
        this.facultyRepository = facultyRepository;
    }

    public ApiResponse<Object> addMajor(MajorRequest request, HttpServletRequest servletRequest) {
        Faculty faculty = facultyRepository.findById(request.getFacultyId())
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found"));

        boolean exists = majorRepository.existsByMajorNameIgnoreCaseAndFacultyId(
                request.getMajorName(), request.getFacultyId()
        );

        if (exists) {
            throw new DuplicateResourceException("Major name already exists");
        }

        Major major = Major.builder()
                .majorName(request.getMajorName())
                .faculty(faculty)
                .build();

        majorRepository.save(major);

        return ApiResponse.success(null, "Major created successfully", servletRequest.getRequestURI());
    }

    public ApiResponse<Object> deleteMajor(Long id, HttpServletRequest servletRequest) {
        Major major = majorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Major not found"));

        majorRepository.delete(major);

        return ApiResponse.success(null, "Major deleted successfully", servletRequest.getRequestURI());
    }

    public ApiResponse<Object> updateMajor(Long id, MajorRequest request, HttpServletRequest servletRequest) {
        Major major = majorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Major not found"));

        boolean changes = false;

        if (request.getMajorName() != null && !request.getMajorName().equalsIgnoreCase(major.getMajorName())) {
            if (majorRepository.existsByMajorNameIgnoreCaseAndFacultyId(request.getMajorName(), request.getFacultyId())) {
                throw new DuplicateResourceException("Major name already exists");
            }
            major.setMajorName(request.getMajorName());
            changes = true;
        }

        if (!changes) {
            throw new RequestValidationException("No data changes found");
        }

        majorRepository.save(major);

        return ApiResponse.success(null, "Major updated successfully", servletRequest.getRequestURI());
    }

    // Tìm major theo tên khoa
    public ApiResponse<Object> findByFacultyName(String facultyName, HttpServletRequest servletRequest) {
        Faculty faculty = facultyRepository.findByFacultyNameIgnoreCase(facultyName)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found"));

        List<Major> majors = majorRepository.findByFacultyId(faculty.getId());

        if (majors.isEmpty()) {
            throw new ResourceNotFoundException("No majors found for this faculty");
        }

        List<MajorResponse> responses = majors.stream()
                .map(MajorResponseMapper::toResponse)
                .toList();

        return ApiResponse.success(responses, "Majors for faculty: " + facultyName, servletRequest.getRequestURI());
    }

    // Lấy ra tất cả majors bất kể khoa nào
    public ApiResponse<Object> listMajors(HttpServletRequest servletRequest) {
        List<Major> majors = majorRepository.findAll();

        if (majors.isEmpty()) {
            throw new ResourceNotFoundException("No majors found");
        }

        List<MajorResponse> responses = majors.stream()
                .map(MajorResponseMapper::toResponse)
                .toList();

        return ApiResponse.success(responses, "List of majors", servletRequest.getRequestURI());
    }
}
