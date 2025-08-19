package com.leduc.spring.student_face_data;

import com.leduc.spring.aws.S3Buckets;
import com.leduc.spring.aws.S3Service;
import com.leduc.spring.exception.ApiResponse;
import com.leduc.spring.exception.ResourceNotFoundException;
import com.leduc.spring.student.Student;
import com.leduc.spring.student.StudentRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import software.amazon.awssdk.core.SdkBytes;
import software.amazon.awssdk.services.rekognition.RekognitionClient;
import software.amazon.awssdk.services.rekognition.model.*;
import software.amazon.awssdk.services.s3.model.S3Exception;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.UUID;

@Service // Đánh dấu class là một Spring Service (bean được quản lý bởi Spring)
@RequiredArgsConstructor // Tự động sinh constructor cho các field final (dùng dependency injection)
public class StudentFaceDataService {

    private static final Logger logger = LoggerFactory.getLogger(StudentFaceDataService.class);
    private final StudentRepository studentRepository; // Repository thao tác DB cho Student
    private final S3Service s3Service; // Service thao tác với AWS S3
    private final S3Buckets s3Buckets; // Config bucket name
    private final RekognitionClient rekognitionClient; // AWS Rekognition client
    private final StudentFaceDataMapper mapper; // Mapper để map dữ liệu sang DTO
    private static final String FACE_COLLECTION_ID = "student_faces"; // Tên collection Rekognition lưu khuôn mặt

    // Hàm kiểm tra ảnh có chứa đúng 1 khuôn mặt hay không
    private boolean detectFace(String s3Key) {
        try {
            // Kiểm tra object tồn tại trên S3
            s3Service.headObject(s3Buckets.getStudent(), s3Key);
            logger.info("S3 object exists: {}", s3Key);

            // Tạo AWS Image từ object trong S3
            Image awsImage = Image.builder()
                    .s3Object(S3Object.builder()
                            .bucket(s3Buckets.getStudent())
                            .name(s3Key)
                            .build())
                    .build();

            // Gửi request detect faces
            DetectFacesRequest request = DetectFacesRequest.builder()
                    .image(awsImage)
                    .attributes(Attribute.ALL)
                    .build();

            DetectFacesResponse response = rekognitionClient.detectFaces(request);

            // Chỉ hợp lệ khi có đúng 1 khuôn mặt
            boolean hasOneFace = response.faceDetails().size() == 1;
            logger.info("DetectFaces result for {}: {} face(s) detected", s3Key, response.faceDetails().size());
            return hasOneFace;
        } catch (S3Exception e) {
            logger.error("S3 error for {}: {}", s3Key, e.getMessage(), e);
            throw new RuntimeException("Unable to get S3 object metadata: " + e.getMessage(), e);
        } catch (Exception e) {
            logger.error("Failed to detect face for {}: {}", s3Key, e.getMessage(), e);
            throw new RuntimeException("Failed to detect face: " + e.getMessage(), e);
        }
    }

    // Hàm index khuôn mặt vào Rekognition collection
    private String indexFace(FaceRegisterRequest request) throws IOException {
        // Tạo Image từ file upload
        Image awsImage = Image.builder()
                .bytes(SdkBytes.fromByteArray(request.getFile().getBytes()))
                .build();

        // Tạo request IndexFaces
        IndexFacesRequest indexFacesRequest = IndexFacesRequest.builder()
                .image(awsImage)
                .collectionId(FACE_COLLECTION_ID)
                .externalImageId(request.getStudentId().toString()) // Liên kết với studentId
                .detectionAttributes(Attribute.ALL)
                .build();

        try {
            // Gọi Rekognition indexFaces
            IndexFacesResponse response = rekognitionClient.indexFaces(indexFacesRequest);

            // Phải có đúng 1 khuôn mặt
            if (response.faceRecords().isEmpty() || response.faceRecords().size() > 1) {
                logger.warn("Invalid face detection: {} faces found for studentId {}", response.faceRecords().size(), request.getStudentId());
                return null;
            }

            // Lấy faceId trả về
            String faceId = response.faceRecords().get(0).face().faceId();
            logger.info("Indexed face with faceId: {} for studentId: {}", faceId, request.getStudentId());
            return faceId;
        } catch (Exception e) {
            logger.error("Failed to index face for studentId {}: {}", request.getStudentId(), e.getMessage(), e);
            throw new RuntimeException("Failed to index face", e);
        }
    }

