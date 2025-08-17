package com.leduc.spring.student;

import com.leduc.spring.classes.ClassEntity;
import com.leduc.spring.classes.ClassRepository;
import com.leduc.spring.exception.ApiResponse;
import com.leduc.spring.exception.DuplicateResourceException;
import com.leduc.spring.exception.ImportException;
import com.leduc.spring.exception.ResourceNotFoundException;
import com.leduc.spring.faculty.Faculty;
import com.leduc.spring.faculty.FacultyRepository;
import com.leduc.spring.major.Major;
import com.leduc.spring.major.MajorRepository;
import com.leduc.spring.s3.S3Buckets;
import com.leduc.spring.s3.S3Service;
import com.leduc.spring.user.Role;
import com.leduc.spring.user.User;
import com.leduc.spring.user.UserRepository;
import io.micrometer.common.util.StringUtils;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final ClassRepository classRepository;
    private final MajorRepository majorRepository;
    private final FacultyRepository facultyRepository;
    private final PasswordEncoder passwordEncoder;
    private final S3Service s3Service;
    private final S3Buckets s3Buckets;

    // Thêm một sinh viên
    public ApiResponse<Object> addStudent(CreateStudentRequest request, HttpServletRequest servletRequest) {
        // Kiểm tra lớp học tồn tại
        ClassEntity classEntity = classRepository.findByClassName(request.getClassName())
                .orElseThrow(() -> new ResourceNotFoundException("Class not found with name: [%s]".formatted(request.getClassName())));

        // Kiểm tra major tồn tại
        Major major = majorRepository.findByMajorName(request.getMajorName())
                .orElseThrow(() -> new ResourceNotFoundException("Major not found with name: [%s]".formatted(request.getMajorName())));

        // Kiểm tra faculty tồn tại
        Faculty faculty = facultyRepository.findByFacultyName(request.getFacultyName())
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found with name: [%s]".formatted(request.getFacultyName())));

        // Kiểm tra dung lượng lớp học
        if (classEntity.getStudents().size() >= classEntity.getCapacityStudent()) {
            throw new ResourceNotFoundException("Class capacity exceeded for class: [%s]".formatted(request.getClassName()));
        }

        // Kiểm tra studentCode đã tồn tại
        if (studentRepository.existsByStudentCode(request.getStudentCode())) {
            throw new DuplicateResourceException("Student code already exists");
        }

        // Kiểm tra account hoặc email đã tồn tại
        if (userRepository.existsByAccount(request.getAccount()) || userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Account or email already exists");
        }

        // Tạo User
        User user = User.builder()
                .name(request.getStudentName())
                .account(request.getAccount())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.STUDENT)
                .build();
        User savedUser = userRepository.save(user);

        // Tạo Student và liên kết với User, Class, Major, Faculty
        Student student = Student.builder()
                .studentCode(request.getStudentCode())
                .user(savedUser)
                .classes(classEntity)
                .major(major)
                .faculty(faculty)
                .build();
        studentRepository.save(student);

        // Cập nhật danh sách students trong class
        classEntity.getStudents().add(student);
        classRepository.save(classEntity);

        return ApiResponse.success(null, "Student added successfully", servletRequest.getRequestURI());
    }

    // Import danh sách sinh viên từ file Excel
    public ApiResponse<Object> importStudentsFromExcel(String className, MultipartFile file, HttpServletRequest servletRequest) throws IOException {
        // Kiểm tra lớp học tồn tại
        ClassEntity classEntity = classRepository.findByClassName(className)
                .orElseThrow(() -> new ResourceNotFoundException("Class not found with name: [%s]".formatted(className)));

        // Kiểm tra file rỗng
        if (file.isEmpty()) {
            throw new ImportException(List.of("Excel file is empty"));
        }

        // Đọc file Excel
        List<CreateStudentRequest> studentRequests = new ArrayList<>();
        List<String> errors = new ArrayList<>();

        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            // Bỏ qua dòng tiêu đề
            for (int i = 1; i < sheet.getPhysicalNumberOfRows(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                CreateStudentRequest request = new CreateStudentRequest();
                request.setStudentCode(getCellValue(row, 0));
                request.setStudentName(getCellValue(row, 1));
                request.setAccount(getCellValue(row, 2));
                request.setEmail(getCellValue(row, 3));
                request.setPassword(getCellValue(row, 4));
                request.setMajorName(getCellValue(row, 5));
                request.setFacultyName(getCellValue(row, 6));
                request.setClassName(className);

                // Kiểm tra dữ liệu cơ bản
                if (isInvalidRequest(request, errors, i + 1)) {
                    continue;
                }

                studentRequests.add(request);
            }
        }

        // Lưu từng sinh viên
        for (CreateStudentRequest request : studentRequests) {
            try {
                addStudent(request, servletRequest);
            } catch (Exception e) {
                errors.add("Error importing student with code [%s]: %s".formatted(request.getStudentCode(), e.getMessage()));
            }
        }

        if (!errors.isEmpty()) {
            throw new ImportException(errors);
        }

        return ApiResponse.success(null, "Students imported successfully", servletRequest.getRequestURI());
    }

    // Kiểm tra dữ liệu cơ bản từ Excel
    private boolean isInvalidRequest(CreateStudentRequest request, List<String> errors, int rowNum) {
        boolean hasError = false;
        if (request.getStudentCode() == null || request.getStudentCode().isBlank()) {
            errors.add("Row %d: Student code is required".formatted(rowNum));
            hasError = true;
        }
        if (request.getStudentName() == null || request.getStudentName().isBlank()) {
            errors.add("Row %d: Student name is required".formatted(rowNum));
            hasError = true;
        }
        if (request.getAccount() == null || request.getAccount().isBlank()) {
            errors.add("Row %d: Account is required".formatted(rowNum));
            hasError = true;
        }
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            errors.add("Row %d: Email is required".formatted(rowNum));
            hasError = true;
        }
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            errors.add("Row %d: Password is required".formatted(rowNum));
            hasError = true;
        }
        if (request.getMajorName() == null || request.getMajorName().isBlank()) {
            errors.add("Row %d: Major name is required".formatted(rowNum));
            hasError = true;
        }
        if (request.getFacultyName() == null || request.getFacultyName().isBlank()) {
            errors.add("Row %d: Faculty name is required".formatted(rowNum));
            hasError = true;
        }
        if (request.getClassName() == null || request.getClassName().isBlank()) {
            errors.add("Row %d: Class name is required".formatted(rowNum));
            hasError = true;
        }
        return hasError;
    }

    // Hàm hỗ trợ lấy giá trị từ cell
    private String getCellValue(Row row, int cellIndex) {
        if (row == null) {
            return null;
        }

        Cell cell = row.getCell(cellIndex);
        if (cell == null) {
            return null;
        }

        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue().trim();

            case NUMERIC:
                // Dùng BigDecimal để tránh scientific notation
                return BigDecimal.valueOf(cell.getNumericCellValue())
                        .toPlainString()
                        .trim();

            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());

            case FORMULA:
                // Xử lý công thức, vẫn dùng BigDecimal nếu ra số
                try {
                    return BigDecimal.valueOf(cell.getNumericCellValue())
                            .toPlainString()
                            .trim();
                } catch (IllegalStateException e) {
                    return cell.getStringCellValue().trim();
                }

            case BLANK:
            default:
                return "";
        }
    }

    @Transactional
    public ApiResponse<Object> uploadStudentProfileImage(Long studentId, MultipartFile file, HttpServletRequest servletRequest) {
        // Check if student exists
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Student with id [%s] not found".formatted(studentId)));

        // Generate unique image ID
        String profileImageId = UUID.randomUUID().toString();

        try {
            // Upload image to S3
            s3Service.putObject(
                    s3Buckets.getStudent(),
                    "profile-images/students/%s/%s".formatted(studentId, profileImageId),
                    file.getBytes(),
                    file.getContentType() // 👈 Lấy loại file từ MultipartFile
            );
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload profile image", e);
        }

        // Update student's profileImageId
        studentRepository.updateProfileImageId(profileImageId, studentId);

        return ApiResponse.success(null, "Student profile image uploaded successfully", servletRequest.getRequestURI());
    }

    public ApiResponse<Object> getStudentProfileImage(Long studentId, HttpServletRequest servletRequest) {
        // Check if student exists
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Student with id [%s] not found".formatted(studentId)));

        // Check if profile image exists
        if (StringUtils.isBlank(student.getProfileImageId())) {
            throw new ResourceNotFoundException(
                    "Profile image for student with id [%s] not found".formatted(studentId));
        }

        // Retrieve image from S3
        byte[] profileImage = s3Service.getObject(
                s3Buckets.getStudent(), // Adjust to use the appropriate bucket
                "profile-images/students/%s/%s".formatted(studentId, student.getProfileImageId())
        );

        return ApiResponse.success(profileImage, "Student profile image retrieved successfully", servletRequest.getRequestURI());
    }

    public ApiResponse<Object> listStudents(HttpServletRequest servletRequest) {
        List<Student> students = studentRepository.findAll();
        if (students.isEmpty()) {
            throw new ResourceNotFoundException("No students found");
        }

        List<StudentResponse> responseList = students.stream().map(student -> StudentResponse.builder()
                .id(student.getId())
                .studentCode(student.getStudentCode())
                .studentName(student.getUser().getName())
                .className(student.getClasses().getClassName())
                .majorName(student.getMajor().getMajorName())
                .facultyName(student.getFaculty().getFacultyName())
                .account(student.getUser().getAccount())
                .email(student.getUser().getEmail())
                .build()
        ).toList();

        return ApiResponse.success(responseList, "List of students retrieved successfully", servletRequest.getRequestURI());
    }

    @Transactional
    public ApiResponse<Object> deleteStudent(Long studentId, HttpServletRequest servletRequest) {
        // Tìm student
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Student with id [%s] not found".formatted(studentId)));

        // Xóa ảnh hồ sơ nếu có
        if (StringUtils.isNotBlank(student.getProfileImageId())) {
            s3Service.deleteObject(
                    s3Buckets.getStudent(),
                    "profile-images/students/%s/%s".formatted(studentId, student.getProfileImageId())
            );
        }

        // Xóa user liên kết
        Long userId = student.getUser().getId();
        studentRepository.delete(student);
        userRepository.deleteById(userId);

        return ApiResponse.success(null, "Student deleted successfully", servletRequest.getRequestURI());
    }



}