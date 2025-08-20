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
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.SdkBytes;
import software.amazon.awssdk.services.rekognition.RekognitionClient;
import software.amazon.awssdk.services.rekognition.model.*;
import software.amazon.awssdk.services.s3.model.S3Exception;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StudentFaceDataService {

    private static final Logger logger = LoggerFactory.getLogger(StudentFaceDataService.class);
    private final StudentRepository studentRepository;
    private final S3Service s3Service;
    private final S3Buckets s3Buckets;
    private final RekognitionClient rekognitionClient;
    private final StudentFaceDataMapper mapper;
    private static final String FACE_COLLECTION_ID = "student_faces";
    private static final float SIMILARITY_THRESHOLD = 90.0f;

    private boolean detectFace(MultipartFile file) throws IOException {
        try {
            Image awsImage = Image.builder()
                    .bytes(SdkBytes.fromByteArray(file.getBytes()))
                    .build();

            DetectFacesRequest request = DetectFacesRequest.builder()
                    .image(awsImage)
                    .attributes(Attribute.ALL)
                    .build();

            DetectFacesResponse response = rekognitionClient.detectFaces(request);
            boolean hasOneFace = response.faceDetails().size() == 1;
            logger.info("DetectFaces result for uploaded image: {} face(s) detected", response.faceDetails().size());
            return hasOneFace;
        } catch (RekognitionException e) {
            logger.error("Failed to detect face: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to detect face: " + e.getMessage(), e);
        }
    }

    private String indexFace(MultipartFile file, Long studentId) throws IOException {
        Image awsImage = Image.builder()
                .bytes(SdkBytes.fromByteArray(file.getBytes()))
                .build();

        IndexFacesRequest indexFacesRequest = IndexFacesRequest.builder()
                .image(awsImage)
                .collectionId(FACE_COLLECTION_ID)
                .externalImageId(studentId.toString())
                .detectionAttributes(Attribute.ALL)
                .build();

        try {
            IndexFacesResponse response = rekognitionClient.indexFaces(indexFacesRequest);
            if (response.faceRecords().isEmpty() || response.faceRecords().size() > 1) {
                logger.warn("Invalid face detection: {} faces found for studentId {}", response.faceRecords().size(), studentId);
                return null;
            }
            String faceId = response.faceRecords().get(0).face().faceId();
            logger.info("Indexed face with faceId: {} for studentId: {}", faceId, studentId);
            return faceId;
        } catch (RekognitionException e) {
            logger.error("Failed to index face for studentId {}: {}", studentId, e.getMessage(), e);
            throw new RuntimeException("Failed to index face: " + e.getMessage(), e);
        }
    }

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

    @Transactional
    public ApiResponse<FaceRegisterResponse> registerStudentFace(FaceRegisterRequest request, Long studentId, HttpServletRequest servletRequest) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Student with id [%s] not found".formatted(studentId)));

        List<MultipartFile> files = request.getFiles();
        if (files == null || files.size() != 5) {
            throw new IllegalArgumentException("Exactly 5 images (top, bottom, left, right, center) are required");
        }

        List<String> profileImageIds = new ArrayList<>();
        List<String> faceIds = new ArrayList<>();
        List<String> s3Keys = new ArrayList<>();

        try {
            for (int i = 0; i < files.size(); i++) {
                MultipartFile file = files.get(i);
                String profileImageId = UUID.randomUUID().toString();
                String s3Key = "profile-images/students/%s/%s".formatted(studentId, profileImageId);

                // Upload ảnh lên S3
                s3Service.putObject(
                        s3Buckets.getStudent(),
                        s3Key,
                        file.getBytes(),
                        file.getContentType()
                );
                logger.info("Uploaded image {} to S3 with key: {}", i + 1, s3Key);

                // Kiểm tra object tồn tại
                s3Service.headObject(s3Buckets.getStudent(), s3Key);
                logger.info("Verified S3 object exists for image {}: {}", i + 1, s3Key);

                // Kiểm tra có đúng 1 khuôn mặt
                if (!detectFace(file)) {
                    s3Service.deleteObject(s3Buckets.getStudent(), s3Key);
                    throw new ResourceNotFoundException("Face detection failed for image %d: must have exactly 1 face".formatted(i + 1));
                }

                // Trích xuất đặc trưng khuôn mặt
                String faceId = indexFace(file, studentId);
                if (faceId == null) {
                    s3Service.deleteObject(s3Buckets.getStudent(), s3Key);
                    throw new ResourceNotFoundException("Failed to extract face features for image %d".formatted(i + 1));
                }

                profileImageIds.add(profileImageId);
                faceIds.add(faceId);
                s3Keys.add(s3Key);
            }

            // Cập nhật profileImageId và lưu face data
            studentRepository.updateProfileImageId(profileImageIds.get(0), studentId); // Lưu ảnh đầu tiên làm profile chính
            for (String faceId : faceIds) {
                saveFaceData(student, faceId);
            }

            // Tạo response với thông tin sinh viên và tất cả faceIds, profileImageIds
            FaceRegisterResponse response = mapper.toFaceRegisterResponse(student, faceIds, profileImageIds, LocalDateTime.now());
            return ApiResponse.success(response, "Student faces registered successfully", servletRequest.getRequestURI());
        } catch (IOException e) {
            // Rollback: Xóa tất cả ảnh đã upload nếu có lỗi
            for (String s3Key : s3Keys) {
                s3Service.deleteObject(s3Buckets.getStudent(), s3Key);
            }
            logger.error("Failed to process images for studentId {}: {}", studentId, e.getMessage(), e);
            throw new RuntimeException("Failed to process images", e);
        } catch (S3Exception e) {
            // Rollback: Xóa tất cả ảnh đã upload nếu có lỗi
            for (String s3Key : s3Keys) {
                s3Service.deleteObject(s3Buckets.getStudent(), s3Key);
            }
            logger.error("Failed to verify S3 object for studentId {}: {}", studentId, e.getMessage(), e);
            throw new RuntimeException("Failed to verify S3 object: " + e.getMessage(), e);
        }
    }

    @Transactional
    public ApiResponse<String> deleteFace(String faceId, HttpServletRequest servletRequest) {
        try {
            DeleteFacesRequest deleteFacesRequest = DeleteFacesRequest.builder()
                    .collectionId(FACE_COLLECTION_ID)
                    .faceIds(faceId)
                    .build();

            DeleteFacesResponse response = rekognitionClient.deleteFaces(deleteFacesRequest);
            if (response.deletedFaces().isEmpty()) {
                throw new ResourceNotFoundException("FaceId [%s] not found in collection".formatted(faceId));
            }

            logger.info("Deleted faceId: {} from collection {}", faceId, FACE_COLLECTION_ID);
            return ApiResponse.success(
                    "FaceId deleted: " + response.deletedFaces(),
                    "Deleted successfully",
                    servletRequest.getRequestURI()
            );
        } catch (RekognitionException e) {
            logger.error("Failed to delete faceId {}: {}", faceId, e.getMessage(), e);
            throw new RuntimeException("Failed to delete faceId: " + e.getMessage(), e);
        }
    }

    @Transactional(readOnly = true)
    public ApiResponse<FaceCompareResponse> compareFace(Long studentId, MultipartFile file, HttpServletRequest servletRequest) {
        try {
            // Kiểm tra có đúng 1 khuôn mặt
            if (!detectFace(file)) {
                throw new ResourceNotFoundException("Face detection failed: must have exactly 1 face");
            }

            // Kiểm tra sinh viên tồn tại
            Student student = studentRepository.findById(studentId)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Student with id [%s] not found".formatted(studentId)));

            // Tạo Image từ MultipartFile
            Image awsImage = Image.builder()
                    .bytes(SdkBytes.fromByteArray(file.getBytes()))
                    .build();

            // Gọi SearchFacesByImage
            SearchFacesByImageRequest request = SearchFacesByImageRequest.builder()
                    .collectionId(FACE_COLLECTION_ID)
                    .image(awsImage)
                    .faceMatchThreshold(SIMILARITY_THRESHOLD)
                    .maxFaces(5)
                    .build();

            SearchFacesByImageResponse response = rekognitionClient.searchFacesByImage(request);

            if (response.faceMatches().isEmpty()) {
                throw new ResourceNotFoundException("No matching faces found in collection for studentId [%s]".formatted(studentId));
            }

            // Tìm face khớp với studentId
            for (FaceMatch faceMatch : response.faceMatches()) {
                String faceId = faceMatch.face().faceId();
                Float similarity = faceMatch.similarity();
                String externalImageId = faceMatch.face().externalImageId();

                try {
                    Long matchedStudentId = Long.parseLong(externalImageId);
                    if (matchedStudentId.equals(studentId)) {
                        FaceCompareResponse compareResponse = mapper.toFaceCompareResponse(student, faceId, similarity);
                        return ApiResponse.success(compareResponse, "Face matched successfully", servletRequest.getRequestURI());
                    }
                } catch (NumberFormatException e) {
                    logger.warn("Invalid externalImageId format: {}", externalImageId);
                }
            }

            throw new ResourceNotFoundException("No matching face found for studentId [%s]".formatted(studentId));
        } catch (IOException e) {
            logger.error("Failed to process image for studentId {}: {}", studentId, e.getMessage(), e);
            throw new RuntimeException("Failed to process image", e);
        } catch (RekognitionException e) {
            logger.error("Failed to compare face for studentId {}: {}", studentId, e.getMessage(), e);
            throw new RuntimeException("Failed to compare face: " + e.getMessage(), e);
        }
    }
}