    // Lưu thông tin khuôn mặt vào DB
    private void saveFaceData(Student student, String faceId) {
        StudentFaceData faceData = StudentFaceData.builder()
                .student(student)
                .faceId(faceId)
                .active(true)
                .registeredAt(LocalDateTime.now())
                .build();
        student.getFaceDataList().add(faceData);
        studentRepository.save(student);
        logger.info("Saved face data for studentId: {} with faceId: {}", student.getId(), faceId);
    }

    // API chính để đăng ký khuôn mặt
    @Transactional
    public ApiResponse<FaceRegisterResponse> registerStudentFace(FaceRegisterRequest request, HttpServletRequest servletRequest) {
        Long studentId = request.getStudentId();

        // Tìm student trong DB
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Student with id [%s] not found".formatted(studentId)));

        // Tạo tên file lưu trong S3
        String profileImageId = UUID.randomUUID().toString();
        String s3Key = "profile-images/students/%s/%s".formatted(studentId, profileImageId);

        try {
            // Upload ảnh lên S3
            s3Service.putObject(
                    s3Buckets.getStudent(),
                    s3Key,
                    request.getFile().getBytes(),
                    request.getFile().getContentType()
            );
            logger.info("Uploaded image to S3 with key: {}", s3Key);

            // Kiểm tra object tồn tại ngay sau khi upload
            s3Service.headObject(s3Buckets.getStudent(), s3Key);
            logger.info("Verified S3 object exists after upload: {}", s3Key);
        } catch (IOException e) {
            logger.error("Failed to upload image to S3 for studentId {}: {}", studentId, e.getMessage(), e);
            throw new RuntimeException("Failed to upload profile image", e);
        } catch (S3Exception e) {
            logger.error("Failed to verify S3 object after upload for studentId {}: {}", studentId, e.getMessage(), e);
            throw new RuntimeException("Failed to verify S3 object after upload: " + e.getMessage(), e);
        }

        // Cập nhật profileImageId vào DB
        studentRepository.updateProfileImageId(profileImageId, studentId);

        // Kiểm tra số lượng khuôn mặt
        if (!detectFace(s3Key)) {
            // Nếu không đúng 1 mặt -> xóa ảnh và báo lỗi
            s3Service.deleteObject(s3Buckets.getStudent(), s3Key);
            throw new ResourceNotFoundException("Face detection failed: must have exactly 1 face");
        }

        // Trích xuất đặc trưng khuôn mặt từ ảnh
        String faceId;
        try {
            faceId = indexFace(request);
        } catch (IOException e) {
            // Nếu lỗi thì xóa ảnh khỏi S3
            s3Service.deleteObject(s3Buckets.getStudent(), s3Key);
            throw new RuntimeException("Failed to extract face features", e);
        }

        // Nếu không có faceId hợp lệ -> rollback
        if (faceId == null) {
            s3Service.deleteObject(s3Buckets.getStudent(), s3Key);
            throw new ResourceNotFoundException("Failed to extract face features");
        }

        // Lưu dữ liệu khuôn mặt vào DB
        saveFaceData(student, faceId);

        // Map dữ liệu response trả về
        FaceRegisterResponse response = mapper.toFaceRegisterResponse(studentId, faceId, profileImageId, LocalDateTime.now());
        return ApiResponse.success(response, "Student face registered successfully", servletRequest.getRequestURI());
    }
}
