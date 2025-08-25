package com.leduc.spring.student_face_data;

import com.leduc.spring.attendance_log.AttendanceLogService;
import com.leduc.spring.attendance_log.AttendanceStatus;
import com.leduc.spring.aws.S3Buckets;
import com.leduc.spring.aws.S3Service;
import com.leduc.spring.classes.ClassEntity;
import com.leduc.spring.classes.ClassRepository;
import com.leduc.spring.email.EmailService;
import com.leduc.spring.exception.ApiResponse;
import com.leduc.spring.exception.ResourceNotFoundException;
import com.leduc.spring.schedule.Schedule;
import com.leduc.spring.schedule.ScheduleRepository;
import com.leduc.spring.schedule.ScheduleService;
import com.leduc.spring.schedule.StudyDay;
import com.leduc.spring.student.Student;
import com.leduc.spring.student.StudentRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.MailException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.SdkBytes;
import software.amazon.awssdk.services.rekognition.RekognitionClient;
import software.amazon.awssdk.services.rekognition.model.*;
import software.amazon.awssdk.services.s3.model.S3Exception;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
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
    private final EmailService emailService;
    private final ScheduleRepository scheduleRepository;
    private final ClassRepository classRepository;
    private final RekognitionClient rekognitionClient;
    private final StudentFaceDataMapper mapper;
    private final AttendanceLogService attendanceLogService;
    private static final String FACE_COLLECTION_ID = "student_faces";
    private static final float SIMILARITY_THRESHOLD = 90.0f;
    private static final long LATE_THRESHOLD_MINUTES = 5; // 5 phút sau khi đóng vẫn cho phép điểm danh (LATE)
    private final ScheduleService scheduleService;

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
                logger.warn("Invalid face detection: {} faces found for studentId {}", response.faceRecords().size(),
                        studentId);
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
    public ApiResponse<FaceRegisterResponse> registerStudentFace(FaceRegisterRequest request, Long studentId,
            HttpServletRequest servletRequest) {
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

                // Upload to S3
                s3Service.putObject(
                        s3Buckets.getStudent(),
                        s3Key,
                        file.getBytes(),
                        file.getContentType());
                logger.info("Uploaded image {} to S3 with key: {}", i + 1, s3Key);

                // Detect face
                if (!detectFace(file)) {
                    throw new ResourceNotFoundException(
                            "Face detection failed for image %d: must have exactly 1 face".formatted(i + 1));
                }

                // Index face
                String faceId = indexFace(file, studentId);
                if (faceId == null) {
                    throw new ResourceNotFoundException(
                            "Failed to extract face features for image %d".formatted(i + 1));
                }

                profileImageIds.add(profileImageId);
                faceIds.add(faceId);
                s3Keys.add(s3Key);
            }

            // Update database only if all images are processed successfully
            studentRepository.updateProfileImageId(profileImageIds.get(0), studentId);
            for (String faceId : faceIds) {
                saveFaceData(student, faceId);
            }

            // Set isRegistered = true for the student
            student.setRegistered(true);
            studentRepository.save(student);

            // Send email notification
            String subject = "Successful Face Registration Confirmation";
            String htmlContent = emailService.buildProfessionalEmailContent(student.getUser().getName());
            emailService.sendComplexNotificationEmail(student.getUser(), subject, htmlContent);
            logger.info("Sent face registration confirmation email to student: {}", student.getUser().getEmail());

            FaceRegisterResponse response = mapper.toFaceRegisterResponse(student, faceIds, profileImageIds,
                    LocalDateTime.now());
            return ApiResponse.success(response, "Student faces registered successfully",
                    servletRequest.getRequestURI());

        } catch (ResourceNotFoundException e) {
            for (String s3Key : s3Keys) {
                s3Service.deleteObject(s3Buckets.getStudent(), s3Key);
                logger.info("Cleaned up S3 object: {}", s3Key);
            }
            logger.error("Face processing failed for studentId {}: {}", studentId, e.getMessage(), e);
            throw e;
        } catch (IOException e) {
            for (String s3Key : s3Keys) {
                s3Service.deleteObject(s3Buckets.getStudent(), s3Key);
                logger.info("Cleaned up S3 object: {}", s3Key);
            }
            logger.error("Failed to process images for studentId {}: {}", studentId, e.getMessage(), e);
            throw new RuntimeException("Failed to process images", e);
        } catch (S3Exception e) {
            for (String s3Key : s3Keys) {
                s3Service.deleteObject(s3Buckets.getStudent(), s3Key);
                logger.info("Cleaned up S3 object: {}", s3Key);
            }
            logger.error("Failed to verify S3 object for studentId {}: {}", studentId, e.getMessage(), e);
            throw new RuntimeException("Failed to verify S3 object: " + e.getMessage(), e);
        } catch (MailException e) {
            // Log email failure but don't rollback transaction
            logger.error("Failed to send email to studentId {}: {}", studentId, e.getMessage(), e);
            // Continue with success response since face registration was successful
            FaceRegisterResponse response = mapper.toFaceRegisterResponse(student, faceIds, profileImageIds,
                    LocalDateTime.now());
            return ApiResponse.success(response, "Student faces registered successfully, but email notification failed",
                    servletRequest.getRequestURI());
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
                    servletRequest.getRequestURI());
        } catch (RekognitionException e) {
            logger.error("Failed to delete faceId {}: {}", faceId, e.getMessage(), e);
            throw new RuntimeException("Failed to delete faceId: " + e.getMessage(), e);
        }
    }

    @Transactional(readOnly = true)
    public ApiResponse<FaceCompareResponse> compareFace(Long studentId, MultipartFile file,
            HttpServletRequest servletRequest) {
        try {
            if (!detectFace(file)) {
                throw new ResourceNotFoundException("Face detection failed: must have exactly 1 face");
            }

            Student student = studentRepository.findById(studentId)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Student with id [%s] not found".formatted(studentId)));

            Image awsImage = Image.builder()
                    .bytes(SdkBytes.fromByteArray(file.getBytes()))
                    .build();

            SearchFacesByImageRequest request = SearchFacesByImageRequest.builder()
                    .collectionId(FACE_COLLECTION_ID)
                    .image(awsImage)
                    .faceMatchThreshold(SIMILARITY_THRESHOLD)
                    .maxFaces(5)
                    .build();

            SearchFacesByImageResponse response = rekognitionClient.searchFacesByImage(request);

            if (response.faceMatches().isEmpty()) {
                throw new ResourceNotFoundException(
                        "No matching faces found in collection for studentId [%s]".formatted(studentId));
            }

            for (FaceMatch faceMatch : response.faceMatches()) {
                String faceId = faceMatch.face().faceId();
                Float similarity = faceMatch.similarity();
                String externalImageId = faceMatch.face().externalImageId();

                try {
                    Long matchedStudentId = Long.parseLong(externalImageId);
                    if (matchedStudentId.equals(studentId)) {
                        FaceCompareResponse compareResponse = mapper.toFaceCompareResponse(student, null, faceId,
                                similarity);
                        return ApiResponse.success(compareResponse, "Face matched successfully",
                                servletRequest.getRequestURI());
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

    @Transactional
    public ApiResponse<FaceCompareResponse> attendance(Long studentId, Long scheduleId, MultipartFile file,
            HttpServletRequest servletRequest) {
        logger.info("Starting attendance for studentId: {} and scheduleId: {}", studentId, scheduleId);

        // Tìm sinh viên
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sinh viên với ID: " + studentId));
        logger.info("Found student: {}", student.getId());

        // Kiểm tra sinh viên đã đăng ký khuôn mặt chưa
        if (!student.isRegistered()) {
            throw new IllegalStateException("Sinh viên chưa đăng ký khuôn mặt");
        }

        // Tìm lịch học
        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lịch học với ID: " + scheduleId));
        logger.info("Found schedule: {} for class: {}", schedule.getId(), schedule.getClassEntity().getId());

        // Kiểm tra lịch học có thuộc lớp sinh viên không
        ClassEntity studentClass = classRepository.findByStudentId(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lớp cho sinh viên: " + studentId));
        logger.info("Student belongs to class: {}", studentClass.getId());

        if (!schedule.getClassEntity().getId().equals(studentClass.getId())) {
            throw new IllegalArgumentException("Lịch học không thuộc lớp của sinh viên. Schedule class: " +
                    schedule.getClassEntity().getId() + ", Student class: " + studentClass.getId());
        }

        // Lấy StudyDay của hôm nay
        LocalDate today = LocalDate.now();
        LocalDateTime now = LocalDateTime.now();
        logger.info("Looking for schedule on date: {}", today);

        StudyDay studyDay = scheduleService.calculateWeeklySchedule(schedule).stream()
                .flatMap(week -> week.getStudyDays().stream())
                .filter(sd -> sd.getDate().isEqual(today))
                .findFirst()
                .orElse(null);

        if (studyDay == null) {
            throw new IllegalStateException("Hôm nay (" + today + ") không có lịch học cho lớp này");
        }
        logger.info("Found StudyDay for today: {}", studyDay.getDate());

        // Xác định trạng thái điểm danh
        AttendanceStatus status;
        if (studyDay.isOpen()) {
            status = AttendanceStatus.PRESENT; // Lịch đang mở
        } else {
            LocalDateTime closeTime = studyDay.getCloseTime();
            if (closeTime == null) {
                throw new IllegalStateException("Lịch học đã đóng nhưng không có thời gian đóng");
            }

            long minutesSinceClose = ChronoUnit.MINUTES.between(closeTime, now);
            if (minutesSinceClose <= LATE_THRESHOLD_MINUTES) {
                status = AttendanceStatus.LATE; // Điểm danh muộn
            } else {
                throw new IllegalStateException("Không thể điểm danh: Đã quá 5 phút sau khi lịch đóng");
            }
        }

        // So sánh khuôn mặt
        ApiResponse<FaceCompareResponse> compareResponse = compareFace(studentId, file, servletRequest);
        FaceCompareResponse faceCompareResponse = compareResponse.getData();

        // Ghi log điểm danh
        String note = "Điểm danh bằng nhận diện khuôn mặt, độ tương đồng: " + faceCompareResponse.getSimilarity();
        attendanceLogService.recordHistory(studentId, scheduleId, status, note);

        logger.info("Sinh viên ID: {} đã điểm danh cho lịch ID: {} với trạng thái: {}", studentId, scheduleId, status);
        return ApiResponse.success(faceCompareResponse, "Điểm danh thành công với trạng thái: " + status,
                servletRequest.getRequestURI());
    }

}