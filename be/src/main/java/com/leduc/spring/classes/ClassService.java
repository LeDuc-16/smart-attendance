package com.leduc.spring.classes;

import com.leduc.spring.exception.ApiResponse;
import com.leduc.spring.exception.DuplicateResourceException;
import com.leduc.spring.exception.RequestValidationException;
import com.leduc.spring.exception.ResourceNotFoundException;
import com.leduc.spring.lecturer.Lecturer;
import com.leduc.spring.lecturer.LecturerRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ClassService {

    @Autowired
    private ClassRepository classRepository;

    @Autowired
    private LecturerRepository lecturerRepository;
    // Thêm lớp học
    public ApiResponse<Object> addClass(CreateClassRequest request, HttpServletRequest servletRequest) {
        if (classRepository.existsByClassName(request.getClassName())) {
            throw new DuplicateResourceException("Class name already exists");
        }
        ClassEntity classEntity = ClassEntity.builder()
                .className(request.getClassName())
                .capacityStudent(request.getCapacityStudent())
                .build();
        classRepository.save(classEntity);
        return ApiResponse.success(null, "Class created successfully", servletRequest.getRequestURI());
    }

    // Lấy danh sách tất cả các lớp
    public ApiResponse<Object> getAllClass(HttpServletRequest servletRequest) {
        List<ClassEntity> classes = classRepository.findAll();
        if (classes == null || classes.isEmpty()) {
            throw new ResourceNotFoundException("No classes have found yet");
        }
        List<ClassResponse> responses = ClassResponseMapper.toResponseList(classes);
        return ApiResponse.success(responses, "List of classes", servletRequest.getRequestURI());
    }

    // Cập nhật lớp
    public ApiResponse<Object> updateClass(HttpServletRequest servletRequest, Long classId, UpdateClassRequest request) {
        ClassEntity classEntity = classRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Class not found with id: [%s]".formatted(classId)));

        boolean changes = false;

        if (request.getClassName() != null && !request.getClassName().equals(classEntity.getClassName())) {
            if (classRepository.existsByClassName(request.getClassName())) {
                throw new DuplicateResourceException("Another class with the same name already exists");
            }
            classEntity.setClassName(request.getClassName());
            changes = true;
        }

        if (request.getCapacityStudent() != null && !request.getCapacityStudent().equals(classEntity.getCapacityStudent())) {
            classEntity.setCapacityStudent(request.getCapacityStudent());
            changes = true;
        }

        if (!changes) {
            throw new RequestValidationException("No data changes found");
        }

        classRepository.save(classEntity);
        return ApiResponse.success(null, "Class updated successfully", servletRequest.getRequestURI());
    }

    // Xóa lớp
    public ApiResponse<Object> deleteClass(HttpServletRequest servletRequest, Long classId) {
        ClassEntity classEntity = classRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Class not found with id: [%s]".formatted(classId)));
        classRepository.delete(classEntity);
        return ApiResponse.success(null, "Class deleted successfully", servletRequest.getRequestURI());
    }

    public ApiResponse<Object> addLecturerToClass(AddLecturerToClassRequest request, HttpServletRequest servletRequest) {
        // Tìm lớp theo className
        ClassEntity classEntity = classRepository.findByClassName(request.getClassName())
                .orElseThrow(() -> new ResourceNotFoundException("Class not found with name: [%s]".formatted(request.getClassName())));

        // Tìm giảng viên theo lecturerId
        Lecturer lecturer = lecturerRepository.findById(request.getLecturerId())
                .orElseThrow(() -> new ResourceNotFoundException("Lecturer not found with id: [%d]".formatted(request.getLecturerId())));

        // Gán giảng viên chủ nhiệm cho lớp
        classEntity.setLecturer(lecturer);

        // Lưu lớp
        classRepository.save(classEntity);

        return ApiResponse.success(null, "Lecturer assigned to class successfully", servletRequest.getRequestURI());
    }

}