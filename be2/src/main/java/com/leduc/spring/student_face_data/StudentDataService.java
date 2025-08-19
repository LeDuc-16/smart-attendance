package com.leduc.spring.student_face_data;

import com.leduc.spring.aws.S3Buckets;
import com.leduc.spring.aws.S3Service;
import com.leduc.spring.exception.ResourceNotFoundException;
import com.leduc.spring.student.Student;
import com.leduc.spring.student.StudentRepository;
import com.leduc.spring.exception.ApiResponse;
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

    private boolean detectFace(String s3Key) {
        int maxRetries = 3;
        int retryDelayMs = 1000;
        for (int attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                s3Service.headObject(s3Buckets.getStudent(), s3Key);
                logger.info("S3 object exists: {}", s3Key);

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
                boolean hasOneFace = response.faceDetails().size() == 1;
                logger.info("DetectFaces result for {}: {} face(s) detected", s3Key, response.faceDetails().size());
                return hasOneFace;
            } catch (S3Exception e) {
                if (attempt == maxRetries) {
                    logger.error("Failed to verify S3 object after {} attempts: {}/{}", maxRetries, s3Buckets.getStudent(), s3Key, e);
                    throw new RuntimeException("Unable to get S3 object metadata after retries", e);
                }
                logger.warn("S3 object not ready, retrying {}/{}: {}/{}", attempt, maxRetries, s3Buckets.getStudent(), s3Key);
                try {
                    Thread.sleep(retryDelayMs);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    throw new RuntimeException("Interrupted while waiting for S3 object", ie);
                }
            } catch (Exception e) {
                logger.error("Failed to detect face for {}: {}", s3Key, e.getMessage(), e);
                throw new RuntimeException("Failed to detect face: " + e.getMessage(), e);
            }
        }
        return false;
    }

    private String indexFace(FaceRegisterRequest request) throws IOException {
        Image awsImage = Image.builder()
                .bytes(SdkBytes.fromByteArray(request.getFile().getBytes()))
                .build();

        IndexFacesRequest indexFacesRequest = IndexFacesRequest.builder()
                .image(awsImage)
                .collectionId(FACE_COLLECTION_ID)
                .externalImageId(request.getStudentId().toString())
                .detectionAttributes(Attribute.ALL)
                .build();

        try {
            IndexFacesResponse response = rekognitionClient.indexFaces(indexFacesRequest);
            if (response.faceRecords().isEmpty() || response.faceRecords().size() > 1) {
                logger.warn("Invalid face detection: {} faces found for studentId {}", response.faceRecords().size(), request.getStudentId());
                return null;
            }
            String faceId = response.faceRecords().get(0).face().faceId();
            logger.info("Indexed face with faceId: {} for studentId: {}", faceId, request.getStudentId());
            return faceId;
        } catch (Exception e) {
            logger.error("Failed to index face for studentId {}: {}", request.getStudentId(), e.getMessage(), e);
            throw new RuntimeException("Failed to index face", e);
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
    public ApiResponse<FaceRegisterResponse> registerStudentFace(FaceRegisterRequest request, HttpServletRequest servletRequest) {
        Long studentId = request.getStudentId();
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Student with id [%s] not found".formatted(studentId)));

        String profileImageId = UUID.randomUUID().toString();
        String s3Key = "profile-images/students/%s/%s".formatted(studentId, profileImageId);

        try {
            s3Service.putObject(
                    s3Buckets.getStudent(),
                    s3Key,
                    request.getFile().getBytes(),
                    request.getFile().getContentType()
            );
            logger.info("Uploaded image to S3 with key: {}", s3Key);
        } catch (IOException e) {
            logger.error("Failed to upload image to S3: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to upload profile image", e);
        }

        studentRepository.updateProfileImageId(profileImageId, studentId);

        if (!detectFace(s3Key)) {
            s3Service.deleteObject(s3Buckets.getStudent(), s3Key);
            throw new ResourceNotFoundException("Face detection failed: must have exactly 1 face");
        }

        String faceId;
        try {
            faceId = indexFace(request);
        } catch (IOException e) {
            s3Service.deleteObject(s3Buckets.getStudent(), s3Key);
            throw new RuntimeException("Failed to extract face features", e);
        }

        if (faceId == null) {
            s3Service.deleteObject(s3Buckets.getStudent(), s3Key);
            throw new ResourceNotFoundException("Failed to extract face features");
        }

        saveFaceData(student, faceId);

        FaceRegisterResponse response = mapper.toFaceRegisterResponse(studentId, faceId, profileImageId, LocalDateTime.now());
        return ApiResponse.success(response, "Student face registered successfully", servletRequest.getRequestURI());
    }
}