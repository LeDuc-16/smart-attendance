package com.leduc.spring.student;

import com.leduc.spring.classes.ClassEntity;
import com.leduc.spring.classes.ClassRepository;
import com.leduc.spring.exception.ApiResponse;
import com.leduc.spring.exception.DuplicateResourceException;
import com.leduc.spring.exception.RequestValidationException;
import com.leduc.spring.exception.ResourceNotFoundException;
import com.leduc.spring.major.Major;
import com.leduc.spring.major.MajorRepository;
import com.leduc.spring.user.Role;
import com.leduc.spring.user.User;
import com.leduc.spring.user.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final ClassRepository classRepository;
    private final MajorRepository majorRepository;
    private final PasswordEncoder passwordEncoder;

    // Thêm một sinh viên
    public ApiResponse<Object> addStudent(CreateStudentRequest request, HttpServletRequest servletRequest) {
        // Kiểm tra lớp học tồn tại
        ClassEntity classEntity = classRepository.findByClassName(request.getClassName())
                .orElseThrow(() -> new ResourceNotFoundException("Class not found with name: [%s]".formatted(request.getClassName())));

        // Kiểm tra major tồn tại
        Major major = majorRepository.findByName(request.getMajorName())
                .orElseThrow(() -> new ResourceNotFoundException("Major not found with name: [%s]".formatted(request.getMajorName())));

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
                .password(passwordEncoder.encode(request.getPassword())) // Mã hóa mật khẩu
                .role(Role.STUDENT) // Giả sử Role.STUDENT là enum cho sinh viên
                .build();
        User savedUser = userRepository.save(user);

        // Tạo Student và liên kết với User, Class, Major
        Student student = Student.builder()
                .studentCode(request.getStudentCode())
                .user(savedUser)
                .classes(classEntity)
                .major(major)
                .build();
        studentRepository.save(student);

        return ApiResponse.success(null, "Student added successfully", servletRequest.getRequestURI());
    }

    // Import danh sách sinh viên từ file Excel
    public ApiResponse<Object> importStudentsFromExcel(MultipartFile file, HttpServletRequest servletRequest) throws IOException {
        // Đọc file Excel
        Workbook workbook = new XSSFWorkbook(file.getInputStream());
        Sheet sheet = workbook.getSheetAt(0);
        List<CreateStudentRequest> studentRequests = new ArrayList<>();

        // Bỏ qua dòng tiêu đề (nếu có)
        for (int i = 1; i < sheet.getPhysicalNumberOfRows(); i++) {
            Row row = sheet.getRow(i);
            if (row == null) continue;

            CreateStudentRequest request = new CreateStudentRequest();
            request.setClassName(getCellValue(row, 0));
            request.setStudentCode(getCellValue(row, 1));
            request.setStudentName(getCellValue(row, 2));
            request.setAccount(getCellValue(row, 3));
            request.setEmail(getCellValue(row, 4));
            request.setPassword(getCellValue(row, 5));
            request.setFacultyName(getCellValue(row, 6));
            request.setMajorName(getCellValue(row, 7));
            studentRequests.add(request);
        }
        workbook.close();

        // Lưu từng sinh viên
        List<String> errors = new ArrayList<>();
        for (CreateStudentRequest request : studentRequests) {
            try {
                addStudent(request, servletRequest);
            } catch (Exception e) {
                errors.add("Error importing student with code " + request.getStudentCode() + ": " + e.getMessage());
            }
        }

        if (!errors.isEmpty()) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, errors, "Some students could not be imported", servletRequest.getRequestURI());
        }

        return ApiResponse.success(null, "Students imported successfully", servletRequest.getRequestURI());
    }

    // Hàm hỗ trợ lấy giá trị từ cell
    private String getCellValue(Row row, int cellIndex) {
        if (row.getCell(cellIndex) == null) {
            return null;
        }
        return row.getCell(cellIndex).toString().trim();
    }
}