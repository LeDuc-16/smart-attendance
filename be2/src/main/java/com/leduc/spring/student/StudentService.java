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
import com.leduc.spring.aws.s3.S3Buckets;
import com.leduc.spring.aws.s3.S3Service;
import com.leduc.spring.student_face_data.StudentFaceData;
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
import software.amazon.awssdk.core.SdkBytes;
import software.amazon.awssdk.services.rekognition.RekognitionClient;
import software.amazon.awssdk.services.rekognition.model.*;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
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
    private final RekognitionClient rekognitionClient;
    // Thêm RekognitionClient
    private static final String FACE_COLLECTION_ID = "student_faces";

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
                .className(student.getClasses() != null ? student.getClasses().getClassName() : "N/A")
                .majorName(student.getMajor() != null ? student.getMajor().getMajorName() : null)
                .facultyName(student.getFaculty() != null ? student.getFaculty().getFacultyName() : null)
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


    /**
     * Phát hiện khuôn mặt trong ảnh
     * @param s3Key Đường dẫn ảnh trên S3
     * @return true nếu ảnh chứa đúng 1 khuôn mặt, false nếu không
     */
    private boolean detectFace(String s3Key) {
        Image awsImage = Image.builder()
                .s3Object(S3Object.builder()
                        .bucket(s3Buckets.getStudent())
                        .name(s3Key)
                        .build())
                .build();

        DetectFacesRequest request = DetectFacesRequest.builder()
                .image(awsImage)
                .attributes(Attribute.ALL)
                .build();

        DetectFacesResponse response = rekognitionClient.detectFaces(request);
        return response.faceDetails().size() == 1;
    }

    /**
     * Trích xuất đặc trưng khuôn mặt và lưu vào AWS Rekognition Collection
     * @param file Ảnh được tải lên
     * @param studentId ID của sinh viên
     * @return FaceId nếu thành công, null nếu thất bại
     */
    private String indexFace(MultipartFile file, Long studentId) throws IOException {
        Image awsImage = Image.builder()
                .bytes(SdkBytes.fromByteArray(file.getBytes()))
                .build();

        IndexFacesRequest request = IndexFacesRequest.builder()
                .image(awsImage)
                .collectionId(FACE_COLLECTION_ID)
                .externalImageId(studentId.toString()) // Sử dụng studentId làm externalImageId
                .detectionAttributes(Attribute.ALL)
                .build();

        IndexFacesResponse response = rekognitionClient.indexFaces(request);

        if (response.faceRecords().isEmpty() || response.faceRecords().size() > 1) {
            return null; // Không tìm thấy khuôn mặt hoặc có nhiều hơn 1 khuôn mặt
        }

        return response.faceRecords().get(0).face().faceId();
    }

    /**
     * Lưu thông tin khuôn mặt vào bảng student_face_data
     * @param student Sinh viên
     * @param faceId ID khuôn mặt từ AWS Rekognition
     */
    private void saveFaceData(Student student, String faceId) {
        StudentFaceData faceData = StudentFaceData.builder()
                .student(student)
                .faceId(faceId)
                .active(true) // Mặc định kích hoạt
                .registeredAt(LocalDateTime.now())
                .build();
        student.getFaceDataList().add(faceData);
        studentRepository.save(student);
    }

    /**
     * Đăng ký ảnh khuôn mặt cho sinh viên
     * @param studentId ID của sinh viên
     * @param file Ảnh được tải lên
     * @param servletRequest Yêu cầu HTTP
     * @return ApiResponse với kết quả
     */
    @Transactional
    public ApiResponse<Object> registerStudentFace(Long studentId, MultipartFile file, HttpServletRequest servletRequest) {
        // 1. Kiểm tra sinh viên tồn tại
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Student with id [%s] not found".formatted(studentId)));

        // 2. Tải ảnh lên S3 bằng hàm uploadStudentProfileImage hiện có
        ApiResponse<Object> uploadResponse = uploadStudentProfileImage(studentId, file, servletRequest);
        String profileImageId = student.getProfileImageId(); // Lấy profileImageId từ student sau khi upload
        String s3Key = "profile-images/students/%s/%s".formatted(studentId, profileImageId);

        // 3. Kiểm tra số lượng khuôn mặt
        if (!detectFace(s3Key)) {
            // Xóa ảnh vừa tải lên nếu không hợp lệ
            s3Service.deleteObject(s3Buckets.getStudent(), s3Key);
            throw new ResourceNotFoundException("Face detection failed: must have exactly 1 face");
        }

        // 4. Trích xuất đặc trưng khuôn mặt
        String faceId;
        try {
            faceId = indexFace(file, studentId);
        } catch (IOException e) {
            // Xóa ảnh vừa tải lên nếu index thất bại
            s3Service.deleteObject(s3Buckets.getStudent(), s3Key);
            throw new RuntimeException("Failed to extract face features", e);
        }

        if (faceId == null) {
            // Xóa ảnh vừa tải lên nếu không index được
            s3Service.deleteObject(s3Buckets.getStudent(), s3Key);
            throw new ResourceNotFoundException("Failed to extract face features");
        }

        // 5. Lưu thông tin khuôn mặt vào student_face_data
        saveFaceData(student, faceId);

        return ApiResponse.success(null, "Student face registered successfully", servletRequest.getRequestURI());
    }
}